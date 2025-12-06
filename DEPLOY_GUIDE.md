# 🚀 Guide de Déploiement - Application Généalogie Full-Stack

**Date**: 5 décembre 2025  
**Stack**: React (Frontend) + ASP.NET Core C# (Backend) + PostgreSQL  
**Objectif**: Héberger GRATUITEMENT votre application accessible à vos amis

---

## 📋 Table des matières

1. [Option 1 : Azure App Service (Recommandé pour C#)](#option-1-azure)
2. [Option 2 : Render.com avec Docker (Plus moderne)](#option-2-render)
3. [Option 3 : Ngrok - Demo rapide (Le plus simple)](#option-3-ngrok)
4. [Comparaison des options](#comparaison)

---

## 🎯 Option 1 : Azure App Service (RECOMMANDÉ)

**Pourquoi ?** Microsoft Azure + C# = Match parfait. Plan gratuit F1 à vie.

### Prérequis
- Compte Microsoft (gratuit)
- Abonnement Azure (gratuit avec 200$ de crédits pour 30 jours)

### 📦 Étape 1 : Build de l'application

```bash
# À la racine du projet
./build-fullstack.sh
```

Ce script va :
1. ✅ Compiler React (`npm run build`)
2. ✅ Copier les fichiers dans `backend/wwwroot`
3. ✅ Votre backend C# servira maintenant React !

### ☁️ Étape 2 : Déploiement sur Azure

#### Via Azure CLI (Recommandé)

```bash
# Installation Azure CLI (si pas déjà fait)
brew install azure-cli

# Connexion à Azure
az login

# Création du groupe de ressources
az group create --name FamilyTreeRG --location westeurope

# Création du plan App Service (GRATUIT F1)
az appservice plan create \
  --name FamilyTreePlan \
  --resource-group FamilyTreeRG \
  --sku F1 \
  --is-linux

# Création de l'App Service
az webapp create \
  --name familytree-yourname \
  --resource-group FamilyTreeRG \
  --plan FamilyTreePlan \
  --runtime "DOTNET:8.0"

# Déploiement depuis le dossier backend
cd backend
zip -r deploy.zip .
az webapp deployment source config-zip \
  --name familytree-yourname \
  --resource-group FamilyTreeRG \
  --src deploy.zip
```

### 🗄️ Étape 3 : Configuration de la base de données

**Option recommandée : Supabase (Gratuit + Généreux)**

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet PostgreSQL (gratuit)
3. Récupérer la Connection String
4. Configurer dans Azure :

```bash
az webapp config connection-string set \
  --name familytree-yourname \
  --resource-group FamilyTreeRG \
  --connection-string-type PostgreSQL \
  --settings DefaultConnection="Host=YOUR_SUPABASE_HOST;Database=postgres;Username=postgres;Password=YOUR_PASSWORD"
```

### 🔐 Étape 4 : Variables d'environnement

```bash
# Configuration JWT Key
az webapp config appsettings set \
  --name familytree-yourname \
  --resource-group FamilyTreeRG \
  --settings Jwt__Key="VOTRE_CLE_SECRETE_SUPER_LONGUE_MINIMUM_32_CARACTERES"
```

### ✅ URL finale

```
https://familytree-yourname.azurewebsites.net
```

### 💰 Coûts (Plan F1)

| Ressource | Coût |
|-----------|------|
| App Service F1 | **0€/mois** ✨ |
| Supabase PostgreSQL | **0€/mois** (500 MB) |
| Supabase Storage | **0€/mois** (1 GB) |
| **TOTAL** | **0€/mois** |

---

## 🐳 Option 2 : Render.com avec Docker

**Pourquoi ?** Déploiement automatique depuis GitHub, très moderne.

### 📝 Étape 1 : Préparer le projet

Le `Dockerfile` est déjà créé à la racine du projet. Vérifiez qu'il contient :

```dockerfile
# Multi-stage build : Frontend + Backend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app/backend
COPY backend/*.csproj ./
RUN dotnet restore
COPY backend/ ./
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=backend-build /app/publish ./
COPY --from=frontend-build /app/frontend/dist ./wwwroot
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "FamilyTreeAPI.dll"]
```

### 🐙 Étape 2 : Pousser sur GitHub

```bash
git add .
git commit -m "Prêt pour déploiement Render"
git push origin main
```

### ☁️ Étape 3 : Déployer sur Render

1. **Créer un compte sur [render.com](https://render.com)** (gratuit)

2. **Cliquer sur "New +" → "Web Service"**

3. **Connecter votre repository GitHub**

4. **Configuration** :
   - **Name** : `familytree-yourname`
   - **Environment** : `Docker`
   - **Plan** : **Free** (0$/mois)
   - **Branch** : `main`

5. **Variables d'environnement** (Add Environment Variables) :
   ```
   ASPNETCORE_ENVIRONMENT=Production
   Jwt__Key=VOTRE_CLE_SECRETE_32_CARACTERES_MINIMUM
   ConnectionStrings__DefaultConnection=VOTRE_CONNECTION_STRING_SUPABASE
   ```

6. **Cliquer sur "Create Web Service"**

7. Render va automatiquement :
   - ✅ Cloner votre repo
   - ✅ Builder l'image Docker
   - ✅ Déployer l'application
   - ✅ Vous donner une URL (ex: `https://familytree-yourname.onrender.com`)

### 🗄️ Base de données pour Render

**Option 1 : Supabase (Recommandé)**
- Gratuit, 500 MB, backups automatiques
- [supabase.com](https://supabase.com)

**Option 2 : Render PostgreSQL**
- Gratuit mais limité (expire après 90 jours)
- Dans Render : New + → PostgreSQL

### ⚡ Avantages de Render

- ✅ Déploiement automatique à chaque `git push`
- ✅ HTTPS gratuit automatique
- ✅ Logs en temps réel
- ✅ Redémarrages automatiques
- ⚠️ Mise en veille après 15 min d'inactivité (réveil en ~30 sec)

### 💰 Coûts Render

| Ressource | Coût |
|-----------|------|
| Web Service (750h/mois) | **0$/mois** |
| Supabase PostgreSQL | **0$/mois** |
| **TOTAL** | **0$/mois** ✨ |

---

## 🚀 Option 3 : Ngrok - Demo Rapide (LE PLUS SIMPLE)

**Pourquoi ?** Parfait pour montrer votre app À VOS AMIS CE SOIR sans config cloud.

### 🎯 Cas d'usage
- ✅ Demo rapide pour famille/amis
- ✅ Tests avec utilisateurs réels
- ✅ Pas besoin de cloud (tourne sur votre Mac)
- ⚠️ Votre ordinateur DOIT RESTER ALLUMÉ

### 📦 Étape 1 : Installation de Ngrok

```bash
# Installation avec Homebrew
brew install ngrok

# Ou télécharger depuis ngrok.com
```

### 🔑 Étape 2 : Configuration du compte

1. Créer un compte gratuit sur [ngrok.com](https://ngrok.com)
2. Récupérer votre Authtoken
3. Le configurer :

```bash
ngrok config add-authtoken VOTRE_TOKEN_ICI
```

### 🚀 Étape 3 : Lancer l'application localement

**Terminal 1 - Backend** :
```bash
cd backend
dotnet run
# Backend tourne sur http://localhost:5000
```

**Terminal 2 - Frontend** :
```bash
cd frontend
npm run dev
# Frontend tourne sur http://localhost:3000
```

### 🌐 Étape 4 : Créer le tunnel Ngrok

**Pour exposer le Frontend uniquement** (si API en local suffit) :
```bash
ngrok http 3000
```

**Pour exposer Frontend ET Backend** (recommandé) :

**Terminal 3 - Tunnel Frontend** :
```bash
ngrok http 3000
# Vous obtenez : https://abc123.ngrok-free.app
```

**Terminal 4 - Tunnel Backend** :
```bash
ngrok http 5000
# Vous obtenez : https://def456.ngrok-free.app
```

### ⚙️ Étape 5 : Configuration CORS

Modifiez `backend/Program.cs` pour accepter l'URL Ngrok :

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins(
                "http://localhost:3000",
                "https://abc123.ngrok-free.app"  // 👈 Ajoutez votre URL Ngrok
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
        });
});
```

### 📱 Étape 6 : Partager avec vos amis

Envoyez-leur le lien :
```
https://abc123.ngrok-free.app
```

**⚠️ IMPORTANT** :
- Votre Mac DOIT rester allumé
- Les 3-4 terminaux DOIVENT rester ouverts
- L'URL change à chaque redémarrage de Ngrok (sauf plan payant)

### 💡 Script automatique Ngrok

Créez `start-demo.sh` :

```bash
#!/bin/bash

echo "🚀 Démarrage demo Ngrok..."

# Backend
cd backend
dotnet run &
BACKEND_PID=$!

# Frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Attendre que les serveurs démarrent
sleep 10

# Tunnels Ngrok
ngrok http 3000 &
ngrok http 5000 &

echo "✅ Application prête !"
echo "📱 Partagez les URLs Ngrok avec vos amis"
echo ""
echo "Pour arrêter : kill $BACKEND_PID $FRONTEND_PID"
```

### 💰 Coûts Ngrok

| Ressource | Coût |
|-----------|------|
| Ngrok Free | **0$/mois** |
| Votre électricité 😄 | ~0.50€/mois |
| **TOTAL** | **~0.50€/mois** |

**Limitations plan gratuit** :
- 1 processus Ngrok à la fois (besoin de 2 = 2 comptes ou plan payant)
- URL change à chaque redémarrage
- Limite de bande passante

---

## 📊 Comparaison des 3 options

| Critère | Azure (Option 1) | Render (Option 2) | Ngrok (Option 3) |
|---------|------------------|-------------------|------------------|
| **Difficulté** | Moyenne | Facile | Très facile |
| **Temps setup** | 30 min | 15 min | 5 min |
| **Coût** | 0€ | 0$ | 0$ |
| **Uptime** | 24/7 | 24/7 | Seulement quand Mac allumé |
| **Performance** | Moyenne | Bonne | Excellente (local) |
| **URL permanente** | ✅ Oui | ✅ Oui | ❌ Non |
| **Auto-deploy** | ❌ Manuel | ✅ GitHub | ❌ N/A |
| **Limite data** | 165 MB/jour | Illimité | ~1 GB/mois |
| **Hibernation** | Après 20 min | Après 15 min | ❌ Jamais |
| **Stack optimale** | C# ⭐⭐⭐ | Docker ⭐⭐⭐ | Tout ⭐⭐⭐ |

---

## 🏆 Recommandation finale

### Pour montrer CE SOIR à vos amis :
👉 **Option 3 : Ngrok** (5 minutes chrono)

### Pour un hébergement permanent gratuit :
👉 **Option 2 : Render.com** (plus moderne, auto-deploy)

### Si vous connaissez bien Microsoft :
👉 **Option 1 : Azure** (meilleure intégration C#)

---

## 🎯 Quick Start - Les 3 commandes magiques

### Azure
```bash
./build-fullstack.sh
az webapp up --name familytree-yourname --runtime "DOTNET:8.0"
# ✅ En ligne en 5 min
```

### Render
```bash
git push origin main
# ✅ Render déploie automatiquement
```

### Ngrok
```bash
dotnet run &  # Backend
npm run dev &  # Frontend
ngrok http 3000  # Tunnel
# ✅ Partagez l'URL avec vos amis
```

---

## 📚 Ressources utiles

- **Azure CLI** : [docs.microsoft.com/cli/azure](https://docs.microsoft.com/cli/azure)
- **Render Docs** : [render.com/docs](https://render.com/docs)
- **Ngrok Docs** : [ngrok.com/docs](https://ngrok.com/docs)
- **Supabase** : [supabase.com/docs](https://supabase.com/docs)

---

## 🆘 Besoin d'aide ?

1. ✅ **Script de build automatique** : `./build-fullstack.sh`
2. ✅ **Dockerfile prêt à l'emploi** : `./Dockerfile`
3. ✅ **Documentation complète** : Ce fichier
4. ✅ **Backend configuré** : `Program.cs` avec `MapFallbackToFile`

**Vous êtes prêt pour le déploiement ! 🚀**

---

*Guide créé le 5 décembre 2025*
