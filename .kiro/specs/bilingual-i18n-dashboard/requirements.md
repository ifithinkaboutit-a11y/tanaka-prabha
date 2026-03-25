# Requirements Document

## Introduction

This feature covers four tightly coupled areas of the TanakPrabha platform:

1. **Bilingual Content Authoring** — All admin-facing content creation forms (events, schemes, articles/announcements) must collect both English and Hindi versions of every user-facing text field. The web dashboard (`Server/dashboard/`) already has a `LocalizedContentEditor` component wired into `SchemeForm.jsx`; it must now be wired into the Events creation dialog (`Server/dashboard/src/app/(page)/events/page.jsx`) and any article/announcement forms. The mobile admin screen (`Client/src/app/(admin)/create-event.tsx`) currently only has English `TextInput` fields and must be extended with bilingual input for title, description, guidelines, and requirements.

2. **i18n Translation Coverage** — The mobile app's `Client/src/i18n/en.json` and `Client/src/i18n/hi.json` files are missing translation keys for features added in recent specs: Interested Button, QR Attendance, Trainer & Contact section, Get Directions, Filter & Sort controls, Duplicate Phone Banner, and Admin bilingual field labels. Every new key must exist in both locale files.

3. **Web Dashboard Analytics Page** — A new dedicated `/analytics` route in the web dashboard that consolidates all data visualisations: the existing user distribution heatmap (moved from the main dashboard), a new livestock heatmap with per-animal-type filtering, and summary KPI cards. The main dashboard home page is cleaned up by removing the heatmap card.

4. **Mobile Admin Beneficiaries Screen** — A new screen in the mobile admin app that lists all registered farmers with search, pull-to-refresh, and tap-through to a full farmer profile showing personal details, address, land parcels by season, and livestock breakdown.

---

## Glossary

- **LocalizedContentEditor**: The existing React component at `Server/dashboard/src/components/cms/LocalizedContentEditor.jsx` that renders a tabbed EN/HI editor with per-language completion badges.
- **Dashboard**: The Next.js admin web application located at `Server/dashboard/`.
- **Mobile Admin**: The Expo/React Native admin screens located under `Client/src/app/(admin)/`.
- **Mobile App**: The Expo/React Native end-user application under `Client/src/`.
- **en.json**: The English translation file at `Client/src/i18n/en.json`.
- **hi.json**: The Hindi translation file at `Client/src/i18n/hi.json`.
- **Localized Field**: A content field that has both an English value (e.g., `title`) and a Hindi value (e.g., `title_hi`) stored in the backend.
- **Completion Percentage**: The ratio of non-empty localized fields to total localized fields for a given language, expressed as a percentage rounded to the nearest integer.
- **BilingualEventForm**: The event creation/editing form in the Dashboard after this feature is implemented, which uses `LocalizedContentEditor` for all user-facing text fields.
- **BilingualMobileForm**: The `create-event.tsx` mobile admin screen after this feature is implemented, which collects both English and Hindi values for title, description, guidelines, and requirements.
- **Translation Key**: A dot-notation string (e.g., `events.trainerContact`) used by the `useTranslation` hook to look up a locale string in `en.json` or `hi.json`.
- **i18n System**: The translation infrastructure in `Client/src/i18n/index.ts` that resolves Translation Keys against the active locale.
- **Analytics Page**: The new `/analytics` route in the web dashboard at `Server/dashboard/src/app/(page)/analytics/page.jsx`.
- **LivestockHeatmap**: A new Leaflet-based heatmap component on the Analytics page that plots farmer locations with heat intensity proportional to livestock count, filterable by animal type.
- **BeneficiariesScreen**: The new mobile admin screen at `Client/src/app/(admin)/beneficiaries.tsx` that lists all registered farmers with search and tap-through to a detail view.
- **FarmerDetailScreen**: The new mobile admin screen at `Client/src/app/(admin)/beneficiary-detail.tsx` that shows a single farmer's full profile.
- **UserHeatMap**: The existing Leaflet heatmap component at `Server/dashboard/src/components/dashboard/UserHeatMap.jsx` that plots user geographic distribution — to be moved from the main dashboard to the Analytics page.
- **HeatmapSection**: The existing dynamic-import wrapper at `Server/dashboard/src/components/dashboard/HeatmapSection.jsx` that renders `UserHeatMap` with SSR disabled.

