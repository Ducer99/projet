# Guide d'Installation Rapide

## Prérequis

- .NET SDK 8.0 ou supérieur
- Node.js 18+ et npm
- PostgreSQL 14+

## Installation en 5 Minutes

### 1. Base de Données

```bash
# Créer la base de données
createdb FamilyTreeDB

# Initialiser la structure
psql -d FamilyTreeDB -f database/init.sql
```

### 2. Backend API

```bash
cd backend

# Configurer la connexion dans appsettings.json
# Modifier la chaîne de connexion PostgreSQL

# Restaurer et lancer
dotnet restore
dotnet run
```

Le backend sera sur http://localhost:5000

### 3. Frontend

```bash
cd frontend

# Installer et lancer
npm install
npm run dev
```

Le frontend sera sur http://localhost:3000

## Connexion par défaut

- **Utilisateur** : pierre.dupont
- **Mot de passe** : password123

## En cas de problème

### Le backend ne démarre pas
- Vérifiez que PostgreSQL est lancé
- Vérifiez la chaîne de connexion dans appsettings.json
- Vérifiez que le port 5000 est libre

### Le frontend ne se connecte pas à l'API
- Vérifiez que le backend tourne sur le port 5000
- Vérifiez la configuration du proxy dans vite.config.ts
- Ouvrez la console du navigateur pour voir les erreurs

### Erreur de connexion à la base de données
```bash
# Vérifier que PostgreSQL est actif
pg_isready

# Se connecter manuellement
psql -d FamilyTreeDB -U postgres

# Vérifier les tables
\dt
```

## Prochaines Étapes

1. Explorez le Dashboard
2. Consultez l'arbre généalogique
3. Ajoutez de nouveaux membres
4. Consultez la documentation API sur http://localhost:5000/swagger
