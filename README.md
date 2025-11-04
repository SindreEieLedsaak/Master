# My Coding Coach

An AI-powered coding education platform that helps students learn programming through personalized tasks, real-time feedback, and intelligent assistance.

## 🌐 Live Platform

**Access the platform at: [https://codeguide.live](https://codeguide.live)**

The platform is hosted with HTTPS and operational for use in educational settings.

## 🚀 Overview

My Coding Coach is a comprehensive learning platform designed for master's thesis research on AI-powered coding education. The platform combines:

- **GitLab OAuth Authentication** - Secure login using GitLab credentials
- **Automatic Project Analysis** - Syncs and analyzes student GitLab repositories
- **AI-Powered Task Generation** - Creates personalized coding tasks based on skill assessment
- **Interactive Code Editor** - Multi-file editor with syntax highlighting (Monaco Editor)
- **Real-Time Code Execution** - Run Python code directly in the browser using Pyodide
- **Intelligent AI Tutoring** - Contextual assistance with GPT-powered guidance

## 🏗️ System Architecture

The project follows a microservices architecture with three main components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │◄──►│     Backend     │◄──►│    Database     │
│   (Next.js)     │    │   (FastAPI)     │    │   (MongoDB)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                 │           │
        │                 │           │
        ▼                 ▼           ▼
┌─────────────────┐   ┌──────────┐┌──────────┐
│                 │   │          ││          │  
│   Code Editor   │   │AI Service││  Gitlab  │
│   (Monaco)      │   │  (OpenAI)││   Auth   │
│                 │   │          ││          │
└─────────────────┘   └──────────┘└──────────┘
```

## 🛠️ Technologies

### Frontend
- **Next.js 15.4.2** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - styling
- **Monaco Editor** - VS Code editor component
- **Pyodide** - WebAssembly Python runtime
- **Axios** - HTTP client

### Backend
- **FastAPI** - Python API framework
- **Python 3.11** - Core language
- **Poetry** - Dependency management
- **OpenAI GPT-4 Turbo** - AI-powered analysis and tutoring
- **python-gitlab** - GitLab API client
- **Authlib** - OAuth 2.0 implementation
- **python-jose** - JWT token handling
- **PyMongo** - MongoDB driver

### Database
- **MongoDB 6** - Document database
  - Collections: students, projects, tasks, suggestions, surveys, sessions

### Infrastructure & DevOps
- **NREC Cloud** - Norwegian Research and Education Cloud
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and SSL termination
- **Let's Encrypt** - Free SSL/TLS certificates

## 📁 Project Structure

```
MasterThesis/
├── Master/
│   ├── backend/                    # FastAPI Backend Service
│   │   ├── ai/
│   │   │   ├── ai_analyzer.py     # OpenAI integration
│   │   │   ├── assistant.py       # Chat assistant logic
│   │   │   └── session_assistant.py
│   │   ├── analyzer/
│   │   │   ├── ai_project_analyzer.py
│   │   │   ├── code_analyzer.py   # Static code analysis
│   │   │   └── project_analyzer.py
│   │   ├── config/
│   │   │   └── db_config.py       # Database configuration
│   │   ├── gitlab/
│   │   │   └── gitlab_service.py  # GitLab API integration
│   │   ├── learning/
│   │   │   └── learning_tracker.py
│   │   ├── models/                # Pydantic data models
│   │   │   ├── code_feedback.py
│   │   │   ├── editor_state.py
│   │   │   ├── promt.py
│   │   │   ├── student.py
│   │   │   ├── suggestion.py
│   │   │   ├── survey.py
│   │   │   └── task.py
│   │   ├── mongodb/
│   │   │   └── MongoDB.py         # MongoDB connection
│   │   ├── routers/               # API endpoints
│   │   │   ├── ai_router.py
│   │   │   ├── auth_router.py
│   │   │   ├── gitlab_router.py
│   │   │   ├── student_router.py
│   │   │   ├── suggestion_router.py
│   │   │   └── survey_router.py
│   │   ├── services/              # Business logic layer
│   │   │   ├── auth_service.py
│   │   │   ├── student_service.py
│   │   │   ├── suggestion_service.py
│   │   │   └── survey_service.py
│   │   └── dockerfile
│   │
│   ├── my-coding-coach/           # Next.js Frontend Application
│   │   ├── src/
│   │   │   ├── app/               # Next.js App Router
│   │   │   │   ├── auth/
│   │   │   │   │   └── callback/  # OAuth callback handler
│   │   │   │   ├── editor/        # Code editor page
│   │   │   │   ├── profile/       # User profile
│   │   │   │   ├── projects/      # GitLab projects view
│   │   │   │   ├── resources/     # Learning resources
│   │   │   │   ├── suggestions/   # AI-generated tasks
│   │   │   │   ├── survey/        # Research surveys
│   │   │   │   ├── layout.tsx     # Root layout
│   │   │   │   └── page.tsx       # Landing page
│   │   │   ├── components/        # React components
│   │   │   │   ├── AssistantChat.tsx
│   │   │   │   ├── CodeEditor.tsx
│   │   │   │   ├── FeedbackPanel.tsx
│   │   │   │   ├── FileExplorer.tsx
│   │   │   │   ├── MultiFileEditor.tsx
│   │   │   │   ├── PyodideRunner.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── survey/        # Survey components
│   │   │   ├── contexts/          # React Context providers
│   │   │   │   ├── survey/
│   │   │   │   └── user/
│   │   │   ├── lib/               # API clients & utilities
│   │   │   │   ├── api/
│   │   │   │   │   ├── ai.ts
│   │   │   │   │   ├── assistant.ts
│   │   │   │   │   ├── auth.ts
│   │   │   │   │   ├── gitlab.ts
│   │   │   │   │   ├── students.ts
│   │   │   │   │   ├── suggestions.ts
│   │   │   │   │   └── survey.ts
│   │   │   │   ├── api.ts         # API client aggregator
│   │   │   │   ├── http.ts        # Axios instance
│   │   │   │   └── types.ts
│   │   │   └── utils/
│   │   └── dockerfile
│   │
│   ├── tests/                     # Backend tests
│   │   ├── conftest.py
│   │   ├── test_all_endpoints.py
│   │   └── test_assistant_endpoints.py
│   │
│   ├── app.py                     # FastAPI entry point
│   ├── pyproject.toml             # Poetry dependencies
│   ├── poetry.lock
│   ├──docker-compose.yml         # Service orchestration
│   └──README.d
                  
```

## 🧪 Testing

### Backend Tests
```bash
poetry install
poetry run pytest tests/
```

### Frontend Tests
```bash
cd my-coding-coach
npm install
npm test
```

### API Documentation
- **Interactive Docs**: https://codeguide.live/api/docs

## 📄 Research Context

This platform is developed as part of a Master's thesis at the University of Bergen, investigating:

- **AI-assisted learning effectiveness** in programming education
- **Student engagement patterns** with AI tutoring systems
- **Code quality improvement** through personalized tasks

## 🎓 Academic Information

**Program**: Master of Science in Informatics  
**University**: University of Bergen, Norway  
**Year**: 2024-2025  
**Research Area**: Educational Technology, AI in Education, Programming Education

---

*This platform is designed for educational and research purposes as part of a master's thesis project.*
