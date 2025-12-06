#!/bin/bash

# 🚀 Script de build pour déploiement "tout-en-un"
# Ce script compile React et copie les fichiers dans le backend C#

echo "=========================================="
echo "🚀 BUILD FULL-STACK - Frontend + Backend"
echo "=========================================="
echo ""

# 1️⃣ Build du Frontend React
echo "📦 Étape 1/3 : Build du Frontend React..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build React"
    exit 1
fi

echo "✅ Build React terminé"
echo ""

# 2️⃣ Nettoyage du dossier wwwroot
echo "🧹 Étape 2/3 : Nettoyage de wwwroot..."
cd ../backend
rm -rf wwwroot/*
mkdir -p wwwroot

echo "✅ Nettoyage terminé"
echo ""

# 3️⃣ Copie des fichiers React dans wwwroot
echo "📂 Étape 3/3 : Copie des fichiers React vers backend/wwwroot..."
cp -r ../frontend/dist/* wwwroot/

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la copie des fichiers"
    exit 1
fi

echo "✅ Copie terminée"
echo ""

# Afficher le résumé
echo "=========================================="
echo "✨ BUILD RÉUSSI !"
echo "=========================================="
echo ""
echo "📊 Fichiers dans wwwroot :"
ls -lh wwwroot/ | head -10
echo ""
echo "🎯 Prochaines étapes :"
echo "   1. Testez localement : cd backend && dotnet run"
echo "   2. Déployez sur Azure : cf. DEPLOY_AZURE.md"
echo "   3. Ou utilisez Docker : cf. Dockerfile"
echo ""
