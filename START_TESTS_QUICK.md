# 🎯 DÉMARRAGE RAPIDE - Tests Externes

Guide ultra-rapide pour lancer l'application et inviter des testeurs.

---

## 🚀 Méthode 1 : Script automatique (RECOMMANDÉ)

```bash
# Depuis la racine du projet
./launch-for-testing.sh
```

Ce script va :
1. ✅ Lancer le backend sur http://localhost:5000
2. ✅ Lancer le frontend sur http://localhost:3000
3. ✅ Créer un tunnel ngrok avec URL publique
4. ✅ Afficher l'URL à partager avec vos testeurs

**Après le lancement** :
1. Copiez l'URL publique affichée (ex: https://abc123.ngrok-free.app)
2. Ajoutez-la dans `backend/Program.cs` (section CORS)
3. Redémarrez le backend
4. Partagez l'URL avec vos testeurs !

---

## 🛠️ Méthode 2 : Lancement manuel

### Terminal 1 : Backend
```bash
cd backend
dotnet run
```

### Terminal 2 : Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3 : Ngrok
```bash
ngrok http 3000
```

**Récupérer l'URL** :
- Copiez l'URL "Forwarding" affichée par ngrok
- Ou ouvrez http://localhost:4040 pour voir l'interface

**Configurer CORS** :
Ajoutez l'URL ngrok dans `backend/Program.cs` :
```csharp
policy.WithOrigins(
    "http://localhost:3000",
    "https://votre-url.ngrok-free.app" // ← Votre URL ici
)
```

**Redémarrer le backend** après modification.

---

## 📧 Inviter vos testeurs

### 1. Préparez votre message

Utilisez un template dans `TEMPLATES_MESSAGES_TESTEURS.md` :
- Version courte (SMS/WhatsApp)
- Version email complète
- Version professionnelle
- Version créative
- Version familiale

### 2. Incluez ces informations

```
🌐 URL de test : https://votre-url.ngrok-free.app
📄 Guide de test : [Lien vers GUIDE_TEST_UTILISATEURS.md]
⏱️ Durée : 15-30 minutes
📧 Retour : votre@email.com
📅 Deadline : [Date]
```

### 3. Envoyez !

Copiez-collez le message et envoyez à 5-10 testeurs minimum.

---

## ✅ Checklist avant d'envoyer

- [ ] Backend + Frontend + Ngrok lancés
- [ ] URL publique accessible depuis un navigateur externe
- [ ] CORS configuré avec l'URL ngrok
- [ ] Test d'inscription réussi sur l'URL publique
- [ ] Changement de langue fonctionne (FR ↔️ EN)
- [ ] Message de test préparé
- [ ] Liste de testeurs prête

---

## 📚 Documentation complète

| Fichier | Description |
|---------|-------------|
| **GUIDE_TEST_UTILISATEURS.md** | Guide complet pour vos testeurs |
| **DEPLOIEMENT_TESTS_EXTERNES.md** | Instructions détaillées ngrok/déploiement |
| **TEMPLATES_MESSAGES_TESTEURS.md** | Templates emails/messages prêts à l'emploi |
| **CHECKLIST_PRET_POUR_TESTS.md** | Checklist exhaustive avant lancement |

---

## 🆘 Problèmes fréquents

### "ngrok: command not found"
```bash
# Installer ngrok
brew install ngrok

# Ou télécharger : https://ngrok.com/download
```

### "CORS blocked"
- Vérifiez que l'URL ngrok est dans `Program.cs`
- Redémarrez le backend après modification
- Videz le cache navigateur (Ctrl+Shift+R)

### "Backend ne répond pas"
```bash
# Vérifier que le backend tourne
ps aux | grep dotnet

# Vérifier les logs
tail -f backend.log
```

### "Tunnel ngrok expiré"
Les tunnels gratuits expirent après 2h.
```bash
# Relancer ngrok
ngrok http 3000

# Copier la nouvelle URL
# Mettre à jour CORS + Redémarrer backend
# Envoyer nouvelle URL aux testeurs
```

---

## 🎯 En résumé (30 secondes)

```bash
# 1. Lancer tout
./launch-for-testing.sh

# 2. Copier l'URL affichée

# 3. Ajouter URL dans backend/Program.cs (CORS)

# 4. Redémarrer backend (Ctrl+C puis dotnet run)

# 5. Envoyer URL + Guide aux testeurs

# 6. Surveiller les retours !
```

---

## 📊 Suivi des tests

Créez un tableau pour suivre :

| Testeur | Envoyé le | Testé le | Retour | Priorité |
|---------|-----------|----------|--------|----------|
| Alice | 07/12 | 08/12 | ✅ Bugs trouvés | Haute |
| Bob | 07/12 | - | ⏳ En attente | - |
| Charlie | 07/12 | 07/12 | ✅ Positif | - |

---

## 💡 Conseils

- **5-10 testeurs minimum** : Plus c'est mieux !
- **Mix de profils** : Tech + Non-tech
- **Mix d'appareils** : Desktop + Mobile
- **Soyez disponible** : Répondez vite aux questions
- **Prenez des notes** : Tous les retours sont utiles
- **Remerciez** : Message de remerciement après chaque test

---

## 🎉 C'est parti !

Vous avez tout ce qu'il faut pour lancer vos tests !

**Questions ?** Consultez la documentation complète ci-dessus.

**Bon courage ! 🚀**
