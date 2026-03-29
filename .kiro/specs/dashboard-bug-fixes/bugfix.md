# Bugfix Requirements Document

## Introduction

This document covers four bugs in the Tanak Prabha web dashboard (`Server/dashboard/`) and its supporting backend (`Server/backend/`). The bugs affect the analytics map, the home page activity feed, a duplicated/broken notifications UI, and several accessibility gaps across the dashboard. Fixing these restores correct data display, removes duplicate UI surface area, and brings the dashboard closer to WCAG 2.1 AA compliance.

---

## Bug Analysis

### Bug 1 — Livestock data not showing on the analysis page map

#### Current Behavior (Defect)

1.1 WHEN `LivestockHeatMap` calls `analyticsApi.getLivestockStatistics()` THEN the system returns `{ data: { statistics: { total_cows, total_buffaloes, … } } }` (aggregate totals only), so `res.data?.farmers` is `undefined` and the map renders the "No livestock data available" empty state instead of heatmap points.

1.2 WHEN `analytics/page.jsx` calls `analyticsApi.getLivestockStatistics()` and passes `res.data?.farmers` to `TopLivestockRegions` THEN the system passes `undefined`, so the top-regions table is always empty.

1.3 WHEN the backend `getLivestockStatistics` controller is called THEN the system invokes `LivestockDetails.getStatistics()` which executes a single aggregate `SELECT SUM(…)` query with no `JOIN` to `users`, returning no per-farmer geographic data.

#### Expected Behavior (Correct)

2.1 WHEN `LivestockHeatMap` calls `analyticsApi.getLivestockStatistics()` THEN the system SHALL return `{ data: { farmers: [{ lat, lng, cow, buffalo, goat, sheep, pig, poultry, others }, …] } }` — a per-farmer array with geographic coordinates — so the heatmap renders correctly.

2.2 WHEN `analytics/page.jsx` calls `analyticsApi.getLivestockStatistics()` and passes `res.data?.farmers` to `TopLivestockRegions` THEN the system SHALL supply a populated array so the top-regions table displays real data.

2.3 WHEN the backend `getLivestockStatistics` controller is called THEN the system SHALL execute a query that JOINs `livestock_details` with `users` to produce per-farmer rows containing `lat`/`lng` (from PostGIS `location` column, with district-centroid fallback) alongside individual animal counts.

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN any other analytics endpoint (`/analytics/dashboard`, `/analytics/user-heatmap`, etc.) is called THEN the system SHALL CONTINUE TO return its existing response shape unmodified.

3.2 WHEN `LivestockDetails.getStatistics()` is called directly (e.g., from other code paths) THEN the system SHALL CONTINUE TO return the aggregate statistics object unchanged.

3.3 WHEN a farmer has no GPS location but has a district THEN the system SHALL CONTINUE TO apply the district-centroid coordinate fallback (with jitter) as already done in `getFarmerLocations`.

---

### Bug 2 — Recent activity on the home page not working

#### Current Behavior (Defect)

1.4 WHEN `RecentActivity` calls `analyticsApi.getRecentActivity({ limit: 6 })` THEN the system sends the request with the `X-Dashboard-Api-Key` header but the `authMiddleware` on `GET /analytics/recent-activity` rejects the request with HTTP 401 because the dashboard API key check is not reached before the Bearer token check fails — resulting in an empty activity list or silent error.

1.5 WHEN `authMiddleware` receives a request that carries a valid `X-Dashboard-Api-Key` header THEN the system correctly short-circuits and calls `next()` — however, if the environment variable `DASHBOARD_API_KEY` is not set or mismatched on the deployed instance, the key comparison fails and the request is rejected.

#### Expected Behavior (Correct)

2.4 WHEN `RecentActivity` calls `analyticsApi.getRecentActivity({ limit: 6 })` with a valid `X-Dashboard-Api-Key` header THEN the system SHALL authenticate the request via the dashboard API key path in `authMiddleware`, execute the activity query, and return `{ status: 'success', data: { activities: […] } }`.

