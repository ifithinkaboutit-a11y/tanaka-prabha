# Requirements Document

## Introduction

This spec covers five related enhancements to the Tanakprabha agricultural extension service app (React Native / Expo mobile client) and its Next.js web dashboard. The areas are: (1) working filter and sort UI on the category-listing and global search screens; (2) new trainer, contact, and GPS coordinate fields on events; (3) QR-code-based attendance scanning; (4) graceful duplicate phone number handling during registration; and (5) an "Interested" button with a live count on scheme and program detail screens.

## Glossary

- **App**: The React Native (Expo) mobile application used by farmers and admins.
- **Dashboard**: The Next.js web dashboard used by administrators.
- **Category_Listing**: The `category-listing.tsx` screen that shows a "see all" list of schemes or programs for a given category.
- **Search_Screen**: The `search.tsx` screen that provides global full-text search across schemes, programs, and events.
- **Sort_Bar**: The bottom bar on Category_Listing that controls the active sort order.
- **Filter_Panel**: The slide-up panel on Category_Listing that allows multi-select filtering by category and type.
- **useSearch**: The `useSearch` custom hook that manages search state, debouncing, and result computation.
- **Event**: A scheduled agricultural event with fields stored in the backend events table.
- **Master_Trainer**: The senior trainer responsible for an event (optional).
- **Trainer**: The regular trainer assigned to an event (optional).
- **QR_Code**: A machine-readable image encoding a deep-link URL used for attendance.
- **Signed_Token**: A short-lived HMAC-SHA256 or JWT token embedded in the QR deep-link to prevent forgery.
- **Scan_Screen**: A new mobile screen that uses the device camera to scan a QR code for attendance.
- **Interest_Button**: A heart-icon button on scheme and program detail screens that records user interest.
- **Interest_Count**: The total number of users who have expressed interest in a scheme or program.
- **AsyncStorage**: The React Native key-value store used to persist client-side state across app restarts.
- **OTP**: One-time password sent via SMS for phone number verification.
- **Phone_Input**: The `phone-input.tsx` screen where users enter their mobile number to register or log in.

---

## Requirements

### Requirement 1.1: Category Listing Sort Bar

**User Story:** As a farmer, I want to sort the list of schemes and programs by name, newest first, or most interested, so that I can find the most relevant items quickly.

#### Acceptance Criteria

1. THE Category_Listing SHALL display a Sort_Bar with three options: "Name (A–Z)", "Newest First", and "Most Interested".
2. WHEN the user selects "Name (A–Z)", THE Category_Listing SHALL sort the displayed items alphabetically ascending by title.
3. WHEN the user selects "Newest First", THE Category_Listing SHALL sort the displayed items by creation date descending.
4. WHEN the user selects "Most Interested", THE Category_Listing SHALL sort the displayed items by interest count descending.
5. THE Category_Listing SHALL reflect the active sort option visually (highlighted/selected state) in the Sort_Bar.
6. WHEN the sort option changes, THE Category_Listing SHALL re-render the list without requiring a page reload or re-fetch.

---

### Requirement 1.2: Category Listing Filter Panel

**User Story:** As a farmer, I want to filter the category listing by category and by type (scheme vs. program), so that I only see items relevant to my needs.

#### Acceptance Criteria

1. WHEN the user taps the "Filters" button in the Sort_Bar, THE Category_Listing SHALL display a Filter_Panel as a bottom sheet.
2. THE Filter_Panel SHALL provide multi-select checkboxes for category: "Financial Support", "Agricultural Development", "Soil Management", "Crop Insurance", and "Training".
3. THE Filter_Panel SHALL provide a type toggle to filter by "Scheme", "Program", or both.
4. WHEN the user applies filters, THE Category_Listing SHALL display only items matching all selected filter criteria.
5. WHEN no filters are active, THE Category_Listing SHALL display all items for the current category.
6. WHEN active filters produce zero matching items, THE Category_Listing SHALL display a "No results found" empty state with a "Clear Filters" action.
7. THE Category_Listing SHALL show a badge on the "Filters" button indicating the number of active filters when filters are applied.

---

### Requirement 1.3: Filter and Sort State in URL Parameters

**User Story:** As a farmer, I want filter and sort selections to be preserved in the URL, so that I can share or deep-link to a pre-filtered view.

#### Acceptance Criteria

