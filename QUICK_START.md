# HRMS Docker Quick Start Guide

## ⚠️ First Time? Docker Not Installed?

**Read this first:** `INSTALL_DOCKER_WINDOWS.md`

---

## ✅ Prerequisites Checklist

Before running commands below, ensure:
- [ ] Docker Desktop is installed
- [ ] Docker Desktop is running (whale icon in system tray)
- [ ] You can run: `docker --version` successfully

---

## 🚀 Deploy HRMS in 5 Commands

Open Command Prompt in project directory and run:

```cmd
# 1. Navigate to project
cd c:\Users\shiva\OneDrive\Desktop\HRMS2

# 2. Setup environment files
cd backend && copy .env.example .env && cd .. && cd frontend && copy .env.example .env && cd ..

# 3. Build Docker images (takes 5-10 minutes first time)
docker compose build

# 4. Start all services
docker compose up -d

# 5. Setup database
docker compose exec backend pnpm prisma migrate deploy
```

---

## 🌐 Access Your Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432
- **Redis:** localhost:6379

---

## 📋 Essential Commands

### Check Status
```cmd
# See all running containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
```

### Start/Stop
```cmd
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart specific service
docker compose restart backend
```

### Database Operations
```cmd
# Access database
docker compose exec postgres psql -U hrms_user -d hrms_db

# Run migrations
docker compose exec backend pnpm prisma migrate deploy

# Access backend shell
docker compose exec backend sh
```

---

## 🔧 Common Issues

### Issue: "docker-compose not recognized"
**Solution:** Use `docker compose` (with space), not `docker-compose` (with hyphen)

### Issue: "Cannot connect to Docker daemon"
**Solution:** 
1. Open Docker Desktop
2. Wait for it to start (whale icon in system tray)
3. Try command again

### Issue: "Port already in use"
**Solution:**
```cmd
# Check what's using the port
netstat -ano | findstr :5000

# Stop the process or change port in docker-compose.yml
```

### Issue: "Build failed"
**Solution:**
```cmd
# Clean and rebuild
docker compose down
docker system prune -a
docker compose build --no-cache
docker compose up -d
```

---

## 🛑 Stop Everything

```cmd
# Stop all containers
docker compose down

# Stop and remove volumes (⚠️ deletes database data)
docker compose down -v
```

---

## 📚 Need More Help?

- **Full Installation Guide:** `INSTALL_DOCKER_WINDOWS.md`
- **Detailed Deployment Guide:** `DOCKER_DEPLOYMENT_GUIDE.md`
- **Docker Desktop Dashboard:** Click whale icon → Dashboard

---

## 🎯 Daily Workflow

```cmd
# Morning - Start work
docker compose up -d

# Check everything is running
docker compose ps

# View logs if needed
docker compose logs -f backend

# Evening - Stop work
docker compose down
```

---

**Remember:** Always use `docker compose` (with space) ✅  
**Not:** `docker-compose` (with hyphen) ❌

---

**Last Updated:** May 20, 2026
