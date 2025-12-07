# 🧪 Guide de Test - Kinship Haven (Arbre Généalogique Familial)

Merci de prendre le temps de tester cette application ! Vos retours sont précieux pour améliorer l'expérience utilisateur.

---

## 🌐 Accès à l'application

**URL de l'application** : `[VOTRE_URL_ICI]`

> ⚠️ **Note** : Si l'application est hébergée localement, remplacez par votre URL ngrok ou autre service de tunneling.

---

## 🎯 Objectif du test

Cette application permet de créer et gérer un arbre généalogique familial collaboratif. Vous pouvez :
- Créer votre compte et votre famille
- Ajouter des membres (parents, enfants, conjoints)
- Visualiser l'arbre généalogique interactif
- Gérer les événements familiaux et mariages
- Collaborer avec d'autres membres de la famille

---

## 📋 Scénarios de test à réaliser

### 🔹 Test 1 : Inscription et création de famille (PRIORITAIRE)

1. **Accéder à la page d'inscription**
   - Aller sur : `[URL]/register`
   - Vérifier que la page s'affiche correctement

2. **Étape 1 - Créer votre compte**
   - Email : Utilisez votre vrai email
   - Mot de passe : Minimum 8 caractères
   - Cliquez sur "Suivant"

3. **Étape 2 - Compléter votre profil**
   - Prénom et Nom
   - Sexe (Homme/Femme)
   - Date de naissance
   - Pays et ville de naissance
   - Pays et ville de résidence
   - Profession (optionnel)
   - Téléphone (optionnel)
   - Cliquez sur "Suivant"

4. **Étape 3 - Créer votre famille**
   - Choisissez "Créer une nouvelle famille"
   - Nom de famille : [Votre nom de famille]
   - Cliquez sur "Créer ma famille"

5. **Vérifications**
   - ✅ Vous êtes redirigé vers le Dashboard
   - ✅ Votre nom apparaît dans le message de bienvenue
   - ✅ Un code d'invitation est visible (pour inviter d'autres membres)

---

### 🔹 Test 2 : Changement de langue

1. **Vérifier la langue par défaut**
   - La langue affichée est-elle correcte ?

2. **Changer de langue**
   - Cliquez sur le sélecteur de langue (en haut à droite)
   - Changez entre Français ↔️ English
   - Rafraîchissez la page

3. **Vérifications**
   - ✅ Tous les textes changent de langue
   - ✅ Aucun mélange français/anglais
   - ✅ Les badges et tooltips sont traduits
   - ✅ Le Dashboard affiche tout dans la bonne langue

---

### 🔹 Test 3 : Navigation dans le Dashboard

1. **Explorer les sections principales**
   - Statistiques de la famille (membres, générations, photos, événements)
   - Membres récents
   - Prochains événements (dans les 90 jours)
   - Mariages de la famille

2. **Tester les actions rapides**
   - Cliquez sur "Arbre Dynamique" → Vérifie que la page s'ouvre
   - Cliquez sur "Membres" → Liste des membres
   - Cliquez sur "Événements" → Page des événements
   - Cliquez sur "Mariages" → Page des mariages
   - Cliquez sur "Sondages" → Page des sondages
   - Cliquez sur "Tableau de Bord de Gestion" (badge NEW)

3. **Vérifications**
   - ✅ Toutes les cartes s'affichent correctement
   - ✅ Les boutons sont réactifs (effet hover)
   - ✅ Les statistiques affichent les bonnes valeurs
   - ✅ Le code d'invitation est copiable

---

### 🔹 Test 4 : Ajouter un membre de la famille

1. **Accéder à la page Membres**
   - Dashboard → "Membres" ou "Tableau de Bord de Gestion"

2. **Ajouter un nouveau membre**
   - Cliquez sur "Ajouter un membre"
   - Remplissez les informations :
     - Prénom, Nom
     - Sexe
     - Date de naissance
     - Statut (Vivant/Décédé)
     - Relation (Parent, Enfant, Conjoint)
   - Cliquez sur "Enregistrer"

3. **Vérifications**
   - ✅ Le membre apparaît dans la liste
   - ✅ Vous pouvez voir son profil
   - ✅ Le badge de permissions est correct (badge vert "Créateur")

---

### 🔹 Test 5 : Visualiser l'arbre généalogique

1. **Ouvrir l'arbre dynamique**
   - Dashboard → "Arbre Dynamique"

2. **Tester les interactions**
   - Zoomer/Dézoomer (molette souris ou pinch sur mobile)
   - Déplacer la vue (clic + glisser)
   - Cliquer sur un membre pour voir ses détails
   - Tester le bouton "Recentrer la vue"

3. **Vérifications**
   - ✅ L'arbre s'affiche correctement
   - ✅ Les relations parent-enfant sont visibles
   - ✅ Les mariages sont représentés
   - ✅ Navigation fluide et réactive

---

### 🔹 Test 6 : Inviter un autre membre (optionnel)

1. **Récupérer votre code d'invitation**
   - Dashboard → Section "Code d'invitation"
   - Copiez le code (ex: ABC123)

2. **Demander à un ami de rejoindre**
   - Il doit aller sur `[URL]/register`
   - Étape 1 : Créer son compte
   - Étape 2 : Compléter son profil
   - Étape 3 : Choisir "Rejoindre une famille existante"
   - Entrer votre code d'invitation

