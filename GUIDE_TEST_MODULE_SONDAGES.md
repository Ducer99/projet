# 🧪 GUIDE DE TEST - MODULE SONDAGES

**Date :** 14 novembre 2025  
**Version :** 1.0

---

## 📋 Prérequis

### ✅ Serveurs en cours d'exécution :
- **Backend** : http://localhost:5000 🟢
- **Frontend** : http://localhost:3000 🟢

### ✅ Compte utilisateur :
- Email et mot de passe valides
- Membre d'une famille

---

## 🧪 Plan de Test Complet

### ÉTAPE 1 : Connexion et Navigation

#### Test 1.1 : Connexion
1. Aller sur http://localhost:3000
2. Se connecter avec vos identifiants
3. Vérifier que vous êtes redirigé vers le Dashboard

**Résultat attendu :** ✅ Dashboard affiché avec statistiques

---

#### Test 1.2 : Navigation vers Sondages depuis Dashboard
1. Sur le Dashboard, localiser la card "Sondages Familiaux"
2. Cliquer sur la card (ou le lien)
3. Observer l'URL du navigateur

**Résultat attendu :** 
- ✅ URL change vers `/polls`
- ✅ **AUCUN rafraîchissement de page** (navigation React Router)
- ✅ Page "Sondages Familiaux" affichée

**Indicateurs de succès :**
- Le Header reste visible (pas de flash blanc)
- Navigation instantanée
- URL : http://localhost:3000/polls

---

### ÉTAPE 2 : Liste des Sondages

#### Test 2.1 : Liste vide
**Si aucun sondage n'existe :**

**Résultat attendu :**
- ✅ Icône 🗳️ affichée
- ✅ Message : "Aucun sondage pour le moment"
- ✅ Description : "Créez le premier sondage de votre famille !"
- ✅ Bouton "+ Créer un sondage" visible et cliquable

---

#### Test 2.2 : Liste avec sondages
**Si des sondages existent :**

**Résultat attendu :**
- ✅ Header avec titre "Sondages Familiaux"
- ✅ Section info avec palette émotionnelle
- ✅ Toggle "Afficher/Masquer les sondages fermés"
- ✅ Liste de cards avec :
  - Icône 🟢 (choix unique) ou 🟣 (choix multiple)
  - Badge type (Choix unique / Choix multiple)
  - Question du sondage
  - Nombre de votants
  - Nom du créateur
  - Date de fin (si applicable)
  - Badges de statut :
    - 🔵 "Vous avez voté" (si voté)
    - 🟠 "Pas encore voté" (si actif et non voté)
    - ⚫ "Sondage terminé" (si fermé)

---

### ÉTAPE 3 : Création d'un Sondage

#### Test 3.1 : Navigation vers formulaire
1. Cliquer sur le bouton "+ Créer un sondage"
2. Observer l'URL

**Résultat attendu :**
- ✅ URL : http://localhost:3000/polls/create
- ✅ Formulaire de création affiché
- ✅ Bouton retour (flèche) visible

---

#### Test 3.2 : Formulaire - Choix unique
1. Remplir le formulaire :
   - **Question** : "Où organiser la prochaine réunion ?"
   - **Description** : "Vote pour choisir le lieu" (optionnel)
   - **Type** : Sélectionner "🟢 Choix unique"
   - **Options** : 
     - Option 1 : "Chez Grand-mère"
     - Option 2 : "Restaurant"
     - Option 3 : "Parc"
   - **Date de fin** : Laisser vide ou choisir une date future
2. Cliquer sur "Créer un sondage"

**Résultat attendu :**
- ✅ Toast de succès : "Sondage créé avec succès !"
- ✅ Redirection vers `/polls`
- ✅ Nouveau sondage visible dans la liste

---

#### Test 3.3 : Formulaire - Choix multiple
1. Cliquer sur "+ Créer un sondage"
2. Remplir le formulaire :
   - **Question** : "Quels plats pour le repas ?"
   - **Type** : Sélectionner "🟣 Choix multiple"
   - **Options** :
     - Option 1 : "Poulet rôti"
     - Option 2 : "Gratin dauphinois"
     - Option 3 : "Salade"
     - Option 4 : "Tarte aux pommes"
3. Cliquer sur "Créer un sondage"

**Résultat attendu :**
- ✅ Sondage créé avec type "Choix multiple"
- ✅ Badge 🟣 "Choix multiple" affiché

---

#### Test 3.4 : Validation - Minimum 2 options
1. Créer un sondage avec seulement 1 option remplie
2. Cliquer sur "Créer un sondage"

