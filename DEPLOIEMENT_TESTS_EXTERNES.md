# 🌐 Déployer l'application pour les tests externes

Ce guide explique comment rendre votre application accessible depuis Internet pour que vos amis puissent la tester.

---

## 📦 Option 1 : Utiliser ngrok (RAPIDE - Recommandé pour tests)

### Installation de ngrok

1. **Télécharger ngrok**
   ```bash
   # Sur macOS avec Homebrew
   brew install ngrok
   
   # Ou télécharger depuis : https://ngrok.com/download
   ```

2. **Créer un compte gratuit**
   - Aller sur : https://dashboard.ngrok.com/signup
   - Récupérer votre token d'authentification

3. **Configurer ngrok**
   ```bash
   ngrok config add-authtoken VOTRE_TOKEN_ICI
   ```

### Lancer ngrok pour le frontend

```bash
# Assurez-vous que votre backend et frontend sont lancés
# Backend : http://localhost:5000
# Frontend : http://localhost:3000

# Dans un nouveau terminal, exposer le frontend
ngrok http 3000
```

### Résultat

Vous obtiendrez une URL publique comme :
```
Forwarding   https://abc123def456.ngrok-free.app -> http://localhost:3000
```

**⚠️ IMPORTANT** : Configurez le CORS backend pour accepter cette URL

#### Mise à jour du CORS backend

Ouvrez `backend/Program.cs` et ajoutez l'URL ngrok :

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "https://abc123def456.ngrok-free.app" // ← Ajoutez votre URL ngrok ici
        )
        .AllowCredentials()
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});
```

**Redémarrez le backend après modification.**

### Partager avec vos amis

Envoyez-leur l'URL ngrok :
```
🌐 Testez l'application : https://abc123def456.ngrok-free.app
```

---

## 🚀 Option 2 : Cloudflare Tunnel (GRATUIT et STABLE)

### Installation de cloudflared

```bash
# Sur macOS
brew install cloudflare/cloudflare/cloudflared

# Ou télécharger depuis : https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### Lancer le tunnel

```bash
# Exposer le frontend
cloudflared tunnel --url http://localhost:3000
```

### Résultat

Vous obtiendrez une URL comme :
```
https://random-name.trycloudflare.com
```

**Avantages** :
- ✅ Gratuit
- ✅ Pas besoin de compte
- ✅ Stable et rapide
- ✅ Tunnel HTTPS automatique

**N'oubliez pas** : Mettez à jour le CORS backend avec la nouvelle URL.

---

## ☁️ Option 3 : Déploiement Cloud (PRODUCTION)

### Frontend : Vercel (Gratuit)

1. **Push votre code sur GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Déployer sur Vercel**
   - Aller sur : https://vercel.com
   - Connecter votre repository GitHub
   - Projet : `frontend/`
   - Framework : React + Vite
   - Build Command : `npm run build`
   - Output Directory : `dist`
   - Variables d'environnement :
     ```
     VITE_API_URL=https://votre-backend-url.com
     ```

3. **Obtenir l'URL**
   - Vercel vous donne une URL : `https://votre-app.vercel.app`

### Backend : Railway / Render / Azure

#### Railway (Recommandé)
1. Aller sur : https://railway.app
2. Connecter GitHub
3. Sélectionner le dossier `backend/`
4. Variables d'environnement :
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ConnectionStrings__DefaultConnection=votre_connection_string
   JWT_SECRET=votre_secret_jwt
   ```

#### Render
1. Aller sur : https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Root Directory : `backend/`
5. Build Command : `dotnet publish -c Release -o out`
6. Start Command : `cd out && dotnet backend.dll`

### Mettre à jour la configuration

**Backend `appsettings.Production.json`** :
```json
{
  "AllowedOrigins": [
    "https://votre-app.vercel.app"
  ],
  "ConnectionStrings": {
    "DefaultConnection": "votre_production_db"
  }
}
```

**Frontend `.env.production`** :
```
VITE_API_URL=https://votre-backend.railway.app
```

---

## 🔒 Sécurité : Configuration CORS complète

### Backend : `Program.cs`

```csharp
// Développement + Production
var allowedOrigins = new List<string>
{
    // Local
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    
    // Tunnels de test
    Environment.GetEnvironmentVariable("NGROK_URL"),
    Environment.GetEnvironmentVariable("CLOUDFLARE_URL"),
    
    // Production
    "https://votre-app.vercel.app",
    "https://kinship-haven.com"
}.Where(url => !string.IsNullOrEmpty(url)).ToList();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowCredentials()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

### Variables d'environnement

```bash
# .env (ne pas commit dans Git)
NGROK_URL=https://abc123.ngrok-free.app
CLOUDFLARE_URL=https://random.trycloudflare.com
```

---

