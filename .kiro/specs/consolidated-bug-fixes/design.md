# Consolidated Bug Fixes — Design Document v2

## Overview

Targeted, minimal fixes across 16 files. Changes are ordered by file so each file is touched exactly once. No new screens, no new routes, no new stores.

---

## Glossary

- **Bug_Condition (C)**: Runtime state that triggers defective behaviour.
- **Preservation**: All behaviours outside C that must remain identical after the fix.
- **isBugCondition(input)**: Pseudocode predicate returning `true` when input falls inside C.

---

## Root Cause Analysis

| ID | File | Root Cause |
|----|------|-----------|
| A1 | `(auth)/personal-details.tsx` | Bottom buttons `View` rendered after `</KeyboardAwareScrollView>` closing tag |
| A2 | `(auth)/personal-details.tsx` | `handlePhotoUpload` calls `launchCameraAsync` directly, no Alert guard |
| A3 | `(auth)/personal-details.tsx` | `handleNext` and `isValid()` hard-block on `!personalDetails.photoUrl` |
| B1 | `(auth)/land-details.tsx` | `CropSelector` multi-entry used instead of single numeric input |
| B2 | `(tab)/profile.tsx` | Stats strip shows land area without unit label |
| C1 | `(auth)/livestock-details.tsx` | Card title hardcoded as "Livestock N" instead of resolved animal name |
| D1 | `(tab)/profile.tsx` | `handleAvatarUpload` calls `launchImageLibraryAsync` directly |
| D2 | `(tab)/profile.tsx` | Crop slug displayed raw; no label resolution via `cropTypes` |
| D4 | `(tab)/profile.tsx` | Livestock rows have no emoji prefix |
| D5 | `components/atoms/AppText.tsx` | `bodySm`/`bodyMd`/`bodyLg` font sizes 1px too small |
| E1 | `(tab)/schemes.tsx` | Horizontal `ScrollView` carousel for recommended schemes |
| E2 | `(tab)/schemes.tsx` | `recommendedSchemes` includes non-featured via fallback spread |
| E3 | `(tab)/schemes.tsx` | No scroll hint on recommended section |
| F1 | `scheme-details.tsx` | Button label `"I'm Interested"` / `"✓ I'm Interested"` instead of `"Participate Now"` / `"Applied ✓"` |
| G1 | `i18n/en.json` + `i18n/hi.json` | `connect.emergencyTitle` = `"Emergency Help"` / `"आपातकालीन सहायता"` |
| H1 | `data/content/quickActions.ts` | "Ongoing Events" card present in quick actions |
| I1 | `(admin)/beneficiaries.tsx` | Header title hardcoded `"Beneficiaries"` |
| J1 | `(admin)/dashboard.tsx` | Multiple "Beneficiary/Beneficiaries" display strings |
| K1 | `(admin)/add-beneficiary.tsx` | `Step2` uses `TextInput` for state/district instead of `<Select>` |
| K2 | `(admin)/add-beneficiary.tsx` | "Next" button enabled with no location and no address |
| L1 | `(admin)/mark-attendance.tsx` | Success alert "Done" option navigates away from event |
| L2 | `(admin)/mark-attendance.tsx` | `NotFoundCard` has no name input for walk-ins |
| M1 | `event-details.tsx` | Only directions link; no simple "View on Map" pin link |
| M2 | `event-details.tsx` | Trainer card hidden when only `contact_number` present |
| N1 | `professional-detail.tsx` | Too much info shown by default; no progressive disclosure |
| N2 | `professional-detail.tsx` + `book-appointment.tsx` | No email confirmation on booking |
| O1 | `my-schedule.tsx` + `i18n/hi.json` | Screen title hardcoded, not translated |

---

## Fix Implementation — File by File

### 1. `Client/src/components/atoms/AppText.tsx`
- Increase variant font sizes: `bodySm` 12→13, `bodyMd` 14→15, `bodyLg` 16→17.

### 2. `Client/src/data/content/quickActions.ts`
- Remove the `"home.ongoingEvents"` entry (Programs card). Keep 3 remaining items.

### 3. `Client/src/i18n/en.json`
- `connect.emergencyTitle`: `"Emergency Help"` → `"SOS"`
- Add `connect.mySchedule`: `"My Schedule"` (if not present)

### 4. `Client/src/i18n/hi.json`
- `connect.emergencyTitle`: `"आपातकालीन सहायता"` → `"SOS"`
- Add `connect.mySchedule`: `"मेरा शेड्यूल"` (if not present)

### 5. `Client/src/app/(auth)/personal-details.tsx`
- **A1**: Move the bottom buttons `View` inside the `KeyboardAwareScrollView` `contentContainerStyle` area (before the closing tag).
- **A2**: Replace `handlePhotoUpload` body with an `Alert.alert("Choose Photo", …)` guard that offers Camera and Gallery options before calling any `ImagePicker` API.
- **A3**: Remove `if (!personalDetails.photoUrl)` guard from `handleNext`. Remove `!!personalDetails.photoUrl &&` from `isValid()`.

