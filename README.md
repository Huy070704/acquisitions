# Node.js Express App with Drizzle ORM and Neon Postgres

This project is a Node.js API built with ExpressJS and Drizzle ORM, using Neon Serverless Postgres for the database. It is fully Dockerized for both development and production.

## Architecture

- **Development**: Uses a multi-container Docker Compose setup. It runs the Node.js application alongside a `neon-local` proxy container. This allows local development with Neon's branching capabilities without exposing your cloud database directly. Hot-reloading is supported.
- **Production**: Uses a single Docker container running a streamlined, production-ready image. It connects directly to your Neon cloud database URL.

---

## 1. Local Development Setup

The development environment runs your code using `npm run dev` with hot reloading and intercepts database connections via the Neon Local proxy.

### Prerequisites

- Docker and Docker Compose installed.
- A Neon account (https://neon.tech).

### Step 1: Environment Variables

Create your development environment file:

```bash
cp .env.development .env.development.local # or just use .env.development
```

Fill in your Neon credentials in `.env.development`:

- `NEON_API_KEY`: Generate this from your Neon account settings (Developer Settings -> API Keys).
- `NEON_PROJECT_ID`: Find this in your Neon project settings (e.g., `shiny-water-123456`).
- `NEON_BRANCH_ID`: The branch you want to use for local development (e.g., `br-nameless-shape-123456`).

### Step 2: Start the Environment

We've provided a script to automatically start the containers and run Drizzle migrations:

```bash
# On Linux/macOS or Git Bash for Windows
bash scripts/dev.sh
```

This script will:

1. Validate your `.env.development` file.
2. Spin up the `app` and `neon-local` proxy containers.
3. Wait for the database proxy to be ready.
4. Run `drizzle-kit generate` and `drizzle-kit migrate` against the proxy.

The application will be available at `http://localhost:3000`.

### Database Changes in Dev

Because your local environment uses the Neon Local proxy, `src/config/database.js` automatically overrides the Neon Serverless driver's fetch endpoint to route traffic to `http://neon-local:5432/sql`.

---

## 2. Production Setup

The production setup skips the Neon Local proxy and connects directly to your live database securely.

### Step 1: Environment Variables

Configure your production environment file:

```bash
# Edit .env.production
```

Ensure you set the exact `DATABASE_URL` provided by your Neon dashboard for the production branch.

### Step 2: Start the Container

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

This builds a highly optimized, non-root Alpine Linux image containing only production dependencies.
