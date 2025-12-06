# 🚀 ACCÈS RAPIDE DEPUIS VOTRE TÉLÉPHONE

## ✅ Configuration Terminée !

Votre serveur est maintenant configuré pour accepter les connexions depuis votre téléphone.

---

## 📱 ÉTAPES SIMPLES

### 1. Assurez-vous que les serveurs tournent

Les deux tâches doivent être actives :
- ✅ **Backend API** (port 5000)
- ✅ **Frontend Dev Server** (port 3000)

### 2. Connectez votre téléphone au même Wi-Fi que votre Mac

⚠️ **Important :** Votre téléphone et votre Mac doivent être sur le **même réseau Wi-Fi**.

### 3. Ouvrez le navigateur de votre téléphone

Sur votre téléphone (iPhone/Android), ouvrez **Safari** ou **Chrome** et tapez :

```
http://192.168.1.182:3000
```

**C'est tout ! 🎉**

---

## 🔧 Si ça ne marche pas

### Problème : "Site inaccessible"

**Solution 1 : Redémarrer le serveur frontend**

La tâche "Start Frontend Dev Server" doit être redémarrée pour prendre en compte le `--host`.

**Solution 2 : Vérifier le pare-feu**

```bash
# Voir si le pare-feu bloque
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

Si "enabled", désactivez temporairement :
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

### Problème : L'app charge mais les requêtes API échouent

Créez un fichier `.env.local` dans le dossier frontend :

```bash
cd /Users/ducer/Desktop/projet/frontend
echo "VITE_API_BASE_URL=http://192.168.1.182:5000/api" > .env.local
```

Puis redémarrez le serveur frontend.

---

## 📋 Checklist de Test

Une fois l'app accessible :

- [ ] Menu hamburger fonctionne
- [ ] Dashboard s'affiche en 1 colonne
- [ ] Formulaires sont cliquables
- [ ] Navigation entre pages fonctionne
- [ ] Gestes tactiles sur l'arbre (si intégré)

---

## 🎯 Adresses Utiles

| Service | URL Locale | URL Mobile |
|---------|------------|------------|
| Frontend | http://localhost:3000 | http://192.168.1.182:3000 |
| Backend | http://localhost:5000 | http://192.168.1.182:5000 |

---

## 💡 Astuce : QR Code

Pour faciliter l'accès, générez un QR code :

1. Allez sur https://www.qr-code-generator.com
2. Entrez l'URL : `http://192.168.1.182:3000`
3. Scannez avec votre téléphone !

---

**Besoin d'aide ?** Consultez `GUIDE_TEST_MOBILE.md` pour plus de détails ! 📚
