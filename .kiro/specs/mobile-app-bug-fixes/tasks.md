# Implementation Plan

---

## Bug 1 — Scheme Interest API: Route Not Found

- [x] 1. Write bug condition exploration test (Bug 1)
  - **Property 1: Bug Condition** - Scheme Interest Route Missing
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Surface the 404 response that proves the route is unregistered
  - **Scoped PBT Approach**: Scope to a concrete POST request to `/api/schemes/test-id/interest`
  - Send `POST /api/schemes/test-id/interest` to the running Express server
  - Assert the response status is 200 with an updated interest count (from Expected Behavior in design)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS with 404 (proves route is missing)
  - Document counterexample: `POST /api/schemes/test-id/interest → 404 Not Found`
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1_

- [x] 2. Write preservation property tests for scheme routes (Bug 1)
  - **Property 2: Preservation** - Existing Scheme CRUD Routes Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `GET /api/schemes` returns 200 with scheme list on unfixed code
  - Observe: `GET /api/schemes/:id` returns 200 for valid ID on unfixed code
  - Observe: `POST /api/schemes` (create) returns 201 on unfixed code
  - Observe: `PUT /api/schemes/:id` returns 200 on unfixed code
  - Observe: `DELETE /api/schemes/:id` returns 200 on unfixed code
  - Write property-based tests: for all existing CRUD routes, responses are unchanged after fix
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline CRUD behavior to preserve)
  - _Requirements: 3.7, 3.12_

- [x] 3. Fix Bug 1 — Add `/schemes/:id/interest` route

  - [x] 3.1 Add `expressInterest` controller to `Server/backend/src/controllers/schemeController.js`
    - Find scheme by ID; return 404 if not found
    - Increment or toggle the user's interest on the scheme record
    - Return 200 with `{ status: "success", data: { interestCount } }`
    - _Bug_Condition: POST /api/schemes/:id/interest where route NOT registered_
    - _Expected_Behavior: 200 response with updated interest count_
    - _Preservation: All existing GET/POST/PUT/PATCH/DELETE scheme routes unchanged_
    - _Requirements: 2.1, 3.7, 3.12_

  - [x] 3.2 Register the interest route in `Server/backend/src/routes/schemeRoutes.js`
    - Add `router.post('/:id/interest', authMiddleware, expressInterest)` BEFORE the generic `GET /:id` route to avoid route shadowing
    - _Requirements: 2.1_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Scheme Interest Route Exists and Responds
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Run `POST /api/schemes/test-id/interest` — assert 200 with interest count
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Scheme CRUD Routes Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all existing CRUD route tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [x] 4. Checkpoint Bug 1 — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Bug 7 — Livestock Translation: Missing i18n Keys

- [x] 5. Write bug condition exploration test (Bug 7)
  - **Property 1: Bug Condition** - Pig and Poultry Translation Keys Missing
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Confirm that `T.translate("livestockDetails.pig")` and `T.translate("livestockDetails.poultry")` return the raw key string
  - **Scoped PBT Approach**: Scope to the two concrete missing keys
  - Call `T.translate("livestockDetails.pig")` — assert result equals `"Pig"` (not the raw key)
  - Call `T.translate("livestockDetails.poultry")` — assert result equals `"Poultry"` (not the raw key)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS — raw key strings returned instead of labels
  - Document counterexamples: `T.translate("livestockDetails.pig") → "livestockDetails.pig"`
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.7_

- [x] 6. Write preservation property tests for i18n keys (Bug 7)
  - **Property 2: Preservation** - Existing Livestock i18n Keys Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `T.translate("livestockDetails.cow")` returns `"Cow"` on unfixed code
  - Observe: `T.translate("livestockDetails.buffalo")` returns `"Buffalo"` on unfixed code
  - Observe: `T.translate("livestockDetails.sheep")` returns `"Sheep"` on unfixed code
  - Observe: `T.translate("livestockDetails.goat")` returns `"Goat"` on unfixed code
  - Observe: `T.translate("livestockDetails.others")` returns `"Others"` on unfixed code
  - Write property-based tests: for all existing livestock keys (not pig/poultry), translation values are unchanged
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline translations to preserve)
  - _Requirements: 3.5, 3.6_

