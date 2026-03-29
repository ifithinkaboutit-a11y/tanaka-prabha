# Implementation Plan

- [ ] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Livestock API / Content Page / Broadcast Count / ARIA Attributes
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope each property to the concrete failing case(s) to ensure reproducibility
  - Bug 1 — Call `getLivestockStatistics` controller with a mocked DB that has farmer rows → assert `response.data.farmers` is an array with `lat`/`lng` fields → FAILS on unfixed code (returns `undefined`)
  - Bug 3a — Render `/content/page.jsx` → assert `TabsList` has exactly 2 triggers ("Schemes & Programs", "Banners") → FAILS on unfixed code (has 3 tabs)
  - Bug 3b — Call `handleSendBroadcast` with a mocked response `{ data: { db_count: 18 } }` → assert toast shows "18 farmers" → FAILS on unfixed code (shows "0 farmers" because `sent_count` is `undefined`)
  - Bug 4 — Render `LivestockHeatMap`, `app-sidebar`, and notifications skeleton → query for `aria-pressed`, `aria-label`, `role="status"` → FAILS on unfixed code (attributes absent)
  - Run all tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found (e.g., `response.data.farmers` is `undefined`; tab count is 3; toast shows "0 farmers"; `aria-pressed` absent on filter buttons)
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Other Analytics Endpoints / Auth Paths / Content Tabs / Broadcast Error Path / Visual Appearance
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: other analytics endpoints (`/analytics/dashboard`, `/analytics/user-heatmap`, `/analytics/farmer-locations`) return their existing response shapes on unfixed code
  - Observe: valid Bearer JWT tokens authenticate correctly through `authMiddleware` on unfixed code
  - Observe: requests with neither a valid API key nor a valid JWT receive HTTP 401 on unfixed code
  - Observe: "Schemes & Programs" and "Banners" tabs in `/content` render `SchemesGrid` and `BannersManager` on unfixed code
  - Observe: a failed broadcast API call shows an error toast and does not add an entry to the list on unfixed code
  - Write property-based tests: for all analytics endpoints other than `/analytics/livestock-statistics`, response shape is unchanged after fix
  - Write property-based tests: for all `authMiddleware` inputs that are not the bug condition (valid JWT, no credentials), behavior is identical before and after fix
  - Write property-based tests: for all broadcast API response shapes, recipient count is always `db_count || push_count || 0` and never `sent_count`
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ] 3. Fix Bug 1 — Livestock map shape mismatch

  - [x] 3.1 Add `LivestockDetails.getFarmersWithLocations()` model method
    - Add new static method to `Server/backend/src/models/LivestockDetails.js`
    - JOIN `livestock_details` with `users` on `user_id = id`
    - For users with PostGIS `location`: extract `ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng`
    - For users with no GPS but a `district`: apply district-centroid lookup with jitter (import `DISTRICT_COORDS` from `analyticsController.js` or duplicate the map)
    - Return array of `{ id, name, village, district, lat, lng, cow, buffalo, goat, sheep, pig, poultry, others }`
    - _Bug_Condition: isBugCondition_1(X) — every call to GET /analytics/livestock-statistics; `LivestockDetails.getStatistics()` returns no per-farmer rows_
    - _Expected_Behavior: result.data.farmers is an array; each element has lat, lng, and individual animal counts_
    - _Preservation: `LivestockDetails.getStatistics()` is NOT modified; aggregate stats remain available_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

  - [x] 3.2 Update `getLivestockStatistics` controller to return per-farmer data
    - In `Server/backend/src/controllers/analyticsController.js`, update `getLivestockStatistics`
    - Call `LivestockDetails.getFarmersWithLocations()` and `LivestockDetails.getStatistics()` in parallel (`Promise.all`)
    - Return `{ data: { farmers: [...], statistics: {...} } }` — keeps backward compat while adding the farmers array
    - _Bug_Condition: isBugCondition_1(X) — response.data.farmers is undefined_
    - _Expected_Behavior: response.data.farmers is a populated array with lat/lng per farmer_
    - _Preservation: response.data.statistics still present; all other analytics endpoints unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

  - [ ] 3.3 Verify bug condition exploration test now passes (Bug 1)
    - **Property 1: Expected Behavior** - Livestock API Returns Per-Farmer Geographic Data
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - Run the livestock API shape test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms `response.data.farmers` is now a populated array with lat/lng)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.4 Verify preservation tests still pass after Bug 1 fix
    - **Property 2: Preservation** - Other Analytics Endpoints Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation tests for other analytics endpoints and `getStatistics()` direct calls
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in other endpoints)

