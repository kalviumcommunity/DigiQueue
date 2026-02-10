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
