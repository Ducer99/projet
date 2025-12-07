#!/bin/bash

echo "🔄 REDÉMARRAGE DU FRONTEND POUR APPLIQUER LES CORRECTIONS..."
echo ""

# Tuer le processus Vite
echo "🛑 Arrêt du serveur Vite..."
pkill -f "vite"
sleep 2

# Redémarrer le frontend
echo "🚀 Redémarrage du frontend..."
cd frontend
npm run dev &
sleep 5

echo ""
echo "✅ Frontend redémarré !"
echo ""
echo "📝 CORRECTION APPLIQUÉE:"
echo "   - Routes atomiques ajoutées aux publicRoutes:"
echo "     ✅ /auth/create-family"
echo "     ✅ /auth/join-family"
echo ""
echo "🧪 MAINTENANT TESTEZ:"
echo "   1. Ouvrir http://localhost:3000/register"
echo "   2. Remplir les 3 steps"
echo "   3. Vérifier dans Network Tab:"
echo "      ✅ POST /api/auth/join-family (via proxy Vite)"
echo "      ✅ Proxied to: http://localhost:5000/api/auth/join-family"
echo "      ✅ Status 200 (au lieu de 403)"
echo ""
echo "⚠️  ERREUR PRÉCÉDENTE:"
echo "   ❌ 403 Forbidden - Routes atomiques non déclarées publiques"
echo "   ❌ Interceptor essayait d'ajouter un token inexistant"
echo ""
echo "✅ SOLUTION:"
echo "   ✅ Ajout de create-family et join-family aux publicRoutes"
echo "   ✅ Pas de token requis pour ces endpoints"