- [ ] 4. Fix Bug 2 — Auth middleware missing env var warning

  - [x] 4.1 Add startup warning log when `DASHBOARD_API_KEY` is not set
    - In `Server/backend/src/middlewares/authMiddleware.js`, add at module load time:
      ```js
      if (!process.env.DASHBOARD_API_KEY) {
        console.warn('[authMiddleware] WARNING: DASHBOARD_API_KEY env var is not set. Using hardcoded fallback — set this in production.');
      }
      ```
    - No logic change to the middleware itself; the existing key-first check is correct
    - _Bug_Condition: isBugCondition_2(X) — DASHBOARD_API_KEY env var is not set or mismatched; isDashboardRequest returns false silently_
    - _Expected_Behavior: console.warn is emitted at startup when env var is missing, making misconfiguration immediately visible in server logs_
    - _Preservation: JWT auth path and 401 path are completely unchanged; no logic change to isDashboardRequest or authMiddleware_
    - _Requirements: 2.4, 2.5, 3.4, 3.5_

  - [ ] 4.2 Verify preservation tests still pass after Bug 2 fix
    - **Property 2: Preservation** - Auth Paths Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation tests for JWT auth path and 401 path
    - **EXPECTED OUTCOME**: Tests PASS (confirms valid JWT and no-credentials paths are unaffected)

- [ ] 5. Fix Bug 3 — Duplicate Announcements UI and broken broadcast count

  - [x] 5.1 Remove Announcements tab from `/content/page.jsx`
    - In `Server/dashboard/src/app/(page)/content/page.jsx`:
      - Remove `import { AnnouncementsManager } from "@/components/announcements-manager"`
      - Change `grid-cols-3` to `grid-cols-2` on `TabsList`
      - Remove the `<TabsTrigger value="announcements">Announcements</TabsTrigger>` element
      - Remove the `<TabsContent value="announcements">` block and its `<AnnouncementsManager />` child
    - _Bug_Condition: isBugCondition_3a(X) — "Announcements" tab is present in /content TabsList_
    - _Expected_Behavior: /content renders exactly 2 tabs: "Schemes & Programs" and "Banners"_
    - _Preservation: SchemesGrid and BannersManager tabs render without any behavioral change_
    - _Requirements: 2.6, 3.6_

  - [x] 5.2 Fix `loadBroadcasts` mock data and broadcast recipient count in `notifications/page.jsx`
    - In `Server/dashboard/src/app/(page)/notifications/page.jsx`:
      - Replace `loadBroadcasts` mock `setTimeout` with `setBroadcasts([]); setLoading(false)` — list starts empty and grows as broadcasts are sent during the session
      - Fix recipient count read: change `response.data?.sent_count || 0` to `response.data?.db_count || response.data?.push_count || 0`
    - _Bug_Condition: isBugCondition_3b(X) — frontend reads response.data?.sent_count which is undefined; actual fields are db_count / push_count_
    - _Expected_Behavior: toast shows correct non-zero recipient count; broadcast card shows correct count_
    - _Preservation: failed broadcast API call still shows error toast and does not add broken entry to list_
    - _Requirements: 2.7, 2.8, 3.7_

  - [ ] 5.3 Verify bug condition exploration tests now pass (Bug 3)
    - **Property 1: Expected Behavior** - Content Page Has No Announcements Tab / Broadcast Count Read Correctly
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - Run the content page tab count test and broadcast count test from step 1
    - **EXPECTED OUTCOME**: Tests PASS (tab count is 2; toast shows correct recipient count)
    - _Requirements: 2.6, 2.7, 2.8_

  - [ ] 5.4 Verify preservation tests still pass after Bug 3 fix
    - **Property 2: Preservation** - Content Tabs and Broadcast Error Path Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation tests for "Schemes & Programs"/"Banners" tabs and broadcast error path
    - **EXPECTED OUTCOME**: Tests PASS (no regressions in existing content tabs or error handling)

