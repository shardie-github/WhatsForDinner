#!/bin/bash

# Setup script for What's for Dinner monorepo

echo "🚀 Setting up What's for Dinner monorepo..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
npm run install:all

# Build shared packages
echo "🔨 Building shared packages..."
npm run build:packages

echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev          # Start all apps"
echo "  npm run dev:web      # Start web app only"
echo "  npm run dev:mobile   # Start mobile app only"
echo ""
echo "To build for production:"
echo "  npm run build        # Build all apps"
echo "  npm run build:web    # Build web app only"
echo "  npm run build:mobile # Build mobile app only"