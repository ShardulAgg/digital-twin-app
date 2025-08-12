#!/bin/bash

# Digital Twin Frontend Deployment Script
echo "🚀 Deploying Digital Twin Frontend to Fly.io"
echo "============================================="

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Error: Fly CLI not found. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if we're logged in
if ! fly auth whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Fly.io. Please run:"
    echo "   fly auth login"
    exit 1
fi

# Check if backend URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Backend URL is required"
    echo "Usage: ./deploy.sh <backend-url>"
    echo "Example: ./deploy.sh https://digital-twin-backend.fly.dev"
    exit 1
fi

BACKEND_URL=$1
echo "✅ Backend URL: $BACKEND_URL"

# Set the environment variable
echo "🔧 Setting environment variable..."
fly secrets set REACT_APP_API_BASE_URL="$BACKEND_URL"

if [ $? -eq 0 ]; then
    echo "✅ Environment variable set successfully"
else
    echo "❌ Failed to set environment variable"
    exit 1
fi

# Deploy the app
echo "🚀 Deploying to Fly.io..."
fly deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app should be available at: https://digital-twin-frontend.fly.dev"
    echo ""
    echo "📋 Next steps:"
    echo "1. Test the app to ensure it connects to the backend"
    echo "2. Check the browser console for any errors"
    echo "3. Verify CORS is configured on the backend"
else
    echo "❌ Deployment failed"
    exit 1
fi
