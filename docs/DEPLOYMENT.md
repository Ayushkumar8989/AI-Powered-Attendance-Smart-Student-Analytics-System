# Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [NodeOps Deployment](#nodeops-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Security Considerations](#security-considerations)
7. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Required Software

- **Node.js**: 20.x or higher
- **Python**: 3.11 or higher
- **MongoDB**: 7.0 or higher
- **Docker**: 24.x or higher
- **Docker Compose**: 2.x or higher

### Recommended Tools

- Git for version control
- MongoDB Compass for database management
- Postman or similar for API testing
- NodeOps CLI for DePin deployments

## Local Development

### 1. Start MongoDB

Using Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

Or install MongoDB locally following official documentation.

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

Backend will be available at `http://localhost:5000`

### 3. AI Engine Setup

```bash
cd ai-engine
cp .env.example .env
# Edit .env with your configuration
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

AI Engine will be available at `http://localhost:8000`

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Docker Deployment

### Quick Start

```bash
# Copy environment file
cp .env.example .env

# Edit .env with production secrets
nano .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Individual Service Management

```bash
# Start specific service
docker-compose up -d backend

# Restart service
docker-compose restart frontend

# Stop service
docker-compose stop ai-engine

# View service logs
docker-compose logs -f backend
```

### Scaling Services

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Scale AI engine to 2 instances
docker-compose up -d --scale ai-engine=2
```

### Production Build

```bash
# Build without cache
docker-compose build --no-cache

# Pull latest images
docker-compose pull

# Start in production mode
docker-compose -f docker-compose.yml up -d
```

### Data Persistence

Volumes are automatically created:
- `mongodb_data`: Database storage
- `ai_models`: Trained model cache
- `ai_output`: Generated data output

To backup volumes:
```bash
docker run --rm -v mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz /data
```

## NodeOps Deployment

### 1. Prerequisites

Install NodeOps CLI:
```bash
npm install -g nodeops-cli
# or
curl -sSL https://nodeops.io/install.sh | sh
```

Authenticate:
```bash
nodeops login
```

### 2. Configure Deployment

Edit `nodeops.yaml`:

```yaml
apiVersion: v1
kind: DeploymentConfig
metadata:
  name: deai-synthetic-data-generator

spec:
  services:
    - name: frontend
      image: your-registry/deai-frontend:latest
      replicas: 2

    - name: backend
      image: your-registry/deai-backend:latest
      replicas: 3

    - name: ai-engine
      image: your-registry/deai-ai-engine:latest
      replicas: 2
```

### 3. Build and Push Images

```bash
# Tag images for your registry
docker tag deai-frontend:latest your-registry/deai-frontend:latest
docker tag deai-backend:latest your-registry/deai-backend:latest
docker tag deai-ai-engine:latest your-registry/deai-ai-engine:latest

# Push to registry
docker push your-registry/deai-frontend:latest
docker push your-registry/deai-backend:latest
docker push your-registry/deai-ai-engine:latest
```

### 4. Deploy to DePin Network

```bash
# Validate configuration
nodeops validate -f nodeops.yaml

# Deploy
nodeops deploy -f nodeops.yaml

# Check deployment status
nodeops status deai-synthetic-data-generator

# View logs
nodeops logs deai-synthetic-data-generator --service=backend --tail=100
```

### 5. Manage Deployment

```bash
# Scale services
nodeops scale deai-synthetic-data-generator --service=backend --replicas=5

# Update deployment
nodeops update -f nodeops.yaml

# Rollback deployment
nodeops rollback deai-synthetic-data-generator --revision=2

# Delete deployment
nodeops delete deai-synthetic-data-generator
```

## Environment Configuration

### Production Secrets

Generate strong secrets:
```bash
# Generate JWT secrets
openssl rand -base64 32  # Access token secret
openssl rand -base64 32  # Refresh token secret
```

### Backend Environment Variables