1. WHEN the user changes the sort option, THE Category_Listing SHALL update the URL query parameter `sortBy` to the selected value without triggering a full navigation.
2. WHEN the user applies category filters, THE Category_Listing SHALL update the URL query parameter `categories` to a comma-separated list of selected category values.
3. WHEN the user applies a type filter, THE Category_Listing SHALL update the URL query parameter `typeFilter` to the selected type value.
4. WHEN the Category_Listing screen mounts with `sortBy`, `categories`, or `typeFilter` query parameters present, THE Category_Listing SHALL initialise its sort and filter state from those parameters.
5. WHEN the user clears all filters, THE Category_Listing SHALL remove the `categories` and `typeFilter` query parameters from the URL.

---

### Requirement 1.4: Global Search Type Filter

**User Story:** As a farmer, I want to filter global search results by type (scheme, program, event), so that I can narrow down results to what I am looking for.

#### Acceptance Criteria

1. THE Search_Screen SHALL display a horizontal type-filter chip row below the search input with options: "All", "Scheme", "Program", "Event".
2. WHEN the user selects a type chip, THE Search_Screen SHALL display only search results matching that type.
3. WHEN "All" is selected, THE Search_Screen SHALL display results of all types.
4. WHEN the active type filter produces zero matching results for a non-empty query, THE Search_Screen SHALL display the "No results found" empty state.
5. THE useSearch hook SHALL expose a `typeFilter` state and a `setTypeFilter` setter that the Search_Screen uses to filter results client-side without re-fetching.
6. WHEN the user clears the search query, THE Search_Screen SHALL reset the type filter to "All".

---

### Requirement 2.1: Event Schema — Trainer and Contact Fields

**User Story:** As an admin, I want to record master trainer, trainer, and a general contact number for each event, so that participants know who to contact.

#### Acceptance Criteria

1. THE Event SHALL support the following optional fields: `master_trainer_name` (string), `master_trainer_phone` (string), `trainer_name` (string), `trainer_phone` (string), and `contact_number` (string).
2. THE mobile admin create-event form (create-event.tsx) SHALL include input fields for all five new fields under a "Trainer & Contact" section.
3. THE Dashboard event creation dialog SHALL include input fields for all five new fields.
4. THE Dashboard event detail/edit page SHALL display and allow editing of all five new fields.
5. THE mobile event-details screen SHALL display `master_trainer_name`, `master_trainer_phone`, `trainer_name`, `trainer_phone`, and `contact_number` when those fields are non-empty.
6. IF `master_trainer_phone` or `trainer_phone` is present, THEN THE mobile event-details screen SHALL render each as a tappable link that initiates a phone call via `Linking.openURL("tel:...")`.
7. IF `contact_number` is present, THEN THE mobile event-details screen SHALL render it as a tappable link that initiates a phone call.

---

### Requirement 2.2: Event Schema — GPS Coordinates

**User Story:** As an admin, I want to attach GPS coordinates to an event location, so that attendees can get turn-by-turn directions.

#### Acceptance Criteria

1. THE Event SHALL support two optional numeric fields: `location_lat` (latitude) and `location_lng` (longitude).
2. THE mobile admin create-event form SHALL include a "Pick Location" button that opens the existing map picker screen and writes the selected coordinates into `location_lat` and `location_lng`.
3. THE Dashboard event creation dialog SHALL include numeric input fields for `location_lat` and `location_lng`.
4. THE Dashboard event detail/edit page SHALL display and allow editing of `location_lat` and `location_lng`.
5. WHEN `location_lat` and `location_lng` are both present on an event, THE mobile event-details screen SHALL display a "Get Directions" button.
6. WHEN the user taps "Get Directions", THE App SHALL open Google Maps at the event coordinates using the URL scheme `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`.
7. IF `location_lat` or `location_lng` is absent, THEN THE mobile event-details screen SHALL NOT display the "Get Directions" button.

---

### Requirement 3.1: QR Code Generation (Web Dashboard)

**User Story:** As an admin, I want to generate a signed QR code for an event on the web dashboard, so that I can print or display it for attendees to scan.

#### Acceptance Criteria

1. THE Dashboard event detail page SHALL display a "Generate QR Code" button.
2. WHEN the admin clicks "Generate QR Code", THE Dashboard SHALL generate a Signed_Token for the event using HMAC-SHA256 or a signed JWT with a 24-hour expiry.
3. THE Dashboard SHALL encode the deep-link URL `tanakprabha://attendance?eventId={id}&token={Signed_Token}` into a QR_Code image.
4. THE Dashboard SHALL display the QR_Code in a modal dialog.
5. THE Dashboard modal SHALL provide a "Download PNG" button that downloads the QR_Code as a PNG file named `event-{id}-qr.png`.
6. THE Signed_Token SHALL be generated server-side or using a secret key not exposed to the client, so that it cannot be forged by an end user.
7. WHEN a Signed_Token has expired (older than 24 hours), THE backend SHALL reject attendance submissions using that token with a 401 response.

