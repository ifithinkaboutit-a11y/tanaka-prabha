# Implementation Plan: Maps & Location

## Overview

Incremental improvements to the existing OSM/Leaflet/Nominatim location picker. Tasks are ordered so each step compiles and runs independently. Pure utility functions are extracted first so property tests can import them early. UI layers are added on top of a stable foundation.

## Tasks

- [x] 1. Constant rename and schema changes (foundational, no behaviour change)
  - [x] 1.1 Rename `GPS_TIMEOUT_MS` → `GPS_ACQUISITION_TIMEOUT_MS` in `(auth)/location-picker.tsx` and update every reference in that file
    - Add new constant `GPS_ACCURACY_THRESHOLD_M = 100` below the renamed constant
    - Add new constants `POLYGON_MAX_PINS = 20`, `SEARCH_PRIMARY_MAX_LEN = 40`, `SEARCH_SUBTITLE_MAX_LEN = 60`
    - _Requirements: 4.6, 4.7_
  - [x] 1.2 Add optional `polygon` field to `LocationData` interface in `onboardingStore.ts`
    - Field signature: `polygon?: Array<{ lat: number; lng: number }>`
    - Add JSDoc comment explaining backwards-compatibility with existing AsyncStorage records
    - _Requirements: 3 (schema note)_

- [x] 2. Extract and export pure utility functions
  - [x] 2.1 Rename `getDistanceFromLatLonInKm` → `haversineDistanceKm` in `reverseGeocode.ts` and export it
    - Keep the existing implementation; only rename and add `export`
    - Update the internal call site inside `getClosestLocation`
    - _Requirements: 7.1_
  - [x] 2.2 Add and export `computePolygonAreaHectares` in `reverseGeocode.ts`
    - Implement using the spherical excess (shoelace) formula on lat/lng coordinates
    - Return 0 for fewer than 3 vertices or degenerate (all-same-point) polygons
    - _Requirements: 3.9_
  - [x] 2.3 Export pure helper functions from `(auth)/location-picker.tsx`
    - `formatAccuracyLabel(accuracyM: number): string` — returns `"±Xm"`
    - `shouldWarn(accuracyM: number, thresholdM: number): boolean` — returns `accuracyM > thresholdM`
    - `truncate(s: string, maxLen: number): string` — appends "…" if over limit
    - `extractPrimaryName(displayName: string): string` — first comma-separated segment, trimmed
    - `extractSubtitle(address: NominatimAddress): string` — `(state_district || county) + ", " + state`
    - Define the `NominatimAddress` interface in the same file
    - _Requirements: 1.2, 4.1, 5.1, 5.2, 5.3_

- [x] 3. Fix closest sub-location algorithm in `reverseGeocode.ts`
  - [x] 3.1 Rewrite `getClosestLocation` to do a four-pass haversine search
    - Pass 1: find closest district across all states (existing logic, now uses `haversineDistanceKm`)
    - Pass 2: within that district, iterate all tehsils and pick the one with minimum haversine distance (where coordinate data exists); fall back to first entry if no coords
    - Pass 3: within that tehsil, iterate all blocks and pick closest by haversine; fall back to first entry
    - Pass 4: within that block, iterate all villages and pick closest by haversine; fall back to first entry
    - Keep the existing 500 km guard that returns empty strings
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 4. GPS accuracy indicator
  - [x] 4.1 Add accuracy circle and label to `buildLeafletHTML` in `(auth)/location-picker.tsx`
    - Declare `accuracyCircle = null` in the Leaflet script block
    - Implement `window.setAccuracyCircle(lat, lng, radiusM)` using `L.circle` with green fill (`#386641`, `fillOpacity: 0.12`)
    - Implement `window.hideAccuracyCircle()` that removes the circle layer
    - _Requirements: 1.1_
  - [x] 4.2 Wire accuracy state into the React Native layer
    - Add state `accuracyCircleVisible` (boolean) and `gpsAccuracy` already exists — use it
    - After GPS acquisition succeeds, call `injectJavaScript` with `setAccuracyCircle(lat, lng, accuracy)`
    - On `move` WebView message (user drags map), call `hideAccuracyCircle()` and set `accuracyCircleVisible = false`
    - On new GPS accuracy value, call `setAccuracyCircle` again to update the circle
    - _Requirements: 1.1, 1.3, 1.4, 1.5_
  - [x] 4.3 Add accuracy text label to the bottom sheet
    - When `accuracyCircleVisible` is true, render `formatAccuracyLabel(gpsAccuracy)` as a small text label adjacent to the address area
    - Hide the label when `accuracyCircleVisible` is false
    - _Requirements: 1.2, 1.3_