---

## Requirements

### Requirement 1: Dashboard — Bilingual Event Creation

**User Story:** As an admin using the web dashboard, I want to enter both English and Hindi versions of all event text fields when creating an event, so that mobile app users see content in their preferred language.

#### Acceptance Criteria

1. WHEN an admin opens the Create Event dialog in `Server/dashboard/src/app/(page)/events/page.jsx`, THE BilingualEventForm SHALL render the `LocalizedContentEditor` component for the fields: title, description, guidelines_and_rules, and requirements.
2. THE BilingualEventForm SHALL display a completion badge for each language tab showing the Completion Percentage of filled Localized Fields.
3. WHEN an admin submits the Create Event form with a non-empty English title, THE BilingualEventForm SHALL include the Hindi-suffixed field values (`title_hi`, `description_hi`, `guidelines_and_rules_hi`, `requirements_hi`) in the API payload sent to the backend.
4. IF an admin attempts to submit the Create Event form with an empty English title field, THEN THE BilingualEventForm SHALL prevent submission and display a validation error message.
5. IF an admin attempts to submit the Create Event form with a non-empty English title but an empty Hindi title, THEN THE BilingualEventForm SHALL prevent submission and display a message requiring the Hindi title to be filled.
6. THE BilingualEventForm SHALL preserve all existing non-localized fields (date, start_time, end_time, location_name, location_address, status, hero_image_url) in the submission payload unchanged.

### Requirement 2: Dashboard — Bilingual Event Editing

**User Story:** As an admin using the web dashboard, I want to edit both English and Hindi versions of event text fields on the event detail page, so that I can correct or update bilingual content after creation.

#### Acceptance Criteria

1. WHEN an admin opens an existing event for editing in the Dashboard, THE BilingualEventForm SHALL pre-populate the `LocalizedContentEditor` with the existing English and Hindi field values retrieved from the API.
2. WHEN an admin saves edits, THE BilingualEventForm SHALL send updated values for all Localized Fields (both English and `_hi` variants) in the PATCH/PUT request payload.
3. IF an admin clears the Hindi title field and attempts to save, THEN THE BilingualEventForm SHALL prevent submission and display a validation error requiring the Hindi title.
4. THE BilingualEventForm SHALL display the Completion Percentage badge for each language tab, updating in real time as the admin types.

### Requirement 3: Dashboard — Bilingual Article/Announcement Creation

**User Story:** As an admin using the web dashboard, I want to enter both English and Hindi versions of article and announcement content, so that all published content is available in both languages.

#### Acceptance Criteria

1. WHEN an admin creates or edits an article or announcement in the Dashboard, THE Dashboard SHALL render the `LocalizedContentEditor` for all user-facing text fields (title, body/content, summary where applicable).
2. THE Dashboard SHALL enforce that both English and Hindi title fields are non-empty before allowing submission of an article or announcement.
3. IF an admin submits an article or announcement form with a missing Hindi title, THEN THE Dashboard SHALL display a validation error and prevent the API call.
4. WHEN an article or announcement is saved, THE Dashboard SHALL include all `_hi`-suffixed field values in the API payload.

### Requirement 4: Mobile Admin — Bilingual Event Creation

**User Story:** As an admin using the mobile app, I want to enter both English and Hindi versions of event title, description, guidelines, and requirements when creating an event, so that the event is immediately available in both languages.

#### Acceptance Criteria

1. THE BilingualMobileForm (`Client/src/app/(admin)/create-event.tsx`) SHALL render a language tab selector (English / हिंदी) above the text input fields for title, description, guidelines, and requirements.
2. WHEN the English tab is active, THE BilingualMobileForm SHALL display `TextInput` fields for English title, description, guidelines, and requirements.
3. WHEN the Hindi tab is active, THE BilingualMobileForm SHALL display `TextInput` fields for Hindi title (`title_hi`), description (`description_hi`), guidelines (`guidelines_and_rules_hi`), and requirements (`requirements_hi`).
4. WHEN an admin submits the form with a non-empty English title, THE BilingualMobileForm SHALL include `title_hi`, `description_hi`, `guidelines_and_rules_hi`, and `requirements_hi` in the API payload.
5. IF an admin attempts to submit the form with a non-empty English title but an empty Hindi title, THEN THE BilingualMobileForm SHALL display an alert requiring the Hindi title before submission proceeds.
6. THE BilingualMobileForm SHALL preserve all existing non-localized fields (date, start_time, end_time, location_name, location_address, trainer fields, contact_number, GPS coordinates, hero_image_url) in the submission payload unchanged.
7. WHEN the admin switches between language tabs, THE BilingualMobileForm SHALL retain the values entered in the previously active tab without clearing them.