- [x] 7. Fix Bug 7 — Add missing i18n keys

  - [x] 7.1 Add `"pig"` and `"poultry"` keys to `Client/src/i18n/en.json`
    - In the `livestockDetails` object, add `"pig": "Pig"`
    - In the `livestockDetails` object, add `"poultry": "Poultry"`
    - _Bug_Condition: key IN ["livestockDetails.pig", "livestockDetails.poultry"] AND key NOT present in en.json_
    - _Expected_Behavior: T.translate("livestockDetails.pig") === "Pig", T.translate("livestockDetails.poultry") === "Poultry"_
    - _Preservation: All existing livestock translation keys return same values_
    - _Requirements: 2.7, 3.5, 3.6_

  - [x] 7.2 Add `"pig"` and `"poultry"` keys to `Client/src/i18n/hi.json`
    - In the `livestockDetails` object, add `"pig": "सूअर"`
    - In the `livestockDetails` object, add `"poultry": "मुर्गी"`
    - _Requirements: 2.7_

  - [x] 7.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Pig and Poultry Labels Resolve Correctly
    - **IMPORTANT**: Re-run the SAME test from task 5 — do NOT write a new test
    - Assert `T.translate("livestockDetails.pig")` returns `"Pig"` (en) and `"सूअर"` (hi)
    - Assert `T.translate("livestockDetails.poultry")` returns `"Poultry"` (en) and `"मुर्गी"` (hi)
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.7_

  - [x] 7.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Livestock i18n Keys Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 6 — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [x] 8. Checkpoint Bug 7 — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Bug 8 — Schemes Page: Search Bar Not Filtering

- [x] 9. Write bug condition exploration test (Bug 8)
  - **Property 1: Bug Condition** - Search Query Does Not Filter Schemes
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Confirm that a non-empty searchQuery leaves the full scheme list displayed
  - **Scoped PBT Approach**: Scope to `searchQuery = "kisan"` with a known scheme list
  - Render `Schemes` screen with `searchQuery = "kisan"` and a mock scheme list containing both matching and non-matching schemes
  - Assert that only schemes whose title or category contains "kisan" (case-insensitive) are displayed
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS — all schemes still shown despite non-empty query
  - Document counterexample: `searchQuery="kisan" → all 9 schemes displayed (unfiltered)`
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.8_

- [x] 10. Write preservation property tests for schemes display (Bug 8)
  - **Property 2: Preservation** - Empty Search Query Shows All Schemes
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Schemes page with empty `searchQuery` shows full scheme list, banners, and categories on unfixed code
  - Write property-based tests: for all empty or whitespace-only searchQuery values, the full scheme list is displayed unchanged
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline full-list behavior to preserve)
  - _Requirements: 3.7_

- [x] 11. Fix Bug 8 — Wire search query to filter logic in `Client/src/app/(tab)/schemes.tsx`

  - [x] 11.1 Derive `filteredSchemes` from `schemes` filtered by `searchQuery`
    - Add `const filteredSchemes = useMemo(...)` that filters `schemes` by case-insensitive match on `title` and `category` when `searchQuery.trim()` is non-empty; returns full `schemes` array when query is empty
    - _Bug_Condition: searchQuery.trim().length > 0 AND displayedSchemes === schemes (unfiltered)_
    - _Expected_Behavior: displayedSchemes contains only schemes matching searchQuery_
    - _Preservation: When searchQuery is empty, displayedSchemes === schemes (full list)_
    - _Requirements: 2.8, 3.7_

  - [x] 11.2 Replace hardcoded slice derivations with `filteredSchemes`
    - Replace `schemes.slice(1, 4)` with `filteredSchemes.slice(0, 3)` for `recommendedSchemes`
    - Replace `schemes.slice(0, 9)` in `ProgramSection` with `filteredSchemes.slice(0, 9)`
    - _Requirements: 2.8_

  - [x] 11.3 Hide banner and categories when search is active; show no-results message
    - When `searchQuery.trim()` is non-empty, hide `BannerSlideshow` and the categories section
    - When `filteredSchemes` is empty and `searchQuery` is non-empty, show a "No schemes found" message (use existing `t("schemesPage.noSchemesFound")` key)
    - _Requirements: 2.8_

  - [x] 11.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Search Query Filters Displayed Schemes
    - **IMPORTANT**: Re-run the SAME test from task 9 — do NOT write a new test
    - Assert only matching schemes are shown for `searchQuery = "kisan"`
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.8_

  - [x] 11.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Empty Search Query Shows All Schemes
    - **IMPORTANT**: Re-run the SAME tests from task 10 — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [x] 12. Checkpoint Bug 8 — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Bug 13 — Create Event: GPS Location Button Navigates to Wrong Page

