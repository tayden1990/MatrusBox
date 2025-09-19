#!/bin/bash

# Matrus Development Setup Script
# This script sets up the development environment for the Matrus project

set -e

echo "🚀 Setting up Matrus development environment..."

# Check if required tools are installed
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo "❌ $1 is not installed. Please install it first."
    exit 1
  fi
}

echo "📋 Checking prerequisites..."
check_command "node"
check_command "pnpm"
check_command "docker"
check_command "docker-compose"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js version 18 or higher is required. Current version: $(node --version)"
  exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment file
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 Created .env file from .env.example"
  echo "⚠️  Please update the .env file with your actual configuration values"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
cd apps/api
pnpm db:generate
pnpm db:migrate
cd ../..

echo "🎉 Setup complete!"
echo ""
echo "📖 Next steps:"
echo "1. Update your .env file with actual values:"
echo "   - OPENAI_API_KEY (for AI features)"
echo "   - TELEGRAM_BOT_TOKEN (for bot functionality)"
echo "   - JWT secrets (for security)"
echo ""
echo "2. Start the development servers:"
echo "   pnpm dev"
echo ""
echo "3. Access the applications:"
echo "   - Web app: http://localhost:3000"
echo "   - API docs: http://localhost:4000/api/docs"
echo "   - Database UI: pnpm --filter=@matrus/api db:studio"
echo ""
echo "4. Check the README.md for more detailed instructions"
echo ""
echo "Happy coding! 🚀"