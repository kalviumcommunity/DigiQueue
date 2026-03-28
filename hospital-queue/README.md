
# DigiQueue - Hospital Queue Management System

## 1. Project Overview

DigiQueue is a role-based hospital queue management system built with Next.js (App Router), Prisma, PostgreSQL, and Redis.

It currently supports three portals:

- `Admin`: manage doctors, queues, and reception token generation
- `Doctor`: login and process patients in queue order
- `Patient`: save profile, get token, and monitor live queue status

---

## 2. Tech Stack

- Frontend: `Next.js 16`, `React 19`
- Backend/API: `Next.js Route Handlers` (`app/api/**`)
- ORM/DB: `Prisma` + `PostgreSQL`
- Live queue cache: `Redis` via `ioredis`
- Styling: custom CSS (`app/portal.css`, `app/patient/patient.css`, `app/globals.css`)

---

## 3. Current Folder Structure (Core)

```text
app/
  page.js
  layout.js
  globals.css
  portal.css
  admin/
    layout.js
    login/page.js
    dashboard/page.js
    doctors/page.js
    queue/page.js
    create-token/page.js
  doctor/
    layout.js
    login/page.jsx
    dashboard/page.jsx
  patient/
    layout.js
    patient.css
    login/page.jsx
    dashboard/page.jsx
    get-token/page.jsx
  api/
    auth/
      admin-login/route.js
      admin-logout/route.js
      doctor-login/route.js
      doctor-logout/route.js
      patient-login/route.js
      patient-logout/route.js
    doctors/route.js
    doctors/[id]/route.js
    queues/route.js
    queues/status/route.js
    tokens/route.js
    tokens-next/route.js
    queue-live/route.js
    test/route.js
middleware.js
lib/
  prisma.js
  redis.js
  api.js
prisma/
  schema.prisma
  migrations/
```

---

## 4. Data Model (Prisma)

### `Doctor`
- `id` (PK)
- `name`
- `specialization`
- `userId` (unique, nullable)
- `password` (nullable)
- relation: one-to-many `Queue`

### `Queue`
- `id` (PK)
- `doctorId` (FK -> Doctor)
- `isActive` (boolean)
- `currentToken` (int)
- `createdAt`
- relation: one-to-many `Token`

### `Token`
- `id` (PK)
- `queueId` (FK -> Queue)
- `tokenNo`
- `patientName`
- `phone`
- `status` (`WAITING | IN_PROGRESS | DONE`)
- `createdAt`

---

## 5. Authentication and Protected Routes

Route protection is implemented in `middleware.js` for:

- `/admin/:path*`
- `/doctor/:path*`
- `/patient/:path*`

Session cookies used:

- `admin_session`
- `doctor_session`
- `patient_session`

Rules:

- If user is not authenticated and tries to open portal pages, redirect to that portal login page.
- If user is already authenticated and opens login page, redirect to dashboard.

---

## 6. Portal Features Implemented

## 6.1 Home (`/`)

- Landing page with 3 portal entries:
  - Admin Login
  - Doctor Login
  - Patient Login

## 6.2 Admin Portal

### Login (`/admin/login`)
- Uses `userId + password`
- Validated via `/api/auth/admin-login`
- Credentials come from `.env`

### Dashboard (`/admin/dashboard`)
- Navigation tiles to:
  - Doctor Management
  - Queue Management
  - Create Token

### Doctor Management (`/admin/doctors`)
- List doctors
- Add doctor
- Edit doctor
- Delete doctor

Delete flow is now safe:
- Deletes related tokens and queues in a Prisma transaction before deleting doctor
- Prevents FK-related `500` deletion errors

### Queue Management (`/admin/queue`)
- Start queue for selected doctor
- End active queue
- Shows queue status per doctor

### Create Token (`/admin/create-token`)
- Select doctor
- Start queue if not active
- Create patient token (reception mode)

### Logout
- Admin logout button in `app/admin/layout.js`
- Calls `/api/auth/admin-logout` and clears cookie

## 6.3 Doctor Portal

### Login (`/doctor/login`)
- Login via `/api/auth/doctor-login`
- Validates doctor `userId/password` from DB
- Sets session cookie and local storage doctor profile

### Dashboard (`/doctor/dashboard`)
- Loads active queue for logged-in doctor
- Shows current patient
- Queue preview
- Actions:
  - `Call Next` (uses `/api/tokens-next`)
  - `Mark Done` (uses `/api/tokens` PATCH)

### Logout
- Clears cookie via `/api/auth/doctor-logout`
- Clears doctor local storage data

## 6.4 Patient Portal

### Login (`/patient/login`)
- Saves patient profile (`name`, `phone`)
- Calls `/api/auth/patient-login` to set session cookie

### Dashboard (`/patient/dashboard`)
- Lists available doctors
- Shows patient tokens
- Polls live queue status via `/api/queue-live`
- Notifications:
  - "one patient away" notice
  - "your turn now" notice

### Get Token (`/patient/get-token?doctorId=...`)
- Validates profile is saved
- Prevents duplicate active token per doctor (client-side)
- Creates token via `/api/tokens`
- Saves token history in local storage

### Logout
- Clears cookie via `/api/auth/patient-logout`
- Clears patient local storage data

---

## 7. API Endpoints Summary