- [x] 13. Write bug condition exploration test (Bug 13)
  - **Property 1: Bug Condition** - GPS Button Navigates to Wrong Screen
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Confirm that `router.push` is called with a path that resolves to the admin panel, not the map picker
  - **Scoped PBT Approach**: Scope to the concrete GPS button tap action in `create-event.tsx`
  - Mock `router.push` and simulate a tap on the GPS location button in `create-event.tsx`
  - Assert that `router.push` is called with `{ pathname: "/(auth)/location-picker", params: { purpose: "event-location" } }`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS — `router.push` called with wrong path (resolves to admin panel)
  - Document counterexample: `router.push("/location-picker") → navigates to admin dashboard`
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.13_

- [x] 14. Write preservation property tests for event creation (Bug 13)
  - **Property 2: Preservation** - Event Creation Without GPS Still Works
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Admin can create an event without tapping the GPS button on unfixed code
  - Observe: `useFocusEffect` + `eventLocationPick` handshake already works correctly on unfixed code
  - Write property-based tests: for all event creation flows that do NOT tap the GPS button, event creation succeeds unchanged
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline event creation to preserve)
  - _Requirements: 3.9_

- [x] 15. Fix Bug 13 — Correct GPS navigation path in `Client/src/app/(admin)/create-event.tsx`

  - [x] 15.1 Replace the incorrect `router.push` call with the absolute path
    - Find the GPS location button handler in `create-event.tsx`
    - Replace `router.push("/location-picker")` (or equivalent) with `router.push({ pathname: "/(auth)/location-picker", params: { purpose: "event-location" } })`
    - The `useFocusEffect` + `eventLocationPick` handshake is already correct — do NOT change it
    - _Bug_Condition: screen === "create-event" AND action === "push" AND path resolves inside (admin) group_
    - _Expected_Behavior: router.push called with "/(auth)/location-picker" absolute path_
    - _Preservation: Event creation without GPS button tap continues to work_
    - _Requirements: 2.13, 3.9_

  - [x] 15.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - GPS Button Navigates to Map Picker
    - **IMPORTANT**: Re-run the SAME test from task 13 — do NOT write a new test
    - Assert `router.push` called with `{ pathname: "/(auth)/location-picker", params: { purpose: "event-location" } }`
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.13_

  - [x] 15.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Event Creation Without GPS Still Works
    - **IMPORTANT**: Re-run the SAME tests from task 14 — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [x] 16. Checkpoint Bug 13 — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Bug 15 — Auth Stack: Video Header and Keyboard UX

- [x] 17. Write bug condition exploration test (Bug 15)
  - **Property 1: Bug Condition** - Auth Screens Render Video Component
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Confirm that video components are present in the auth screen render trees
  - **Scoped PBT Approach**: Scope to the six concrete auth screens
  - Render each of: `phone-input`, `otp-input`, `set-password`, `personal-details`, `land-details`, `livestock-details`
  - Assert that NO `AuthVideoBackground` or `VideoView` component is present in the render tree
  - Assert that `KeyboardAvoidingView` at root level uses `behavior={Platform.OS === "ios" ? "padding" : "height"}`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS — `AuthVideoBackground`/`VideoView` found in render tree
  - Document counterexamples: `phone-input renders AuthVideoBackground at h-[55vh]`, `land-details renders VideoView at 28% height`
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.15_

- [x] 18. Write preservation property tests for auth flow navigation (Bug 15)
  - **Property 2: Preservation** - Auth/Onboarding Navigation Sequence Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: phone-input → otp-input → set-password → personal-details → location-picker → land-details → livestock-details → tabs navigation sequence on unfixed code
  - Write property-based tests: for all valid auth flow inputs, each screen navigates to the correct next screen
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline navigation sequence to preserve)
  - _Requirements: 3.1, 3.2, 3.13_