### Requirement 5: Mobile Admin — Bilingual Scheme Fields

**User Story:** As an admin using the mobile app, I want to enter both English and Hindi versions of scheme fields, so that scheme content is available in both languages from the mobile admin interface.

#### Acceptance Criteria

1. WHEN an admin creates or edits a scheme via the mobile admin screens, THE Mobile Admin SHALL render bilingual input fields (English and Hindi tabs) for title, description, overview, process, and eligibility.
2. IF an admin attempts to submit a scheme form with a non-empty English title but an empty Hindi title, THEN THE Mobile Admin SHALL display a validation error and prevent submission.
3. WHEN a scheme is submitted, THE Mobile Admin SHALL include all `_hi`-suffixed field values in the API payload.

### Requirement 6: i18n — Interested Button Translation Keys

**User Story:** As a mobile app user, I want the Interested/Not Interested button and its related messages to appear in my selected language, so that I can interact with scheme and program detail screens in Hindi or English.

#### Acceptance Criteria

1. THE i18n System SHALL resolve the key `interested.interested` to "Interested" in English and "रुचि है" in Hindi.
2. THE i18n System SHALL resolve the key `interested.notInterested` to "Not Interested" in English and "रुचि नहीं है" in Hindi.
3. THE i18n System SHALL resolve the key `interested.peopleInterested` to "{{count}} people interested" in English and "{{count}} लोगों को रुचि है" in Hindi.
4. THE i18n System SHALL resolve the key `interested.errorToast` to "Could not update interest. Please try again." in English and "रुचि अपडेट नहीं हो सकी। कृपया पुनः प्रयास करें।" in Hindi.

### Requirement 7: i18n — QR Attendance Translation Keys

**User Story:** As a mobile app user, I want all QR attendance scan screen text to appear in my selected language, so that I can understand the scanning flow in Hindi or English.

#### Acceptance Criteria

1. THE i18n System SHALL resolve the key `qrAttendance.scanToAttend` to "Scan to Attend" in English and "उपस्थिति के लिए स्कैन करें" in Hindi.
2. THE i18n System SHALL resolve the key `qrAttendance.scanning` to "Scanning..." in English and "स्कैन हो रहा है..." in Hindi.
3. THE i18n System SHALL resolve the key `qrAttendance.attendanceRecorded` to "Attendance recorded" in English and "उपस्थिति दर्ज हो गई" in Hindi.
4. THE i18n System SHALL resolve the key `qrAttendance.qrExpired` to "QR code expired" in English and "QR कोड की समय सीमा समाप्त हो गई" in Hindi.
5. THE i18n System SHALL resolve the key `qrAttendance.alreadyAttended` to "Already attended" in English and "पहले से उपस्थित हैं" in Hindi.
6. THE i18n System SHALL resolve the key `qrAttendance.cameraPermissionTitle` to "Camera Permission Required" in English and "कैमरा अनुमति आवश्यक है" in Hindi.
7. THE i18n System SHALL resolve the key `qrAttendance.cameraPermissionMessage` to "Please allow camera access to scan the QR code." in English and "QR कोड स्कैन करने के लिए कृपया कैमरा एक्सेस की अनुमति दें।" in Hindi.

### Requirement 8: i18n — Trainer & Contact Section Translation Keys

**User Story:** As a mobile app user, I want the Trainer & Contact section labels on the event details screen to appear in my selected language, so that I can read trainer information in Hindi or English.

#### Acceptance Criteria

