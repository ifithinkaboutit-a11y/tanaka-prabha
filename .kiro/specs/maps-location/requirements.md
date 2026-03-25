# Requirements Document

## Introduction

This document covers improvements to the Maps & Location feature in the Tanak Prabha React Native/Expo app for Indian farmers. The existing location picker uses a Leaflet WebView with OSM tiles, Nominatim for geocoding, and expo-location for GPS. The improvements address GPS accuracy feedback, offline resilience, land parcel polygon capture, search UX, "My Location" reliability, address pre-population quality, and codebase hygiene.

**Map provider decision:** The client originally requested a Google Maps migration. After evaluation, the decision is to remain on the OSM/Leaflet/Nominatim stack. Reasons: no API key or billing account required (critical for a rural-India deployment where app distribution is informal), Nominatim covers Indian villages adequately for the app's needs, and the existing WebView integration is already working. Google Maps would add cost, a Play Services dependency, and a harder offline story. This decision is recorded here so developers reading the client's original notes understand why the requirements improve the existing stack rather than replacing it.

## Glossary

- **Location_Picker**: The screen (`(auth)/location-picker.tsx`) that allows users to place a pin on a map to record their home or land location.
- **GPS_Module**: The expo-location integration responsible for acquiring the device's current position.
- **GPS_ACQUISITION_TIMEOUT_MS**: A named constant (default `10_000` ms) controlling how long the GPS_Module waits for a position fix before timing out. Used for both the initial acquisition and any re-acquisition triggered by the My Location button.
- **Accuracy_Indicator**: The UI element (circle overlay and/or text label) that communicates GPS fix accuracy to the user.
- **Accuracy_Threshold**: A configurable value (default 100 m) above which the GPS fix is considered too imprecise to confirm without a warning. Exposed as the named constant `GPS_ACCURACY_THRESHOLD_M`.
- **Tile_Layer**: The OSM raster tile layer rendered inside the Leaflet WebView.
- **Nominatim**: The OpenStreetMap geocoding service used for forward search and reverse geocoding.
- **Reverse_Geocoder**: The component that converts (lat, lng) coordinates into a human-readable address string.
- **Forward_Search**: The Nominatim-backed place search that converts a text query into candidate (lat, lng) results. Returns structured address fields (`address.state_district`, `address.county`, `address.state`) alongside `display_name`.
- **Land_Flow**: The mode of the Location_Picker activated when `isForLand=true`, used to capture a farmer's land parcel location.
- **Polygon_Tool**: The UI component within Land_Flow that allows a user to drop multiple pins and form a closed polygon representing a land parcel boundary.
- **Land_Parcel**: A polygon defined by an ordered list of `{ lat, lng }` vertices representing the boundary of a farmer's land. Stored in the new `polygon` field on `LandLocationData` (see Requirement 3 schema note).
- **Sub_Location_Resolver**: The updated `getClosestLocation` function in `reverseGeocode.ts` that finds the truly closest tehsil, block, and village by iterating all sub-locations.
- **Search_Result**: A single item returned by Forward_Search, consisting of a primary place name, a subtitle (district and state), and coordinates.
- **onboardingStore**: The Zustand + AsyncStorage store holding `locationData`, `landLocationData`, and `profileAddressOverride`.
- **isProfileMode**: The boolean derived in the Location_Picker component as `fromProfile === "true" || !!purpose`. This is the canonical runtime name for Profile_Mode. The route params `fromProfile` and `purpose` are the raw inputs; `isProfileMode` is the computed flag used throughout the component logic.

---

## Requirements

### Requirement 1: GPS Accuracy Indicator

**User Story:** As a farmer, I want to see how accurate my GPS fix is, so that I know whether the pin placed on the map truly represents my location.

#### Acceptance Criteria

1. WHEN the GPS_Module acquires a position fix, THE Accuracy_Indicator SHALL display a circular overlay on the map centred on the pin with a radius equal to the reported accuracy in metres.
2. WHEN the GPS_Module acquires a position fix, THE Accuracy_Indicator SHALL display a text label in the format "±Xm" (where X is the accuracy rounded to the nearest metre) adjacent to the pin.
3. WHILE the GPS_Module is acquiring a position fix, THE Accuracy_Indicator SHALL not be visible.
4. WHEN the user drags the map to a new pin position, THE Accuracy_Indicator SHALL hide the accuracy circle and label, because the pin is no longer at the GPS-measured position.
5. THE Accuracy_Indicator SHALL update the circle radius and label whenever the GPS_Module reports a new accuracy value.

#### Correctness Properties

