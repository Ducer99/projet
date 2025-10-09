# 🌳 Application Généalogie Familiale

> **Une famille, une même histoire à travers les générations**

Application web moderne et élégante pour explorer, partager et préserver l'histoire de votre famille.

---

## ✨ Nouveau Design 2025

L'application a été **complètement redesignée** avec une approche moderne, émotionnelle et accessible inspirée par **Dieter Rams**, **Don Norman**, **Apple** et **Notion**.

### 🎨 Caractéristiques du Design

- 💚 **Palette Émotionnelle** - 5 couleurs chaleureuses par famille
- ✨ **Animations Fluides** - 60fps avec Framer Motion
- 🌳 **Arbre Interactif** - Zoom/Pan, navigation intuitive
- 📖 **Timeline Immersive** - Frise chronologique par décennie
- 📚 **Stories Engageantes** - Histoires familiales avec cover images
- ♿ **Accessible** - WCAG AA compliant
- 📱 **Responsive** - Mobile, tablette, desktop

👉 **Voir**: [NOUVEAU_DESIGN_SYNTHESE.md](NOUVEAU_DESIGN_SYNTHESE.md) pour plus de détails

---

## 📋 Table des Matières

- [Présentation](#présentation)
- [Nouveau Design](#nouveau-design-2025)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Documentation](#documentation)
- [Structure du Projet](#structure-du-projet)
- [API Documentation](#api-documentation)
- [Base de Données](#base-de-données)
- [Contribuer](#contribuer)

## 🎯 Présentation

Le projet d'arbre généalogique est une application web moderne qui permet aux familles de :
- 🌳 Gérer leur arbre généalogique de manière visuelle et interactive
- 📖 Partager des histoires et souvenirs familiaux
- 🕒 Visualiser l'histoire familiale sur une frise chronologique
- 👥 Gérer les membres avec informations détaillées
- 💍 Enregistrer mariages et unions (support polygamie)
- 🎉 Gérer événements familiaux (naissances, mariages, etc.)
- 🔒 Sécuriser l'accès avec authentification JWT

## ✨ Fonctionnalités

### 🎨 Nouveau Design System
- ✅ **Design moderne** inspiré par Apple & Notion
- ✅ **Animations fluides** (Framer Motion)
- ✅ **Arbre interactif** avec zoom/pan
- ✅ **Timeline** par décennie avec icônes
- ✅ **Stories** avec cover images et catégories
- ✅ **5 couleurs** par famille pour clarté
- ✅ **Responsive** mobile/tablette/desktop
- ✅ **Accessible** WCAG AA

### Gestion des Membres
- ✅ Création, modification et suppression de profils
- ✅ Informations détaillées (nom, prénom, date de naissance, ville, activité, etc.)
- ✅ Gestion des photos de profil
- ✅ Statut vivant/décédé avec date de décès
- ✅ **Cartes modernes** avec 3 variantes (tree, list, compact)

### Mariages et Relations
- ✅ Enregistrement des mariages (monogamie/polygamie)
- ✅ Gestion des divorces
- ✅ Historique des unions
- ✅ **Visualisation** dans l'arbre avec lignes roses

### Événements et Timeline
- ✅ Gestion d'événements (naissances, mariages, décès, etc.)
- ✅ **Frise chronologique** verticale par décennie
- ✅ **Icônes** par type d'événement
- ✅ **Animations** d'apparition stagger

### Histoires Familiales (Nouveau)
- ✅ **Grid responsive** d'histoires
- ✅ **Catégories** (souvenir, tradition, recette, anecdote, histoire)
- ✅ **Cover images** avec overlay gradient
- ✅ **Modal détail** plein écran
- ✅ **Stats** (likes, commentaires, vues)

### Arbre Généalogique
- ✅ Visualisation graphique interactive
- ✅ **Zoom/Pan** fluide (molette souris)
- ✅ **Connexions SVG** animées
- ✅ **Mode plein écran**
- ✅ **Légende** par génération
- ✅ Navigation entre les générations
- ✅ Filtres et recherches

### Authentification et Sécurité
- ✅ Connexion sécurisée avec JWT
- ✅ Mots de passe hashés avec BCrypt
- ✅ Niveaux d'accès (Utilisateur, Modérateur, Admin)

## 🏗 Architecture

L'application suit une architecture trois couches :

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Chakra UI
│   (Port 3000)   │
└────────┬────────┘
         │ HTTP/REST
┌────────┴────────┐
│   Backend API   │  ASP.NET Core 8.0
│   (Port 5000)   │
└────────┬────────┘
         │ Entity Framework
┌────────┴────────┐
│   PostgreSQL    │  Base de données relationnelle
│   (Port 5432)   │
└─────────────────┘
```

## 🛠 Technologies

### Backend
- **ASP.NET Core 9.0** - Framework web
- **Entity Framework Core** - ORM
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **BCrypt.Net** - Hashage des mots de passe
- **Swagger** - Documentation API

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Langage typé
- **Vite** - Build tool
- **Chakra UI** - Composants UI
- **Framer Motion** - Animations ✨ (Nouveau)
- **React Zoom Pan Pinch** - Arbre interactif ✨ (Nouveau)
- **React Router** - Navigation
- **Axios** - Client HTTP

### Design System ✨ (Nouveau)
- **Poppins** - Font headings
- **Inter** - Font body
- **5 couleurs** par famille (#FF6B6B, #4ECDC4, #45B7D1, #FFA07A, #98D8C8)

### Responsive Design 📱 (Nouveau)
- **Mobile-first** - Conçu d'abord pour mobile
- **Breakpoints** - base (mobile), md (tablette), lg (desktop)
- **Composants adaptifs** - ResponsiveContainer, ResponsiveGrid, ResponsiveStack
- **Hooks utilitaires** - useIsMobile, useDevice, useResponsive*
- **Props responsive** - Toutes les propriétés Chakra UI supportées
- **Debug tools** - ResponsiveDebug pour visualiser les breakpoints
- **Grid 8px** - Espacements harmonieux
- **Bordures arrondies** - 16-24px
- **Ombres douces** - card, float, xl, 2xl
- **Animations** - fadeIn, slideIn, scale, pulse, spring

## 📚 Documentation

### Guides Complets
- 📖 [**Design System**](docs/DESIGN_SYSTEM.md) - Guide complet du design system (500+ lignes)
- 🛠️ [**Implémentation UX/UI**](docs/IMPLEMENTATION_UX_UI.md) - Guide d'implémentation (500+ lignes)

### Résumés
- 🎨 [**Redesign Complet**](REDESIGN_COMPLETE.md) - Résumé exhaustif (500+ lignes)
- ✨ [**Nouveau Design Synthèse**](NOUVEAU_DESIGN_SYNTHESE.md) - Synthèse concise (300+ lignes)

### Outils
- ✅ [**Checklist Implémentation**](CHECKLIST_IMPLEMENTATION.md) - Checklist par phase (400+ lignes)
- 📊 [**Guide Visuel**](GUIDE_VISUEL.md) - Guide visuel ASCII (500+ lignes)
- 📋 [**Récapitulatif Final**](RECAPITULATIF_FINAL.md) - Vue d'ensemble (600+ lignes)

### Autres Guides
- 🚀 [**Quick Start**](QUICKSTART.md) - Démarrage rapide
- 🔧 [**Installation**](docs/INSTALLATION.md) - Guide d'installation détaillé
- 📡 [**API Documentation**](docs/API.md) - Endpoints et exemples

## 📦 Installation

### Prérequis

- .NET SDK 8.0+
- Node.js 18+ et npm
- PostgreSQL 14+

### 1. Cloner le projet

```bash
git clone <repository-url>
cd projet
```

### 2. Configurer la base de données

```bash
# Créer la base de données PostgreSQL
createdb FamilyTreeDB

# Exécuter le script d'initialisation
psql -d FamilyTreeDB -f database/init.sql
```

### 3. Configurer le backend

```bash
cd backend

# Modifier appsettings.json avec vos informations de connexion PostgreSQL
# Restaurer les packages NuGet
dotnet restore

# Exécuter les migrations (si vous utilisez EF migrations)
dotnet ef database update

# Lancer l'API
dotnet run
```

L'API sera disponible sur `http://localhost:5000`

### 4. Configurer le frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer l'application
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## ⚙️ Configuration

### Backend (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=FamilyTreeDB;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "Key": "VotreCléSecrèteTrèsLonguePourJWT",
    "Issuer": "FamilyTreeAPI",
    "Audience": "FamilyTreeUsers"
  }
}
```

### Frontend (`vite.config.ts`)

Le proxy est configuré pour rediriger les appels API vers le backend :

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    }
  }
}
```

## 🚀 Utilisation

### Se connecter

1. Accédez à `http://localhost:3000`
2. Utilisez les identifiants par défaut :
   - **Nom d'utilisateur** : pierre.dupont
   - **Mot de passe** : password123

### Naviguer dans l'application

- **Dashboard** : Page d'accueil avec accès rapide aux fonctionnalités
- **Arbre Généalogique** : Visualisation graphique de la famille
- **Mon Profil** : Vos informations personnelles
- **Membres** : Liste de tous les membres de la famille

## 📁 Structure du Projet

```
projet/
├── backend/                    # API ASP.NET Core
│   ├── Controllers/           # Contrôleurs API
│   │   ├── AuthController.cs
│   │   └── PersonsController.cs
│   ├── Data/                  # Contexte Entity Framework
│   │   └── FamilyTreeContext.cs
│   ├── Models/                # Modèles de données
│   │   ├── City.cs
│   │   ├── Connexion.cs
│   │   ├── Family.cs
│   │   ├── Person.cs
│   │   └── Wedding.cs
│   ├── appsettings.json       # Configuration
│   ├── Program.cs             # Point d'entrée
│   └── FamilyTreeAPI.csproj   # Fichier projet .NET
│
├── frontend/                   # Application React
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   │   └── PrivateRoute.tsx
│   │   ├── contexts/          # Contextes React
│   │   │   └── AuthContext.tsx
│   │   ├── pages/             # Pages de l'application
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FamilyTree.tsx
│   │   │   ├── Login.tsx
│   │   │   └── PersonProfile.tsx
│   │   ├── services/          # Services API
│   │   │   └── api.ts
│   │   ├── types/             # Types TypeScript
│   │   │   └── index.ts
│   │   ├── App.tsx            # Composant racine
│   │   └── main.tsx           # Point d'entrée
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── database/                   # Scripts SQL
│   └── init.sql               # Script d'initialisation
│
├── docs/                       # Documentation
│   ├── API.md                 # Documentation API REST
│   ├── INSTALLATION.md        # Guide d'installation
│   ├── DESIGN_SYSTEM.md       # Système de design ✨
│   ├── TREE_VISUALIZATION.md  # Visualisation d'arbre ✨
│   ├── RESPONSIVE_INDEX.md    # Index responsive 📱 (Nouveau)
│   ├── RESPONSIVE_RECAP.md    # Récapitulatif responsive 📱
│   ├── RESPONSIVE_DESIGN_GUIDE.md    # Guide théorique 📱
│   ├── RESPONSIVE_EXEMPLES.md        # Exemples pratiques 📱
│   └── RESPONSIVE_REFACTORING.md     # Guide transformation 📱
│
└── README.md                   # Ce fichier
```

## 📚 API Documentation

### Endpoints d'authentification

#### POST /api/auth/login
Connexion utilisateur

**Request:**
```json
{
  "userName": "pierre.dupont",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "connexionID": 1,
    "userName": "pierre.dupont",
    "level": 3,
    "idPerson": 3,
    "familyID": 1,
    "personName": "Pierre Dupont",
    "familyName": "Famille Dupont"
  }
}
```

#### POST /api/auth/register
Inscription d'un nouvel utilisateur

**Request:**
```json
{
  "userName": "nouveau.user",
  "password": "motdepasse",
  "email": "user@example.com",
  "idPerson": 5
}
```

### Endpoints des personnes

#### GET /api/persons
Récupère toutes les personnes

**Headers:** `Authorization: Bearer <token>`

#### GET /api/persons/{id}
Récupère une personne par ID

#### GET /api/persons/family/{familyId}
Récupère toutes les personnes d'une famille

#### POST /api/persons
Crée une nouvelle personne

**Request:**
```json
{
  "lastName": "Dupont",
  "firstName": "Jean",
  "birthday": "1990-01-01",
  "sex": "M",
  "activity": "Ingénieur",
  "alive": true,
  "cityID": 1,
  "familyID": 1,
  "fatherID": null,
  "motherID": null
}
```

#### PUT /api/persons/{id}
Met à jour une personne

#### DELETE /api/persons/{id}
Supprime une personne

## 🗄 Base de Données

### Schéma relationnel

```
City (CityID, Name, CountryName)
  ↓
Person (PersonID, LastName, FirstName, Birthday, Sex, Activity, 
        Alive, DeathDate, PhotoUrl, Notes, FatherID*, MotherID*, 
        CityID*, FamilyID*)
  ↓
Family (FamilyID, FamilyName, Description, CreatedDate)

Wedding (WeddingID, ManID*, WomanID*, WeddingDate, DivorceDate,
         IsActive, Location, Notes)

Connexion (ConnexionID, UserName, Password, Level, IDPerson*,
           FamilyID*, Email, CreatedDate, LastLoginDate, IsActive)
```

### Contraintes principales

- Une personne peut avoir un père et une mère (optionnels)
- Une personne appartient à une seule famille
- Une personne est associée à une ville
- Un utilisateur est lié à une personne unique
- Les mariages lient un homme et une femme
- Support de la polygamie (un homme peut avoir plusieurs mariages)

## 🤝 Contribuer

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

Développé dans le cadre du projet d'arbre généalogique familial.

## 🐛 Signaler un Bug

Utilisez les Issues GitHub pour signaler des bugs ou demander des fonctionnalités.

## 📞 Support

Pour toute question, contactez l'équipe de développement.