- [x] 5. Offline and tile-error handling
  - [x] 5.1 Add tile error/recovery events to `buildLeafletHTML`
    - Capture the `tileLayer` reference in a variable
    - Attach `tileerror` listener: `postMessage({ type: 'tileError' })`
    - Attach `tileload` listener: `postMessage({ type: 'tileOk' })`
    - _Requirements: 2.1, 2.6_
  - [x] 5.2 Handle `tileError` / `tileOk` messages in `handleWebViewMessage`
    - Add `tilesOffline` state (boolean, default `false`)
    - On `tileError`: set `tilesOffline = true`
    - On `tileOk`: set `tilesOffline = false`
    - _Requirements: 2.1, 2.6_
  - [x] 5.3 Render offline banner in the UI
    - When `tilesOffline` is true, show a non-blocking banner above the bottom sheet: "Map unavailable offline"
    - Banner disappears when `tilesOffline` returns to false
    - _Requirements: 2.1, 2.6_
  - [x] 5.4 Handle geocode failure in the confirm flow
    - When `geocodeError` is true and user confirms, set `address = "Unknown location"` and `method = "gps"` in the stored `LocationData`
    - Confirm button must remain enabled when `pinCoords` exists regardless of `geocodeError` (already partially true — verify and enforce)
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 6. Land parcel polygon tool
  - [x] 6.1 Add polygon tool JavaScript to `buildLeafletHTML`
    - Declare `polygonPins`, `polygonLayer`, `pinMarkers` arrays
    - Implement `window.addPolygonPin(lat, lng)`: add orange `L.circleMarker`, push to arrays, call `_redrawPolygon()`; on marker click, `postMessage({ type: 'pinTap', index })`
    - Implement `window.removePolygonPin(index)`: remove marker from map and splice both arrays, call `_redrawPolygon()`
    - Implement `window.resetPolygon()`: remove all markers and polygon layer, reset arrays
    - Implement `_redrawPolygon()`: draw `L.polygon` when `polygonPins.length >= 3`, remove otherwise
    - Attach `map.on('click', ...)` to `postMessage({ type: 'mapTap', lat, lng })`
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.10_
  - [x] 6.2 Add polygon state and message handling to the React Native layer
    - Add state `polygonPins: Array<{ lat: number; lng: number }>` (default `[]`)
    - Handle `mapTap` message: if `isLandFlow && polygonPins.length < POLYGON_MAX_PINS`, call `addPolygonPin` via `injectJavaScript` and update `polygonPins` state
    - Handle `pinTap` message: call `removePolygonPin(index)` via `injectJavaScript` and splice `polygonPins` state
    - _Requirements: 3.1, 3.2, 3.5_
  - [x] 6.3 Render polygon controls UI in Land_Flow
    - Show "Add Pin" mode indicator and pin count when `isLandFlow` is true
    - When `polygonPins.length >= POLYGON_MAX_PINS`, show inline message "Maximum 20 boundary points reached" and disable further tap-to-add
    - When `polygonPins.length >= 3`, show computed area using `computePolygonAreaHectares(polygonPins)` formatted as "~X.XX ha"
    - Show "Reset Polygon" button that calls `resetPolygon()` via `injectJavaScript` and clears `polygonPins` state
    - _Requirements: 3.2, 3.9, 3.10_
  - [x] 6.4 Store polygon on confirm in Land_Flow
    - In `handleConfirm`, when `isLandFlow` is true and `polygonPins.length >= 3`, include `polygon: polygonPins` in the `LocationData` passed to `setLandLocationData`
    - When `isLandFlow` is true and `polygonPins.length < 3`, omit `polygon` (leave `undefined`)
    - Always set `method: "gps"` for land confirmations
    - _Requirements: 3.6, 3.7, 3.8_

