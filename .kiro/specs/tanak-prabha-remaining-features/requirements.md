# Requirements Document

## Introduction

This document covers all remaining features and bug fixes for the Tanak Prabha platform — a React Native (Expo) farmer app, Node.js/Express backend, and Next.js admin dashboard. The work spans: farmer app home dashboard enhancements, admin dashboard missing pages, role-based access control (RBAC) with four admin role labels, a cross-platform keyboard-aware scroll component, and two targeted bug fixes (forgot-password OTP flow and location dropdown pre-population).

## Glossary

- **Farmer_App**: The React Native (Expo) mobile application used by farmers.
- **Admin_Dashboard**: The Next.js web application used by administrators.
- **Mobile_Admin**: The `/(admin)` screens in the React Native app used by field agents/admins on mobile.
- **Backend**: The Node.js/Express API server backed by PostgreSQL + PostGIS.
- **Auth_Service**: The authentication subsystem handling OTP, JWT issuance, and password management.
- **OTP_Flow**: The multi-step phone-number → OTP → set-password authentication sequence.
- **Weather_Widget**: A UI component on the home screen that displays current weather conditions for the farmer's location.
- **NotificationAlert**: The existing banner/alert component already rendered above the Quick Actions grid on the home screen.
- **Programme**: An event or activity organised by field agents or admins (maps to the existing `events` table).
- **Field_Agent**: A platform user who logs programmes, registers farmers, and manages field activities via the Mobile_Admin screens.
- **RBAC**: Role-Based Access Control — in this system, roles are name-only labels with no permission differences between them.
- **Super_Admin**: Admin role label. Has the same access as all other roles; additionally can assign/change roles for other accounts.
- **Admin**: Admin role label. Identical access to all other roles.
- **Sub_Admin**: Admin role label. Identical access to all other roles.
- **Volunteer**: Admin role label. Identical access to all other roles.
- **KeyboardAwareScrollView**: A custom React Native wrapper component that ensures form fields remain visible above the software keyboard on both iOS and Android.
- **Offline_Queue**: A local AsyncStorage-backed cache that stores form submissions made while the device has no network connectivity, and auto-uploads them when connectivity and server health are confirmed.
- **Programme_Gallery**: A modal UI in the Admin_Dashboard that displays photos and videos uploaded to a specific programme.
- **Cloudinary**: The third-party file storage service used for photo and video uploads.
- **AddressDropdowns**: The existing React Native component used for state/district/city dropdown selection in profile and location screens.

---

## Requirements

### Requirement 1: Weather Widget on Home Dashboard

**User Story:** As a farmer, I want to see current weather information on my home screen, so that I can make informed decisions about my farming activities for the day.

#### Acceptance Criteria

1. WHEN the Home screen loads, THE Farmer_App SHALL fetch current weather data for the farmer's stored district or GPS location and display it in a Weather_Widget below the Quick Actions grid (the 4-button grid).
2. WHEN weather data is successfully retrieved, THE Weather_Widget SHALL display at minimum: current temperature (°C), weather condition label (e.g., "Sunny", "Rainy"), and a representative weather icon.
3. WHEN the farmer's location is not available, THE Weather_Widget SHALL display weather for a default region (Uttar Pradesh) rather than showing an error state.
4. IF the weather API call fails, THEN THE Weather_Widget SHALL display a graceful fallback state with a retry option, without crashing the home screen.
5. WHERE the device language is set to Hindi, THE Weather_Widget SHALL display condition labels in Hindi.

---

### Requirement 2: "Programme Happening Today" Section on Home Dashboard

**User Story:** As a farmer, I want to see today's programmes on my home screen, so that I can quickly find and attend events relevant to me.

#### Acceptance Criteria

1. WHEN the Home screen loads, THE Farmer_App SHALL fetch events from the Backend whose `event_date` matches the current calendar date and display them in a "Programme Happening Today" section below the Schemes/Popular Schemes section.
2. WHEN one or more events are scheduled for today, THE Farmer_App SHALL render each event as a tappable card showing the event title, time, and location.
3. WHEN a farmer taps an event card, THE Farmer_App SHALL navigate to the existing event-details screen for that event.
4. WHEN no events are scheduled for today, THE Farmer_App SHALL display a "No programmes today" placeholder message instead of an empty section.
5. IF the events API call fails, THEN THE Farmer_App SHALL display an error message within the section without affecting other home screen sections.

---

### Requirement 3: NotificationAlert — Enhanced Latest Updates Display

