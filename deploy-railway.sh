#!/bin/bash

# Railway Deployment Script for Fanbase Inside-Out Top 5
# This script helps deploy the services to Railway

set -e

echo "🚀 Deploying Fanbase Inside-Out Top 5 to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Please install it first:"
    echo "   npm install -g @railway/cli"
    echo "   or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "✅ Railway CLI detected and authenticated"

# Create Railway project
echo "📦 Creating Railway project..."
railway init

# Deploy both services
echo "🚀 Deploying services..."

# Deploy Query Service
echo "🔍 Deploying Query Service..."
cd query-service
railway up --service fanbase-query-service
cd ..

# Deploy Slack Bot
echo "📱 Deploying Slack Bot..."
cd slack-bot
railway up --service fanbase-slack-bot
cd ..

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Go to Railway dashboard: https://railway.app/dashboard"
echo "2. Configure environment variables (see infra/railway-deployment.md)"
echo "3. Upload your BigQuery service account key file"
echo "4. Update your Slack app with the new Request URL"
echo "5. Test the deployment with: /insideout top5 aug 2025 all"
echo ""
echo "For detailed instructions, see: infra/railway-deployment.md"
