#!/bin/bash

echo "🚀 Starting Library Management System in Production Mode..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    echo "📝 Make sure to set secure values for:"
    echo "   - JWT_SECRET"
    echo "   - FRONTEND_URL"
    echo "   - FRONTEND_HOST"
    echo "   - DATA_PATH"
    exit 1
fi

echo "📁 Creating data directory..."
sudo mkdir -p /var/lib/library-app/data
sudo chown -R 1001:1001 /var/lib/library-app/data

mkdir -p ./nginx/ssl

if [ ! -f ./nginx/ssl/fullchain.pem ] || [ ! -f ./nginx/ssl/privkey.pem ]; then
    echo "⚠️  SSL certificates not found. Using HTTP configuration."
    echo "📝 For HTTPS, place your certificates in ./nginx/ssl/ and use ssl.conf.example"
else
    echo "✅ SSL certificates found. Using HTTPS configuration."
    cp ./nginx/conf.d/ssl.conf.example ./nginx/conf.d/ssl.conf
fi

echo "🔨 Building and starting production services..."
docker-compose pull
docker-compose up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🏥 Checking service health..."
docker-compose ps

echo "📋 Recent logs:"
docker-compose logs --tail=20

echo ""
echo "✅ Production environment is ready!"
echo ""
echo "📍 Services available at:"
echo "   Application: http://localhost (or your domain)"
echo "   Health check: http://localhost/health"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker-compose logs -f [service_name]"
echo "   Stop services: docker-compose down"
echo "   Restart:       docker-compose restart [service_name]"
echo "   Update:        docker-compose pull && docker-compose up -d"
echo ""
echo "🔐 Security reminders:"
echo "   - Change default JWT_SECRET in .env"
echo "   - Set up SSL certificates for HTTPS"
echo "   - Configure firewall rules"
echo "   - Set up log rotation"
echo "   - Configure backup for /var/lib/library-app/data"
echo ""