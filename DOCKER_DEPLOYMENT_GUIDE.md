# Docker Deployment Guide for HRMS Project

This guide provides a complete step-by-step process to install Docker and deploy the HRMS application using Docker containers.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Docker Installation](#docker-installation)
3. [Project Setup](#project-setup)
4. [Docker Deployment](#docker-deployment)
5. [Database Setup](#database-setup)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Useful Commands](#useful-commands)

---

## Prerequisites

Before starting, ensure you have:
- Windows 10/11 (64-bit) with WSL 2 enabled
- At least 4GB of RAM
- Administrator access to your computer
- Internet connection

---

## Docker Installation

### Step 1: Enable WSL 2 (Windows Subsystem for Linux)

1. Open PowerShell as Administrator and run:
```powershell
wsl --install
```

2. Restart your computer when prompted

3. After restart, verify WSL installation:
```powershell
wsl --list --verbose
```

### Step 2: Download and Install Docker Desktop

1. Visit the official Docker website:
   - Go to: https://www.docker.com/products/docker-desktop/

2. Download Docker Desktop for Windows

3. Run the installer (`Docker Desktop Installer.exe`)

4. During installation:
   - ✅ Check "Use WSL 2 instead of Hyper-V"
   - ✅ Check "Add shortcut to desktop"

5. Click "Ok" and wait for installation to complete

6. Restart your computer when prompted

### Step 3: Verify Docker Installation

1. Open Command Prompt or PowerShell

2. Check Docker version:
```cmd
docker --version
```
Expected output: `Docker version 24.x.x, build xxxxxxx`

3. Check Docker Compose version:
```cmd
docker compose version
```
Expected output: `Docker Compose version v2.x.x`

**Note:** Modern Docker uses `docker compose` (with space), not `docker-compose` (with hyphen)

4. Test Docker is running:
```cmd
docker run hello-world
```
You should see a "Hello from Docker!" message

---

## Project Setup

### Step 4: Navigate to Project Directory

Open Command Prompt and navigate to your project:
```cmd
cd c:\Users\shiva\OneDrive\Desktop\HRMS2
```

### Step 5: Configure Environment Variables

1. **Backend Environment Setup:**
```cmd
cd backend
copy .env.example .env
```

2. Open `backend\.env` and update the following values:
```env
DATABASE_URL="postgresql://hrms_user:hrms_pass@postgres:5432/hrms_db"
REDIS_URL="redis://redis:6379"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
SUPER_ADMIN_EMAIL="admin@hrms.com"
SUPER_ADMIN_PASSWORD="Admin@123456"
```

3. **Frontend Environment Setup:**
```cmd
cd ..\frontend
copy .env.example .env
```

4. Open `frontend\.env` and verify:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_APP_NAME=HRMS Platform
```

5. Return to project root:
```cmd
cd ..
```

---

## Docker Deployment

### Step 6: Build Docker Images

From the project root directory (`HRMS2`), build all Docker images:

```cmd
docker compose build
```

**Note:** Use `docker compose` (with space), not `docker-compose` (with hyphen)

This process will:
- Download base Node.js images
- Install dependencies for backend and frontend
- Generate Prisma client
- Create custom images for your application

**Note:** First build may take 5-10 minutes depending on your internet speed.

### Step 7: Start Docker Containers

Start all services in detached mode:

```cmd
docker compose up -d
```

This will start:
- ✅ PostgreSQL database (port 5432)
- ✅ Redis cache (port 6379)
- ✅ Backend API (port 5000)
- ✅ Frontend application (port 3000)

### Step 8: Check Container Status

Verify all containers are running:

```cmd
docker compose ps
```

Expected output:
```
NAME                IMAGE               STATUS
hrms_postgres       postgres:16-alpine  Up
hrms_redis          redis:7-alpine      Up
hrms_backend        hrms2-backend       Up
hrms_frontend       hrms2-frontend      Up
```

---

## Database Setup

### Step 9: Run Database Migrations

1. Access the backend container:
```cmd
docker compose exec backend sh
```

2. Inside the container, run Prisma migrations:
```sh
pnpm prisma migrate deploy
```

3. (Optional) Seed the database with initial data:
```sh
pnpm seed
```

4. Exit the container:
```sh
exit
```

---

## Verification

### Step 10: Test the Application

1. **Check Backend API:**
   - Open browser: http://localhost:5000
   - You should see API response or health check

2. **Check Frontend:**
   - Open browser: http://localhost:3000
   - You should see the HRMS login page

3. **Check Database Connection:**
```cmd
docker compose exec postgres psql -U hrms_user -d hrms_db -c "\dt"
```
This should list all database tables

4. **Check Redis:**
```cmd
docker compose exec redis redis-cli ping
```
Expected output: `PONG`

### Step 11: View Logs

Monitor application logs:

```cmd
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f redis
```

Press `Ctrl+C` to stop viewing logs

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Port Already in Use
**Error:** `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution:**
```cmd
# Check what's using the port
netstat -ano | findstr :5432

# Stop the conflicting service or change port in docker-compose.yml
```

**Alternative:** Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - '5433:5432'  # Use 5433 on host instead
```

#### Issue 2: Docker Daemon Not Running
**Error:** `Cannot connect to the Docker daemon`

**Solution:**
- Open Docker Desktop application
- Wait for Docker to start (whale icon in system tray)
- Retry your command

#### Issue 3: Build Fails
**Error:** `npm install` or `pnpm install` fails

**Solution:**
```cmd
# Clean Docker cache and rebuild
docker compose down
docker system prune -a
docker compose build --no-cache
docker compose up -d
```

#### Issue 4: Database Connection Error
**Error:** `Can't reach database server`

**Solution:**
```cmd
# Restart database container
docker compose restart postgres

# Check database logs
docker compose logs postgres
```

#### Issue 5: Frontend Can't Connect to Backend
**Solution:**
- Verify backend is running: `docker compose ps`
- Check backend logs: `docker compose logs backend`
- Ensure `VITE_API_URL` in frontend `.env` is correct

---

## Useful Commands

### Container Management

```cmd
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart specific service
docker compose restart backend

# Stop specific service
docker compose stop frontend

# Remove all containers and volumes
docker compose down -v
```

### Logs and Debugging

```cmd
# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend

# View last 100 lines
docker compose logs --tail=100 backend

# Execute command in container
docker compose exec backend sh
docker compose exec postgres psql -U hrms_user -d hrms_db
```

### Database Operations

```cmd
# Access PostgreSQL
docker compose exec postgres psql -U hrms_user -d hrms_db

# Backup database
docker compose exec postgres pg_dump -U hrms_user hrms_db > backup.sql

# Restore database
docker compose exec -T postgres psql -U hrms_user -d hrms_db < backup.sql

# Run Prisma migrations
docker compose exec backend pnpm prisma migrate deploy

# Generate Prisma client
docker compose exec backend pnpm prisma generate
```

### Cleanup Commands

```cmd
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything (use with caution!)
docker system prune -a --volumes
```

### Rebuild and Restart

```cmd
# Rebuild specific service
docker compose build backend

# Rebuild and restart
docker compose up -d --build

# Force recreate containers
docker compose up -d --force-recreate
```

---

## Production Deployment Notes

For production deployment, consider these changes:

1. **Update docker-compose.yml:**
   - Change `NODE_ENV` to `production`
   - Remove volume mounts for code
   - Use production build commands

2. **Security:**
   - Generate strong JWT secrets
   - Use environment-specific `.env` files
   - Enable HTTPS/SSL
   - Configure firewall rules

3. **Performance:**
   - Use production-optimized images
   - Enable Redis persistence
   - Configure PostgreSQL for production
   - Set up proper logging

4. **Monitoring:**
   - Add health checks
   - Set up log aggregation
   - Configure alerts
   - Use Docker Swarm or Kubernetes for orchestration

---

## Quick Start Summary

For experienced users, here's the quick start:

```cmd
# 1. Install Docker Desktop for Windows (see INSTALL_DOCKER_WINDOWS.md)

# 2. Navigate to project
cd c:\Users\shiva\OneDrive\Desktop\HRMS2

# 3. Setup environment
cd backend && copy .env.example .env && cd ..
cd frontend && copy .env.example .env && cd ..

# 4. Build and start (use 'docker compose' with space, not 'docker-compose')
docker compose build
docker compose up -d

# 5. Run migrations
docker compose exec backend pnpm prisma migrate deploy

# 6. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## Support

If you encounter issues:
1. Check the logs: `docker compose logs -f`
2. Verify all containers are running: `docker compose ps`
3. Review this troubleshooting guide
4. Check Docker Desktop dashboard for container status

**Important:** Modern Docker uses `docker compose` (with space), not `docker-compose` (with hyphen)

---

**Last Updated:** May 20, 2026
**Docker Version:** 24.x+
**Docker Compose Version:** v2.x+
