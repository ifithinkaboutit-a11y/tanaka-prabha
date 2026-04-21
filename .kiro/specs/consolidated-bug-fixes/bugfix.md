# Bugfix Requirements Document — Tanak Prabha v2

## Introduction

This document consolidates **58 bugs and improvements** across the Tanak Prabha React Native / Expo app (`Client/`). Items are grouped by **component/screen** so that all changes to a single file are batched together, minimising re-edits and token cost.

The app serves farmers ("Beneficiaries" → renamed to "Farmers") and agricultural professionals in India. Stack: Expo Router, NativeWind, TypeScript, Zustand, Supabase.

---

## Bug Groups by Component

### Group A — `(auth)/personal-details.tsx`

**A1 — Keyboard overlap (bottom buttons outside scroll)**
- Current: The bottom button bar (`View` with `padding: 20`) is rendered *after* the closing `</KeyboardAwareScrollView>` tag, so the keyboard obscures it when a lower field is focused.
- Expected: Bottom button bar is inside the `KeyboardAwareScrollView` content area OR the screen is wrapped in `KeyboardAvoidingView` so buttons lift with the keyboard.

**A2 — Photo upload skips Camera/Gallery choice**
- Current: `handlePhotoUpload` calls `launchCameraAsync` directly without offering a Camera vs Gallery choice.
- Expected: Show `Alert.alert("Choose Photo", "", [{ text: "Camera", … }, { text: "Gallery", … }, { text: "Cancel", style: "cancel" }])` before any `ImagePicker` call.

**A3 — Sign-up photo is compulsory (remove requirement)**
- Current: `handleNext` blocks if `!personalDetails.photoUrl` with "Photo Required" alert.
- Expected: Photo upload is optional during sign-up. Remove the photo-required guard from `handleNext` and `isValid()`.

---

### Group B — `(auth)/land-details.tsx`

**B1 — Multi-parcel land UI (replace with single total-land input)**
- Current: `CropSelector` multi-entry section renders with season-grouped crop chips.
- Expected: Remove `CropSelector`. Render a single `TextInput` labelled `"Total Land (in Ha)"` with `keyboardType="decimal-pad"`. Store value in `onboardingStore` as `totalLandArea` (number). Keep the `hasLand` toggle. Update `isValid()` to check `totalLandArea > 0`.

**B2 — Land unit should default to Bigha in stats display**
- Current: Profile stats strip shows land area with no unit label, and the unit stored can be bigha/acre/hectare.
- Expected: The land area stat in `profile.tsx` stats strip should display the unit label (e.g. "2.5 Bigha"). The `land-details.tsx` unit selector should default to `"bigha"` (already the case — verify and keep).

---

### Group C — `(auth)/livestock-details.tsx`

**C1 — No visual distinction between livestock types (change color or text)**
- Current: Each livestock entry card uses a cycling accent color from `ENTRY_ACCENT_COLORS` but the animal type label is generic ("Livestock 1", "Livestock 2").
- Expected: Once an animal type is selected, display the animal name as the card title (e.g. "Cow", "Buffalo") instead of "Livestock 1". The accent color cycling can remain.

---

### Group D — `(tab)/profile.tsx`

**D1 — Avatar tap should offer Camera vs Gallery choice**
- Current: `handleAvatarUpload` calls `launchImageLibraryAsync` directly.
- Expected: Show `Alert.alert("Choose Photo", "", [{ text: "Camera", onPress: launchCamera }, { text: "Gallery", onPress: launchGallery }, { text: "Cancel", style: "cancel" }])` before any picker call.

**D2 — Crop names not showing in Hindi despite i18n config**
- Current: Profile land card shows raw crop slug values (e.g. "wheat") instead of translated labels.
- Expected: Resolve crop slug → localized label using `cropTypes` from `onboardingOptions` before displaying in the land card. Use `currentLanguage` to pick EN or HI label.

**D3 — Profile crops should use multi-select instead of single select**
- Current: Land card in profile shows `rabiCrop` and `kharifCrop` as single string values.
- Expected: The edit flow (`land-details.tsx`) already supports multi-crop via `CropSelector` (being replaced by B1). After B1, the profile land card should display the stored crop string(s) as comma-separated labels.

**D4 — Animal doodle / illustration in profile section**
- Current: Livestock card shows a plain list of animals with count badges.
- Expected: Add a small animal emoji or icon prefix to each livestock row label (e.g. 🐄 Cow, 🐃 Buffalo, 🐐 Goat, 🐑 Sheep, 🐖 Pig, 🐔 Poultry, 🐾 Others).

