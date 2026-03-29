# Tasks

## Task List

- [ ] 1. Bug Fix — Forgot-Password OTP Flow
  - [x] 1.1 In `Client/src/app/(auth)/otp-input.tsx`, add a guard before calling `signIn()`: when `mode === "forgot-password"`, call `authApi.verifyOTP(phoneNumber, otpString)` directly instead of `signIn()`, so no session token is stored
  - [x] 1.2 In `Client/src/app/(auth)/set-password.tsx`, change the `mode === "reset"` success navigation from `router.replace("/(auth)/" as any)` to `router.replace({ pathname: "/(auth)/phone-input", params: { mode: "login" } })`
  - [x] 1.3 In `Server/backend/src/controllers/authController.js` (or equivalent), ensure the OTP verification endpoint can be called without issuing a JWT — add a `skipToken` flag or a separate `POST /auth/verify-otp-only` endpoint that returns `{ success: true }` without a token

- [x] 2. Bug Fix — Location Dropdown Pre-Population
  - [x] 2.1 In `Client/src/app/(auth)/personal-details.tsx` (and `Client/src/app/personal-details.tsx`), after fetching the user profile in the `useEffect`, initialize the `district` state variable with `profile.district` and the `state` variable with `profile.state` so the selectors render pre-selected
  - [x] 2.2 In `Client/src/app/(auth)/location-picker.tsx` when `purpose === "profile"`, read the existing `state` and `district` from the user profile and pass them as initial values to the address dropdowns on screen load

- [x] 3. KeyboardAwareScrollView Component
  - [x] 3.1 Create `Client/src/components/atoms/KeyboardAwareScrollView.tsx` — check if `react-native-keyboard-aware-scroll-view` is in `package.json`; if so, wrap it; otherwise implement using `Keyboard.addListener("keyboardDidShow"/"keyboardDidHide")` + `ScrollView` ref + `scrollTo`, with iOS delegating to `KeyboardAvoidingView behavior="padding"`
  - [x] 3.2 Replace `KeyboardAvoidingView` + `ScrollView` combos in all auth screens: `otp-input.tsx`, `set-password.tsx`, `phone-input.tsx`, `personal-details.tsx`, `land-details.tsx`, `livestock-details.tsx`
  - [x] 3.3 Replace `KeyboardAvoidingView` + `ScrollView` combos in all profile edit screens: `Client/src/app/personal-details.tsx`, `Client/src/app/land-details.tsx`, `Client/src/app/livestock-details.tsx`

- [x] 4. Weather Widget
  - [x] 4.1 Create `Client/src/data/districtCoords.ts` exporting a `DISTRICT_COORDS` map of district name → `[lat, lng]` (copy/adapt from `Server/backend/src/data/districtCoords.js`)
  - [x] 4.2 Create `Client/src/components/molecules/WeatherWidget.tsx` — fetch from Open-Meteo using the farmer's district coordinates (or UP fallback), map WMO `weathercode` to English/Hindi label and Ionicons icon name, render temperature + condition + icon with loading skeleton and error/retry state
  - [x] 4.3 In `Client/src/app/(tab)/index.tsx`, import and render `<WeatherWidget>` below `<QuickActionGrid>` and above the Schemes section, passing `district` from `UserProfileContext` and `language` from `useLanguageStore`

- [x] 5. NotificationAlert Enhancement
  - [x] 5.1 Refactor `Client/src/components/molecules/NotificationAlert.tsx` to accept `notifications: Array<{ id, title, description, createdAt }>` (up to 3), render each as a stacked row with title, 2-line truncated description, and relative timestamp; add per-item dismiss; return `null` when array is empty
  - [x] 5.2 In `Client/src/app/(tab)/index.tsx`, update the notifications fetch to `limit: 3`, pass the array to `NotificationAlert`, and track dismissed IDs in local state

- [x] 6. Programme Happening Today
  - [x] 6.1 In `Client/src/app/(tab)/index.tsx`, fetch events and filter client-side for `event.date.split("T")[0] === todayString`; render a "Programme Happening Today" section below the Schemes section using the existing `EventCard` atom; show "No programmes today" placeholder when empty and an inline error message on fetch failure

- [x] 7. RBAC — Backend
  - [x] 7.1 Write and run a SQL migration: add `role VARCHAR(20) NOT NULL DEFAULT 'admin'`, `name VARCHAR(255)`, `is_active BOOLEAN NOT NULL DEFAULT true`, `last_login_at TIMESTAMPTZ` columns to `public.admins`; add a CHECK constraint for the four valid role values
  - [x] 7.2 Update `Server/backend/src/models/Admin.js` — add `findAll()`, `findById(id)`, `createWithRole(email, passwordHash, name, role)`, `updateById(id, fields)`, `setActive(id, isActive)` methods
  - [x] 7.3 Update `Server/backend/src/controllers/adminController.js` — in `loginAdmin`, include `role` and `name` in the JWT payload, update `last_login_at`, and return 403 if `admin.is_active === false`
  - [x] 7.4 Add admin user management routes to the backend router: `GET /admin/users`, `POST /admin/users`, `PATCH /admin/users/:id`, `PATCH /admin/users/:id/status` — all protected by `adminAuthMiddleware`

