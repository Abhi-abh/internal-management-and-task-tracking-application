# Task Management Dashboard

An internal task & project management application built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Database | PostgreSQL 15 |
| Infrastructure | Docker, Docker Compose |
| Testing | Pytest, httpx |

---

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git

### 1. Clone and configure
```bash
git clone <repo-url>
cd task-management-dashboard
cp .env.example .env
# Edit .env and set a strong SECRET_KEY (openssl rand -hex 32)
```

### 2. Start all services
```bash
docker compose up --build
```

### 3. Open the apps
| Service | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Health Check | http://localhost:8000/api/v1/health |

---

## Local Development (without Docker)

### Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Set env vars (or create backend/.env pointing to local PostgreSQL)
export DATABASE_URL=postgresql://taskboard:password@localhost:5432/taskboard
export SECRET_KEY=your-dev-secret

# Run database migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # Edit VITE_API_BASE_URL if needed
npm run dev
```

### Run Backend Tests
```bash
cd backend
pytest tests/ -v
```

---

## Environment Variables

See [`.env.example`](.env.example) for a full documented list. Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret — must be long and random |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiry (default: 60) |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `VITE_API_BASE_URL` | Backend URL used by the frontend |

---

## Project Structure

```
task-management-dashboard/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── router.py          # Aggregated API router
│   │   │   └── routes/            # HTTP endpoints (auth, tasks, users, dashboard, health)
│   │   ├── core/
│   │   │   ├── config.py          # Settings via pydantic-settings
│   │   │   ├── security.py        # JWT + bcrypt
│   │   │   └── dependencies.py    # FastAPI dependencies (db session, current user)
│   │   ├── db/
│   │   │   ├── base.py            # SQLAlchemy engine + session + Base
│   │   │   └── init_db.py         # Dev table creation helper
│   │   ├── models/                # SQLAlchemy ORM models
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── repositories/          # Database query layer
│   │   ├── services/              # Business logic layer
│   │   ├── integrations/          # External API clients
│   │   └── main.py                # FastAPI app factory
│   ├── alembic/                   # Database migrations
│   ├── tests/                     # Pytest tests
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── components/            # Reusable UI components
        ├── pages/                 # Route-level page components
        ├── layouts/               # Page shell layouts
        ├── services/              # Axios API service modules
        ├── hooks/                 # Custom React hooks
        ├── context/               # React Context providers
        ├── utils/                 # Pure utility functions
        └── constants/             # App-wide constants & enums
```

---

## API Overview

All endpoints are prefixed with `/api/v1/`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, get JWT |
| GET | `/auth/me` | Yes | Current user info |
| GET | `/tasks` | Yes | List tasks (filter/sort/paginate) |
| POST | `/tasks` | Yes | Create task |
| GET | `/tasks/{id}` | Yes | Get task details |
| PUT | `/tasks/{id}` | Yes | Update task |
| DELETE | `/tasks/{id}` | Yes | Delete task |
| POST | `/tasks/{id}/comments` | Yes | Add comment |
| GET | `/users` | Yes | List users |
| GET | `/dashboard/stats` | Yes | Dashboard statistics |
| GET | `/integrations/weather` | Yes | External weather data |

---

## Database Migrations

```bash
# Create a new migration
cd backend
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

---

## Contributing

1. Create a feature branch from `main`
2. Make changes and add tests
3. Run `pytest tests/ -v` — all tests must pass
4. Run `npm run build` in `frontend/` — must build cleanly
5. Open a pull request
