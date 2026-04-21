# Implementation Plan

## Execution Order
Tasks are ordered **component-first**: all changes to a single file are done in one task. This avoids re-opening the same file multiple times.

---

- [x] 1. `AppText.tsx` — Increase base font sizes
  - In `Client/src/components/atoms/AppText.tsx`, increase variant font sizes: `bodySm` 12→13, `bodyMd` 14→15, `bodyLg` 16→17
  - _Requirements: D5_

- [x] 2. `quickActions.ts` — Remove Programs card
  - In `Client/src/data/content/quickActions.ts`, remove the `{ title: "home.ongoingEvents", … }` entry
  - Keep the remaining 3 items (Update Profile, Government Schemes, Book Appointment)
  - _Requirements: H1_

- [x] 3. `en.json` + `hi.json` — i18n key updates
  - In `Client/src/i18n/en.json`: change `connect.emergencyTitle` from `"Emergency Help"` to `"SOS"`; add `connect.mySchedule: "My Schedule"` if absent
  - In `Client/src/i18n/hi.json`: change `connect.emergencyTitle` from `"आपातकालीन सहायता"` to `"SOS"`; add `connect.mySchedule: "मेरा शेड्यूल"` if absent
  - Verify `cropsBySeason` in `Client/src/data/content/onboardingOptions.ts` has `hi` labels for all crops; add any missing Hindi crop labels
  - _Requirements: G1, O1, Q1, Q2, Q3_

- [x] 4. `(auth)/personal-details.tsx` — Keyboard fix + photo optional + Camera/Gallery modal
  - **A1 — Keyboard fix**: Move the bottom buttons `View` (containing Skip and Next pressables) inside the `KeyboardAwareScrollView` content area, before its closing tag. Remove it from outside the scroll.
  - **A2 — Camera/Gallery modal**: Replace the `handlePhotoUpload` function body with an `Alert.alert("Choose Photo", "", [{ text: "Camera", onPress: launchCamera }, { text: "Gallery", onPress: launchGallery }, { text: "Cancel", style: "cancel" }])` guard. Extract `launchCamera` (calls `launchCameraAsync`) and `launchGallery` (calls `launchImageLibraryAsync`) as local async helpers that call the existing `processPhoto` helper.
  - **A3 — Photo optional**: Remove `if (!personalDetails.photoUrl) { Alert.alert("Photo Required", …); return; }` from `handleNext`. Remove `!!personalDetails.photoUrl &&` from `isValid()`.
  - _Requirements: A1, A2, A3_

- [x] 5. `(auth)/land-details.tsx` — Replace multi-parcel UI with single total-land input
  - Remove `import CropSelector from "../../components/molecules/CropSelector"`
  - Remove `CropSelector` JSX and all crop-related state (`handleCropsChange`, `errors.crops`, `touched.crops`)
  - Replace the crops section with a single `TextInput` labelled `"Total Land (in Ha)"` with `keyboardType="decimal-pad"`, storing value via `updateLandEntry(entry.id, { area: parseFloat(text) || 0 })`
  - Update `isValid()` to `!hasLand || (entry && entry.area > 0)` — no crop check
  - Keep the `hasLand` toggle, area input, and unit selector unchanged
  - _Requirements: B1_

- [x] 6. `(auth)/livestock-details.tsx` — Show animal name in card title
  - Add a `resolveAnimalLabel(type: string, lang: string): string` helper at module level that looks up `animalTypes` by `value` and returns `lang === "hi" ? item.labelHi ?? item.label : item.label`
  - In the entry card header, replace `t("onboarding.livestockEntry") + " " + (index + 1)` with `entry.type ? resolveAnimalLabel(entry.type, currentLanguage) : t("onboarding.livestockEntry") + " " + (index + 1)`
  - _Requirements: C1_