- [x] 8. Admin Dashboard — User Management Page
  - [x] 8.1 Add `{ id: "users", title: "User Management", icon: <UserCog>, link: "/users" }` to `dashboardRoutes` in `Server/dashboard/src/components/app-sidebar.jsx`
  - [x] 8.2 Create `Server/dashboard/src/app/(page)/users/page.jsx` — table of all admin accounts (name, email, role badge, status badge, last login), "Create User" dialog (name, email, password, role dropdown), edit dialog, and deactivate/activate toggle; call the new `/admin/users` endpoints

- [x] 9. Admin Dashboard — Appointments Page
  - [x] 9.1 Add a `GET /admin/appointments` endpoint to the backend that returns all appointments with farmer name and professional name joined (not filtered by user)
  - [x] 9.2 Add `{ id: "appointments", title: "Appointments", icon: <CalendarCheck>, link: "/appointments" }` to `dashboardRoutes` in `app-sidebar.jsx`
  - [x] 9.3 Create `Server/dashboard/src/app/(page)/appointments/page.jsx` — table with farmer name, professional name, date, time, status badge; status filter dropdown; date range filter; Confirm/Cancel/Complete action buttons calling `PATCH /appointments/:id/status`; pagination with 20/50 page size selector

- [x] 10. Admin Dashboard — CSV Export
  - [x] 10.1 In `Server/dashboard/src/components/beneficiaries-table.jsx`, add an "Export CSV" button to the filter bar; for ≤1000 records, generate CSV client-side from `filteredData` (name, mobile_number, district, state, village, land area, livestock count, created_at, is_verified) and trigger a browser download; for >1000 records, call `GET /users?format=csv` and show a progress spinner
  - [x] 10.2 In the backend `userController.js`, handle `?format=csv` query param on `GET /users` — stream CSV rows using `res.setHeader("Content-Type", "text/csv")` and pipe query results

- [x] 11. Admin Dashboard — Programme Gallery
  - [x] 11.1 Write and run a SQL migration: add `outcome TEXT` and `media_urls TEXT[]` columns to the `events` table
  - [x] 11.2 Update the events backend model and controller to accept and return `outcome` and `media_urls` fields
  - [x] 11.3 Create `Server/dashboard/src/components/programme-gallery.jsx` — modal with photo grid (thumbnails), inline video players, lightbox overlay on photo click, and "No media uploaded" empty state
  - [x] 11.4 Add a "View Gallery" button to each event card in `Server/dashboard/src/app/(page)/events/page.jsx` that opens the `ProgrammeGallery` modal

- [x] 12. Programme Logging with Media (Web Dashboard)
  - [x] 12.1 Add a Tiptap rich-text editor for the `outcome` field to the create-event and edit-event forms in the Admin Dashboard (Bold, Italic, BulletList extensions)
  - [x] 12.2 Add multi-file upload UI to the event form: photo picker (up to 10 images) and video picker (up to 2 videos, max 200MB each); show per-file upload progress and per-file error/retry state
  - [x] 12.3 Add a `POST /upload/media` backend endpoint that accepts a file, uploads it to Cloudinary, and returns the URL
  - [x] 12.4 Add a debounced farmer search input to the event form that calls `GET /users?search={query}&limit=10` and allows adding farmers as participants; store selected farmer IDs in `participant_ids` on the event record

- [x] 13. Mobile Admin — Add Beneficiary
  - [x] 13.1 Create `Client/src/app/(admin)/add-beneficiary.tsx` — multi-step form (personal details → location → land details → livestock details) reusing existing form component patterns; submit to `POST /users` with `registered_by: adminId`; handle 409 conflict with a "Farmer already registered" message
  - [x] 13.2 Add a pre-registration search bar at the top of the add-beneficiary screen that calls `GET /users?search={query}` and shows matching farmers before the form starts
  - [x] 13.3 Add an "Add Beneficiary" `ActionCard` to `Client/src/app/(admin)/dashboard.tsx` and an "Add Beneficiary" button to `Client/src/app/(admin)/beneficiaries.tsx`

- [ ] 14. Offline Caching System
  - [ ] 14.1 Create `Client/src/utils/offlineQueue.ts` — AsyncStorage-backed queue with `enqueue(type, payload)`, `dequeue(id)`, `getAll()`, `getCount()`, `markAttempt(id, success)` methods; queue entries include `id`, `type`, `payload`, `savedAt`, `attempts`, `lastAttemptAt`
  - [ ] 14.2 In `Client/src/app/(admin)/create-event.tsx`, wrap `handleCreate` to call `offlineQueue.enqueue("create-event", payload)` when `NetInfo.fetch()` returns `isConnected === false`, and show a "Saved offline" toast
  - [ ] 14.3 In `Client/src/app/(admin)/mark-attendance.tsx`, wrap the attendance submit handler similarly to enqueue when offline
  - [ ] 14.4 Add an `AppState` listener (on foreground) in `Client/src/app/_layout.tsx` or a dedicated hook that checks `NetInfo`, iterates queue entries with `savedAt` ≥6 hours ago, attempts upload, calls `dequeue` on success or `markAttempt(id, false)` on failure, and shows a failure notification
  - [ ] 14.5 In `Client/src/app/(admin)/dashboard.tsx`, display a pending count badge on the dashboard using `offlineQueue.getCount()`