# DeAI Synthetic Data Generator

A comprehensive, production-ready DeAI (Decentralized AI) Synthetic Data Generator that operates on DePin (Decentralized Physical Infrastructure Networks). This platform enables secure, scalable generation of synthetic datasets using distributed AI infrastructure with complete authentication and role-based access control.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│              Vite + Tailwind CSS + shadcn/ui                │
│                    Port: 3000 / 80                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend API (Node.js)                        │
│              Express + MongoDB + JWT Auth                    │
│                    Port: 5000                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                AI Engine (Python FastAPI)                    │
│          ML Models + Synthetic Data Generation               │
│                    Port: 8000                               │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Core Functionality
- **Synthetic Data Generation**: Create tabular, text, and time-series synthetic datasets
- **AI Model Training**: Train custom models on distributed DePin infrastructure
- **Real-time Processing**: Async task management with status tracking
- **Scalable Architecture**: Microservices-based design with Docker containerization

### Security & Authentication
- **JWT Authentication**: Dual-token system (access + refresh tokens)
- **Role-Based Access Control (RBAC)**: Three roles - admin, developer, viewer
- **Secure Token Management**: Automatic token refresh and session handling
- **Protected Routes**: Backend middleware and frontend route protection
- **Password Hashing**: bcrypt with salt rounds for secure password storage

### Production Features
- **Health Check Endpoints**: Monitoring for all services
- **Error Handling**: Comprehensive error management and logging
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin requests
- **Docker Support**: Multi-stage builds with optimization
- **Database Connection Pooling**: Efficient MongoDB connections

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router DOM 6

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js 4
- **Database**: MongoDB 7 with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate-limit
- **Language**: TypeScript

### AI Engine
- **Framework**: FastAPI
- **Server**: Uvicorn
- **ML Libraries**: NumPy, Pandas, scikit-learn, PyTorch, Transformers
- **Validation**: Pydantic
- **Language**: Python 3.11

### DevOps
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **Deployment**: NodeOps configuration for DePin networks
- **Web Server**: Nginx (for frontend)

## Project Structure

```
.
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # UI components (shadcn/ui)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript type definitions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   ├── Dockerfile          # Production Docker build
│   ├── nginx.conf          # Nginx configuration
│   └── package.json        # Dependencies and scripts
│
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── models/         # Mongoose models
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── Dockerfile          # Production Docker build
│   └── package.json        # Dependencies and scripts
│
├── ai-engine/              # Python AI service
│   ├── app/
│   │   ├── core/          # Core configuration
│   │   ├── models/        # Data models
│   │   ├── services/      # Business logic
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── api/           # API endpoints
│   │   └── main.py        # FastAPI application
│   ├── Dockerfile         # Production Docker build
│   ├── requirements.txt   # Python dependencies
│   └── main.py           # Application entry point
│
├── docs/                  # Project documentation
├── docker-compose.yml     # Multi-service orchestration
├── nodeops.yaml          # DePin deployment config
└── README.md             # This file
```

## Prerequisites

- **Node.js**: 20.x or higher
- **Python**: 3.11 or higher
- **MongoDB**: 7.0 or higher
- **Docker**: 24.x or higher (for containerized deployment)
- **Docker Compose**: 2.x or higher

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd deai-synthetic-data-generator
```

### 2. Environment Configuration

Create environment files from examples:

```bash
# Root directory
cp .env.example .env

# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env

# AI Engine
cp ai-engine/.env.example ai-engine/.env
```

### 3. Configure Environment Variables

#### Root `.env`
```env
JWT_ACCESS_SECRET=your_super_secure_access_token_secret_change_this
JWT_REFRESH_SECRET=your_super_secure_refresh_token_secret_change_this
```

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
VITE_AI_ENGINE_URL=http://localhost:8000
```

#### Backend `.env`
```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/deai_synthetic_data

JWT_ACCESS_SECRET=your_access_token_secret_change_this_in_production
JWT_REFRESH_SECRET=your_refresh_token_secret_change_this_in_production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

AI_ENGINE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000
```

#### AI Engine `.env`
```env
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000

MODEL_CACHE_DIR=./models
DATA_OUTPUT_DIR=./output

LOG_LEVEL=INFO
```

## Development Setup

### Option 1: Local Development

#### Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or install MongoDB locally
```

#### Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

#### AI Engine
```bash
cd ai-engine
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# Server runs on http://localhost:8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Application runs on http://localhost:3000
```

### Option 2: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Engine**: http://localhost:8000
- **MongoDB**: localhost:27017

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "developer"  // Optional: admin | developer | viewer
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "role": "developer",
      "createdAt": "..."
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### Data Generation Endpoints

#### Generate Synthetic Data
```http
POST /api/data-generation/generate
Content-Type: application/json