### 6. `Client/src/app/(auth)/land-details.tsx`
- **B1**: Remove `import CropSelector`. Remove `CropSelector` JSX. Replace with a single `TextInput` labelled `"Total Land (in Ha)"` with `keyboardType="decimal-pad"`. Store value via `updateLandEntry(entry.id, { area: parseFloat(text) || 0 })`. Update `isValid()` to `entry.area > 0` (no crop check). Remove `handleCropsChange` and crop-related error state.

### 7. `Client/src/app/(auth)/livestock-details.tsx`
- **C1**: In the entry card header, replace `"Livestock Entry {index + 1}"` with `entry.type ? resolveAnimalLabel(entry.type, currentLanguage) : t("onboarding.livestockEntry") + " " + (index + 1)`. Add a `resolveAnimalLabel` helper that looks up `animalTypes` by value and returns the localized label.

### 8. `Client/src/app/(tab)/profile.tsx`
- **D1**: Replace `handleAvatarUpload` body with `Alert.alert("Choose Photo", "", [{ text: "Camera", onPress: launchCamera }, { text: "Gallery", onPress: launchGallery }, { text: "Cancel", style: "cancel" }])`. Extract `launchCamera` and `launchGallery` as local async helpers.
- **D2**: In the land card, resolve crop slug → label using `cropTypes.find(c => c.value === val)?.label ?? val` before rendering. Apply `currentLanguage` to pick `labelHi` if available.
- **D4**: Add emoji prefix to each livestock row: `{ key: "cow", emoji: "🐄" }`, `{ key: "buffalo", emoji: "🐃" }`, `{ key: "goat", emoji: "🐐" }`, `{ key: "sheep", emoji: "🐑" }`, `{ key: "pig", emoji: "🐖" }`, `{ key: "poultry", emoji: "🐔" }`, `{ key: "others", emoji: "🐾" }`.
- **B2** (land unit in stats): Change stats strip land badge to show `profile.landDetails?.totalLandArea ? \`${profile.landDetails.totalLandArea} Bigha\` : "0"`.

### 9. `Client/src/app/(tab)/schemes.tsx`
- **E1**: Remove the horizontal `ScrollView` wrapper around `recommendedSchemes`. Render them as a vertical list with `SchemeCard` at full width (`width` prop omitted).
- **E2**: Change `recommendedSchemes` derivation to `filteredSchemes.filter(s => s.isFeatured).slice(0, 5)`. Change `ProgramSection` programs prop to `filteredSchemes.filter(s => s.isFeatured).slice(0, 9)`.
- **E3**: After the recommended list, add `{recommendedSchemes.length > 3 && <AppText style={{ color: theme.text.muted, textAlign: "center", fontSize: 12, marginTop: 8 }}>Scroll for more ↓</AppText>}`.

### 10. `Client/src/app/scheme-details.tsx`
- **F1**: Change button label from `` isInterested ? `✓ I'm Interested` : `I'm Interested` `` to `isInterested ? "Applied ✓" : "Participate Now"`. Change `variant` to `isInterested ? "primary" : "outline"` (already correct).

### 11. `Client/src/app/(tab)/connect.tsx`
- **G1**: No code change needed — handled by i18n key update in step 3/4.

### 12. `Client/src/app/(tab)/index.tsx`
- **H1**: No code change needed — handled by removing the item from `quickActions.ts` in step 2.

### 13. `Client/src/app/(admin)/beneficiaries.tsx`
- **I1**: Change `<AppText style={s.title}>Beneficiaries</AppText>` → `<AppText style={s.title}>Farmers</AppText>`.

### 14. `Client/src/app/(admin)/dashboard.tsx`
- **J1**: Change `QuickPill label="Beneficiaries"` → `"Farmers"`. Change `SectionHeader label="Beneficiaries"` → `"Farmers"`. Change `ActionCard title="Add Beneficiary"` → `"Add Farmer"`. Change `ActionCard title="View Beneficiaries"` → `"View Farmers"`. Do NOT change route paths.

### 15. `Client/src/app/(admin)/add-beneficiary.tsx`
- **K1**: In `Step2`, import `indianStates`, `indianDistricts` from `../../data/indianLocations`. Replace `TextInput` for `state` with `<Select options={indianStates.map(s => ({ label: s.label, value: s.value }))} value={form.state} onChange={(v) => setForm({ ...form, state: v, district: "" })} placeholder="Select state" />`. Replace `TextInput` for `district` with `<Select options={indianDistricts.filter(d => !form.state || d.stateValue === form.state).map(d => ({ label: d.label, value: d.value }))} value={form.district} onChange={(v) => setForm({ ...form, district: v })} disabled={!form.state} placeholder="Select district" />`.
- **K2**: In the parent `AddBeneficiary` component, update the Step 2 "Next" validation: disable the Next button unless `location.lat !== null || (location.state && location.district)`. Show inline error `"Please pin a location on the map or select State and District"` if validation fails.