### Auth
- `POST /api/auth/admin-login`
- `POST /api/auth/admin-logout`
- `POST /api/auth/doctor-login`
- `POST /api/auth/doctor-logout`
- `POST /api/auth/patient-login`
- `POST /api/auth/patient-logout`

### Doctors
- `GET /api/doctors`
- `POST /api/doctors`
- `PUT /api/doctors/:id`
- `DELETE /api/doctors/:id`

### Queues
- `POST /api/queues` (start queue)
- `GET /api/queues?doctorId=...` (active queue)
- `PATCH /api/queues/status` (`ACTIVE | PAUSED | CLOSED`)

### Tokens
- `POST /api/tokens` (create token)
- `GET /api/tokens?queueId=...`
- `PATCH /api/tokens` (update token status)
- `POST /api/tokens-next` (doctor calls next)

### Live Queue
- `GET /api/queue-live?queueId=...` (reads Redis cache)

### Health/Test
- `GET /api/test`

---

## 8. Environment Variables

Required in `.env`:

- `DATABASE_URL` (PostgreSQL connection)
- `ADMIN_USER_ID`
- `ADMIN_PASSWORD`

Notes:

- Redis host/port are currently hardcoded in `lib/redis.js` (`127.0.0.1:6379`)

---

## 9. Setup and Run

1. Install dependencies
```bash
npm install
```

2. Configure `.env`
```env
DATABASE_URL=...
ADMIN_USER_ID=...
ADMIN_PASSWORD=...
```

3. Run migrations
```bash
npx prisma migrate dev
```

4. Start app
```bash
npm run dev
```

5. Open:
- `http://localhost:3000`

---

## 10. Current Status

Implemented and currently working:

- Role-based portal UI
- Admin/Doctor/Patient login flows
- Protected routes for all three roles
- Doctor CRUD with safe deletion
- Queue start/end lifecycle
- Token generation and processing
- Live queue cache updates in Redis

Build status:

- `npm run build` passes successfully.

---

## 11. Known Limitations / Improvement Areas

- Doctor passwords are stored as plain text; should be hashed (e.g., bcrypt).
- Some user state still depends on `localStorage`; can be moved to fully server-side sessions.
- `app/layout.js` and `app/layout.jsx` both exist; keep only one root layout file.
- `middleware.js` works, but Next 16 suggests moving to `proxy` convention.
- Redis config should be env-driven for production deployment.
- No formal automated tests yet.
=======
# 🏥 Hospital Digital Queue Management System

## 📌 Project Overview

In many Tier-2 and Tier-3 cities, hospital outpatient departments still rely on physical queues, paper tokens, and manual calling of patients. This leads to overcrowding, long waiting times, and confusion for both patients and hospital staff.

This project is a lightweight digital queue management system built for individual hospitals to manage patient flow efficiently without expensive hardware or infrastructure.

The system allows hospitals to:

- Digitally issue tokens
- Manage live queues per doctor
- Reduce crowding at reception areas
- Give patients visibility into queue status

## ❓ Why This Project?

Problems with Current System

- Patients must stand in physical queues
- No visibility of waiting time
- Overcrowding at hospitals
- Manual token handling by reception
- Doctors call patients verbally, causing confusion

Challenges in Tier-2/3 Cities

- High patient volume
- Limited budget for digital infrastructure
- Low adoption of complex hospital software

## 💡 Our Solution

We provide a simple web-based platform that can be deployed separately for each hospital.

### Key Ideas

- One website per hospital
- Hospital manages its own doctors
- Reception handles token generation
- Patients can check live queue from home
- No QR scanners or expensive devices required

## ⚙️ How the System Works

1️⃣ Hospital Admin / Reception

- Logs into the dashboard
- Adds doctors
- Starts queue for a selected doctor
- Generates tokens for walk-in patients
- Views live queue status

2️⃣ Doctor

- Sees current token
- Calls next patient
- Marks patient as completed

3️⃣ Patient

- Gets token from reception or online
- Can check live queue status
- Arrives at hospital closer to their turn

## 🧭 Platform Flow

Hospital Admin
	↓
Adds Doctors
	↓
Starts Queue for Doctor
	↓
Reception Creates Tokens
	↓
Doctor Calls Next Patient
	↓
Patients Track Queue Live

## 📊 Dashboards Included

Dashboard	Purpose
Admin / Reception Dashboard	Manage doctors, queues, and tokens
Doctor Dashboard	Call and complete patients
Patient View	See live token number and waiting count

## 🛠️ Technology Stack

Frontend

Next.js (React-based full-stack framework)

Backend

Next.js API Routes

Database

PostgreSQL

ORM

Prisma

Caching

Redis (for fast queue updates)

DevOps

Docker

GitHub Actions (CI/CD)

AWS / Azure (Deployment)

## 🎯 Key Features

- Doctor-wise queue management
- Live token tracking
- Reception-based token generation
- Scalable and low-cost
- Mobile and desktop friendly
- Designed specifically for Tier-2/3 cities

## 🚀 Future Enhancements

- WhatsApp/SMS token reminders
- Estimated waiting time
- Multi-language support
- Analytics dashboard for hospitals
- Appointment pre-booking

## 🏁 Conclusion

This project focuses on practical impact over complexity.
It helps hospitals move from manual queues to digital queues using a simple, affordable, and scalable solution.

A small digital change that creates a big improvement in patient experience.
