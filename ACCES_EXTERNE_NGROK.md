# 🌐 ACCÈS EXTERNE AVEC NGROK

## 🎯 Objectif

Permettre à quelqu'un **sur un autre réseau** (autre Wi-Fi, 4G, autre pays) d'accéder à votre application Family Tree.

---

## 🚀 Solution : Ngrok (Recommandée)

Ngrok crée un **tunnel sécurisé** qui expose votre serveur local sur Internet avec une URL publique.

---

## 📥 Installation

### 1. Installer Ngrok

```bash
# Via Homebrew (Mac)
brew install ngrok
```

**OU** téléchargez depuis : https://ngrok.com/download

### 2. Créer un Compte (Gratuit)

1. Allez sur https://ngrok.com/signup
2. Créez un compte gratuit
3. Copiez votre **authtoken**

### 3. Configurer l'Authtoken

```bash
ngrok config add-authtoken VOTRE_TOKEN_ICI
```

---

## 🎯 Utilisation

### Étape 1 : Démarrer vos serveurs locaux

Assurez-vous que vos serveurs tournent :

```bash
# Backend sur port 5000
# Frontend sur port 3000
```

### Étape 2 : Créer le tunnel Ngrok

**Pour le Frontend :**

```bash
ngrok http 3000
```

Vous obtiendrez une URL comme :
```
https://abc123.ngrok-free.app
```

**Pour le Backend (dans un autre terminal) :**

```bash
ngrok http 5000
```

Vous obtiendrez une URL comme :
```
https://xyz456.ngrok-free.app
```

---

## ⚙️ Configuration de l'Application

### 1. Modifier l'URL de l'API

Créez un fichier `.env.local` dans le frontend :

```bash
cd /Users/ducer/Desktop/projet/frontend
nano .env.local
```

Ajoutez :
```env
VITE_API_BASE_URL=https://xyz456.ngrok-free.app/api
```

### 2. Redémarrer le serveur frontend

Arrêtez (Ctrl+C) et relancez :
```bash
npm run dev
```

---

## 📱 Partager l'Accès

### Donnez l'URL Frontend à votre contact :

```
https://abc123.ngrok-free.app
```

**C'est tout !** Ils peuvent accéder depuis n'importe où dans le monde 🌍

---

## 🔒 Sécurité

### ⚠️ Version Gratuite

- ✅ HTTPS automatique (sécurisé)
- ⚠️ URL change à chaque redémarrage
- ⚠️ Bannière "ngrok-free" en haut de page
- ⚠️ Limite de connexions simultanées

### 💰 Version Payante ($8/mois)

- ✅ URL personnalisée fixe
- ✅ Pas de bannière
- ✅ Plus de connexions simultanées
- ✅ Meilleure performance

---

## 📊 Exemple Complet

### Terminal 1 : Backend
```bash
cd /Users/ducer/Desktop/projet/backend
dotnet run
```

### Terminal 2 : Frontend
```bash
cd /Users/ducer/Desktop/projet/frontend
npm run dev
```

### Terminal 3 : Ngrok Backend
```bash
ngrok http 5000
# Notez l'URL : https://xyz456.ngrok-free.app
```

### Terminal 4 : Ngrok Frontend
```bash
ngrok http 3000
# Notez l'URL : https://abc123.ngrok-free.app
```

### Terminal 5 : Configuration
```bash
cd /Users/ducer/Desktop/projet/frontend
echo "VITE_API_BASE_URL=https://xyz456.ngrok-free.app/api" > .env.local
# Redémarrer npm run dev (Terminal 2)
```

---

## 🎯 Résultat

**Partagez cette URL :**
```
https://abc123.ngrok-free.app
```

Votre contact peut accéder depuis :
- ✅ Son téléphone (4G/5G)
- ✅ Son ordinateur (autre Wi-Fi)
- ✅ N'importe où dans le monde

---

## 🐛 Dépannage

### Erreur "tunnel not found"
```bash
# Vérifier l'authtoken
ngrok config check
```

### Erreur API CORS
Ajoutez dans `backend/Program.cs` :
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Après builder.Build()
app.UseCors("AllowAll");
```

### URL change à chaque fois
➡️ Passez à la version payante pour une URL fixe

---

## 🔗 Liens Utiles

- **Site Ngrok** : https://ngrok.com
- **Documentation** : https://ngrok.com/docs
- **Pricing** : https://ngrok.com/pricing
- **Dashboard** : https://dashboard.ngrok.com

---

## ⚡ Alternative : Ngrok avec Docker (Avancé)

```bash
docker run -it -e NGROK_AUTHTOKEN=VOTRE_TOKEN \
  ngrok/ngrok http host.docker.internal:3000
```

---

**Prêt à partager votre application avec le monde ! 🌍✨**