1. THE i18n System SHALL resolve the key `events.trainerContact` to "Trainer & Contact" in English and "प्रशिक्षक और संपर्क" in Hindi.
2. THE i18n System SHALL resolve the key `events.masterTrainer` to "Master Trainer" in English and "मास्टर प्रशिक्षक" in Hindi.
3. THE i18n System SHALL resolve the key `events.trainer` to "Trainer" in English and "प्रशिक्षक" in Hindi.
4. THE i18n System SHALL resolve the key `events.contactNumber` to "Contact Number" in English and "संपर्क नंबर" in Hindi.
5. THE i18n System SHALL resolve the key `events.call` to "Call" in English and "कॉल करें" in Hindi.

### Requirement 9: i18n — Get Directions Translation Key

**User Story:** As a mobile app user, I want the Get Directions button on the event details screen to appear in my selected language, so that I can navigate to the event venue in Hindi or English.

#### Acceptance Criteria

1. THE i18n System SHALL resolve the key `events.getDirections` to "Get Directions" in English and "दिशा-निर्देश प्राप्त करें" in Hindi.

### Requirement 10: i18n — Filter & Sort Translation Keys

**User Story:** As a mobile app user, I want all filter and sort controls on the category listing and search screens to appear in my selected language, so that I can browse and filter content in Hindi or English.

#### Acceptance Criteria

1. THE i18n System SHALL resolve the key `filterSort.sortBy` to "Sort by" in English and "क्रमबद्ध करें" in Hindi.
2. THE i18n System SHALL resolve the key `filterSort.nameAZ` to "Name (A–Z)" in English and "नाम (अ–ज)" in Hindi.
3. THE i18n System SHALL resolve the key `filterSort.newestFirst` to "Newest First" in English and "नवीनतम पहले" in Hindi.
4. THE i18n System SHALL resolve the key `filterSort.mostInterested` to "Most Interested" in English and "सर्वाधिक रुचि" in Hindi.
5. THE i18n System SHALL resolve the key `filterSort.filters` to "Filters" in English and "फ़िल्टर" in Hindi.
6. THE i18n System SHALL resolve the key `filterSort.clearFilters` to "Clear Filters" in English and "फ़िल्टर हटाएं" in Hindi.
7. THE i18n System SHALL resolve the key `filterSort.noResultsFound` to "No results found" in English and "कोई परिणाम नहीं मिला" in Hindi.
8. THE i18n System SHALL resolve the key `filterSort.typeAll` to "All" in English and "सभी" in Hindi.
9. THE i18n System SHALL resolve the key `filterSort.typeScheme` to "Scheme" in English and "योजना" in Hindi.
10. THE i18n System SHALL resolve the key `filterSort.typeProgram` to "Program" in English and "कार्यक्रम" in Hindi.
11. THE i18n System SHALL resolve the key `filterSort.typeEvent` to "Event" in English and "इवेंट" in Hindi.

### Requirement 11: i18n — Duplicate Phone Banner Translation Keys

**User Story:** As a mobile app user who enters a phone number that is already registered, I want the duplicate phone banner to appear in my selected language, so that I understand I need to log in instead of registering.

#### Acceptance Criteria

1. THE i18n System SHALL resolve the key `auth.duplicatePhoneMessage` to "This number is already registered. Please log in instead." in English and "यह नंबर पहले से पंजीकृत है। कृपया लॉग इन करें।" in Hindi.
2. THE i18n System SHALL resolve the key `auth.duplicatePhoneLogin` to "Log In" in English and "लॉग इन करें" in Hindi.
3. THE i18n System SHALL resolve the key `auth.duplicatePhoneDismiss` to "Dismiss" in English and "बंद करें" in Hindi.

### Requirement 12: i18n — Admin Bilingual Field Label Translation Keys

**User Story:** As an admin using the mobile admin screens, I want all bilingual input section labels to appear in English, so that I can clearly identify which language I am entering content for.

#### Acceptance Criteria

