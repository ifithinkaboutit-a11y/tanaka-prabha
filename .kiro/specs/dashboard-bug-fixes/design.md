# Dashboard Bug Fixes — Bugfix Design

## Overview

This document covers the design for fixing four bugs in the Tanak Prabha web dashboard and its supporting backend. The bugs are:

1. **Livestock map empty** — `getLivestockStatistics` returns only aggregate totals; the frontend needs per-farmer rows with lat/lng to render the heatmap.
2. **Recent activity 401** — `authMiddleware` correctly checks the dashboard API key first, but the `DASHBOARD_API_KEY` env var may be unset or mismatched on the deployed instance, causing silent 401s.
3. **Duplicate Announcements UI** — `/content` page has a third "Announcements" tab that duplicates `/notifications` and uses mock `setTimeout` data; the broadcast response shape is also misread.
4. **Accessibility gaps** — Icon-only buttons, filter buttons, map containers, and skeleton loaders are missing required ARIA attributes.

The fix strategy is minimal and targeted: add one new model method, update one controller, harden one middleware, remove one tab + import, fix one response field read, and add ARIA attributes to four component files.

---

## Glossary

- **Bug_Condition (C)**: The condition that identifies a buggy input or render state.
- **Property (P)**: The desired correct behavior when the bug condition holds.
- **Preservation**: Existing behavior that must remain unchanged after the fix.
- **`getLivestockStatistics`**: Controller in `analyticsController.js` that handles `GET /analytics/livestock-statistics`.
- **`LivestockDetails.getStatistics()`**: Model method returning aggregate SUM totals only — no per-farmer rows.
- **`LivestockDetails.getFarmersWithLocations()`**: New model method (to be added) that JOINs `livestock_details` with `users` and returns per-farmer rows with lat/lng.
- **`authMiddleware`**: Express middleware in `authMiddleware.js` that checks `X-Dashboard-Api-Key` before falling through to JWT verification.
- **`DASHBOARD_API_KEY`**: Environment variable whose value must match the header sent by the dashboard frontend.
- **`AnnouncementsManager`**: Component imported in `/content/page.jsx` that duplicates the notifications page.
- **`db_count` / `push_count`**: Fields returned by the broadcast API response; the frontend was incorrectly reading `sent_count`.

---

## Bug Details

### Bug 1 — Livestock Map Shape Mismatch

#### Bug Condition

The bug manifests on every call to `GET /analytics/livestock-statistics`. The controller calls `LivestockDetails.getStatistics()`, which runs a single aggregate `SELECT SUM(…)` with no JOIN to `users`, so it never returns per-farmer geographic data. The frontend reads `res.data?.farmers` which is always `undefined`.

**Formal Specification:**
```
FUNCTION isBugCondition_1(X)
  INPUT: X is a call to GET /analytics/livestock-statistics
  OUTPUT: boolean

  RETURN LivestockDetails.getStatistics() does NOT return per-farmer rows
         AND response.data.farmers IS undefined
END FUNCTION
```

#### Examples

- `LivestockHeatMap` calls `analyticsApi.getLivestockStatistics()` → `res.data.farmers` is `undefined` → `setFarmers([])` → map shows "No livestock data available" even when 50 farmers have livestock records.
- `analytics/page.jsx` passes `res.data?.farmers` to `TopLivestockRegions` → receives `undefined` → top-regions table is always empty.
- A farmer with `cow=5`, `district="Kamrup"`, no GPS point → should appear on map via district-centroid fallback → currently never included.

---

### Bug 2 — Recent Activity Auth Rejection

#### Bug Condition

The `authMiddleware` logic is structurally correct (API key check runs before JWT check). The bug is environmental: if `DASHBOARD_API_KEY` is not set in the deployed `.env`, the fallback value `'tanak-prabha-dashboard-secret-key-2024'` is used server-side, but the frontend may be sending a different key (or the env var is set to a different value), causing the comparison to fail silently and return 401.

