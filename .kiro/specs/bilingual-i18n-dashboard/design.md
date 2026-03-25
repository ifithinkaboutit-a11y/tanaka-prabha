# Design Document: Bilingual i18n Dashboard

## Overview

This spec touches four areas of the TanakPrabha platform simultaneously:

1. **Bilingual content authoring** — wire `LocalizedContentEditor` into the dashboard Events form and add a tab-based bilingual input to the mobile admin `create-event.tsx`
2. **i18n key coverage** — add ~40 missing translation keys to `en.json` and `hi.json`
3. **Analytics page** — new `/analytics` route with user heatmap (moved from home), new livestock heatmap with animal-type filter, and KPI cards
4. **Mobile admin Beneficiaries** — new `beneficiaries.tsx` list screen and `beneficiary-detail.tsx` profile screen

The changes are largely additive. No existing APIs change. The main risk areas are (a) the Leaflet SSR constraint for the new livestock heatmap and (b) keeping the bilingual validation logic consistent between the web form and the mobile form.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Web Dashboard (Next.js — Server/dashboard/)                │
│                                                             │
│  app/(page)/                                                │
│    page.jsx          ← remove HeatmapSection                │
│    analytics/page.jsx ← NEW: UserHeatMap + LivestockHeatmap │
│    events/page.jsx   ← replace plain inputs with            │
│                         LocalizedContentEditor              │
│                                                             │
│  components/dashboard/                                      │
│    UserHeatMap.jsx        (unchanged, just moved in usage)  │
│    HeatmapSection.jsx     (unchanged)                       │
│    LivestockHeatMap.jsx   ← NEW                             │
│    LivestockHeatmapSection.jsx ← NEW (SSR wrapper)          │
│    TopLivestockRegions.jsx ← NEW                            │
│                                                             │
│  components/app-sidebar.jsx ← add Analytics nav item        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Mobile App (Expo/RN — Client/src/)                         │
│                                                             │
│  app/(admin)/                                               │
│    create-event.tsx  ← add bilingual tab switcher           │
│    beneficiaries.tsx ← NEW                                  │
│    beneficiary-detail.tsx ← NEW                             │
│    _layout.tsx       ← add beneficiaries + beneficiary-detail│
│                                                             │
│  i18n/                                                      │
│    en.json  ← add ~40 keys                                  │
│    hi.json  ← add matching ~40 keys                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Components and Interfaces

### Area 1: Dashboard — Bilingual Event Form

**Existing:** `events/page.jsx` has a plain `<form>` with `<Input>` / `<Textarea>` for title, description, guidelines_and_rules, requirements.

**Change:** Replace those four fields with `<LocalizedContentEditor>` using the same field config pattern as `SchemeForm.jsx`. The non-localized fields (date, times, location, status, image URL) stay as plain inputs.

```
EVENT_FIELDS = [
  { key: "title",               label: "Title",            type: "text"     },
  { key: "description",         label: "Description",      type: "textarea" },
  { key: "guidelines_and_rules",label: "Guidelines & Rules",type: "textarea"},
  { key: "requirements",        label: "Requirements",     type: "textarea" },
]
```

Validation before `eventsApi.create()` / `eventsApi.update()`:
- `formData.title.trim()` must be non-empty → existing check
- `formData.title_hi.trim()` must be non-empty → new check

**Files modified:**
- `Server/dashboard/src/app/(page)/events/page.jsx`

---

### Area 2: Mobile Admin — Bilingual Tab Switcher

`create-event.tsx` currently has four plain `TextInput` fields for title, description, guidelines, requirements. We add a two-tab switcher (English / हिंदी) above those fields. The tab state is local (`useState`). Both sets of values live in the existing state object — we just add four new state variables: `titleHi`, `descriptionHi`, `guidelinesHi`, `requirementsHi`.

```
Tab: [English] [हिंदी]
  English active → show: title, description, guidelines, requirements
  Hindi active   → show: titleHi, descriptionHi, guidelinesHi, requirementsHi
```

Validation in `handleCreate()`:
```
if (!titleHi.trim()) {
  Alert.alert("Hindi title required", ...)
  return
}
```

The API payload gains four new fields:
```
title_hi, description_hi, guidelines_and_rules_hi, requirements_hi
```

**Files modified:**
- `Client/src/app/(admin)/create-event.tsx`

---

### Area 3: Analytics Page

#### New route: `/analytics`

**File:** `Server/dashboard/src/app/(page)/analytics/page.jsx`