---

### Requirement 3.2: QR Code Attendance Scanning (Mobile App)

**User Story:** As a farmer attending an ongoing event, I want to scan a QR code with my phone to mark my attendance, so that I do not need to queue at a registration desk.

#### Acceptance Criteria

1. WHEN an event has status "ongoing", THE mobile event-details screen SHALL display a "Scan to Attend" button.
2. WHEN the user taps "Scan to Attend", THE App SHALL navigate to the Scan_Screen.
3. THE Scan_Screen SHALL request camera permission before activating the camera viewfinder.
4. IF camera permission is denied, THEN THE Scan_Screen SHALL display an inline message explaining that camera access is required and provide a button to open device settings.
5. WHEN the Scan_Screen successfully decodes a QR code containing a valid `tanakprabha://attendance` deep-link, THE App SHALL call `POST /events/:id/attendance` with the `token` from the URL.
6. WHEN the attendance API call succeeds, THE Scan_Screen SHALL display a success confirmation screen with the event name and a "Done" button that navigates back to event-details.
7. IF the attendance API call returns a 401 (invalid or expired token), THEN THE Scan_Screen SHALL display an error message: "This QR code has expired. Please ask the organiser for a new one."
8. IF the attendance API call returns a 409 (already attended), THEN THE Scan_Screen SHALL display a message: "Your attendance has already been recorded."
9. IF the user does not have the App installed and opens the QR deep-link in a browser, THEN THE deep-link SHALL redirect to the Google Play Store listing for the App.

---

### Requirement 4.1: Duplicate Phone Number Inline Error

**User Story:** As a new user, I want to see a clear inline message when my phone number is already registered, so that I know to log in instead of registering again.

#### Acceptance Criteria

1. WHEN the backend returns an error indicating the phone number is already registered during OTP send, THE Phone_Input screen SHALL display an inline banner below the phone input field instead of a generic Alert dialog.
2. THE inline banner SHALL contain the message: "This number is already registered. Please log in instead."
3. THE inline banner SHALL contain a "Log In" button and a "Dismiss" button.
4. WHEN the user taps "Log In", THE App SHALL navigate to `/(auth)/phone-input?mode=login`.
5. WHEN the user taps "Dismiss", THE App SHALL hide the inline banner and allow the user to edit the phone number.
6. IF the backend returns the duplicate phone error, THEN THE App SHALL NOT send an OTP and SHALL NOT navigate to the OTP input screen.
7. THE inline banner SHALL be visually distinct from the validation error row (e.g., amber/warning background) so the user can distinguish it from a format validation error.

---

### Requirement 5.1: Interested Button on Scheme and Program Details

**User Story:** As a farmer, I want to express interest in a scheme or program and see how many others are interested, so that I can gauge community engagement and revisit items I care about.

#### Acceptance Criteria

1. THE scheme-details screen SHALL display an Interest_Button showing a heart icon and the current Interest_Count (e.g., "♥ 42").
2. THE program-details screen SHALL display an Interest_Button showing a heart icon and the current Interest_Count.
3. WHEN the user taps the Interest_Button and has not previously expressed interest, THE App SHALL call `POST /schemes/:id/interest`.
4. WHEN the `POST /schemes/:id/interest` call succeeds, THE Interest_Button SHALL update to a filled/active heart icon and display the updated Interest_Count returned by the API.
5. WHEN the user taps the Interest_Button and has already expressed interest (active state), THE App SHALL call `DELETE /schemes/:id/interest`.
6. WHEN the `DELETE /schemes/:id/interest` call succeeds, THE Interest_Button SHALL update to an unfilled/inactive heart icon and display the updated Interest_Count returned by the API.
7. THE App SHALL persist the interest state for each scheme or program ID in AsyncStorage so that the button reflects the correct state after an app restart.
8. WHEN the scheme or program detail screen mounts, THE App SHALL read the persisted interest state from AsyncStorage and apply it to the Interest_Button before the API response arrives.
9. THE scheme and program listing cards in Category_Listing SHALL display the Interest_Count alongside each item.
10. IF the `POST` or `DELETE` interest API call fails, THEN THE App SHALL revert the Interest_Button to its previous state and display a brief toast error message.