**Formal Specification:**
```
FUNCTION isBugCondition_2(X)
  INPUT: X is a dashboard request to GET /analytics/recent-activity
  OUTPUT: boolean

  RETURN X.headers['x-dashboard-api-key'] IS SET
         AND process.env.DASHBOARD_API_KEY IS NOT SET or MISMATCHED
         AND isDashboardRequest(X) returns false
END FUNCTION
```

#### Examples

- Backend deployed without `DASHBOARD_API_KEY` in env → middleware uses hardcoded fallback → frontend sends the correct key from its own env → mismatch → 401 → `RecentActivity` shows empty state.
- `DASHBOARD_API_KEY` set to `""` (empty string) → `isDashboardRequest` returns false for any non-empty key → 401.
- Fix: add a startup warning log when `DASHBOARD_API_KEY` is not set, so the misconfiguration is immediately visible in server logs.

---

### Bug 3 — Duplicate Announcements UI and Broken Broadcast Count

#### Bug Condition

Two separate conditions compose this bug:

**3a — Duplicate tab:**
```
FUNCTION isBugCondition_3a(X)
  INPUT: X is a render of /content page
  OUTPUT: boolean

  RETURN "Announcements" tab IS present in /content TabsList
END FUNCTION
```

**3b — Wrong response field:**
```
FUNCTION isBugCondition_3b(X)
  INPUT: X is a successful broadcast API response
  OUTPUT: boolean

  RETURN frontend reads response.data?.sent_count
         AND response.data.sent_count IS undefined
         AND response.data.db_count OR response.data.push_count IS the actual value
END FUNCTION
```

#### Examples

- Admin navigates to `/content` → sees three tabs including "Announcements" → clicks it → sees mock data seeded via `setTimeout`, not real broadcasts.
- Admin sends a broadcast → API returns `{ db_count: 18, push_count: 15 }` → frontend reads `sent_count` → gets `undefined` → toast shows "Broadcast sent to 0 farmers".
- `/notifications` page also seeds mock data via `setTimeout` on load → should start empty and grow as broadcasts are sent.

---

### Bug 4 — Accessibility Gaps

#### Bug Condition

```
FUNCTION isBugCondition_4(X)
  INPUT: X is a rendered interactive or dynamic element
  OUTPUT: boolean

  RETURN (X is icon-only button AND X.aria-label IS missing)
      OR (X is livestock filter button AND X.aria-pressed IS missing)
      OR (X is MapContainer AND X.aria-label IS missing)
      OR (X is skeleton container AND X.role IS NOT "status")
      OR (X is Select in broadcast dialog AND associated Label has no htmlFor/id pairing)
END FUNCTION
```

#### Examples

- `SidebarTrigger` renders a `<button>` with only a hamburger icon → no `aria-label` → screen reader announces "button" with no context.
- `ThemeToggle` has `<span className="sr-only">Toggle theme</span>` inside the trigger → this is already accessible; no change needed here.
- Livestock filter buttons: `<button onClick={() => setFilter(opt.value)}>` → no `aria-pressed` → active filter state invisible to screen readers.
- `<MapContainer>` in `LivestockHeatMap` → no `aria-label` → screen reader user has no context.
- Skeleton containers in `notifications/page.jsx` loading state → no `role="status"` → loading not announced.
- "Notification Type" and "Target Audience" `<Select>` in broadcast dialog → `<Label>` has no `htmlFor`, `<SelectTrigger>` has no `id` → not programmatically associated.

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All other analytics endpoints (`/analytics/dashboard`, `/analytics/user-heatmap`, `/analytics/farmer-locations`, etc.) must return their existing response shapes unmodified.
- `LivestockDetails.getStatistics()` must continue to return the aggregate statistics object — it is not removed or modified.
- JWT-authenticated mobile app requests to any analytics endpoint must continue to work exactly as before.
- Requests with neither a valid API key nor a valid JWT must continue to receive HTTP 401.
- The "Schemes & Programs" and "Banners" tabs in `/content` must render `SchemesGrid` and `BannersManager` without any behavioral change.
- Failed broadcast API calls must continue to show an error toast and not add a broken entry to the list.
- The `NotificationsPopover` bell button's existing `aria-label="Open notifications"` must be preserved unchanged.
- All visual appearance of corrected controls must remain identical to the pre-fix state for sighted mouse users.

