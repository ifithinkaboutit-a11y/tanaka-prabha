# Tanak Prabha Backend Server

Backend API server for the Tanak Prabha agricultural application. Built with Node.js, Express, and PostgreSQL with PostGIS support.

## Features

- ✅ User (Farmer) Management with geospatial data
- ✅ Land Details Management
- ✅ Livestock Details Management
- ✅ Government Schemes & Training Programs (CMS)
- ✅ Home Screen Banners
- ✅ Notifications System
- ✅ Professional Profiles (Doctors, Experts)
- ✅ Connection History Tracking
- ✅ PostGIS for location-based features and heatmaps

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL with PostGIS extension
- **Authentication:** (To be implemented)

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── models/
│   │   ├── User.js            # Farmer model
│   │   ├── LandDetails.js     # Land details model
│   │   ├── LivestockDetails.js # Livestock model
│   │   ├── Scheme.js          # Schemes model
│   │   ├── Banner.js          # Banners model
│   │   ├── Notification.js    # Notifications model
│   │   ├── Professional.js    # Professionals model
│   │   └── Connection.js      # Connections model
│   ├── controllers/           # Route controllers (to be created)
│   ├── routes/                # API routes (to be created)
│   ├── middlewares/           # Custom middleware (to be created)
│   ├── utils/                 # Utility functions (to be created)
│   ├── validators/            # Input validation (to be created)
│   ├── app.js                 # Express app configuration
│   └── server.js              # Server entry point
├── schema.sql                 # Database schema
├── package.json
└── .env.example
```

## Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13 with PostGIS extension
- npm >= 9.0.0

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Database**
   - Create a PostgreSQL database
   - Run the schema.sql file to create tables and extensions:
   ```bash
   psql -U postgres -d tanak_prabha -f schema.sql
   ```

4. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings:
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` and update:
     - `DB_HOST`
     - `DB_PORT`
     - `DB_NAME`
     - `DB_USER`
     - `DB_PASSWORD`

5. **Run the server**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

6. **Verify the server is running**
   - Open browser and visit: `http://localhost:3000/health`
   - You should see a success message

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Available Endpoints (Planned)

- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

- `GET /api/schemes` - Get all schemes
- `POST /api/schemes` - Create scheme
- `GET /api/schemes/:id` - Get scheme by ID

- `GET /api/banners` - Get all active banners
- `POST /api/banners` - Create banner

- `GET /api/professionals` - Get professionals
- `GET /api/professionals/category/:category` - Get by category

- `GET /api/notifications/:userId` - Get user notifications
- `POST /api/notifications` - Create notification

- `GET /api/analytics/heatmap` - Get heatmap data

## Models Overview

### User (Farmer)
Complete farmer profile with demographics, family details, address, and geospatial location for heatmaps.

### LandDetails
Agricultural land information including total area and crops by season (Rabi, Kharif, Zaid).

### LivestockDetails
Livestock inventory (cows, buffaloes, goats, sheep, pigs, poultry, etc.).

### Scheme
Government schemes and training programs with rich content (images, objectives, application process).

### Banner
Home screen banners for promotions and announcements.

### Notification
Push notifications for farmers (approvals, reminders, alerts).

### Professional
Profiles of agricultural experts, veterinarians, and advisors.

### Connection
History of farmer interactions with professionals (calls, chats, appointments).

## Development

### Next Steps

1. Create route handlers in `src/routes/`
2. Create controllers in `src/controllers/`
3. Add input validation middleware
4. Implement authentication & authorization
5. Add comprehensive API documentation
6. Create unit and integration tests

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 3000 |
| `HOST` | Server host | 0.0.0.0 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | tanak_prabha |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `CORS_ORIGIN` | CORS allowed origins | * |

## License

ISC

## Author

Pratyush Tiwari

---

For questions or support, please contact the development team.
