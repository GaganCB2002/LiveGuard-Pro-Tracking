#!/bin/bash
set -e
echo "🚀 LiveGuard Pro Deployment"
command -v docker >/dev/null 2>&1 || { echo "Docker required. Aborting." >&2; exit 1; }

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
JWT_SECRET=$(openssl rand -base64 32)
DB_PASS=liveguard123
REDIS_PASS=
AWS_ACCESS_KEY=minioadmin
AWS_SECRET_KEY=minioadmin123
EOF
fi

echo "📦 Building services..."
docker-compose build

echo "🗄️  Starting infrastructure..."
docker-compose up -d postgres redis elasticsearch zookeeper kafka minio

echo "⏳ Waiting for databases..."
sleep 15

echo "🚀 Starting application services..."
docker-compose up -d api ai-service frontend nginx

echo "✅ Deployment complete!"
echo "Dashboard: http://localhost"
echo "API: http://localhost/api"
echo "MinIO: http://localhost:9001"