**Scope:**
All inputs that do NOT match the four bug conditions above should be completely unaffected by this fix.

---

## Hypothesized Root Cause

### Bug 1
1. **Missing JOIN query**: `LivestockDetails.getStatistics()` was written for aggregate dashboard stats only. No method exists to return per-farmer rows with location data. The controller was never updated when `LivestockHeatMap` was built to expect a `farmers` array.
2. **Response shape assumption**: The frontend component was written assuming the API would return `{ data: { farmers: [...] } }` but the backend was never updated to match.

### Bug 2
1. **Environment variable misconfiguration**: The `authMiddleware` logic is correct. The root cause is purely operational — `DASHBOARD_API_KEY` is not set (or set incorrectly) in the deployed backend environment, causing the hardcoded fallback to be used server-side while the frontend sends a different value.
2. **Silent failure**: No warning is logged when the env var is missing, making the misconfiguration hard to diagnose.

### Bug 3
1. **Copy-paste duplication**: `AnnouncementsManager` was added to `/content` as a convenience but duplicates `/notifications`. Neither was connected to a real data source.
2. **Response field name mismatch**: The broadcast API returns `db_count` and `push_count` but the frontend reads `sent_count` — a field that doesn't exist in the response.
3. **Mock data on load**: `loadBroadcasts()` uses `setTimeout` to seed fake data instead of starting with an empty list.

### Bug 4
1. **Icon-only buttons**: `SidebarTrigger` (from the shadcn/ui sidebar primitive) renders without an `aria-label` by default; it needs one passed as a prop or added to the wrapper.
2. **Filter buttons**: Built as plain `<button>` elements with only visual active-state styling; `aria-pressed` was not included.
3. **Map container**: `MapContainer` from react-leaflet accepts standard HTML attributes; `aria-label` was simply not added.
4. **Skeleton containers**: The loading skeleton `<div>` wrappers lack `role="status"` and `aria-label`.
5. **Select labels**: The broadcast dialog uses `<Label>` without `htmlFor` and `<SelectTrigger>` without `id` for the type and district selects.

---

## Correctness Properties

Property 1: Bug Condition — Livestock API Returns Per-Farmer Geographic Data

_For any_ call to `GET /analytics/livestock-statistics`, the fixed `getLivestockStatistics` controller SHALL return a response where `data.farmers` is an array of objects each containing `{ lat, lng, cow, buffalo, goat, sheep, pig, poultry, others }`, enabling the heatmap to render correctly.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation — Other Analytics Endpoints Unchanged

_For any_ call to any analytics endpoint other than `GET /analytics/livestock-statistics`, the fixed code SHALL produce exactly the same response as the original code, preserving all existing endpoint behavior.

**Validates: Requirements 3.1, 3.2, 3.3**

Property 3: Bug Condition — Auth Middleware Logs Missing Key Warning

_For any_ startup of the backend server where `DASHBOARD_API_KEY` is not set in the environment, the fixed `authMiddleware` module SHALL emit a `console.warn` so the misconfiguration is immediately visible in server logs.

**Validates: Requirements 2.4, 2.5**

Property 4: Preservation — Auth Paths Unchanged

_For any_ request carrying a valid Bearer JWT token, the fixed `authMiddleware` SHALL authenticate it identically to the original. _For any_ request with neither a valid API key nor a valid JWT, it SHALL continue to return HTTP 401.

**Validates: Requirements 3.4, 3.5**

Property 5: Bug Condition — Content Page Has No Announcements Tab

_For any_ render of `/content/page.jsx`, the fixed component SHALL render exactly two tabs ("Schemes & Programs" and "Banners") and SHALL NOT render an "Announcements" tab or import `AnnouncementsManager`.

**Validates: Requirements 2.6**

Property 6: Bug Condition — Broadcast Recipient Count Read Correctly

_For any_ successful broadcast API response, the fixed `handleSendBroadcast` function SHALL read the recipient count as `response.data?.db_count || response.data?.push_count || 0` and display the correct non-zero value in the toast and broadcast card.

**Validates: Requirements 2.7, 2.8**