- [x] 7. Accuracy threshold warning dialog
  - [x] 7.1 Add warning dialog to `handleConfirm` in `(auth)/location-picker.tsx`
    - Before saving, call `shouldWarn(gpsAccuracy, GPS_ACCURACY_THRESHOLD_M)`
    - If true, show `Alert.alert` with message `"Your GPS accuracy is ±${Math.round(gpsAccuracy)}m. For best results, move to an open area and try again."` and two buttons: "Confirm Anyway" and "Try Again"
    - "Confirm Anyway": proceed with save using current accuracy
    - "Try Again": dismiss dialog and re-attempt GPS acquisition (same logic as My Location re-acquisition in Task 8)
    - If `shouldWarn` returns false, proceed directly to save
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. My Location button reliability
  - [x] 8.1 Add re-acquisition logic to `handleMyLocation`
    - Add state `myLocationLoading` (boolean) and `myLocationError` (string | null)
    - When `gpsFallbackUsed` is true: set `myLocationLoading = true`, attempt `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })` with `GPS_ACQUISITION_TIMEOUT_MS` timeout (same pattern as initial acquisition)
    - On success: call `flyTo`, update `pinCoords`, set `gpsFallbackUsed = false`, set `myLocationLoading = false`, clear `myLocationError`
    - On failure/timeout: set `myLocationError = "Could not get GPS location. Try moving to an open area."`, set `myLocationLoading = false`
    - When `gpsFallbackUsed` is false: fly to last known GPS position as before (existing behaviour)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 8.2 Update My Location button UI
    - Show activity indicator on the button while `myLocationLoading` is true
    - Show `myLocationError` as an inline message below the button (auto-dismiss after 4 s or on next tap)
    - _Requirements: 6.6_

- [x] 9. Search UX improvements
  - [x] 9.1 Update Nominatim forward search URL to include `addressdetails=1`
    - Change the search URL in `handleSearchChange` to append `&addressdetails=1`
    - _Requirements: 5.1_
  - [x] 9.2 Update `SearchResult` type and search result mapping
    - Add `primaryName: string` and `subtitle: string` fields to the `SearchResult` interface (replace `description`)
    - In the search result mapping, compute `primaryName = extractPrimaryName(r.display_name)` and `subtitle = extractSubtitle(r.address ?? {})`
    - Apply `truncate(primaryName, SEARCH_PRIMARY_MAX_LEN)` and `truncate(subtitle, SEARCH_SUBTITLE_MAX_LEN)`
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 9.3 Update search result row rendering
    - Render primary name on the first line and subtitle on the second line in each result row
    - When no results and query length >= 3, show "No results found" in the dropdown instead of hiding it
    - _Requirements: 5.1, 5.4, 5.5_
  - [x] 9.4 Update `handleSearchSelect` to populate search input with `primaryName` only
    - Replace `result.description.split(",")[0]` with `result.primaryName`
    - _Requirements: 5.4_

- [x] 10. Root-level alias comment
  - [x] 10.1 Update `Client/src/app/location-picker.tsx` with alias comment
    - Add a block comment at the top of the file explaining it is an intentional alias to allow non-auth screens to navigate to the map picker without referencing the `(auth)` route group
    - Verify the file re-exports the default export and `unstable_settings` from `(auth)/location-picker`
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 11. Checkpoint — verify foundational changes
  - Ensure TypeScript compiles with no errors across all modified files
  - Verify `haversineDistanceKm` and `computePolygonAreaHectares` are importable from `reverseGeocode.ts`
  - Verify exported pure functions are importable from `(auth)/location-picker`
  - Ask the user if any questions arise before proceeding to tests.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties; unit tests validate concrete examples and edge cases
- The `polygon` field addition to `LocationData` is backwards-compatible — existing AsyncStorage records without the field deserialise as `undefined`
