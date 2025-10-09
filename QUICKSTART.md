# 🚀 Guide de Démarrage Rapide

## État actuel du projet

✅ **Frontend** : Prêt et fonctionnel
❌ **Backend** : Nécessite l'installation de .NET SDK 8.0
❌ **Base de données** : Nécessite PostgreSQL

---

## Option 1 : Démarrer uniquement le Frontend (Mode UI Preview)

Le frontend est déjà configuré et peut être lancé immédiatement pour voir l'interface utilisateur.

### Démarrer le frontend

```bash
cd frontend
npm run dev
```

Accédez à : **http://localhost:3000**

**Note:** Sans le backend, vous pourrez voir les pages mais pas vous connecter ni récupérer de données.

---

## Option 2 : Installation Complète (Recommandé)

### Étape 1 : Installer les prérequis

#### A. Installer .NET SDK 8.0

**macOS (avec Homebrew):**
```bash
brew install --cask dotnet-sdk
```

**Ou téléchargez depuis:**
https://dotnet.microsoft.com/download/dotnet/8.0

**Vérifier l'installation:**
```bash
dotnet --version
# Devrait afficher : 8.0.x
```

#### B. Installer PostgreSQL

**macOS (avec Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ou utilisez Postgres.app:**
https://postgresapp.com/

**Vérifier l'installation:**
```bash
psql --version
# Devrait afficher : psql (PostgreSQL) 16.x
```

### Étape 2 : Configurer la Base de Données

```bash
# Créer la base de données
createdb FamilyTreeDB

# Initialiser avec les données de test
psql -d FamilyTreeDB -f database/init.sql
```

**Vérifier:**
```bash
psql -d FamilyTreeDB -c "\dt"
# Devrait lister les tables : City, Family, Person, Wedding, Connexion
```

### Étape 3 : Configurer le Backend

**1. Modifier la connexion PostgreSQL**

Éditez `backend/appsettings.json` :

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=FamilyTreeDB;Username=postgres;Password=VOTRE_MOT_DE_PASSE"
  }
}
```

**Note:** Si vous avez installé PostgreSQL avec Homebrew, le mot de passe par défaut est souvent vide ou "postgres".

**2. Restaurer les packages**

```bash
cd backend
dotnet restore
```

**3. Démarrer le backend**

```bash
dotnet run
```

Le backend sera disponible sur : **http://localhost:5000**
Documentation Swagger : **http://localhost:5000/swagger**

### Étape 4 : Démarrer le Frontend

Dans un nouveau terminal :

```bash
cd frontend
npm run dev
```

Le frontend sera disponible sur : **http://localhost:3000**

---

## 🔑 Connexion par Défaut

Une fois tout configuré, connectez-vous avec :

- **Nom d'utilisateur** : `pierre.dupont`
- **Mot de passe** : `password123`

---

## 🛠 Commandes Utiles

### Frontend
```bash
cd frontend

# Démarrer en mode dev
npm run dev

# Compiler pour production
npm run build

# Prévisualiser la version de production
npm run preview
```

### Backend
```bash
cd backend

# Démarrer l'API
dotnet run

# Compiler
dotnet build

# Nettoyer
dotnet clean
```

### Base de données
```bash
# Se connecter à la base
psql -d FamilyTreeDB

# Lister les tables
\dt

# Voir les données d'une table
SELECT * FROM "Person";

# Quitter
\q

# Réinitialiser complètement
dropdb FamilyTreeDB
createdb FamilyTreeDB
psql -d FamilyTreeDB -f database/init.sql
```

---

## 📋 Vérification de l'Installation

### ✅ Liste de contrôle

- [ ] .NET SDK 8.0 installé (`dotnet --version`)
- [ ] PostgreSQL installé et démarré (`psql --version`)
- [ ] Base de données FamilyTreeDB créée
- [ ] Script init.sql exécuté
- [ ] `backend/appsettings.json` configuré
- [ ] Backend démarre sans erreur (`dotnet run`)
- [ ] Frontend démarre sans erreur (`npm run dev`)
- [ ] Connexion réussie avec pierre.dupont/password123

### 🔍 Tests rapides

**1. Tester le backend:**
```bash
curl http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"pierre.dupont","password":"password123"}'
```

Vous devriez recevoir un token JWT.

**2. Tester le frontend:**

Ouvrez http://localhost:3000 dans votre navigateur. Vous devriez voir la page de connexion.

---

## 🐛 Résolution de Problèmes

### Le backend ne démarre pas

**Erreur : "command not found: dotnet"**
- Installez .NET SDK 8.0 (voir Étape 1A)

**Erreur de connexion à la base de données**
- Vérifiez que PostgreSQL est démarré : `brew services list`
- Vérifiez la chaîne de connexion dans `appsettings.json`
- Testez la connexion manuelle : `psql -d FamilyTreeDB`

**Port 5000 déjà utilisé**
```bash
# Trouver le processus
lsof -ti:5000

# Tuer le processus
kill -9 $(lsof -ti:5000)
```

### Le frontend ne se connecte pas

**Erreur CORS**
- Vérifiez que le backend tourne sur le port 5000
- Vérifiez la configuration CORS dans `backend/Program.cs`

**Erreur 401 Unauthorized**
- Vérifiez que vous utilisez les bons identifiants
- Vérifiez que la table Connexion contient les données de test

### La base de données est vide

```bash
# Réexécuter le script d'initialisation
psql -d FamilyTreeDB -f database/init.sql
```

---

## 📚 Documentation Complète

- **README.md** - Vue d'ensemble du projet
- **docs/INSTALLATION.md** - Guide d'installation détaillé
- **docs/API.md** - Documentation de l'API REST

---

## 🎯 Prochaines Étapes

Une fois l'installation terminée :

1. **Explorez le Dashboard** - Familiarisez-vous avec l'interface
2. **Consultez l'arbre généalogique** - Visualisez la famille exemple
3. **Testez l'API** - Utilisez Swagger (http://localhost:5000/swagger)
4. **Ajoutez des données** - Créez de nouveaux membres de famille
5. **Personnalisez** - Adaptez le projet à vos besoins

---

## 💡 Besoin d'aide ?

- Consultez la documentation dans le dossier `docs/`
- Vérifiez les logs du backend et du frontend
- Assurez-vous que tous les services sont démarrés
