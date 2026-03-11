# IdeaForge

IdeaForge is a full-stack idea sharing platform with authentication, ideas, comments, reactions, join requests, and notifications.

## Features
- Google OAuth login with JWT-based API access
- CRUD for ideas
- Comments and reactions on ideas
- Join requests with approve/reject flows
- Notifications for user activity
- Rate limiting, request logging, and basic metrics

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), Passport (Google OAuth)
- Frontend: React + Vite, React Router, Axios
- Testing: Jest + Supertest

## Project Structure
- backend/ - Express API, MongoDB models, routes, controllers
- frontend/ - React app

## Prerequisites
- Node.js 18+ and npm
- MongoDB running locally or a hosted MongoDB URI
- Google OAuth credentials (for login)

## Environment Variables
Copy the examples and fill values:

Backend (backend/.env)
- NODE_ENV=development
- PORT=5000
- MONGO_URI=
- JWT_SECRET=
- GOOGLE_CLIENT_ID=
- GOOGLE_CLIENT_SECRET=
- FRONTEND_URL=http://localhost:5173
- CORS_ORIGINS=http://localhost:5173
- LOG_LEVEL=debug

Frontend (frontend/.env)
- VITE_API_URL=http://localhost:5000

## Install
From the repo root:

Backend
1) cd backend
2) npm install

Frontend
1) cd frontend
2) npm install

## Run Locally
Backend
1) cd backend
2) npm run dev

Frontend
1) cd frontend
2) npm run dev

Frontend runs at http://localhost:5173
Backend runs at http://localhost:5000

## Tests
Backend tests:
1) cd backend
2) npm test

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