3. **Vérifications**
   - ✅ L'ami apparaît dans votre liste de membres
   - ✅ Il a accès au même arbre généalogique
   - ✅ Les permissions sont correctes

---

## 🐛 Signalement de bugs

Si vous rencontrez un problème, veuillez noter :

### Informations à fournir

1. **Type de problème** :
   - [ ] Bug visuel (affichage incorrect)
   - [ ] Bug fonctionnel (fonctionnalité ne marche pas)
   - [ ] Erreur (message d'erreur affiché)
   - [ ] Performance (lenteur, freeze)
   - [ ] Autre : ___________

2. **Description du bug** :
   - Que faisiez-vous ?
   - Qu'avez-vous vu ?
   - Qu'attendiez-vous ?

3. **Étapes pour reproduire** :
   1. Étape 1
   2. Étape 2
   3. Étape 3

4. **Informations système** :
   - Navigateur : Chrome / Safari / Firefox / Edge / Autre
   - Appareil : Ordinateur / Tablette / Smartphone
   - Système : Windows / macOS / iOS / Android
   - Taille d'écran : Desktop / Mobile

5. **Capture d'écran** (si possible) :
   - Joindre une capture d'écran du problème

---

## 💬 Retour d'expérience (UX)

Merci de répondre à ces questions :

### Facilité d'utilisation (1-5 étoiles)

| Critère | ⭐ | Note |
|---------|---|------|
| **Inscription** | ⭐⭐⭐⭐⭐ | __/5 |
| **Navigation** | ⭐⭐⭐⭐⭐ | __/5 |
| **Clarté de l'interface** | ⭐⭐⭐⭐⭐ | __/5 |
| **Vitesse de l'application** | ⭐⭐⭐⭐⭐ | __/5 |
| **Design visuel** | ⭐⭐⭐⭐⭐ | __/5 |

### Questions ouvertes

1. **Qu'avez-vous aimé ?**
   - _______________

2. **Qu'avez-vous trouvé difficile ou confus ?**
   - _______________

3. **Quelles fonctionnalités aimeriez-vous voir ajoutées ?**
   - _______________

4. **Utiliseriez-vous cette application pour votre propre famille ?**
   - [ ] Oui, définitivement
   - [ ] Peut-être
   - [ ] Non, parce que : _______________

5. **Recommanderiez-vous cette application à d'autres ?**
   - [ ] Oui
   - [ ] Non
   - Pourquoi : _______________

---

## 📊 Checklist de test complète

### Inscription et Authentification
- [ ] Inscription avec email + mot de passe
- [ ] Validation du formulaire (champs obligatoires)
- [ ] Création de profil complet (11 champs)
- [ ] Création d'une nouvelle famille
- [ ] Redirection vers Dashboard après inscription

### Interface et Navigation
- [ ] Dashboard s'affiche correctement
- [ ] Menu de navigation fonctionne
- [ ] Changement de langue (FR ↔️ EN)
- [ ] Toutes les pages sont accessibles
- [ ] Boutons réactifs (hover effects)

### Gestion des membres
- [ ] Voir la liste des membres
- [ ] Ajouter un nouveau membre
- [ ] Modifier un membre (si permissions)
- [ ] Voir le profil d'un membre
- [ ] Badges de permissions corrects

### Arbre généalogique
- [ ] Arbre dynamique s'affiche
- [ ] Zoom/Dézoom fonctionne
- [ ] Déplacement de la vue
- [ ] Clic sur un membre affiche ses infos
- [ ] Bouton "Recentrer" fonctionne

### Fonctionnalités avancées
- [ ] Code d'invitation copiable
- [ ] Statistiques famille correctes
- [ ] Événements à venir affichés
- [ ] Mariages affichés
- [ ] Filtres et recherche (tableau membres)

### Responsive Design
- [ ] Version desktop (> 1024px)
- [ ] Version tablette (768px - 1024px)
- [ ] Version mobile (< 768px)

### Performance
- [ ] Chargement rapide des pages (< 3 sec)
- [ ] Pas de freeze ou lag
- [ ] Animations fluides

---

## 📧 Comment envoyer vos retours

### Option 1 : Email
Envoyez vos retours à : **[VOTRE_EMAIL]**

### Option 2 : Formulaire en ligne
Remplissez le formulaire : **[LIEN_FORMULAIRE]**

### Option 3 : Appel/Visio
Contactez-moi pour un retour en direct : **[VOTRE_TÉLÉPHONE]**

---

## 🙏 Merci !

Votre aide est précieuse pour améliorer cette application. Chaque retour, qu'il soit positif ou négatif, contribue à créer une meilleure expérience pour tous les utilisateurs.

**Durée estimée du test** : 15-30 minutes

**Date limite de retour** : [INDIQUER UNE DATE]

---

## 💡 Astuces pour les testeurs

- **Soyez honnête** : N'hésitez pas à critiquer si quelque chose ne va pas
- **Soyez précis** : Plus vous donnez de détails, mieux c'est
- **Explorez librement** : Essayez de "casser" l'application !
- **Testez sur différents appareils** : Desktop + mobile si possible
- **Notez tout** : Même les petits détails comptent

---

**Version du guide** : 1.0  
**Date** : 7 décembre 2024  
**Application** : Kinship Haven - Family Tree Manager