- [x] 7. `(tab)/profile.tsx` — Avatar modal + crop labels + emoji + land unit
  - **D1 — Avatar Camera/Gallery modal**: Replace `handleAvatarUpload` body with `Alert.alert("Choose Photo", "", [{ text: "Camera", onPress: launchCamera }, { text: "Gallery", onPress: launchGallery }, { text: "Cancel", style: "cancel" }])`. Extract `launchCamera` and `launchGallery` as local async helpers inside `handleAvatarUpload`.
  - **D2 — Crop label resolution**: In the land card, import `cropTypes` from `../../data/content/onboardingOptions`. For `rabiCrop`, `kharifCrop`, `zaidCrop` values, resolve via `cropTypes.find(c => c.value === val)?.label ?? val` before rendering in `InfoRow`.
  - **D4 — Emoji prefixes**: Add emoji to the livestock row array: `{ key: "cow", emoji: "🐄" }`, `{ key: "buffalo", emoji: "🐃" }`, `{ key: "goat", emoji: "🐐" }`, `{ key: "sheep", emoji: "🐑" }`, `{ key: "pig", emoji: "🐖" }`, `{ key: "poultry", emoji: "🐔" }`, `{ key: "others", emoji: "🐾" }`. Prepend emoji to the label in each row.
  - **B2 — Land unit in stats**: Change the land stats badge value from `` `${profile.landDetails.totalLandArea}` `` to `` `${profile.landDetails.totalLandArea} Bigha` ``.
  - _Requirements: D1, D2, D4, B2_

- [x] 8. `(tab)/schemes.tsx` — Remove slider, filter to featured, add scroll hint
  - **E1 — Remove horizontal slider**: Remove the `<ScrollView horizontal …>` wrapper around `recommendedSchemes`. Render them as a vertical list: `{recommendedSchemes.map(scheme => <SchemeCard key={scheme.id} scheme={scheme} onPress={() => handleSchemePress(scheme.id)} />)}` (no `width` prop).
  - **E2 — Featured-only filter**: Change `recommendedSchemes` to `filteredSchemes.filter(s => s.isFeatured).slice(0, 5)`. Change `ProgramSection` programs prop to `filteredSchemes.filter(s => s.isFeatured).slice(0, 9).map(…)`.
  - **E3 — Scroll hint**: After the recommended list `View`, add `{recommendedSchemes.length > 3 && <AppText style={{ color: theme.text.muted, textAlign: "center", fontSize: 12, marginTop: 8 }}>Scroll for more ↓</AppText>}`.
  - _Requirements: E1, E2, E3_

- [x] 9. `scheme-details.tsx` — Fix "Participate Now" / "Applied ✓" button label
  - Change the interest button `label` prop from `` isInterested ? `✓ I'm Interested` : `I'm Interested` `` to `isInterested ? "Applied ✓" : "Participate Now"`
  - _Requirements: F1_

- [x] 10. `(admin)/beneficiaries.tsx` — Rename header to "Farmers"
  - Change `<AppText style={s.title}>Beneficiaries</AppText>` to `<AppText style={s.title}>Farmers</AppText>`
  - _Requirements: I1_

- [x] 11. `(admin)/dashboard.tsx` — Rename all Beneficiary display labels to Farmer
  - Change `QuickPill label="Beneficiaries"` → `label="Farmers"`
  - Change `SectionHeader label="Beneficiaries"` → `label="Farmers"`
  - Change `ActionCard title="Add Beneficiary"` → `title="Add Farmer"`
  - Change `ActionCard title="View Beneficiaries"` → `title="View Farmers"`
  - Do NOT change route paths (`/(admin)/beneficiaries`, `/(admin)/add-beneficiary`)
  - _Requirements: J1_

- [x] 12. `(admin)/add-beneficiary.tsx` — Address dropdowns in Step 2 + Next button validation
  - **K1 — Address dropdowns**: In `Step2`, add `import { indianStates, indianDistricts } from "../../data/indianLocations"` at the top of the file. Replace the `TextInput` for `state` with `<Select options={indianStates.map(s => ({ label: s.label, value: s.value }))} value={form.state} onChange={(v) => setForm({ ...form, state: v, district: "" })} placeholder="Select state" />`. Replace the `TextInput` for `district` with `<Select options={indianDistricts.filter(d => !form.state || d.stateValue === form.state).map(d => ({ label: d.label, value: d.value }))} value={form.district} onChange={(v) => setForm({ ...form, district: v })} disabled={!form.state} placeholder="Select district" />`.
  - **K2 — Next button validation**: In the main `AddBeneficiary` component, update the Step 2 "Next" button `disabled` prop to `!(location.lat !== null || (location.state && location.district))`. Add an inline `<AppText style={{ color: "#EF4444", fontSize: 12, marginTop: 8 }}>Please pin a location on the map or select State and District</AppText>` that renders when the user taps Next without meeting the condition.
  - _Requirements: K1, K2_