- **Accuracy circle radius invariant**: For any GPS accuracy value A (in metres), the rendered circle radius in metres SHALL equal A. Formally: `circleRadiusMetres(accuracy) === accuracy` for all `accuracy >= 0`.
- **Label format property**: For any integer accuracy value A >= 0, `formatAccuracyLabel(A)` SHALL return the string `"±" + A + "m"`. This is a pure function testable with property-based testing across the full range of valid accuracy values.

---

### Requirement 2: Offline and Poor-Connectivity Handling

**User Story:** As a farmer in a low-connectivity area, I want the app to work gracefully when internet is unavailable, so that I can still record my GPS location even without map tiles or address resolution.

#### Acceptance Criteria

1. WHEN the Tile_Layer fails to load one or more tiles, THE Location_Picker SHALL display a non-blocking banner informing the user that the map is unavailable offline.
2. WHEN Nominatim reverse geocoding fails due to a network error, THE Location_Picker SHALL display the message "Address unavailable — you can still confirm your pin" in the address area.
3. WHEN Nominatim reverse geocoding fails, THE Location_Picker SHALL keep the Confirm button enabled provided a pin coordinate exists.
4. WHEN the user confirms a pin while Nominatim reverse geocoding has failed, THE Location_Picker SHALL store the LocationData with `address` set to `"Unknown location"` and `method` set to `"gps"`.
5. IF the device has no internet connection and GPS is available, THEN THE Location_Picker SHALL allow the user to confirm a GPS-only pin without requiring an address.
6. WHEN the Tile_Layer recovers connectivity and tiles load successfully, THE Location_Picker SHALL hide the offline banner.

#### Correctness Properties

- **Offline confirm produces valid LocationData**: For any valid (lat, lng) pin with a geocode failure, the confirmed LocationData object SHALL satisfy: `lat !== 0 || lng !== 0`, `method === "gps"`, and `address === "Unknown location"`. This is an example-based property verifiable with a mock network failure.

---

### Requirement 3: Land Parcel Polygon Mapping

**User Story:** As a farmer, I want to mark the boundary of my land parcel on the map, so that the app can record the shape and approximate area of my farm.

#### Schema change

This requirement introduces a new optional field `polygon` on the `LocationData` type in `onboardingStore.ts`:

```ts
polygon?: Array<{ lat: number; lng: number }>;
```

`polygon` is only populated when the user is in Land_Flow and has placed 3 or more boundary pins. For single-pin land confirmations and all home-location confirmations, `polygon` is `undefined`. Because `LocationData` is persisted to AsyncStorage via Zustand's `persist` middleware, adding an optional field is backwards-compatible with existing stored data (missing field deserialises as `undefined`).

#### Acceptance Criteria

1. WHEN the Location_Picker is in Land_Flow, THE Polygon_Tool SHALL allow the user to drop a minimum of 1 and a maximum of 20 boundary pins on the map.
2. WHEN the user attempts to drop a 21st boundary pin, THE Polygon_Tool SHALL disable the "Add Pin" / tap-to-add interaction and display an inline message "Maximum 20 boundary points reached" near the polygon controls. No alert dialog is shown; the existing 20 pins remain unchanged.
3. WHEN the user has dropped 3 or more boundary pins, THE Polygon_Tool SHALL render a closed polygon connecting the pins in the order they were placed.
4. WHEN the user has fewer than 3 boundary pins, THE Polygon_Tool SHALL render only the placed pins without drawing a polygon.
5. WHEN the user taps a placed boundary pin, THE Polygon_Tool SHALL allow the user to remove that pin from the polygon.
6. WHEN the user confirms the land parcel with 3 or more pins, THE Location_Picker SHALL store the polygon as an ordered array of `{ lat, lng }` vertices in `landLocationData.polygon`.
7. WHEN the user confirms the land parcel with fewer than 3 pins (single-pin fallback), THE Location_Picker SHALL store the single centre pin coordinate in `landLocationData` as before, with `polygon` left `undefined`.
8. WHEN the user confirms the land parcel (any number of pins), THE Location_Picker SHALL set `landLocationData.method` to `"gps"`.
9. THE Polygon_Tool SHALL display the approximate enclosed area in hectares below the polygon when 3 or more pins are placed.
10. WHEN the user taps "Reset Polygon", THE Polygon_Tool SHALL clear all boundary pins and the rendered polygon.
11. WHEN the Tile_Layer is unavailable (offline), THE Polygon_Tool SHALL remain functional for dropping and removing boundary pins using GPS coordinates. The map background will be blank or show cached tiles, but pin placement, polygon rendering, and the Confirm button SHALL all continue to work. The offline banner from Requirement 2 SHALL be shown in this state.

#### Correctness Properties