2.5 WHEN the `DASHBOARD_API_KEY` environment variable is correctly set on the backend THEN the system SHALL accept all dashboard API key requests to analytics endpoints without requiring a Bearer JWT token.

#### Unchanged Behavior (Regression Prevention)

3.4 WHEN a mobile app user sends a valid Bearer JWT token to any analytics endpoint THEN the system SHALL CONTINUE TO authenticate via the JWT path and return the correct response.

3.5 WHEN neither a valid API key nor a valid JWT is present THEN the system SHALL CONTINUE TO return HTTP 401.

---

### Bug 3 — CMS Announcements tab and Notifications page are duplicated and both broken

#### Current Behavior (Defect)

1.6 WHEN an admin navigates to `/content` THEN the system shows an "Announcements" tab that renders `AnnouncementsManager`, which loads hardcoded mock data via `setTimeout` instead of real API data, duplicating the functionality already present on `/notifications`.

1.7 WHEN an admin navigates to `/notifications` THEN the system shows the `NotificationsPage` which also loads hardcoded mock broadcasts via `setTimeout` instead of real sent-broadcast history.

1.8 WHEN an admin submits the broadcast form on either page THEN the system calls `notificationsApi.broadcast()` which sends `X-Dashboard-Api-Key` — this succeeds at the backend — but the `sent_count` returned from `response.data` is not reliably surfaced because the response shape is `{ data: { db_count, push_count } }` while the frontend reads `response.data?.sent_count`.

#### Expected Behavior (Correct)

2.6 WHEN an admin navigates to `/content` THEN the system SHALL show only "Schemes & Programs" and "Banners" tabs; the "Announcements" tab and `AnnouncementsManager` component SHALL be removed from this page.

2.7 WHEN an admin navigates to `/notifications` THEN the system SHALL be the single authoritative place for composing and reviewing broadcast notifications; mock `setTimeout` data SHALL be replaced with real state (at minimum, the list is empty on load and grows as broadcasts are sent during the session).

2.8 WHEN an admin successfully sends a broadcast THEN the system SHALL read the actual recipient count from `response.data?.db_count` (or `response.data?.push_count`) and display it in the success toast and the broadcast card.

#### Unchanged Behavior (Regression Prevention)

3.6 WHEN an admin navigates to `/content` and uses the "Schemes & Programs" or "Banners" tabs THEN the system SHALL CONTINUE TO render `SchemesGrid` and `BannersManager` without any change in behavior.

3.7 WHEN the broadcast API call fails THEN the system SHALL CONTINUE TO show an error toast and not add a broken entry to the broadcast list.

---

### Bug 4 — Web dashboard accessibility improvements

#### Current Behavior (Defect)

1.9 WHEN a screen reader user encounters the sidebar trigger button (`SidebarTrigger`) or the theme toggle button THEN the system renders icon-only buttons with no `aria-label`, making their purpose undiscoverable.

1.10 WHEN a screen reader user encounters the filter buttons in `LivestockHeatMap` THEN the system renders plain `<button>` elements without `aria-pressed`, so the currently active filter state is not communicated.

1.11 WHEN a screen reader user encounters the `MapContainer` in `LivestockHeatMap` or `HeatmapSection` THEN the system renders the map container with no `aria-label` or accessible description, providing no context about the map's content.

1.12 WHEN a screen reader user encounters loading skeleton elements THEN the system renders `<Skeleton>` components without `role="status"` or `aria-live="polite"`, so loading state changes are not announced.

1.13 WHEN a keyboard user opens a broadcast compose dialog THEN the system relies on Radix `Dialog` for focus trapping (which is correct), but the `Select` components inside the dialog do not have associated `<Label>` `htmlFor`/`id` pairings for the "Notification Type" and "Target Audience" fields in `notifications/page.jsx`.

