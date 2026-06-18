# Internal API-Based LinkedIn Automation Agent

A full-stack Next.js application that orchestrates internal APIs to research topics, generate content and banners, and publish drafts to LinkedIn after human review.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   Ensure you have a PostgreSQL database running.
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update the `DATABASE_URL` inside `.env` to point to your PostgreSQL instance.

3. **Prisma Migrations**
   Initialize the database schema:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Access the dashboard at [http://localhost:3000](http://localhost:3000).

## Architecture overview
- **Agents (`src/lib/agents`)**: Business logic layer that orchestrates the internal APIs and saves state to the database.
- **API Wrappers (`src/lib/api-clients`)**: Abstract wrappers for simulating internal API endpoints.
- **Next.js API Routes (`src/app/api`)**: Endpoints used by the frontend to trigger agent actions.
- **UI (`src/app/(dashboard)`)**: React-based dashboard for reviewing, editing, and publishing content.

## Compliance Guarantee
This application does **not** scrape LinkedIn or use browser automation. All actions are handled via strictly defined internal HTTP APIs.
