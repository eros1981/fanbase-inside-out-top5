#!/bin/bash

# Deployment script for Slack bot crash fix
# This script builds and deploys the updated Slack bot with enhanced error handling

set -e

echo "🚀 Deploying Slack bot crash fix..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the slack-bot directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Display deployment information
echo ""
echo "📋 Deployment Summary:"
echo "• Enhanced Socket Mode configuration with auto-reconnection"
echo "• Comprehensive error handling for uncaught exceptions"
echo "• Graceful shutdown handling for SIGTERM/SIGINT signals"
echo "• Health monitoring system with periodic checks"
echo "• New /health command for status monitoring"
echo "• Updated Slack Bolt framework to latest version"
echo ""

echo "🎯 Next Steps:"
echo "1. Deploy the updated code to your hosting platform"
echo "2. Monitor the logs for improved stability"
echo "3. Use /health command in Slack to check bot status"
echo "4. The bot will now automatically reconnect on disconnections"
echo ""

echo "✨ Deployment preparation complete!"
