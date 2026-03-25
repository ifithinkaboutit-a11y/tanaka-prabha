# Mobile App Bug Fixes — Bugfix Design

## Overview

This document formalizes the design for fixing 15 bugs across the React Native / Expo mobile app (Expo Router). The bugs span five domains: API routing, i18n/translation, UI state management, admin navigation, and auth-stack layout. Each fix is minimal and targeted. The design defines the bug condition C(X), the expected correct behavior P(result), and the preservation requirements for each bug, then groups them into a unified testing strategy.

---

## Glossary

- **Bug_Condition (C)**: The set of inputs or states that trigger a defect
- **Property (P)**: The desired correct behavior when C(X) holds
- **Preservation**: Existing correct behavior for inputs where C(X) does NOT hold — must remain unchanged
- **isBugCondition(input)**: Pseudocode predicate returning true when the bug is triggered
- **F**: Original (unfixed) function or component
- **F'**: Fixed function or component
- **schemeRoutes.js**: `Server/backend/src/routes/schemeRoutes.js` — Express router for scheme endpoints
- **schemes.tsx**: `Client/src/app/(tab)/schemes.tsx` — Schemes tab screen
- **LivestockDetailsForm**: `Client/src/components/molecules/LivestockDetailsForm.tsx` — livestock counter form
- **en.json / hi.json**: `Client/src/i18n/en.json` and `Client/src/i18n/hi.json` — i18n translation files
- **create-event.tsx**: `Client/src/app/(admin)/create-event.tsx` — admin event creation screen
- **onboardingStore**: `Client/src/stores/onboardingStore.ts` — Zustand store with `eventLocationPick` field
- **AuthVideoBackground**: `Client/src/components/molecules/AuthVideoBackground.tsx` — video component used in auth screens
- **searchQuery**: State variable in `schemes.tsx` that is set by the search bar but never used to filter

---

## Bug Details

### Bug 1 — Scheme Interest API: Route Not Found

The bug manifests when a user taps to express interest in a scheme. The client POSTs to `/api/schemes/:id/interest` but no such route is registered in `schemeRoutes.js`.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type HttpRequest
  OUTPUT: boolean

  RETURN input.method === "POST"
         AND input.path MATCHES /^\/api\/schemes\/[^/]+\/interest$/
         AND route NOT registered in schemeRoutes.js
END FUNCTION
```

**Examples:**
- POST `/api/schemes/abc123/interest` returns 404 Not Found (bug)
- GET `/api/schemes/abc123` returns 200 OK (not affected)

---

### Bug 7 — Livestock Translation: Missing i18n Keys

The bug manifests when `LivestockDetailsForm` calls `T.translate("livestockDetails.pig")` or `T.translate("livestockDetails.poultry")`. Both keys are absent from `en.json` and `hi.json`, so the i18n library returns the raw key string.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type TranslationKey (string)
  OUTPUT: boolean

  RETURN input IN ["livestockDetails.pig", "livestockDetails.poultry"]
         AND key NOT present in en.json
         AND key NOT present in hi.json
END FUNCTION
```

**Examples:**
- `T.translate("livestockDetails.pig")` returns `"livestockDetails.pig"` (bug)
- `T.translate("livestockDetails.cow")` returns `"Cow"` (not affected — key exists)

---

### Bug 8 — Schemes Page: Search Bar Not Filtering

The bug manifests when a user types in the search bar on the Schemes page. `setSearchQuery` is called and state updates, but `searchQuery` is never used to filter `schemes`, `recommendedSchemes`, or the `ProgramSection` list.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { searchQuery: string, schemes: Scheme[] }
  OUTPUT: boolean

  RETURN input.searchQuery.trim().length > 0
         AND displayedSchemes === input.schemes
END FUNCTION
```

**Examples:**
- User types "kisan" — all schemes still shown (bug)
- User clears search bar — all schemes shown (correct, not affected)

---

### Bug 13 — Create Event: GPS Location Button Navigates to Wrong Page

The bug manifests when an admin taps the GPS location picker button in `create-event.tsx`. The call `router.push("/location-picker")` resolves incorrectly inside the `(admin)` route group.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type NavigationAction
  OUTPUT: boolean

  RETURN input.screen === "create-event"
         AND input.action === "push"
         AND input.path === "/location-picker"
         AND currentRouteGroup === "(admin)"
END FUNCTION
```

