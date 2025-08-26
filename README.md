# My Coding Coach

An AI-powered coding education platform that helps students learn programming through personalized tasks, real-time feedback, and intelligent assistance.

## 🚀 Project Overview

My Coding Coach is a comprehensive learning platform that combines:
- **GitLab integration** for automatic project analysis
- **AI-powered task generation** based on student skill level
- **Interactive code editor** with multi-file support
- **Real-time code execution** using Pyodide
- **Intelligent tutoring** with contextual assistance
- **Progress tracking** and personalized learning paths

## 🏗️ Architecture

The project follows a microservices architecture with three main components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │◄──►│     Backend     │◄──►│    Database     │
│   (Next.js)     │    │   (FastAPI)     │    │   (MongoDB)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │
│   Code Editor   │    │  AI Services    │
│   (Monaco)      │    │  (OpenAI/GPT)   │
│                 │    │                 │
└─────────────────┘    └─────────────────┘
```

## 🛠️ Technologies

### Frontend
- **Next.js 15.4.2** - React framework with SSR/SSG
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Monaco Editor** - VS Code-like code editing experience
- **Pyodide** - Run Python in the browser
- **Axios** - HTTP client for API communication

### Backend
- **FastAPI** - Modern Python web framework
- **Python 3.11** - Core backend language
- **OpenAI GPT** - AI-powered code analysis and tutoring
- **python-gitlab** - GitLab API integration
- **Authlib** - OAuth authentication
- **python-jose** - JWT token handling

### Database
- **MongoDB 6** - NoSQL document database
- **PyMongo** - MongoDB driver for Python

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Alpine Linux** - Lightweight container base images

## 📁 Project Structure

```
MasterThesis/
├── Master/
│   ├── backend/                 # FastAPI backend
│   │   ├── ai/                 # AI services (OpenAI integration)
│   │   ├── analyzer/           # Code analysis modules
│   │   ├── config/             # Configuration files
│   │   ├── gitlab/             # GitLab integration
│   │   ├── models/             # Pydantic data models
│   │   ├── mongodb/            # Database connection
│   │   ├── routers/            # API endpoints
│   │   ├── services/           # Business logic
│   │   └── dockerfile          # Backend container config
│   │
│   ├── my-coding-coach/        # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # Next.js app directory
│   │   │   ├── components/     # React components
│   │   │   ├── contexts/       # React contexts
│   │   │   ├── lib/            # Utility libraries
│   │   │   └── utils/          # Helper functions
│   │   └── dockerfile          # Frontend container config
│   │
│   └── app.py                  # FastAPI application entry point
│
└── docker-compose.yml          # Multi-service orchestration
```

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed
- **GitLab OAuth App** configured (optional, for GitLab integration)
- **OpenAI API Key** (for AI features)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MasterThesis
```

### 2. Environment Configuration
Create a `.env` file in the project root:

```bash
# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Security
SECRET_KEY=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here

# GitLab OAuth (optional)
GITLAB_URL=https://gitlab.com
GITLAB_CLIENT_ID=your-gitlab-client-id
GITLAB_CLIENT_SECRET=your-gitlab-client-secret

# AI Service
OPENAI_GRAVITEE_KEY=your-openai-api-key
```

### 3. Run with Docker Compose
```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Development Setup

### Local Development (without Docker)

#### Backend Setup
```bash
cd Master
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt  # or use pyproject.toml
uvicorn app:app --reload --port 8000
```

#### Frontend Setup
```bash
cd Master/my-coding-coach
npm install
npm run dev
```

#### Database Setup
```bash
# Start MongoDB locally
docker run -d -p 27017:27017 --name mongodb mongo:6

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in .env file
```

## 🗄️ Database Access

### MongoDB Compass Connection
```
# Local development
mongodb://localhost:27017/?directConnection=true

# Via SSH tunnel (for remote deployment)
ssh -N -L 27018:localhost:27017 user@your-server
mongodb://localhost:27018/?directConnection=true
```

## 🎯 Key Features

### 1. GitLab Integration
- **Automatic project sync** from GitLab repositories
- **Code analysis** of student submissions
- **Progress tracking** across multiple projects

### 2. AI-Powered Learning
- **Intelligent task generation** based on skill assessment
- **Personalized feedback** on code quality
- **Contextual tutoring** with step-by-step guidance

### 3. Interactive Code Environment
- **Multi-file editing** with syntax highlighting
- **Real-time Python execution** in the browser
- **Session persistence** to save work progress

### 4. Learning Management
- **Task-based learning** with structured exercises
- **Progress tracking** and skill development
- **Adaptive difficulty** based on performance

## 🚢 Deployment Options

### Option 1: Single VM Deployment (Recommended)
```bash
# On your server
git clone <repository>
cd MasterThesis
docker compose up -d --build
```

### Option 2: NREC/Cloud Deployment
1. **Provision VM** on NREC or cloud provider
2. **Configure security groups** (ports 22, 80, 443, 3000, 8000)
3. **Deploy with Docker Compose**
4. **Set up reverse proxy** (Nginx/Caddy) for HTTPS

### Option 3: Kubernetes Deployment
```yaml
# Example Kubernetes manifests available
# Deploy to NREC Kubernetes cluster
kubectl apply -f k8s/
```

## 🔐 Security Considerations

### OAuth Configuration
- Configure GitLab OAuth app with correct redirect URIs
- Use secure cookies for token storage
- Implement proper CORS policies

### Environment Security
- Never commit `.env` files to version control
- Use Docker secrets for sensitive data in production
- Enable HTTPS in production environments

### Database Security
- Use authentication for MongoDB in production
- Restrict database access to application services only
- Regular backup and disaster recovery procedures

## 🧪 Testing

### Backend Tests
```bash
cd Master
pytest tests/
```

### Frontend Tests
```bash
cd Master/my-coding-coach
npm test
```

### Integration Tests
```bash
# Test the full stack with Docker Compose
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📊 Monitoring & Logs

### View Application Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo
```

### Health Checks
- **Backend Health**: http://localhost:8000/docs
- **Frontend Health**: http://localhost:3000
- **Database Health**: Connect via MongoDB Compass

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📄 License

This project is part of a Master's thesis on AI-powered coding education.

## 🆘 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker compose ps
docker compose logs mongo

# Reset MongoDB data
docker compose down -v
docker compose up -d
```

#### Frontend Build Errors
```bash
# Clear cache and rebuild
cd Master/my-coding-coach
rm -rf .next node_modules
npm install
docker compose build frontend
```

#### Backend API Errors
```bash
# Check environment variables
docker compose exec backend env | grep -E "(MONGO|GITLAB|OPENAI)"

# Restart backend
docker compose restart backend
```

### Getting Help

- **Check logs**: `docker compose logs -f`
- **Verify environment**: Ensure all required env vars are set
- **Test connectivity**: Use health check endpoints
- **Database access**: Verify MongoDB connection via Compass

---

**Author**: Sindre Eie Ledsaak  
**Institution**: University of Bergen  
**Project**: Master's Thesis on AI-Powered Coding Education 