**D5 — Font size increase (global)**
- Current: Base body font size is 13–14px in most cards.
- Expected: Increase `AppText` `bodySm` base size from 12→13, `bodyMd` from 14→15, `bodyLg` from 16→17 in `AppText.tsx`. This is a single-file change.

---

### Group E — `(tab)/schemes.tsx`

**E1 — Remove recommended schemes horizontal slider**
- Current: A horizontal `ScrollView` renders `recommendedSchemes` as a carousel.
- Expected: Remove the horizontal slider entirely. Show recommended schemes as a vertical list (same `SchemeCard` component, full width) or remove the section and rely on `ProgramSection` below.

**E2 — Filter to only featured (recommended) schemes**
- Current: `recommendedSchemes` = `[...featured, ...nonFeatured].slice(0, 5)` — includes non-featured.
- Expected: `recommendedSchemes = filteredSchemes.filter(s => s.isFeatured).slice(0, 5)`. `ProgramSection` data = `filteredSchemes.filter(s => s.isFeatured).slice(0, 9)`.

**E3 — Hint to scroll on recommended section**
- Current: No scroll hint on the recommended section.
- Expected: Add a subtle "Scroll for more →" hint text below the recommended list when `recommendedSchemes.length > 3`.

---

### Group F — `scheme-details.tsx`

**F1 — "Participate Now" button does not toggle to "Applied ✓"**
- Current: Button label = `isInterested ? "✓ I'm Interested" : "I'm Interested"`.
- Expected: Change to `isInterested ? "Applied ✓" : "Participate Now"`.

---

### Group G — `(tab)/connect.tsx`

**G1 — "Emergency Help" label should read "SOS"**
- Current: `t("connect.emergencyTitle")` resolves to `"Emergency Help"` (EN) / `"आपातकालीन सहायता"` (HI).
- Expected: Update `en.json` `connect.emergencyTitle` → `"SOS"` and `hi.json` `connect.emergencyTitle` → `"SOS"`.

---

### Group H — `(tab)/index.tsx` (Home Screen)

**H1 — Remove "Programs" card from home screen quick actions**
- Current: `quickActions` data in `quickActions.ts` has 4 items; the "Ongoing Events" card navigates to `/(tab)/program`.
- Expected: Remove the "Ongoing Events" / Programs quick action card from `quickActions.ts`. Keep the remaining 3 (Update Profile, Government Schemes, Book Appointment).

---

### Group I — `(admin)/beneficiaries.tsx`

**I1 — "Beneficiaries" header label should read "Farmers"**
- Current: `<AppText style={s.title}>Beneficiaries</AppText>` in the header.
- Expected: Change to `"Farmers"`.

---

### Group J — `(admin)/dashboard.tsx`

**J1 — Rename all "Beneficiary/Beneficiaries" display labels to "Farmer/Farmers"**
- Current: `QuickPill label="Beneficiaries"`, `SectionHeader label="Beneficiaries"`, `ActionCard title="Add Beneficiary"`, `ActionCard title="View Beneficiaries"`.
- Expected: Change all four to "Farmers", "Farmers", "Add Farmer", "View Farmers" respectively. Do NOT rename route paths or store keys.

---

### Group K — `(admin)/add-beneficiary.tsx` (Step 2)

**K1 — Replace free-text State/District inputs with `<Select>` dropdowns**
- Current: `Step2` manual fallback uses `TextInput` for `state` (placeholder "e.g. Uttar Pradesh") and `district` (placeholder "e.g. Lucknow").
- Expected: Replace with `<Select options={indianStates} …>` for state and `<Select options={indianDistricts.filter(d => d.stateValue === form.state)} …>` for district. Clear district when state changes. Import `indianStates`, `indianDistricts` from `../../data/indianLocations`.

**K2 — Compulsory location pin OR complete address before "Next"**
- Current: "Next" button on Step 2 is enabled even when `form.lat === null` and address fields are empty.
- Expected: "Next" button disabled until `form.lat !== null` OR all of `state + district` have values. Show inline validation message if neither condition is met.

---

### Group L — `(admin)/mark-attendance.tsx`

