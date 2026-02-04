# Tanak Prabha API Documentation

**Base URL:** `http://localhost:3000/api`  
**Version:** 1.0.0  
**Authentication:** Bearer Token (JWT)

---

## Table of Contents

- [Authentication APIs](#authentication-apis)
  - [Send OTP](#1-send-otp)
  - [Verify OTP](#2-verify-otp)
  - [Resend OTP](#3-resend-otp)
  - [Verify Token](#4-verify-token)
- [Response Structure](#response-structure)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

---

## Authentication APIs

### 1. Send OTP

Send a 6-digit OTP to the user's mobile number for authentication.

**Endpoint:** `POST /api/auth/send-otp`  
**Authentication:** Not required  
**Rate Limit:** 3 requests per 15 minutes per IP

#### Request Body

```json
{
  "mobile_number": "9876543210"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mobile_number` | String | Yes | 10-digit Indian mobile number (starting with 6-9) |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "data": {
    "mobile_number": "919876543210",
    "expires_in": "10 minutes",
    "otp": "123456"
  }
}
```

**Note:** The `otp` field is only included in **development mode** for testing purposes.

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | String | Status of the request ("success" or "error") |
| `message` | String | Human-readable message |
| `data.mobile_number` | String | Formatted mobile number with country code |
| `data.expires_in` | String | OTP validity duration |
| `data.otp` | String | OTP code (only in development) |

#### Error Responses

**400 Bad Request** - Invalid phone number

```json
{
  "status": "error",
  "message": "Invalid phone number. Please enter a valid 10-digit Indian mobile number."
}
```

**429 Too Many Requests** - Rate limit exceeded

```json
{
  "status": "error",
  "message": "Too many OTP requests. Please try again after 1 hour."
}
```

**500 Internal Server Error**

```json
{
  "status": "error",
  "message": "Failed to send OTP. Please try again."
}
```

#### Example cURL Request

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "9876543210"
  }'
```

---

### 2. Verify OTP

Verify the OTP sent to the user's mobile number and authenticate the user.

**Endpoint:** `POST /api/auth/verify-otp`  
**Authentication:** Not required  
**Rate Limit:** 5 requests per 15 minutes per IP

#### Request Body

```json
{
  "mobile_number": "9876543210",
  "otp": "123456"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mobile_number` | String | Yes | 10-digit Indian mobile number |
| `otp` | String | Yes | 6-digit OTP received via SMS |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Authentication successful",
  "authenticated": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Farmer Name",
      "mobile_number": "919876543210",
      "village": "Village Name",
      "district": "District Name"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer"
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | String | Status of the request |
| `message` | String | Human-readable message |
| `authenticated` | Boolean | Whether authentication was successful |
| `data.user` | Object | User information |
| `data.user.id` | UUID | Unique user identifier |
| `data.user.name` | String | User's name |
| `data.user.mobile_number` | String | User's mobile number |
| `data.user.village` | String | User's village |
| `data.user.district` | String | User's district |
| `data.token` | String | JWT authentication token |
| `data.token_type` | String | Type of token (always "Bearer") |

#### Error Responses

**400 Bad Request** - Missing required fields

```json
{
  "status": "error",
  "message": "Mobile number and OTP are required"
}
```

**401 Unauthorized** - Invalid OTP

```json
{
  "status": "error",
  "message": "Invalid OTP",
  "authenticated": false
}
```

**401 Unauthorized** - Expired OTP

```json
{
  "status": "error",
  "message": "OTP has expired",
  "authenticated": false
}
```

**401 Unauthorized** - OTP already used

```json
{
  "status": "error",
  "message": "OTP already used",
  "authenticated": false
}
```

**429 Too Many Requests**

```json
{
  "status": "error",
  "message": "Too many verification attempts from this IP. Please try again after 15 minutes.",
  "retryAfter": "15 minutes"
}
```

**500 Internal Server Error**

```json
{
  "status": "error",
  "message": "Failed to verify OTP. Please try again.",
  "authenticated": false
}
```

#### Example cURL Request

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "9876543210",
    "otp": "123456"
  }'
```

#### Using the Token

After successful verification, use the returned token in subsequent API calls:

```bash
curl -X GET http://localhost:3000/api/protected-route \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Resend OTP

Resend OTP to the user's mobile number if the previous one expired or wasn't received.

**Endpoint:** `POST /api/auth/resend-otp`  
**Authentication:** Not required  
**Rate Limit:** 3 requests per 15 minutes per IP

#### Request Body

```json
{
  "mobile_number": "9876543210"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mobile_number` | String | Yes | 10-digit Indian mobile number |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "OTP resent successfully",
  "data": {
    "mobile_number": "919876543210",
    "expires_in": "10 minutes",
    "otp": "654321"
  }
}
```

**Note:** The `otp` field is only included in **development mode**.

#### Error Responses

**400 Bad Request** - Invalid phone number

```json
{
  "status": "error",
  "message": "Invalid phone number"
}
```

**429 Too Many Requests** - Minimum time not elapsed

```json
{
  "status": "error",
  "message": "Please wait 90 seconds before requesting a new OTP"
}
```

**429 Too Many Requests** - Rate limit exceeded

```json
{
  "status": "error",
  "message": "Too many OTP requests. Please try again after 1 hour."
}
```

**500 Internal Server Error**

```json
{
  "status": "error",
  "message": "Failed to resend OTP"
}
```

#### Example cURL Request

```bash
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_number": "9876543210"
  }'
```

---

### 4. Verify Token

Verify if the JWT token is valid and get current user information.

**Endpoint:** `GET /api/auth/verify-token`  
**Authentication:** Required (Bearer Token)  
**Rate Limit:** None

#### Request Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Token is valid",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Farmer Name",
      "mobile_number": "919876543210",
      "village": "Village Name",
      "district": "District Name"
    }
  }
}
```

#### Error Responses

**401 Unauthorized** - No token provided

```json
{
  "status": "error",
  "message": "Access denied. No token provided."
}
```

**401 Unauthorized** - Token expired

```json
{
  "status": "error",
  "message": "Token has expired. Please login again."
}
```

**401 Unauthorized** - Invalid token

```json
{
  "status": "error",
  "message": "Invalid token. Please login again."
}
```

**404 Not Found** - User not found

```json
{
  "status": "error",
  "message": "User not found"
}
```

**500 Internal Server Error**

```json
{
  "status": "error",
  "message": "Failed to verify token"
}
```

#### Example cURL Request

```bash
curl -X GET http://localhost:3000/api/auth/verify-token \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Response Structure

All API responses follow a consistent structure:

### Success Response

```json
{
  "status": "success",
  "message": "Human-readable success message",
  "data": {
    // Response payload
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "errors": [
    // Optional: Array of validation errors
  ],
  "error": "Detailed error (only in development mode)"
}
```

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| `200` | Success |
| `400` | Bad Request - Invalid input data |
| `401` | Unauthorized - Authentication failed |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server-side error |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

### Authentication Endpoints

| Endpoint | Rate Limit |
|----------|-----------|
| `/api/auth/send-otp` | 3 requests per 15 minutes per IP |
| `/api/auth/resend-otp` | 3 requests per 15 minutes per IP |
| `/api/auth/verify-otp` | 5 requests per 15 minutes per IP |

### Per-Phone Number Limits

- Maximum 3 OTP requests per hour per phone number
- Minimum 2 minutes between resend requests

### Rate Limit Headers

When rate limit is active, the following headers are included:

```
RateLimit-Limit: 3
RateLimit-Remaining: 2
RateLimit-Reset: 1609459200
```

---

## Authentication Flow

### Complete Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    participant SMS

    Client->>API: POST /api/auth/send-otp
    API->>Database: Create OTP record
    API->>SMS: Send OTP (mock in dev)
    API-->>Client: OTP sent (with OTP in dev)
    
    Client->>API: POST /api/auth/verify-otp
    API->>Database: Verify OTP
    API->>Database: Get/Create user
    API-->>Client: Token + User info
    
    Client->>API: GET /api/protected-route
    Note over Client,API: Include: Authorization: Bearer {token}
    API->>API: Verify JWT
    API-->>Client: Protected resource
```

### Step-by-Step Guide

1. **Send OTP**
   - Client sends mobile number
   - Server generates 6-digit OTP
   - OTP is stored with 10-minute expiry
   - SMS is sent (mocked in development)

2. **Verify OTP**
   - Client sends mobile number + OTP
   - Server validates OTP
   - If user doesn't exist, creates new user
   - Returns JWT token valid for 7 days

3. **Use Token**
   - Include token in Authorization header
   - Format: `Bearer {token}`
   - Token automatically validated on protected routes

---

## Testing Guide

### Development Mode Features

In development mode (`NODE_ENV=development`):
- OTP is returned in API response for easy testing
- Detailed error messages with stack traces
- SMS sending is mocked (logged to console)

### Testing OTP Flow

```javascript
// 1. Send OTP
const sendResponse = await fetch('http://localhost:3000/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mobile_number: '9876543210' })
});
const { data: { otp } } = await sendResponse.json();

// 2. Verify OTP
const verifyResponse = await fetch('http://localhost:3000/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mobile_number: '9876543210',
    otp: otp
  })
});
const { data: { token } } = await verifyResponse.json();

// 3. Use token for authenticated requests
const protectedResponse = await fetch('http://localhost:3000/api/auth/verify-token', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Production Considerations

### MSG91 Integration

To enable real SMS sending in production:

1. **Get MSG91 Credentials**
   - Sign up at [msg91.com](https://msg91.com)
   - Get Auth Key and Template ID

2. **Update Environment Variables**
   ```env
   MSG91_AUTH_KEY=your-auth-key
   MSG91_TEMPLATE_ID=your-template-id
   NODE_ENV=production
   ```

3. **Uncomment MSG91 Code**
   - Edit `src/utils/otp.js`
   - Uncomment the MSG91 API integration
   - Install axios: `npm install axios`

### Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use strong `JWT_SECRET` in production
   - Rotate secrets regularly

2. **HTTPS Only**
   - Use HTTPS in production
   - Update CORS settings for your domain

3. **Rate Limiting**
   - Adjust rate limits based on usage patterns
   - Monitor for abuse

4. **OTP Security**
   - OTPs expire after 10 minutes
   - Used OTPs are marked and cannot be reused
   - Maximum 3 OTP attempts per phone per hour

---

## Support

For issues or questions:
- **Author:** Pratyush Tiwari
- **GitHub:** [Repository Link]
- **Email:** [Contact Email]

---

**Last Updated:** February 3, 2026  
**API Version:** 1.0.0
