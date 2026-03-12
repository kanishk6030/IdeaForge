# IdeaForge

IdeaForge is a full-stack platform for publishing ideas, collaborating through comments and reactions, and managing join requests with notifications and role-based access.

## Highlights
- Google OAuth login with JWT-based API access
- Idea lifecycle: create, update, delete, browse, and search
- Comments and reactions on ideas
- Join requests with approve and reject flows
- Notifications for user activity
- Security middleware, rate limiting, request logging, and metrics
- Redis response caching for idea list and detail endpoints

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), Passport (Google OAuth)
- Frontend: React, Vite, React Router, Axios
- Cache: Redis
- Testing: Jest, Supertest

## Repository Layout
- backend/ - API server, models, controllers, routes
- frontend/ - React client

## Prerequisites
- Node.js 18+ and npm
- MongoDB (local or hosted)
- Google OAuth credentials (for login)
- Redis (optional but recommended for caching)

## Environment Variables

Backend (backend/.env)
```
NODE_ENV=development
PORT=5000
MONGO_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=https://idea-forge-seven.vercel.app
CORS_ORIGINS=https://idea-forge-seven.vercel.app
LOG_LEVEL=debug

# Redis (optional)
REDIS_INTERNAL_URL=
REDIS_URL=
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
IDEAS_CACHE_TTL_SECONDS=60
IDEA_CACHE_TTL_SECONDS=60
```

Frontend (frontend/.env)
```
VITE_API_URL=https://ideaforge-y20t.onrender.com
```

## Install

Backend
```
cd backend
npm install
```

Frontend
```
cd frontend
npm install
```

## Run Locally

Backend
```
cd backend
npm run dev
```

Frontend
```
cd frontend
npm run dev
```

Default local URLs:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Tests

Backend tests
```
cd backend
npm test
```

## API Quick Reference

Base URL: /api

Auth
- GET /auth/google
- GET /auth/google/callback
- GET /auth/me

Ideas
- POST /ideas
- GET /ideas
- GET /ideas/:id
- PUT /ideas/:id
- DELETE /ideas/:id

Comments
- POST /comments/:ideaId
- GET /comments/:ideaId
- DELETE /comments/:id

Reactions
- POST /reactions/:ideaId
- DELETE /reactions/:ideaId
- GET /reactions/:ideaId

Join Requests
- POST /join-requests/:ideaId
- GET /join-requests/idea/:ideaId
- PUT /join-requests/:id/approve
- PUT /join-requests/:id/reject

Notifications
- GET /notifications
- PUT /notifications/:id/read
- DELETE /notifications/:id

Users
- GET /users/me
- PUT /users/me
- GET /users/:id

Health and Metrics
- GET / (health check)
- GET /api/health
- GET /api/metrics

## Notes
- Protected routes require a valid JWT in the Authorization header.
- CORS origins are controlled by CORS_ORIGINS in the backend env.
- Caching is best-effort and automatically bypassed if Redis is unavailable.
