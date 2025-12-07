# 🌳 Family Tree - Application Généalogique

Une application web moderne pour créer et gérer votre arbre généalogique familial avec support multilingue (Français + Anglais).

## 🚀 Déploiement en Production

**L'application est prête pour être déployée en production !**

### ⚡ Déploiement Rapide (15 minutes)

```bash
# 1. Pusher le code sur GitHub
./push-to-github.sh

# 2. Suivre le guide simplifié
Ouvrir : DEPLOIEMENT_SIMPLE.md
```

### 📚 Documentation Complète

| Guide | Usage | Niveau |
|-------|-------|--------|
| **[INDEX_DOCUMENTATION.md](./INDEX_DOCUMENTATION.md)** | 📚 Index de toute la documentation | Tous |
| **[DEPLOIEMENT_SIMPLE.md](./DEPLOIEMENT_SIMPLE.md)** | 🚀 Mode d'emploi ultra-simple | Débutant |
| **[DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)** | ⚡ Déploiement rapide | Intermédiaire |
| **[DEPLOIEMENT_PRODUCTION.md](./DEPLOIEMENT_PRODUCTION.md)** | 📖 Guide complet (10 pages) | Avancé |
| **[CHECKLIST_DEPLOIEMENT.md](./CHECKLIST_DEPLOIEMENT.md)** | ☑️ Checklist pas à pas | Tous |

---

## 🏗️ Architecture

### Stack Technique

```
Frontend  → React + TypeScript + Vite + Chakra UI
Backend   → ASP.NET Core 8.0 + Entity Framework
Database  → PostgreSQL 16
Auth      → JWT + BCrypt
I18n      → react-i18next (FR + EN)
```

### Architecture de Déploiement

```
🌍 Utilisateurs
      │
      ├──► 🎨 Vercel (Frontend)
      │    └─ https://your-app.vercel.app
      │
      └──► ⚙️ Render.com (Backend)
           └─ https://family-tree-api.onrender.com
           │
           └──► 🗄️ Neon.tech (Database)
                └─ postgresql://...
```

**Coût** : 0€/mois (plans gratuits)

---

## 💻 Développement Local

### Prérequis

- Node.js 18+
- .NET 8.0 SDK
- PostgreSQL 16

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/projet.git
cd projet

# 2. Installer les dépendances frontend
cd frontend
npm install

# 3. Restaurer les packages backend
cd ../backend
dotnet restore

# 4. Configurer la base de données
# Modifier appsettings.json avec votre connection string PostgreSQL
dotnet ef database update

# 5. Lancer les serveurs
# Terminal 1 - Backend
cd backend && dotnet run

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### URLs de développement

- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:5000
- **API** : http://localhost:5000/api

---

## ✨ Fonctionnalités

### ✅ Implémentées

- [x] **Authentification**
  - Inscription atomique (1 requête au lieu de 4)
  - Connexion JWT
  - Gestion de session
  - Mot de passe chiffré (BCrypt)

- [x] **Gestion des Membres**
  - Création de profils complets
  - Modification (permissions strictes)
  - Suppression (règles admin)
  - Photos de profil

- [x] **Arbre Généalogique**
  - Vue dynamique interactive
  - Support polygamie
  - Zoom/Navigation
  - Génération automatique

- [x] **Dashboard**
  - Statistiques famille
  - Membres récents
  - Événements à venir
  - Mariages

- [x] **Internationalisation**
  - Français complet
  - Anglais complet
  - Changement de langue dynamique

- [x] **Design**
  - Interface moderne (Chakra UI)
  - Responsive (mobile + desktop)
  - Animations fluides (Framer Motion)
  - Thème cohérent

### 🔜 À venir

- [ ] Événements récurrents (anniversaires)
- [ ] Albums photos familiaux
- [ ] Sondages familiaux
- [ ] Export PDF de l'arbre
- [ ] Partage public (lien invité)

---

## 🎯 Permissions et Règles

### Règles d'édition (Self-Edit)

Un membre peut modifier une fiche si :
1. **Admin** : Accès complet à tout
2. **Créateur** : A créé la fiche
3. **Membre** : C'est sa propre fiche
4. **Parent** : Est parent de la personne
5. **Enfant** : Est enfant de la personne

### Règles de suppression

