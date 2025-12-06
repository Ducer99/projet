# 🚀 Configuration Google OAuth - Guide Rapide

**Date** : 4 Décembre 2025  
**Durée** : 10 minutes

---

## ✅ **Checklist de Configuration**

### Phase 1 : Google Cloud Console

- [ ] **Étape 1** : Ouvrir [Google Cloud Console](https://console.cloud.google.com/)
- [ ] **Étape 2** : Créer projet "Kinship Haven"
- [ ] **Étape 3** : Configurer l'écran de consentement OAuth
  - [ ] Type : Externe
  - [ ] Nom : Kinship Haven
  - [ ] Email d'assistance : Votre email
  - [ ] Champs d'application : email, profile, openid
  - [ ] Utilisateurs test : Votre email
- [ ] **Étape 4** : Créer ID Client OAuth
  - [ ] Type : Application Web
  - [ ] Nom : Kinship Haven Web Client
  - [ ] Origines autorisées : `http://localhost:3000`
  - [ ] URI de redirection : `http://localhost:3000`
- [ ] **Étape 5** : Copier le Client ID

### Phase 2 : Configuration Locale

- [ ] **Étape 6** : Éditer `frontend/.env.local`
- [ ] **Étape 7** : Remplacer `YOUR_GOOGLE_CLIENT_ID` par votre vrai Client ID
- [ ] **Étape 8** : Redémarrer le serveur frontend

### Phase 3 : Test

- [ ] **Étape 9** : Ouvrir http://localhost:3000/login
- [ ] **Étape 10** : Cliquer sur "Continuer avec Google"
- [ ] **Étape 11** : Vérifier la popup Google
- [ ] **Étape 12** : Tester le flux complet

---

## 📋 **Instructions Pas à Pas**

### 1️⃣ **Accéder à Google Cloud Console**

Ouvrez dans votre navigateur :
```
https://console.cloud.google.com/
```

> 💡 **Astuce** : Le Simple Browser VS Code a déjà ouvert cette page pour vous !

---

### 2️⃣ **Créer le Projet**

**Dans la Google Cloud Console :**

1. Cliquez sur le **menu déroulant** en haut (à côté de "Google Cloud")
2. Cliquez sur **"NOUVEAU PROJET"**
3. Entrez :
   - **Nom** : `Kinship Haven`
4. Cliquez sur **"CRÉER"**
5. ⏳ Attendez ~10 secondes

**Screenshot de référence :**
```
┌─────────────────────────────────────┐
│ Google Cloud                     ▼  │
├─────────────────────────────────────┤
│ Sélectionner un projet              │
│ ► NOUVEAU PROJET                    │ ← Cliquez ici
│   Mon Projet                        │
│   Autre projet                      │
└─────────────────────────────────────┘
```

---

### 3️⃣ **Configurer l'Écran de Consentement**

**Navigation :**
```
Menu ☰ → APIs et services → Écran de consentement OAuth
```

**Configuration :**

**Page 1 - Type d'utilisateur**
- ✅ Sélectionnez **"Externe"**
- Cliquez sur **"CRÉER"**

**Page 2 - Informations sur l'application**
```
┌─────────────────────────────────────────┐
│ Nom de l'application *                  │
│ ┌─────────────────────────────────────┐ │
│ │ Kinship Haven                       │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ E-mail d'assistance utilisateur *        │
│ ┌─────────────────────────────────────┐ │
│ │ votre-email@gmail.com               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```
- Remplissez le formulaire
- Cliquez sur **"ENREGISTRER ET CONTINUER"**

**Page 3 - Champs d'application**
- Cliquez sur **"AJOUTER OU SUPPRIMER DES CHAMPS D'APPLICATION"**
- Cochez les 3 champs suivants :
  ```
  ✅ ../auth/userinfo.email
  ✅ ../auth/userinfo.profile
  ✅ openid
  ```
- Cliquez sur **"METTRE À JOUR"**
- Cliquez sur **"ENREGISTRER ET CONTINUER"**

**Page 4 - Utilisateurs test**
- Cliquez sur **"+ AJOUTER DES UTILISATEURS"**
- Entrez votre email Gmail
- Cliquez sur **"AJOUTER"**
- Cliquez sur **"ENREGISTRER ET CONTINUER"**

**Page 5 - Résumé**
- Vérifiez les informations
- Cliquez sur **"REVENIR AU TABLEAU DE BORD"**

---

### 4️⃣ **Créer l'ID Client OAuth**

**Navigation :**
```
Menu ☰ → APIs et services → Identifiants
```

**Création :**

1. Cliquez sur **"+ CRÉER DES IDENTIFIANTS"** (bouton bleu en haut)
2. Sélectionnez **"ID client OAuth"**

**Formulaire :**
```
┌─────────────────────────────────────────────┐
│ Type d'application *                         │
│ ┌─────────────────────────────────────────┐ │
│ │ Application Web                      ▼  │ │ ← Sélectionnez
│ └─────────────────────────────────────────┘ │
│                                              │
│ Nom *                                        │
│ ┌─────────────────────────────────────────┐ │
│ │ Kinship Haven Web Client                │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Origines JavaScript autorisées               │
│ ┌─────────────────────────────────────────┐ │
│ │ + AJOUTER UNE URI                       │ │
│ └─────────────────────────────────────────┘ │
│ URI 1:                                       │
│ ┌─────────────────────────────────────────┐ │
│ │ http://localhost:3000                   │ │ ← Ajoutez ceci
│ └─────────────────────────────────────────┘ │
│                                              │
│ URI de redirection autorisés                 │
│ ┌─────────────────────────────────────────┐ │
│ │ + AJOUTER UNE URI                       │ │
│ └─────────────────────────────────────────┘ │
│ URI 1:                                       │
│ ┌─────────────────────────────────────────┐ │
│ │ http://localhost:3000                   │ │ ← Ajoutez ceci
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

         [CRÉER]  [ANNULER]
```

3. Cliquez sur **"CRÉER"**

---

### 5️⃣ **Récupérer le Client ID**

Une popup apparaîtra :

```
┌──────────────────────────────────────────────┐
│ Client OAuth créé                             │
├──────────────────────────────────────────────┤
│                                               │
│ Votre ID client :                             │
│ ┌──────────────────────────────────────────┐ │
│ │ 123456789-abcdef...xyz.apps.google... │ 📋│ │ ← COPIEZ CECI
│ └──────────────────────────────────────────┘ │
│                                               │
│ Code secret du client :                       │
│ ┌──────────────────────────────────────────┐ │
│ │ GOCSPX-abc...xyz                       │ 📋│ │ ← Pas nécessaire
│ └──────────────────────────────────────────┘ │
│                                               │
│           [OK]  [TÉLÉCHARGER JSON]            │
└──────────────────────────────────────────────┘
```

**IMPORTANT** : 
- ✅ **Copiez l'ID client** (la longue chaîne qui finit par `.apps.googleusercontent.com`)
- ❌ Ignorez le "Code secret" (pas utilisé dans notre implémentation)

---

## 6️⃣ **Configuration dans Votre Application**

### Étape A : Éditer `.env.local`

**Fichier** : `frontend/.env.local`

**Avant** :
```bash
VITE_API_BASE_URL=https://...trycloudflare.com/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

**Après** (remplacez par votre vrai Client ID) :
```bash
VITE_API_BASE_URL=https://...trycloudflare.com/api
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

> 💡 **Le fichier est déjà créé !** Il suffit de remplacer `YOUR_GOOGLE_CLIENT_ID` par votre vrai ID.

---

### Étape B : Redémarrer le Frontend

Le serveur frontend doit redémarrer pour prendre en compte la nouvelle variable d'environnement.

**Dans VS Code** :
1. Allez dans l'onglet **"Terminal"**
2. Trouvez le terminal **"Start Frontend Dev Server"**
3. Appuyez sur **Ctrl+C** pour arrêter
4. Relancez : `npm run dev`

**OU utilisez cette commande** :
```bash
cd frontend && npm run dev
```

---

## 7️⃣ **Test Complet**

### Test 1 : Vérifier le Bouton Google

1. Ouvrez http://localhost:3000/login
2. Vous devriez voir le **vrai bouton Google** (avec le logo officiel)
3. ✅ Si vous voyez le bouton → Configuration réussie !
4. ❌ Si vous voyez une erreur → Vérifiez le Client ID

### Test 2 : Tester le Flux Complet

1. Cliquez sur **"Continuer avec Google"**
2. Une popup Google devrait s'ouvrir
3. Sélectionnez votre compte Google
4. Google vous demandera d'autoriser "Kinship Haven"
5. Cliquez sur **"Autoriser"**
6. Vous devriez être redirigé vers `/join-or-create-family`

### Test 3 : Vérifier la Base de Données

```sql
-- Vérifier que le compte a bien été créé
SELECT "Email", "UserName", "IsActive", "EmailVerified", "FamilyID"
FROM "Connexion"
WHERE "Email" = 'votre-email@gmail.com';

-- Résultat attendu:
-- IsActive: t
-- EmailVerified: t
-- FamilyID: (null) <- Normal, vous devez créer/rejoindre une famille
```

---

## 🐛 **Troubleshooting**

### Problème 1 : "Invalid Client ID"

**Symptôme** : Message d'erreur au chargement de la page

**Causes possibles** :
- Client ID mal copié (espaces, caractères manquants)
- Frontend pas redémarré après modification `.env.local`

**Solution** :
1. Vérifiez que le Client ID se termine par `.apps.googleusercontent.com`
2. Vérifiez qu'il n'y a pas d'espaces avant/après
3. Redémarrez le frontend : `Ctrl+C` puis `npm run dev`

---

### Problème 2 : "redirect_uri_mismatch"

**Symptôme** : Erreur après avoir cliqué sur le bouton Google

**Cause** : L'URI `http://localhost:3000` n'est pas autorisée dans Google Console

**Solution** :
1. Retournez sur Google Cloud Console
2. Allez à **APIs et services → Identifiants**
3. Cliquez sur votre **Client OAuth**
4. Ajoutez `http://localhost:3000` dans **"Origines JavaScript autorisées"**
5. Ajoutez `http://localhost:3000` dans **"URI de redirection autorisés"**
6. Cliquez sur **"ENREGISTRER"**
7. ⏳ Attendez 5 minutes (propagation)

---

### Problème 3 : "popup_closed_by_user"

**Symptôme** : Message d'erreur si vous fermez la popup Google

**Cause** : Comportement normal, l'utilisateur a annulé

**Solution** : Aucune action requise, c'est géré automatiquement

---

### Problème 4 : Cookies Bloqués

**Symptôme** : "idpiframe_initialization_failed"

**Cause** : Le navigateur bloque les cookies tiers

**Solution** :
1. **Option 1** : Testez en navigation privée
2. **Option 2** : Désactivez temporairement le blocage des cookies
3. **Option 3** : Utilisez Chrome/Edge (meilleure compatibilité)

---

## 📊 **Checklist Finale**

Avant de tester, vérifiez que **TOUT** est coché :

### Configuration Google Cloud Console
- [ ] Projet "Kinship Haven" créé
- [ ] Écran de consentement OAuth configuré (Type: Externe)
- [ ] Champs d'application ajoutés (email, profile, openid)
- [ ] Utilisateur test ajouté (votre email)
- [ ] ID Client OAuth créé (Type: Application Web)
- [ ] Origine autorisée : `http://localhost:3000`
- [ ] URI de redirection : `http://localhost:3000`
- [ ] Client ID copié

### Configuration Locale
- [ ] Fichier `frontend/.env.local` édité
- [ ] Variable `VITE_GOOGLE_CLIENT_ID` remplacée par le vrai Client ID
- [ ] Pas d'espaces avant/après le Client ID
- [ ] Client ID se termine par `.apps.googleusercontent.com`
- [ ] Frontend redémarré (`npm run dev`)

### Test
- [ ] Page http://localhost:3000/login ouverte
- [ ] Bouton Google affiché (logo officiel)
- [ ] Popup Google s'ouvre au clic
- [ ] Compte Google sélectionnable
- [ ] Autorisation "Kinship Haven" demandée
- [ ] Redirection vers `/join-or-create-family`
- [ ] Possibilité de créer/rejoindre une famille

---

## 🎉 **Succès !**

Si tous les tests passent, félicitations ! 🚀

Vous avez maintenant une **vraie intégration Google OAuth** fonctionnelle :
- ✅ Validation sécurisée des tokens
- ✅ Auto-création des comptes
- ✅ Smart Redirect Flow
- ✅ Popup Google officielle
- ✅ Multi-compte supporté

---

## 📚 **Ressources Supplémentaires**

### Documentation Google
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Sign-In JavaScript Library](https://developers.google.com/identity/gsi/web/guides/overview)

### Documentation Projet
- `GOOGLE_OAUTH_PRODUCTION_COMPLETE.md` - Guide complet (20,000 lignes)
- `SMART_REDIRECT_FLOW_SUCCESS.md` - Smart Redirect Flow
- `BUGFIX_GOOGLE_OAUTH_COMPTE_NON_ACTIVE.md` - Bugfix activation

### Support
Si vous rencontrez des problèmes :
1. Consultez la section Troubleshooting ci-dessus
2. Vérifiez les logs backend (terminal "Start Backend API")
3. Vérifiez les logs frontend (console navigateur F12)
4. Relisez `GOOGLE_OAUTH_PRODUCTION_COMPLETE.md`

---

**Bonne configuration !** 🔐✨

**Next Step** : Une fois le Client ID configuré, testez le flux complet !
