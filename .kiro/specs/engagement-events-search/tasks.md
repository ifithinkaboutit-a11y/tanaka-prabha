# Implementation Plan: Engagement Events Search

## Overview

Incremental implementation of five feature areas: filter/sort UI, event trainer & GPS fields, QR attendance scanning, duplicate phone handling, and the Interested button. Each task builds on the previous and wires into the existing React Native (Expo) + TypeScript codebase.

## Tasks

- [x] 1. Filter & Sort — Category Listing Sort Bar
  - [x] 1.1 Extend `category-listing.tsx` sort state and Sort_Bar UI
    - Replace the existing toggle button with a three-option Sort_Bar: "Name (A–Z)", "Newest First", "Most Interested"
    - Highlight the active sort option visually
    - Wire sort state to the `filteredSchemes` `useMemo` — add `interest_count` sort branch
    - Re-render list on sort change without re-fetch
    - _Requirements: 1.1.1, 1.1.2, 1.1.3, 1.1.4, 1.1.5, 1.1.6_

  - [x] 1.2 Write unit tests for sort logic
    - Test each of the three sort branches with mock scheme data
    - _Requirements: 1.1.2, 1.1.3, 1.1.4_

- [x] 2. Filter & Sort — Category Listing Filter Panel
  - [x] 2.1 Build `FilterPanel` bottom-sheet component
    - Create `Client/src/components/molecules/FilterPanel.tsx`
    - Multi-select checkboxes for five categories; type toggle (Scheme / Program / Both)
    - "Apply" and "Clear Filters" actions; expose `onApply(filters)` and `onClear()` callbacks
    - _Requirements: 1.2.1, 1.2.2, 1.2.3_

  - [x] 2.2 Wire `FilterPanel` into `category-listing.tsx`
    - Add `activeFilters` state; open panel on "Filters" tap
    - Apply filter logic in `filteredSchemes` memo (AND across selected categories + type)
    - Show "No results found" empty state with "Clear Filters" action when zero matches
    - Show active-filter badge count on the "Filters" button
    - _Requirements: 1.2.4, 1.2.5, 1.2.6, 1.2.7_

  - [x] 2.3 Write unit tests for filter logic
    - Test category multi-select, type toggle, combined filters, and zero-result state
    - _Requirements: 1.2.4, 1.2.5, 1.2.6_

- [x] 3. Filter & Sort — URL Parameter Persistence
  - [x] 3.1 Sync sort and filter state with URL query params in `category-listing.tsx`
    - On mount, read `sortBy`, `categories`, `typeFilter` from `useLocalSearchParams` and initialise state
    - On state change, call `router.setParams(...)` to update URL without full navigation
    - On "Clear Filters", remove `categories` and `typeFilter` params
    - _Requirements: 1.3.1, 1.3.2, 1.3.3, 1.3.4, 1.3.5_

- [x] 4. Filter & Sort — Global Search Type Filter
  - [x] 4.1 Add `typeFilter` to `useSearch` hook
    - Add `typeFilter` state (`"all" | "scheme" | "training" | "event"`) and `setTypeFilter` setter
    - Apply type filter in `searchResults` memo after relevance scoring
    - Reset `typeFilter` to `"all"` when `clearSearch` is called
    - _Requirements: 1.4.5, 1.4.6_

  - [x] 4.2 Add type-filter chip row to `search.tsx`
    - Render horizontal chip row ("All", "Scheme", "Program", "Event") below the search input
    - Highlight active chip; call `setTypeFilter` on tap
    - Show "No results found" empty state when active filter yields zero results for a non-empty query
    - _Requirements: 1.4.1, 1.4.2, 1.4.3, 1.4.4_

  - [x] 4.3 Write unit tests for `useSearch` type filter
    - Test that each filter value correctly narrows results
    - Test that `clearSearch` resets the filter to "all"
    - _Requirements: 1.4.5, 1.4.6_

