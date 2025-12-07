#!/bin/bash

echo "🚀 ================================"
echo "🚀  TEST BUILD PRODUCTION LOCAL"
echo "🚀 ================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Build Backend Docker
echo -e "${BLUE}📦 Étape 1/3 : Build Docker Backend${NC}"
echo "-----------------------------------"
cd backend || exit
docker build -t family-tree-api:test .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend Docker build réussi${NC}"
else
    echo -e "${RED}❌ Erreur lors du build Docker${NC}"
    exit 1
fi

echo ""

# 2. Build Frontend
echo -e "${BLUE}📦 Étape 2/3 : Build Frontend${NC}"
echo "-----------------------------------"
cd ../frontend || exit
npm install
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build réussi${NC}"
else
    echo -e "${RED}❌ Erreur lors du build Frontend${NC}"
    exit 1
fi

echo ""

# 3. Vérifier les fichiers de production
echo -e "${BLUE}📦 Étape 3/3 : Vérification${NC}"
echo "-----------------------------------"

# Vérifier dist frontend
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Dossier dist/ créé ($(du -sh dist | cut -f1))${NC}"
else
    echo -e "${RED}❌ Dossier dist/ introuvable${NC}"
fi

# Vérifier Dockerfile backend
cd ../backend || exit
if [ -f "Dockerfile" ]; then
    echo -e "${GREEN}✅ Dockerfile backend présent${NC}"
else
    echo -e "${RED}❌ Dockerfile backend introuvable${NC}"
fi

# Vérifier appsettings.Production.json
if [ -f "appsettings.Production.json" ]; then
    echo -e "${GREEN}✅ appsettings.Production.json présent${NC}"
else
    echo -e "${RED}❌ appsettings.Production.json introuvable${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ================================${NC}"
echo -e "${GREEN}🎉  BUILD DE TEST TERMINÉ${NC}"
echo -e "${GREEN}🎉 ================================${NC}"
echo ""
echo "📝 Prochaines étapes :"
echo "   1. Pusher le code sur GitHub"
echo "   2. Connecter Render.com au repo (backend)"
echo "   3. Connecter Vercel au repo (frontend)"
echo "   4. Configurer les variables d'environnement"
echo ""