**User Story:** As a farmer, I want to see recent announcements on my home screen in a clear, readable format, so that I stay informed about platform news without navigating away.

#### Acceptance Criteria

1. THE Farmer_App SHALL reformat the existing NotificationAlert component to stack up to 3 notification items vertically rather than showing a single item.
2. WHEN the Home screen loads, THE Farmer_App SHALL populate the NotificationAlert with the three most recent notifications for the authenticated farmer.
3. THE NotificationAlert SHALL render each item showing the notification title, a truncated description (maximum 2 lines), and a relative timestamp (e.g., "2 hours ago").
4. WHEN a farmer taps a "View All" control in the NotificationAlert, THE Farmer_App SHALL navigate to the existing `/notifications` screen.
5. WHEN there are no notifications, THE Farmer_App SHALL hide the NotificationAlert entirely rather than showing an empty state.

---

### Requirement 4: Field Agent Access via Mobile Admin

**User Story:** As a field agent, I want to access field-agent features through the existing mobile admin section, so that I can log programmes and manage farmers from my phone.

#### Acceptance Criteria

1. THE Farmer_App SHALL allow field agents to log in via the existing admin login screen (`/(auth)/admin-login`) using email and password credentials.
2. WHEN a field agent submits valid credentials, THE Auth_Service SHALL return a JWT containing the account's role label (`super_admin`, `admin`, `sub_admin`, or `volunteer`).
3. WHEN the JWT is valid, THE Farmer_App SHALL route the user to the Mobile_Admin screens (`/(admin)`) regardless of which role label is present.
4. THE Mobile_Admin screens SHALL be accessible to all four role labels with identical functionality — no screens or actions SHALL be hidden based on role.
5. IF a field agent submits invalid credentials, THEN THE Auth_Service SHALL return a 401 response and THE Farmer_App SHALL display a descriptive error message.

---

### Requirement 5: Admin Dashboard — Programme Logging with Media Upload

**User Story:** As a field agent, I want to log a programme with photos, videos, and outcome notes from the admin dashboard's Events page, so that I can maintain an accurate record of field activities.

#### Acceptance Criteria

1. WHEN a field agent opens the create-event or edit-event form in the Admin_Dashboard, THE Admin_Dashboard SHALL provide a rich-text outcome field supporting bold, italic, and bullet-list formatting.
2. THE Admin_Dashboard SHALL allow attaching between 1 and 10 photos per programme by selecting files from the local machine.
3. THE Admin_Dashboard SHALL allow attaching between 0 and 2 videos per programme, each with a maximum file size of 200 MB.
4. WHEN media files are attached, THE Admin_Dashboard SHALL upload them to Cloudinary and store the resulting URLs with the programme record on the Backend.
5. WHEN a field agent searches for a farmer by name or mobile number in the event form, THE Admin_Dashboard SHALL display matching farmers from the Backend and allow adding them as participants.
6. IF a photo or video upload fails, THEN THE Admin_Dashboard SHALL display a per-file error indicator and allow the field agent to retry the failed upload without re-uploading successful files.

---

### Requirement 6: Mobile Admin — Offline Caching and Auto-Upload

**User Story:** As a field agent working in areas with poor connectivity, I want my programme and registration forms to save locally when submitted, so that data is not lost and syncs automatically when connectivity is restored.

#### Acceptance Criteria

1. WHEN a field agent submits a create-event or mark-attendance form in the Mobile_Admin, THE Farmer_App SHALL save the form data to Android local cache using AsyncStorage as a checkpoint.
2. WHILE the device has network connectivity and the Backend is reachable, THE Farmer_App SHALL automatically attempt to upload any cached form data after a delay of 6 to 12 hours from the time it was saved.
3. THE Farmer_App SHALL display a visible indicator (e.g., badge count or banner) showing the number of pending cached submissions awaiting upload.
4. WHEN a cached submission is successfully uploaded, THE Farmer_App SHALL remove it from the local cache and update the indicator count.
5. IF a cached submission fails to upload, THEN THE Farmer_App SHALL retain the entry in the local cache and notify the field agent of the failure with a retry option.
6. THE Farmer_App SHALL use `@react-native-community/netinfo` to verify connectivity before attempting auto-upload.

---

### Requirement 7: Mobile Admin — Add Beneficiary (Farmer Registration on Behalf)

**User Story:** As a field agent, I want to register a new farmer from my phone using the same "Add Beneficiary" flow available on the web dashboard, so that farmers without smartphones can still be enrolled in the platform.

#### Acceptance Criteria

