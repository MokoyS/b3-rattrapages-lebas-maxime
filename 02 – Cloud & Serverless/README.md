## Signalement d'incidents : Distributeurs Picard

# Lien Loom

https://www.loom.com/share/bf78fb189d8e4071b1903813d148d0f6

# Déploiement de l'infrastructure AWS

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

À la fin du déploiement, la sortie affiche une valeur **`ApiUrl`**
Copier cette URL dans `frontend/app.js`, variable `API_BASE_URL` 

# Lancer l'interface

```bash
cd frontend
python3 -m http.server 8080
```

Puis aller sur http://localhost:8080
