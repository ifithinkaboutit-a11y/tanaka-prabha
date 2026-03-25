# Bugfix Requirements Document

## Introduction

This document captures requirements for fixing 15 reported bugs and UX issues in the React Native / Expo mobile app (Expo Router, React Native). The issues span API routing, map/GPS integration, address auto-fill, land/livestock detail screens, scheme search, duplicate phone registration, admin CMS edit/delete, CMS navigation consolidation, attendance UX, event GPS navigation, app stability on notification send, and auth stack layout/UX. All fixes must preserve existing correct behavior for non-affected flows.

---

## Bug Analysis

### Current Behavior (Defect)

**Bug 1 — Scheme Interest API: Route Not Found**
1.1 WHEN a user taps to express interest in a scheme THEN the system returns a "not found" error because the `/api/scheme/:id/interest` route is missing from the server scheme router

**Bug 2 — Location Picker: GPS Unavailable Message**
1.2 WHEN a user opens the location picker from the profile page and GPS cannot be acquired THEN the system shows "GPS unavailable, search or drag to your location" but the map tiles fail to load and display a referrer error ("Access blocked: referrer is required by tile usage policy of OpenStreetMap volunteer-run servers") when the user zooms

**Bug 3 — Personal Details: Address Not Auto-Updating from Map**
1.3 WHEN a user selects a location on the map and returns to the Personal Details screen THEN the address fields (state, district, tehsil, village, pinCode) are not immediately reflected in the form — the user must tap an additional button to apply the changes, and the reverse geocoding fills mismatched or incorrect data

**Bug 4 — Land Details: Seasonal Crop Selector Does Not Show Existing Crops**
1.4 WHEN a user opens the land detail section to edit seasonal crops (Rabi, Kharif, Zaid) THEN the crop selector does not pre-populate with the crops the user already grows, and there is no way to remove a previously selected crop

**Bug 5 — Land Crop Summary Card: Crops Not Pre-filled in Selector**
1.5 WHEN a user opens the crop selector from the land crop summary card THEN the Rabi/Kharif/Zaid crops already saved to the user's profile are not pre-filled inside the selector

**Bug 6 — Livestock Icons: Poor Quality**
1.6 WHEN a user views the livestock detail section THEN the icons used to represent livestock types (cow, buffalo, goat, sheep, pig, poultry) are poor quality or render incorrectly, degrading the visual experience

**Bug 7 — Livestock Translation: Key Shown Instead of Value**
1.7 WHEN a user views the livestock detail section THEN the labels for pig and poultry display the raw translation key string (e.g. "livestock details peg livestock details poultry") instead of the translated human-readable value ("Pig" / "Poultry")

**Bug 8 — Schemes Page: Search Bar Not Working**
1.8 WHEN a user types in the search bar on the Schemes page THEN the scheme list is not filtered — the `searchQuery` state is updated but never used to filter the displayed schemes

**Bug 9 — Registration: OTP Sent for Already-Registered Phone Number**
1.9 WHEN a user attempts to sign up with a phone number that is already registered THEN the system sends an OTP via WhatsApp instead of blocking the request and showing an inline alert directing the user to log in

**Bug 10 — Admin CMS: No Edit or Delete for Existing Content**
1.10 WHEN an admin views the list of existing banners, schemes, or professionals in the CMS section THEN there is no option to edit or delete any existing item — only creation of new items is supported

**Bug 11 — Admin CMS: Tab Navigation Not Consolidated**
1.11 WHEN an admin navigates to the CMS section from the admin dashboard THEN the three CMS items (Manage Banners, Manage Schemes, Manage Professionals) appear as separate navigation entries, and clicking any one of them does not allow switching between the other tabs without going back to the dashboard

**Bug 12 — View Attendance Record: Poor UX**
1.12 WHEN an admin opens the View Attendance Record section THEN the layout and interaction patterns are unintuitive, making it difficult to find and review attendance data

**Bug 13 — Create Event: GPS Location Button Navigates to Wrong Page**
1.13 WHEN an admin taps "Pick Location" (GPS location) in the Create Event screen THEN the app navigates to the main admin panel page instead of opening the map location picker

**Bug 14 — App Reloads When Notification Is Sent**
1.14 WHEN an admin sends a notification from the admin dashboard on mobile THEN the app unexpectedly reloads/refreshes, disrupting the admin's workflow

**Bug 15 — Auth Stack: Video Header and Keyboard UX**
1.15 WHEN a user is on any screen in the authentication and onboarding stack (phone-input, otp-input, set-password, personal-details, land-details, livestock-details) THEN (a) the video/animation playing at the top of the screen takes up significant vertical space, pushing form fields down and making the layout feel cramped, and (b) when the keyboard opens on form screens, input fields are obscured because the KeyboardAvoidingView does not correctly push content up — the user cannot see what they are typing without manually scrolling

---

### Expected Behavior (Correct)

**Bug 1 — Scheme Interest API**
2.1 WHEN a user taps to express interest in a scheme THEN the system SHALL register the interest via a POST to `/api/schemes/:id/interest` (note: plural "schemes") and return the updated interest count without a "not found" error

**Bug 2 — Location Picker: GPS Unavailable**
2.2 WHEN GPS is unavailable and the location picker opens THEN the system SHALL display the map centered on India as a fallback, load OSM tiles without a referrer error, and show a clear "GPS unavailable" banner with a search-or-drag instruction — tile loading SHALL work regardless of GPS state