### 16. `Client/src/app/(admin)/mark-attendance.tsx`
- **L1**: In `handleMarkPresent` success `Alert.alert`, remove the `{ text: "Done", onPress: () => setSelectedEvent(null) }` option. Keep only `{ text: "Mark Another", onPress: () => { setMobileNumber(""); setFoundUser(null); } }`.
- **L2**: Add `walkInName` state (`useState("")`). In `NotFoundCard`, add a `TextInput` for name above the "Mark as Present Anyway" button. Pass `walkInName` and `setWalkInName` as props. Disable the button when `walkInName.trim() === ""`. In `handleMarkPresent`, use `walkInName` as `resolvedName` when `foundUser === "not_found"`.

### 17. `Client/src/app/event-details.tsx`
- **M1**: In the location row, keep the existing "Get Directions" link. Add a second `Pressable` labelled "View on Map" that calls `Linking.openURL(\`https://maps.google.com/?q=${event.location_lat},${event.location_lng}\`)`.
- **M2**: Change the trainer card condition from `(event.master_trainer_name || event.trainer_name || event.contact_number)` to `(event.master_trainer_name || event.trainer_name || event.contact_number || event.master_trainer_phone || event.trainer_phone)`. Add a prominent "Call Trainer" button at the bottom of the trainer card that dials `event.contact_number || event.master_trainer_phone || event.trainer_phone`.

### 18. `Client/src/app/professional-detail.tsx`
- **N1**: Wrap the availability badge, location card, and specializations card in a `showMore` state toggle. Show a "See more details" / "See less" pressable below the hero. By default `showMore = false`.
- **N2**: In `book-appointment.tsx`, after a successful booking API call, call `Linking.openURL(\`mailto:ifithinkaboutit@gmail.com?subject=New Appointment Booking&body=Professional: ${professionalName}%0ADate: ${date}%0ATime: ${time}%0AUser: ${userName}\`)`.

### 19. `Client/src/app/my-schedule.tsx`
- **O1**: Replace hardcoded `"My Schedule"` title with `t("connect.mySchedule")`. Import `useTranslation` if not already imported.

---

## Correctness Properties

**Property 1 — Bug Condition Fixes**
For every input where `isBugCondition(input)` is true, the fixed code SHALL produce the correct UI: keyboard does not obscure buttons; Camera/Gallery modal appears before picker; photo is optional; single land input renders; animal names show in card titles; avatar upload shows choice modal; crop labels resolve correctly; emoji prefixes appear; font sizes are larger; recommended schemes are vertical and featured-only; "Participate Now" / "Applied ✓" labels; "SOS" emergency title; Programs card absent; "Farmers" label everywhere; address dropdowns in Step 2; attendance page stays after marking; walk-in name required; map links present; trainer card always visible; professional card simplified; booking email sent; schedule title translated.

**Property 2 — Preservation**
For every input where `isBugCondition(input)` is false, the fixed code SHALL produce the same observable result as the original code.

---

## Testing Strategy

### Bug Condition Tests (`bugCondition.test.tsx`)
Static source-code assertions (no RNTL render needed for most):
- `personal-details.tsx`: bottom buttons appear before `</KeyboardAwareScrollView>`; `handlePhotoUpload` contains `Alert.alert`; `isValid()` does not reference `photoUrl`.
- `land-details.tsx`: `CropSelector` not imported; `"Total Land (in Ha)"` label present.
- `livestock-details.tsx`: card title uses `resolveAnimalLabel` not hardcoded string.
- `profile.tsx`: `handleAvatarUpload` contains `Alert.alert`; crop label resolution present; emoji prefixes present.
- `schemes.tsx`: no `!s.isFeatured` spread; `ProgramSection` receives filtered data; no horizontal `ScrollView` for recommended.
- `scheme-details.tsx`: `"Participate Now"` and `"Applied ✓"` present; `"I'm Interested"` absent.
- `en.json`: `connect.emergencyTitle === "SOS"`.
- `quickActions.ts`: no `"home.ongoingEvents"` entry.
- `beneficiaries.tsx`: `"Farmers"` present; `"Beneficiaries"` absent in title.
- `dashboard.tsx`: `"Add Farmer"` and `"View Farmers"` present.
- `add-beneficiary.tsx`: `indianStates` imported; no `placeholder="e.g. Uttar Pradesh"`.
- `mark-attendance.tsx`: no `"Done"` option in success alert; `walkInName` state present.

### Preservation Tests (`preservation.test.tsx`)
- `filterFarmers` pure function: random arrays + queries never throw, always return subset.
- `applyParentChange` helper: random `AddressValue` + parent changes always clear child fields.
- Scheme filter: random `isFeatured` arrays → recommended list only contains featured items.
- Button label: random tap sequences → label always `"Participate Now"` or `"Applied ✓"`, never other.
