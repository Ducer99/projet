#!/bin/bash

# Script de démarrage Cloudflare Tunnel pour accès public
# Usage: ./start-cloudflare.sh

set -e

echo "🚀 Démarrage du tunnel Cloudflare..."
echo ""

# Vérifier que Cloudflare est installé
if ! command -v cloudflared &> /dev/null; then
    echo "❌ Cloudflare Tunnel n'est pas installé"
    echo "Installation : brew install cloudflared"
    exit 1
fi

# Vérifier que le frontend tourne
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Le Frontend ne répond pas sur http://localhost:3000"
    echo "Lancez d'abord : cd frontend && npm run dev"
    exit 1
fi

echo "✅ Frontend détecté sur http://localhost:3000"
echo ""

# Créer le tunnel
echo "📡 Création du tunnel public..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cloudflared tunnel --url http://localhost:3000

# Note: Le tunnel reste ouvert jusqu'à Ctrl+C
