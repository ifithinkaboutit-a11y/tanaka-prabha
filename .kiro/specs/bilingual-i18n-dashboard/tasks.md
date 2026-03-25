# Implementation Plan: Bilingual i18n Dashboard

## Overview

Implement bilingual content authoring, i18n key coverage, an Analytics page, and a mobile Beneficiaries screen across the TanakPrabha web dashboard and mobile app. Tasks are ordered so that translation keys (Area 1) land first since the mobile bilingual form (Area 4) references them.

## Tasks

- [x] 1. Add missing i18n translation keys to en.json and hi.json
  - Add `interested.*` keys (4 keys) to `Client/src/i18n/en.json` and `hi.json`
  - Add `qrAttendance.*` keys (7 keys) to both locale files
  - Add `events.trainerContact`, `events.masterTrainer`, `events.trainer`, `events.contactNumber`, `events.call`, `events.getDirections` to both locale files
  - Add `filterSort.*` keys (11 keys) to both locale files
  - Add `auth.duplicatePhoneMessage`, `auth.duplicatePhoneLogin`, `auth.duplicatePhoneDismiss` to both locale files
  - Add `admin.*` bilingual label keys (10 keys) to both locale files
  - Every key added to `en.json` must have a matching non-empty entry in `hi.json` and vice versa
  - _Requirements: 6.1–6.4, 7.1–7.7, 8.1–8.5, 9.1, 10.1–10.11, 11.1–11.3, 12.1–12.10, 13.1–13.3_

  - [x] 1.1 Write property test for bidirectional key parity (Property 1)
    - Create `Client/src/__tests__/i18n-parity.test.ts`
    - Use `fast-check` with `fc.constantFrom(...allEnKeys)` to verify every `en.json` leaf key resolves to a non-empty, non-key string in `hi.json`
    - Symmetrically verify every `hi.json` leaf key resolves in `en.json`
    - **Property 1: Bidirectional translation key parity**
    - **Validates: Requirements 13.1, 13.2**

- [ ] 2. Checkpoint — i18n keys
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Wire LocalizedContentEditor into the Dashboard Events form
  - In `Server/dashboard/src/app/(page)/events/page.jsx`, import `LocalizedContentEditor` from `@/components/cms/LocalizedContentEditor`
  - Define `EVENT_FIELDS` array: `title` (text), `description` (textarea), `guidelines_and_rules` (textarea), `requirements` (textarea)
  - Replace the four plain `<Input>`/`<Textarea>` fields in the Create Event dialog with `<LocalizedContentEditor fields={EVENT_FIELDS} value={formData} onChange={setFormData} entityLabel="event" />`
  - Extend `emptyForm` to include `title_hi`, `description_hi`, `guidelines_and_rules_hi`, `requirements_hi` initialised to `""`
  - Keep all non-localized fields (date, start_time, end_time, location_name, location_address, status, hero_image_url) as plain inputs unchanged
  - _Requirements: 1.1, 1.2, 1.3, 1.6_

- [x] 4. Add Hindi title validation to the Dashboard Events form
  - In `handleAdd()` in `events/page.jsx`, before calling `eventsApi.create()`, check `formData.title_hi.trim() === ""` and show `toast.error("Please enter the Hindi title (हिंदी शीर्षक आवश्यक है)")` and return early if so
  - Apply the same guard to the edit/update flow if one exists on the event detail page
  - Treat whitespace-only strings as empty (use `.trim()`)
  - _Requirements: 1.4, 1.5, 2.3, 14.1, 14.2, 14.3_

  - [x] 4.1 Write unit tests for Dashboard bilingual event form validation
    - Create `Server/dashboard/src/__tests__/bilingual-event-form.test.ts`
    - Test that `""`, `" "`, `"\t\n"` are rejected as Hindi title
    - Test that `"क"` (single Hindi character) is accepted
    - Test that a valid English + Hindi title pair passes validation
    - _Requirements: 1.4, 1.5, 14.3_

- [ ] 5. Checkpoint — Dashboard bilingual event form
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create the Analytics page route and move the user heatmap
  - Create `Server/dashboard/src/app/(page)/analytics/page.jsx`
  - Import and render `<SectionCards />`, `<HeatmapSection />` (user heatmap), `<LivestockHeatmapSection />`, and `<TopLivestockRegions />` in that order
  - Fetch KPI data via `analyticsApi.getDashboardStats()` and display summary cards for total farmers, total livestock, total land area, and active events
  - Remove the `<HeatmapSection>` card block from `Server/dashboard/src/app/(page)/page.jsx` (the main dashboard home page)
  - _Requirements: 16.1, 16.3, 16.4, 16.5_