- [x] 5. Checkpoint — Ensure all filter/sort tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Event Schema — Trainer and Contact Fields
  - [x] 6.1 Extend `ApiEvent` interface in `apiService.ts`
    - Add optional fields: `master_trainer_name`, `master_trainer_phone`, `trainer_name`, `trainer_phone`, `contact_number`
    - _Requirements: 2.1.1_

  - [x] 6.2 Update mobile `event-details.tsx` to display trainer & contact fields
    - Render a "Trainer & Contact" section when any of the five fields are non-empty
    - Render `master_trainer_phone`, `trainer_phone`, and `contact_number` as tappable `Linking.openURL("tel:...")` links
    - _Requirements: 2.1.5, 2.1.6, 2.1.7_

  - [x] 6.3 Add trainer & contact inputs to mobile `create-event.tsx`
    - Add a "Trainer & Contact" section with five `FormInput` fields
    - Include the new fields in the event creation payload
    - _Requirements: 2.1.2_

- [x] 7. Event Schema — GPS Coordinates
  - [x] 7.1 Extend `ApiEvent` interface with GPS fields
    - Add optional `location_lat` and `location_lng` numeric fields to `ApiEvent`
    - _Requirements: 2.2.1_

  - [x] 7.2 Add "Get Directions" button to `event-details.tsx`
    - Show button only when both `location_lat` and `location_lng` are present
    - On tap, open `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` via `Linking.openURL`
    - _Requirements: 2.2.5, 2.2.6, 2.2.7_

  - [x] 7.3 Add "Pick Location" button to mobile `create-event.tsx`
    - Add a "Pick Location" button that navigates to the existing map picker screen
    - Write selected coordinates back into `location_lat` and `location_lng` form fields
    - _Requirements: 2.2.2_

- [x] 8. QR Attendance — Backend Token Endpoint
  - [x] 8.1 Add `POST /events/:id/qr-token` endpoint to the backend
    - Generate a signed JWT (or HMAC-SHA256 token) with 24-hour expiry using a server-side secret
    - Return `{ token, deepLink }` where `deepLink = "tanakprabha://attendance?eventId={id}&token={token}"`
    - _Requirements: 3.1.2, 3.1.6_

  - [x] 8.2 Add token validation to `POST /events/:id/attendance` backend endpoint
    - Verify the token signature and expiry; return 401 if invalid or expired
    - Return 409 if the user has already attended
    - _Requirements: 3.1.7, 3.2.7, 3.2.8_

  - [x] 8.3 Add `eventsApi.generateQrToken` and `eventsApi.submitAttendance` to `apiService.ts`
    - `generateQrToken(id)` → calls `POST /events/:id/qr-token`
    - `submitAttendance(id, token)` → calls `POST /events/:id/attendance` with token
    - _Requirements: 3.1.2, 3.2.5_

- [x] 9. QR Attendance — Dashboard QR Generation UI
  - [x] 9.1 Add "Generate QR Code" button and modal to the Dashboard event detail page
    - Button calls `generateQrToken`; renders the returned deep-link as a QR code image in a modal
    - Use a QR-code library (e.g., `qrcode`) to render the image client-side
    - Provide a "Download PNG" button that saves the image as `event-{id}-qr.png`
    - _Requirements: 3.1.1, 3.1.3, 3.1.4, 3.1.5_

- [x] 10. QR Attendance — Mobile Scan Screen
  - [x] 10.1 Create `Client/src/app/scan-attendance.tsx` (Scan_Screen)
    - Request camera permission on mount; show inline settings-redirect message if denied
    - Use `expo-camera` (or `expo-barcode-scanner`) to scan QR codes
    - Parse `tanakprabha://attendance?eventId=...&token=...` from scanned data
    - Call `eventsApi.submitAttendance`; show success screen with event name and "Done" button
    - Handle 401 and 409 error responses with the specified messages
    - _Requirements: 3.2.3, 3.2.4, 3.2.5, 3.2.6, 3.2.7, 3.2.8_

  - [x] 10.2 Add "Scan to Attend" button to `event-details.tsx`
    - Show button only when event status is "ongoing"
    - Navigate to `scan-attendance` screen on tap
    - _Requirements: 3.2.1, 3.2.2_

  - [x] 10.3 Configure deep-link fallback for non-app users
    - Add `tanakprabha://attendance` intent filter / universal link config in `app.json`
    - Add a web fallback URL that redirects to the Google Play Store listing
    - _Requirements: 3.2.9_

  - [x] 10.4 Write unit tests for QR scan flow
    - Test success path, 401 expired-token path, and 409 already-attended path
    - _Requirements: 3.2.6, 3.2.7, 3.2.8_