- [x] 19. Fix Bug 15 — Remove video headers and fix KeyboardAvoidingView in auth screens

  - [x] 19.1 Fix `Client/src/app/(auth)/phone-input.tsx`
    - Remove `<AuthVideoBackground>` wrapper and its `<View className="h-[55vh]">` container
    - Remove `AuthVideoBackground` import
    - Replace with a clean static header: solid background color, screen title, subtitle
    - Wrap root `View` in `KeyboardAvoidingView` with `behavior={Platform.OS === "ios" ? "padding" : "height"}` and `style={{ flex: 1 }}`
    - Ensure `ScrollView` is inside `KeyboardAvoidingView`
    - _Bug_Condition: screen === "phone-input" AND rendersVideoComponent(screen)_
    - _Expected_Behavior: No VideoView in render tree; KeyboardAvoidingView at root with correct behavior_
    - _Preservation: Phone input, OTP send, login, forgot-password flows unchanged_
    - _Requirements: 2.15, 3.1, 3.2, 3.13_

  - [x] 19.2 Fix `Client/src/app/(auth)/otp-input.tsx`
    - Remove `<AuthVideoBackground>` wrapper and its `<View className="h-[52vh]">` container
    - Remove `AuthVideoBackground` import
    - Replace with a clean static header
    - Wrap root in `KeyboardAvoidingView` with correct platform behavior at root level
    - _Requirements: 2.15, 3.13_

  - [x] 19.3 Fix `Client/src/app/(auth)/set-password.tsx`
    - Remove `<AuthVideoBackground>` wrapper and its `<View className="h-[52vh]">` container
    - Remove `AuthVideoBackground` import
    - Replace with a clean static header
    - Wrap root in `KeyboardAvoidingView` with correct platform behavior at root level
    - _Requirements: 2.15, 3.13_

  - [x] 19.4 Fix `Client/src/app/(auth)/personal-details.tsx`
    - Remove inline `VideoView`, `useVideoPlayer`, `MediaPath` import, `Dimensions.get("window")`, and `videoHeight` calculation
    - Remove `expo-video` import
    - Replace video header with a clean static header (progress bar at 25%, title, subtitle)
    - Wrap root in `KeyboardAvoidingView` with correct platform behavior at root level
    - _Requirements: 2.15, 3.13_

  - [x] 19.5 Fix `Client/src/app/(auth)/land-details.tsx`
    - Remove inline `VideoView`, `useVideoPlayer`, `MediaPath` import, `Dimensions.get("window")`, and `videoHeight` calculation
    - Remove `expo-video` import
    - Replace video header with a clean static header (progress bar at 75%, title, subtitle)
    - Wrap root in `KeyboardAvoidingView` with correct platform behavior at root level
    - _Requirements: 2.15, 3.13_

  - [x] 19.6 Fix `Client/src/app/(auth)/livestock-details.tsx`
    - Remove inline `VideoView`, `useVideoPlayer`, `MediaPath` import, `Dimensions.get("window")`, and `videoHeight` calculation
    - Remove `expo-video` import
    - Replace video header with a clean static header (progress bar at 100%, title, subtitle)
    - Wrap root in `KeyboardAvoidingView` with correct platform behavior at root level
    - _Requirements: 2.15, 3.13_

  - [x] 19.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Auth Screens Are Full-Screen Without Video
    - **IMPORTANT**: Re-run the SAME test from task 17 — do NOT write a new test
    - Assert no `VideoView` or `AuthVideoBackground` in any auth screen render tree
    - Assert `KeyboardAvoidingView` uses correct platform-conditional behavior prop
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.15_

  - [x] 19.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Auth/Onboarding Navigation Sequence Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 18 — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [x] 20. Checkpoint Bug 15 — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Bugs 2, 3, 4, 5, 6, 9, 10, 11, 12, 14 — Remaining Fixes

- [x] 21. Fix Bug 2 — Location Picker: GPS Unavailable / Tile Referrer Error
  - File: `Client/src/app/(auth)/location-picker.tsx`
  - Configure map tile URL with a valid `User-Agent` header or switch to a tile provider that does not require a referrer header (e.g. use a custom tile server or add `referrerPolicy` config)
  - When GPS is unavailable, center the map on India (lat: 20.5937, lng: 78.9629, zoom: 5) as fallback
  - Show a clear "GPS unavailable — search or drag to your location" banner
  - Ensure tile loading works regardless of GPS state
  - _Requirements: 2.2_