**L1 — Don't navigate away after marking attendance; keep page with cleared input**
- Current: After `Alert.alert("✅ Done!", …)` the "Done" option calls `setSelectedEvent(null)` which navigates back to event picker.
- Expected: Remove the "Done" option from the success alert. Only show "Mark Another" which clears `mobileNumber` and `foundUser` but stays on the same event. The user can tap the back arrow to return to event picker.

**L2 — Require name input for walk-in (unregistered) attendees**
- Current: `NotFoundCard` shows "Mark as Present Anyway" with only the mobile number — no name input.
- Expected: Add a `TextInput` for name inside `NotFoundCard`. The "Mark as Present Anyway" button is disabled until name is non-empty. Pass the entered name to `handleMarkPresent`.

---

### Group M — `event-details.tsx`

**M1 — Google Maps deep-link from event location**
- Current: Location row shows a "Get Directions" pressable that calls `Linking.openURL("https://www.google.com/maps/dir/?api=1&destination=…")` — this already exists.
- Expected: Verify the link is correct and also add a "View on Map" button that opens `https://maps.google.com/?q=lat,lng` (simpler, opens pin directly). Keep both.

**M2 — Mentor/trainer data on event detail page**
- Current: Trainer card only shows if `event.master_trainer_name || event.trainer_name || event.contact_number` — already implemented.
- Expected: Ensure the trainer card is always visible (even if only `contact_number` is present). Add a "Call Trainer" shortcut button that dials `contact_number` directly without needing to expand the card.

---

### Group N — `professional-detail.tsx`

**N1 — Show only Name and Description for professionals (simplify card)**
- Current: Full profile shows availability badge, location, specializations, quick contact, and book CTA.
- Expected: Keep name, role/description, and the "Book Appointment" CTA. Hide the availability badge, location card, and specializations card by default. They can be shown on a "See more" toggle.

**N2 — Repurpose yellow Schedule button to send booking email**
- Current: The "Book Appointment" CTA navigates to `/book-appointment`.
- Expected: Keep the navigation to `/book-appointment`. Additionally, when an appointment is booked (in `book-appointment.tsx`), send a confirmation email to `ifithinkaboutit@gmail.com` via `Linking.openURL("mailto:ifithinkaboutit@gmail.com?subject=…&body=…")` with the appointment details. This is a client-side mailto link — no server needed.

---

### Group O — `my-schedule.tsx`

**O1 — Convert "My Schedule" title to Hindi when language is HI**
- Current: Screen title is hardcoded as "My Schedule" (no i18n key used).
- Expected: Use `t("connect.mySchedule")` for the screen title. Add `"mySchedule": "मेरा शेड्यूल"` to `hi.json` under `connect` if not present.

---

### Group P — `AppText.tsx` (atoms)

**P1 — Font size increase (see D5 above)**
- Already described in D5. Single change to `AppText.tsx` variant size map.

---

### Group Q — `i18n/en.json` + `i18n/hi.json`

**Q1 — connect.emergencyTitle: "Emergency Help" → "SOS"** (see G1)
**Q2 — connect.mySchedule Hindi label** (see O1)
**Q3 — Crop names in Hindi** — Verify `cropsBySeason` in `onboardingOptions.ts` has `hi` labels for all crops. If any are missing, add them.

---

## Unchanged Behaviors (Regression Prevention)

3.1 GPS location-picker screen continues to work when permission is granted.
3.2 Sign-up flow continues to create account and navigate to main tabs on completion.
3.3 Scheme search/filter by title and category continues to work.
3.4 "Apply Now" deep-link via `Linking.openURL` on scheme detail continues to work.
3.5 Admin dashboard stats API call continues to work.
3.6 Photo upload via `uploadApi.uploadUserPhoto` and URL persistence continues to work.
3.7 Tab navigation (Home, Schemes, Connect, Program, Profile) continues without errors.
3.8 Pull-to-refresh on all list screens continues to re-fetch and update data.
3.9 Language switching EN ↔ HI continues to re-render translated strings.
3.10 Admin attendance marking continues to record entries correctly.
3.11 Connect screen service category grid and SOS emergency call button continue to render.
3.12 Profile screen personal/land/livestock data display continues to work.
3.13 OTP verification flow continues to accept 6-digit code and navigate correctly.
3.14 Admin event creation continues to submit and display the new event.
3.15 Admin beneficiary detail display continues to work.
3.16 `filterFarmers` utility continues to filter by name and mobile correctly.
3.17 `AddressDropdowns` molecule continues to work in personal-details sign-up flow.
3.18 `book-appointment.tsx` navigation and slot selection continue to work.
