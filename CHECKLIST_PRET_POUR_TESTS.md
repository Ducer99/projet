# ✅ CHECK-LIST FINALE : Prêt pour les tests externes

Cette checklist vous assure que tout est prêt avant d'inviter vos testeurs.

---

## 🎯 Étape 1 : Vérifications techniques

### Backend
- [ ] Le backend démarre sans erreur : `cd backend && dotnet run`
- [ ] Le backend répond sur http://localhost:5000
- [ ] La base de données est accessible
- [ ] Les migrations sont à jour
- [ ] Les logs s'affichent correctement dans la console
- [ ] Aucune erreur critique dans les logs

### Frontend  
- [ ] Le frontend démarre sans erreur : `cd frontend && npm run dev`
- [ ] Le frontend répond sur http://localhost:3000
- [ ] Aucune erreur dans la console navigateur (F12)
- [ ] Toutes les pages sont accessibles
- [ ] Les images/assets se chargent correctement

### Base de données
- [ ] PostgreSQL est lancé
- [ ] Les tables sont créées
- [ ] Des données de test existent (optionnel)
- [ ] Connection string correct dans appsettings.json

---

## 🌐 Étape 2 : Exposition publique (ngrok ou autre)

### Installation
- [ ] ngrok installé : `brew install ngrok` ou `npm install -g ngrok`
- [ ] Compte ngrok créé (gratuit) : https://ngrok.com
- [ ] Token d'authentification configuré : `ngrok config add-authtoken VOTRE_TOKEN`