1. THE Mobile_Admin SHALL provide an "Add Beneficiary" screen that presents the same multi-step registration form available in the Admin_Dashboard (personal details, land details, livestock details, location).
2. WHEN a field agent submits the completed registration form, THE Backend SHALL create a new user record attributed to the field agent's account ID as the registering agent via a `registered_by` field.
3. WHEN a farmer with the submitted mobile number already exists, THE Backend SHALL return a 409 conflict response and THE Mobile_Admin SHALL display a message indicating the farmer is already registered.
4. THE Mobile_Admin SHALL allow the field agent to search for an existing farmer before starting registration to avoid duplicates.

---

### Requirement 8: Admin Dashboard — Appointment Management Page

**User Story:** As an admin, I want a dedicated appointments page in the dashboard, so that I can view, confirm, cancel, and complete farmer appointments efficiently.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL provide an Appointments page accessible from the sidebar navigation that lists all appointments with farmer name, professional name, date, time, and current status.
2. WHEN an admin selects an appointment, THE Admin_Dashboard SHALL display appointment details and action buttons for Confirm, Cancel, and Complete.
3. WHEN an admin clicks Confirm, Cancel, or Complete, THE Admin_Dashboard SHALL call the existing `PATCH /appointments/:id/status` endpoint and update the displayed status without a full page reload.
4. THE Admin_Dashboard SHALL support filtering appointments by status (Pending, Confirmed, Cancelled, Completed) and by date range.
5. THE Admin_Dashboard SHALL display appointments in paginated form with a configurable page size of 20 or 50 records.

---

### Requirement 9: Admin Dashboard — Farmer Data CSV Export

**User Story:** As an admin, I want to export the beneficiaries table to CSV, so that I can analyse farmer data in external tools.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL provide an "Export CSV" button on the Beneficiaries page that triggers a download of all visible farmer records as a CSV file.
2. WHEN the export is triggered, THE Admin_Dashboard SHALL apply any active search or filter criteria so that only the currently filtered records are exported.
3. THE exported CSV SHALL include at minimum: farmer name, mobile number, district, state, village, land area, livestock count, registration date, and verification status.
4. WHEN the export contains more than 1000 records, THE Admin_Dashboard SHALL show a progress indicator and stream the download rather than blocking the UI.
5. IF the export request fails, THEN THE Admin_Dashboard SHALL display an error notification and allow the admin to retry.

---

### Requirement 10: Admin Dashboard — Programme Gallery

**User Story:** As an admin, I want to view photos and videos uploaded to a programme in a gallery modal, so that I can review field activity evidence without leaving the dashboard.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display a "View Gallery" button on each programme/event row in the Events page.
2. WHEN an admin clicks "View Gallery", THE Admin_Dashboard SHALL open a modal displaying all photos and videos associated with that programme, retrieved from the Backend.
3. THE Programme_Gallery SHALL render photos as a responsive grid and videos as playable inline players.
4. WHEN an admin clicks a photo thumbnail, THE Programme_Gallery SHALL display the full-resolution image in a lightbox overlay.
5. WHEN a programme has no media attachments, THE Programme_Gallery SHALL display a "No media uploaded" message instead of an empty grid.
6. THE media displayed in the Programme_Gallery SHALL be the photos and videos uploaded by field agents via the Mobile_Admin create-event flow.

---

### Requirement 11: Admin Dashboard — Field Agent User Management (RBAC)

**User Story:** As a Super Admin, I want to create, edit, and deactivate admin/field agent accounts and assign role labels from the dashboard, so that I can manage who has access to the platform.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL provide a User Management page accessible from the sidebar that lists all admin accounts with their name, email, role label, status (Active/Inactive), and last login date.
2. WHEN a Super Admin submits the "Create User" form with name, email, password, and a selected role label, THE Backend SHALL create a new admin account with the specified role and return the created record.
3. WHEN a Super Admin edits an account's name, email, or role label, THE Backend SHALL update the record and return the updated data.
4. WHEN a Super Admin deactivates an account, THE Backend SHALL set `is_active = false` and THE Auth_Service SHALL reject subsequent login attempts from that account with a 403 response.
5. THE Admin_Dashboard SHALL allow assigning any of the four role labels (`super_admin`, `admin`, `sub_admin`, `volunteer`) to any account from the User Management page.
6. THE role label SHALL be displayed as a readable badge next to each account in the user list.

---

### Requirement 12: RBAC — Four Role Labels

**User Story:** As a Super Admin, I want admin accounts to carry one of four role labels, so that I can identify team members' roles at a glance without restricting their access.

#### Acceptance Criteria

