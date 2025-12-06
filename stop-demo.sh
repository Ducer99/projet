#!/bin/bash

# 🛑 Script pour arrêter la démo Ngrok

echo "🛑 Arrêt de la démo Ngrok..."
echo ""

# Arrêter via PIDs sauvegardés
if [ -f .demo-pids ]; then
    echo "📋 Lecture des PIDs sauvegardés..."
    while read pid; do
        if ps -p $pid > /dev/null 2>&1; then
            echo "   Arrêt du processus $pid..."
            kill $pid 2>/dev/null
        fi
    done < .demo-pids
    rm .demo-pids
    echo "✅ Processus sauvegardés arrêtés"
else
    echo "⚠️  Aucun PID sauvegardé trouvé"
fi

echo ""
echo "🧹 Nettoyage des processus résiduels..."

# Arrêter tous les processus liés
pkill -f "dotnet.*FamilyTreeAPI"
pkill -f "vite.*3000"
pkill -f "ngrok"

sleep 2

echo "✅ Tous les processus arrêtés"
echo ""
echo "📝 Logs disponibles :"
echo "   • logs-backend.txt"
echo "   • logs-frontend.txt"
echo "   • logs-ngrok-frontend.txt"
echo ""
echo "✨ Démo arrêtée avec succès !"