Layout:
```
<SectionCards />                    ← reuse existing KPI cards
<HeatmapSection />                  ← UserHeatMap (moved from home)
<LivestockHeatmapSection />         ← NEW
<TopLivestockRegions />             ← NEW
```

#### LivestockHeatMap component

**File:** `Server/dashboard/src/components/dashboard/LivestockHeatMap.jsx`

Mirrors `UserHeatMap.jsx` structure:
- Fetches from `analyticsApi.getLivestockStatistics()`
- Expected response shape: `{ data: { farmers: [{ lat, lng, cow, buffalo, goat, sheep, poultry, others }] } }`
- Animal-type filter state: `"all" | "cow" | "buffalo" | "goat" | "sheep" | "poultry" | "others"`
- Heat intensity computation:

```js
function getIntensity(farmer, filter) {
  if (filter === "all") {
    return (farmer.cow||0) + (farmer.buffalo||0) + (farmer.goat||0)
         + (farmer.sheep||0) + (farmer.poultry||0) + (farmer.others||0)
  }
  return farmer[filter] || 0
}
// Normalise to [0.1, 1.0] same as UserHeatMap
```

- Filter UI: segmented control (row of `<Button variant>` toggles) above the map
- Uses same `INDIA_CENTER`, `INDIA_ZOOM`, `HEAT_OPTIONS`, `TILE_URL` from `heatmap-config.js`
- SSR-disabled via `LivestockHeatmapSection.jsx` wrapper (same pattern as `HeatmapSection.jsx`)

#### TopLivestockRegions component

**File:** `Server/dashboard/src/components/dashboard/TopLivestockRegions.jsx`

- Derives top-5 districts from the same livestock data (no extra API call)
- Receives `farmers` array as prop from the analytics page
- Groups by `farmer.district`, sums per animal type, sorts by total descending, takes top 5
- Renders a simple table/list with district name, total, and per-type breakdown

#### Sidebar update

Add Analytics nav item to `dashboardRoutes` in `app-sidebar.jsx`:
```js
{
  id: "analytics",
  title: "Analytics",
  icon: <BarChart2 className="size-4" />,
  link: "/analytics",
}
```
Positioned between "Dashboard" and "Events".

**Files modified:**
- `Server/dashboard/src/app/(page)/page.jsx` — remove `<HeatmapSection>` card
- `Server/dashboard/src/components/app-sidebar.jsx` — add Analytics nav item

**Files created:**
- `Server/dashboard/src/app/(page)/analytics/page.jsx`
- `Server/dashboard/src/components/dashboard/LivestockHeatMap.jsx`
- `Server/dashboard/src/components/dashboard/LivestockHeatmapSection.jsx`
- `Server/dashboard/src/components/dashboard/TopLivestockRegions.jsx`

---

### Area 4: Mobile Admin Beneficiaries

#### BeneficiariesScreen

**File:** `Client/src/app/(admin)/beneficiaries.tsx`

Data flow:
```
mount / pull-to-refresh
  → usersApi.getAll({ limit: 100, offset: 0 })
  → setFarmers(response.data.users)

search bar (client-side)
  → filter by name.toLowerCase().includes(query) || mobile_number.includes(query)

tap row
  → router.push({ pathname: "/(admin)/beneficiary-detail", params: { id: farmer.id } })
```

List item renders: name, village, district, mobile number, verified badge.

Loading state: `ActivityIndicator` or skeleton rows.
Empty state: descriptive message when search yields no results.

#### FarmerDetailScreen

**File:** `Client/src/app/(admin)/beneficiary-detail.tsx`

Data flow:
```
mount
  → usersApi.getById(params.id)
  → setFarmer(response.data)
```

Sections:
1. Personal info (name, age, gender, aadhaar, father/mother name)
2. Address (village, block, district, state, pin)
3. Land details — grouped by season:
   ```
   Rabi:   { crop: farmer.land_details.rabi_crop,   area: ... }
   Kharif: { crop: farmer.land_details.kharif_crop, area: ... }
   Zaid:   { crop: farmer.land_details.zaid_crop,   area: ... }
   ```
4. Livestock breakdown (cow, buffalo, goat, sheep, poultry, others)
5. Call button: `Linking.openURL("tel:" + farmer.mobile_number)`

#### Layout update

**File:** `Client/src/app/(admin)/_layout.tsx`

Add two new `Stack.Screen` entries:
```tsx
<Stack.Screen name="beneficiaries" />
<Stack.Screen name="beneficiary-detail" />
```

