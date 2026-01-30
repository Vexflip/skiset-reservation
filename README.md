# Skiset Reservation System

A simple, premium-feel ski equipment reservation website built with Next.js, Prisma, and SQLite.

## Features

- **Public Booking Flow**: Select equipment, enter dates, and confirm reservation.
- **Admin Panel**: Secure dashboard to view and manage reservations.
- **Email Notifications**: Automated confirmation emails (mocked via Nodemailer/Ethereal if not configured).
- **Responsive Design**: Mobile-friendly, clean UI.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite (via Prisma ORM)
- **Styling**: Tailwind CSS
- **Auth**: JWT (Admin)
- **Email**: Nodemailer

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Initialize the database and run migrations:

```bash
npx prisma migrate dev --name init
```

### 3. Seed Database

Create the initial admin user:

```bash
npx tsx prisma/seed.ts
```

**Default Admin Credentials:**
- Email: `admin@skiset.com`
- Password: `password123`

### 4. Run Locally

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public booking site.
Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin panel.

## Project Structure

- `app/(public)`: Public booking pages.
- `app/admin`: Admin dashboard and login.
- `app/api`: Backend API routes.
- `lib`: Utilities for Prisma, Auth, and Email.
- `prisma`: Database schema and seed script.

## Notes

- Emails are sent using Ethereal (mock SMTP) by default if env vars are missing. Check console logs for "Message sent" or configure `.env` with real SMTP details.
- To use PostgreSQL, update `prisma/schema.prisma` provider and `DATABASE_URL` in `.env`.