Property 7: Bug Condition — Required ARIA Attributes Present

_For any_ render of an icon-only button, livestock filter button, map container, skeleton container, or broadcast dialog Select field that previously lacked required ARIA attributes, the fixed component SHALL include the correct attribute (`aria-label`, `aria-pressed`, `role="status"`, or `htmlFor`/`id` pairing) with a non-empty value.

**Validates: Requirements 2.9, 2.10, 2.11, 2.12, 2.13**

Property 8: Preservation — Visual Appearance Unchanged

_For any_ sighted mouse user interaction with the corrected controls, the fixed components SHALL render and behave visually identically to the pre-fix state.

**Validates: Requirements 3.8, 3.9**

---

## Fix Implementation

### Bug 1 — Livestock Map

**File**: `Server/backend/src/models/LivestockDetails.js`

**Change**: Add new static method `getFarmersWithLocations()`:
- JOIN `livestock_details` with `users` on `user_id = id`
- For users with a PostGIS `location` point: extract `ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng`
- For users with no GPS but a `district`: apply district-centroid lookup with jitter (reuse `DISTRICT_COORDS` pattern from `analyticsController.js`)
- Return array of `{ id, name, village, district, lat, lng, cow, buffalo, goat, sheep, pig, poultry, others }`

**File**: `Server/backend/src/controllers/analyticsController.js`

**Function**: `getLivestockStatistics`

**Change**: Call both `LivestockDetails.getFarmersWithLocations()` and `LivestockDetails.getStatistics()` in parallel. Return:
```json
{ "data": { "farmers": [...], "statistics": {...} } }
```
This keeps backward compat (statistics still present) while adding the farmers array the frontend needs.

---

### Bug 2 — Auth Middleware

**File**: `Server/backend/src/middlewares/authMiddleware.js`

**Change**: At module load time, add:
```js
if (!process.env.DASHBOARD_API_KEY) {
  console.warn('[authMiddleware] WARNING: DASHBOARD_API_KEY env var is not set. Using hardcoded fallback — set this in production.');
}
```
No logic change to the middleware itself; the existing key-first check is correct.

---

### Bug 3 — Duplicate Announcements UI

**File**: `Server/dashboard/src/app/(page)/content/page.jsx`

**Changes**:
1. Remove `import { AnnouncementsManager } from "@/components/announcements-manager"`
2. Change `grid-cols-3` to `grid-cols-2` on `TabsList`
3. Remove the `<TabsTrigger value="announcements">` and its `<TabsContent>` block

**File**: `Server/dashboard/src/app/(page)/notifications/page.jsx`

**Changes**:
1. Replace `loadBroadcasts` mock `setTimeout` with `setBroadcasts([]); setLoading(false)` — list starts empty and grows as broadcasts are sent.
2. Fix recipient count: `response.data?.sent_count` → `response.data?.db_count || response.data?.push_count || 0`

---

### Bug 4 — Accessibility

**File**: `Server/dashboard/src/components/app-sidebar.jsx`

**Change**: Add `aria-label="Toggle sidebar"` to `<SidebarTrigger />`.

**File**: `Server/dashboard/src/components/dashboard/LivestockHeatMap.jsx`

**Changes**:
1. Add `aria-pressed={filter === opt.value}` to each filter `<button>`.
2. Add `aria-label="Livestock distribution heatmap"` to `<MapContainer>`.

**File**: `Server/dashboard/src/app/(page)/notifications/page.jsx`

**Changes** (in addition to Bug 3 fixes):
1. Skeleton container `<div>`: add `role="status"` and `aria-label="Loading"`.
2. "Notification Type" `<Select>`: add `id="broadcast-type"` to `<SelectTrigger>` and `htmlFor="broadcast-type"` to its `<Label>`.
3. "Target Audience" `<Select>`: add `id="broadcast-district"` to `<SelectTrigger>` and `htmlFor="broadcast-district"` to its `<Label>`.

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Write tests that call the affected functions/render the affected components with inputs matching each bug condition. Run on UNFIXED code to observe failures.

