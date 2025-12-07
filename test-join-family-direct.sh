#!/bin/bash

echo "🧪 TEST ENDPOINT ATOMIQUE: /api/auth/join-family"
echo ""
echo "📋 Envoi d'une requête de test..."
echo ""

curl -X POST http://localhost:5000/api/auth/join-family \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-atomic@example.com",
    "password": "SecurePass123!",
    "firstName": "Jean",
    "lastName": "Test",
    "sex": "M",
    "birthDate": "1990-05-15",
    "birthCountry": "France",
    "birthCity": "Paris",
    "residenceCountry": "France",
    "residenceCity": "Lyon",
    "activity": "Ingénieur",
    "phone": "+33612345678",
    "inviteCode": "KAM6644"
  }' \
  -v

echo ""
echo ""
echo "📊 RÉSULTATS ATTENDUS:"
echo "   ✅ HTTP 200 OK (si le code invitation est valide)"
echo "   ✅ Réponse JSON avec 'token' et 'user'"
echo ""
echo "   OU"
echo ""
echo "   ⚠️  HTTP 400 Bad Request (si le code est invalide)"
echo "   ⚠️  Message: 'Code d'invitation invalide ou expiré'"
echo ""
echo "📝 NOTE:"
echo "   Si vous voyez HTTP 403 Forbidden, c'est que [AllowAnonymous] ne fonctionne pas."