- [x] 13. `(admin)/mark-attendance.tsx` — Stay on page after marking + walk-in name input
  - **L1 — Stay on page**: In `handleMarkPresent` success `Alert.alert("✅ Done!", …)`, remove the `{ text: "Done", onPress: () => setSelectedEvent(null) }` button. Keep only `{ text: "Mark Another", onPress: () => { setMobileNumber(""); setFoundUser(null); } }`.
  - **L2 — Walk-in name input**: Add `const [walkInName, setWalkInName] = useState("")` state. Pass `walkInName` and `setWalkInName` as props to `NotFoundCard`. Inside `NotFoundCard`, add a `TextInput` for name above the "Mark as Present Anyway" button (placeholder "Enter name"). Disable the button when `walkInName.trim() === ""`. In `handleMarkPresent`, when `foundUser === "not_found"`, use `walkInName` as `resolvedName` instead of `"Walk-in: ${mobileNumber}"`. Reset `walkInName` to `""` in the "Mark Another" callback.
  - _Requirements: L1, L2_

- [x] 14. `event-details.tsx` — Add "View on Map" link + always-visible trainer card
  - **M1 — View on Map**: In the location row (after the existing "Get Directions" pressable), add a second `Pressable` labelled `"View on Map"` that calls `Linking.openURL(\`https://maps.google.com/?q=${event.location_lat},${event.location_lng}\`)`. Only render when `event.location_lat && event.location_lng`.
  - **M2 — Trainer card always visible**: Change the trainer card condition from `(event.master_trainer_name || event.trainer_name || event.contact_number)` to `(event.master_trainer_name || event.trainer_name || event.contact_number || event.master_trainer_phone || event.trainer_phone)`. At the bottom of the trainer card, add a `Pressable` "Call Trainer" button that dials `event.contact_number || event.master_trainer_phone || event.trainer_phone` via `Linking.openURL("tel:…")`.
  - _Requirements: M1, M2_

- [x] 15. `professional-detail.tsx` — Simplify card with progressive disclosure
  - **N1 — Progressive disclosure**: Add `const [showMore, setShowMore] = useState(false)` state. Wrap the availability badge `View`, location card `View`, and specializations card `View` in `{showMore && (…)}`. Add a `Pressable` below the hero section labelled `showMore ? "See less ↑" : "See more details ↓"` that toggles `showMore`.
  - _Requirements: N1_

- [x] 16. `book-appointment.tsx` — Send booking confirmation email
  - **N2 — Booking email**: After the successful booking API call (where the success state is set), add `Linking.openURL(\`mailto:ifithinkaboutit@gmail.com?subject=New Appointment Booking&body=Professional: ${professionalName}%0ADate: ${selectedDate}%0ATime: ${selectedTime}%0AUser: ${userName}\`)`. Import `Linking` from `react-native` if not already imported. Use `useLocalSearchParams` values for `professionalName`. Use `useAuth` for `userName`.
  - _Requirements: N2_

- [x] 17. `my-schedule.tsx` — Translate screen title
  - Import `useTranslation` from `"../i18n"` if not already imported
  - Replace the hardcoded `"My Schedule"` screen title `AppText` with `{t("connect.mySchedule")}`
  - _Requirements: O1_

- [x] 18. Checkpoint — Run tests and verify TypeScript
  - Run `npx jest --testPathPattern="bugCondition|preservation" --runInBand` from `Client/`
  - Run `npx tsc --noEmit` from `Client/` and fix any type errors introduced by the changes
  - Smoke-test on simulator: keyboard lift on personal-details, Camera/Gallery modal on profile avatar, "Farmers" label in admin, "SOS" on connect, "Participate Now"/"Applied ✓" on scheme details, address dropdowns in add-beneficiary Step 2, attendance page stays after marking
