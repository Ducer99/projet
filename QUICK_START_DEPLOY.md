# 🚀 Quick Start - Déploiement en 3 options

Choisissez votre méthode de déploiement selon vos besoins :

---

## 📱 Option 1 : Démo Rapide avec Ngrok (5 minutes)

**Parfait pour montrer l'app à vos amis CE SOIR !**

```bash
# 1. Installer Ngrok (si pas déjà fait)
brew install ngrok

# 2. Configurer votre authtoken (une seule fois)
ngrok config add-authtoken VOTRE_TOKEN  # Token depuis ngrok.com

# 3. Lancer la démo automatique
./start-demo-ngrok.sh

# 4. Partager l'URL avec vos amis !
# ✅ L'URL Ngrok s'affiche dans le terminal

# 5. Pour arrêter
./stop-demo.sh
```

**⚠️ Votre Mac doit rester allumé**

---

## ☁️ Option 2 : Azure App Service (30 minutes)

**Hébergement permanent GRATUIT sur Microsoft Azure**

```bash
# 1. Build de l'application
./build-fullstack.sh

# 2. Installer Azure CLI
brew install azure-cli

# 3. Se connecter à Azure
az login

# 4. Déployer
az webapp up \
  --name familytree-yourname \
  --resource-group FamilyTreeRG \
  --runtime "DOTNET:8.0" \
  --sku F1

# ✅ URL : https://familytree-yourname.azurewebsites.net
```

**💰 Coût : 0€/mois (plan F1 gratuit)**

---

## 🐳 Option 3 : Render.com avec Docker (15 minutes)

**Déploiement automatique depuis GitHub**

```bash
# 1. Pousser sur GitHub
git add .
git commit -m "Ready for deploy"
git push origin main

# 2. Sur render.com :
#    - New + → Web Service
#    - Connect GitHub repo
#    - Environment: Docker
#    - Plan: Free

# ✅ URL : https://familytree-yourname.onrender.com
```

**💰 Coût : 0$/mois (plan gratuit)**

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- **[DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)** - Guide complet des 3 options
- **[backend/Program.cs](./backend/Program.cs)** - Configuration backend
- **[Dockerfile](./Dockerfile)** - Configuration Docker
- **[build-fullstack.sh](./build-fullstack.sh)** - Script de build

---

## 🆘 Dépannage rapide

### Ngrok ne démarre pas
```bash
# Vérifier l'installation
which ngrok

# Réinstaller si nécessaire
brew reinstall ngrok
```

### Backend ne démarre pas
```bash
# Vérifier PostgreSQL
brew services list | grep postgresql

# Redémarrer si nécessaire
brew services restart postgresql

# Vérifier la connexion
psql -h localhost -U ducer -d FamilyTreeDB
```

### Frontend ne compile pas
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## ✨ Vous êtes prêt !

Choisissez votre option et lancez-vous ! 🚀

- **Demo rapide** → `./start-demo-ngrok.sh`
- **Azure permanent** → `./build-fullstack.sh` puis Azure CLI
- **Render auto-deploy** → `git push` et configurer sur render.com

---

*Créé le 5 décembre 2025*
