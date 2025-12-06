# 🚀 SETUP NGROK - ÉTAPES RAPIDES

## ✅ Étape 1 : Installation (FAIT ✓)

Ngrok est déjà installé sur votre Mac !

---

## 🔑 Étape 2 : Créer un Compte et Obtenir le Token

### 1. Allez sur cette page :
```
https://dashboard.ngrok.com/signup
```

### 2. Inscrivez-vous (gratuit)
- Utilisez votre email
- OU connectez-vous avec Google/GitHub

### 3. Copiez votre token
Une fois connecté, vous verrez votre **authtoken** sur cette page :36KsGcro1oUAjLo0f4ArZ5EJJA0_3p62ZCows8fWpGZh4stKT
```
https://dashboard.ngrok.com/get-started/your-authtoken
```

Il ressemble à ça :
```
2abc123def456ghi789jkl012mno345pqr678stu901vwx234yz_567890ABCDEFGHIJK
```

### 4. Configurez le token dans votre terminal

Collez cette commande dans votre terminal en **remplaçant VOTRE_TOKEN** :

```bash
ngrok config add-authtoken VOTRE_TOKEN_ICI
```

---

## 🚀 Étape 3 : Lancer les Tunnels

### Dans un NOUVEAU terminal (Terminal 1) :
```bash
ngrok http 3000
```

**Laissez ce terminal ouvert !** Vous verrez une URL comme :
```
https://abc123.ngrok-free.app
```

### Dans un AUTRE nouveau terminal (Terminal 2) :
```bash
ngrok http 5000
```

**Laissez ce terminal ouvert aussi !** Vous verrez une URL comme :
```
https://xyz456.ngrok-free.app
```

---

## ⚙️ Étape 4 : Configurer le Frontend

### Copiez l'URL du backend (port 5000)
```
https://xyz456.ngrok-free.app
```

### Créez le fichier de configuration :
```bash
cd /Users/ducer/Desktop/projet/frontend
echo "VITE_API_BASE_URL=https://xyz456.ngrok-free.app/api" > .env.local
```

**⚠️ Remplacez `xyz456` par VOTRE VRAIE URL !**

### Redémarrez le serveur frontend

Dans VS Code, arrêtez la tâche "Start Frontend Dev Server" (Ctrl+C) puis relancez-la.

OU dans un terminal :
```bash
cd /Users/ducer/Desktop/projet/frontend
npm run dev
```

---

## 🎉 Étape 5 : Partagez l'URL

**Donnez l'URL du FRONTEND (port 3000) à vos amis :**

```
https://abc123.ngrok-free.app
```

Ils peuvent l'ouvrir depuis n'importe où dans le monde ! 🌍

---

## 📊 Résumé Visuel

```
┌──────────────────────────────────────────┐
│  Votre Mac (localhost)                   │
├──────────────────────────────────────────┤
│  Backend  → port 5000                    │
│  Frontend → port 3000                    │
└──────────────────────────────────────────┘
                 ↓
         [Ngrok Tunnels]
                 ↓
┌──────────────────────────────────────────┐
│  Internet Public                         │
├──────────────────────────────────────────┤
│  Backend  → https://xyz456.ngrok-free.app│
│  Frontend → https://abc123.ngrok-free.app│
└──────────────────────────────────────────┘
                 ↓
         [Vos Amis]
    Depuis n'importe où ! 🌍
```

---

## 🐛 Dépannage

### Erreur "authtoken is not configured"
➡️ Vous avez oublié l'Étape 2 ! Configurez votre token.

### Erreur "ERR_NGROK_108"
➡️ Limite gratuite atteinte (8 heures/mois). Attendez demain ou passez à la version payante.

### L'app charge mais erreur API
➡️ Vérifiez que le `.env.local` contient la bonne URL du backend.

### URL "tunnel not found"
➡️ Le tunnel s'est arrêté. Relancez `ngrok http 3000` et `ngrok http 5000`.

---

## 💡 Astuces

### Voir l'activité en temps réel
Ouvrez dans votre navigateur :
```
http://localhost:4040
```

Vous verrez toutes les requêtes HTTP en direct ! 🔍

### Arrêter les tunnels
Faites **Ctrl+C** dans les terminaux où ngrok tourne.

### URLs changent à chaque fois ?
C'est normal avec la version gratuite. Pour des URLs fixes, passez à la version payante ($8/mois).

---

## ✅ Checklist Finale

- [ ] Ngrok installé (FAIT ✓)
- [ ] Compte créé sur ngrok.com
- [ ] Token configuré avec `ngrok config add-authtoken`
- [ ] Tunnel backend lancé (`ngrok http 5000`)
- [ ] Tunnel frontend lancé (`ngrok http 3000`)
- [ ] Fichier `.env.local` créé avec l'URL backend
- [ ] Serveur frontend redémarré
- [ ] URL frontend partagée aux amis

---

**Prêt à partager votre app avec vos amis ! 🎉**
