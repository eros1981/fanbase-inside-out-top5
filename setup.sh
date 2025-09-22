#!/bin/bash

# Fanbase Inside-Out Top 5 Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up Fanbase Inside-Out Top 5 automation..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Docker is installed (for database)
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to set up PostgreSQL manually."
else
    echo "✅ Docker detected"
fi

# Setup Slack Bot
echo "📱 Setting up Slack Bot..."
cd slack-bot
if [ ! -f .env ]; then
    cp env.example .env
    echo "📝 Created .env file for Slack Bot. Please edit it with your Slack app credentials."
fi
npm install
cd ..

# Setup Query Service
echo "🔍 Setting up Query Service..."
cd query-service
if [ ! -f .env ]; then
    cp env.example .env
    echo "📝 Created .env file for Query Service. Please edit it with your database credentials."
fi
npm install
cd ..

# Setup Infrastructure
echo "🏗️  Setting up Infrastructure..."
cd infra
if [ -f docker-compose.yml ]; then
    echo "🐳 Starting PostgreSQL database..."
    docker-compose up postgres -d
    echo "✅ Database started. You can access it at localhost:5432"
fi
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit slack-bot/.env with your Slack app credentials"
echo "2. Edit query-service/.env with your database URL and HMAC secret"
echo "3. Customize the SQL queries in sql/ directory for your database schema"
echo "4. Start the services:"
echo "   - Query Service: cd query-service && npm run dev"
echo "   - Slack Bot: cd slack-bot && npm run dev"
echo ""
echo "For production deployment, see the README.md file."
