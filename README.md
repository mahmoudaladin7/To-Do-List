# To-Do API (Node.js + Express + Prisma + PostgreSQL)

## Setup

1. `npm install`
2. Copy `.env.example` → `.env` and set values
3. `npx prisma migrate dev --name init` (creates tables)
4. `npm run dev` and open `http://localhost:3000/health`

## Scripts

- `npm run dev` – run with hot reload
- `npm run build` – compile TypeScript
- `npm start` – run compiled build

## Tech

Express, TypeScript, Prisma, PostgreSQL, Zod, Bcrypt, Helmet, Morgan.
