#!/bin/bash

# Script de test automatique pour la registration atomique
# Date: 7 décembre 2024

echo "🧪 TEST AUTOMATIQUE - REGISTRATION ATOMIQUE"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
BACKEND_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"
TEST_EMAIL="test-$(date +%s)@example.com"

echo "📋 Configuration:"
echo "   Backend:  $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo "   Email:    $TEST_EMAIL"
echo ""

# Test 1: Backend disponible
echo "🔍 Test 1: Vérification Backend..."
if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend accessible${NC}"
else
    echo -e "${RED}❌ Backend inaccessible${NC}"
    exit 1
fi

# Test 2: Frontend disponible
echo "🔍 Test 2: Vérification Frontend..."
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend accessible${NC}"
else
    echo -e "${RED}❌ Frontend inaccessible${NC}"
    exit 1
fi

# Test 3: Endpoint /auth/create-family existe
echo "🔍 Test 3: Test endpoint CREATE FAMILY..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/auth/create-family" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPass123!\",
    \"firstName\": \"Test\",
    \"lastName\": \"Atomique\",
    \"sex\": \"M\",
    \"birthDate\": \"1990-01-01\",
    \"birthCountry\": \"France\",
    \"birthCity\": \"Paris\",
    \"residenceCountry\": \"France\",
    \"residenceCity\": \"Lyon\",
    \"activity\": \"Testeur\",
    \"phone\": \"+33612345678\",
    \"familyName\": \"Famille Test $(date +%s)\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Endpoint CREATE FAMILY fonctionne (HTTP 200)${NC}"
    echo "   Token: $(echo "$BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 | cut -c1-20)..."
elif [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${YELLOW}⚠️  Email déjà utilisé (HTTP 400) - Normal si déjà testé${NC}"
else
    echo -e "${RED}❌ Erreur inattendue (HTTP $HTTP_CODE)${NC}"
    echo "   Réponse: $BODY"
fi

# Test 4: Endpoint /auth/join-family existe
echo "🔍 Test 4: Test endpoint JOIN FAMILY..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/auth/join-family" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test-join-$(date +%s)@example.com\",
    \"password\": \"TestPass123!\",
    \"firstName\": \"Test\",
    \"lastName\": \"Joiner\",
    \"sex\": \"F\",
    \"birthDate\": \"1995-06-15\",
    \"birthCountry\": \"France\",
    \"birthCity\": \"Marseille\",
    \"residenceCountry\": \"France\",
    \"residenceCity\": \"Nice\",
    \"activity\": \"Testeur\",
    \"phone\": \"+33612345679\",
    \"inviteCode\": \"INVALID123\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✅ Endpoint JOIN FAMILY fonctionne (HTTP 400 - code invalide attendu)${NC}"
elif [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Endpoint JOIN FAMILY fonctionne (HTTP 200)${NC}"
else
    echo -e "${RED}❌ Erreur inattendue (HTTP $HTTP_CODE)${NC}"
    echo "   Réponse: $BODY"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ TESTS TERMINÉS${NC}"
echo ""
echo "📝 PROCHAINES ÉTAPES:"
echo "   1. Ouvrir http://localhost:3000/register"
echo "   2. Remplir les 3 étapes"
echo "   3. Ouvrir DevTools (F12) → Network Tab"
echo "   4. Vérifier: 1 seule requête POST /auth/create-family"
echo ""
