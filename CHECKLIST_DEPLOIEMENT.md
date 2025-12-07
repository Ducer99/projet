# ✅ Checklist de Déploiement Production

## 📋 Préparation (Local)

- [ ] **1. Code prêt**
  - [ ] Tous les fichiers commitéss sur Git
  - [ ] Pas d'erreurs de compilation
  - [ ] Tests locaux passés

- [ ] **2. Fichiers de configuration créés**
  - [ ] `backend/Dockerfile` ✅ Créé
  - [ ] `backend/.dockerignore` ✅ Créé
  - [ ] `backend/appsettings.Production.json` ✅ Créé
  - [ ] `frontend/vercel.json` ✅ Créé
  - [ ] `frontend/.env.example` ✅ Créé

- [ ] **3. Test de build local**
  - [ ] Exécuter `./test-build-production.sh`
  - [ ] Vérifier que Docker build fonctionne
  - [ ] Vérifier que npm build fonctionne

---

## 🗄️ Base de Données (Neon.tech)

- [ ] **1. Compte créé**
  - [ ] Inscrit sur https://neon.tech
  - [ ] Compte vérifié

- [ ] **2. Projet créé**
  - [ ] Nom : `family-tree-db`
  - [ ] Région sélectionnée
  - [ ] PostgreSQL 16 sélectionné

- [ ] **3. Connection String récupérée**
  - [ ] Format : `postgresql://username:password@ep-xxx.region.neon.tech/neondb?sslmode=require`
  - [ ] Copiée dans un fichier sécurisé

- [ ] **4. Migrations appliquées**
  - [ ] `export DATABASE_URL="postgresql://..."`
  - [ ] `dotnet ef database update`
  - [ ] Tables vérifiées dans Neon Dashboard

---

## ⚙️ Backend (Render.com)

- [ ] **1. Compte créé**
  - [ ] Inscrit sur https://render.com
  - [ ] Connecté avec GitHub

- [ ] **2. Service Web créé**
  - [ ] Nom : `family-tree-api`
  - [ ] Region : Oregon (US West)
  - [ ] Branch : `main`
  - [ ] Root Directory : `backend`
  - [ ] Runtime : Docker

- [ ] **3. Variables d'environnement configurées**
  - [ ] `DATABASE_URL` = Connection string Neon
  - [ ] `JWT_SECRET_KEY` = Clé sécurisée 32+ caractères
  - [ ] `ASPNETCORE_ENVIRONMENT` = Production
  - [ ] `VERCEL_URL` = (à configurer après frontend)

- [ ] **4. Déploiement réussi**
  - [ ] Build terminé sans erreur
  - [ ] Service "Live"
  - [ ] URL copiée : `https://family-tree-api.onrender.com`

- [ ] **5. Test de l'API**
  - [ ] `curl https://family-tree-api.onrender.com/api/health`
  - [ ] Réponse 200 OK reçue

---

## 🎨 Frontend (Vercel)

- [ ] **1. Compte créé**
  - [ ] Inscrit sur https://vercel.com
  - [ ] Connecté avec GitHub

- [ ] **2. Projet importé**
  - [ ] Repository `projet` sélectionné
  - [ ] Framework : Vite (détecté)
  - [ ] Root Directory : `frontend`

- [ ] **3. Configuration du build**
  - [ ] Build Command : `npm run build`
  - [ ] Output Directory : `dist`
  - [ ] Install Command : `npm install`

- [ ] **4. Variables d'environnement configurées**
  - [ ] `VITE_API_URL` = `https://family-tree-api.onrender.com/api`

- [ ] **5. Déploiement réussi**
  - [ ] Build terminé sans erreur
  - [ ] Site "Ready"
  - [ ] URL copiée : `https://your-app.vercel.app`

---

## 🔗 Connexion Frontend ↔️ Backend