**Test Cases**:
1. **Livestock API shape test**: Call `getLivestockStatistics` controller with a mocked DB that has farmer rows → assert `response.data.farmers` is an array → will fail on unfixed code (returns `undefined`).
2. **Auth key mismatch test**: Call `authMiddleware` with a valid `X-Dashboard-Api-Key` header but `DASHBOARD_API_KEY` env var unset → assert `next()` is called → will fail (returns 401) if env var is missing.
3. **Content page tab count test**: Render `/content/page.jsx` → assert `TabsList` has exactly 2 triggers → will fail on unfixed code (has 3).
4. **Broadcast count test**: Call `handleSendBroadcast` with a mocked response `{ data: { db_count: 18 } }` → assert toast shows "18 farmers" → will fail on unfixed code (shows "0 farmers").
5. **ARIA attribute tests**: Render each affected component → query for `aria-label`, `aria-pressed`, `role="status"` → will fail on unfixed code.

**Expected Counterexamples**:
- `response.data.farmers` is `undefined` in livestock controller response.
- `authMiddleware` returns 401 when env var is unset.
- `/content` renders 3 tabs.
- Broadcast toast shows "0 farmers" despite successful send.
- ARIA attributes absent on filter buttons, map container, skeleton wrappers.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code produces the expected behavior.

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition_1(X) DO
  result := getLivestockStatistics_fixed(X)
  ASSERT result.data.farmers IS ARRAY
  ASSERT EACH f IN result.data.farmers HAS (f.lat, f.lng)
END FOR

FOR ALL X WHERE isBugCondition_3b(X) DO
  result := handleSendBroadcast_fixed(X)
  ASSERT displayedCount = response.data.db_count OR response.data.push_count
END FOR

FOR ALL X WHERE isBugCondition_4(X) DO
  element := renderElement_fixed(X)
  ASSERT element has required ARIA attribute present and non-empty
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition_1(X) DO
  ASSERT getLivestockStatistics_original(X) = getLivestockStatistics_fixed(X)
  // other analytics endpoints: response shape unchanged
END FOR

FOR ALL X WHERE NOT isBugCondition_2(X) DO
  ASSERT authMiddleware_original(X) = authMiddleware_fixed(X)
  // JWT path and 401 path unchanged
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because it generates many test cases automatically and catches edge cases that manual unit tests might miss.

**Test Cases**:
1. **Other analytics endpoints**: Verify `/analytics/dashboard`, `/analytics/user-heatmap`, `/analytics/farmer-locations` return identical shapes before and after fix.
2. **JWT auth path**: Verify valid Bearer tokens still authenticate correctly after middleware change.
3. **Content page existing tabs**: Verify "Schemes & Programs" and "Banners" tabs render `SchemesGrid` and `BannersManager` unchanged.
4. **Broadcast error path**: Verify failed broadcast API call still shows error toast and does not add entry to list.
5. **Visual regression**: Verify sighted-user visual appearance of corrected controls is unchanged.

### Unit Tests

- Test `LivestockDetails.getFarmersWithLocations()` with mocked DB rows (GPS present, GPS absent with district, GPS absent without district).
- Test `getLivestockStatistics` controller returns `{ data: { farmers: [...], statistics: {...} } }`.
- Test `authMiddleware` with: valid API key + env var set, valid API key + env var unset, valid JWT, no credentials.
- Test `handleSendBroadcast` reads `db_count` and `push_count` correctly.
- Test `/content/page.jsx` renders exactly 2 tabs.
- Test each ARIA attribute is present on corrected elements.

### Property-Based Tests

- Generate random arrays of farmer objects with varying livestock counts and location data → verify `getFarmersWithLocations` returns correct lat/lng for each case.
- Generate random broadcast API response shapes → verify recipient count is always `db_count || push_count || 0` and never `sent_count`.
- Generate random sets of filter values → verify each filter button has `aria-pressed` matching the active filter state.

### Integration Tests

- Full analytics page render: verify livestock heatmap shows points when farmers exist in DB.
- Full notifications page flow: send a broadcast → verify it appears in the list with correct recipient count.
- Full content page render: verify only 2 tabs are present and both work correctly.
- Screen reader simulation: verify ARIA attributes are present and correctly describe each element.
