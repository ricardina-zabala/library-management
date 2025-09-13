#!/bin/bash

echo "🚀 Starting Library Management System in Development Mode..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

mkdir -p ./data

if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
else
    echo "✅ .env file already exists"
fi

echo "🔨 Building and starting services..."
docker-compose -f docker-compose.dev.yml up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🏥 Checking service health..."
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "📍 Services available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.dev.yml down"
echo "   Restart:       docker-compose -f docker-compose.dev.yml restart"
echo ""