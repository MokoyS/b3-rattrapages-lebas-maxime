# Signalement d'incidents : Distributeurs Picard

Application serverless permettant de signaler et suivre les incidents rencontrés
sur les distributeurs automatiques Picard (panne, température anormale, produit
bloqué, problème de paiement).

# Lien Loom


## Déploiement de l'infrastructure AWS

```bash
sam build
sam deploy --guided
```

- **Stack Name** : `picard-incidents`
- **AWS Region** : `eu-west-3` 
- **Confirm changes before deploy** : `Y`
- **Allow SAM CLI IAM role creation** : `Y`
- **Save arguments to samconfig.toml** : `Y`

À la fin du déploiement, la sortie affiche une valeur **`ApiUrl`**, par exemple :
```
https://xxxxxxxxxx.execute-api.eu-west-3.amazonaws.com
```

Copier cette URL dans `frontend/app.js`, variable `API_BASE_URL` (en haut du fichier).

## Lancer l'interface

```bash
cd frontend
python3 -m http.server 8080
```

Puis ouvrir : http://localhost:8080


