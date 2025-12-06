# 📱 Guide - Tester l'Application sur Votre Téléphone

## 🎯 Méthode Recommandée (Réseau Local)

### Prérequis
- ✅ Votre ordinateur et téléphone doivent être sur le **même réseau Wi-Fi**
- ✅ Le serveur frontend et backend doivent être en cours d'exécution

---

## 📋 Étapes Détaillées

### 1️⃣ Trouver l'Adresse IP de Votre Mac

Ouvrez un terminal et tapez :

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Ou plus simplement :

```bash
ipconfig getifaddr en0
```

Vous obtiendrez quelque chose comme :
```
192.168.1.45
```

💡 **Note :** Notez cette adresse IP, vous en aurez besoin !

---

### 2️⃣ Configurer Vite pour Accepter les Connexions Externes

Le serveur Vite écoute actuellement uniquement sur `localhost`. Il faut le configurer pour accepter les connexions depuis d'autres appareils.

**Option A : Modifier temporairement le package.json**

```bash
cd /Users/ducer/Desktop/projet/frontend
```

Éditez `package.json` et changez :

```json
"dev": "vite"
```

En :

```json
"dev": "vite --host"
```

Puis redémarrez le serveur frontend :

```bash
npm run dev
```

**Option B : Lancer directement avec --host**

Arrêtez le serveur actuel (Ctrl+C dans le terminal) et relancez :

```bash
cd /Users/ducer/Desktop/projet/frontend
npm run dev -- --host
```

---

### 3️⃣ Vérifier que le Serveur Backend est Accessible

Le backend ASP.NET Core doit également écouter sur toutes les interfaces. Vérifiez dans :

`backend/Properties/launchSettings.json`

Que l'URL contient `0.0.0.0` ou `*` :

```json
"applicationUrl": "http://0.0.0.0:5000"
```

Ou ajoutez dans `Program.cs` :

```csharp
builder.WebHost.UseUrls("http://0.0.0.0:5000");
```

---

### 4️⃣ Accéder depuis Votre Téléphone

Sur votre téléphone (iPhone ou Android), ouvrez le navigateur (Safari, Chrome) et tapez :

```
http://192.168.1.45:5173
```

Remplacez `192.168.1.45` par **votre adresse IP** trouvée à l'étape 1.

Le port `5173` est le port par défaut de Vite.

---

## 🚨 Problèmes Courants et Solutions

### ❌ "Site inaccessible" ou "ERR_CONNECTION_REFUSED"

**Solution 1 : Vérifier le pare-feu Mac**

```bash
# Désactiver temporairement le pare-feu
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# Réactiver après les tests
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

Ou via l'interface :
1. Préférences Système → Sécurité et confidentialité
2. Pare-feu → Options
3. Autoriser temporairement les connexions entrantes

**Solution 2 : Vérifier que Vite écoute sur toutes les interfaces**

Dans le terminal où tourne le frontend, vous devriez voir :

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.45:5173/    ← Cette ligne doit être présente !
```

---

### ❌ L'App se Charge Mais les Requêtes API Échouent

**Problème :** Le frontend charge mais les appels API ne fonctionnent pas.

**Solution :** Modifier la configuration de l'API dans le frontend.

Éditez `frontend/src/services/api.ts` :

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.45:5000/api';
```

Remplacez par votre IP locale.

Ou créez un fichier `.env.local` :

```bash
cd /Users/ducer/Desktop/projet/frontend
nano .env.local
```

Ajoutez :

```
VITE_API_BASE_URL=http://192.168.1.45:5000/api
```

Redémarrez le serveur frontend.

---

### ❌ Erreur CORS (Cross-Origin)

**Solution :** Configurer CORS dans le backend.

Éditez `backend/Program.cs` :

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Plus bas dans le fichier, avant app.Run()
app.UseCors("AllowAll");
```

---

## 📱 Méthode Alternative : Tunneling (ngrok)

Si vous n'êtes pas sur le même réseau Wi-Fi, utilisez **ngrok** pour créer un tunnel public.

### Installation

```bash
brew install ngrok
```

### Utilisation

```bash
# Tunnel pour le frontend
ngrok http 5173
```

Vous obtiendrez une URL publique comme :
```
https://abc123.ngrok.io
```

Partagez cette URL et accédez-y depuis n'importe quel appareil !

---

## 🧪 Checklist de Test sur Mobile

Une fois l'application accessible :

### Navigation
- [ ] Menu hamburger s'affiche et fonctionne
- [ ] Toutes les pages sont accessibles
- [ ] Pas de défilement horizontal

### Dashboard
- [ ] Grille empilée en 1 colonne
- [ ] Cards lisibles et cliquables
- [ ] Stats s'affichent correctement

### Formulaires (EditMember)
- [ ] Champs empilés verticalement
- [ ] Boutons cliquables avec le pouce
- [ ] Clavier mobile ne cache pas les champs

### Arbre Généalogique (avec ResponsiveTreeWrapper)
- [ ] Pan (déplacement 1 doigt) fonctionne
- [ ] Pinch-to-zoom (2 doigts) fonctionne
- [ ] Boutons +/- cliquables
- [ ] Double-tap recentre la vue
- [ ] Aide tactile visible en bas

---

## 🎥 Outils de Debug sur Mobile

### iPhone (Safari)

1. Activez le mode développeur sur iPhone :
   - Réglages → Safari → Avancé → Inspecteur web

2. Sur Mac, ouvrez Safari :
   - Développement → [Votre iPhone] → [Votre page]

### Android (Chrome)

1. Activez le mode développeur sur Android
2. Sur Mac, ouvrez Chrome :
   - `chrome://inspect`
   - Connectez votre téléphone par USB
   - Sélectionnez votre page

---

## ⚡ Commande Rapide (Tout-en-Un)

Pour lancer les serveurs avec accès réseau :

**Terminal 1 (Backend) :**
```bash
cd /Users/ducer/Desktop/projet/backend
dotnet run --urls "http://0.0.0.0:5000"
```

**Terminal 2 (Frontend) :**
```bash
cd /Users/ducer/Desktop/projet/frontend
npm run dev -- --host
```

Puis accédez depuis votre téléphone à :
```
http://[VOTRE_IP]:5173
```

---

## 🔒 Sécurité

⚠️ **Important :** Ne laissez pas les serveurs configurés avec `0.0.0.0` en production !

Cette configuration est **uniquement pour les tests locaux**.

Pour la production, utilisez :
- HTTPS avec certificat SSL
- Authentification appropriée
- Configuration CORS stricte

---

## 📞 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Vérifiez que les deux appareils sont sur le même Wi-Fi
2. Vérifiez le pare-feu Mac
3. Consultez les logs des serveurs
4. Testez d'abord avec `curl` depuis le terminal :

```bash
curl http://192.168.1.45:5173
```

Si curl fonctionne, le problème vient du téléphone ou du réseau.

---

**Bonne chance pour vos tests ! 🚀📱**
