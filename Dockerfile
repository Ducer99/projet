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

#### Via Visual Studio (Le plus simple)

1. **Ouvrir le projet backend dans Visual Studio**
   ```bash
   cd backend
   open FamilyTreeAPI.csproj
   ```

2. **Clic droit sur le projet** → `Publish...`

3. **Choisir Azure** → `Azure App Service (Linux)` → `Create New`

4. **Configuration** :
   - **Name** : `familytree-yourname` (doit être unique)
   - **Subscription** : Votre abonnement gratuit
   - **Resource Group** : Créer nouveau `FamilyTreeRG`
   - **Hosting Plan** : **F1 (Free)** ⚠️ IMPORTANT
   - **Region** : Europe West (le plus proche)

5. **Cliquer sur Create** → Patientez 2-3 minutes

6. **Publish** → Votre app est en ligne ! 🎉

#### Via Azure CLI (Pour les développeurs)

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
  --runtime "DOTNETCORE:8.0"

# Déploiement depuis le dossier backend
cd backend
az webapp up \
  --name familytree-yourname \
  --resource-group FamilyTreeRG
```

### 🗄️ Étape 3 : Configuration de la base de données

**Option A : Azure Database for PostgreSQL (100 MB gratuit)**

```bash
# Création d'un serveur PostgreSQL
az postgres flexible-server create \
  --name familytree-db-yourname \
  --resource-group FamilyTreeRG \
  --location westeurope \
  --sku-name B_Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --admin-user dbadmin \
  --admin-password "VotreMotDePasseComplexe123!"
```

**Option B : Supabase (Gratuit + Plus généreux)**

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet (gratuit)
3. Récupérer la Connection String PostgreSQL
4. Ajouter dans Azure App Service → Configuration → Connection Strings

**Configuration dans Azure** :

```bash
# Ajouter la connection string dans l'App Service
az webapp config connection-string set \
  --name familytree-yourname \
  --resource-group FamilyTreeRG \
  --connection-string-type PostgreSQL \
  --settings DefaultConnection="Host=YOUR_DB_HOST;Database=FamilyTreeDB;Username=dbadmin;Password=YOUR_PASSWORD"
```

### 🔐 Étape 4 : Configuration des variables d'environnement

```bash
# Configuration JWT Key
az webapp config appsettings set \
  --name familytree-yourname \
  --resource-group FamilyTreeRG \
  --settings Jwt__Key="VOTRE_CLE_SECRETE_SUPER_LONGUE_ET_COMPLEXE_2024"

# Configuration CORS (remplacer par votre URL Azure)
az webapp config appsettings set \
  --name familytree-yourname \
  --resource-group FamilyTreeRG \
  --settings ALLOWED_ORIGINS="https://familytree-yourname.azurewebsites.net"
```

### ✅ Étape 5 : Tester votre application

Votre application est maintenant accessible à :
```
https://familytree-yourname.azurewebsites.net
```

**Partager avec vos amis** :
- Envoyez-leur simplement ce lien !
- Ils peuvent s'inscrire et rejoindre votre famille

### 💰 Coûts (Plan F1 Gratuit)

| Ressource | Plan | Coût |
|-----------|------|------|
| App Service | F1 (Free) | **0€/mois** |
| PostgreSQL Supabase | Free Tier | **0€/mois** |
| Storage (photos) | Supabase Storage | **1 GB gratuit** |
| **TOTAL** | | **0€/mois** ✨ |

**Limitations du plan gratuit** :
- ⏱️ 60 minutes CPU/jour (suffisant pour usage familial)
- 💾 1 GB de stockage disque
- 🌐 165 MB de données sortantes/jour
- 😴 L'app s'endort après 20 min d'inactivité (réveil en 10 sec)

---

## 🐳 Option 2 : Render.com avec Docker

**Pourquoi ?** Plus moderne, déploiement automatique depuis GitHub.

### 📝 Étape 1 : Créer un Dockerfile

<function_calls>
<invoke name="create_file">
<parameter name="content"># 🐳 Dockerfile Multi-Stage pour Full-Stack

# ========================================
# Stage 1 : Build du Frontend React
# ========================================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copier les fichiers package
COPY frontend/package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY frontend/ ./

# Build de production React
RUN npm run build

# ========================================
# Stage 2 : Build du Backend C#
# ========================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build

WORKDIR /app/backend

# Copier les fichiers .csproj
COPY backend/*.csproj ./

# Restaurer les dépendances
RUN dotnet restore

# Copier tout le code source backend
COPY backend/ ./

# Build du backend
RUN dotnet publish -c Release -o /app/publish

# ========================================
# Stage 3 : Runtime - Image finale
# ========================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

# Copier les binaires du backend
COPY --from=backend-build /app/publish ./

# 🚀 Copier les fichiers React buildés dans wwwroot
COPY --from=frontend-build /app/frontend/dist ./wwwroot

# Exposer le port (Render utilise le port défini dans $PORT)
EXPOSE 5000

# Variables d'environnement par défaut
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Commande de démarrage
ENTRYPOINT ["dotnet", "FamilyTreeAPI.dll"]