Add a "Beneficiaries" button/card to the admin dashboard screen (`dashboard.tsx`) that navigates to `/(admin)/beneficiaries`.

---

### Area 5: i18n Key Coverage

All new keys follow the existing dot-notation structure. Keys to add to both `en.json` and `hi.json`:

```
interested.interested
interested.notInterested
interested.peopleInterested
interested.errorToast

qrAttendance.scanToAttend
qrAttendance.scanning
qrAttendance.attendanceRecorded
qrAttendance.qrExpired
qrAttendance.alreadyAttended
qrAttendance.cameraPermissionTitle
qrAttendance.cameraPermissionMessage

events.trainerContact
events.masterTrainer
events.trainer
events.contactNumber
events.call
events.getDirections

filterSort.sortBy
filterSort.nameAZ
filterSort.newestFirst
filterSort.mostInterested
filterSort.filters
filterSort.clearFilters
filterSort.noResultsFound
filterSort.typeAll
filterSort.typeScheme
filterSort.typeProgram
filterSort.typeEvent

auth.duplicatePhoneMessage
auth.duplicatePhoneLogin
auth.duplicatePhoneDismiss

admin.englishContent
admin.hindiContent
admin.titleEn
admin.titleHi
admin.descriptionEn
admin.descriptionHi
admin.guidelinesEn
admin.guidelinesHi
admin.requirementsEn
admin.requirementsHi
```

---

## Data Models

### Bilingual Event payload (dashboard + mobile)

```ts
interface BilingualEventPayload {
  // localized
  title: string
  title_hi: string
  description: string
  description_hi: string
  guidelines_and_rules: string
  guidelines_and_rules_hi: string
  requirements: string
  requirements_hi: string
  // non-localized (unchanged)
  date: string
  start_time: string
  end_time: string
  location_name: string
  location_address?: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  hero_image_url?: string
  // mobile-only
  master_trainer_name?: string
  master_trainer_phone?: string
  trainer_name?: string
  trainer_phone?: string
  contact_number?: string
  location_lat?: number
  location_lng?: number
}
```

### Livestock statistics API response (assumed shape)

```ts
interface LivestockStatisticsResponse {
  data: {
    farmers: Array<{
      lat: number
      lng: number
      district: string
      cow: number
      buffalo: number
      goat: number
      sheep: number
      poultry: number
      others: number
    }>
  }
}
```

### Farmer (from usersApi.getById)

```ts
interface Farmer {
  id: string
  name: string
  mobile_number: string
  village: string
  block: string
  district: string
  state: string
  is_verified: boolean
  photo_url?: string
  land_details?: {
    total_land_area: number
    rabi_crop?: string
    kharif_crop?: string
    zaid_crop?: string
  }
  livestock_details?: {
    cow: number
    buffalo: number
    goat: number
    sheep: number
    pig: number
    poultry: number
    others: number
  }
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Bidirectional translation key parity

*For any* leaf key path present in `en.json`, the same path in `hi.json` must resolve to a non-empty string (not the key itself); and symmetrically, *for any* leaf key path present in `hi.json`, the same path in `en.json` must resolve to a non-empty string.

**Validates: Requirements 13.1, 13.2**

### Property 2: Whitespace-aware bilingual form validation

*For any* form state where the English title field is non-empty and the Hindi title field is empty or contains only whitespace characters, the validation function must return a failure result and must not invoke the backend API.

**Validates: Requirements 14.1, 14.2, 14.3**

### Property 3: Completion percentage formula

*For any* field configuration of M fields (M > 0) and any value object with N fields having a non-empty trimmed value (0 ≤ N ≤ M), `getCompletion(lang)` must return exactly `Math.round((N / M) * 100)`.

**Validates: Requirements 15.1, 15.4**

### Property 4: Completion percentage reactivity

*For any* value object and field configuration, changing a single field from empty to non-empty (or vice versa) and recomputing `getCompletion()` must produce a result that differs from the previous result by exactly `Math.round(1/M * 100)` (within rounding), reflecting the updated fill count.

**Validates: Requirements 15.5**

---

## Error Handling

**Dashboard — bilingual event form**
- Missing English title: existing toast error, no change
- Missing Hindi title: new toast error "Please enter the Hindi title (हिंदी शीर्षक आवश्यक है)"
- API failure: existing `toast.error` pattern, no change

**LivestockHeatMap**
- Fetch failure: catch block sets `farmers = []`, renders empty-state message "No livestock data available"
- No farmers with selected animal type: renders empty-state message "No farmers with [animal] data"
- Leaflet load failure: SSR wrapper's `loading` skeleton stays visible; error boundary not required (same as UserHeatMap)

**Mobile Beneficiaries**
- Fetch failure: `Alert.alert("Error", "Failed to load farmers")` + retry button
- Empty search: empty-state view with "No farmers match your search"
- Detail fetch failure: `Alert.alert` + back navigation

**i18n missing key**
- The `useTranslation` hook already falls back to returning the key string itself when a key is missing. The parity property test (Property 1) catches this at test time.

---

## Testing Strategy

### Unit tests

Focus on specific examples and edge cases:

- `getCompletion()` with 0/3, 1/3, 2/3, 3/3 filled fields → 0, 33, 67, 100
- Validation rejects `""`, `" "`, `"\t\n"` as empty Hindi title
- Validation accepts `"क"` (single Hindi character) as non-empty
- `getIntensity(farmer, "all")` sums all animal counts correctly
- `getIntensity(farmer, "cow")` returns only cow count
- TopLivestockRegions correctly ranks districts by total livestock

### Property-based tests

Use **fast-check** (already available in the JS ecosystem; works with Jest/Vitest).

Each property test runs a minimum of **100 iterations**.

#### Property 1: Key parity

```
// Feature: bilingual-i18n-dashboard, Property 1: Bidirectional translation key parity
test.prop([fc.constantFrom(...allEnKeys)])(
  "every en.json key resolves to non-empty string in hi.json",
  (key) => {
    const value = resolveKey(hi, key)
    return typeof value === "string" && value.trim().length > 0 && value !== key
  }
)

