#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <time.h>

const char* WIFI_SSID     = "iPhone Max ";
const char* WIFI_PASSWORD = "12345678";
const char* SERVER_URL    = "http://172.20.10.2:3000/api/mesures";
const char* API_KEY       = "picard-demo-key";

const uint8_t PIN_DHT   = 4;
const uint8_t PIN_PORTE = 18;
const uint8_t PIN_LED   = 2;
#define DHT_TYPE DHT11

const int NIVEAU_PORTE_FERMEE = HIGH;

const unsigned long DELAI_ALERTE_PORTE_MS = 30000; 
const unsigned long DELAI_GIVRE_MS        = 10000; 
const float         SEUIL_HUMIDITE_GIVRE  = 70.0;  

const unsigned long INTERVALLE_DHT_MS   = 2000;   
const unsigned long INTERVALLE_ENVOI_MS = 60000;
const unsigned long ANTI_REBOND_MS      = 50;
const unsigned long DELAI_RECO_WIFI_MS  = 10000;

DHT dht(PIN_DHT, DHT_TYPE);

void mettreAJourEtat();

String deviceId;
String etat = "INIT";
String dernierEtatEnvoye = "";


bool porteOuverte = false;
int  derniereLectureBrute;
unsigned long dernierChangementBrut = 0;
unsigned long debutOuverture = 0;
unsigned long dureeDerniereOuvertureMs = 0;
uint32_t nbOuvertures = 0;


float temperature = NAN;
float humidite = NAN;

unsigned long dernierDht = 0;
unsigned long dernierEnvoi = 0;
unsigned long dernierEssaiWifi = 0;


void connecterWifi(bool bloquant) {
  if (WiFi.status() == WL_CONNECTED) return;
  if (!bloquant && millis() - dernierEssaiWifi < DELAI_RECO_WIFI_MS) return;

  dernierEssaiWifi = millis();
  Serial.println("[WiFi] Connexion...");
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  if (bloquant) {
    unsigned long debut = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - debut < 15000) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();
    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("[WiFi] Connecté, IP : ");
      Serial.println(WiFi.localIP());
    } else {
      Serial.println("[WiFi] Échec, nouvel essai plus tard");
    }
  }
}


void formaterNombre(char* dest, size_t taille, float valeur) {
  if (isnan(valeur)) strcpy(dest, "null");
  else snprintf(dest, taille, "%.1f", valeur);
}

bool envoyer(const char* evenement) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.printf("[HTTP] Pas de Wi-Fi, événement \"%s\" non envoyé\n", evenement);
    dernierEnvoi = millis();
    return false;
  }

  char tempStr[12], humStr[12];
  formaterNombre(tempStr, sizeof(tempStr), temperature);
  formaterNombre(humStr, sizeof(humStr), humidite);

  unsigned long dureeMs = porteOuverte ? millis() - debutOuverture : dureeDerniereOuvertureMs;
  time_t maintenant = time(nullptr);
  long horodatage = (maintenant > 1700000000) ? (long)maintenant : 0; // 0 si heure pas encore synchronisée

  char payload[384];
  snprintf(payload, sizeof(payload),
           "{\"device_id\":\"%s\",\"timestamp\":%ld,\"evenement\":\"%s\","
           "\"porte\":\"%s\",\"ouvertures_total\":%lu,\"duree_ouverture_s\":%lu,"
           "\"temperature_c\":%s,\"humidite_pct\":%s,\"etat\":\"%s\",\"rssi\":%d}",
           deviceId.c_str(), horodatage, evenement,
           porteOuverte ? "ouverte" : "fermee", (unsigned long)nbOuvertures, dureeMs / 1000,
           tempStr, humStr, etat.c_str(), WiFi.RSSI());

  HTTPClient http;
  http.begin(SERVER_URL);
  http.setTimeout(3000);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);
  int code = http.POST(String(payload));
  http.end();

  Serial.printf("[HTTP] %s -> code %d\n", payload, code);
  bool ok = code >= 200 && code < 300;
  dernierEnvoi = millis();
  if (ok) dernierEtatEnvoye = etat;
  return ok;
}


void lirePorte() {
  int lecture = digitalRead(PIN_PORTE);


  if (lecture != derniereLectureBrute) {
    derniereLectureBrute = lecture;
    dernierChangementBrut = millis();
    return;
  }
  if (millis() - dernierChangementBrut < ANTI_REBOND_MS) return;

  bool ouverte = (lecture != NIVEAU_PORTE_FERMEE);
  if (ouverte == porteOuverte) return;

  porteOuverte = ouverte;
  if (porteOuverte) {
    nbOuvertures++;
    debutOuverture = millis();
    Serial.printf("[Porte] OUVERTE (ouverture n°%lu)\n", (unsigned long)nbOuvertures);
    mettreAJourEtat();
    envoyer("ouverture");
  } else {
    dureeDerniereOuvertureMs = millis() - debutOuverture;
    Serial.printf("[Porte] FERMÉE après %lu s\n", dureeDerniereOuvertureMs / 1000);
    mettreAJourEtat();
    envoyer("fermeture");
  }
}


void lireDht() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    humidite = NAN;
    temperature = NAN;
    Serial.println("[DHT11] Lecture impossible, vérifie le câblage");
    return;
  }
  humidite = h;
  temperature = t;
  Serial.printf("[DHT11] %.1f °C  %.1f %%\n", t, h);
}


void mettreAJourEtat() {
  unsigned long dureeOuverture = porteOuverte ? millis() - debutOuverture : 0;

  if (porteOuverte && dureeOuverture >= DELAI_ALERTE_PORTE_MS) {
    etat = "ALERTE_PORTE";
  } else if (porteOuverte && dureeOuverture >= DELAI_GIVRE_MS &&
             !isnan(humidite) && humidite >= SEUIL_HUMIDITE_GIVRE) {
    etat = "RISQUE_GIVRE";
  } else if (isnan(humidite)) {
    etat = "CAPTEUR_HS";
  } else {
    etat = "OK";
  }

  digitalWrite(PIN_LED, etat == "OK" ? LOW : HIGH);
}

void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_PORTE, INPUT);
  dht.begin();

  derniereLectureBrute = digitalRead(PIN_PORTE);
  porteOuverte = (derniereLectureBrute != NIVEAU_PORTE_FERMEE);
  if (porteOuverte) debutOuverture = millis();
  Serial.printf("[Porte] État au démarrage : %s (DO = %d)\n",
                porteOuverte ? "ouverte" : "fermée", derniereLectureBrute);

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  String mac = WiFi.macAddress();
  mac.replace(":", "");
  deviceId = "PICARD-" + mac;
  Serial.println("Distributeur : " + deviceId);

  connecterWifi(true);
  configTime(0, 0, "pool.ntp.org", "time.google.com");

  delay(1500); 
  lireDht();
  dernierDht = millis();
  mettreAJourEtat();
  envoyer("demarrage");
}

void loop() {
  connecterWifi(false);
  lirePorte();

  unsigned long maintenant = millis();

  if (maintenant - dernierDht >= INTERVALLE_DHT_MS) {
    dernierDht = maintenant;
    lireDht();
  }

  mettreAJourEtat();

  if (etat != dernierEtatEnvoye && maintenant - dernierEnvoi >= 2000) {
    envoyer("changement_etat");
  } else if (maintenant - dernierEnvoi >= INTERVALLE_ENVOI_MS) {
    envoyer("periodique");
  }

  delay(10);
}
