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

## 🐳 Setup With Docker

Both the frontend and backend have their own `Dockerfile`. Make sure you have Docker installed and running.

### 1. Backend Docker Setup
Navigate to the backend directory:
```bash
cd apps/backend
```

Prepare environment file:
```bash
cp .env.example .env
```
*(Important: When using Docker, ensure your `DATABASE_URL` in `.env` points to a reachable database host, e.g., using `host.docker.internal` instead of `localhost` if your DB is on the host machine).*

Build the Docker image:
```bash
docker build -t smart-farm-backend .
```

Run the Docker container:
```bash
# Adjust port 5000 to match your backend PORT in .env
docker run -p 5000:5000 --env-file .env smart-farm-backend
```

### 2. Frontend Docker Setup
Navigate to the frontend directory:
```bash
cd apps/frontend
```

Prepare environment file:
```bash
cp .env.example .env
```

Build the Docker image:
```bash
docker build -t smart-farm-frontend .
```

Run the Docker container:
```bash
docker run -p 3000:3000 --env-file .env smart-farm-frontend
```
The frontend will be accessible at `http://localhost:3000`.