- [x] 7. Add Analytics nav item to the sidebar
  - In `Server/dashboard/src/components/app-sidebar.jsx`, add `import { BarChart2 } from "lucide-react"` to the existing lucide imports
  - Insert an Analytics entry into `dashboardRoutes` between "Dashboard" and "Events":
    ```js
    { id: "analytics", title: "Analytics", icon: <BarChart2 className="size-4" />, link: "/analytics" }
    ```
  - _Requirements: 16.2_

- [x] 8. Create LivestockHeatMap.jsx component
  - Create `Server/dashboard/src/components/dashboard/LivestockHeatMap.jsx`
  - Mirror the structure of `UserHeatMap.jsx`: use `MapContainer`, `TileLayer`, and a `HeatLayer` sub-component
  - Fetch data from `analyticsApi.getLivestockStatistics()`; expected shape: `{ data: { farmers: [{ lat, lng, district, cow, buffalo, goat, sheep, poultry, others }] } }`
  - Implement `getIntensity(farmer, filter)`: when `filter === "all"` sum all animal counts; otherwise return `farmer[filter] || 0`
  - Normalise intensity to `[0.1, 1.0]` using the same formula as `UserHeatMap` (divide by 500, clamp)
  - Render a segmented filter control above the map with options: "All", "Cow", "Buffalo", "Goat", "Sheep", "Poultry", "Others"
  - When a specific animal type is selected, exclude farmers with zero of that type from the heat points
  - Show a loading skeleton (`<Skeleton className="h-[480px] w-full rounded-xl" />`) while fetching
  - Show an empty-state message "No livestock data available" when the farmers array is empty
  - Use `INDIA_CENTER`, `INDIA_ZOOM`, `INDIA_MIN_ZOOM`, `INDIA_MAX_ZOOM`, `HEAT_OPTIONS`, `TILE_URL`, `TILE_ATTRIBUTION` from `heatmap-config.js`
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8_

  - [x] 8.1 Write unit tests for livestock intensity calculation
    - Create `Server/dashboard/src/__tests__/livestock-heatmap.test.ts`
    - Test `getIntensity(farmer, "all")` sums all six animal type counts
    - Test `getIntensity(farmer, "cow")` returns only the cow count
    - Test `getIntensity(farmer, "goat")` for a farmer with zero goats returns 0
    - _Requirements: 17.5, 17.6_

- [x] 9. Create LivestockHeatmapSection.jsx SSR wrapper
  - Create `Server/dashboard/src/components/dashboard/LivestockHeatmapSection.jsx`
  - Use `dynamic(() => import("@/components/dashboard/LivestockHeatMap"), { ssr: false, loading: () => <Skeleton className="h-[480px] w-full rounded-xl" /> })`
  - Export `LivestockHeatmapSection` as a named export, mirroring `HeatmapSection.jsx`
  - _Requirements: 17.2_

- [x] 10. Create TopLivestockRegions.jsx panel
  - Create `Server/dashboard/src/components/dashboard/TopLivestockRegions.jsx`
  - Accept a `farmers` prop (array from the livestock statistics response)
  - Group farmers by `farmer.district`, summing `cow + buffalo + goat + sheep + poultry + others` per district
  - Sort districts by total descending, take the top 5
  - Render a panel listing district name, total livestock count, and a per-type breakdown (cow, buffalo, goat, sheep, poultry, others)
  - _Requirements: 17.9_

  - [x] 10.1 Write unit tests for top regions ranking
    - Create or extend `Server/dashboard/src/__tests__/livestock-heatmap.test.ts`
    - Test that given farmers across 6 districts, the top 5 are returned in descending order
    - Test that a district with zero livestock is excluded from the top 5 when 5 non-zero districts exist
    - _Requirements: 17.9_

- [ ] 11. Checkpoint — Analytics page
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Add bilingual tab switcher to create-event.tsx
  - In `Client/src/app/(admin)/create-event.tsx`, add four new state variables: `titleHi`, `descriptionHi`, `guidelinesHi`, `requirementsHi` (all `useState("")`)
  - Add a `langTab` state variable: `"en" | "hi"`, defaulting to `"en"`
  - Render a two-button tab row (English / हिंदी) above the Basic Information section using the existing `TouchableOpacity` + `StyleSheet` pattern
  - When `langTab === "en"`, show the existing English `TextInput` fields for title, description, guidelines, requirements
  - When `langTab === "hi"`, show four new `TextInput` fields bound to `titleHi`, `descriptionHi`, `guidelinesHi`, `requirementsHi` with Hindi placeholder text using `admin.*` i18n keys
  - Switching tabs must not clear the values of the inactive tab
  - _Requirements: 4.1, 4.2, 4.3, 4.7, 12.1–12.10_

