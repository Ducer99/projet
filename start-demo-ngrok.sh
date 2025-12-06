#!/bin/bash

# 🚀 Script de démo Ngrok - Partage rapide avec vos amis
# Lance l'app localement et crée des tunnels publics

echo "=========================================="
echo "🚀 DEMO NGROK - Partage avec vos amis"
echo "=========================================="
echo ""

# Vérifier si Ngrok est installé
if ! command -v ngrok &> /dev/null; then
    echo "❌ Ngrok n'est pas installé"
    echo "📦 Installation automatique avec Homebrew..."
    brew install ngrok
    echo "✅ Ngrok installé"
    echo ""
    echo "⚠️  IMPORTANT : Configurez votre authtoken maintenant"
    echo "   1. Créez un compte sur https://ngrok.com"
    echo "   2. Récupérez votre authtoken"
    echo "   3. Exécutez : ngrok config add-authtoken VOTRE_TOKEN"
    echo ""
    exit 1
fi

echo "📋 Vérification des prérequis..."

# Vérifier PostgreSQL
if ! psql -h localhost -U ducer -d FamilyTreeDB -c "SELECT 1" &> /dev/null; then
    echo "⚠️  La base de données PostgreSQL n'est pas accessible"
    echo "   Assurez-vous qu'elle tourne : brew services start postgresql"
fi

echo "✅ Prérequis OK"
echo ""

# Nettoyer les anciens processus
echo "🧹 Nettoyage des anciens processus..."
pkill -f "dotnet.*FamilyTreeAPI" 2>/dev/null
pkill -f "vite.*3000" 2>/dev/null
pkill -f ngrok 2>/dev/null
sleep 2
echo "✅ Nettoyage terminé"
echo ""

# Démarrer le Backend
echo "🔧 Démarrage du Backend (ASP.NET Core)..."
cd backend
dotnet run > ../logs-backend.txt 2>&1 &
BACKEND_PID=$!
cd ..

echo "   Backend PID: $BACKEND_PID"
echo "   Logs: logs-backend.txt"
echo "   Attente démarrage (10 sec)..."
sleep 10

# Vérifier que le backend répond
if curl -s http://localhost:5000/api/auth/health > /dev/null 2>&1; then
    echo "   ✅ Backend opérationnel sur http://localhost:5000"
else
    echo "   ⚠️  Backend démarré mais peut-être pas prêt"
fi
echo ""

# Démarrer le Frontend
echo "⚛️  Démarrage du Frontend (React + Vite)..."
cd frontend
npm run dev > ../logs-frontend.txt 2>&1 &
FRONTEND_PID=$!
cd ..

echo "   Frontend PID: $FRONTEND_PID"
echo "   Logs: logs-frontend.txt"
echo "   Attente démarrage (10 sec)..."
sleep 10

# Vérifier que le frontend répond
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend opérationnel sur http://localhost:3000"
else
    echo "   ⚠️  Frontend démarré mais peut-être pas prêt"
fi
echo ""

# Créer les tunnels Ngrok
echo "🌐 Création des tunnels Ngrok..."
echo ""

# Tunnel Frontend
echo "📱 Tunnel Frontend (port 3000)..."
ngrok http 3000 --log=stdout > logs-ngrok-frontend.txt 2>&1 &
NGROK_FRONTEND_PID=$!
sleep 3

# Extraire l'URL du tunnel frontend
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok-free.app' | head -1)

if [ -z "$FRONTEND_URL" ]; then
    echo "⚠️  Impossible de récupérer l'URL Ngrok Frontend"
    echo "   Vérifiez manuellement sur http://localhost:4040"
else
    echo "✅ Tunnel Frontend créé : $FRONTEND_URL"
fi
echo ""

echo "=========================================="
echo "✨ APPLICATION PRÊTE !"
echo "=========================================="
echo ""
echo "📊 Informations de connexion :"
echo "   • Local Frontend  : http://localhost:3000"
echo "   • Local Backend   : http://localhost:5000"
echo "   • Public Frontend : $FRONTEND_URL"
echo "   • Ngrok Dashboard : http://localhost:4040"
echo ""
echo "📱 Partagez avec vos amis :"
echo "   → Envoyez-leur ce lien : $FRONTEND_URL"
echo ""
echo "📝 Logs en temps réel :"
echo "   • Backend  : tail -f logs-backend.txt"
echo "   • Frontend : tail -f logs-frontend.txt"
echo "   • Ngrok    : tail -f logs-ngrok-frontend.txt"
echo ""
echo "⚠️  IMPORTANT :"
echo "   • Gardez ce terminal OUVERT"
echo "   • Gardez votre Mac ALLUMÉ"
echo "   • L'URL Ngrok change à chaque redémarrage"
echo ""
echo "🛑 Pour arrêter la démo :"
echo "   • Appuyez sur Ctrl+C"
echo "   • Ou exécutez : ./stop-demo.sh"
echo ""
echo "=========================================="
echo ""

# Sauvegarder les PIDs pour l'arrêt
echo "$BACKEND_PID" > .demo-pids
echo "$FRONTEND_PID" >> .demo-pids
echo "$NGROK_FRONTEND_PID" >> .demo-pids

# Fonction de nettoyage à l'arrêt
cleanup() {
    echo ""
    echo "🛑 Arrêt de la démo..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $NGROK_FRONTEND_PID 2>/dev/null
    pkill -f ngrok 2>/dev/null
    rm -f .demo-pids
    echo "✅ Démo arrêtée"
    exit 0
}

trap cleanup INT TERM

# Garder le script actif
echo "⏳ Démo en cours... (Ctrl+C pour arrêter)"
wait