### Lancement du tunnel
- [ ] Tunnel ngrok lancé : `ngrok http 3000`
- [ ] URL publique obtenue (ex: https://abc123.ngrok-free.app)
- [ ] URL accessible depuis un navigateur externe
- [ ] Page d'accueil se charge correctement

### Configuration CORS
- [ ] URL ngrok ajoutée dans `backend/Program.cs` :
  ```csharp
  policy.WithOrigins(
      "http://localhost:3000",
      "https://abc123.ngrok-free.app" // ← Votre URL ngrok
  )
  ```
- [ ] Backend redémarré après modification CORS
- [ ] Test de connexion frontend → backend réussi
- [ ] Pas d'erreur CORS dans la console navigateur

---

## 🧪 Étape 3 : Tests de bout en bout

### Test 1 : Inscription
- [ ] Page /register accessible
- [ ] Formulaire Step 1 fonctionne (email + password)
- [ ] Formulaire Step 2 fonctionne (profil 11 champs)
- [ ] Formulaire Step 3 fonctionne (créer famille)
- [ ] Soumission réussie → redirection vers /dashboard
- [ ] Token JWT reçu et stocké
- [ ] Utilisateur authentifié

### Test 2 : Connexion
- [ ] Page /login accessible
- [ ] Connexion avec compte créé fonctionne
- [ ] Redirection vers /dashboard après login
- [ ] Session maintenue après rafraîchissement

### Test 3 : Dashboard
- [ ] Dashboard s'affiche correctement
- [ ] Statistiques visibles
- [ ] Code d'invitation visible (si admin)
- [ ] Boutons d'action fonctionnels
- [ ] Membres récents affichés

### Test 4 : Changement de langue
- [ ] Sélecteur de langue visible
- [ ] Changement FR → EN fonctionne
- [ ] Tous les textes changent de langue
- [ ] Pas de mélange français/anglais
- [ ] Préférence sauvegardée après refresh

### Test 5 : Ajouter un membre
- [ ] Page accessible
- [ ] Formulaire d'ajout fonctionne
- [ ] Membre ajouté apparaît dans la liste
- [ ] Permissions correctes (badge Créateur)

### Test 6 : Arbre généalogique
- [ ] Page /family-tree-dynamic accessible
- [ ] Arbre s'affiche correctement
- [ ] Zoom/dézoom fonctionne
- [ ] Déplacement de la vue fonctionne
- [ ] Clic sur membre affiche détails

---

## 📝 Étape 4 : Documentation prête

### Fichiers créés
- [ ] **GUIDE_TEST_UTILISATEURS.md** : Guide complet pour testeurs ✅
- [ ] **DEPLOIEMENT_TESTS_EXTERNES.md** : Instructions ngrok/déploiement ✅
- [ ] **TEMPLATES_MESSAGES_TESTEURS.md** : Templates d'emails/messages ✅

### Contenu vérifié
- [ ] URL publique ajoutée dans tous les documents
- [ ] Votre email/contact ajouté partout où nécessaire
- [ ] Date limite de retour indiquée
- [ ] Instructions claires et complètes

---

## 📧 Étape 5 : Communication préparée

### Message de test choisi
- [ ] Template sélectionné (SMS/Email/Formel/Créatif)
- [ ] Message personnalisé avec vos infos
- [ ] URL publique insérée
- [ ] Lien vers guide de test ajouté
- [ ] Date limite de retour précisée

### Liste de testeurs
- [ ] 5-10 testeurs identifiés minimum
- [ ] Mix de profils : tech + non-tech
- [ ] Mix d'appareils : desktop + mobile
- [ ] Contacts récupérés (email/tél)

### Méthode de feedback
- [ ] Email de retour défini
- [ ] Formulaire en ligne créé (optionnel)
- [ ] Google Form / Typeform / Autre
- [ ] Ou retour par message direct

---

## 🔒 Étape 6 : Sécurité et confidentialité

### Données de test
- [ ] Données sensibles supprimées de la base
- [ ] Pas de vraies données personnelles exposées
- [ ] Variables d'environnement sécurisées
- [ ] Secrets (JWT, DB) non exposés dans le code

### Limitations connues
- [ ] Liste des bugs connus établie
- [ ] Limitations techniques documentées
- [ ] Fonctionnalités non implémentées listées
- [ ] Avertissement si tunnel expire (ngrok 2h)

---

## 📊 Étape 7 : Monitoring et suivi

### Logs activés
- [ ] Logs backend visibles dans console
- [ ] Logs frontend visibles dans console navigateur
- [ ] Logs ngrok accessibles (http://localhost:4040)

### Suivi des testeurs
- [ ] Tableau de suivi créé (Excel/Notion/Google Sheets)
- [ ] Colonnes : Nom, Email, Date envoi, Date test, Retour reçu
- [ ] Rappels prévus si pas de retour après X jours

### Disponibilité
- [ ] Vous êtes disponible pour questions/support
- [ ] Numéro de téléphone/Discord/Slack partagé
- [ ] Réactivité assurée pendant la période de test

---

## 🚀 Étape 8 : Lancement !

### Envoi des invitations
- [ ] Messages envoyés aux testeurs
- [ ] Confirmations de réception vérifiées
- [ ] Relance planifiée (si pas de retour après 3 jours)

### Surveillance active
- [ ] Backend lancé et stable
- [ ] Frontend lancé et stable
- [ ] Tunnel ngrok actif
- [ ] Logs surveillés en temps réel
- [ ] Réponse rapide aux questions testeurs

---

## ⚠️ Checklist de sécurité AVANT de partager

### À NE PAS exposer publiquement
- [ ] Pas de vrais emails/mots de passe en clair
- [ ] Pas de tokens/secrets dans le code
- [ ] Pas de données personnelles sensibles
- [ ] Pas de fichiers .env commités dans Git

### À vérifier
- [ ] CORS restreint aux bonnes URLs
- [ ] Rate limiting activé (éviter spam)
- [ ] Validation des entrées côté backend
- [ ] Protection CSRF activée
- [ ] HTTPS activé (via ngrok)

---

## 🎯 Critères de succès

Votre session de test est réussie si :

- [ ] **5+ testeurs** ont essayé l'application
- [ ] **Mix de retours** : positifs + négatifs + suggestions
- [ ] **Bugs critiques identifiés** et documentés
- [ ] **Problèmes UX** remontés et compris
- [ ] **Suggestions d'amélioration** reçues
- [ ] **Retour général positif** (> 3/5 étoiles)

---

## 📈 Après les tests : Actions à prendre

### Analyse des retours
- [ ] Compiler tous les retours dans un document
- [ ] Prioriser les bugs : Critique > Important > Mineur
- [ ] Identifier les tendances UX communes
- [ ] Lister les suggestions par fréquence

### Corrections
- [ ] Corriger les bugs critiques en priorité
- [ ] Améliorer l'UX selon retours
- [ ] Implémenter suggestions pertinentes
- [ ] Re-tester après corrections

### Remerciements
- [ ] Envoyer message de remerciement à TOUS
- [ ] Mentionner testeurs dans crédits (si accord)
- [ ] Partager résumé des améliorations apportées
- [ ] Inviter à une 2ème session si nécessaire

---

## 🎉 RÉCAPITULATIF FINAL

### En 5 minutes avant de partager :

```bash
# 1. Vérifier que tout tourne
cd backend && dotnet run         # Terminal 1
cd frontend && npm run dev       # Terminal 2
ngrok http 3000                  # Terminal 3

# 2. Tester l'URL publique
# Ouvrir https://votre-url.ngrok-free.app dans un navigateur

# 3. Vérifier l'inscription
# Créer un compte de test complet

# 4. Vérifier le Dashboard
# Toutes les sections s'affichent

# 5. Vérifier le changement de langue
# FR → EN → FR sans bug

# 6. Envoyer les invitations !
# Copier l'URL + Envoyer messages
```

---

## ✅ VOUS ÊTES PRÊT SI...

- ✅ Tous les tests de bout en bout passent
- ✅ L'URL publique est accessible et stable
- ✅ Le CORS accepte les requêtes depuis l'URL publique
- ✅ La documentation est prête et partageable
- ✅ Les messages de test sont préparés
- ✅ Vous êtes disponible pour le support

---

## 🆘 Aide rapide en cas de problème

### Problème : Tunnel ngrok expire
**Solution** : Relancer ngrok, copier nouvelle URL, mettre à jour CORS, envoyer nouvelle URL aux testeurs

### Problème : CORS bloque les requêtes
**Solution** : Vérifier Program.cs, redémarrer backend, vider cache navigateur (Ctrl+Shift+R)

### Problème : Backend plante
**Solution** : Vérifier logs console, vérifier DB connexion, redémarrer backend

### Problème : Frontend ne charge pas
**Solution** : Vérifier console F12, vérifier que backend répond, vider cache

---

**🎊 Tout est prêt ? Alors c'est parti pour les tests ! 🚀**

Bonne chance ! Et n'oubliez pas : chaque bug trouvé est une victoire ! 🐛✅
