# Smart Farm Monitoring System

This project contains the frontend and backend applications for the Smart Farm Monitoring System. 

## Project Structure
- `apps/frontend`: Next.js web application.
- `apps/backend`: Node.js/Express backend with Prisma ORM & PostgreSQL.

---

## 🚀 Setup Without Docker (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (Make sure your local or remote database is running)

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd apps/backend
```

Install dependencies:
```bash
npm install
```

Environment Variables:
Copy `.env.example` to `.env` and update your database credentials and other variables:
```bash
cp .env.example .env
```

Setup Database (Prisma):
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Optional: Seed initial data
```

Start the Backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd apps/frontend
```

Install dependencies:
```bash
npm install
```

Environment Variables:
Copy `.env.example` to `.env` and adjust the API URL if needed:
```bash
cp .env.example .env
```

Start the Frontend development server:
```bash
npm run dev
```
The frontend should now be running on `http://localhost:3000`.

---

## 🐳 Setup With Docker (Using Docker Compose)

The easiest way to run both the frontend and backend using Docker is via `docker-compose`. 

### 1. Prepare Environment Variables
Before running Docker Compose, you must ensure both applications have their `.env` files set up.

```bash
# Setup Backend env
cp apps/backend/.env.example apps/backend/.env

# Setup Frontend env
cp apps/frontend/.env.example apps/frontend/.env
```
*(Important: When using Docker, ensure your `DATABASE_URL` in `apps/backend/.env` points to a reachable database host. Use `host.docker.internal` instead of `localhost` if your DB is running on the host machine).*

### 2. Run with Docker Compose
Navigate to the `apps` directory where the `docker-compose.yml` file is located:
```bash
cd apps
```

Build and run the containers in detached mode:
```bash
docker-compose up -d --build
```

- The **Frontend** will be accessible at `http://localhost:3000`.
- The **Backend** will be accessible at `http://localhost:5000`.

To view logs for both services:
```bash
docker-compose logs -f
```

To stop the containers:
```bash
docker-compose down
```