1. THE i18n System SHALL resolve the key `admin.englishContent` to "English Content" in English and "अंग्रेज़ी सामग्री" in Hindi.
2. THE i18n System SHALL resolve the key `admin.hindiContent` to "Hindi Content (हिंदी)" in English and "हिंदी सामग्री" in Hindi.
3. THE i18n System SHALL resolve the key `admin.titleEn` to "Title (English)" in English and "शीर्षक (अंग्रेज़ी)" in Hindi.
4. THE i18n System SHALL resolve the key `admin.titleHi` to "Title (Hindi)" in English and "शीर्षक (हिंदी)" in Hindi.
5. THE i18n System SHALL resolve the key `admin.descriptionEn` to "Description (English)" in English and "विवरण (अंग्रेज़ी)" in Hindi.
6. THE i18n System SHALL resolve the key `admin.descriptionHi` to "Description (Hindi)" in English and "विवरण (हिंदी)" in Hindi.
7. THE i18n System SHALL resolve the key `admin.guidelinesEn` to "Guidelines (English)" in English and "दिशानिर्देश (अंग्रेज़ी)" in Hindi.
8. THE i18n System SHALL resolve the key `admin.guidelinesHi` to "Guidelines (Hindi)" in English and "दिशानिर्देश (हिंदी)" in Hindi.
9. THE i18n System SHALL resolve the key `admin.requirementsEn` to "Requirements (English)" in English and "आवश्यकताएं (अंग्रेज़ी)" in Hindi.
10. THE i18n System SHALL resolve the key `admin.requirementsHi` to "Requirements (Hindi)" in English and "आवश्यकताएं (हिंदी)" in Hindi.

### Requirement 13: Translation Key Parity (Property)

**User Story:** As a developer, I want every key in `en.json` to have a corresponding key in `hi.json`, so that no Hindi-language user ever sees a raw translation key string in the UI.

#### Acceptance Criteria

1. FOR ALL Translation Keys present in `en.json`, THE i18n System SHALL resolve the same key against `hi.json` to a non-empty string value (not the key itself).
2. FOR ALL Translation Keys present in `hi.json`, THE i18n System SHALL resolve the same key against `en.json` to a non-empty string value (not the key itself).
3. WHEN a new Translation Key is added to `en.json`, THE i18n System SHALL require a corresponding entry in `hi.json` before the change is considered complete.

### Requirement 14: Bilingual Form Submission Integrity (Property)

**User Story:** As a developer, I want the bilingual form validation to guarantee that both language fields are filled before any content is saved, so that the backend never stores content with a missing Hindi translation.

#### Acceptance Criteria

1. FOR ALL content creation and editing forms covered by this spec, WHEN the English title field is non-empty, THE Form SHALL require the Hindi title field to also be non-empty before allowing submission.
2. FOR ALL content creation and editing forms covered by this spec, IF the Hindi title field is empty at submission time, THEN THE Form SHALL display a user-visible validation error in the active UI language and SHALL NOT call the backend API.
3. THE BilingualEventForm and BilingualMobileForm SHALL treat a string containing only whitespace characters as empty for the purposes of validation.

### Requirement 15: LocalizedContentEditor Completion Percentage (Property)

**User Story:** As an admin, I want the completion badge on each language tab to accurately reflect how many fields I have filled in, so that I can see at a glance whether a language version is complete.

#### Acceptance Criteria

1. THE LocalizedContentEditor SHALL compute the Completion Percentage for a language as `round((filledFieldCount / totalFieldCount) * 100)`, where `filledFieldCount` is the number of fields whose trimmed value is non-empty.
2. WHEN all fields for a language are filled, THE LocalizedContentEditor SHALL display a Completion Percentage of 100 for that language tab.
3. WHEN no fields for a language are filled, THE LocalizedContentEditor SHALL display a Completion Percentage of 0 for that language tab.
4. FOR ANY combination of N filled fields out of M total fields, THE LocalizedContentEditor SHALL display `round(N / M * 100)` as the Completion Percentage, for all valid values of N (0 ≤ N ≤ M) and M > 0.
5. WHEN a field value changes from non-empty to empty (or vice versa), THE LocalizedContentEditor SHALL update the Completion Percentage badge in real time without requiring a page reload or form submission.

---

### Requirement 16: Web Dashboard — Analytics Page

