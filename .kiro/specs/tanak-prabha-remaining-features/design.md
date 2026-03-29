# Design Document — Tanak Prabha Remaining Features

## Overview

This document covers the technical design for all remaining features and bug fixes on the Tanak Prabha platform. The work spans three codebases:

- **Client** — React Native (Expo) farmer app
- **Server/backend** — Node.js/Express API with PostgreSQL + PostGIS
- **Server/dashboard** — Next.js admin web dashboard

The features are grouped into eight areas, ordered by priority: bug fixes first, then new UI components, then home dashboard enhancements, then RBAC, then admin dashboard pages, then mobile admin additions, then programme logging with media, and finally offline caching.

---

## Architecture

The platform follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│  Client (React Native / Expo)                                   │
│  ├── (auth) screens — OTP, set-password, onboarding            │
│  ├── (tab) screens — Home, Profile, Schemes, Connect, Program  │
│  └── (admin) screens — Mobile Admin for field agents           │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────────────────┐
│  Backend (Node.js / Express)                                    │
│  ├── controllers — auth, users, events, appointments, admins   │
│  ├── models — User, Admin, Event, Appointment, LandDetails…    │
│  └── PostgreSQL + PostGIS                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────────────────┐
│  Dashboard (Next.js App Router)                                 │
│  ├── (page) — events, beneficiaries, appointments, users…      │
│  └── components — tables, forms, modals, sidebar               │
└─────────────────────────────────────────────────────────────────┘
```

External services:
- **Open-Meteo** — free weather API (no key required)
- **Cloudinary** — media upload for programme photos/videos
- **Google Maps / Places API** — location picker (already integrated)

---

## Components and Interfaces

### Bug Fix 1 — Forgot-Password OTP Flow

**Problem:** `otp-input.tsx` calls `signIn()` unconditionally before branching on `mode`. `signIn()` stores a session token. In `forgot-password` mode, a token must not be issued. Additionally, `set-password.tsx` navigates to `/(auth)/` (the auth index) after a reset instead of `/(auth)/phone-input?mode=login`.

**Fix in `otp-input.tsx`:**
- In `handleVerifyOTP`, check `mode === "forgot-password"` before calling `signIn()`.
- For forgot-password mode, call `authApi.verifyOTP(phoneNumber, otpString)` directly (no token storage) instead of `signIn()`.
- Then navigate to `/(auth)/set-password` with `{ phoneNumber, mode: "reset" }`.

**Fix in `set-password.tsx`:**
- In the `mode === "reset"` success handler, replace `router.replace("/(auth)/" as any)` with `router.replace({ pathname: "/(auth)/phone-input", params: { mode: "login" } })`.

**Required backend support:** The existing `POST /auth/verify-otp` endpoint must be callable without issuing a JWT. If the current endpoint always issues a token, add a `skipToken: true` flag or create a separate `POST /auth/verify-otp-only` endpoint that validates the OTP and returns `{ success: true }` without a token.

---

### Bug Fix 2 — Location Dropdown Pre-Population

**Problem:** The profile edit screens (`personal-details.tsx` and `location-picker.tsx` in profile mode) do not pass the user's saved `state` and `district` back into the state/district selector. The `AddressDropdowns` component only handles tehsil/nyayPanchayat/gramPanchayat/village — the state and district selectors are separate `Select` components rendered directly in the screen.

**Fix in `personal-details.tsx` (profile edit path) and `Client/src/app/personal-details.tsx`:**
- After fetching the user profile, initialize the `district` state variable with `profile.district`.
- The state selector (currently hardcoded to `uttar_pradesh`) should be initialized from `profile.state` if present.

**Fix in `location-picker.tsx` (profile mode):**
- When `purpose === "profile"` and the screen loads, read the existing `state` and `district` from the user profile (already fetched via `userApi.getProfile()`) and pass them as initial values to the address dropdowns.

No backend changes required — the data already exists in the user profile response.

---

### KeyboardAwareScrollView Component

**File:** `Client/src/components/atoms/KeyboardAwareScrollView.tsx`

**Implementation strategy:** Wrap `react-native-keyboard-aware-scroll-view` if available in `package.json`; otherwise implement using `Keyboard.addListener` + `ScrollView` ref + `scrollTo`.

```typescript
interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  extraScrollHeight?: number; // additional padding above keyboard, default 20
}
```

The component:
1. Listens to `keyboardDidShow` / `keyboardDidHide` events.
2. On `keyboardDidShow`, finds the currently focused `TextInput` using `TextInput.State.currentlyFocusedInput()`, measures its position, and scrolls the `ScrollView` so the input is above the keyboard.
3. On `keyboardDidHide`, restores the previous scroll offset.
4. On iOS, delegates to `KeyboardAvoidingView` with `behavior="padding"` to preserve existing behavior.

**Screens to update:** All auth screens (`otp-input`, `set-password`, `phone-input`, `personal-details`, `land-details`, `livestock-details`) and all profile edit screens (`personal-details`, `land-details`, `livestock-details`, `location-picker`).

---

### Weather Widget

**File:** `Client/src/components/molecules/WeatherWidget.tsx`

**API:** `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,weathercode`

**Location resolution:**
1. Use the farmer's stored `district` from `UserProfileContext`.
2. Look up coordinates in `DISTRICT_COORDS` (already in `Server/backend/src/data/districtCoords.js` — the client needs a copy or a subset).
3. If no district, fall back to Uttar Pradesh centroid (26.8467, 80.9462).

**WMO weather code mapping:** Map `weathercode` integer to a label (e.g., 0 → "Clear Sky", 61 → "Rain") and an icon name from `@expo/vector-icons/Ionicons`.

**Component interface:**
```typescript
interface WeatherWidgetProps {
  district?: string;
  language: "en" | "hi";
}
```

**Placement:** In `(tab)/index.tsx`, render `<WeatherWidget>` below `<QuickActionGrid>` and above the Schemes section.

**Error/loading states:**
- Loading: skeleton shimmer
- Error: "Weather unavailable" with a retry button
- No location: use default region silently

---

### NotificationAlert Enhancement

**File:** `Client/src/components/molecules/NotificationAlert.tsx`

**Current interface:** Accepts a single `notification` object.

**New interface:**
```typescript
interface NotificationAlertProps {
  notifications: Array<{
    id: string;
    title: string;
    description: string;
    createdAt: string; // ISO timestamp for relative time display
  }>;
  onDismiss: (id: string) => void;
  onViewAll: () => void;
}
```

**Changes:**
- Accept an array of up to 3 notifications.
- Render each as a stacked row with title, 2-line truncated description, and relative timestamp (e.g., "2 hours ago").
- Individual dismiss per item (calls `onDismiss(id)`).
- "View All" link at the bottom.
- If `notifications.length === 0`, render nothing (return `null`).

**Update `(tab)/index.tsx`:**
- Fetch `notificationsApi.getMy({ unread_only: true, limit: 3 })` instead of `limit: 1`.
- Pass the array to `NotificationAlert`.
- Track dismissed IDs in local state and filter them out.

---

### Programme Happening Today

**Addition to `(tab)/index.tsx`:**
- Fetch `eventsApi.getAll({ limit: 50 })` and filter client-side where `event.date.split("T")[0] === today`.
- Render a "Programme Happening Today" section below the Schemes section.
- Each event renders as a tappable `EventCard` (reuse existing atom).
- Empty state: "No programmes today" placeholder.
- Error state: inline error message.

---

### RBAC — Backend

**Database migration:**
```sql
ALTER TABLE public.admins
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.admins
  ADD CONSTRAINT admins_role_check
  CHECK (role IN ('super_admin', 'admin', 'sub_admin', 'volunteer'));