- **Polygon vertex count invariant**: For any confirmed Land_Parcel with N vertices (N >= 3), `landLocationData.polygon.length === N`.
- **Pin cap enforcement**: For any sequence of N add-pin actions where N > 20, the resulting polygon SHALL have exactly 20 vertices. Formally: `Math.min(addCount, 20) === polygon.length` for all `addCount >= 0`.
- **Area non-negativity**: For any polygon with N >= 3 vertices, `computePolygonAreaHectares(vertices) >= 0`.
- **Area of degenerate polygon**: For any polygon where all vertices are the same point, `computePolygonAreaHectares(vertices) === 0`.
- **Round-trip serialisation**: For any array of polygon vertices V, `deserialisePolygon(serialisePolygon(V))` SHALL produce an array equal to V (same length, same lat/lng values). This is essential because polygon data is persisted to AsyncStorage via onboardingStore.

---

### Requirement 4: Location Accuracy Threshold Warning

**User Story:** As a farmer, I want to be warned if my GPS signal is too weak before I confirm my location, so that I don't accidentally save an inaccurate pin.

#### Acceptance Criteria

1. WHEN the user taps "Confirm Location" and the current GPS accuracy is greater than the Accuracy_Threshold, THE Location_Picker SHALL display a warning dialog before saving.
2. THE warning dialog SHALL state the current accuracy (e.g. "Your GPS accuracy is ±150m. For best results, move to an open area and try again.") and offer "Confirm Anyway" and "Try Again" options.
3. WHEN the user selects "Confirm Anyway" from the warning dialog, THE Location_Picker SHALL proceed to save the location with the current accuracy value.
4. WHEN the user selects "Try Again" from the warning dialog, THE Location_Picker SHALL dismiss the dialog and re-attempt GPS acquisition.
5. WHEN the current GPS accuracy is less than or equal to the Accuracy_Threshold, THE Location_Picker SHALL confirm the location without showing the warning dialog.
6. THE Accuracy_Threshold SHALL default to 100 metres and SHALL be configurable via a named constant `GPS_ACCURACY_THRESHOLD_M` in the Location_Picker module. The GPS acquisition timeout SHALL default to 10 000 ms and SHALL be configurable via the named constant `GPS_ACQUISITION_TIMEOUT_MS` (this constant already exists as `GPS_TIMEOUT_MS` in the current implementation and SHALL be renamed to `GPS_ACQUISITION_TIMEOUT_MS` for clarity).
7. THE existing constant `GPS_TIMEOUT_MS` in `(auth)/location-picker.tsx` SHALL be renamed to `GPS_ACQUISITION_TIMEOUT_MS`. This rename SHALL be applied everywhere the constant is referenced in that file.

#### Correctness Properties

- **Threshold gate property**: For any accuracy value A and threshold T, the warning dialog is shown if and only if `A > T`. Formally: `shouldWarn(A, T) === (A > T)` for all `A >= 0` and `T > 0`.

---

### Requirement 5: Search UX Improvements

**User Story:** As a farmer, I want search results to be easy to read, so that I can quickly identify and select the right village or town from the list.

#### Acceptance Criteria

1. WHEN Forward_Search returns results, THE Location_Picker SHALL display each Search_Result as two lines:
   - **Primary line**: the place name extracted from Nominatim's `display_name` (first comma-separated segment, trimmed).
   - **Subtitle line**: district and state extracted from Nominatim's structured `address` fields — specifically `address.state_district || address.county` for district, and `address.state` for state. Raw string parsing of `display_name` SHALL NOT be used for the subtitle, because comma positions in Indian Nominatim results are inconsistent.
2. THE Location_Picker SHALL truncate the primary place name to a maximum of 40 characters, appending "…" if truncated.
3. THE Location_Picker SHALL truncate the subtitle to a maximum of 60 characters, appending "…" if truncated.
4. WHEN a Search_Result is selected, THE Location_Picker SHALL populate the search input with only the primary place name, not the full `display_name`.
5. WHEN Forward_Search returns no results for a query of 3 or more characters, THE Location_Picker SHALL display a "No results found" message in the dropdown.

#### Correctness Properties

- **Truncation idempotence**: For any string S and max length N, `truncate(truncate(S, N), N) === truncate(S, N)`. Applying truncation twice produces the same result as applying it once.
- **Truncation length invariant**: For any string S and max length N, `truncate(S, N).length <= N + 1` (the +1 accounts for the "…" character). Formally: `truncate(S, N).length <= N + 1` for all S and N > 0.
- **Primary name extraction**: For any Nominatim `display_name` string D, `extractPrimaryName(D)` SHALL return the substring before the first comma (trimmed). Round-trip: `extractPrimaryName(primaryName + ", district, state") === primaryName` for any primaryName without commas.

---

### Requirement 6: My Location Button Reliability

**User Story:** As a farmer, I want the "My Location" button to always attempt to find my current GPS position, so that I can re-centre the map even if the initial GPS acquisition failed.

