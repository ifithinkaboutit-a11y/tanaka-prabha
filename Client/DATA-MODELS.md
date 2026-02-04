# Data Models Documentation

This document provides comprehensive documentation of all data structures and models used in the Tanak Prabha application. Each model is presented in both JSON format and table format for easy reference.

---

## Table of Contents

1. [User & Authentication Models](#user--authentication-models)
   - [User Profile](#user-profile)
   - [Personal Details](#personal-details)
   - [Land Details](#land-details)
   - [Livestock Details](#livestock-details)
   - [Language Option](#language-option)
   - [Auth State](#auth-state)
   - [OTP Input State](#otp-input-state)

2. [Scheme & Program Models](#scheme--program-models)
   - [Scheme](#scheme)
   - [Scheme Category](#scheme-category)
   - [Training Program](#training-program)

3. [Content Models](#content-models)
   - [Banner](#banner)
   - [Quick Action](#quick-action)
   - [Notification](#notification)

4. [Connect Services Models](#connect-services-models)
   - [Connect Service](#connect-service)
   - [Professional](#professional)
   - [Recent Connection](#recent-connection)

5. [Form Models](#form-models)
   - [Select Option](#select-option)

---

## User & Authentication Models

### User Profile

Complete user profile data structure containing all personal, address, land, and livestock information.

**JSON Structure:**

```json
{
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "photo": "",
  "mobileNumber": "9876543210",
  "aadhaarNumber": "123456789012",
  "fathersName": "Ram Singh",
  "mothersName": "Sita Devi",
  "educationalQualification": "10th Pass",
  "geoLocation": "28.6139° N, 77.2090° E",
  "sonsMarried": 1,
  "sonsUnmarried": 2,
  "daughtersMarried": 1,
  "daughtersUnmarried": 1,
  "otherFamilyMembers": 0,
  "village": "Test Village",
  "gramPanchayat": "Test GP",
  "nyayPanchayat": "Test NP",
  "postOffice": "Test PO",
  "tehsil": "Test Tehsil",
  "block": "Test Block",
  "district": "Test District",
  "pinCode": "123456",
  "state": "Uttar Pradesh",
  "totalLandArea": 5.5,
  "rabiCrop": "Wheat",
  "kharifCrop": "Rice",
  "zaidCrop": "Moong",
  "cows": 2,
  "buffaloes": 1,
  "goats": 3,
  "sheep": 0,
  "pigs": 0,
  "poultry": 10
}
```

**Table Format:**

| Field                    | Type   | Description                    | Required |
| ------------------------ | ------ | ------------------------------ | -------- |
| name                     | string | User's full name               | Yes      |
| age                      | number | User's age                     | Yes      |
| gender                   | string | User's gender                  | Yes      |
| photo                    | string | URL to user's photo            | No       |
| mobileNumber             | string | 10-digit mobile number         | Yes      |
| aadhaarNumber            | string | 12-digit Aadhaar number        | Yes      |
| fathersName              | string | Father's name                  | Yes      |
| mothersName              | string | Mother's name                  | Yes      |
| educationalQualification | string | Educational qualification      | Yes      |
| geoLocation              | string | GPS coordinates                | No       |
| sonsMarried              | number | Number of married sons         | Yes      |
| sonsUnmarried            | number | Number of unmarried sons       | Yes      |
| daughtersMarried         | number | Number of married daughters    | Yes      |
| daughtersUnmarried       | number | Number of unmarried daughters  | Yes      |
| otherFamilyMembers       | number | Number of other family members | Yes      |
| village                  | string | Village name                   | Yes      |
| gramPanchayat            | string | Gram Panchayat name            | Yes      |
| nyayPanchayat            | string | Nyay Panchayat name            | Yes      |
| postOffice               | string | Post office name               | Yes      |
| tehsil                   | string | Tehsil name                    | Yes      |
| block                    | string | Block name                     | Yes      |
| district                 | string | District name                  | Yes      |
| pinCode                  | string | 6-digit PIN code               | Yes      |
| state                    | string | State name                     | Yes      |
| totalLandArea            | number | Total land area in acres/bigha | Yes      |
| rabiCrop                 | string | Rabi season crop               | Yes      |
| kharifCrop               | string | Kharif season crop             | Yes      |
| zaidCrop                 | string | Zaid season crop               | Yes      |
| cows                     | number | Number of cows                 | Yes      |
| buffaloes                | number | Number of buffaloes            | Yes      |
| goats                    | number | Number of goats                | Yes      |
| sheep                    | number | Number of sheep                | Yes      |
| pigs                     | number | Number of pigs                 | Yes      |
| poultry                  | number | Number of poultry birds        | Yes      |

---

### Personal Details

Subset of user profile containing personal and family information.

**JSON Structure:**

```json
{
  "fathersName": "Ram Singh",
  "mothersName": "Sita Devi",
  "educationalQualification": "10th Pass",
  "sonsMarried": 1,
  "sonsUnmarried": 2,
  "daughtersMarried": 1,
  "daughtersUnmarried": 1,
  "otherFamilyMembers": 0,
  "village": "Test Village",
  "gramPanchayat": "Test GP",
  "nyayPanchayat": "Test NP",
  "postOffice": "Test PO",
  "tehsil": "Test Tehsil",
  "block": "Test Block",
  "district": "Test District",
  "pinCode": "123456",
  "state": "Uttar Pradesh"
}
```

**Table Format:**

| Field                    | Type   | Description                    | Required |
| ------------------------ | ------ | ------------------------------ | -------- |
| fathersName              | string | Father's name                  | Yes      |
| mothersName              | string | Mother's name                  | Yes      |
| educationalQualification | string | Educational qualification      | Yes      |
| sonsMarried              | number | Number of married sons         | Yes      |
| sonsUnmarried            | number | Number of unmarried sons       | Yes      |
| daughtersMarried         | number | Number of married daughters    | Yes      |
| daughtersUnmarried       | number | Number of unmarried daughters  | Yes      |
| otherFamilyMembers       | number | Number of other family members | Yes      |
| village                  | string | Village name                   | Yes      |
| gramPanchayat            | string | Gram Panchayat name            | Yes      |
| nyayPanchayat            | string | Nyay Panchayat name            | Yes      |
| postOffice               | string | Post office name               | Yes      |
| tehsil                   | string | Tehsil name                    | Yes      |
| block                    | string | Block name                     | Yes      |
| district                 | string | District name                  | Yes      |
| pinCode                  | string | 6-digit PIN code               | Yes      |
| state                    | string | State name                     | Yes      |

---

### Land Details

Agricultural land information for the user.

**JSON Structure:**

```json
{
  "totalLandArea": 5.5,
  "rabiCrop": "Wheat",
  "kharifCrop": "Rice",
  "zaidCrop": "Moong"
}
```

**Table Format:**

| Field         | Type   | Description                            | Required |
| ------------- | ------ | -------------------------------------- | -------- |
| totalLandArea | number | Total land area in acres/bigha/hectare | Yes      |
| rabiCrop      | string | Crop grown in Rabi season (winter)     | Yes      |
| kharifCrop    | string | Crop grown in Kharif season (monsoon)  | Yes      |
| zaidCrop      | string | Crop grown in Zaid season (summer)     | Yes      |

---

### Livestock Details

Livestock inventory for the user.

**JSON Structure:**

```json
{
  "cow": 2,
  "buffalo": 1,
  "sheep": 0,
  "goat": 3,
  "hen": 10,
  "others": 0
}
```

**Table Format:**

| Field   | Type   | Description               | Required |
| ------- | ------ | ------------------------- | -------- |
| cow     | number | Number of cows            | Yes      |
| buffalo | number | Number of buffaloes       | Yes      |
| sheep   | number | Number of sheep           | Yes      |
| goat    | number | Number of goats           | Yes      |
| hen     | number | Number of poultry/hens    | Yes      |
| others  | number | Number of other livestock | Yes      |

---

### Language Option

Language selection options for the application.

**JSON Structure:**

```json
{
  "code": "hi",
  "label": "Hindi",
  "nativeLabel": "हिंदी",
  "symbol": "अ"
}
```

**Table Format:**

| Field       | Type   | Description                          | Required |
| ----------- | ------ | ------------------------------------ | -------- |
| code        | string | ISO language code (e.g., "hi", "en") | Yes      |
| label       | string | Language name in English             | Yes      |
| nativeLabel | string | Language name in native script       | Yes      |
| symbol      | string | Language symbol/character            | Yes      |

**Available Languages:**

- Hindi (hi): हिंदी - अ
- English (en): English - A

---

### Auth State

Authentication state management structure.

**JSON Structure:**

```json
{
  "phoneNumber": "+919876543210",
  "verificationId": "abc123xyz",
  "isLoading": false,
  "error": null
}
```

**Table Format:**

| Field          | Type           | Description                           | Required |
| -------------- | -------------- | ------------------------------------- | -------- |
| phoneNumber    | string         | User's phone number with country code | Yes      |
| verificationId | string \| null | OTP verification ID from backend      | No       |
| isLoading      | boolean        | Loading state indicator               | Yes      |
| error          | string \| null | Error message if any                  | No       |

---

### OTP Input State

OTP input form state management.

**JSON Structure:**

```json
{
  "otp": ["1", "2", "3", "4", "5", "6"],
  "activeIndex": 0,
  "isVerifying": false,
  "countdown": 60,
  "canResend": false
}
```

**Table Format:**

| Field       | Type     | Description                          | Required |
| ----------- | -------- | ------------------------------------ | -------- |
| otp         | string[] | Array of 6 OTP digits                | Yes      |
| activeIndex | number   | Currently active input index (0-5)   | Yes      |
| isVerifying | boolean  | Verification in progress indicator   | Yes      |
| countdown   | number   | Countdown timer for resend (seconds) | Yes      |
| canResend   | boolean  | Whether OTP can be resent            | Yes      |

---

## Scheme & Program Models

### Scheme

Government scheme or training program structure.

**JSON Structure:**

```json
{
  "id": "1",
  "title": "PM-KISAN Samman Nidhi",
  "description": "Direct income support scheme providing ₹6,000 per year to farmer families",
  "category": "Financial Support",
  "imageUrl": "https://via.placeholder.com/400x200",
  "location": "Barabanki Krishi Kendra, Uttar Pradesh",
  "date": "15 November 2025",
  "heroImageUrl": "https://via.placeholder.com/800x400",
  "keyObjectives": [
    "Provide direct income support to farmer families",
    "Supplement financial needs for procuring inputs",
    "Stabilize farmer incomes and reduce distress"
  ],
  "overview": "PM-KISAN is a Central Sector scheme launched on 24th February 2019...",
  "process": "Farmers can apply through the PM-KISAN portal or through their respective State Governments...",
  "support": "For support, contact your nearest Krishi Kendra or call the PM-KISAN helpline at 155261...",
  "applyUrl": "https://pmkisan.gov.in/"
}
```

**Table Format:**

| Field         | Type     | Description                                 | Required |
| ------------- | -------- | ------------------------------------------- | -------- |
| id            | string   | Unique scheme identifier                    | Yes      |
| title         | string   | Scheme title                                | Yes      |
| description   | string   | Brief scheme description                    | Yes      |
| category      | string   | Scheme category (e.g., "Financial Support") | Yes      |
| imageUrl      | string   | Thumbnail image URL                         | Yes      |
| location      | string   | Scheme office/center location               | No       |
| date          | string   | Important date (event/deadline)             | No       |
| heroImageUrl  | string   | Hero/banner image URL                       | No       |
| keyObjectives | string[] | Array of key objectives                     | No       |
| overview      | string   | Detailed scheme overview                    | No       |
| process       | string   | Application process details                 | No       |
| support       | string   | Support contact information                 | No       |
| applyUrl      | string   | Application URL                             | No       |

**Scheme Categories:**

- Financial Support
- Agricultural Development
- Soil Management
- Crop Insurance
- Training

---

### Scheme Category

Category classification for schemes.

**JSON Structure:**

```json
{
  "id": "financial-support",
  "title": "Financial & Credit Support",
  "titleKey": "schemesPage.categoriesList.financialSupport",
  "icon": "💰",
  "count": 718,
  "color": "#FFF9E6"
}
```

**Table Format:**

| Field    | Type   | Description                     | Required |
| -------- | ------ | ------------------------------- | -------- |
| id       | string | Unique category ID (kebab-case) | Yes      |
| title    | string | Category display title          | Yes      |
| titleKey | string | i18n translation key            | Yes      |
| icon     | string | Emoji icon for category         | Yes      |
| count    | number | Number of schemes in category   | Yes      |
| color    | string | Category background color (hex) | Yes      |

**Available Categories:**

- Financial & Credit Support (💰, #FFF9E6, 718 schemes)
- Agricultural Development (🌾, #FFF3E0, 12 schemes)
- Soil Management (🪴, #E3F2FD, 8 schemes)
- Crop Insurance (🛡️, #FCE4EC, 6 schemes)

---

### Training Program

Training program structure (extends Scheme model).

**JSON Structure:**

```json
{
  "id": "training-1",
  "title": "Organic Farming Training Program",
  "description": "Comprehensive training on organic farming techniques and certification",
  "category": "Training",
  "imageUrl": "https://via.placeholder.com/400x200",
  "location": "Nandurbar Training Center, Maharashtra",
  "date": "18 November 2025",
  "heroImageUrl": "https://via.placeholder.com/800x400",
  "keyObjectives": [
    "Learn organic farming techniques",
    "Understand certification processes"
  ],
  "overview": "This comprehensive training program covers all aspects of organic farming...",
  "process": "The 5-day training program includes classroom sessions, field demonstrations...",
  "support": "Training is conducted by certified organic farming experts...",
  "applyUrl": "https://organicfarming.nabard.org/"
}
```

**Table Format:**

Same as Scheme model structure.

---

## Content Models

### Banner

Homepage banner/carousel items.

**JSON Structure:**

```json
{
  "title": "PM Kisan Awareness Drive",
  "subtitle": "NOV 2025",
  "imageUrl": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449",
  "url": "https://pmkisan.gov.in"
}
```

**Table Format:**

| Field    | Type   | Description          | Required |
| -------- | ------ | -------------------- | -------- |
| title    | string | Banner title         | Yes      |
| subtitle | string | Banner subtitle/date | Yes      |
| imageUrl | string | Banner image URL     | Yes      |
| url      | string | Click-through URL    | Yes      |

---

### Quick Action

Quick action buttons on the home screen.

**JSON Structure:**

```json
{
  "title": "home.updateProfile",
  "icon": "person-outline",
  "imageUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=profile"
}
```

**Table Format:**

| Field    | Type   | Description           | Required |
| -------- | ------ | --------------------- | -------- |
| title    | string | i18n translation key  | Yes      |
| icon     | string | Ionicons icon name    | Yes      |
| imageUrl | string | Avatar/icon image URL | No       |

**Available Quick Actions:**

- Update Profile (person-outline)
- Ongoing Events (calendar-outline)
- Government Schemes (document-text-outline)
- Book Appointment (call-outline)

---

### Notification

User notification structure.

**JSON Structure:**

```json
{
  "id": "1",
  "type": "approval",
  "title": "Kisan Credit Card Approved",
  "titleKey": "notifications.kisanCardApproved",
  "description": "Your Kisan Credit Card has been approved...",
  "descriptionKey": "notifications.kisanCardApprovedDesc",
  "time": "8:45 pm",
  "date": "2026-02-01T20:45:00.000Z",
  "isRead": false,
  "icon": "card-outline",
  "iconBgColor": "#E3F2FD"
}
```

**Table Format:**

| Field          | Type                                | Description                          | Required |
| -------------- | ----------------------------------- | ------------------------------------ | -------- |
| id             | string                              | Unique notification ID               | Yes      |
| type           | "approval" \| "reminder" \| "alert" | Notification type                    | Yes      |
| title          | string                              | Notification title                   | Yes      |
| titleKey       | string                              | i18n translation key for title       | Yes      |
| description    | string                              | Notification description             | Yes      |
| descriptionKey | string                              | i18n translation key for description | Yes      |
| time           | string                              | Display time (e.g., "8:45 pm")       | Yes      |
| date           | Date                                | JavaScript Date object               | Yes      |
| isRead         | boolean                             | Read status                          | Yes      |
| icon           | string                              | Ionicons icon name                   | Yes      |
| iconBgColor    | string                              | Icon background color (hex)          | Yes      |

**Notification Types:**

- **approval**: Scheme/application approvals (card-outline, #E3F2FD)
- **reminder**: Payment/deadline reminders (time-outline, #FCE4EC)
- **alert**: Weather/important alerts (rainy-outline, #FFF3E0)

---

## Connect Services Models

### Connect Service

Main service categories in the Connect feature.

**JSON Structure:**

```json
{
  "id": "government-schemes",
  "title": "Government Schemes",
  "titleKey": "connect.services.governmentSchemes",
  "icon": "business-outline",
  "iconBgColor": "#E8F5E9",
  "route": "/connect-listing"
}
```

**Table Format:**

| Field       | Type   | Description                    | Required |
| ----------- | ------ | ------------------------------ | -------- |
| id          | string | Unique service ID (kebab-case) | Yes      |
| title       | string | Service title                  | Yes      |
| titleKey    | string | i18n translation key           | Yes      |
| icon        | string | Ionicons icon name             | Yes      |
| iconBgColor | string | Icon background color (hex)    | Yes      |
| route       | string | Navigation route               | Yes      |

**Available Services:**

- Government Schemes (business-outline, #E8F5E9)
- Training & Guidance (school-outline, #E3F2FD)
- Market & Buyers (storefront-outline, #E8F5E9)
- Livestock & Veterinary (paw-outline, #E3F2FD)

---

### Professional

Agricultural professional/expert profile.

**JSON Structure:**

```json
{
  "id": "1",
  "name": "Dr. Pankaj Shukla",
  "role": "Animal Doctor",
  "roleKey": "connect.roles.animalDoctor",
  "department": "Animal Husbandry Department",
  "departmentKey": "connect.departments.animalHusbandry",
  "category": "livestock-veterinary",
  "imageUrl": "https://randomuser.me/api/portraits/men/32.jpg",
  "district": "Jankipuram",
  "serviceArea": {
    "district": "Lucknow",
    "blocks": ["Bakshi Ka Talab", "Malihabad", "Sarojini Nagar"],
    "state": "Uttar Pradesh"
  },
  "specializations": [
    "Cattle health (Cow, Buffalo)",
    "Goat & Sheep treatment",
    "Poultry disease management"
  ],
  "specializationsKeys": [
    "connect.specializations.cattleHealth",
    "connect.specializations.goatSheep",
    "connect.specializations.poultry"
  ],
  "isAvailable": true,
  "phone": "+919876543210"
}
```

**Table Format:**

| Field                | Type     | Description                         | Required |
| -------------------- | -------- | ----------------------------------- | -------- |
| id                   | string   | Unique professional ID              | Yes      |
| name                 | string   | Professional's full name            | Yes      |
| role                 | string   | Professional's role/designation     | Yes      |
| roleKey              | string   | i18n translation key for role       | Yes      |
| department           | string   | Department name                     | Yes      |
| departmentKey        | string   | i18n translation key for department | Yes      |
| category             | string   | Service category ID                 | Yes      |
| imageUrl             | string   | Profile picture URL                 | Yes      |
| district             | string   | Office/working district             | Yes      |
| serviceArea          | object   | Service area details                | Yes      |
| serviceArea.district | string   | Service district                    | Yes      |
| serviceArea.blocks   | string[] | Service blocks/areas                | Yes      |
| serviceArea.state    | string   | Service state                       | Yes      |
| specializations      | string[] | Areas of expertise                  | Yes      |
| specializationsKeys  | string[] | i18n translation keys               | Yes      |
| isAvailable          | boolean  | Current availability status         | Yes      |
| phone                | string   | Contact phone number                | Yes      |

**Professional Categories:**

- government-schemes: Scheme Coordinators
- training-guidance: Agriculture Extension Officers
- market-buyers: Market Liaison Officers
- livestock-veterinary: Veterinary Officers/Animal Doctors

---

### Recent Connection

User's recent connections with professionals.

**JSON Structure:**

```json
{
  "id": "1",
  "professionalId": "1",
  "connectedOn": "05/08/2025",
  "method": "call"
}
```

**Table Format:**

| Field          | Type                              | Description                  | Required |
| -------------- | --------------------------------- | ---------------------------- | -------- |
| id             | string                            | Unique connection ID         | Yes      |
| professionalId | string                            | Reference to Professional ID | Yes      |
| connectedOn    | string                            | Connection date (DD/MM/YYYY) | Yes      |
| method         | "call" \| "chat" \| "appointment" | Connection method            | Yes      |

**Connection Methods:**

- **call**: Phone call connection
- **chat**: Chat message connection
- **appointment**: Scheduled appointment

---

## Form Models

### Select Option

Dropdown/select field options structure.

**JSON Structure:**

```json
{
  "value": "uttar_pradesh",
  "label": "Uttar Pradesh",
  "labelHi": "उत्तर प्रदेश"
}
```

**Table Format:**

| Field   | Type   | Description               | Required |
| ------- | ------ | ------------------------- | -------- |
| value   | string | Option value (snake_case) | Yes      |
| label   | string | Option label in English   | Yes      |
| labelHi | string | Option label in Hindi     | Yes      |

**Available Option Sets:**

#### Indian States (28 states)

Options include all Indian states with English and Hindi labels.

#### Crop Types

- Wheat (गेहूं)
- Rice (चावल)
- Maize (मक्का)
- Sugarcane (गन्ना)
- Cotton (कपास)
- Soybean (सोयाबीन)
- Groundnut (मूंगफली)
- Mustard (सरसों)
- Potato (आलू)
- Onion (प्याज)
- Tomato (टमाटर)
- Pulses (दालें)
- Vegetables (सब्जियां)
- Fruits (फल)
- Other (अन्य)

#### Land Units

- Bigha (बीघा)
- Acre (एकड़)
- Hectare (हेक्टेयर)

#### Animal Types

- Cow (गाय)
- Buffalo (भैंस)
- Goat (बकरी)
- Sheep (भेड़)
- Pig (सुअर)
- Poultry/Hen (मुर्गी)
- Horse (घोड़ा)
- Other (अन्य)

---

## Additional Models

### Form Props Interfaces

These interfaces define the props for various form components in the application.

#### PersonalDetailsFormProps

```json
{
  "initialData": {
    "// PersonalDetails object": "..."
  },
  "onSave": "function(data: PersonalDetails): void",
  "onCancel": "function(): void"
}
```

#### LandDetailsFormProps

```json
{
  "initialData": {
    "// LandDetails object": "..."
  },
  "onSave": "function(data: LandDetails): void",
  "onCancel": "function(): void"
}
```

#### LivestockDetailsFormProps

```json
{
  "initialData": {
    "// LivestockDetails object": "..."
  },
  "onSave": "function(data: LivestockDetails): void",
  "onCancel": "function(): void"
}
```

---

## Context Models

### Auth Context Type

Authentication context interface.

**JSON Structure:**

```json
{
  "isAuthenticated": false,
  "isLoading": true,
  "signIn": "function(): void",
  "signOut": "function(): void"
}
```

**Table Format:**

| Field           | Type     | Description                      | Required |
| --------------- | -------- | -------------------------------- | -------- |
| isAuthenticated | boolean  | User authentication status       | Yes      |
| isLoading       | boolean  | Authentication check in progress | Yes      |
| signIn          | function | Sign in function                 | Yes      |
| signOut         | function | Sign out function                | Yes      |

---

### User Profile Context Type

User profile management context interface.

**JSON Structure:**

```json
{
  "profile": {
    "// UserProfile object": "..."
  },
  "updateProfile": "function(updates: Partial<UserProfile>): void",
  "updatePersonalDetails": "function(data: any): void",
  "updateLandDetails": "function(data: any): void",
  "updateLivestockDetails": "function(data: any): void"
}
```

**Table Format:**

| Field                  | Type        | Description                      | Required |
| ---------------------- | ----------- | -------------------------------- | -------- |
| profile                | UserProfile | Current user profile data        | Yes      |
| updateProfile          | function    | Update profile with partial data | Yes      |
| updatePersonalDetails  | function    | Update personal details section  | Yes      |
| updateLandDetails      | function    | Update land details section      | Yes      |
| updateLivestockDetails | function    | Update livestock details section | Yes      |

---

## Data Validation Rules

### General Rules

- **Phone Numbers**: Must be 10 digits, Indian format
- **Aadhaar Numbers**: Must be 12 digits
- **PIN Codes**: Must be 6 digits
- **OTP**: Must be 6 digits
- **Email**: Standard email format (if applicable)
- **Dates**: ISO 8601 format for storage, localized for display

### Field-Specific Validations

| Field            | Validation Rule | Format       |
| ---------------- | --------------- | ------------ |
| mobileNumber     | 10 digits       | 9876543210   |
| aadhaarNumber    | 12 digits       | 123456789012 |
| pinCode          | 6 digits        | 123456       |
| age              | Number, 18-120  | 35           |
| totalLandArea    | Number, > 0     | 5.5          |
| livestock counts | Number, >= 0    | 2            |
| family members   | Number, >= 0    | 1            |

---

## API Integration Notes

### Expected API Endpoints

Based on the data models, the application likely requires the following API endpoints:

1. **Authentication**
   - `POST /auth/send-otp` - Send OTP to phone
   - `POST /auth/verify-otp` - Verify OTP
   - `POST /auth/logout` - Logout user

2. **User Profile**
   - `GET /user/profile` - Get user profile
   - `PUT /user/profile` - Update user profile
   - `PUT /user/personal-details` - Update personal details
   - `PUT /user/land-details` - Update land details
   - `PUT /user/livestock-details` - Update livestock details

3. **Schemes**
   - `GET /schemes` - List all schemes
   - `GET /schemes/:id` - Get scheme details
   - `GET /schemes/categories` - Get scheme categories
   - `GET /schemes/category/:categoryId` - Get schemes by category

4. **Training Programs**
   - `GET /programs` - List all programs
   - `GET /programs/:id` - Get program details

5. **Notifications**
   - `GET /notifications` - Get user notifications
   - `PUT /notifications/:id/read` - Mark as read
   - `PUT /notifications/read-all` - Mark all as read

6. **Connect Services**
   - `GET /connect/services` - Get service categories
   - `GET /connect/professionals` - List professionals
   - `GET /connect/professionals/:id` - Get professional details
   - `GET /connect/professionals/category/:categoryId` - Get by category
   - `POST /connect/connections` - Create new connection
   - `GET /connect/recent` - Get recent connections

7. **Content**
   - `GET /content/banners` - Get homepage banners
   - `GET /content/quick-actions` - Get quick actions

---

## Database Schema Recommendations

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL,
  photo TEXT,
  mobile_number VARCHAR(10) UNIQUE NOT NULL,
  aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
  fathers_name VARCHAR(255),
  mothers_name VARCHAR(255),
  educational_qualification VARCHAR(255),
  geo_location VARCHAR(255),
  sons_married INTEGER DEFAULT 0,
  sons_unmarried INTEGER DEFAULT 0,
  daughters_married INTEGER DEFAULT 0,
  daughters_unmarried INTEGER DEFAULT 0,
  other_family_members INTEGER DEFAULT 0,
  village VARCHAR(255),
  gram_panchayat VARCHAR(255),
  nyay_panchayat VARCHAR(255),
  post_office VARCHAR(255),
  tehsil VARCHAR(255),
  block VARCHAR(255),
  district VARCHAR(255),
  pin_code VARCHAR(6),
  state VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Land Details Table

```sql
CREATE TABLE land_details (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  total_land_area DECIMAL(10,2),
  rabi_crop VARCHAR(255),
  kharif_crop VARCHAR(255),
  zaid_crop VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Livestock Table

```sql
CREATE TABLE livestock (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  cows INTEGER DEFAULT 0,
  buffaloes INTEGER DEFAULT 0,
  goats INTEGER DEFAULT 0,
  sheep INTEGER DEFAULT 0,
  pigs INTEGER DEFAULT 0,
  poultry INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Schemes Table

```sql
CREATE TABLE schemes (
  id UUID PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  image_url TEXT,
  hero_image_url TEXT,
  location VARCHAR(500),
  date VARCHAR(100),
  key_objectives JSONB,
  overview TEXT,
  process TEXT,
  support TEXT,
  apply_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  time VARCHAR(50),
  date TIMESTAMP NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  icon VARCHAR(100),
  icon_bg_color VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Professionals Table

```sql
CREATE TABLE professionals (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  category VARCHAR(255),
  image_url TEXT,
  district VARCHAR(255),
  service_area JSONB,
  specializations JSONB,
  is_available BOOLEAN DEFAULT TRUE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Connections Table

```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  professional_id UUID REFERENCES professionals(id),
  connected_on DATE NOT NULL,
  method VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Version History

- **v1.0.0** (2026-02-02): Initial documentation
  - Complete data models for all application entities
  - JSON and table format for all models
  - Database schema recommendations
  - API endpoint suggestions

---

## Notes for Developers

1. All string fields support internationalization (i18n) through translation keys
2. Dates are stored as JavaScript Date objects but displayed in localized formats
3. Phone numbers are stored without country code but displayed with +91 prefix
4. All IDs use string type for flexibility (UUID or custom format)
5. Livestock counts and family member counts default to 0
6. Image URLs support both placeholder and actual image services
7. All optional fields should handle null/undefined values gracefully
8. Notification grouping is done by date (Today, Yesterday, Older)
9. Professional availability is a boolean but may be extended to schedule-based in future
10. Scheme categories are predefined but should be fetched from backend in production

---