**Résultat attendu :**
- ❌ Toast d'erreur : "Au moins 2 options sont requises"
- ❌ Sondage non créé

---

#### Test 3.5 : Validation - Maximum 6 options
1. Essayer d'ajouter une 7ème option

**Résultat attendu :**
- ❌ Toast d'avertissement : "Maximum 6 options autorisées"
- ❌ Bouton "+ Ajouter une option" désactivé

---

### ÉTAPE 4 : Vote sur un Sondage

#### Test 4.1 : Ouvrir détails d'un sondage
1. Dans la liste, cliquer sur une card de sondage
2. Observer l'URL

**Résultat attendu :**
- ✅ URL : http://localhost:3000/polls/[ID]
- ✅ Page détails affichée avec :
  - Question complète
  - Description (si présente)
  - Type de sondage
  - Informations (nombre votants, créateur, date)
  - Interface de vote **OU** résultats (si déjà voté)

---

#### Test 4.2 : Vote - Choix unique
1. Ouvrir un sondage à "Choix unique" non voté
2. Sélectionner UNE option (bouton radio)
3. Cliquer sur "Voter"

**Résultat attendu :**
- ✅ Toast de succès : "Votre vote a été enregistré avec succès !"
- ✅ Interface passe automatiquement aux résultats
- ✅ Badge "✓ Vous avez voté" affiché
- ✅ Alert success : "Merci d'avoir participé !"
- ✅ Résultats affichés avec :
  - Barres de progression colorées
  - Pourcentages pour chaque option
  - Nombre de votes par option
  - Votre choix marqué d'un ✓ vert

---

#### Test 4.3 : Vote - Choix multiple
1. Ouvrir un sondage à "Choix multiple" non voté
2. Sélectionner PLUSIEURS options (checkboxes)
3. Cliquer sur "Voter"

**Résultat attendu :**
- ✅ Vote enregistré pour toutes les options sélectionnées
- ✅ Résultats affichés avec vos choix marqués ✓

---

#### Test 4.4 : Double vote - Prévention
1. Essayer de voter à nouveau sur un sondage déjà voté
   (Recharger la page ou naviguer retour puis rouvrir)

**Résultat attendu :**
- ✅ Interface de vote N'EST PAS affichée
- ✅ Résultats directement affichés
- ✅ Badge "Vous avez voté" présent
- ✅ Impossible de re-voter

---

### ÉTAPE 5 : Résultats

#### Test 5.1 : Barres de progression
1. Observer les résultats d'un sondage avec plusieurs votes
2. Vérifier les barres de progression

**Résultat attendu :**
- ✅ Barres colorées (palette émotionnelle)
- ✅ Longueur proportionnelle aux pourcentages
- ✅ Pourcentages corrects (total = 100%)
- ✅ Nombre de votes affiché pour chaque option

---

#### Test 5.2 : Identification du choix utilisateur
1. Observer les résultats d'un sondage où vous avez voté

**Résultat attendu :**
- ✅ Votre option marquée d'un ✓ vert
- ✅ Card de votre option avec fond vert clair
- ✅ Bordure verte sur votre option

---

### ÉTAPE 6 : Filtres et Navigation

#### Test 6.1 : Toggle sondages fermés
1. Sur la liste des sondages, activer le toggle "Afficher les sondages fermés"
2. Observer la liste

**Résultat attendu :**
- ✅ Sondages expirés affichés en gris
- ✅ Badge "Sondage terminé" visible
- ✅ Liste rechargée automatiquement

3. Désactiver le toggle

**Résultat attendu :**
- ✅ Sondages fermés masqués
- ✅ Seuls les sondages actifs affichés

---

#### Test 6.2 : Bouton retour
1. Sur une page de détails, cliquer sur la flèche retour
2. Observer la navigation

**Résultat attendu :**
- ✅ Retour vers `/polls` sans rafraîchissement
- ✅ Navigation fluide React Router

---

### ÉTAPE 7 : Permissions et Suppression

#### Test 7.1 : Suppression - Créateur
1. Se connecter avec le compte créateur d'un sondage
2. Ouvrir le sondage créé par vous
3. Observer le bouton "Supprimer" (icône poubelle)
4. Cliquer sur le bouton
5. Confirmer la suppression

**Résultat attendu :**
- ✅ Bouton supprimer visible
- ✅ Confirmation demandée
- ✅ Toast de succès : "Sondage supprimé avec succès"
- ✅ Redirection vers `/polls`
- ✅ Sondage n'apparaît plus dans la liste

---

#### Test 7.2 : Suppression - Admin
1. Se connecter avec un compte Admin
2. Ouvrir n'importe quel sondage
3. Observer le bouton "Supprimer"

