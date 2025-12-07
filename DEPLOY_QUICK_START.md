# 🚀 Déploiement en 15 Minutes

## Stack de Production

| Service | Hébergeur | Plan | URL |
|---------|-----------|------|-----|
| **Frontend** | Vercel | Free | https://your-app.vercel.app |
| **Backend** | Render.com | Free | https://family-tree-api.onrender.com |
| **Database** | Neon.tech | Free | postgresql://... |

---

## ⚡ Déploiement Rapide

### 1️⃣ Base de Données (2 min)

```bash
# 1. Créer compte sur https://neon.tech
# 2. Créer projet "family-tree-db"
# 3. Copier la Connection String :
postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require

# 4. Appliquer les migrations
cd backend
export DATABASE_URL="postgresql://..."
dotnet ef database update
```

### 2️⃣ Backend (5 min)

```bash
# 1. Créer compte sur https://render.com
# 2. New Web Service → Connect GitHub → Sélectionner "projet"
# 3. Configuration :
Name: family-tree-api
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Docker

# 4. Environment Variables :
DATABASE_URL=postgresql://... (de Neon)
JWT_SECRET_KEY=VotreCleSuperSecureAvecAuMoins32Caracteres123456789
ASPNETCORE_ENVIRONMENT=Production

# 5. Deploy → Attendre 5-10 min
```

### 3️⃣ Frontend (5 min)

```bash
# 1. Créer compte sur https://vercel.com
# 2. New Project → Import "projet" from GitHub
# 3. Configuration :
Root Directory: frontend
Framework: Vite (auto-détecté)

# 4. Environment Variables :
VITE_API_URL=https://family-tree-api.onrender.com/api

# 5. Deploy → Attendre 2-3 min
```

### 4️⃣ Connexion (3 min)

```bash
# 1. Copier URL Vercel : https://your-app.vercel.app
# 2. Retourner sur Render.com → family-tree-api
# 3. Ajouter Variable :
VERCEL_URL=https://your-app.vercel.app

# 4. Save → Service redémarre
```

---

## ✅ Tester

1. Ouvrir `https://your-app.vercel.app`
2. S'inscrire (créer une famille)
3. Vérifier le dashboard
4. Tester l'arbre généalogique

---

## 📚 Documentation Complète

- [Guide Détaillé](./DEPLOIEMENT_PRODUCTION.md)
- [Checklist](./CHECKLIST_DEPLOIEMENT.md)

---

**Date** : 7 décembre 2024
