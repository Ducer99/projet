# 📦 Configuration de Déploiement - Résumé Complet

**Date**: 5 décembre 2025  
**Objectif**: Préparer l'application pour un déploiement gratuit  
**Statut**: ✅ **PRÊT POUR DÉPLOIEMENT**

---

## 🎯 Modifications effectuées

### 1️⃣ Backend configuré pour servir React

**Fichier** : `backend/Program.cs`

**Modifications** :
```csharp
// Ajout du fallback pour React Router (SPA)
app.UseDefaultFiles();
app.MapFallbackToFile("index.html");
```

**Effet** :
- ✅ Le backend C# peut maintenant servir les fichiers React statiques
- ✅ Toutes les routes non-API redirigent vers `index.html`
- ✅ React Router fonctionne correctement en production

---

### 2️⃣ Script de build automatique

**Fichier** : `build-fullstack.sh`

**Fonctionnalités** :
1. ✅ Compile React (`npm run build`)
2. ✅ Nettoie `backend/wwwroot`
3. ✅ Copie `frontend/dist` → `backend/wwwroot`
4. ✅ Affiche un résumé des fichiers

**Usage** :
```bash
./build-fullstack.sh
```

---

### 3️⃣ Dockerfile multi-stage

**Fichier** : `Dockerfile`

**Architecture** :
- **Stage 1** : Build Frontend (Node.js → React compilé)
- **Stage 2** : Build Backend (SDK .NET → DLL compilé)
- **Stage 3** : Runtime (ASP.NET + React dans wwwroot)

**Avantages** :
- ✅ Image finale optimisée (~200 MB au lieu de 2 GB)
- ✅ Un seul container pour tout
- ✅ Prêt pour Render.com, Azure, Docker Hub

**Test local** :
```bash
docker build -t familytree-app .
docker run -p 5000:5000 \
  -e ConnectionStrings__DefaultConnection="YOUR_DB" \
  -e Jwt__Key="YOUR_SECRET_KEY" \
  familytree-app
```

---

### 4️⃣ Script de démo Ngrok

**Fichier** : `start-demo-ngrok.sh`

**Fonctionnalités** :
- ✅ Démarre automatiquement Backend + Frontend
- ✅ Crée un tunnel Ngrok public
- ✅ Affiche l'URL à partager avec vos amis
- ✅ Gère les logs dans des fichiers séparés
- ✅ Nettoyage propre avec `Ctrl+C`

**Compléments** :
- `stop-demo.sh` - Arrête tous les processus
- Logs sauvegardés dans `logs-*.txt`

**Usage** :
```bash
./start-demo-ngrok.sh
# Partagez l'URL affichée avec vos amis
```

---

### 5️⃣ Documentation complète

**Fichiers créés** :

| Fichier | Description |
|---------|-------------|
| **DEPLOY_GUIDE.md** | Guide complet des 3 options (Azure, Render, Ngrok) |
| **QUICK_START_DEPLOY.md** | Quick Start en 3 commandes par option |
| **.dockerignore** | Optimisation du build Docker |

---

## 📊 Les 3 options de déploiement

### 🥇 Option 1 : Azure App Service

