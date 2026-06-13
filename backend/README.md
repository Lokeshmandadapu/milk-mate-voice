# Milk Mate Pro Backend

Backend scaffold for Milk Mate Pro using Node.js, Express.js, MySQL, and JWT authentication.

## Recommended stack

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MySQL
- Authentication: JWT
- Charts: Recharts
- Voice: Web Speech API on the frontend

## Getting started

1. Copy `.env.example` to `.env`.
2. Update MySQL credentials and JWT secret.
3. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API structure

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard/summary`
- `GET /api/farmers`
- `POST /api/farmers`
- `GET /api/milk-collection`
- `POST /api/milk-collection`
- `GET /api/payments`
- `POST /api/payments`
- `GET /api/analytics/milk-volume`
- `GET /api/analytics/payments`
- `GET /api/reports/daily-collections`
- `GET /api/reports/payments`
- `GET /api/notifications`
- `GET /api/admin/users`
- `POST /api/ai/assistant`

## Database tables (suggested)

- `users`
- `farmers`
- `milk_collections`
- `payments`
- `notifications`

Create the tables before running the backend, or add migrations.

## MySQL setup

1. Install MySQL and make sure the server is running.
2. Copy `.env.example` to `.env` and update your connection settings.
3. Run the schema script to create the database and tables:
   ```bash
   cd backend
   npm run db:init
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
