# Signalement d'incidents : Distributeurs Picard

Application serverless permettant de signaler et suivre les incidents rencontrés
sur les distributeurs automatiques Picard (panne, température anormale, produit
bloqué, problème de paiement).

# Lien Loom


## Architecture

- **AWS Lambda** (Node.js 20) : 4 fonctions, une par action (lister, créer,
  changer le statut, supprimer).
- **Amazon API Gateway (HTTP API)** : expose les routes REST.
- **Amazon DynamoDB** : table `picard-incidents`, mode à la demande (pay-per-request).
- **Frontend** : page HTML/CSS/JS statique (`frontend/`), sans build.
- **Infrastructure as Code** : AWS SAM (`template.yaml`).

## Routes de l'API

| Méthode | Route            | Description                       |
|---------|------------------|------------------------------------|
| GET     | /incidents       | Liste tous les incidents           |
| POST    | /incidents       | Crée un incident                   |
| PATCH   | /incidents/{id}  | Met à jour le statut d'un incident  |
| DELETE  | /incidents/{id}  | Supprime un incident                |

## Prérequis

- Un compte AWS et un utilisateur IAM avec des droits suffisants
  (CloudFormation, Lambda, API Gateway, DynamoDB, IAM).
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configuré (`aws configure`).
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).
- Python 3 (déjà présent sur macOS/Linux) pour servir le frontend en local.

## Installation

```bash
git clone <url-du-repo>
cd "02 – Cloud & Serverless"
```

## Déploiement de l'infrastructure AWS

```bash
sam build
sam deploy --guided
```

Lors du `sam deploy --guided`, répondre :
- **Stack Name** : `picard-incidents`
- **AWS Region** : `eu-west-3` (ou une autre région au choix)
- **Confirm changes before deploy** : `Y`
- **Allow SAM CLI IAM role creation** : `Y`
- **Save arguments to samconfig.toml** : `Y`

À la fin du déploiement, la sortie affiche une valeur **`ApiUrl`**, par exemple :
```
https://xxxxxxxxxx.execute-api.eu-west-3.amazonaws.com
```

Copier cette URL dans `frontend/app.js`, variable `API_BASE_URL` (en haut du fichier).

## Lancer l'interface

Ne pas ouvrir `frontend/index.html` directement par double-clic : le navigateur
envoie alors une origine `file://` que l'API Gateway refuse (CORS). Servir le
dossier via un petit serveur local :

```bash
cd frontend
python3 -m http.server 8080
```

Puis ouvrir [http://localhost:8080](http://localhost:8080) dans un navigateur.

## Tester l'API en ligne de commande

```bash
API_URL="https://xxxxxxxxxx.execute-api.eu-west-3.amazonaws.com"

# Créer un incident
curl -X POST "$API_URL/incidents" \
  -H "Content-Type: application/json" \
  -d '{"distributeurId":"DIST-PARIS-14","typeIncident":"panne","description":"Ecran noir","dateSignalement":"2026-09-30"}'

# Lister les incidents
curl "$API_URL/incidents"

# Changer le statut (remplacer {id})
curl -X PATCH "$API_URL/incidents/{id}" \
  -H "Content-Type: application/json" \
  -d '{"statut":"en_cours"}'

# Supprimer un incident (remplacer {id})
curl -X DELETE "$API_URL/incidents/{id}"
```

## Suppression des ressources AWS

Pour éviter toute facturation une fois le projet évalué :

```bash
sam delete --stack-name picard-incidents --region eu-west-3
```

Vérifier ensuite dans la console AWS (CloudFormation, Lambda, API Gateway,
DynamoDB) qu'il ne reste aucune ressource liée au projet.