**Bug 3 — Personal Details: Address Auto-Update**
2.3 WHEN a user confirms a location on the map and returns to the Personal Details screen THEN the system SHALL immediately and automatically populate the address fields (state, district, tehsil, village, pinCode) from the map selection without requiring any additional user action, and the geocoded values SHALL match the selected map location

**Bug 4 — Land Details: Seasonal Crop Selector Pre-population**
2.4 WHEN a user opens the land detail section THEN the system SHALL pre-populate each seasonal crop selector (Rabi, Kharif, Zaid) with the crops the user already grows, and SHALL allow the user to remove or change a selected crop

**Bug 5 — Land Crop Summary Card: Pre-fill in Selector**
2.5 WHEN a user opens the crop selector from the land crop summary card THEN the system SHALL pre-fill the selector with the Rabi/Kharif/Zaid crops already saved in the user's profile

**Bug 6 — Livestock Icons**
2.6 WHEN a user views the livestock detail section THEN the system SHALL display clear, recognizable representations for each livestock type — either by replacing poor-quality icons with emoji or high-quality icon alternatives, or by removing icons and using text-only labels

**Bug 7 — Livestock Translation**
2.7 WHEN a user views the livestock detail section THEN the system SHALL display the human-readable translated label for each livestock type (e.g. "Pig", "Poultry") — the translation keys `livestockDetails.pig` and `livestockDetails.poultry` SHALL exist in all i18n files and SHALL resolve to their correct values

**Bug 8 — Schemes Search Bar**
2.8 WHEN a user types in the search bar on the Schemes page THEN the system SHALL filter the displayed scheme list in real time to show only schemes whose title or category matches the search query

**Bug 9 — Duplicate Phone Registration**
2.9 WHEN a user attempts to sign up with an already-registered phone number THEN the system SHALL NOT send an OTP, and SHALL display an inline alert or banner informing the user that the number is already registered and directing them to log in instead

**Bug 10 — Admin CMS: Edit and Delete**
2.10 WHEN an admin views the list of existing banners, schemes, or professionals in the CMS section THEN the system SHALL provide edit and delete actions for each item, allowing the admin to update or remove existing content

**Bug 11 — Admin CMS: Consolidated Tab Navigation**
2.11 WHEN an admin navigates to the CMS section THEN the system SHALL present a single unified CMS screen with tab switching between Banners, Schemes, and Professionals — navigating to any CMS entry point SHALL open this unified screen

**Bug 12 — View Attendance Record: UX Improvement**
2.12 WHEN an admin opens the View Attendance Record section THEN the system SHALL present attendance data in a clear, scannable layout with intuitive filtering (by event or date), making it easy to find and review records

**Bug 13 — Create Event: GPS Location Navigation**
2.13 WHEN an admin taps the GPS location picker in the Create Event screen THEN the system SHALL navigate to the map location picker screen (not the admin panel), and upon confirmation SHALL return the selected coordinates to the Create Event screen

**Bug 14 — App Reload on Notification Send**
2.14 WHEN an admin sends a notification from the admin dashboard THEN the system SHALL complete the send operation without triggering an app reload or navigation reset

**Bug 15 — Auth Stack: Video Header and Keyboard UX**
2.15 WHEN a user is on any screen in the authentication and onboarding stack THEN (a) the video/animation header SHALL be removed and replaced with a clean full-screen form layout so the form content occupies the full screen height, and (b) every screen with text input fields SHALL be wrapped in a correctly configured KeyboardAvoidingView (behavior "padding" on iOS, "height" on Android) so that the keyboard never obscures any input field — the active field SHALL always remain visible above the keyboard without requiring manual scrolling

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user successfully registers with a new phone number THEN the system SHALL CONTINUE TO send an OTP and proceed with the registration flow

3.2 WHEN a user logs in with an existing phone number and password THEN the system SHALL CONTINUE TO authenticate and navigate to the main tab screen

3.3 WHEN a user opens the location picker during onboarding (not from profile) THEN the system SHALL CONTINUE TO save location data to the onboarding store and navigate to the land details screen

3.4 WHEN a user saves personal details without using the map THEN the system SHALL CONTINUE TO save the manually entered address fields without modification

3.5 WHEN a user saves land details with a valid land area and crop selection THEN the system SHALL CONTINUE TO persist the data and navigate back

3.6 WHEN a user saves livestock details with valid counts THEN the system SHALL CONTINUE TO persist the data and navigate back

3.7 WHEN a user views the Schemes page without typing in the search bar THEN the system SHALL CONTINUE TO display all schemes, banners, and categories as before

3.8 WHEN an admin creates a new banner, scheme, or professional via the CMS THEN the system SHALL CONTINUE TO save the new item and refresh the list

3.9 WHEN an admin creates an event without a GPS location THEN the system SHALL CONTINUE TO allow event creation with the GPS location field left empty

3.10 WHEN a user views the Home page or Program page search bars THEN the system SHALL CONTINUE TO navigate to the global search screen as before

3.11 WHEN an admin marks attendance for an event THEN the system SHALL CONTINUE TO record attendance correctly

3.12 WHEN a user views scheme details for a scheme they have already expressed interest in THEN the system SHALL CONTINUE TO show the interest state correctly

3.13 WHEN a user completes the auth/onboarding flow THEN the system SHALL CONTINUE TO navigate to the correct next screen (location-picker after personal-details, land-details after location-picker, etc.) without any regression in flow logic