- [ ] 6. Fix Bug 4 — Accessibility gaps

  - [x] 6.1 Add `aria-label` to `SidebarTrigger` in `app-sidebar.jsx`
    - In `Server/dashboard/src/components/app-sidebar.jsx`:
      - Add `aria-label="Toggle sidebar"` to `<SidebarTrigger />`
    - _Bug_Condition: isBugCondition_4(X) — SidebarTrigger renders icon-only button with no aria-label_
    - _Expected_Behavior: aria-label="Toggle sidebar" present on the button_
    - _Preservation: visual appearance unchanged for sighted mouse users_
    - _Requirements: 2.9, 3.8_

  - [x] 6.2 Add `aria-pressed` to filter buttons and `aria-label` to `MapContainer` in `LivestockHeatMap.jsx`
    - In `Server/dashboard/src/components/dashboard/LivestockHeatMap.jsx`:
      - Add `aria-pressed={filter === opt.value}` to each filter `<button>` in the `FILTER_OPTIONS.map`
      - Add `aria-label="Livestock distribution heatmap"` to `<MapContainer>`
    - _Bug_Condition: isBugCondition_4(X) — filter buttons lack aria-pressed; MapContainer lacks aria-label_
    - _Expected_Behavior: active filter state announced to screen readers; map container has accessible description_
    - _Preservation: visual appearance and filter behavior unchanged_
    - _Requirements: 2.10, 2.11, 3.8_

  - [x] 6.3 Add ARIA attributes to skeleton container and fix Select label associations in `notifications/page.jsx`
    - In `Server/dashboard/src/app/(page)/notifications/page.jsx`:
      - Add `role="status"` and `aria-label="Loading"` to the skeleton container `<div>` in the loading return
      - Add `id="broadcast-type"` to the "Notification Type" `<SelectTrigger>` and `htmlFor="broadcast-type"` to its `<Label>`
      - Add `id="broadcast-district"` to the "Target Audience" `<SelectTrigger>` and `htmlFor="broadcast-district"` to its `<Label>`
    - _Bug_Condition: isBugCondition_4(X) — skeleton container lacks role="status"; Select fields lack htmlFor/id pairing_
    - _Expected_Behavior: loading state announced by assistive technologies; form controls programmatically associated with labels_
    - _Preservation: visual appearance of dialog and loading state unchanged_
    - _Requirements: 2.12, 2.13, 3.8, 3.9_

  - [ ] 6.4 Verify bug condition exploration tests now pass (Bug 4)
    - **Property 1: Expected Behavior** - Required ARIA Attributes Present
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - Run the ARIA attribute tests from step 1
    - **EXPECTED OUTCOME**: Tests PASS (aria-pressed, aria-label, role="status", htmlFor/id all present)
    - _Requirements: 2.9, 2.10, 2.11, 2.12, 2.13_

  - [ ] 6.5 Verify preservation tests still pass after Bug 4 fix
    - **Property 2: Preservation** - Visual Appearance Unchanged / NotificationsPopover aria-label Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation tests for visual appearance and existing `aria-label="Open notifications"` on the bell button
    - **EXPECTED OUTCOME**: Tests PASS (no visual regressions; existing ARIA labels unchanged)

- [ ] 7. Checkpoint — Ensure all tests pass
  - Re-run the full test suite (exploration tests + preservation tests)
  - Confirm Property 1 (Bug Condition) tests all pass — bugs are fixed
  - Confirm Property 2 (Preservation) tests all pass — no regressions introduced
  - Ensure all tests pass; ask the user if questions arise