#### Expected Behavior (Correct)

2.9 WHEN a screen reader user encounters icon-only interactive controls (sidebar trigger, theme toggle) THEN the system SHALL provide a descriptive `aria-label` on each button so its purpose is announced.

2.10 WHEN a screen reader user encounters the livestock filter buttons THEN the system SHALL include `aria-pressed={filter === opt.value}` on each button so the active state is announced.

2.11 WHEN a screen reader user encounters a map container THEN the system SHALL include an `aria-label` (e.g., `"Livestock distribution heatmap"`) and a visually-hidden fallback description on the map wrapper element.

2.12 WHEN loading skeletons are visible THEN the system SHALL include `role="status"` and `aria-label="Loading…"` on the skeleton container so assistive technologies announce the loading state.

2.13 WHEN a keyboard user opens the broadcast compose dialog THEN the system SHALL ensure every form control has a properly associated `<Label>` with matching `htmlFor`/`id`, including the "Notification Type" and "Target Audience" `Select` fields.

#### Unchanged Behavior (Regression Prevention)

3.8 WHEN a sighted mouse user interacts with any of the corrected controls THEN the system SHALL CONTINUE TO render and behave visually identically to the pre-fix state.

3.9 WHEN the `NotificationsPopover` bell button (which already has `aria-label="Open notifications"`) is rendered THEN the system SHALL CONTINUE TO preserve that existing label unchanged.

---

## Bug Condition Summary

### Bug 1 — Livestock map shape mismatch

```pascal
FUNCTION isBugCondition_1(X)
  INPUT: X is a call to GET /analytics/livestock-statistics
  OUTPUT: boolean
  RETURN true  // always triggers — the endpoint never returns per-farmer data
END FUNCTION

// Fix Checking
FOR ALL X WHERE isBugCondition_1(X) DO
  result ← getLivestockStatistics'(X)
  ASSERT result.data.farmers IS ARRAY
  ASSERT EACH f IN result.data.farmers HAS (f.lat, f.lng, f.cow, f.buffalo, f.goat)
END FOR

// Preservation Checking
FOR ALL X WHERE NOT isBugCondition_1(X) DO
  ASSERT F(X) = F'(X)  // other analytics endpoints unchanged
END FOR
```

### Bug 2 — Recent activity auth rejection

```pascal
FUNCTION isBugCondition_2(X)
  INPUT: X is a dashboard request to GET /analytics/recent-activity
  OUTPUT: boolean
  RETURN X carries X-Dashboard-Api-Key AND DASHBOARD_API_KEY env var is set correctly
END FUNCTION

// Fix Checking
FOR ALL X WHERE isBugCondition_2(X) DO
  result ← getRecentActivity'(X)
  ASSERT result.status = 'success'
  ASSERT result.data.activities IS ARRAY
END FOR
```

### Bug 3 — Duplicate announcements UI

```pascal
FUNCTION isBugCondition_3(X)
  INPUT: X is a render of /content page
  OUTPUT: boolean
  RETURN "Announcements" tab IS present in /content TabsList
END FUNCTION

// Fix Checking
FOR ALL X WHERE isBugCondition_3(X) DO
  result ← renderContentPage'(X)
  ASSERT "Announcements" tab IS NOT present
  ASSERT TabsList contains exactly ["Schemes & Programs", "Banners"]
END FOR
```

### Bug 4 — Accessibility gaps

```pascal
FUNCTION isBugCondition_4(X)
  INPUT: X is an icon-only button OR a filter button OR a map container OR a skeleton container
  OUTPUT: boolean
  RETURN X lacks required ARIA attribute (aria-label OR aria-pressed OR role)
END FUNCTION

// Fix Checking
FOR ALL X WHERE isBugCondition_4(X) DO
  result ← renderElement'(X)
  ASSERT result has required ARIA attribute present and non-empty
END FOR
```