- [x] 13. Add Hindi field state and validation to create-event.tsx
  - In `handleCreate()`, after the existing English title check, add: `if (!titleHi.trim()) { Alert.alert("Hindi Title Required", t("admin.titleHi") + " is required"); return; }`
  - Include `title_hi: titleHi`, `description_hi: descriptionHi`, `guidelines_and_rules_hi: guidelinesHi`, `requirements_hi: requirementsHi` in the `apiService.events.create(...)` payload
  - All existing non-localized fields (date, start_time, end_time, location_name, location_address, trainer fields, contact_number, GPS coordinates, hero_image_url) remain unchanged in the payload
  - _Requirements: 4.4, 4.5, 4.6, 14.1, 14.2, 14.3_

  - [x] 13.1 Write property test for bilingual mobile form validation (Property 2)
    - Create `Client/src/__tests__/bilingual-validation.test.ts`
    - Use `fast-check`: generate a non-empty English title and a whitespace-only Hindi title string
    - Assert that `validateBilingualForm({ title, title_hi: titleHi })` returns `{ valid: false }`
    - Export a pure `validateBilingualForm` function from `create-event.tsx` or a shared util for testability
    - **Property 2: Whitespace-aware bilingual form validation**
    - **Validates: Requirements 14.1, 14.2, 14.3**

  - [x] 13.2 Write property tests for completion percentage (Properties 3 & 4)
    - Extend `Client/src/__tests__/bilingual-validation.test.ts` or create `Server/dashboard/src/__tests__/localized-content-editor.test.ts`
    - Property 3: for any M > 0 fields and 0 ≤ N ≤ M filled, `getCompletion(lang, value, fields)` returns `Math.round(N / M * 100)`
    - Property 4: for any M > 0 and 0 ≤ N < M, filling one more field increases the completion percentage
    - Use `fc.integer({ min: 1, max: 20 }).chain(m => fc.integer({ min: 0, max: m }).map(n => ({ n, m })))` as the generator
    - **Property 3: Completion percentage formula**
    - **Property 4: Completion percentage reactivity**
    - **Validates: Requirements 15.1, 15.4, 15.5**

- [ ] 14. Checkpoint — Mobile bilingual event form
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Create beneficiaries.tsx list screen
  - Create `Client/src/app/(admin)/beneficiaries.tsx`
  - On mount and pull-to-refresh, call `usersApi.getAll({ limit: 100, offset: 0 })` and store results in state
  - Render a `TextInput` search bar at the top; filter the list client-side by `name.toLowerCase().includes(query)` or `mobile_number.includes(query)`
  - Each list row displays: name, village, district, mobile number, and a verified/pending badge
  - Tapping a row navigates to `/(admin)/beneficiary-detail` with `params: { id: farmer.id }`
  - Show `ActivityIndicator` while the initial fetch is in progress
  - Show an empty-state message "No farmers match your search" when the filtered list is empty
  - Support pull-to-refresh via `RefreshControl`
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

- [x] 16. Create beneficiary-detail.tsx profile screen
  - Create `Client/src/app/(admin)/beneficiary-detail.tsx`
  - On mount, call `usersApi.getById(params.id)` and store the farmer in state
  - Render four sections: Personal Info (name, age, gender, aadhaar, father/mother name), Address (village, block, district, state, pin), Land Details grouped by season (Rabi/Kharif/Zaid with crop name and area), Livestock Breakdown (cow, buffalo, goat, sheep, poultry, others)
  - Render a "Call" button next to the mobile number that calls `Linking.openURL("tel:" + farmer.mobile_number)`
  - Show `ActivityIndicator` while loading; show `Alert.alert` on fetch failure with a back-navigation option
  - _Requirements: 18.4, 18.9, 18.10_

  - [x] 16.1 Write unit tests for beneficiaries screen filtering
    - Create `Client/src/__tests__/beneficiaries.test.ts`
    - Test that filtering by name returns only matching farmers
    - Test that filtering by mobile number returns only matching farmers
    - Test that an empty query returns all farmers
    - _Requirements: 18.3, 18.7_

- [x] 17. Wire beneficiaries screens into _layout.tsx and admin dashboard
  - In `Client/src/app/(admin)/_layout.tsx`, add `<Stack.Screen name="beneficiaries" />` and `<Stack.Screen name="beneficiary-detail" />` inside the `<Stack>`
  - In `Client/src/app/(admin)/dashboard.tsx`, add a "Beneficiaries" `ActionCard` (or `QuickPill`) in the appropriate section that calls `goTo("/(admin)/beneficiaries")`
  - _Requirements: 18.8_

- [ ] 18. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use `fast-check` (already available in the JS ecosystem with Jest/Vitest)
- Unit tests validate specific examples and edge cases
- The `LocalizedContentEditor` `getCompletion` function is already exported from the component and can be imported directly in tests
