#!/bin/bash
set -e

echo "🚀 Vertix - Setup"
echo "===================="

# Copy env if needed
if [ ! -f .env ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
  echo "✅ .env created"
else
  echo "ℹ️  .env already exists"
fi

# Start services
echo ""
echo "🐳 Starting Docker services..."
docker compose up --build -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Run migrations
echo ""
echo "🗃️  Running database migrations..."
docker compose exec backend npx prisma migrate deploy

# Run seeds
echo ""
echo "🌱 Seeding database..."
docker compose exec backend npx prisma db seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "📌 Access points:"
echo "  Frontend:   http://localhost:8080"
echo "  Backend:    http://localhost:8080/api"
echo "  Swagger:    http://localhost:8080/api/docs"
echo "  Grafana:    http://localhost:3002 (admin/admin)"
echo "  MinIO:      http://localhost:9001 (vertix_minio/vertix_minio_secret)"
echo "  Prometheus: http://localhost:9090"
echo ""
echo "📧 Default credentials:"
echo "  Super Admin: admin@vertix.com / Admin@123"
echo ""