```

**`adminController.js` — `loginAdmin`:**
- Include `role` and `name` in the JWT payload: `{ id, email, role: admin.role, name: admin.name }`.
- Update `last_login_at` on successful login.
- If `admin.is_active === false`, return 403 before issuing token.

**`Admin.js` model additions:**
- `findAll()` — list all admins (id, email, name, role, is_active, last_login_at, created_at).
- `createWithRole(email, passwordHash, name, role)` — insert with role.
- `updateRole(id, role)` — update role column.
- `setActive(id, isActive)` — update is_active column.
- `findById(id)` — lookup by UUID.

**New admin management routes** (protected by existing `adminAuthMiddleware`):
- `GET /admin/users` — list all admins
- `POST /admin/users` — create admin with role
- `PATCH /admin/users/:id` — update name/email/role
- `PATCH /admin/users/:id/status` — activate/deactivate

---

### Admin Dashboard — User Management Page

**File:** `Server/dashboard/src/app/(page)/users/page.jsx`

**Sidebar:** Add entry to `dashboardRoutes` in `app-sidebar.jsx`:
```javascript
{ id: "users", title: "User Management", icon: <UserCog className="size-4" />, link: "/users" }
```

**Page features:**
- Table listing all admin accounts: name, email, role badge, status badge, last login.
- "Create User" dialog: name, email, password, role dropdown (4 options).
- Edit dialog: name, email, role.
- Deactivate/Activate toggle button per row.
- Role badge colors: `super_admin` → purple, `admin` → blue, `sub_admin` → amber, `volunteer` → green.

---

### Admin Dashboard — Appointments Page

**File:** `Server/dashboard/src/app/(page)/appointments/page.jsx`

**Sidebar:** Add entry:
```javascript
{ id: "appointments", title: "Appointments", icon: <CalendarCheck className="size-4" />, link: "/appointments" }
```

**Page features:**
- Fetch from `GET /appointments` (admin endpoint — needs to be added or use existing `GET /appointments` with admin auth).
- Filter bar: status dropdown (Pending/Confirmed/Cancelled/Completed) + date range pickers.
- Table: farmer name, professional name, date, time, status badge, action buttons.
- Action buttons: Confirm, Cancel, Complete — call `PATCH /appointments/:id/status`.
- Pagination: 20 or 50 per page selector.
- Optimistic UI update on status change.

**Backend addition:** Add `GET /admin/appointments` endpoint in `appointmentController.js` that returns all appointments (not filtered by user) with farmer and professional names joined.

---

### Admin Dashboard — CSV Export

**File:** `Server/dashboard/src/components/beneficiaries-table.jsx`

**Client-side export (for ≤1000 records):**
- Add "Export CSV" button to the filter bar.
- On click, take `filteredData` (already computed), map to CSV rows, and trigger a browser download via `URL.createObjectURL(new Blob([csvString], { type: "text/csv" }))`.
- Required columns: name, mobile_number, district, state, village, land_details.total_land_area, livestock count (sum), created_at, is_verified.

**Server-side export (for >1000 records):**
- If `totalCount > 1000`, call `GET /users?format=csv` instead.
- Backend streams CSV using `res.setHeader("Content-Type", "text/csv")` and pipes query results row by row.
- Show a progress indicator (indeterminate spinner) while downloading.

---

### Admin Dashboard — Programme Gallery

**File:** `Server/dashboard/src/components/programme-gallery.jsx`

**Backend changes:**
- Add `outcome TEXT` and `media_urls TEXT[]` columns to the `events` table.
- Update `eventsApi.update()` to accept `outcome` and `media_urls`.

**Gallery modal interface:**
```typescript
interface ProgrammeGalleryProps {
  eventId: string;
  mediaUrls: string[];
  open: boolean;
  onClose: () => void;
}
```

**Features:**
- Photo grid: responsive CSS grid, thumbnail images.
- Video players: `<video>` elements with controls.
- Lightbox: clicking a photo opens full-resolution overlay with prev/next navigation.
- Empty state: "No media uploaded" message.
- "View Gallery" button added to each event card in `events/page.jsx`.

---

### Mobile Admin — Add Beneficiary

**File:** `Client/src/app/(admin)/add-beneficiary.tsx`

**Navigation:** Add "Add Beneficiary" `ActionCard` to `dashboard.tsx` and a button to `beneficiaries.tsx`.

**Form structure:** Multi-step using existing form components:
1. Step 1: Personal details (name, age, gender, mobile, aadhaar, father's name)
2. Step 2: Location (state, district, tehsil, village)
3. Step 3: Land details (reuse `LandDetailsForm` pattern)
4. Step 4: Livestock details (reuse `LivestockDetailsForm` pattern)

**Submission:** Call `POST /users` with `registered_by: adminId` in the payload. Handle 409 conflict (duplicate mobile) with a clear error message.

**Pre-registration search:** Search bar at the top of the screen that calls `GET /users?search={query}` before starting the form.

---

### Offline Caching System

**File:** `Client/src/utils/offlineQueue.ts`

**Queue structure stored in AsyncStorage under key `@offline_queue`:**
```typescript
interface QueueEntry {
  id: string;          // uuid
  type: "create-event" | "mark-attendance";
  payload: object;
  savedAt: string;     // ISO timestamp
  attempts: number;
  lastAttemptAt?: string;
}
```

**API:**
```typescript
export const offlineQueue = {
  enqueue(type, payload): Promise<string>,   // returns entry id
  dequeue(id): Promise<void>,
  getAll(): Promise<QueueEntry[]>,
  getCount(): Promise<number>,
  markAttempt(id, success: boolean): Promise<void>,
}
```

**Auto-upload logic:**
- On app foreground (`AppState.addEventListener("change")`), check `NetInfo.fetch()`.
- If connected, check each entry's `savedAt` — if ≥6 hours ago, attempt upload.
- On success, call `dequeue(id)`.
- On failure, call `markAttempt(id, false)` and show a notification.

**Integration points:**
- `create-event.tsx`: wrap `handleCreate` to enqueue if offline.
- `mark-attendance.tsx`: wrap submit to enqueue if offline.
- `dashboard.tsx`: show pending count badge using `offlineQueue.getCount()`.

---

### Programme Logging with Media (Web Dashboard)

**Extension of `events/[id]/page.jsx` and create-event form:**

**Rich-text outcome field:**
- Use Tiptap (already in dependencies) with Bold, Italic, BulletList extensions.
- Store as HTML string in `outcome` column.

**Media upload:**
- Multi-file input accepting images (up to 10) and videos (up to 2, max 200MB each).
- Upload each file to Cloudinary via `POST /upload/media` (new backend endpoint).
- Track per-file upload state: pending / uploading / success / error.
- On error, show per-file retry button without re-uploading successful files.
- Store resulting URLs in `media_urls` array on the event record.

**Farmer participant search:**
- Debounced search input calling `GET /users?search={query}&limit=10`.
- Dropdown of matching farmers with name + mobile.
- Selected farmers stored in `participant_ids` array on the event.

---

## Data Models

### `admins` table (additions)

| Column | Type | Notes |
|--------|------|-------|
| `role` | `VARCHAR(20)` | `CHECK IN ('super_admin','admin','sub_admin','volunteer')`, default `'admin'` |
| `name` | `VARCHAR(255)` | Display name |
| `is_active` | `BOOLEAN` | Default `true` |
| `last_login_at` | `TIMESTAMPTZ` | Updated on login |

### `events` table (additions)

| Column | Type | Notes |
|--------|------|-------|
| `outcome` | `TEXT` | Rich-text HTML from Tiptap |
| `media_urls` | `TEXT[]` | Array of Cloudinary URLs |
| `participant_ids` | `UUID[]` | Array of user IDs |

### Offline Queue Entry (AsyncStorage)

```typescript
{
  id: string,
  type: "create-event" | "mark-attendance",
  payload: Record<string, unknown>,
  savedAt: string,
  attempts: number,
  lastAttemptAt?: string
}
```

### Weather API Response (Open-Meteo)

```typescript
{
  current: {
    temperature_2m: number,
    weathercode: number
  }
}
```

### JWT Payload (admin, updated)

```typescript
{
  id: string,
  email: string,
  role: "super_admin" | "admin" | "sub_admin" | "volunteer",
  name: string,
  iat: number,
  exp: number
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Weather widget renders required fields for any valid weather response

*For any* weather API response containing `temperature_2m` and `weathercode`, the rendered `WeatherWidget` output should contain a temperature string (with °C), a non-empty condition label, and a non-empty icon identifier.

**Validates: Requirements 1.2, 1.5**

---

### Property 2: Today's events filter is correct

*For any* array of event objects with arbitrary dates, the "today's events" filter function should return exactly the subset of events whose `date` field (truncated to YYYY-MM-DD) equals today's date string.

**Validates: Requirements 2.1, 2.2**

---

### Property 3: NotificationAlert renders all items with required fields

*For any* array of 1–3 notification objects, the `NotificationAlert` component should render exactly that many items, each containing the notification's title, a non-empty description (truncated to 2 lines), and a relative timestamp string.

**Validates: Requirements 3.1, 3.2, 3.3**

---

### Property 4: JWT payload contains valid role for any admin login

*For any* admin account with a stored role value, a successful login should produce a JWT whose decoded payload contains a `role` field equal to the stored role, and the role value must be one of `['super_admin', 'admin', 'sub_admin', 'volunteer']`.

**Validates: Requirements 4.2, 12.1, 12.2**

---

### Property 5: All four role values grant identical access to Mobile_Admin screens

*For any* of the four role values (`super_admin`, `admin`, `sub_admin`, `volunteer`), the routing logic should resolve to the `/(admin)` screen group, and no screen within that group should return an access-denied result based on role alone.

**Validates: Requirements 4.3, 4.4, 12.5**

---

### Property 6: Media attachment count validation

*For any* number of photos P and videos V attached to a programme, the validator should accept the submission if and only if `1 ≤ P ≤ 10` and `0 ≤ V ≤ 2`. All other combinations should be rejected with a descriptive error.

**Validates: Requirements 5.2, 5.3**

---

### Property 7: Farmer search results match query

*For any* search query string Q and any farmer returned in the search results, the farmer's `name` or `mobile_number` should contain Q as a case-insensitive substring.

**Validates: Requirements 5.5**

---

### Property 8: Offline queue round-trip

*For any* form payload enqueued while offline, reading the queue from AsyncStorage should return an entry whose `payload` is deeply equal to the original, and after a successful upload the entry should no longer appear in the queue.

**Validates: Requirements 6.1, 6.4**

---

### Property 9: Offline queue count indicator matches queue length

*For any* state of the offline queue containing N entries, the pending count indicator displayed in the UI should show exactly N.

**Validates: Requirements 6.3**

---

### Property 10: Add-beneficiary sets registered_by field

*For any* beneficiary registration submitted by a field agent with ID A, the created user record in the database should have `registered_by = A`.

**Validates: Requirements 7.2**

---

### Property 11: Appointment filter returns only matching records

*For any* status filter value S applied to the appointments list, every appointment in the filtered result should have `status === S`. For any date range [start, end], every appointment in the filtered result should have a date within that range.

**Validates: Requirements 8.4**

---

### Property 12: Appointment pagination respects page size

*For any* page size P and total appointment count N, each page of results should contain at most P appointments, and the total number of appointments across all pages should equal N.

**Validates: Requirements 8.5**

---

### Property 13: CSV export contains all required fields for every record

*For any* farmer record in the export, the corresponding CSV row should contain non-empty values for: name, mobile_number, district, state, village, land area, livestock count, registration date, and verification status.

**Validates: Requirements 9.2, 9.3**

---

### Property 14: Programme gallery renders correct media types

*For any* array of media URLs associated with a programme, image URLs (jpg/png/webp/gif) should be rendered as grid thumbnail elements, and video URLs (mp4/mov/webm) should be rendered as video player elements.

**Validates: Requirements 10.3**

---

### Property 15: Admin account CRUD round-trip

*For any* admin account creation or update operation, reading the account back from the database should return values equal to those submitted (name, email, role, is_active).

**Validates: Requirements 11.2, 11.3, 12.4**

---

### Property 16: Deactivated admin account is rejected on login

*For any* admin account with `is_active = false`, a login attempt with correct credentials should return a 403 response and no JWT should be issued.

**Validates: Requirements 11.4**

---

### Property 17: Role assignment accepts all four valid values

*For any* of the four role values (`super_admin`, `admin`, `sub_admin`, `volunteer`), a role assignment request for any admin account should succeed (2xx response) and the stored role should equal the assigned value.

**Validates: Requirements 11.5, 12.1**

---

### Property 18: Backend does not return 403 based on role value alone

*For any* authenticated admin request with any of the four role values, the backend should not return a 403 response solely because of the role value (i.e., role is a label, not a permission gate).

**Validates: Requirements 12.6**

---

### Property 19: Keyboard scroll position restores after keyboard dismiss

*For any* scroll position S before a `TextInput` receives focus, after the keyboard is shown and then dismissed, the `KeyboardAwareScrollView` should restore the scroll position to S (within a tolerance of ±1px).

**Validates: Requirements 13.4**

---

### Property 20: Forgot-password OTP verification does not store a token

*For any* OTP verification call made with `mode === "forgot-password"`, no authentication token should be written to `tokenManager` / `AsyncStorage`, and the navigation target should be `/(auth)/set-password` with `mode: "reset"`.

**Validates: Requirements 14.1, 14.3, 14.5**

---

### Property 21: Location dropdowns pre-populate from profile data

*For any* user profile containing non-empty `state` and `district` values, the profile edit screen should initialize the state and district selector state variables with those values, and the `AddressDropdowns` component should receive them as initial values (resulting in those options being selected in the rendered dropdowns).

**Validates: Requirements 15.1, 15.2**

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Weather API timeout / 5xx | Show "Weather unavailable" fallback with retry button; do not crash home screen |
| Events API failure on home screen | Show inline error within the "Today's Programmes" section; other sections unaffected |
| OTP verification in forgot-password mode — network error | Show error alert; do not navigate; allow retry |
| Cloudinary upload failure (media) | Per-file error indicator; allow retry of failed files only |
| Offline form submission | Enqueue to AsyncStorage; show "Saved offline" toast |
| Duplicate mobile on add-beneficiary | Show "Farmer already registered" message with option to view existing record |
| Admin login with deactivated account | Return 403 with message "Account deactivated. Contact your administrator." |
| CSV export failure | Toast error notification with retry option |
| Invalid role value in DB | Constraint violation caught at DB level; return 400 with validation message |

---

## Testing Strategy

### Unit Tests

Unit tests cover specific examples, edge cases, and pure functions:

- `weatherCodeToLabel(code, language)` — test known WMO codes in both languages
- `filterTodayEvents(events, today)` — test with mixed dates including edge cases (midnight, timezone)
- `buildCsvRow(farmer)` — test that all required fields are present and properly escaped
- `offlineQueue.enqueue / dequeue` — test with mocked AsyncStorage
- `validateMediaAttachments(photos, videos)` — test boundary values (0, 1, 10, 11 photos; 0, 2, 3 videos)
- `relativeTime(isoString)` — test "just now", "2 hours ago", "3 days ago"
- `adminLoginHandler` — test 401 for wrong password, 403 for inactive account, 200 with role in JWT

### Property-Based Tests

Property-based tests use **fast-check** (TypeScript/JavaScript) for the Client and Dashboard, and **fast-check** or **jest-fast-check** for the Backend.

Each property test runs a minimum of **100 iterations**.

Tag format: `// Feature: tanak-prabha-remaining-features, Property {N}: {property_text}`

| Property | Test Description | Library |
|----------|-----------------|---------|
| P1 | Generate random weather codes (0–99) and both languages; assert rendered output contains temp, label, icon | fast-check |
| P2 | Generate random event arrays with random dates; assert filter returns only today's events | fast-check |
| P3 | Generate arrays of 1–3 notification objects; assert rendered item count and field presence | fast-check |
| P4 | Generate admin records with random roles; assert JWT payload role matches stored role | fast-check |
| P5 | For each of 4 role values, assert routing resolves to admin screens | fast-check (4 cases) |
| P6 | Generate random photo/video counts; assert validator accepts iff within bounds | fast-check |
| P7 | Generate random farmer arrays and search queries; assert all results contain query | fast-check |
| P8 | Generate random form payloads; enqueue, read, upload, assert removal | fast-check |
| P9 | Generate queues of N items; assert indicator shows N | fast-check |
| P10 | Generate registration payloads with agent IDs; assert created record has correct registered_by | fast-check |
| P11 | Generate appointment arrays with random statuses/dates; assert filter correctness | fast-check |
| P12 | Generate appointment counts and page sizes; assert pagination invariants | fast-check |
| P13 | Generate farmer records; assert CSV row contains all required fields | fast-check |
| P14 | Generate media URL arrays; assert correct rendering by file extension | fast-check |
| P15 | Generate admin CRUD operations; assert read-back equals written values | fast-check |
| P16 | For any inactive admin, assert login returns 403 | fast-check |
| P17 | For each of 4 role values, assert assignment succeeds and stored value matches | fast-check |
| P18 | For any role value, assert no 403 on authenticated API calls | fast-check |
| P19 | Generate scroll positions; simulate keyboard show/hide; assert position restored | fast-check |
| P20 | For any forgot-password OTP call, assert no token stored and correct navigation target | fast-check |
| P21 | Generate user profiles with state/district; assert dropdowns initialized with those values | fast-check |

### Integration Tests

- Full forgot-password flow: phone-input → OTP → set-password → phone-input (login mode)
- Full add-beneficiary flow: search → form → submit → verify record in DB
- Offline queue: submit form offline → verify queue → simulate connectivity → verify upload and queue cleared
- CSV export: apply filters → export → verify exported rows match filtered data
