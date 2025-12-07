#!/bin/bash

echo "🚀 ================================"
echo "🚀  PUSH CODE VERS GITHUB"
echo "🚀 ================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si on est dans un repo Git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Erreur : Pas de repository Git détecté${NC}"
    echo "Exécutez d'abord : git init"
    exit 1
fi

# Afficher le status actuel
echo -e "${BLUE}📊 Status actuel :${NC}"
git status --short

echo ""
echo -e "${YELLOW}📝 Fichiers préparés pour le déploiement :${NC}"
echo "   ✅ backend/Dockerfile"
echo "   ✅ backend/.dockerignore"
echo "   ✅ backend/appsettings.Production.json"
echo "   ✅ backend/Program.cs (CORS mis à jour)"
echo "   ✅ frontend/vercel.json"
echo "   ✅ frontend/.env.example"
echo "   ✅ frontend/src/services/api.ts (VITE_API_URL)"
echo "   ✅ DEPLOIEMENT_PRODUCTION.md"
echo "   ✅ CHECKLIST_DEPLOIEMENT.md"
echo "   ✅ DEPLOY_QUICK_START.md"
echo "   ✅ DEPLOIEMENT_SIMPLE.md"
echo "   ✅ RECAP_DEPLOIEMENT.md"
echo ""

# Demander confirmation
read -p "Voulez-vous commiter et pusher ces changements ? (o/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    echo -e "${YELLOW}⏸️  Opération annulée${NC}"
    exit 0
fi

# Add tous les fichiers
echo -e "${BLUE}📦 Ajout des fichiers...${NC}"
git add .

# Commit
echo -e "${BLUE}💾 Création du commit...${NC}"
git commit -m "🚀 Préparation déploiement production (Vercel + Render + Neon)

✨ Nouvelles fonctionnalités :
- Dockerfile backend pour Render.com
- Configuration Vercel pour frontend
- CORS mis à jour (support domaines production)
- Variables d'environnement configurées
- Documentation complète déploiement

📚 Documentation ajoutée :
- DEPLOIEMENT_PRODUCTION.md (guide complet)
- CHECKLIST_DEPLOIEMENT.md (checklist pas à pas)
- DEPLOY_QUICK_START.md (déploiement 15 min)
- DEPLOIEMENT_SIMPLE.md (mode d'emploi simplifié)
- RECAP_DEPLOIEMENT.md (récapitulatif)

🎯 Stack de production :
- Frontend : Vercel (React + Vite)
- Backend : Render.com (ASP.NET Core + Docker)
- Database : Neon.tech (PostgreSQL)

💰 Coût : 0€ (plans gratuits)
⏱️  Temps de déploiement : 15-20 min
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Commit créé avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors du commit${NC}"
    exit 1
fi

# Push
echo -e "${BLUE}☁️  Push vers GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ================================${NC}"
    echo -e "${GREEN}🎉  CODE PUSHÉ AVEC SUCCÈS${NC}"
    echo -e "${GREEN}🎉 ================================${NC}"
    echo ""
    echo -e "${YELLOW}📝 Prochaines étapes :${NC}"
    echo ""
    echo "1️⃣  Créer base de données Neon.tech"
    echo "   → https://neon.tech"
    echo ""
    echo "2️⃣  Déployer backend sur Render.com"
    echo "   → https://render.com"
    echo "   → New Web Service → Connect GitHub"
    echo ""
    echo "3️⃣  Déployer frontend sur Vercel"
    echo "   → https://vercel.com"
    echo "   → New Project → Import from GitHub"
    echo ""
    echo "📖 Guide complet : DEPLOIEMENT_SIMPLE.md"
    echo ""
else
    echo -e "${RED}❌ Erreur lors du push${NC}"
    echo ""
    echo "Vérifiez :"
    echo "1. Que vous avez configuré votre remote GitHub"
    echo "2. Que vous avez les droits d'écriture sur le repo"
    echo "3. Que vous êtes connecté à Internet"
    echo ""
    echo "Commandes utiles :"
    echo "  git remote -v              # Voir les remotes"
    echo "  git remote add origin URL  # Ajouter remote"
    echo "  git push -u origin main    # Push avec upstream"
    exit 1
fi
