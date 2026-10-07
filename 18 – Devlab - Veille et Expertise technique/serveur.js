const express = require('express');
const app = express();
app.use(express.json());

const API_KEY = 'picard-demo-key';
const mesures = [];

app.post('/api/mesures', (req, res) => {
  if (req.get('X-API-Key') !== API_KEY) return res.sendStatus(401);

  const mesure = { ...req.body, recu_le: new Date().toISOString() };
  mesures.push(mesure);
  if (mesures.length > 1000) mesures.shift();

  console.log(mesure);
  if (mesure.etat && mesure.etat !== 'OK') {
    console.warn(`⚠️  ${mesure.etat} sur ${mesure.device_id}`);
  }
  res.status(201).json({ ok: true });
});

app.get('/api/mesures', (req, res) => res.json(mesures.slice(-50)));

app.get('/', (req, res) => res.send(`<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Distributeur Picard</title>
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:24px;background:#f4f6f8;color:#1d2733}
  h1{font-size:20px;margin:0 0 16px}
  .grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
  .carte{background:#fff;border-radius:10px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  .label{font-size:13px;color:#5b6876}.valeur{font-size:28px;font-weight:600;margin-top:4px}
  #etat.OK{color:#1a8a4a}#etat.RISQUE_GIVRE{color:#c27700}#etat.ALERTE_PORTE,#etat.CAPTEUR_HS{color:#c62828}
  table{width:100%;border-collapse:collapse;margin-top:20px;background:#fff;border-radius:10px;overflow:hidden;font-size:13px}
  td,th{padding:8px 10px;text-align:left;border-bottom:1px solid #e6e9ec}
</style></head><body>
<h1>Distributeur Picard – suivi en direct</h1>
<div class="grille">
  <div class="carte"><div class="label">État</div><div class="valeur" id="etat">–</div></div>
  <div class="carte"><div class="label">Porte</div><div class="valeur" id="porte">–</div></div>
  <div class="carte"><div class="label">Ouvertures</div><div class="valeur" id="ouv">–</div></div>
  <div class="carte"><div class="label">Humidité</div><div class="valeur" id="hum">–</div></div>
  <div class="carte"><div class="label">Température ambiante</div><div class="valeur" id="temp">–</div></div>
</div>
<table><thead><tr><th>Reçu à</th><th>Événement</th><th>Porte</th><th>Humidité</th><th>Temp.</th><th>État</th></tr></thead><tbody id="hist"></tbody></table>
<script>
async function maj(){
  try{
    const d = await (await fetch('/api/mesures')).json();
    if(!d.length) return;
    const m = d[d.length-1];
    const e = document.getElementById('etat'); e.textContent = m.etat; e.className = 'valeur ' + m.etat;
    document.getElementById('porte').textContent = m.porte === 'ouverte' ? 'Ouverte' : 'Fermée';
    document.getElementById('ouv').textContent = m.ouvertures_total;
    document.getElementById('hum').textContent = m.humidite_pct == null ? '–' : m.humidite_pct + ' %';
    document.getElementById('temp').textContent = m.temperature_c == null ? '–' : m.temperature_c + ' °C';
    document.getElementById('hist').innerHTML = d.slice(-15).reverse().map(x =>
      '<tr><td>' + new Date(x.recu_le).toLocaleTimeString('fr-FR') + '</td><td>' + x.evenement +
      '</td><td>' + x.porte + '</td><td>' + (x.humidite_pct ?? '–') + '</td><td>' + (x.temperature_c ?? '–') +
      '</td><td>' + x.etat + '</td></tr>').join('');
  }catch(err){}
}
maj(); setInterval(maj, 1000);
</script></body></html>`));

app.listen(3000, '0.0.0.0', () => console.log('Serveur en écoute : http://localhost:3000'));
