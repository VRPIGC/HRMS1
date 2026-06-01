# HRMS Enterprise Platform

A full-stack, multi-tenant Human Resource Management System built with Node.js, React, PostgreSQL, and Redis. Supports multiple companies on a single deployment, with role-based access for Super Admin, Company Admin, HR, and Employees.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [User Roles & Workflow](#user-roles--workflow)
- [Feature Modules](#feature-modules)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Running Locally](#running-locally)
- [Default Credentials](#default-credentials)

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js 20 + TypeScript | Runtime & language |
| Express.js | HTTP server & routing |
| Prisma ORM | Database access & migrations |
| PostgreSQL 16 | Primary relational database |
| Redis 7 | Caching & session support |
| JSON Web Tokens (JWT) | Access & refresh token auth |
| bcryptjs | Password hashing |
| Multer | File / document uploads |
| Helmet | HTTP security headers |
| Morgan | HTTP request logging |
| Supabase JS SDK | Cloud storage & auth sync |
| Razorpay SDK | Payment processing |
| ts-node-dev | Dev server with hot reload |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool & dev server |
| React Router v6 | Client-side routing |
| Zustand | Global state management |
| TanStack React Query | Server state & data fetching |
| Axios | HTTP client with interceptors |
| Tailwind CSS | Utility-first styling |
| Recharts | Charts & data visualisation |
| Framer Motion | Animations |
| React Hook Form + Zod | Form handling & validation |
| Lucide React | Icon library |
| date-fns | Date formatting |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerised deployment |
| PostgreSQL (Docker) | Database container |
| Redis (Docker) | Cache container |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React)                      │
│  Vite + React 18 + Zustand + React Query + Axios        │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Express.js Backend                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Routes  │→ │Middleware│→ │    Controllers        │  │
│  └──────────┘  │ - Auth   │  │ - auth.controller     │  │
│                │ - RBAC   │  │ - employee.controller │  │
│                │ - Tenant │  │ - attendance.controller│  │
│                │ - Audit  │  │ - payroll.controller  │  │
│                └──────────┘  │ - leave.controller    │  │
│                              │ - monitoring.controller│  │
│                              │ - superadmin.controller│  │
│                              └──────────┬─────────────┘  │
│                                         │                 │
│                              ┌──────────▼─────────────┐  │
│                              │       Services          │  │
│                              │ - auth.service          │  │
│                              │ - employee.service      │  │
│                              │ - payroll.service       │  │
│                              │ - tenant.service        │  │
│                              │ - credit.service        │  │
│                              │ - upload.service        │  │
│                              └──────────┬─────────────┘  │
└─────────────────────────────────────────┼────────────────┘
                                          │
              ┌───────────────────────────┼──────────────┐
              │                           │              │
              ▼                           ▼              ▼
     ┌─────────────────┐      ┌──────────────────┐  ┌────────┐
     │  PostgreSQL 16  │      │    Redis 7        │  │Supabase│
     │  (via Prisma)   │      │  (Cache/Sessions) │  │Storage │
     └─────────────────┘      └──────────────────┘  └────────┘
```

### Multi-Tenancy
Every company (tenant) is isolated by `tenantId`. The `resolveTenant` middleware reads the tenant from the request and attaches it to the context. All database queries are scoped to the tenant, so data never leaks between companies.

---

## Project Structure

```
HRMS2/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models
│   │   └── migrations/            # SQL migration history
│   ├── src/
│   │   ├── app.ts                 # Express app setup (CORS, middleware, routes)
│   │   ├── server.ts              # HTTP server bootstrap
│   │   ├── config/
│   │   │   ├── database.ts        # Prisma client singleton
│   │   │   ├── redis.ts           # Redis client
│   │   │   └── constants.ts       # App-wide constants
│   │   ├── controllers/           # Request handlers (one per domain)
│   │   ├── services/              # Business logic layer
│   │   ├── routes/                # Express routers
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts      # JWT verification
│   │   │   ├── rbac.middleware.ts      # Role-based access control
│   │   │   ├── tenant.middleware.ts    # Tenant resolution
│   │   │   ├── audit.middleware.ts     # Audit log writer
│   │   │   └── error.middleware.ts     # Global error handler
│   │   ├── utils/
│   │   │   ├── jwt.utils.ts       # Token generation & verification
│   │   │   ├── password.utils.ts  # bcrypt helpers
│   │   │   ├── response.utils.ts  # Standardised API responses
│   │   │   ├── pagination.utils.ts
│   │   │   └── seed.ts            # Creates Super Admin account only
│   │   ├── jobs/
│   │   │   ├── attendance.job.ts  # Scheduled attendance processing
│   │   │   └── payroll.job.ts     # Scheduled payroll generation
│   │   └── sockets/
│   │       └── monitoring.socket.ts  # Real-time employee monitoring
│   ├── public/uploads/            # Uploaded files (documents, screenshots)
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Root router
│   │   ├── main.tsx               # React entry point
│   │   ├── api/                   # Axios API wrappers per domain
│   │   ├── components/
│   │   │   ├── attendance/        # Clock-in button, calendar
│   │   │   ├── charts/            # Recharts wrappers
│   │   │   ├── monitoring/        # Screenshot grid, activity chart
│   │   │   ├── onboarding/        # Employee onboarding modals
│   │   │   ├── payroll/           # Payslip card, salary breakdown
│   │   │   ├── shared/            # DataTable, StatCard, PageHeader, etc.
│   │   │   └── ui/                # Base UI primitives (button, card, input)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── layouts/               # Role-specific shell layouts
│   │   ├── middleware/
│   │   │   └── ProtectedRoute.tsx # Auth + role guard
│   │   ├── pages/
│   │   │   ├── auth/              # Login, ResetPassword
│   │   │   ├── superadmin/        # Platform management
│   │   │   ├── admin/             # Company management
│   │   │   ├── hr/                # HR operations
│   │   │   ├── employee/          # Employee self-service
│   │   │   └── onboarding/        # Onboarding flow
│   │   ├── store/
│   │   │   ├── auth.store.ts      # Zustand auth state (persisted)
│   │   │   └── tenant.store.ts    # Tenant context
│   │   └── types/                 # TypeScript interfaces
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## User Roles & Workflow

The system has four roles arranged in a hierarchy. Each role has its own dashboard and set of permissions.

```
Super Admin
    │
    ├── Approves / rejects company registrations
    ├── Manages all tenants (activate, suspend)
    ├── Allocates credits to companies
    └── Views global analytics
         │
    Company Admin (one per company)
         │
         ├── Manages HR users (create, assign employee limits)
         ├── Views company-wide reports & payroll
         ├── Manages departments & designations
         └── Purchases credits via Razorpay
              │
         HR Manager (multiple per company)
              │
              ├── Adds & manages employees
              ├── Approves / rejects leave requests
              ├── Manages attendance records
              ├── Runs payroll
              ├── Monitors employee activity (screenshots)
              ├── Assigns tasks
              └── Handles recruitment & onboarding
                   │
              Employee (managed by HR)
                   │
                   ├── Clocks in / out
                   ├── Applies for leave
                   ├── Views payslips
                   ├── Uploads documents
                   ├── Views assigned tasks
                   └── Manages own profile
```

### Complete User Journey

#### 1. Company Registration
1. A company representative opens the login page and clicks **Register Company**
2. They fill in company name, contact details, and admin email
3. The system creates a `Tenant` record with status `PENDING` and 50,000 starter credits
4. The Super Admin receives the registration in the **Pending Registrations** panel
5. Super Admin reviews and clicks **Approve** → tenant status becomes `ACTIVE`
6. The company admin can now log in

#### 2. Company Admin Onboarding
1. Admin logs in and lands on the Admin Dashboard
2. Creates departments and designations
3. Provisions HR users via **HR Management** (sets employee limits per HR)
4. Purchases additional credits if needed via Razorpay

#### 3. HR Onboarding Employees
1. HR logs in and goes to **Employees → Add Employee**
2. Fills in employee details (name, department, designation, salary, joining date)
3. System creates a `User` + `Employee` record and sends login credentials
4. Employee goes through the onboarding flow (document upload, verification)
5. HR verifies documents and marks onboarding complete

#### 4. Daily Operations
- **Attendance**: Employees clock in/out; HR views daily/monthly reports
- **Leave**: Employee applies → HR approves/rejects → status updates in real time
- **Payroll**: HR runs monthly payroll; employees view payslips
- **Monitoring**: HR views employee screenshots and activity scores
- **Tasks**: HR assigns tasks; employees update status

---

## Feature Modules

### Authentication
- Email or username login
- JWT access token (15 min) + refresh token (7 days)
- Automatic token refresh via Axios interceptor
- Forgot password → secure token → reset password page
- Super Admin auto-created on first server boot

### Multi-Tenant Management (Super Admin)
- Approve / reject / suspend companies
- Allocate and track credits per tenant
- Global analytics across all tenants
- Wallet & transaction history

### Company Administration
- HR user provisioning with employee limits
- Department & designation management
- Company-wide employee list
- Payroll overview
- Credit purchase via Razorpay

### HR Operations
- Add / edit / deactivate employees
- Attendance tracking with clock-in/out
- Leave request management (approve / reject)
- Monthly payroll processing
- Salary advance requests
- Document management & verification
- Employee activity monitoring (screenshots via WebSocket)
- Task assignment & tracking
- Recruitment & job postings

### Employee Self-Service
- Personal dashboard with stats
- Clock in / out
- Leave application
- Payslip history
- Document upload
- Task list
- Profile & settings

### Onboarding Flow
- Multi-step employee onboarding
- Document upload with verification
- HR verification panel
- Employee welcome page

### Monitoring
- Real-time screenshot capture via WebSocket
- Activity score calculation
- Idle time tracking
- Screenshot grid view for HR

---

## API Routes

All routes are prefixed with `/api`.

| Prefix | Description |
|---|---|
| `POST /api/auth/login` | Login with email/username + password |
| `POST /api/auth/refresh` | Refresh access token |
| `POST /api/auth/forgot-password` | Request password reset link |
| `POST /api/auth/reset-password` | Reset password with token |
| `GET  /api/auth/me` | Get current user (authenticated) |
| `POST /api/auth/register` | Register a new company |
| `/api/superadmin/*` | Super Admin operations |
| `/api/admin/*` | Company Admin operations |
| `/api/hr/*` | HR operations |
| `/api/employees/*` | Employee CRUD |
| `/api/attendance/*` | Clock in/out, reports |
| `/api/leaves/*` | Leave requests & approvals |
| `/api/payroll/*` | Payroll processing & payslips |
| `/api/documents/*` | Document upload & verification |
| `/api/monitoring/*` | Screenshots & activity |
| `/api/onboarding/*` | Onboarding flow |
| `/api/recruitment/*` | Job postings & applications |
| `/api/credits/*` | Credit management |
| `/api/payments/*` | Razorpay payment processing |
| `/api/salary-advances/*` | Salary advance requests |
| `GET  /api/health` | Health check |

---

## Database Schema

Key models in `prisma/schema.prisma`:

| Model | Description |
|---|---|
| `Tenant` | A company. Has status (PENDING / ACTIVE / SUSPENDED / TRIAL) and credits |
| `User` | Any system user. Linked to a tenant. Has role: SUPER_ADMIN / ADMIN / HR / EMPLOYEE |
| `Employee` | Employee profile linked to a User. Has department, designation, salary, HR assignment |
| `HRProfile` | HR-specific data: employee limit, credits used |
| `Attendance` | Daily clock-in/out records per employee |
| `Leave` | Leave requests with type, dates, status, approver |
| `Payroll` | Monthly payroll records with salary breakdown |
| `Document` | Employee documents with verification status |
| `Screenshot` | Employee monitoring screenshots with activity score |
| `Task` | Tasks assigned to employees |
| `CreditTransaction` | Credit debit/credit history per tenant |
| `AuditLog` | System-wide audit trail |
| `JobPosting` | Recruitment job listings |
| `JobApplication` | Candidate applications with AI score |
| `Session` | User sessions with expiry and IP |
| `RegisteredIp` | IP-based registration tracking |

---

## Authentication Flow

```
User submits email + password
        │
        ▼
Backend: authService.login()
        │
        ├── Find user by email OR username
        ├── Check tenant status (PENDING / SUSPENDED → reject)
        ├── Check user.isActive
        ├── Try Supabase signInWithPassword
        │       └── On failure → fallback to local bcrypt compare
        ├── Update lastLoginAt
        └── Generate accessToken (15m) + refreshToken (7d)
                │
                ▼
        Frontend stores tokens in Zustand (persisted to localStorage)
                │
                ▼
        Axios request interceptor attaches Bearer token to every request
                │
                ▼
        On 401 response → Axios interceptor calls POST /auth/refresh
                │
                ├── Success → retry original request with new token
                └── Failure → logout + redirect to /login
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL="postgresql://hrms_user:hrms_pass@localhost:5432/hrms_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# Super Admin (auto-created on boot)
SUPER_ADMIN_EMAIL="superadmin@hrms.com"
SUPER_ADMIN_PASSWORD="SuperAdmin@123"

# Supabase (optional - for cloud storage & auth sync)
SUPABASE_URL=""
SUPABASE_KEY=""

# AWS S3 (optional - for file storage)
AWS_BUCKET_NAME=""
AWS_REGION=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# Razorpay (for credit purchases)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_APP_NAME=HRMS Platform
```

---

## Running with Docker

Requires Docker Desktop installed and running.

```bash
# 1. Clone and navigate to project
cd HRMS2

# 2. Copy environment files
cd backend && copy .env.example .env && cd ..
cd frontend && copy .env.example .env && cd ..

# 3. Build images (first time takes 5-10 minutes)
docker compose build

# 4. Start all services
docker compose up -d

# 5. Run database migrations
docker compose exec backend pnpm prisma migrate deploy

# 5. Seed Super Admin account
docker compose exec backend pnpm seed
```

Services started:
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### Useful Docker Commands

```bash
# View logs
docker compose logs -f backend

# Restart a service
docker compose restart backend

# Stop everything
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Access database
docker compose exec postgres psql -U hrms_user -d hrms_db
```

---

## Running Locally

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL 16 running locally
- Redis running locally

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your local DB and Redis URLs

pnpm install
pnpm prisma migrate deploy
pnpm prisma generate
pnpm seed          # creates Super Admin account
pnpm dev           # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env

pnpm install
pnpm dev           # starts on http://localhost:3000
```

---

## Default Credentials

These are created after running `pnpm seed`.

### Super Admin
| Email | Password |
|---|---|
| superadmin@hrms.com | SuperAdmin@123 |

> All other users (Company Admins, HR, Employees) are created through the application workflow — no dummy data is seeded.

---

## Notes

- **Forgot Password**: In development, the reset link is printed to the backend console log. Wire in an email provider (SendGrid, Nodemailer) in `auth.controller.ts → forgotPassword` for production.
- **Monitoring**: Real-time screenshot streaming uses WebSockets via `monitoring.socket.ts`.
- **Scheduled Jobs**: `attendance.job.ts` and `payroll.job.ts` handle automated processing.
- **Audit Logs**: Every significant action is recorded in the `AuditLog` table via `audit.middleware.ts`.
