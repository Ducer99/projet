# 🚀 Guide de Déploiement en Production

## Architecture de Déploiement

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  🌍 UTILISATEURS                                        │
│                                                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ├──► 🎨 Frontend (Vercel)
                  │    └─ React + TypeScript + Vite
                  │    └─ URL: https://your-app.vercel.app
                  │
                  └──► ⚙️ Backend (Render.com)
                       └─ ASP.NET Core API
                       └─ URL: https://your-api.onrender.com
                       │
                       └──► 🗄️ Database (Neon.tech)
                            └─ PostgreSQL
                            └─ URL: postgresql://...
```

---

## 📦 Étape 1 : Préparer la Base de Données (Neon.tech)

### 1.1 Créer un compte Neon.tech
1. Aller sur https://neon.tech
2. Cliquer sur "Sign Up" (gratuit)
3. Se connecter avec GitHub ou Email

### 1.2 Créer un nouveau projet
1. Cliquer sur "New Project"
2. Nom du projet : `family-tree-db`
3. Région : Choisir la plus proche (ex: EU West)
4. PostgreSQL Version : 16 (dernière stable)
5. Cliquer sur "Create Project"

### 1.3 Récupérer la Connection String
```bash
# Format Neon
postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require
```

**⚠️ IMPORTANT** : Copiez cette connection string, vous en aurez besoin !

### 1.4 Appliquer les migrations
```bash
# Local - Test avec la DB Neon
cd backend
export DATABASE_URL="postgresql://..."
dotnet ef database update

# ✅ Vérifiez que les tables sont créées dans Neon Dashboard
```

---

## 🐳 Étape 2 : Déployer le Backend sur Render.com

### 2.1 Créer un compte Render
1. Aller sur https://render.com
2. Cliquer sur "Get Started"
3. Se connecter avec GitHub

### 2.2 Connecter le repository GitHub
1. Cliquer sur "New +" → "Web Service"
2. Connecter votre compte GitHub
3. Sélectionner le repository `projet`
4. Root Directory : `backend`

### 2.3 Configuration du service

**General Settings** :
- **Name** : `family-tree-api`
- **Region** : Oregon (US West) - gratuit
- **Branch** : `main`
- **Root Directory** : `backend`
- **Runtime** : Docker
- **Dockerfile Path** : `backend/Dockerfile`

**Environment Variables** :
Cliquer sur "Advanced" → "Add Environment Variable"

```bash
# Database Connection (de Neon.tech)
DATABASE_URL=postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require

# JWT Secret (générer une clé sécurisée)
JWT_SECRET_KEY=VotreCleSuperSecureAvecAuMoins32Caracteres123456789

# URL Vercel (à configurer après le déploiement frontend)
VERCEL_URL=https://your-app.vercel.app

# ASP.NET Environment
ASPNETCORE_ENVIRONMENT=Production
```

**Instance Type** :
- Sélectionner "Free" (512 MB RAM, partage CPU)

### 2.4 Déployer
1. Cliquer sur "Create Web Service"
2. Attendre 5-10 minutes (build Docker + déploiement)
3. Une fois terminé, copier l'URL : `https://family-tree-api.onrender.com`

### 2.5 Tester l'API
```bash
# Test de santé
curl https://family-tree-api.onrender.com/api/health

# Devrait retourner 200 OK ou une réponse JSON
```

---

## 🎨 Étape 3 : Déployer le Frontend sur Vercel

### 3.1 Créer un compte Vercel
1. Aller sur https://vercel.com
2. Cliquer sur "Sign Up"
3. Se connecter avec GitHub

### 3.2 Importer le projet
1. Cliquer sur "Add New..." → "Project"
2. Sélectionner le repository `projet`
3. Vercel détecte automatiquement Vite

### 3.3 Configuration du projet

**Framework Preset** : Vite (détecté automatiquement)

**Root Directory** : `frontend`

**Build Settings** :
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

**Environment Variables** :
Cliquer sur "Environment Variables"

```bash
# URL de votre API Render
VITE_API_URL=https://family-tree-api.onrender.com/api
```

### 3.4 Déployer
1. Cliquer sur "Deploy"
2. Attendre 2-3 minutes
3. Une fois terminé, copier l'URL : `https://your-app.vercel.app`

### 3.5 Mettre à jour le Backend avec l'URL Vercel
Retourner sur Render.com → Votre service backend → Environment Variables

**Modifier** :
```bash
VERCEL_URL=https://your-app.vercel.app
```

