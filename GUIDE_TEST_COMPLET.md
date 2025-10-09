# 🧪 Guide de Test Complet - Family Tree Application

## 📋 Table des Matières
1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Démarrage du Projet](#démarrage-du-projet)
4. [Tests Fonctionnels](#tests-fonctionnels)
5. [Données de Test](#données-de-test)
6. [Résolution de Problèmes](#résolution-de-problèmes)

---

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur) - [Télécharger](https://nodejs.org/)
- **.NET SDK** (v8.0 ou supérieur) - [Télécharger](https://dotnet.microsoft.com/download)
- **PostgreSQL** (v14 ou supérieur) - [Télécharger](https://www.postgresql.org/download/)

### Vérification des versions

```bash
node --version    # Devrait afficher v18.x ou supérieur
npm --version     # Devrait afficher 9.x ou supérieur
dotnet --version  # Devrait afficher 8.x ou supérieur
psql --version    # Devrait afficher 14.x ou supérieur
```

---

## 📦 Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd projet
```

### 2. Configurer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE "FamilyTreeDB";

# Se connecter à la base
\c FamilyTreeDB

# Exécuter le script d'initialisation
\i database/init.sql

# Exécuter les migrations
\i database/migration-polls-module.sql

# Quitter PostgreSQL
\q
```

### 3. Installer les dépendances du backend

```bash
cd backend
dotnet restore
cd ..
```

### 4. Installer les dépendances du frontend

```bash
cd frontend
npm install
cd ..
```

---

## 🚀 Démarrage du Projet

### Méthode 1 : Utiliser VS Code Tasks (Recommandé)

Si vous utilisez VS Code :

1. Ouvrez le projet dans VS Code
2. Appuyez sur `Cmd+Shift+P` (Mac) ou `Ctrl+Shift+P` (Windows/Linux)
3. Tapez "Run Task" et sélectionnez :
   - **Start Backend API** (démarre sur http://localhost:5000)
   - **Start Frontend Dev Server** (démarre sur http://localhost:3001)

### Méthode 2 : Ligne de commande

**Terminal 1 - Backend :**
```bash
cd backend
dotnet run
# Le backend démarre sur http://localhost:5000
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
# Le frontend démarre sur http://localhost:3001
```

### 3. Accéder à l'application

Ouvrez votre navigateur et accédez à : **http://localhost:3001**

---

## 🧪 Tests Fonctionnels

### 1. Test d'Authentification

#### Connexion avec un compte existant
1. Utilisez les identifiants suivants (données de test) :
   - **Email** : `jean.dupont@email.com`
   - **Mot de passe** : `password123`
2. Cliquez sur "Se connecter"
3. Vous serez redirigé vers le Dashboard

#### Inscription d'un nouvel utilisateur
1. Cliquez sur "S'inscrire" ou "Créer un compte"
2. Remplissez le formulaire :
   - Email : `test@example.com`
   - Mot de passe : `Test123!`
   - Confirmez le mot de passe
3. Cliquez sur "Créer mon compte"
4. Complétez votre profil

### 2. Test du Dashboard ⭐

Une fois connecté, vérifiez :

- ✅ **Message de bienvenue personnalisé** : "Bonjour, [Prénom] ! Voici les actualités de votre famille"
- ✅ **Code d'invitation famille** (si admin)
- ✅ **Statistiques de la famille** :
  - Nombre de membres
  - Nombre de générations
  - Nombre de photos
  - Nombre d'événements
  - Nombre de mariages
- ✅ **Actions principales** avec 5 cartes :
  - 🌳 Arbre généalogique
  - 👥 Membres
  - 📅 Événements
  - 💍 Mariages
  - 🗳️ **Sondages** (NOUVEAU !)

### 3. Test de Navigation

Vérifiez que tous les boutons de navigation dans le header fonctionnent :

| Bouton | Destination | Fonctionnalité |
|--------|------------|----------------|
| 🏠 Home | `/` | Dashboard principal |
| 🌳 Tree | `/family-tree` | Visualisation arbre généalogique |
| 👥 Members | `/persons` | Liste des membres |
| 📅 Events | `/events` | Liste des événements |
| 💍 Weddings | `/weddings` | Liste des mariages |
| 🗳️ **Polls** | `/polls` | **Nouveau module sondages** |
| 👤 Profile | `/my-profile` | Profil utilisateur |

### 4. Test du Module Sondages 🗳️ (NOUVEAU)

#### Accéder aux sondages
1. **Option 1** : Cliquez sur le bouton **"Sondages"** dans le header (6ème bouton, après Mariages)
2. **Option 2** : Cliquez sur la carte **"Sondages"** dans le Dashboard (5ème carte)

#### Visualiser les sondages
- Vous verrez la liste des sondages actifs de votre famille
- Badge vert "Actif" ou badge rouge "Clos"
- Utilisez le switch "Afficher sondages clos" pour voir les sondages terminés

#### Voter sur un sondage
1. Cliquez sur un sondage dans la liste
2. Sélectionnez votre/vos choix :
   - **Choix unique** : boutons radio (1 seul choix)
   - **Choix multiple** : cases à cocher (plusieurs choix)
3. Cliquez sur "Voter"
4. ✅ Votre vote est enregistré !
5. Vous verrez les résultats en pourcentage avec barres de progression

#### Créer un nouveau sondage
1. Cliquez sur le bouton "+ Créer un sondage"
2. Remplissez le formulaire :
   - **Question** : Ex. "Où organiser la prochaine réunion familiale ?"
   - **Type** : 
     - Choix unique (radio button)
     - Choix multiple (checkboxes)
   - **Description** (optionnel) : Détails supplémentaires
   - **Date de fin** (optionnel) : Le sondage se fermera automatiquement
   - **Options** : 
     - Minimum 2 options requises
     - Maximum 6 options
     - Utilisez le bouton "+" pour ajouter des options
     - Utilisez l'icône 🗑️ pour supprimer une option
3. Cliquez sur "Créer le sondage"
4. Vous serez redirigé vers le sondage créé

#### Supprimer un sondage (créateur uniquement)
1. Ouvrez un sondage que vous avez créé
2. Cliquez sur le bouton rouge "Supprimer ce sondage" (en bas)
3. Confirmez la suppression dans la boîte de dialogue
4. Vous serez redirigé vers la liste des sondages

### 5. Test de l'Arbre Généalogique

1. Cliquez sur **"Arbre généalogique"** (Tree)
2. Vérifiez :
   - Visualisation interactive des membres
   - Relations parent-enfant affichées
   - Possibilité de zoomer/déplacer la vue
   - Cliquer sur un membre pour voir ses détails

### 6. Test des Membres

1. Cliquez sur **"Membres"**
2. Actions disponibles :
   - Voir la liste complète des membres de la famille
   - Filtrer par sexe (Hommes/Femmes)
   - Bouton "+ Ajouter un membre"
   - Cliquer sur un membre pour voir son profil
   - Modifier les informations d'un membre
   - Voir les relations familiales

### 7. Test des Événements

1. Cliquez sur **"Événements"**
2. Fonctionnalités :
   - Voir les événements à venir (90 prochains jours)
   - Créer un nouvel événement
   - Types d'événements disponibles :
     - 🎂 Anniversaire
     - 💍 Mariage
     - 🎉 Fête
     - 📌 Autre
   - Événements récurrents (anniversaires automatiques)
   - Modifier ou supprimer un événement

### 8. Test des Mariages

1. Cliquez sur **"Mariages"**
2. Vérifiez :
   - Liste des mariages de la famille
   - Détails de chaque mariage (couple, date)
   - Statut : Actif (💕) ou Divorcé
   - Créer un nouveau mariage
   - Voir les enfants du couple

### 9. Test Multilingue (i18n)

L'application supporte le français et l'anglais.

1. Connectez-vous à l'application
2. Cherchez le sélecteur de langue (généralement dans le header ou le profil)
3. Basculez entre **FR** 🇫🇷 et **EN** 🇬🇧
4. Vérifiez que :
   - Tous les textes de l'interface changent
   - Le header est traduit
   - Le dashboard est traduit
   - Le module sondages est traduit (polls)

---

## 📊 Données de Test

### Comptes Utilisateurs Préchargés

| Email | Mot de passe | Rôle | Famille |
|-------|--------------|------|---------|
| `jean.dupont@email.com` | `password123` | Admin | Dupont |
| `marie.dupont@email.com` | `password123` | Membre | Dupont |

### Sondages de Test (Préchargés)

Après l'exécution de la migration `migration-polls-module.sql`, 3 sondages sont disponibles :

1. **"Où organiser la prochaine réunion familiale ?"**
   - Type : Choix unique
   - Options : Paris, Lyon, Marseille, Bordeaux
   - Créateur : Jean Dupont

2. **"Quels plats préparer pour le repas de famille ?"**
   - Type : Choix multiple
   - Options : Couscous, Paella, Ratatouille, Pot-au-feu, Blanquette
   - Créateur : Jean Dupont

3. **"Quel jour vous convient le mieux ?"**
   - Type : Choix unique
   - Options : Samedi, Dimanche, Jour férié
   - Créateur : Jean Dupont

### Base de données complète

La base contient également :
- Plusieurs familles (Dupont, Martin, etc.)
- Des membres avec relations familiales
- Des événements (anniversaires, mariages, etc.)
- Des photos d'albums
- Des mariages enregistrés

---

## 🐛 Résolution de Problèmes

### Problème : Backend ne démarre pas

**Erreur** : `Failed to bind to address http://127.0.0.1:5000: address already in use`

**Solution** :
```bash
# Sur macOS/Linux :
lsof -ti:5000 | xargs kill -9

# Sur Windows :
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Problème : Frontend affiche "Network Error"

**Causes possibles** :
1. Le backend n'est pas démarré
2. Le port backend est incorrect
3. Problème de CORS

**Solution** :
```bash
# Vérifier que le backend tourne
curl http://localhost:5000/api/auth/test

# Redémarrer le backend
cd backend
dotnet run
```

### Problème : Erreur "polls.fetchError"

**Cause** : Token JWT non valide, expiré, ou module polls non chargé

**Solution** :
1. **Rafraîchir le token** :
   - Déconnectez-vous
   - Reconnectez-vous
   - Le nouveau token sera généré automatiquement

2. **Vérifier que PollsController est chargé** :
   - Redémarrer le backend
   - Vérifier les logs de démarrage

### Problème : Base de données vide

**Solution** :
```bash
# Réinitialiser la base de données
psql -U postgres -d FamilyTreeDB -f database/init.sql

# Ajouter le module sondages
psql -U postgres -d FamilyTreeDB -f database/migration-polls-module.sql
```

### Problème : Module Sondages n'apparaît pas

**Vérifications** :

1. **Migration exécutée ?**
   ```sql
   -- Se connecter à la base
   psql -U postgres -d FamilyTreeDB
   
   -- Vérifier les tables
   SELECT * FROM "Polls" LIMIT 1;
   ```

2. **Si erreur, exécuter la migration :**
   ```bash
   psql -U postgres -d FamilyTreeDB -f database/migration-polls-module.sql
   ```

3. **Vérifier le frontend :**
   - Rafraîchir la page (Cmd+R ou Ctrl+R)
   - Vider le cache (Cmd+Shift+R ou Ctrl+Shift+R)

### Problème : Message "Bonjour, Utilisateur !" au lieu du prénom

**Cause** : Token utilisateur ne contient pas le nom

**Solution** :
1. Déconnectez-vous
2. Reconnectez-vous
3. Le token sera régénéré avec les bonnes informations

---

## 📱 Tests de Compatibilité

### Navigateurs Supportés

- ✅ Chrome (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Edge (v90+)

### Résolutions Testées

- ✅ **Mobile** : 375px - 768px
- ✅ **Tablet** : 768px - 1024px
- ✅ **Desktop** : 1024px+

### Tests Responsifs

1. Ouvrez l'application
2. Ouvrez les DevTools (F12)
3. Activez le mode responsive (Cmd+Shift+M ou Ctrl+Shift+M)
4. Testez différentes résolutions :
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

---

## 🔐 Sécurité

### Points à vérifier

1. **Authentification JWT** :
   - ✅ Token stocké dans localStorage
   - ✅ Expiration automatique
   - ✅ Redirection vers login si non authentifié
   - ✅ Token envoyé automatiquement avec chaque requête

2. **Autorisation** :
   - ✅ Les actions admin sont protégées (code d'invitation, régénération)
   - ✅ Les sondages ne peuvent être supprimés que par leur créateur
   - ✅ Seuls les membres de la famille voient les sondages de leur famille

3. **Validation** :
   - ✅ Tous les formulaires ont une validation côté client
   - ✅ Validation côté serveur (backend)
   - ✅ Prévention des injections SQL (paramètres PostgreSQL)
   - ✅ Validation des types de données

---

## ✅ Checklist de Test Complète

Avant de pousser sur Git, vérifiez :

### Backend
- [ ] Backend démarre sans erreur sur port 5000
- [ ] Aucune erreur dans les logs au démarrage
- [ ] Endpoint `/api/polls` répond (401 si non authentifié)
- [ ] Base de données accessible
- [ ] Migrations exécutées

### Frontend
- [ ] Frontend démarre sans erreur sur port 3001
- [ ] Aucune erreur dans la console navigateur
- [ ] Aucun warning React

### Authentification
- [ ] Connexion fonctionne avec compte test
- [ ] Déconnexion fonctionne
- [ ] Token JWT est stocké
- [ ] Redirection si non authentifié

### Dashboard
- [ ] Message personnalisé : "Bonjour, [Prénom] !"
- [ ] Statistiques affichées correctement
- [ ] Code d'invitation visible (admin)
- [ ] 5 cartes d'actions visibles (Tree, Members, Events, Weddings, **Polls**)

### Navigation
- [ ] Header affiche 7 boutons : Home, Tree, Members, Events, Weddings, **Polls**, Profile
- [ ] Tous les liens fonctionnent
- [ ] Ordre correct : Polls après Weddings

### Module Sondages
- [ ] Page `/polls` accessible depuis header
- [ ] Page `/polls` accessible depuis dashboard
- [ ] Liste des sondages s'affiche
- [ ] Création de sondage fonctionne
- [ ] Vote sur sondage fonctionne
- [ ] Suppression de sondage fonctionne (créateur)
- [ ] Résultats affichés avec pourcentages
- [ ] Switch "Sondages clos" fonctionne

### i18n
- [ ] Sélecteur de langue accessible
- [ ] Basculer FR/EN fonctionne
- [ ] Tous les textes sont traduits
- [ ] Module sondages traduit (polls)

### Responsive
- [ ] Application responsive sur mobile (375px)
- [ ] Application responsive sur tablette (768px)
- [ ] Application responsive sur desktop (1920px)

### Performance
- [ ] Temps de chargement < 3s
- [ ] Pas de lag lors de la navigation
- [ ] API répond en < 500ms

---

## 📝 Commandes Git

Une fois tous les tests validés :

```bash
# Vérifier l'état des fichiers
git status

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit avec message descriptif
git commit -m "feat: Add Polls module with voting system

- Added Polls navigation button after Weddings
- Added Polls card to Dashboard
- Fixed API authentication with centralized service
- Restored personalized welcome message
- Added FR/EN translations for polls
- Database migration for polls module complete"

# Pousser sur la branche principale
git push origin main

# OU créer une nouvelle branche
git checkout -b feature/polls-module
git push origin feature/polls-module
```

---

## 📞 Support

Pour toute question ou problème :

1. **Consultez d'abord ce guide**
2. **Vérifiez les logs** :
   - Backend : Terminal où `dotnet run` tourne
   - Frontend : Console navigateur (F12)
3. **Documentation** :
   - API : `docs/API.md`
   - README : `README.md`
   - Projet : `PROJET_RESUME.md`

---

## 🎉 Fonctionnalités Ajoutées

### Version 2.0 - Module Sondages (9 octobre 2025)

- ✅ **Navigation** : Bouton Sondages dans le header (après Mariages)
- ✅ **Dashboard** : Carte Sondages dans les actions principales
- ✅ **Backend** : PollsController avec 5 endpoints (GET, POST, DELETE)
- ✅ **Base de données** : Tables Polls, PollOptions, PollVotes + fonctions
- ✅ **Frontend** : Pages PollsList, PollDetail, CreatePoll
- ✅ **API centralisée** : Service axios avec intercepteur JWT
- ✅ **i18n** : Traductions FR/EN complètes
- ✅ **UX** : Message de bienvenue personnalisé restauré

---

**Dernière mise à jour** : 9 octobre 2025  
**Version** : 2.0 (avec module Sondages)  
**Auteur** : Équipe Family Tree