**User Story:** As an admin, I want a dedicated Analytics page in the web dashboard, so that I can view all data visualisations in one place without cluttering the main dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL add a new route `/analytics` with a corresponding page at `Server/dashboard/src/app/(page)/analytics/page.jsx`.
2. THE Dashboard sidebar (`app-sidebar.jsx`) SHALL include an "Analytics" navigation item with a chart/bar icon that links to `/analytics`, positioned between "Dashboard" and "Events" in the nav order.
3. THE Analytics page SHALL display the user distribution heatmap (currently `HeatmapSection` / `UserHeatMap`) that is presently on the main dashboard page (`/`).
4. WHEN the Analytics page is added, THE main dashboard page (`/`) SHALL remove the `HeatmapSection` card so the map is no longer duplicated on the home page.
5. THE Analytics page SHALL display summary KPI cards for total registered farmers, total livestock count, total land area, and number of active events — sourced from `analyticsApi.getDashboardStats()`.

---

### Requirement 17: Web Dashboard — Livestock Heatmap on Analytics Page

**User Story:** As an admin, I want to see a geographic heatmap of livestock distribution on the Analytics page, so that I can identify which regions have high concentrations of specific animal types and make targeted decisions.

#### Acceptance Criteria

1. THE Analytics page SHALL display a livestock heatmap section below the user distribution heatmap.
2. THE livestock heatmap SHALL use the same Leaflet + `leaflet.heat` stack as the existing `UserHeatMap` component, centred on India with the same zoom configuration from `heatmap-config.js`.
3. THE livestock heatmap SHALL fetch data from `analyticsApi.getLivestockStatistics()` and plot each farmer's location as a heat point, with intensity proportional to their total livestock count.
4. THE livestock heatmap SHALL provide an animal-type filter — a segmented control or dropdown with options: "All", "Cow", "Buffalo", "Goat", "Sheep", "Poultry", "Others" — that re-renders the heatmap showing only the selected animal type's distribution.
5. WHEN "All" is selected, THE livestock heatmap SHALL use total livestock count as the heat intensity for each point.
6. WHEN a specific animal type is selected, THE livestock heatmap SHALL use only that animal type's count as the heat intensity, hiding farmers with zero of that animal type.
7. THE livestock heatmap SHALL display a legend showing the colour gradient from low (green) to high (red) density, consistent with the `HEAT_GRADIENT` defined in `heatmap-config.js`.
8. THE livestock heatmap SHALL show a loading skeleton while data is being fetched and an empty-state message if no livestock data is available.
9. THE Analytics page SHALL display a "Top Livestock Regions" panel alongside the heatmap, listing the top 5 districts by total livestock count with a breakdown by animal type.

---

### Requirement 18: Mobile Admin — Beneficiaries Screen

**User Story:** As an admin using the mobile app, I want to view all registered beneficiaries (farmers), search for them by name or phone number, and tap into a farmer's full profile, so that I can manage and review farmer data from my phone.

#### Acceptance Criteria

1. THE Mobile Admin SHALL add a new screen at `Client/src/app/(admin)/beneficiaries.tsx` that displays a scrollable list of all registered farmers fetched from the backend.
2. THE Beneficiaries screen SHALL display for each farmer: their name, village, district, mobile number, and a verified/pending status badge — matching the data shown in the web dashboard `BeneficiariesTable`.
3. THE Beneficiaries screen SHALL include a search bar at the top that filters the displayed list in real time by farmer name or mobile number (client-side filtering on the fetched page of results).
4. WHEN the admin taps a farmer row, THE Beneficiaries screen SHALL navigate to a farmer detail screen (`Client/src/app/(admin)/beneficiary-detail.tsx`) that shows the farmer's full profile: personal details, address, land details (crops by season), and livestock details.
5. THE Beneficiaries screen SHALL support pull-to-refresh to re-fetch the latest farmer list from the API.
6. THE Beneficiaries screen SHALL display a loading skeleton while the initial data fetch is in progress.
7. THE Beneficiaries screen SHALL display an empty state with a descriptive message when no farmers match the current search query.
8. THE Mobile Admin dashboard navigation (`Client/src/app/(admin)/_layout.tsx` or the admin dashboard screen) SHALL include a "Beneficiaries" entry point that navigates to the Beneficiaries screen.
9. THE farmer detail screen SHALL display a "Call" button next to the farmer's mobile number that opens the phone dialler via `Linking.openURL("tel:...")`.
10. THE farmer detail screen SHALL display land parcels grouped by season (Rabi, Kharif, Zaid) with crop name and area for each parcel.