Cliquer sur "Save Changes" → Le service va redémarrer automatiquement

---

## ✅ Étape 4 : Tests de Production

### 4.1 Tester le Frontend
1. Ouvrir `https://your-app.vercel.app`
2. Vérifier que la page de login s'affiche
3. Ouvrir DevTools (F12) → Console
4. Vérifier qu'il n'y a pas d'erreur CORS

### 4.2 Tester l'inscription
1. Aller sur `/register`
2. Remplir le formulaire (Step 1, 2, 3)
3. Cliquer sur "Submit"
4. Vérifier la redirection vers `/dashboard`

### 4.3 Vérifier la base de données
1. Aller sur Neon.tech Dashboard
2. Cliquer sur votre projet
3. Aller dans "Tables" → Vérifier que les tables sont remplies

---

## 🔧 Configuration Avancée

### Custom Domain (Optionnel)

**Vercel** :
1. Aller dans Settings → Domains
2. Ajouter votre domaine (ex: `familytree.com`)
3. Configurer les DNS chez votre registrar

**Render** :
1. Aller dans Settings → Custom Domain
2. Ajouter un sous-domaine (ex: `api.familytree.com`)

### HTTPS/SSL
- ✅ **Vercel** : SSL automatique (Let's Encrypt)
- ✅ **Render** : SSL automatique (Let's Encrypt)
- ✅ **Neon** : SSL/TLS natif

### Monitoring

**Vercel Analytics** :
1. Aller dans Analytics (plan gratuit)
2. Activer Web Analytics

**Render Metrics** :
1. Aller dans Metrics
2. Surveiller CPU, RAM, Requêtes

---

## 🐛 Dépannage

### Erreur CORS
```bash
# Symptôme : "Access-Control-Allow-Origin" error dans DevTools

# Solution : Vérifier que VERCEL_URL est bien configuré sur Render
# Et que Program.cs inclut bien l'URL Vercel dans les origines autorisées
```

### Backend ne répond pas (503)
```bash
# Symptôme : 503 Service Unavailable

# Causes possibles :
# 1. Instance Render endormie (plan gratuit - 15 min d'inactivité)
# 2. Build Docker échoué
# 3. Connection DB invalide

# Solution :
# 1. Attendre 30-60 secondes (cold start)
# 2. Vérifier les logs dans Render Dashboard
# 3. Tester la connection DB avec DATABASE_URL
```

### Frontend ne trouve pas l'API
```bash
# Symptôme : Network Error dans DevTools

# Solution :
# 1. Vérifier VITE_API_URL dans Vercel Environment Variables
# 2. Vérifier que l'URL se termine par /api
# 3. Redéployer le frontend après modification
```

---

## 📊 Limites des Plans Gratuits

### Vercel (Free Tier)
- ✅ Bande passante : 100 GB/mois
- ✅ Builds : Illimités
- ✅ Projets : Illimités
- ⚠️ 1 équipe (vous seul)

### Render (Free Tier)
- ⚠️ Instance s'endort après 15 min d'inactivité (cold start ~30-60s)
- ✅ 750h/mois (suffisant pour 1 service 24/7)
- ✅ SSL automatique
- ⚠️ Partagé (pas de CPU/RAM dédiés)

### Neon (Free Tier)
- ✅ 1 projet gratuit
- ✅ 512 MB de stockage
- ✅ Compute : 100 heures/mois
- ⚠️ Base de données s'arrête après 5 min d'inactivité (redémarre automatiquement)

---

## 🎯 Récapitulatif des URLs

| Service | URL de Production | Environnement Variable |
|---------|-------------------|------------------------|
| **Frontend** | https://your-app.vercel.app | - |
| **Backend** | https://family-tree-api.onrender.com | VITE_API_URL |
| **Database** | postgresql://ep-xxx.neon.tech/... | DATABASE_URL |

---

## 🚀 Prochaines Étapes

1. ✅ Tester l'application en production
2. 🔍 Surveiller les erreurs avec les dashboards Vercel/Render
3. 📊 Configurer des alertes (emails si service down)
4. 🎨 Ajouter un domaine personnalisé
5. 📈 Activer les analytics Vercel

---

## 📞 Support

- **Vercel** : https://vercel.com/docs
- **Render** : https://render.com/docs
- **Neon** : https://neon.tech/docs

---

**Dernière mise à jour** : 7 décembre 2024  
**Statut** : ✅ Prêt pour déploiement