- **Créateur** : Peut supprimer pendant 24h après création
- **Admin** : Peut tout supprimer (avec approbation)
- **Super Admin** : Peut tout supprimer immédiatement

---

## 📖 Documentation Technique

### Backend (ASP.NET Core)

- **Controllers** : `backend/Controllers/`
  - `AuthController.cs` - Authentification atomique
  - `PersonsController.cs` - CRUD membres + permissions
  - `WeddingsController.cs` - Gestion mariages
  - `EventsController.cs` - Événements familiaux

- **Models** : `backend/Models/`
  - `Connexion.cs` - Comptes utilisateurs
  - `Person.cs` - Profils membres
  - `Family.cs` - Familles
  - `Wedding.cs` - Mariages
  - `Event.cs` - Événements

- **Database** : `backend/Data/`
  - `FamilyTreeContext.cs` - Contexte EF Core
  - Migrations dans `Migrations/`

### Frontend (React + TypeScript)

- **Pages** : `frontend/src/pages/`
  - `RegisterV4Premium.tsx` - Inscription atomique
  - `Dashboard.tsx` - Tableau de bord
  - `MembersManagementDashboard.tsx` - Gestion membres
  - `FamilyTreeDynamic.tsx` - Arbre interactif

- **Services** : `frontend/src/services/`
  - `api.ts` - Client Axios configuré

- **I18n** : `frontend/src/i18n/locales/`
  - `fr.json` - Traductions françaises
  - `en.json` - Traductions anglaises

---

## 🧪 Tests

### Test de Build Local

```bash
# Tester que Docker + npm build fonctionnent
./test-build-production.sh
```

### Test des Endpoints

```bash
# Backend
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```

---

## 🐛 Dépannage

### Erreur CORS

```bash
Symptôme : "Access-Control-Allow-Origin" dans DevTools
Solution : Vérifier configuration CORS dans backend/Program.cs
```

### Backend ne démarre pas

```bash
Symptôme : dotnet run échoue
Solution : 
  1. Vérifier connection string PostgreSQL
  2. Vérifier que PostgreSQL est lancé
  3. Appliquer migrations : dotnet ef database update
```

### Frontend erreur 404

```bash
Symptôme : Page non trouvée
Solution : 
  1. Vérifier que backend tourne (localhost:5000)
  2. Vérifier configuration proxy Vite
  3. Vérifier api.ts (baseURL: '/api')
```

---

## 📊 Statistiques du Projet

- **Backend** : ~15 000 lignes C#
- **Frontend** : ~20 000 lignes TypeScript/TSX
- **Models** : 8 entités principales
- **Controllers** : 6 contrôleurs REST
- **Pages** : 15+ pages React
- **Traductions** : 500+ clés i18n (FR + EN)
- **Documentation** : 10+ fichiers MD

---

## 🤝 Contribution

### Workflow Git

```bash
# 1. Créer une branche
git checkout -b feature/ma-fonctionnalite

# 2. Faire vos modifications
git add .
git commit -m "feat: ma nouvelle fonctionnalité"

# 3. Pusher
git push origin feature/ma-fonctionnalite

# 4. Créer une Pull Request sur GitHub
```

### Standards de Code

- **Backend** : PascalCase, async/await, LINQ
- **Frontend** : camelCase, hooks React, TypeScript strict
- **Commits** : Convention Conventional Commits

---

## 📞 Support

### Documentation

- [Index Documentation](./INDEX_DOCUMENTATION.md)
- [Guide Testeurs](./GUIDE_TEST_UTILISATEURS.md)

### Ressources Externes

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [ASP.NET Core](https://learn.microsoft.com/aspnet/core)
- [React](https://react.dev)

---

## 📄 Licence

Ce projet est privé. Tous droits réservés.

---

## 👥 Auteurs

- **Développeur Principal** : Votre Nom
- **Assistance IA** : GitHub Copilot

---

## 🎉 Remerciements

Merci aux technologies open-source utilisées :
- ASP.NET Core Team
- React Team
- Chakra UI
- Framer Motion
- react-i18next

---

**Date de dernière mise à jour** : 7 décembre 2024  
**Version** : 1.0.0  
**Statut** : ✅ Prêt pour production

---

## 🚀 Prêt à déployer ?

```bash
# Suivre le guide de déploiement
cat DEPLOIEMENT_SIMPLE.md
```

**Bon déploiement ! 💪**