**Examples:**
- Admin taps "Pick Location" — navigates to admin dashboard (bug)
- Admin taps "Pick Location" with corrected absolute path — opens map picker (expected)

---

### Bug 15 — Auth Stack: Video Header and Keyboard UX

The bug manifests on any auth/onboarding screen that renders `AuthVideoBackground` or an inline `VideoView`. The video occupies 28–55% of screen height, and `KeyboardAvoidingView` is misconfigured, causing input fields to be obscured by the keyboard.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ScreenRender
  OUTPUT: boolean

  RETURN input.screen IN ["phone-input", "otp-input", "set-password",
                          "personal-details", "land-details", "livestock-details"]
         AND (rendersVideoComponent(input.screen)
              OR keyboardObscuresInputField(input.screen))
END FUNCTION
```

**Examples:**
- User opens `phone-input` — video takes 55vh, form is cramped (bug)
- User taps phone number field — keyboard opens, field is hidden (bug)
- User opens `land-details` — video takes 28% height, form scrolls under keyboard (bug)

---

### Bugs 2, 3, 4, 5, 6, 9, 10, 11, 12, 14 — Condition Summaries

| Bug | Condition Summary |
|-----|-------------------|
| 2 — Location Picker GPS | GPS unavailable and map tiles fail with referrer error |
| 3 — Personal Details Address | Map selection returns but address fields not auto-populated |
| 4 — Land Details Crop Pre-fill | Edit land details and seasonal crop selectors are empty |
| 5 — Land Crop Summary Card | Open crop selector from summary card and it is not pre-filled |
| 6 — Livestock Icons | Livestock section renders and icons are poor quality |
| 9 — Duplicate Phone OTP | Signup with registered number and OTP is sent instead of blocked |
| 10 — Admin CMS Edit/Delete | View CMS item list and no edit/delete actions are present |
| 11 — Admin CMS Tab Navigation | Navigate to any CMS entry and no tab switcher is shown |
| 12 — View Attendance UX | Admin opens attendance and layout is unintuitive |
| 14 — App Reload on Notification | Admin sends notification and app reloads unexpectedly |

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- New user registration with an unregistered phone number SHALL continue to send OTP and proceed normally (Req 3.1)
- Login with an existing phone number and password SHALL continue to authenticate and navigate to tabs (Req 3.2)
- Location picker opened during onboarding SHALL continue to save to `onboardingStore` and navigate to land-details (Req 3.3)
- Saving personal details without using the map SHALL continue to persist manually entered address fields (Req 3.4)
- Saving land details with valid area and crop selection SHALL continue to persist and navigate back (Req 3.5)
- Saving livestock details with valid counts SHALL continue to persist and navigate back (Req 3.6)
- Viewing the Schemes page without typing in the search bar SHALL continue to display all schemes (Req 3.7)
- Admin creating a new banner, scheme, or professional SHALL continue to save and refresh the list (Req 3.8)
- Admin creating an event without a GPS location SHALL continue to allow event creation (Req 3.9)
- Home and Program page search bars SHALL continue to navigate to the global search screen (Req 3.10)
- Admin marking attendance SHALL continue to record attendance correctly (Req 3.11)
- Scheme interest state for already-interested schemes SHALL continue to display correctly (Req 3.12)
- Auth/onboarding flow navigation sequence SHALL continue to work correctly end-to-end (Req 3.13)

**Scope:**
All inputs that do NOT match the bug conditions above are completely unaffected by these fixes. This includes all non-buggy API routes, all i18n keys that already exist, all non-search interactions on the Schemes page, all non-GPS navigation in the admin panel, and all auth screens that do not render video.

---

## Hypothesized Root Cause

### Bug 1 — Missing Route
`schemeRoutes.js` registers CRUD routes and a toggle route but has no `POST /:id/interest` handler. The controller likely needs an `expressInterest` function added.

### Bug 7 — Missing i18n Keys
`en.json` has `livestockDetails.cow`, `buffalo`, `sheep`, `goat`, `hen`, `others` but is missing `pig` and `poultry`. `LivestockDetailsForm` iterates `ANIMAL_DATA` which includes both keys, so the translation call fails silently and returns the key string.

### Bug 8 — Search State Not Wired
`schemes.tsx` calls `setSearchQuery` correctly but `recommendedSchemes` is derived as `schemes.slice(1, 4)` and `ProgramSection` receives `schemes.slice(0, 9)` — neither references `searchQuery`. The filter logic was never connected.

### Bug 13 — Wrong Navigation Path
`create-event.tsx` calls `router.push("/location-picker")`. Inside the `(admin)` route group, Expo Router resolves this relative path to the admin panel. The fix is to use the absolute path `"/(auth)/location-picker"` with a `purpose` param. The `onboardingStore.eventLocationPick` handshake is already implemented correctly.

### Bug 15 — Video and Keyboard Issues
1. `phone-input.tsx` renders `<AuthVideoBackground>` inside `<View className="h-[55vh]">`. `land-details.tsx` and `livestock-details.tsx` render an inline `VideoView` at `screenHeight * 0.28`.
2. `phone-input.tsx` uses `behavior="padding"` on both platforms. `land-details.tsx` and `livestock-details.tsx` place `KeyboardAvoidingView` inside the content card below the video, so the video height is not accounted for in the offset calculation.

### Bugs 2, 3, 4, 5, 6, 9, 10, 11, 12, 14
- **Bug 2**: OSM tile requests from React Native lack a `Referer` header; needs a tile provider that does not require one, or a custom header configuration.
- **Bug 3**: `personal-details.tsx` reads `profileAddressOverride` from the store but requires a manual button tap; `useFocusEffect` should auto-apply on focus.
- **Bug 4/5**: `LandDetailsForm` initializes crop selectors from `initialData` but the profile edit version passes empty strings when the profile has data.
- **Bug 6**: `MaterialCommunityIcons` icons for `pig` and `bird` may not render on all platforms; replacing with emoji or verified icon names resolves this.
- **Bug 9**: The duplicate phone check is implemented client-side but the server sends an OTP before returning the duplicate error — the server-side check must happen before OTP dispatch.
- **Bug 10**: `content-management.tsx` item cards have no edit/delete actions — action buttons need to be added to each `FlatList` item.
- **Bug 11**: The three CMS items in the admin dashboard navigate to separate screens; they should all push to `content-management.tsx` which already has tab switching built in.
- **Bug 12**: `view-attendance.tsx` lacks date/event filtering and the layout is dense.
- **Bug 14**: `send-notification.tsx` calls `router.back()` inside an Alert `onPress` callback; if the Alert is dismissed during a navigation reset it can trigger a double-navigation. Use a state-driven navigation instead.

---

## Correctness Properties

Property 1: Bug Condition — Scheme Interest Route Exists and Responds

_For any_ POST request to `/api/schemes/:id/interest` where the scheme ID exists, the fixed server SHALL register the route, invoke the interest handler, and return a 200 response with the updated interest count — not a 404.

**Validates: Requirements 2.1**

Property 2: Bug Condition — Livestock Translation Keys Resolve to Human-Readable Labels

_For any_ call to `T.translate(key)` where `key` is `"livestockDetails.pig"` or `"livestockDetails.poultry"`, the fixed i18n files SHALL return `"Pig"` / `"Poultry"` (English) or `"सूअर"` / `"मुर्गी"` (Hindi) — not the raw key string.

**Validates: Requirements 2.7**

Property 3: Bug Condition — Schemes Search Filters the Displayed List

_For any_ non-empty `searchQuery` string typed into the Schemes page search bar, the fixed `schemes.tsx` SHALL display only schemes whose `title` or `category` contains the query (case-insensitive) — the unfiltered full list SHALL NOT be shown.

**Validates: Requirements 2.8**

Property 4: Bug Condition — Create Event GPS Button Navigates to Map Picker

_For any_ tap on the GPS location button in `create-event.tsx`, the fixed navigation call SHALL open the map location picker screen, and upon confirmation SHALL write coordinates to `onboardingStore.eventLocationPick` which `create-event.tsx` consumes via `useFocusEffect`.

**Validates: Requirements 2.13**

Property 5: Bug Condition — Auth Screens Are Full-Screen Without Video

_For any_ render of an auth/onboarding screen (phone-input, otp-input, set-password, personal-details, land-details, livestock-details), the fixed screens SHALL NOT render `AuthVideoBackground` or an inline `VideoView`, and SHALL use a correctly configured `KeyboardAvoidingView` (behavior `"padding"` on iOS, `"height"` on Android) so that no input field is obscured by the keyboard.

**Validates: Requirements 2.15**

Property 6: Preservation — Non-Buggy Scheme API Routes Unchanged

_For any_ request to scheme routes other than `POST /:id/interest` (GET all, GET by ID, POST create, PUT update, PATCH toggle, DELETE), the fixed `schemeRoutes.js` SHALL produce the same response as the original, preserving all existing CRUD behavior.

**Validates: Requirements 3.7, 3.12**

Property 7: Preservation — Existing i18n Keys Unchanged

_For any_ translation key that already exists in `en.json` or `hi.json` (i.e., NOT `livestockDetails.pig` or `livestockDetails.poultry`), the fixed i18n files SHALL return the same value as before, preserving all existing translations.

**Validates: Requirements 3.5, 3.6**

Property 8: Preservation — Schemes Page Without Search Query Shows All Schemes

_For any_ render of the Schemes page where `searchQuery` is empty or whitespace-only, the fixed `schemes.tsx` SHALL display the same full list of schemes as the original, preserving the unfiltered view.

**Validates: Requirements 3.7**

Property 9: Preservation — Auth Flow Navigation Sequence Unchanged

_For any_ user completing the auth/onboarding flow (phone to OTP to set-password to personal-details to location-picker to land-details to livestock-details), the fixed screens SHALL navigate to the same next screen as before, preserving the complete onboarding sequence.

**Validates: Requirements 3.1, 3.2, 3.13**

---

## Fix Implementation

### Bug 1 — Add `/schemes/:id/interest` Route

**File**: `Server/backend/src/routes/schemeRoutes.js`
**File**: `Server/backend/src/controllers/schemeController.js`

**Changes**:
1. Add `expressInterest` controller function that finds the scheme by ID, increments or toggles the user's interest, and returns the updated count
2. Register `router.post('/:id/interest', authMiddleware, expressInterest)` in `schemeRoutes.js` — place it before the generic `/:id` GET route to avoid route shadowing

---

### Bug 7 — Add Missing i18n Keys

**File**: `Client/src/i18n/en.json`
**File**: `Client/src/i18n/hi.json`

**Changes**:
1. Add `"pig": "Pig"` to the `livestockDetails` object in `en.json`
2. Add `"poultry": "Poultry"` to the `livestockDetails` object in `en.json`
3. Add `"pig": "सूअर"` to the `livestockDetails` object in `hi.json`
4. Add `"poultry": "मुर्गी"` to the `livestockDetails` object in `hi.json`

---

### Bug 8 — Wire Search Query to Filter Logic

**File**: `Client/src/app/(tab)/schemes.tsx`

**Changes**:
1. Derive `filteredSchemes` from `schemes` filtered by `searchQuery` (case-insensitive match on `title` and `category`)
2. Replace `schemes.slice(1, 4)` with `filteredSchemes.slice(0, 3)` for `recommendedSchemes`
3. Replace `schemes.slice(0, 9)` in `ProgramSection` with `filteredSchemes.slice(0, 9)`
4. When `searchQuery` is non-empty, hide the banner slideshow and categories section to show a clean search results view
5. Show a "no results" message when `filteredSchemes` is empty and `searchQuery` is non-empty

---

### Bug 13 — Fix GPS Navigation Path in Create Event

**File**: `Client/src/app/(admin)/create-event.tsx`

**Changes**:
1. Replace `router.push("/location-picker")` with `router.push({ pathname: "/(auth)/location-picker", params: { purpose: "event-location" } })` — the absolute path bypasses route-group resolution ambiguity
2. The `useFocusEffect` + `eventLocationPick` handshake is already implemented correctly; no changes needed there

---

### Bug 15 — Remove Video Header, Fix Keyboard UX

**Files**:
- `Client/src/app/(auth)/phone-input.tsx`
- `Client/src/app/(auth)/otp-input.tsx`
- `Client/src/app/(auth)/set-password.tsx`
- `Client/src/app/(auth)/personal-details.tsx`
- `Client/src/app/(auth)/land-details.tsx`
- `Client/src/app/(auth)/livestock-details.tsx`

**Changes per screen**:
1. Remove `<AuthVideoBackground>` wrapper or inline `VideoView` + `useVideoPlayer` + `MediaPath` import
2. Remove the `Dimensions.get("window")` call and `videoHeight` calculation
3. Replace the video header with a clean static header: progress bar (for onboarding screens), screen title, and subtitle using a simple `View` with a solid background color
4. Ensure the root `View` is `flex: 1`
5. Wrap the entire screen in `KeyboardAvoidingView` at the root level with `behavior={Platform.OS === "ios" ? "padding" : "height"}` and `style={{ flex: 1 }}`
6. Place `ScrollView` inside `KeyboardAvoidingView` (not the other way around)
7. Remove `expo-video` imports from auth screens

---

### Bugs 2, 3, 4, 5, 6, 9, 10, 11, 12, 14 — Implementation Summaries

| Bug | File(s) | Change |
|-----|---------|--------|
| 2 | `Client/src/app/(auth)/location-picker.tsx` | Configure map tile URL with a valid `User-Agent` or use a tile provider that does not require a referrer header; show fallback centered on India when GPS unavailable |
| 3 | `Client/src/app/personal-details.tsx` | In `useFocusEffect`, auto-apply `profileAddressOverride` to form state immediately on focus without requiring a button tap; clear the override after consuming |
| 4 | `Client/src/app/land-details.tsx` + `LandDetailsForm` | Pass existing `rabiCrop`, `kharifCrop`, `zaidCrop` values from profile as `initialData`; ensure crop selector pre-selects these values and supports removal |
| 5 | `Client/src/app/land-details.tsx` | Same as Bug 4 — ensure `initialData` is correctly populated from `profile.landDetails` |
| 6 | `Client/src/components/molecules/LivestockDetailsForm.tsx` | Replace `MaterialCommunityIcons` icon names that render poorly with emoji alternatives or verified icon names |
| 9 | `Server/backend/src/controllers/authController.js` | Check for existing phone number BEFORE calling the OTP dispatch service; return a 409 conflict response immediately if the number is already registered |
| 10 | `Client/src/app/(admin)/content-management.tsx` | Add edit (pencil icon opens pre-filled modal with PUT/PATCH call) and delete (trash icon with confirm alert and DELETE call) to each item card in all three tabs |
| 11 | `Client/src/app/(admin)/dashboard.tsx` | Update the three CMS navigation entries to all push to `/(admin)/content-management`; remove separate navigation entries for individual CMS sections |
| 12 | `Client/src/app/(admin)/view-attendance.tsx` | Add event search/filter bar; add date filter; improve attendee list with clearer present/absent grouping |
| 14 | `Client/src/app/(admin)/send-notification.tsx` | Remove `router.back()` from inside the Alert `onPress` callback; use a `sent` state flag with `useEffect` to navigate back after the Alert is dismissed |

---

## Testing Strategy

### Validation Approach

Testing follows a two-phase approach: first run exploratory tests on unfixed code to confirm root causes, then run fix-checking and preservation-checking tests on the fixed code.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug on unfixed code. Confirm or refute root cause hypotheses. If a hypothesis is refuted, re-hypothesize before implementing the fix.

**Test Plan**: Write tests that exercise each bug condition against the current (unfixed) codebase and assert the expected correct behavior — these assertions will fail, revealing the defect.

**Test Cases**:
1. **Bug 1 — Interest Route**: Send `POST /api/schemes/test-id/interest` to the running server — expect 404 (confirms missing route)
2. **Bug 7 — Pig Translation**: Call `T.translate("livestockDetails.pig")` — expect raw key string returned (confirms missing key)
3. **Bug 7 — Poultry Translation**: Call `T.translate("livestockDetails.poultry")` — expect raw key string returned
4. **Bug 8 — Search No Filter**: Render `Schemes` with `searchQuery = "kisan"` — expect all schemes still displayed (confirms filter not wired)
5. **Bug 13 — Wrong Navigation**: Simulate GPS button tap in `create-event.tsx` — capture `router.push` argument — expect it resolves to admin panel (confirms wrong path)
6. **Bug 15 — Video Present**: Render `phone-input.tsx` — expect `AuthVideoBackground` in component tree (confirms video not removed)

**Expected Counterexamples**:
- Route 404 for interest endpoint
- Raw key strings for pig/poultry labels
- Unfiltered scheme list despite non-empty search query
- Navigation to wrong screen from create-event GPS button
- Video component present in auth screen render tree

---

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedFunction(input)
  ASSERT expectedBehavior(result)
END FOR
```