**Avantages** :
- ✅ Stack Microsoft (C# + Azure)
- ✅ Plan F1 gratuit à vie
- ✅ HTTPS automatique
- ✅ Intégration native .NET

**Inconvénients** :
- ⏱️ Hibernation après 20 min
- 💾 Limites : 60 min CPU/jour, 165 MB data/jour
- 🔧 Configuration Azure CLI nécessaire

**Commandes** :
```bash
./build-fullstack.sh
az webapp up --name familytree-yourname --runtime "DOTNET:8.0" --sku F1
```

---

### 🥈 Option 2 : Render.com (Docker)

**Avantages** :
- ✅ Auto-deploy depuis GitHub (git push = déploiement)
- ✅ HTTPS automatique
- ✅ Logs en temps réel
- ✅ Configuration moderne

**Inconvénients** :
- ⏱️ Hibernation après 15 min
- 🐢 Réveil ~30 secondes
- 🔄 Base PostgreSQL gratuite expire après 90 jours (utiliser Supabase)

**Setup** :
1. Push sur GitHub
2. Connecter repo sur render.com
3. Choisir "Docker" + Plan "Free"
4. Ajouter variables d'environnement

---

### 🥉 Option 3 : Ngrok (Demo locale)

**Avantages** :
- ✅ Setup en 5 minutes
- ✅ Performances natives (local)
- ✅ Aucune configuration cloud
- ✅ Parfait pour demo rapide

**Inconvénients** :
- 💻 Mac doit rester allumé
- 🔄 URL change à chaque redémarrage
- 👥 Limite de connexions simultanées (gratuit)

**Commandes** :
```bash
./start-demo-ngrok.sh
# Partager l'URL affichée
```

---

## 🗄️ Configuration Base de Données

### Option recommandée : Supabase (gratuit)

**Pourquoi** :
- ✅ 500 MB PostgreSQL gratuit
- ✅ Pas d'expiration
- ✅ Backups automatiques
- ✅ Interface admin web

**Setup** :
1. Créer compte sur [supabase.com](https://supabase.com)
2. Créer un projet PostgreSQL
3. Récupérer Connection String
4. Configurer dans Azure/Render :
   ```
   Host=db.xxxxx.supabase.co;
   Database=postgres;
   Username=postgres;
   Password=your_password
   ```

---

## ✅ Checklist de déploiement

### Avant le déploiement

- [ ] Base de données créée (Supabase ou Azure)
- [ ] Connection String testée localement
- [ ] JWT Key générée (minimum 32 caractères)
- [ ] CORS configuré avec URL de production
- [ ] Build local testé : `./build-fullstack.sh`

### Après le déploiement

- [ ] Application accessible via URL publique
- [ ] Login/Register fonctionne
- [ ] Upload de photos fonctionne
- [ ] Arbre généalogique s'affiche
- [ ] Pas d'erreurs CORS dans la console
- [ ] Variables d'environnement configurées

---

## 🔐 Variables d'environnement requises

```bash
# Obligatoires
ConnectionStrings__DefaultConnection="Host=...;Database=...;Username=...;Password=..."
Jwt__Key="VOTRE_CLE_SECRETE_MINIMUM_32_CARACTERES_ALEATOIRES"

# Recommandées
ASPNETCORE_ENVIRONMENT="Production"
ALLOWED_ORIGINS="https://votre-app.azurewebsites.net"

# Optionnelles (pour email)
EmailSettings__SmtpHost="smtp.gmail.com"
EmailSettings__SmtpPort="587"
EmailSettings__FromEmail="votre@email.com"
EmailSettings__FromPassword="votre_mot_de_passe_app"
```

---

## 📈 Monitoring et logs

### Azure
```bash
# Voir les logs en temps réel
az webapp log tail --name familytree-yourname --resource-group FamilyTreeRG

# Télécharger les logs
az webapp log download --name familytree-yourname --resource-group FamilyTreeRG
```

### Render
- Interface web : Logs → View Logs
- Temps réel automatique

### Ngrok
```bash
# Logs locaux
tail -f logs-backend.txt
tail -f logs-frontend.txt

# Dashboard Ngrok
open http://localhost:4040
```

---

## 💡 Conseils de production

### Sécurité
- ✅ Utilisez HTTPS (automatique sur Azure/Render)
- ✅ JWT Key complexe (générateur : `openssl rand -base64 32`)
- ✅ Ne committez JAMAIS les secrets dans Git
- ✅ Activez les CORS uniquement pour votre domaine

### Performance
- ✅ Activez la compression (`app.UseResponseCompression()`)
- ✅ Utilisez un CDN pour les images (Supabase Storage)
- ✅ Minifiez React (déjà fait avec `npm run build`)
- ✅ Mettez en cache les assets statiques

### Maintenance
- ✅ Backups réguliers de la base (Supabase = auto)
- ✅ Monitoring des erreurs (Azure Application Insights gratuit)
- ✅ Testez en local avant chaque déploiement

---

## 🎯 Prochaines étapes recommandées

1. **Court terme** (Ce soir)
   - [ ] Tester avec Ngrok pour montrer à vos amis
   - [ ] Recueillir leurs retours

2. **Moyen terme** (Cette semaine)
   - [ ] Déployer sur Render.com (auto-deploy depuis GitHub)
   - [ ] Configurer Supabase PostgreSQL
   - [ ] Inviter la famille à s'inscrire

3. **Long terme** (Ce mois)
   - [ ] Migrer vers Azure si besoin de plus de stabilité
   - [ ] Ajouter monitoring (Application Insights)
   - [ ] Optimiser les performances

---

## 📚 Fichiers créés

```
projet/
├── backend/
│   └── Program.cs                    # ✅ Modifié (fallback SPA)
├── build-fullstack.sh                # ✅ Nouveau (build auto)
├── start-demo-ngrok.sh               # ✅ Nouveau (demo rapide)
├── stop-demo.sh                      # ✅ Nouveau (arrêt propre)
├── Dockerfile                        # ✅ Nouveau (multi-stage)
├── .dockerignore                     # ✅ Nouveau (optimisation)
├── DEPLOY_GUIDE.md                   # ✅ Nouveau (guide complet)
├── QUICK_START_DEPLOY.md             # ✅ Nouveau (quick start)
└── DEPLOY_CONFIG_SUMMARY.md          # ✅ Ce fichier
```

---

## ✨ Conclusion

Votre application est **100% prête pour le déploiement** ! 🎉

**3 commandes pour démarrer** :

```bash
# 1. Demo rapide (5 min)
./start-demo-ngrok.sh

# 2. Azure permanent (30 min)
./build-fullstack.sh && az webapp up --name familytree-yourname

# 3. Render auto-deploy (15 min)
git push origin main  # + configuration sur render.com
```

**Choisissez votre option et lancez-vous !** 🚀

---

*Configuration créée le 5 décembre 2025*