```env
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://mongodb:27017/deai_synthetic_data

# JWT Configuration
JWT_ACCESS_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Service URLs
AI_ENGINE_URL=http://ai-engine:8000

# Security
CORS_ORIGIN=https://your-domain.com
```

### Frontend Environment Variables

```env
VITE_API_URL=https://api.your-domain.com
VITE_AI_ENGINE_URL=https://ai.your-domain.com
```

### AI Engine Environment Variables

```env
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000
MODEL_CACHE_DIR=/app/models
DATA_OUTPUT_DIR=/app/output
LOG_LEVEL=INFO
```

## Security Considerations

### SSL/TLS Configuration

For production, configure HTTPS:

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Configure nginx or load balancer with certificates
3. Force HTTPS redirects
4. Enable HSTS headers

### Firewall Rules

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Database Security

1. Enable MongoDB authentication
2. Use strong passwords
3. Limit network access to database
4. Enable SSL for MongoDB connections
5. Regular backups

### Environment Security

1. Never commit `.env` files
2. Use secret management (Vault, AWS Secrets Manager)
3. Rotate secrets regularly
4. Use principle of least privilege
5. Enable audit logging

## Monitoring & Maintenance

### Health Checks

Check service health:
```bash
# Backend
curl http://localhost:5000/api/health

# AI Engine
curl http://localhost:8000/api/health

# Frontend
curl http://localhost:3000/health
```

### Log Management

View logs:
```bash
# Docker Compose
docker-compose logs -f --tail=100 backend
docker-compose logs -f --tail=100 ai-engine

# NodeOps
nodeops logs deai-synthetic-data-generator --service=backend
```

### Database Backup

Automated backup script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
mongodump --uri="mongodb://localhost:27017/deai_synthetic_data" --out="${BACKUP_DIR}/backup_${DATE}"
tar -czf "${BACKUP_DIR}/backup_${DATE}.tar.gz" "${BACKUP_DIR}/backup_${DATE}"
rm -rf "${BACKUP_DIR}/backup_${DATE}"
```

Set up cron job:
```bash
0 2 * * * /path/to/backup-script.sh
```

### Performance Monitoring

Monitor key metrics:
- CPU usage
- Memory consumption
- Request latency
- Error rates
- Database performance

Use tools like:
- Prometheus + Grafana
- DataDog
- New Relic
- ELK Stack

### Updates & Maintenance

```bash
# Pull latest changes
git pull origin main

# Rebuild images
docker-compose build

# Rolling update (zero downtime)
docker-compose up -d --no-deps --build backend

# Database migrations
docker-compose exec backend npm run migrate

# Clear cache
docker-compose exec backend npm run cache:clear
```

### Troubleshooting

Common issues and solutions:

**Service won't start:**
```bash
# Check logs
docker-compose logs service-name

# Verify environment variables
docker-compose config

# Check port conflicts
netstat -tulpn | grep :5000
```

**Database connection issues:**
```bash
# Test connection
docker-compose exec backend node -e "require('mongoose').connect(process.env.MONGODB_URI)"

# Check MongoDB logs
docker-compose logs mongodb
```

**High memory usage:**
```bash
# Check resource usage
docker stats

# Restart service
docker-compose restart service-name

# Optimize queries or add indexes
```

### Disaster Recovery

1. **Regular Backups**: Schedule daily backups
2. **Backup Testing**: Regularly test restore procedures
3. **Documentation**: Maintain runbooks
4. **Monitoring**: Set up alerts for critical issues
5. **Redundancy**: Use multiple availability zones

## CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build images
        run: docker-compose build

      - name: Push to registry
        run: |
          docker push your-registry/deai-frontend:latest
          docker push your-registry/deai-backend:latest
          docker push your-registry/deai-ai-engine:latest

      - name: Deploy to NodeOps
        run: nodeops deploy -f nodeops.yaml
```

## Support

For deployment issues:
1. Check logs first
2. Review documentation
3. Search existing issues
4. Contact support team