**Test Cases per Bug**:
1. **Bug 1**: POST `/api/schemes/:id/interest` — assert 200 with updated interest count
2. **Bug 7**: `T.translate("livestockDetails.pig")` — assert `"Pig"` (en) and `"सूअर"` (hi)
3. **Bug 7**: `T.translate("livestockDetails.poultry")` — assert `"Poultry"` (en) and `"मुर्गी"` (hi)
4. **Bug 8**: Render Schemes with `searchQuery = "kisan"` — assert only matching schemes displayed
5. **Bug 8**: Render Schemes with `searchQuery = "xyz_no_match"` — assert empty list with no-results message
6. **Bug 13**: Simulate GPS button tap — assert `router.push` called with `"/(auth)/location-picker"` path
7. **Bug 15**: Render each auth screen — assert no `VideoView` or `AuthVideoBackground` in tree
8. **Bug 15**: Simulate keyboard open on `phone-input` — assert input field remains visible above keyboard

---

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalFunction(input) = fixedFunction(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because it generates many test cases automatically, catches edge cases, and provides strong guarantees across the input domain.

**Test Cases**:
1. **Scheme CRUD Preservation**: GET/PUT/DELETE scheme routes — assert same responses as before (Req 3.7, 3.12)
2. **Existing i18n Keys Preservation**: For all keys in `en.json` except `pig`/`poultry` — assert same translation values (Req 3.5, 3.6)
3. **Schemes Page No-Search Preservation**: Render Schemes with empty `searchQuery` — assert full scheme list displayed (Req 3.7)
4. **Auth Flow Navigation Preservation**: Complete phone to OTP to set-password to personal-details to land-details to livestock-details flow — assert each screen navigates to the correct next screen (Req 3.13)
5. **New Phone Registration Preservation**: Register with unregistered number — assert OTP sent and flow proceeds (Req 3.1)
6. **Login Preservation**: Login with existing credentials — assert authentication succeeds and navigates to tabs (Req 3.2)
7. **Admin Event Creation Without GPS**: Create event without tapping GPS button — assert event created successfully (Req 3.9)
8. **CMS Create Preservation**: Create new banner/scheme/professional — assert item saved and list refreshed (Req 3.8)

---

### Unit Tests

- Test `POST /api/schemes/:id/interest` route registration and handler response
- Test `T.translate("livestockDetails.pig")` and `T.translate("livestockDetails.poultry")` return correct strings in both languages
- Test `filteredSchemes` derivation in `schemes.tsx` for various query strings (empty, partial match, no match, case variations)
- Test `router.push` argument in `create-event.tsx` GPS button handler
- Test that no `VideoView` component is rendered in each auth screen
- Test `KeyboardAvoidingView` behavior prop is platform-conditional in each auth screen
- Test `personal-details.tsx` auto-applies `profileAddressOverride` on focus without button tap
- Test `send-notification.tsx` does not call `router.back()` inside Alert callback

### Property-Based Tests

- Generate random scheme arrays and search queries — verify `filteredSchemes` always contains only schemes matching the query (Property 3)
- Generate random i18n key strings excluding `pig`/`poultry` — verify translation values are unchanged after fix (Property 7)
- Generate random valid phone numbers not already registered — verify OTP is always sent (Property 9)
- Generate random scheme IDs — verify interest route returns 200 for valid IDs and 404 for non-existent IDs (Property 1)

### Integration Tests

- Full auth onboarding flow: phone to OTP to set-password to personal-details to location-picker to land-details to livestock-details to tabs (Req 3.13)
- Admin create event with GPS location: tap GPS button, map opens, confirm location, return to create-event with coordinates populated (Req 2.13)
- Schemes search end-to-end: type query, list filters, clear query, full list restored (Req 2.8, 3.7)
- Livestock form with pig and poultry: open form, verify "Pig" and "Poultry" labels displayed, update counts, save (Req 2.7, 3.6)
- Admin CMS edit/delete: view item list, tap edit, modal opens pre-filled, save, list updates; tap delete, confirm, item removed (Req 2.10, 3.8)
- Send notification without app reload: admin sends notification, success alert shown, navigate back, app state intact (Req 2.14)