1. THE Backend SHALL store a `role` field on every admin account in the `admins` table with one of four values: `super_admin`, `admin`, `sub_admin`, or `volunteer`.
2. THE Auth_Service SHALL include the account's `role` value in the JWT payload on login so that the Admin_Dashboard can display the role label without an additional API call.
3. THE Admin_Dashboard SHALL display the role label in the UI (e.g., in the user profile header and the user management list) for all authenticated admin sessions.
4. WHEN a Super Admin assigns or changes a role on an account via the User Management page, THE Backend SHALL update the `role` column on the `admins` table.
5. THE Admin_Dashboard SHALL NOT hide, disable, or gate any pages or actions based on the role value — all four roles have identical access to all features.
6. THE Backend SHALL NOT return 403 responses based on role value alone — role is a label only and does not restrict API access.

---

### Requirement 13: KeyboardAwareScrollView Component

**User Story:** As a developer, I want a reusable KeyboardAwareScrollView component applied to all form screens, so that every form field remains visible above the software keyboard on both iOS and Android.

#### Acceptance Criteria

1. THE KeyboardAwareScrollView SHALL be a drop-in wrapper component that accepts the same props as React Native's `ScrollView` and renders its children inside a scroll container.
2. WHEN a `TextInput` inside THE KeyboardAwareScrollView receives focus on Android, THE KeyboardAwareScrollView SHALL scroll the view so that the focused input is visible above the keyboard within 300ms of the keyboard appearing.
3. WHEN a `TextInput` inside THE KeyboardAwareScrollView receives focus on iOS, THE KeyboardAwareScrollView SHALL preserve the existing iOS keyboard-avoidance behaviour without regression.
4. WHEN the keyboard is dismissed, THE KeyboardAwareScrollView SHALL restore the scroll position to its pre-focus state.
5. THE KeyboardAwareScrollView SHALL not introduce additional re-renders on screens where no `TextInput` is focused.
6. THE KeyboardAwareScrollView SHALL be implemented using React Native's `Keyboard` API, `ScrollView`, and `Animated`, or by wrapping `react-native-keyboard-aware-scroll-view`, without modifying any existing screen components.
7. THE KeyboardAwareScrollView SHALL be applied to ALL form screens in the app, covering every field type including text inputs, dropdowns, multi-selects, and date pickers.

---

### Requirement 14: Bug Fix — Forgot-Password OTP Flow

**User Story:** As a farmer who forgot their password, I want the OTP verification step to redirect me to the password-reset screen (not log me in), so that I can set a new password before accessing the app.

#### Acceptance Criteria

1. WHEN OTP verification succeeds and `mode === "forgot-password"`, THE Farmer_App SHALL navigate to `/(auth)/set-password` with params `{ mode: "reset", phoneNumber }` and SHALL NOT issue or store an authentication token.
2. WHEN the set-password screen is presented with `mode === "reset"` and the farmer saves a new password successfully, THE Farmer_App SHALL navigate to `/(auth)/phone-input` with params `{ mode: "login" }`.
3. THE Farmer_App SHALL NOT navigate to `/(tab)` or any authenticated route at any point during the forgot-password flow.
4. WHEN the set-password screen is presented with `mode === "signup"` (new user), THE Farmer_App SHALL continue to navigate to `/(auth)/personal-details` as before, preserving existing signup behaviour.
5. THE Auth_Service SHALL NOT create or return a session JWT during the forgot-password OTP verification step; the JWT SHALL only be issued after the farmer completes a subsequent login.

---

### Requirement 15: Bug Fix — Location Dropdown Pre-Population on Profile Edit

**User Story:** As a farmer editing my profile, I want my previously saved state and district to appear pre-selected in the location dropdowns, so that I can see my current values and make changes without re-selecting everything from scratch.

#### Acceptance Criteria

1. WHEN the profile or location-edit screen loads for a farmer who has a saved state and district, THE Farmer_App SHALL fetch the farmer's stored state and district values from the Backend and pass them as initial values to the AddressDropdowns component.
2. THE AddressDropdowns component SHALL render with the saved state and district values pre-selected in their respective dropdown fields when initial values are provided.
3. WHEN the farmer's saved state is pre-populated, THE AddressDropdowns component SHALL automatically load the corresponding district list so the district dropdown is also populated correctly.
4. IF the farmer has no previously saved state or district, THEN THE AddressDropdowns component SHALL render with empty dropdowns as it does today.
5. THE pre-population logic SHALL be implemented entirely on the client side — no backend changes are required, as the data already exists in the user profile response.