**Résultat attendu :**
- ✅ Bouton supprimer visible (même si pas créateur)
- ✅ Suppression possible

---

#### Test 7.3 : Suppression - Membre simple
1. Se connecter avec un compte Membre (non créateur, non admin)
2. Ouvrir un sondage créé par quelqu'un d'autre
3. Observer l'absence du bouton "Supprimer"

**Résultat attendu :**
- ✅ Bouton supprimer **NON** visible
- ✅ Impossible de supprimer

---

### ÉTAPE 8 : Traductions (i18n)

#### Test 8.1 : Passage en anglais
1. Aller dans les paramètres de langue (si disponible)
2. Changer la langue en "English"
3. Naviguer vers `/polls`

**Résultat attendu :**
- ✅ Titre : "Family Polls"
- ✅ Sous-titre : "Make Your Voice Heard!"
- ✅ Bouton : "Create a poll"
- ✅ Toutes les traductions en anglais

---

### ÉTAPE 9 : Tests de Robustesse

#### Test 9.1 : Sondage inexistant
1. Aller sur http://localhost:3000/polls/99999 (ID inexistant)

**Résultat attendu :**
- ✅ Message : "Sondage introuvable"
- ✅ Redirection vers `/polls` (optionnel)

---

#### Test 9.2 : Navigation directe URL
1. Copier l'URL d'un sondage : http://localhost:3000/polls/3
2. Fermer l'onglet
3. Ouvrir un nouvel onglet
4. Coller l'URL

**Résultat attendu :**
- ✅ Page détails du sondage affichée directement
- ✅ Authentification maintenue (si token valide)

---

## ✅ Checklist Finale

### Fonctionnalités Core :
- [ ] Navigation `/polls` sans rafraîchissement ⭐
- [ ] Liste des sondages affichée
- [ ] Création d'un sondage (choix unique)
- [ ] Création d'un sondage (choix multiple)
- [ ] Vote sur choix unique
- [ ] Vote sur choix multiple
- [ ] Résultats en temps réel
- [ ] Barres de progression colorées
- [ ] Prévention double vote

### Validations :
- [ ] Minimum 2 options requis
- [ ] Maximum 6 options
- [ ] Question requise
- [ ] Date de fin optionnelle

### Permissions :
- [ ] Créateur peut supprimer son sondage
- [ ] Admin peut supprimer tout sondage
- [ ] Membre simple ne peut pas supprimer

### UI/UX :
- [ ] Palette émotionnelle appliquée
- [ ] Badges colorés
- [ ] Messages de succès/erreur (toasts)
- [ ] Empty states accueillants
- [ ] Transitions fluides

### i18n :
- [ ] Traductions françaises
- [ ] Traductions anglaises

---

## 🐛 Problèmes Potentiels et Solutions

### Problème 1 : Erreur 401 (Unauthorized) sur `/api/polls`
**Cause :** Token JWT expiré ou manquant

**Solution :**
1. Se déconnecter
2. Se reconnecter
3. Retester

---

### Problème 2 : Erreur 404 sur `/api/polls`
**Cause :** PollsController pas chargé

**Solution :**
1. Vérifier que `/backend/Controllers/PollsController.cs` existe
2. Redémarrer le backend : `cd backend && dotnet run`

---

### Problème 3 : Traductions manquantes (clés affichées)
**Cause :** i18n pas chargé

**Solution :**
1. Vérifier que `fr.json` et `en.json` contiennent la section `polls`
2. Recharger la page (Ctrl+R)

---

### Problème 4 : Écran blanc après clic sur "Sondages"
**Cause :** Erreur JavaScript dans le composant

**Solution :**
1. Ouvrir la console navigateur (F12)
2. Vérifier les erreurs TypeScript/React
3. Corriger l'erreur identifiée

---

## 📊 Résultats Attendus

À la fin de tous les tests :

✅ **Navigation fluide** (0 rafraîchissement de page)  
✅ **Création de sondages** fonctionnelle  
✅ **Vote** enregistré correctement  
✅ **Résultats** affichés en temps réel  
✅ **Permissions** respectées  
✅ **UI/UX** conforme au design system  
✅ **Traductions** complètes (fr + en)  

**Statut Final :** 🟢 MODULE SONDAGES OPÉRATIONNEL

---

## 🔗 Liens Rapides

- **Dashboard** : http://localhost:3000/dashboard
- **Liste Sondages** : http://localhost:3000/polls
- **Créer Sondage** : http://localhost:3000/polls/create

---

*Guide de test créé le 14 novembre 2025*  
*Module Sondages Familiaux v1.0*
