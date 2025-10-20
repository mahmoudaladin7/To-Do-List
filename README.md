# To-Do API (Node.js + Express + Prisma + PostgreSQL)

A TypeScript REST API for managing to-do lists built with Express and Prisma. It handles user registration, enforces credential security with bcrypt, offers Basic Auth middleware for protected endpoints, and includes health checks to monitor the service and database.

## Features

- Type-safe Express server written in TypeScript.
- PostgreSQL persistence via Prisma ORM (with generated client).
- User registration flow that validates input (Zod), enforces unique emails, and stores hashed passwords.
- Basic Auth middleware that authenticates requests by email/password.
- Health endpoints for service liveness (`/health`) and database connectivity (`/db-check`).

## Project Structure

```
.
|-- src/
|   |-- app.ts               # Express app wiring (middlewares, routes, diagnostics)
|   |-- server.ts            # Entry point that loads env and starts HTTP server
|   |-- middleware/
|   |   |-- basicAuth.ts     # Basic Auth guard reused by protected routes
|   |-- modules/
|       |-- users/
|           |-- user.routes.ts
|           |-- users.controller.ts
|           |-- users.schema.ts
|           |-- users.services.ts
|-- prisma/
|   |-- schema.prisma        # Database schema (User + Task models)
|-- .env.example             # Environment variable template
|-- README.md
```

## Prerequisites

- Node.js 18+ (ships with npm)
- Running PostgreSQL instance
- Optional: `pnpm` or `yarn` if you prefer an alternative package manager

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and configure it for your database:

   ```bash
   cp .env.example .env
   ```

   Required variables:

   | Variable       | Description                                      |
   | -------------- | ------------------------------------------------ |
   | `DATABASE_URL` | PostgreSQL connection string used by Prisma      |
   | `PORT`         | Port exposed by the HTTP server (default `3000`) |

3. Run database migrations to create the schema:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the development server with hot reload:

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`.

## Useful Scripts

- `npm run dev` - Start the API with `ts-node` + `nodemon`.
- `npm run build` - Compile TypeScript to `dist/`.
- `npm start` - Run the compiled JavaScript build.
- `npx prisma studio` - (Optional) Launch Prisma Studio UI to inspect data.

## API Overview

### Health Checks

- `GET /health` - Returns `{ "ok": true }` if the service is reachable.
- `GET /db-check` - Executes a trivial SQL query via Prisma to confirm database connectivity.

### User Registration

- `POST /api/v1/users`
  Registers a new user by email.

  Request body:

  ```json
  {
    "email": "user@example.com",
    "password": "secret123"
  }
  ```

  Responses:

  - `201 Created` with the created user (`id`, `email`, `createdAt`).
  - `400 Bad Request` if validation fails (`email` must be valid, `password` >= 8 chars).
  - `409 Conflict` when the email is already registered.

### Protected Endpoints

- `GET /api/v1/protected/ping` - Requires HTTP Basic authentication. On success returns `{ "ok": true, "user": { ... } }`.

  Provide an `Authorization` header formatted as `Basic base64(email:password)`.

  Example:

  ```bash
  curl -i http://localhost:3000/api/v1/protected/ping \
    -H "Authorization: Basic $(printf 'user@example.com:secret123' | base64)"
  ```

  Missing or invalid credentials produce a `401 Unauthorized` response and a `WWW-Authenticate` challenge header.

## Database Schema

Prisma models define `User` records and `Task` entities associated to each user. Tasks include status enums (`pending`, `in_progress`, `done`) and optional due dates. Check `prisma/schema.prisma` if you plan to extend the API with task CRUD endpoints.

## Development Notes

- Prisma client is generated into `src/generated/prisma`. Re-generate after schema changes with `npx prisma generate`.
- Passwords are hashed with bcrypt and never returned by the API.
- Validation is powered by Zod (`users.schema.ts`).

## Next Steps

- Build task CRUD routes under `src/modules/tasks`.
- Add automated tests (unit/integration) to lock down the registration flow and auth middleware.
- Containerize the service with Docker for easier deployment.