{
  "data_type": "tabular",
  "num_samples": 1000,
  "schema_config": {
    "columns": ["age", "income", "credit_score"]
  }
}
```

#### Check Task Status
```http
GET /api/data-generation/task/{task_id}
```

### Model Training Endpoints

#### Train Model
```http
POST /api/models/train
Content-Type: application/json

{
  "model_type": "synthetic_gan",
  "epochs": 20,
  "dataset_config": {
    "features": 10,
    "samples": 1000
  }
}
```

#### Get Model Info
```http
GET /api/models/{model_id}
```

#### List All Models
```http
GET /api/models/
```

### Health Check Endpoints

```http
GET /api/health          # Backend health
GET /api/health          # AI Engine health
GET /health              # Frontend health (via nginx)
```

## User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- Access to all features

### Developer
- Create and manage datasets
- Train and deploy models
- Access generation features
- View own resources

### Viewer
- Read-only access
- View datasets and models
- No creation or modification permissions

## Production Deployment

### Docker Deployment

1. **Build Production Images**
```bash
docker-compose -f docker-compose.yml build
```

2. **Start Services**
```bash
docker-compose up -d
```

3. **Monitor Services**
```bash
docker-compose ps
docker-compose logs -f [service-name]
```

### NodeOps Deployment (DePin Networks)

1. **Configure NodeOps**
Edit `nodeops.yaml` with your deployment specifics:
- Update service images
- Configure resource limits
- Set environment variables
- Configure secrets

2. **Deploy to DePin Network**
```bash
nodeops deploy -f nodeops.yaml
```

3. **Monitor Deployment**
```bash
nodeops status deai-synthetic-data-generator
nodeops logs deai-synthetic-data-generator
```

4. **Scale Services**
```bash
nodeops scale deai-synthetic-data-generator --service=backend --replicas=5
```

### Environment Variables for Production

Ensure all secrets are properly configured:

- `JWT_ACCESS_SECRET`: Strong random string (min 32 characters)
- `JWT_REFRESH_SECRET`: Different strong random string
- `MONGODB_URI`: Production MongoDB connection string
- Database credentials
- API keys (if using external services)

### Security Checklist

- [ ] Change all default secrets and passwords
- [ ] Enable HTTPS/TLS for all services
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Enable database backups
- [ ] Review CORS origins
- [ ] Configure rate limiting
- [ ] Enable security headers (Helmet)
- [ ] Implement network policies
- [ ] Regular security audits

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### AI Engine Tests
```bash
cd ai-engine
pytest
```

## Monitoring & Logging

### View Logs

**Docker Compose:**
```bash
docker-compose logs -f [service-name]
```

**Individual Services:**
```bash
# Backend
cd backend && npm run dev  # Watch mode with logs

# AI Engine
cd ai-engine && python main.py

# Frontend
cd frontend && npm run dev
```

### Health Checks

All services include health check endpoints:
- Backend: `GET http://localhost:5000/api/health`
- AI Engine: `GET http://localhost:8000/api/health`
- Frontend: `GET http://localhost:3000/health`

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker-compose logs mongodb
```

**Port Already in Use**
```bash
# Find process using port
lsof -i :5000  # Backend
lsof -i :8000  # AI Engine
lsof -i :3000  # Frontend

# Kill process
kill -9 <PID>
```

**Frontend Can't Connect to Backend**
- Verify `VITE_API_URL` in frontend `.env`
- Check backend is running: `curl http://localhost:5000/api/health`
- Verify CORS configuration in backend

**Docker Build Fails**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

## Performance Optimization

### Backend
- Connection pooling configured for MongoDB
- Rate limiting: 100 requests per 15 minutes per IP
- JWT token expiration: 15 minutes (access), 7 days (refresh)
- Helmet security headers enabled
- Gzip compression via Nginx

### Frontend
- Vite build optimization
- Code splitting
- Lazy loading for routes
- Nginx gzip compression
- Static asset caching

### AI Engine
- Model caching to disk
- Async request handling
- Resource limits configured
- GPU support available (when configured)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API documentation

## Roadmap

- [ ] Add data validation and quality metrics
- [ ] Implement advanced model architectures (GANs, VAEs)
- [ ] Add data versioning and lineage tracking
- [ ] Integrate with more DePin protocols
- [ ] Add comprehensive test coverage
- [ ] Implement CI/CD pipelines
- [ ] Add WebSocket support for real-time updates
- [ ] Create admin dashboard
- [ ] Add data export formats (CSV, JSON, Parquet)
- [ ] Implement distributed training across DePin nodes

## Acknowledgments

Built with modern web technologies and best practices for production-ready deployment on decentralized infrastructure networks.