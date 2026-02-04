# Authentication Setup Guide

This document describes the end-to-end authentication flow connecting the Mobile Client, Backend Server, and Admin Dashboard.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│  Backend API    │◀────│ Admin Dashboard │
│   (Expo/RN)     │     │  (Node.js)      │     │   (Next.js)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ├── OTP Auth           ├── JWT Tokens          ├── NextAuth
        ├── AsyncStorage       ├── Rate Limiting       ├── Session
        └── Navigation Guards  └── Protected Routes    └── Middleware
```

## Quick Start

### 1. Start the Backend Server

```bash
cd Server/backend
npm install
npm run dev
```

The server will start on `http://localhost:5000`

### 2. Start the Mobile App

```bash
cd Client
npm install

# Update .env with your local IP if testing on physical device
# For Android emulator: http://10.0.2.2:5000/api
# For iOS simulator: http://localhost:5000/api
# For physical device: http://YOUR_LOCAL_IP:5000/api

npm start
```

### 3. Start the Admin Dashboard

```bash
cd Server/dashboard
npm install
npm run dev
```

The dashboard will start on `http://localhost:3000`

## Authentication Flow

### Phase 1: OTP-Based Authentication (Test Mode)

1. **User enters phone number** on mobile app
2. **Client calls** `POST /api/auth/send-otp`
3. **Backend**:
   - Validates phone number (10-digit Indian mobile)
   - Generates 6-digit OTP
   - Stores OTP in database (10-minute expiry)
   - **Logs OTP to console** (for testing)
   - Returns success response
4. **User enters OTP** received (check backend console)
5. **Client calls** `POST /api/auth/verify-otp`
6. **Backend**:
   - Verifies OTP
   - Creates user if not exists
   - Returns JWT token (7-day expiry)
7. **Client stores token** in AsyncStorage

### Phase 2: Authentication Guardrails

The mobile app enforces authentication state:

- **Not authenticated**: Shows only auth screens (welcome, phone-input, otp-input)
- **Authenticated**: Shows main app screens, hides auth stack

Implementation:
- `AuthContext` manages global auth state
- Navigation guards in `_layout.tsx`
- Token persistence via AsyncStorage

### Phase 3: Protected API Access

- **Token stored** securely in AsyncStorage
- **Token sent** with every API request via `Authorization: Bearer <token>`
- **Backend validates** token on protected routes
- **Rejects** unauthenticated requests with 401

## API Endpoints

### Authentication

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/auth/send-otp` | POST | Public | Send OTP to mobile number |
| `/api/auth/verify-otp` | POST | Public | Verify OTP, get JWT token |
| `/api/auth/resend-otp` | POST | Public | Resend OTP |
| `/api/auth/verify-token` | GET | Protected | Verify JWT, get user info |

### User Profile

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/users/profile` | GET | Protected | Get current user profile |
| `/api/users/profile` | PUT | Protected | Update current user profile |

## Testing the Flow

### 1. Send OTP

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "9876543210"}'
```

**Check backend console for OTP!**

```
📱 SMS to 919876543210: Your OTP is 123456. Valid for 10 minutes.
```

### 2. Verify OTP

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "9876543210", "otp": "123456"}'
```

Response:
```json
{
  "status": "success",
  "authenticated": true,
  "data": {
    "user": { "id": "...", "name": "New User", "mobile_number": "919876543210" },
    "token": "eyJhbGc...",
    "token_type": "Bearer"
  }
}
```

### 3. Access Protected Route

```bash
curl http://localhost:5000/api/auth/verify-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## File Structure

### Client (Mobile App)

```
Client/src/
├── contexts/
│   └── AuthContext.tsx      # Auth state management & guards
├── services/
│   └── apiService.ts        # API client with token handling
├── utils/
│   └── auth.ts              # Auth helper functions
└── app/(auth)/
    ├── phone-input.tsx      # Phone number entry
    ├── otp-input.tsx        # OTP verification
    └── onboarding.tsx       # User profile setup
```

### Backend

```
Server/backend/src/
├── controllers/
│   ├── authController.js    # OTP send/verify logic
│   └── userController.js    # User CRUD + profile
├── middlewares/
│   ├── authMiddleware.js    # JWT verification
│   └── rateLimiter.js       # Rate limiting
├── models/
│   ├── OTP.js               # OTP database operations
│   └── User.js              # User database operations
└── routes/
    ├── authRoutes.js        # Auth endpoints
    └── userRoutes.js        # User endpoints
```

### Dashboard

```
Server/dashboard/src/
├── app/
│   ├── login/page.jsx       # Admin login
│   └── api/auth/[...nextauth]/route.js
├── lib/
│   └── api.js               # Backend API client
└── middleware.js            # Auth middleware
```

## Rate Limiting

| Action | Limit | Window |
|--------|-------|--------|
| Send OTP | 3 requests | 15 minutes |
| Verify OTP | 5 requests | 15 minutes |
| Per Number | 3 OTPs | 1 hour |
| Resend Cooldown | 1 request | 2 minutes |

## Security Features

1. **JWT tokens** with 7-day expiry
2. **Rate limiting** on all auth endpoints
3. **Phone number validation** (Indian mobile format)
4. **OTP expiry** (10 minutes)
5. **Token stored** in AsyncStorage (consider SecureStore for production)
6. **CORS** configured on backend

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://...
```

### Client (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### Dashboard (.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_SECRET=your-nextauth-secret
```

## Production Considerations

1. **Replace mock SMS** with MSG91 or similar provider
2. **Use SecureStore** instead of AsyncStorage for tokens
3. **Enable HTTPS** on all endpoints
4. **Set strong JWT_SECRET** 
5. **Configure proper CORS origins**
6. **Enable database SSL**
