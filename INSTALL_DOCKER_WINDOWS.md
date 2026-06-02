# Docker Installation Guide for Windows

## Current Issue
You're getting the error: `docker-compose : The term 'docker-compose' is not recognized`

This means **Docker is not installed** on your system yet.

---

## Step-by-Step Installation

### Step 1: Check Windows Version
You need Windows 10 64-bit (version 1903 or higher) or Windows 11.

To check your Windows version:
1. Press `Win + R`
2. Type `winver` and press Enter
3. Check the version number

---

### Step 2: Enable WSL 2 (Required for Docker)

#### Option A: Automatic Installation (Recommended)
1. Open **PowerShell as Administrator**:
   - Press `Win + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. Run this command:
```powershell
wsl --install
```

3. **Restart your computer** when prompted

4. After restart, open PowerShell and verify:
```powershell
wsl --list --verbose
```

#### Option B: Manual Installation
If automatic installation doesn't work:

1. Open PowerShell as Administrator and run:
```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

2. Enable Virtual Machine Platform:
```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

3. **Restart your computer**

4. Download and install WSL2 Linux kernel update:
   - Visit: https://aka.ms/wsl2kernel
   - Download and run the installer

5. Set WSL 2 as default:
```powershell
wsl --set-default-version 2
```

---

### Step 3: Install Docker Desktop

1. **Download Docker Desktop:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - Save the file: `Docker Desktop Installer.exe`

2. **Run the Installer:**
   - Double-click `Docker Desktop Installer.exe`
   - If prompted by User Account Control, click "Yes"

3. **Installation Options:**
   - ✅ Check: "Use WSL 2 instead of Hyper-V" (recommended)
   - ✅ Check: "Add shortcut to desktop"
   - Click "Ok"

4. **Wait for Installation:**
   - This may take 5-10 minutes
   - Do not close the installer

5. **Restart Computer:**
   - Click "Close and restart" when prompted
   - Your computer will restart

---

### Step 4: Start Docker Desktop

1. After restart, Docker Desktop should start automatically
   - Look for the Docker whale icon in the system tray (bottom-right)

2. If it doesn't start automatically:
   - Search for "Docker Desktop" in Start menu
   - Click to open

3. **Wait for Docker to start:**
   - The whale icon will animate while starting
   - When ready, it will show "Docker Desktop is running"

4. **Accept Terms (First Time):**
   - You may need to accept Docker's terms of service
   - Click "Accept"

---

### Step 5: Verify Installation

Open a **new** Command Prompt or PowerShell window and run:

```cmd
docker --version
```
Expected output: `Docker version 24.x.x, build xxxxxxx`

```cmd
docker compose version
```
Expected output: `Docker Compose version v2.x.x`

Test Docker is working:
```cmd
docker run hello-world
```
You should see: "Hello from Docker!"

---

## Important Notes

### Modern Docker Compose Command
- **Old command:** `docker-compose` (with hyphen) - deprecated
- **New command:** `docker compose` (with space) - current standard

### Use These Commands:
```cmd
# Build images
docker compose build

# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Check status
docker compose ps
```

---

## Troubleshooting

### Issue 1: "WSL 2 installation is incomplete"
**Solution:**
1. Download WSL2 kernel: https://aka.ms/wsl2kernel
2. Install it
3. Restart Docker Desktop

### Issue 2: "Docker Desktop requires a newer WSL kernel version"
**Solution:**
```powershell
wsl --update
```

### Issue 3: "Hardware assisted virtualization is not enabled"
**Solution:**
1. Restart computer
2. Enter BIOS/UEFI (usually press F2, F10, or Del during startup)
3. Enable "Virtualization Technology" or "VT-x" or "AMD-V"
4. Save and exit BIOS

### Issue 4: Docker Desktop won't start
**Solution:**
1. Open Task Manager (Ctrl+Shift+Esc)
2. End any "Docker" processes
3. Restart Docker Desktop
4. If still fails, restart computer

### Issue 5: "Access denied" errors
**Solution:**
- Run Command Prompt or PowerShell as Administrator
- Right-click → "Run as administrator"

---

## After Installation - Deploy HRMS Project

Once Docker is installed and verified, follow these steps:

### 1. Navigate to Project
```cmd
cd c:\Users\shiva\OneDrive\Desktop\HRMS2
```

### 2. Setup Environment Files
```cmd
cd backend
copy .env.example .env
cd ..

cd frontend
copy .env.example .env
cd ..
```

### 3. Build Docker Images
```cmd
docker compose build
```
⏱️ This will take 5-10 minutes on first run

### 4. Start All Services
```cmd
docker compose up -d
```

### 5. Run Database Migrations
```cmd
docker compose exec backend pnpm prisma migrate deploy
```

### 6. Check Status
```cmd
docker compose ps
```

All services should show "Up" status.

### 7. Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## Quick Reference Card

Save these commands for daily use:

```cmd
# Start project
docker compose up -d

# Stop project
docker compose down

# View logs
docker compose logs -f

# Restart service
docker compose restart backend

# Rebuild after code changes
docker compose up -d --build

# Access backend container
docker compose exec backend sh

# Access database
docker compose exec postgres psql -U hrms_user -d hrms_db
```

---

## Need Help?

1. **Check Docker is running:**
   - Look for whale icon in system tray
   - Should say "Docker Desktop is running"

2. **View Docker Desktop Dashboard:**
   - Click the whale icon
   - Select "Dashboard"
   - See all running containers

3. **Check logs in Docker Desktop:**
   - Open Dashboard
   - Click on container name
   - View logs in real-time

---

## System Requirements

**Minimum:**
- Windows 10 64-bit: version 1903 or higher
- 4GB RAM
- BIOS-level hardware virtualization support enabled

**Recommended:**
- Windows 11
- 8GB+ RAM
- SSD storage
- Stable internet connection

---

**Installation Time Estimate:**
- WSL 2 setup: 5-10 minutes
- Docker Desktop download: 5-10 minutes (depends on internet speed)
- Docker Desktop installation: 5-10 minutes
- **Total: 15-30 minutes**

---

**Last Updated:** May 20, 2026