## 📋 Checklist avant de partager

### Backend
- [ ] Backend lancé et accessible
- [ ] CORS configuré avec l'URL publique
- [ ] Base de données fonctionnelle
- [ ] Logs activés pour débogage
- [ ] Variables d'environnement configurées

### Frontend
- [ ] Frontend lancé et accessible
- [ ] API_URL pointe vers le bon backend
- [ ] Pas d'erreurs dans la console
- [ ] i18n fonctionne (FR + EN)
- [ ] Toutes les pages accessibles

### Tunnel/Déploiement
- [ ] URL publique générée
- [ ] URL HTTPS (sécurisée)
- [ ] Tunnel stable et accessible
- [ ] Backend accepte les requêtes depuis l'URL

### Documentation
- [ ] Guide de test préparé
- [ ] URL partagée avec les testeurs
- [ ] Compte de test créé (optionnel)
- [ ] Méthode de feedback définie

---

## 🎯 Script de lancement complet

Créez un script `start-for-testing.sh` :

```bash
#!/bin/bash

echo "🚀 Démarrage de l'application pour tests externes"

# 1. Lancer le backend
echo "📦 Lancement du backend..."
cd backend
dotnet run &
BACKEND_PID=$!
cd ..

# 2. Attendre que le backend soit prêt
sleep 5

# 3. Lancer le frontend
echo "🎨 Lancement du frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# 4. Attendre que le frontend soit prêt
sleep 3

# 5. Lancer ngrok
echo "🌐 Lancement de ngrok..."
ngrok http 3000 &
NGROK_PID=$!

echo "
✅ ================================
✅  TOUS LES SERVICES LANCÉS
✅ ================================

🎯 URLs:
   Local Frontend:  http://localhost:3000
   Local Backend:   http://localhost:5000
   Public URL:      Vérifiez la console ngrok

📝 Prochaines étapes:
   1. Copiez l'URL publique depuis ngrok
   2. Ajoutez-la au CORS backend (Program.cs)
   3. Redémarrez le backend
   4. Partagez l'URL avec vos testeurs

⏹️  Pour arrêter:
   kill $BACKEND_PID $FRONTEND_PID $NGROK_PID
"

# Garder le script actif
wait
```

Rendre le script exécutable :
```bash
chmod +x start-for-testing.sh
./start-for-testing.sh
```

---

## 📧 Message type pour vos testeurs

```
Bonjour [Prénom],

Je travaille sur une application d'arbre généalogique familial et j'aurais besoin 
de ton aide pour la tester ! 🌳

🌐 URL de test : https://[VOTRE_URL].ngrok-free.app

📄 Guide de test : [Lien vers GUIDE_TEST_UTILISATEURS.md]

⏱️ Temps estimé : 15-30 minutes

Ce que je recherche :
- Bugs ou problèmes techniques
- Difficultés d'utilisation
- Suggestions d'amélioration
- Ton avis général sur l'expérience

Tu peux m'envoyer tes retours par :
- Email : [votre@email.com]
- Message : [WhatsApp/Telegram/SMS]
- Ou on en parle de vive voix !

Merci d'avance pour ton aide ! 🙏

[Ton nom]
```

---

## 🐛 Dépannage

### Problème : CORS bloque les requêtes

**Solution** :
1. Vérifiez que l'URL ngrok est bien dans `Program.cs`
2. Redémarrez le backend après modification
3. Videz le cache du navigateur (Ctrl+Shift+R)

### Problème : ngrok session expirée

**Solution** :
- Les tunnels ngrok gratuits expirent après 2h
- Relancez ngrok et partagez la nouvelle URL
- Ou utilisez Cloudflare Tunnel (plus stable)

### Problème : 502 Bad Gateway

**Solution** :
1. Vérifiez que le backend est bien lancé
2. Vérifiez que le port est correct (5000)
3. Vérifiez les logs du backend

### Problème : Frontend ne trouve pas le backend

**Solution** :
1. Ouvrez la console navigateur (F12)
2. Vérifiez l'URL API dans les requêtes
3. Assurez-vous que `VITE_API_URL` est correct
4. Pour ngrok, gardez `/api` dans le frontend (proxy Vite)

---

## 📊 Monitoring pendant les tests

### Surveiller les logs backend
```bash
# Terminal 1 : Backend
cd backend && dotnet run

# Observer les requêtes entrantes
```

### Surveiller les logs frontend
```bash
# Terminal 2 : Frontend
cd frontend && npm run dev

# Observer les erreurs console
```

### Surveiller ngrok
```bash
# Terminal 3 : ngrok
ngrok http 3000

# Interface web : http://localhost:4040
```

---

**Bon courage pour vos tests ! 🚀**

Si vous avez des questions, consultez la documentation ou contactez-moi.