- [x] 22. Fix Bug 3 — Personal Details: Address Not Auto-Updating from Map
  - File: `Client/src/app/personal-details.tsx`
  - In `useFocusEffect`, auto-apply `profileAddressOverride` to form state immediately on focus without requiring a button tap
  - Clear the override from the store after consuming it
  - Ensure geocoded values (state, district, tehsil, village, pinCode) are immediately reflected in the form fields
  - _Requirements: 2.3, 3.4_

- [x] 23. Fix Bug 4 & 5 — Land Details: Seasonal Crop Selector Pre-population
  - Files: `Client/src/app/land-details.tsx`, `Client/src/components/molecules/LandDetailsForm.tsx`
  - Pass existing `rabiCrop`, `kharifCrop`, `zaidCrop` values from `profile.landDetails` as `initialData` to the form
  - Ensure each seasonal crop selector pre-selects the saved values on open
  - Ensure the user can remove or change a selected crop
  - _Requirements: 2.4, 2.5, 3.5_

- [x] 24. Fix Bug 6 — Livestock Icons: Poor Quality
  - File: `Client/src/components/molecules/LivestockDetailsForm.tsx`
  - Audit `ANIMAL_DATA` icon names (`cow`, `sheep`, `goat`, `pig`, `bird`) against `MaterialCommunityIcons` availability on both iOS and Android
  - Replace any icons that render poorly with emoji alternatives (e.g. 🐄 🐃 🐑 🐐 🐷 🐔) or verified icon names
  - Ensure all livestock type representations are clear and recognizable
  - _Requirements: 2.6_

- [x] 25. Fix Bug 9 — Registration: OTP Sent for Already-Registered Phone Number
  - File: `Server/backend/src/controllers/authController.js`
  - Move the duplicate phone number check to BEFORE the OTP dispatch call
  - If the phone number is already registered, return a 409 Conflict response immediately without sending an OTP
  - The client-side `isDuplicatePhoneError` handler in `phone-input.tsx` already shows the inline banner — no client changes needed
  - _Requirements: 2.9, 3.1_

- [x] 26. Fix Bug 10 — Admin CMS: No Edit or Delete for Existing Content
  - File: `Client/src/app/(admin)/content-management.tsx`
  - Add edit (pencil icon) and delete (trash icon) action buttons to each item card in `BannersTab`, `SchemesTab`, and `ProfessionalsTab`
  - Edit: opens a pre-filled modal (reuse the existing create modal) with a PUT/PATCH API call on save
  - Delete: shows a confirmation Alert, then calls the DELETE endpoint and refreshes the list
  - _Requirements: 2.10, 3.8_

- [x] 27. Fix Bug 11 — Admin CMS: Tab Navigation Not Consolidated
  - File: `Client/src/app/(admin)/dashboard.tsx`
  - Update all three CMS navigation entries (Manage Banners, Manage Schemes, Manage Professionals) to push to `/(admin)/content-management`
  - Remove any separate navigation entries for individual CMS sections
  - `content-management.tsx` already has tab switching built in — no changes needed there
  - _Requirements: 2.11_

- [x] 28. Fix Bug 12 — View Attendance Record: Poor UX
  - File: `Client/src/app/(admin)/view-attendance.tsx`
  - Add an event search/filter bar at the top of the event list
  - Add a date filter option
  - Improve the attendee list with clearer present/absent grouping (e.g. two sections: "Attended" and "Registered/Pending")
  - _Requirements: 2.12, 3.11_

- [x] 29. Fix Bug 14 — App Reloads When Notification Is Sent
  - File: `Client/src/app/(admin)/send-notification.tsx`
  - Remove `router.back()` from inside the Alert `onPress` callback in `doSend`
  - Add a `sent` state flag; use `useEffect` to call `router.back()` after the Alert is dismissed (when `sent` becomes true)
  - _Requirements: 2.14_

- [x] 30. Checkpoint — All bugs fixed, all tests pass
  - Run the full test suite (unit + property-based + integration)
  - Verify all 15 bug fixes are complete
  - Ensure all preservation tests still pass
  - Ensure all auth/onboarding flow navigation works end-to-end
  - Ask the user if any questions arise.