#### Acceptance Criteria

1. WHEN the user taps the "My Location" button and `gpsFallbackUsed` is `true`, THE GPS_Module SHALL re-attempt GPS acquisition using `GPS_ACQUISITION_TIMEOUT_MS` as the timeout and `Location.Accuracy.Balanced` as the accuracy setting — the same values used for the initial acquisition.
2. WHEN the re-attempted GPS acquisition succeeds, THE Location_Picker SHALL fly the map to the new GPS position and update the pin coordinates.
3. WHEN the re-attempted GPS acquisition succeeds, THE Location_Picker SHALL set `gpsFallbackUsed` to `false` and hide the GPS fallback banner.
4. WHEN the re-attempted GPS acquisition fails or times out, THE Location_Picker SHALL display a toast or inline message "Could not get GPS location. Try moving to an open area." and leave the map at its current position.
5. WHEN the user taps the "My Location" button and `gpsFallbackUsed` is `false`, THE Location_Picker SHALL fly the map to the last known GPS position as before.
6. WHILE a GPS re-acquisition is in progress, THE Location_Picker SHALL display a loading indicator on the "My Location" button.

---

### Requirement 7: Address Field Pre-population Quality

**User Story:** As a farmer, I want the app to pre-fill my state, district, tehsil, block, and village fields with the most accurate values based on my pin location, so that I don't have to manually correct them.

#### Pre-population UX behaviour

When the Location_Picker confirms a pin (onboarding home flow only — not land flow, not profile mode), it calls `getClosestLocation` and writes the resolved values into `personalDetails` in `onboardingStore`. These values are then visible as pre-filled, **editable** fields on the Personal Details screen. The user can correct any field manually. The pre-population is a convenience, not a lock — no field is read-only as a result of this feature.

#### Acceptance Criteria

1. WHEN the user confirms a location pin in the onboarding home flow (`isForLand` is `false` and `isProfileMode` is `false`), THE Sub_Location_Resolver SHALL find the closest district by comparing the haversine distance from the pin to each district's coordinates in `indianLocations.json`. Pre-population SHALL NOT run in Land_Flow or Profile_Mode.
2. WHEN the closest district is found, THE Sub_Location_Resolver SHALL find the closest tehsil within that district by comparing the haversine distance from the pin to each tehsil's coordinates (where available).
3. WHEN the closest tehsil is found, THE Sub_Location_Resolver SHALL find the closest block within that tehsil by comparing the haversine distance from the pin to each block's coordinates (where available).
4. WHEN the closest block is found, THE Sub_Location_Resolver SHALL find the closest village within that block by comparing the haversine distance from the pin to each village's coordinates (where available).
5. IF a sub-location level (tehsil, block, or village) has no coordinate data, THEN THE Sub_Location_Resolver SHALL fall back to returning the first entry at that level, as the current implementation does.
6. WHEN the haversine distance to the nearest district exceeds 500 km, THE Sub_Location_Resolver SHALL return empty strings for all fields, as the current implementation does.

#### Correctness Properties

- **Closest sub-location optimality**: For any (lat, lng) and any district D that is the closest district, the returned tehsil T SHALL satisfy: `distance(lat, lng, T.coords) <= distance(lat, lng, T2.coords)` for all other tehsils T2 in D (where coordinate data exists). This is a property testable with arbitrary (lat, lng) inputs within India's bounding box.
- **Haversine non-negativity**: For any two coordinate pairs, `haversineDistanceKm(lat1, lng1, lat2, lng2) >= 0`.
- **Haversine symmetry**: For any two coordinate pairs, `haversineDistanceKm(lat1, lng1, lat2, lng2) === haversineDistanceKm(lat2, lng2, lat1, lng1)`.
- **Haversine identity**: For any coordinate pair, `haversineDistanceKm(lat, lng, lat, lng) === 0`.

---

### Requirement 8: Root-Level Location Picker Alias

> **Note:** This is a developer-facing code convention requirement, not a product feature. It is included here to ensure the alias file is not accidentally removed during refactoring. Non-technical stakeholders can skip this section.

**User Story:** As a developer, I want the root-level `location-picker.tsx` re-export to be clearly documented as intentional, so that future contributors do not accidentally delete or duplicate it.

#### Acceptance Criteria

1. THE file `Client/src/app/location-picker.tsx` SHALL re-export the default export and `unstable_settings` from `(auth)/location-picker.tsx`.
2. THE file `Client/src/app/location-picker.tsx` SHALL contain a comment explaining that it is an intentional alias to allow non-auth screens (profile, personal-details) to navigate to the map picker without referencing the `(auth)` route group.
3. THE Location_Picker SHALL be navigable from both `/(auth)/location-picker` and `/location-picker` routes without duplicating component logic.