test.prop([fc.constantFrom(...allHiKeys)])(
  "every hi.json key resolves to non-empty string in en.json",
  (key) => {
    const value = resolveKey(en, key)
    return typeof value === "string" && value.trim().length > 0 && value !== key
  }
)
```

#### Property 2: Bilingual form validation

```
// Feature: bilingual-i18n-dashboard, Property 2: Whitespace-aware bilingual form validation
test.prop([
  fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // non-empty English title
  fc.stringOf(fc.constantFrom(" ", "\t", "\n", "\r")),           // whitespace-only Hindi title
])(
  "form with non-empty English title and whitespace Hindi title fails validation",
  (title, titleHi) => {
    const result = validateBilingualForm({ title, title_hi: titleHi })
    return result.valid === false
  }
)
```

#### Property 3: Completion percentage formula

```
// Feature: bilingual-i18n-dashboard, Property 3: Completion percentage formula
test.prop([
  fc.integer({ min: 1, max: 20 }).chain(m =>
    fc.integer({ min: 0, max: m }).map(n => ({ n, m }))
  )
])(
  "getCompletion returns round(N/M*100) for any N filled out of M total fields",
  ({ n, m }) => {
    const fields = Array.from({ length: m }, (_, i) => ({ key: `field${i}` }))
    const value = Object.fromEntries(
      fields.slice(0, n).map(f => [f.key, "filled"]).concat(
        fields.slice(n).map(f => [f.key, ""])
      )
    )
    const result = getCompletion("english", value, fields)
    return result === Math.round((n / m) * 100)
  }
)
```

#### Property 4: Completion percentage reactivity

```
// Feature: bilingual-i18n-dashboard, Property 4: Completion percentage reactivity
test.prop([
  fc.integer({ min: 1, max: 20 }).chain(m =>
    fc.integer({ min: 0, max: m - 1 }).map(n => ({ n, m }))
  )
])(
  "filling one more field increases completion percentage",
  ({ n, m }) => {
    const fields = Array.from({ length: m }, (_, i) => ({ key: `field${i}` }))
    const valueBefore = Object.fromEntries(
      fields.slice(0, n).map(f => [f.key, "filled"]).concat(
        fields.slice(n).map(f => [f.key, ""])
      )
    )
    const valueAfter = { ...valueBefore, [`field${n}`]: "filled" }
    const before = getCompletion("english", valueBefore, fields)
    const after = getCompletion("english", valueAfter, fields)
    return after > before
  }
)
```

### Test file locations

| Test | Location |
|------|----------|
| Key parity (P1) | `Client/src/__tests__/i18n-parity.test.ts` |
| Form validation (P2) | `Client/src/__tests__/bilingual-validation.test.ts` |
| Completion % (P3, P4) | `Server/dashboard/src/__tests__/localized-content-editor.test.ts` |
| Unit tests (dashboard) | `Server/dashboard/src/__tests__/` |
| Unit tests (mobile) | `Client/src/__tests__/` |