- [ ] **1. URL Vercel ajoutée au Backend**
  - [ ] Retourner sur Render.com
  - [ ] Modifier `VERCEL_URL` = `https://your-app.vercel.app`
  - [ ] Sauvegarder (service redémarre)

- [ ] **2. CORS vérifié**
  - [ ] Ouvrir DevTools (F12) sur le site Vercel
  - [ ] Vérifier qu'il n'y a pas d'erreur CORS
  - [ ] Logs Render : Pas d'erreur CORS

---

## 🧪 Tests de Production

- [ ] **1. Test de la page d'accueil**
  - [ ] Ouvrir `https://your-app.vercel.app`
  - [ ] Page de login s'affiche
  - [ ] Pas d'erreur dans la console

- [ ] **2. Test d'inscription**
  - [ ] Aller sur `/register`
  - [ ] Remplir Step 1 (email + password)
  - [ ] Remplir Step 2 (profil complet)
  - [ ] Remplir Step 3 (créer famille)
  - [ ] Soumettre le formulaire
  - [ ] Vérifier redirection vers `/dashboard`

- [ ] **3. Test de connexion**
  - [ ] Se déconnecter
  - [ ] Se reconnecter avec les identifiants
  - [ ] Vérifier accès au dashboard

- [ ] **4. Test du Dashboard**
  - [ ] Code d'invitation visible (si admin)
  - [ ] Membres visibles
  - [ ] Statistiques affichées
  - [ ] Changement de langue FR/EN fonctionne

- [ ] **5. Test de l'arbre généalogique**
  - [ ] Cliquer sur "Arbre Dynamique"
  - [ ] Vérifier que l'arbre s'affiche
  - [ ] Zoomer/Dézoomer fonctionne
  - [ ] Navigation fonctionne

- [ ] **6. Vérification Base de Données**
  - [ ] Ouvrir Neon Dashboard
  - [ ] Vérifier table `Connexion` (nouveau compte créé)
  - [ ] Vérifier table `Person` (nouveau profil créé)
  - [ ] Vérifier table `Family` (nouvelle famille créée)

---

## 📊 Monitoring

- [ ] **1. Vercel Analytics**
  - [ ] Activé dans Vercel Dashboard
  - [ ] Vérifier les premières visites

- [ ] **2. Render Metrics**
  - [ ] Ouvrir Metrics dans Render Dashboard
  - [ ] Vérifier CPU, RAM, Requêtes

- [ ] **3. Neon Monitoring**
  - [ ] Vérifier "Operations" dans Neon Dashboard
  - [ ] Vérifier le nombre de connexions actives

---

## 🎯 Finalisation

- [ ] **1. Documentation mise à jour**
  - [ ] URLs de production notées
  - [ ] Variables d'environnement documentées
  - [ ] Guide d'utilisation créé

- [ ] **2. Partage avec testeurs**
  - [ ] Envoyer URL Vercel : `https://your-app.vercel.app`
  - [ ] Créer 2-3 codes d'invitation
  - [ ] Partager le guide de test utilisateur

- [ ] **3. Sauvegarde**
  - [ ] Exporter la base de données Neon
  - [ ] Sauvegarder les variables d'environnement
  - [ ] Documenter les credentials

---

## 🐛 En cas de problème

### Erreur CORS
```bash
Symptôme : "Access-Control-Allow-Origin" dans DevTools
Solution : Vérifier VERCEL_URL dans Render + redémarrer service
```

### Backend 503
```bash
Symptôme : Service Unavailable
Solution : Attendre 30-60s (cold start plan gratuit)
```

### Frontend erreur Network
```bash
Symptôme : Network Error dans DevTools
Solution : Vérifier VITE_API_URL dans Vercel Variables
```

---

## 📞 Support

- Vercel : https://vercel.com/docs
- Render : https://render.com/docs  
- Neon : https://neon.tech/docs

---

**Date** : 7 décembre 2024  
**Statut** : ✅ Prêt pour déploiement
