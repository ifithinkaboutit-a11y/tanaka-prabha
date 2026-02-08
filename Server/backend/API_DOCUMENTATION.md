# Tanak Prabha API Documentation

**Base URL:** `http://localhost:5000/api`  
**Version:** 1.0.0  
**Authentication:** Bearer Token (JWT)

---

## Table of Contents

- [Authentication APIs](#authentication-apis)
  - [Send OTP](#1-send-otp)
  - [Verify OTP](#2-verify-otp)
  - [Resend OTP](#3-resend-otp)
  - [Verify Token](#4-verify-token)
- [Appointments APIs](#appointments-apis)
  - [Get My Appointments](#1-get-my-appointments)
  - [Get Professional Appointments](#2-get-professional-appointments)
  - [Create Appointment](#3-create-appointment)
  - [Cancel Appointment](#4-cancel-appointment)
  - [Get Available Slots](#5-get-available-slots)
- [Upload APIs (Cloudinary)](#upload-apis-cloudinary)
  - [Upload Banner Image](#1-upload-banner-image)
  - [Upload Scheme Image](#2-upload-scheme-image)
  - [Upload Scheme Hero Image](#3-upload-scheme-hero-image)
  - [Upload Professional Image](#4-upload-professional-image)
  - [Upload User Photo](#5-upload-user-photo)
  - [Delete Image](#6-delete-image)
  - [Upload From URL](#7-upload-from-url)
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
curl -X GET http://localhost:5000/api/auth/verify-token \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Appointments APIs

### 1. Get My Appointments

Get all appointments for the currently authenticated user.

**Endpoint:** `GET /api/appointments/my`  
**Authentication:** Required (Bearer Token)

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | Integer | No | Maximum results (default: 50) |
| `offset` | Integer | No | Pagination offset (default: 0) |
| `status` | String | No | Filter by status (pending/confirmed/cancelled/completed) |
| `upcoming_only` | Boolean | No | Only show upcoming appointments |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Appointments retrieved successfully",
  "data": {
    "appointments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "user-uuid",
        "professional_id": "professional-uuid",
        "appointment_date": "2026-02-15",
        "appointment_time": "10:00 AM",
        "status": "pending",
        "created_at": "2026-02-08T10:30:00Z",
        "professional_name": "Dr. Sharma",
        "professional_role": "Animal Doctor",
        "professional_image": "https://..."
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "count": 1
    }
  }
}
```

---

### 2. Get Professional Appointments

Get all appointments for a specific professional.

**Endpoint:** `GET /api/appointments/professional/:professional_id`  
**Authentication:** Required (Bearer Token)

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `professional_id` | UUID | Yes | Professional's ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | Integer | No | Maximum results (default: 50) |
| `offset` | Integer | No | Pagination offset (default: 0) |
| `date` | Date | No | Filter by specific date (YYYY-MM-DD) |
| `status` | String | No | Filter by status |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Appointments retrieved successfully",
  "data": {
    "appointments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "user-uuid",
        "professional_id": "professional-uuid",
        "appointment_date": "2026-02-15",
        "appointment_time": "10:00 AM",
        "status": "pending",
        "user_name": "Farmer Name",
        "user_mobile": "919876543210"
      }
    ]
  }
}
```

---

### 3. Create Appointment

Book a new appointment with a professional.

**Endpoint:** `POST /api/appointments`  
**Authentication:** Required (Bearer Token)

#### Request Body

```json
{
  "professionalId": "professional-uuid",
  "date": "2026-02-15",
  "time": "10:00 AM",
  "notes": "Optional notes about the appointment"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `professionalId` | UUID | Yes | Professional's ID |
| `date` | String | Yes | Appointment date (YYYY-MM-DD) |
| `time` | String | Yes | Time slot (e.g., "10:00 AM") |
| `notes` | String | No | Optional notes |

#### Available Time Slots

- "09:00 AM"
- "10:00 AM"
- "11:00 AM"
- "02:00 PM"
- "03:00 PM"
- "04:00 PM"

#### Success Response (201 Created)

```json
{
  "status": "success",
  "message": "Appointment created successfully",
  "data": {
    "appointment": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user-uuid",
      "professional_id": "professional-uuid",
      "appointment_date": "2026-02-15",
      "appointment_time": "10:00 AM",
      "status": "pending",
      "created_at": "2026-02-08T10:30:00Z"
    }
  }
}
```

#### Error Responses

**400 Bad Request** - Date fully booked

```json
{
  "status": "error",
  "message": "This professional has reached the maximum appointments for 2026-02-15 (3 per day)"
}
```

**400 Bad Request** - Time slot taken

```json
{
  "status": "error",
  "message": "The time slot 10:00 AM on 2026-02-15 is already booked"
}
```

**404 Not Found** - Professional not found

```json
{
  "status": "error",
  "message": "Professional not found"
}
```

---

### 4. Cancel Appointment

Cancel an existing appointment.

**Endpoint:** `PATCH /api/appointments/:id/cancel`  
**Authentication:** Required (Bearer Token)

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | Appointment ID |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Appointment cancelled successfully",
  "data": {
    "appointment": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "cancelled"
    }
  }
}
```

#### Error Responses

**403 Forbidden** - Not owner

```json
{
  "status": "error",
  "message": "You can only cancel your own appointments"
}
```

**400 Bad Request** - Already cancelled

```json
{
  "status": "error",
  "message": "Appointment is already cancelled"
}
```

---

### 5. Get Available Slots

Get available time slots for a professional on a specific date.

**Endpoint:** `GET /api/appointments/professional/:professional_id/slots/:date`  
**Authentication:** Required (Bearer Token)

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `professional_id` | UUID | Yes | Professional's ID |
| `date` | Date | Yes | Date to check (YYYY-MM-DD) |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Available slots retrieved successfully",
  "data": {
    "date": "2026-02-15",
    "professional_id": "professional-uuid",
    "professional_name": "Dr. Sharma",
    "available_slots": ["09:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    "total_slots": ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    "booked_count": 1,
    "max_per_day": 3,
    "is_fully_booked": false
  }
}
```

---

## Upload APIs (Cloudinary)

All upload endpoints store images on Cloudinary with automatic optimization and transformation. Images are automatically resized and converted to optimal formats.

### Prerequisites

Add these environment variables to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 1. Upload Banner Image

Upload a banner image for the home screen carousel.

**Endpoint:** `POST /api/upload/banner`  
**Authentication:** Required (Bearer Token)  
**Content-Type:** `multipart/form-data`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Image file (JPEG, PNG, WebP, GIF). Max 10MB |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Banner image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234/tanak-prabha/banners/abc123.jpg",
    "public_id": "tanak-prabha/banners/abc123",
    "format": "jpg",
    "width": 1200,
    "height": 600
  }
}
```

#### Image Transformations Applied

- Resized to: 1200x600 pixels
- Crop mode: `fill` with auto gravity
- Quality: `auto:best`
- Format: auto-optimized

#### Example cURL Request

```bash
curl -X POST http://localhost:5000/api/upload/banner \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/banner.jpg"
```

---

### 2. Upload Scheme Image

Upload a thumbnail image for a government scheme.

**Endpoint:** `POST /api/upload/scheme`  
**Authentication:** Required (Bearer Token)  
**Content-Type:** `multipart/form-data`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Image file (JPEG, PNG, WebP, GIF). Max 5MB |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Scheme image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234/tanak-prabha/schemes/abc123.jpg",
    "public_id": "tanak-prabha/schemes/abc123",
    "format": "jpg",
    "width": 800,
    "height": 400
  }
}
```

#### Image Transformations Applied

- Resized to: 800x400 pixels
- Crop mode: `fill` with auto gravity
- Quality: `auto:good`
- Format: auto-optimized

---

### 3. Upload Scheme Hero Image

Upload a large hero/banner image for scheme detail pages.

**Endpoint:** `POST /api/upload/scheme-hero`  
**Authentication:** Required (Bearer Token)  
**Content-Type:** `multipart/form-data`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Image file (JPEG, PNG, WebP, GIF). Max 10MB |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Scheme hero image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234/tanak-prabha/schemes/hero/abc123.jpg",
    "public_id": "tanak-prabha/schemes/hero/abc123",
    "format": "jpg",
    "width": 1600,
    "height": 800
  }
}
```

#### Image Transformations Applied

- Resized to: 1600x800 pixels
- Crop mode: `fill` with auto gravity
- Quality: `auto:best`
- Format: auto-optimized

---

### 4. Upload Professional Image

Upload a profile image for a professional (doctor, expert, etc.).

**Endpoint:** `POST /api/upload/professional`  
**Authentication:** Required (Bearer Token)  
**Content-Type:** `multipart/form-data`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Image file (JPEG, PNG, WebP). Max 5MB |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Professional image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234/tanak-prabha/professionals/abc123.jpg",
    "public_id": "tanak-prabha/professionals/abc123",
    "format": "jpg",
    "width": 400,
    "height": 400
  }
}
```

#### Image Transformations Applied

- Resized to: 400x400 pixels
- Crop mode: `fill` with face detection
- Quality: `auto:good`
- Format: auto-optimized

---

### 5. Upload User Photo

Upload a profile photo for a user/farmer.

**Endpoint:** `POST /api/upload/user-photo`  
**Authentication:** Required (Bearer Token)  
**Content-Type:** `multipart/form-data`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `photo` | File | Yes | Image file (JPEG, PNG, WebP). Max 5MB |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "User photo uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234/tanak-prabha/users/abc123.jpg",
    "public_id": "tanak-prabha/users/abc123",
    "format": "jpg",
    "width": 300,
    "height": 300
  }
}
```

#### Image Transformations Applied

- Resized to: 300x300 pixels
- Crop mode: `fill` with face detection
- Quality: `auto:good`
- Format: auto-optimized

---

### 6. Delete Image

Delete an image from Cloudinary storage.

**Endpoint:** `DELETE /api/upload/delete`  
**Authentication:** Required (Bearer Token)  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234/tanak-prabha/banners/abc123.jpg"
}
```

OR

```json
{
  "public_id": "tanak-prabha/banners/abc123"
}
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Image deleted successfully",
  "data": {
    "result": "ok"
  }
}
```

---

### 7. Upload From URL

Upload an image to Cloudinary from an external URL.

**Endpoint:** `POST /api/upload/from-url`  
**Authentication:** Required (Bearer Token)  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "url": "https://example.com/image.jpg",
  "type": "banner"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | String | Yes | External image URL |
| `type` | String | No | Image type: `banner`, `scheme`, `scheme-hero`, `professional`, `user` |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Image uploaded from URL successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234/tanak-prabha/banners/abc123.jpg",
    "public_id": "tanak-prabha/banners/abc123",
    "format": "jpg",
    "width": 1200,
    "height": 600
  }
}
```

---

### Upload Error Responses

**400 Bad Request** - No file provided

```json
{
  "status": "error",
  "message": "No image file provided"
}
```

**400 Bad Request** - Invalid file type

```json
{
  "status": "error",
  "message": "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."
}
```

**400 Bad Request** - File too large

```json
{
  "status": "error",
  "message": "File is too large. Maximum size allowed is 10MB."
}
```

**401 Unauthorized** - Missing or invalid token

```json
{
  "status": "error",
  "message": "Access denied. No token provided."
}
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
