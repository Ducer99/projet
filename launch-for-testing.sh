#!/bin/bash

# 🚀 Script de lancement pour tests externes
# Ce script lance le backend, frontend et expose l'application via ngrok

echo "🌟 =============================================="
echo "🌟  LANCEMENT APPLICATION POUR TESTS EXTERNES"
echo "🌟 =============================================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erreur : Ce script doit être exécuté depuis la racine du projet"
    echo "   Assurez-vous que les dossiers 'backend' et 'frontend' existent"
    exit 1
fi

# Vérifier que ngrok est installé
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok n'est pas installé"
    echo ""
    echo "📥 Installation (choisissez une méthode) :"
    echo "   Sur macOS : brew install ngrok"
    echo "   Ou télécharger : https://ngrok.com/download"
    echo ""
    exit 1
fi

# Fonction pour nettoyer les processus à la fin
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    if [ ! -z "$NGROK_PID" ]; then
        kill $NGROK_PID 2>/dev/null
    fi
    echo "✅ Services arrêtés"
    exit 0
}

# Capturer Ctrl+C pour arrêter proprement
trap cleanup SIGINT SIGTERM

echo "📦 Étape 1/4 : Lancement du backend..."
cd backend
dotnet run > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "   ✅ Backend lancé (PID: $BACKEND_PID)"
echo "   📄 Logs : backend.log"

echo ""
echo "⏳ Attente du démarrage du backend (10 secondes)..."
sleep 10

# Vérifier que le backend répond
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "   ✅ Backend prêt sur http://localhost:5000"
else
    echo "   ⚠️  Le backend ne répond pas sur /health (c'est peut-être normal)"
    echo "   ℹ️  Si des erreurs surviennent, vérifiez backend.log"
fi

echo ""
echo "🎨 Étape 2/4 : Lancement du frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "   ✅ Frontend lancé (PID: $FRONTEND_PID)"
echo "   📄 Logs : frontend.log"

echo ""
echo "⏳ Attente du démarrage du frontend (8 secondes)..."
sleep 8

# Vérifier que le frontend répond
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend prêt sur http://localhost:3000"
else
    echo "   ⚠️  Le frontend ne répond pas encore"
    echo "   ℹ️  Si des erreurs surviennent, vérifiez frontend.log"
fi

echo ""
echo "🌐 Étape 3/4 : Lancement de ngrok..."
ngrok http 3000 > ngrok.log 2>&1 &
NGROK_PID=$!
echo "   ✅ Ngrok lancé (PID: $NGROK_PID)"
echo "   📄 Logs : ngrok.log"

echo ""
echo "⏳ Attente de la création du tunnel ngrok (5 secondes)..."
sleep 5

# Récupérer l'URL publique ngrok
echo ""
echo "🔍 Étape 4/4 : Récupération de l'URL publique..."

# Essayer de récupérer l'URL depuis l'API ngrok
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://.*' | head -n 1)

if [ -z "$NGROK_URL" ]; then
    echo "   ⚠️  Impossible de récupérer automatiquement l'URL ngrok"
    echo ""
    echo "📋 Veuillez suivre ces étapes manuellement :"
    echo "   1. Ouvrir http://localhost:4040 dans votre navigateur"
    echo "   2. Copier l'URL publique (https://xxxxx.ngrok-free.app)"
    echo "   3. Ajouter cette URL dans backend/Program.cs (section CORS)"
    echo "   4. Redémarrer le backend"
else
    echo "   ✅ URL publique récupérée : $NGROK_URL"
    echo ""
    echo "⚠️  ACTION REQUISE :"
    echo "   1. Copiez cette URL : $NGROK_URL"
    echo "   2. Ajoutez-la dans backend/Program.cs :"
    echo ""
    echo "      policy.WithOrigins("
    echo "          \"http://localhost:3000\","
    echo "          \"$NGROK_URL\"  // ← Ajoutez cette ligne"
    echo "      )"
    echo ""
    echo "   3. Appuyez sur Ctrl+C pour arrêter les services"
    echo "   4. Relancez ce script après modification"
fi

echo ""
echo "=========================================="
echo "✅  TOUS LES SERVICES SONT LANCÉS"
echo "=========================================="
echo ""
echo "📊 RÉSUMÉ :"
echo "   🖥️  Backend local   : http://localhost:5000"
echo "   🎨 Frontend local  : http://localhost:3000"
if [ ! -z "$NGROK_URL" ]; then
    echo "   🌐 URL publique    : $NGROK_URL"
fi
echo "   📱 Interface ngrok : http://localhost:4040"
echo ""
echo "📄 LOGS :"
echo "   Backend  : tail -f backend.log"
echo "   Frontend : tail -f frontend.log"
echo "   Ngrok    : tail -f ngrok.log"
echo ""
echo "🔧 CONFIGURATION CORS :"
echo "   N'oubliez pas d'ajouter l'URL ngrok dans backend/Program.cs"
echo "   et de redémarrer le backend après modification !"
echo ""
echo "📧 PARTAGER AUX TESTEURS :"
if [ ! -z "$NGROK_URL" ]; then
    echo "   URL de test : $NGROK_URL"
else
    echo "   Récupérez l'URL sur : http://localhost:4040"
fi
echo "   Guide de test : GUIDE_TEST_UTILISATEURS.md"
echo ""
echo "🛑 ARRÊTER LES SERVICES :"
echo "   Appuyez sur Ctrl+C dans ce terminal"
echo ""
echo "⏰ ATTENTION :"
echo "   Les tunnels ngrok gratuits expirent après 2 heures"
echo "   Pensez à relancer le script si nécessaire"
echo ""
echo "=========================================="
echo "💡 Tout est prêt ! Bon test ! 🚀"
echo "=========================================="
echo ""

# Garder le script actif
echo "Appuyez sur Ctrl+C pour arrêter tous les services..."
wait
