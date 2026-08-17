# Campus Parking Management System

A full-stack campus parking platform built with Node.js, Express, MongoDB, and a responsive React frontend.

## Features

### User

- Register and login with JWT authentication
- View available parking slots by zone
- Reserve a slot for a selected duration
- View parking history and active permits
- Receive in-app expiry notifications for reservations ending within 30 minutes
- Receive email reminders before expiry and another email when a permit expires
- Generate QR permits for reservations

### Security Staff

- View all active reservations
- Verify permits using the permit code from a QR payload
- Update slot availability in real time
- Review live reservation details for gate checks

### Admin

- Create and manage parking zones
- Add parking slots under zones
- View usage statistics and zone-wise reservation counts
- Generate reservation reports

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer
- Frontend: React, modular ES modules, HTML, CSS
- Authentication: JWT + role-based middleware
- QR: `qrcode` package for permit generation
- Email alerts: `nodemailer` with SMTP configuration

## Project Structure

```text
CampusParking_system/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── src/
│       ├── App.js
│       ├── lib.js
│       ├── main.js
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── utils/
├── server/
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── adminController.js
│       │   ├── authController.js
│       │   ├── parkingController.js
│       │   └── qrController.js
│       ├── middleware/
│       │   └── auth.js
│       ├── models/
│       │   ├── ParkingSlot.js
│       │   ├── ParkingZone.js
│       │   ├── Reservation.js
│       │   └── User.js
│       ├── routes/
│       │   ├── adminRoutes.js
│       │   ├── authRoutes.js
│       │   └── parkingRoutes.js
│       ├── seeds/
│       │   └── seed.js
│       ├── utils/
│       │   ├── jwt.js
│       │   └── permit.js
│       └── index.js
├── .env.example
├── package.json
└── README.md
```

## Setup Instructions

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file and update values if needed:

   ```bash
   copy .env.example .env
   ```

3. Make sure MongoDB is running locally, or replace `MONGODB_URI` in `.env` with your MongoDB connection string.

4. Add SMTP settings in `.env` so email alerts can be delivered.

5. Seed the database with demo users, zones, and slots:

   ```bash
   npm run seed
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open the application:

   [http://localhost:5000](http://localhost:5000)

## Production Deployment

This project is ready to deploy on Render or similar Node.js platforms.

### Render Settings

- Build command: `npm install`
- Start command: `npm start`
- Entry point: `server/src/index.js`

### Required Environment Variables

- `MONGODB_URI`
- `SECRET_KEY`
- `PORT`

### Optional Environment Variables

- `CLIENT_URL`
- `NODE_ENV`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `EXPIRY_REMINDER_MINUTES`
- `ALERT_CHECK_INTERVAL_MS`

### Notes for Production

- The server binds to `0.0.0.0` and uses `process.env.PORT`.
- `SECRET_KEY` is the preferred JWT secret in production. `JWT_SECRET` is still supported as a fallback for compatibility.
- Static frontend assets are served directly by Express from `public/`.
- `render.yaml` is included for Render deployment.
- `.gitignore` is included so local secrets and dependencies are not pushed to GitHub.

## Demo Credentials

- User: `user@campus.com` / `password123`
- Security: `security@campus.com` / `password123`
- Admin: `admin@campus.com` / `password123`

## Main API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Parking

- `GET /api/parking/slots`
- `GET /api/parking/zones`
- `POST /api/parking/reserve`
- `GET /api/parking/my-reservations`
- `GET /api/parking/active-reservations`
- `POST /api/parking/verify-permit`
- `PATCH /api/parking/slots/:id/availability`
- `GET /api/parking/reservations/:id/qr`

### Admin

- `GET /api/admin/zones`
- `POST /api/admin/zones`
- `PATCH /api/admin/zones/:id`
- `POST /api/admin/slots`
- `GET /api/admin/statistics`
- `GET /api/admin/reports`

## Notes

- The frontend is served directly by Express from the `public/` directory.
- The frontend has been refactored into reusable React components and role-based dashboard modules.
- Role-based access is enforced in backend middleware.
- Expiry notifications are shown when a reservation is within 30 minutes of expiration.
- Reminder and expiry emails are sent by a background alert job using Nodemailer.
- Email timing is controlled by `EXPIRY_REMINDER_MINUTES` and `ALERT_CHECK_INTERVAL_MS`.
- QR verification uses the reservation permit code for gate validation workflows.
updated by Kiran