- [x] 11. Checkpoint — Ensure all event/QR tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Duplicate Phone Handling
  - [x] 12.1 Update `phone-input.tsx` to show inline duplicate-phone banner
    - Detect the duplicate-phone error code/message from the backend OTP response
    - Render an amber inline banner below the phone input (not an Alert dialog)
    - Banner text: "This number is already registered. Please log in instead."
    - Include "Log In" (navigates to `/(auth)/phone-input?mode=login`) and "Dismiss" buttons
    - Suppress OTP send and navigation to OTP screen when this error occurs
    - _Requirements: 4.1.1, 4.1.2, 4.1.3, 4.1.4, 4.1.5, 4.1.6, 4.1.7_

  - [x] 12.2 Write unit tests for duplicate phone banner
    - Test banner appears on duplicate error, "Log In" navigates correctly, "Dismiss" hides banner
    - _Requirements: 4.1.1, 4.1.4, 4.1.5, 4.1.6_

- [x] 13. Interested Button — API and AsyncStorage Layer
  - [x] 13.1 Add interest API methods to `apiService.ts`
    - `schemesApi.addInterest(id)` → `POST /schemes/:id/interest`
    - `schemesApi.removeInterest(id)` → `DELETE /schemes/:id/interest`
    - Both return `{ interest_count: number }`
    - _Requirements: 5.1.3, 5.1.4, 5.1.5, 5.1.6_

  - [x] 13.2 Create `useInterest` hook
    - Create `Client/src/hooks/useInterest.ts`
    - On mount, read persisted interest state from AsyncStorage key `interest:{id}`
    - Expose `isInterested`, `interestCount`, and `toggleInterest()` 
    - On toggle: optimistically update state, call API, update AsyncStorage; revert + show toast on failure
    - _Requirements: 5.1.3, 5.1.4, 5.1.5, 5.1.6, 5.1.7, 5.1.8, 5.1.10_

  - [x] 13.3 Write property test for `useInterest` toggle idempotency
    - **Property 1: Double-toggle returns to original state**
    - **Validates: Requirements 5.1.3, 5.1.5**

  - [x] 13.4 Write unit tests for `useInterest` optimistic revert
    - Test that a failed API call reverts `isInterested` and `interestCount` to pre-toggle values
    - _Requirements: 5.1.10_

- [x] 14. Interested Button — UI Integration
  - [x] 14.1 Add `InterestButton` atom component
    - Create `Client/src/components/atoms/InterestButton.tsx`
    - Renders filled/unfilled heart icon + count; accepts `isInterested`, `count`, `onToggle`, `loading` props
    - _Requirements: 5.1.1, 5.1.2_

  - [x] 14.2 Integrate `InterestButton` into `scheme-details` and `program-details` screens
    - Use `useInterest` hook; pass props to `InterestButton`
    - Initialise from AsyncStorage before API response arrives
    - _Requirements: 5.1.1, 5.1.2, 5.1.8_

  - [x] 14.3 Display `interest_count` on `SchemePreviewCard` in `category-listing.tsx`
    - Add `interestCount` prop to `SchemePreviewCard`; render count alongside each card
    - Pass `interest_count` from scheme data (extend `Scheme` interface if needed)
    - _Requirements: 5.1.9_

  - [x] 14.4 Write unit tests for `InterestButton`
    - Test filled/unfilled state rendering, count display, and onToggle callback
    - _Requirements: 5.1.1, 5.1.4, 5.1.6_

- [ ] 15. Final Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Backend tasks (8.1, 8.2) target the Node.js/Express API; all other tasks target the React Native client
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases
