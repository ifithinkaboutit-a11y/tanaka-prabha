# Requirements Document

## Introduction

This feature covers five improvements to the Tanak Prabha React Native/Expo app for Indian farmers:

1. **Profile data refresh bug fix** — the profile screen currently shows stale address and personal details until the user taps "Edit". The fix ensures the latest data is fetched and displayed immediately when the profile tab is opened.
2. **Profile data smart caching** — instead of hitting the server on every profile tab visit, the app caches profile data locally and only re-fetches when the data is stale (older than a configurable TTL) or when the user explicitly triggers a refresh. This reduces server load at scale (~10,000 users).
3. **Detailed address dropdowns for Bhadohi and Mirzapur districts** — a four-level address hierarchy (Village → Gram Panchayat → Nyay Panchayat → Tehsil) rendered as cascading dropdowns, available in both the onboarding personal-details form and the profile edit form.
4. **Crop categorisation by season** — crops in all crop-management forms are grouped into the three Indian agricultural seasons: Rabi, Kharif, and Zayed (Zaid).
5. **Cotton removal** — cotton is removed from the crop list across all forms.

The app uses `UserProfileContext` (backed by `userApi.getProfile`) for profile data, `useOnboardingStore` (Zustand + AsyncStorage) for onboarding state, and `onboardingOptions.ts` for all dropdown data.

---

## Glossary

- **Profile_Screen**: The `(tab)/profile.tsx` screen that displays a farmer's personal, land, and livestock details.
- **UserProfileContext**: The React context (`UserProfileContext.tsx`) that holds the in-memory `UserProfile` state and exposes `refreshProfile`, `updateProfile`, and related helpers.
- **OnboardingStore**: The Zustand store (`onboardingStore.ts`) persisted to AsyncStorage that holds `personalDetails`, `landEntries`, and `livestockEntries` during the onboarding flow.
- **Personal_Details_Form**: The `(auth)/personal-details.tsx` screen used during onboarding and the `/personal-details.tsx` screen used for profile editing.
- **Land_Details_Form**: The `(auth)/land-details.tsx` screen used during onboarding and the `/land-details.tsx` screen used for profile editing.
- **Address_Hierarchy**: The four-level administrative structure used in Bhadohi and Mirzapur: Village → Gram Panchayat → Nyay Panchayat → Tehsil.
- **Crop_Season**: One of three Indian agricultural seasons — Rabi (winter), Kharif (monsoon), or Zayed/Zaid (summer).
- **onboardingOptions**: The `src/data/content/onboardingOptions.ts` module that exports all dropdown option arrays (`cropTypes`, `indianStates`, etc.).
- **Bhadohi**: A district in Uttar Pradesh, also spelled Bhadui.
- **Mirzapur**: A district in Uttar Pradesh.
- **CropSelector**: The crop multi-select component used in the Land_Details_Form.
- **AddressDropdowns**: The set of cascading dropdown components that render the Address_Hierarchy for Bhadohi and Mirzapur.
- **Profile_Cache**: The persisted local cache (AsyncStorage) that stores the last successfully fetched `UserProfile` alongside a `cachedAt` timestamp and an `isDirty` flag.
- **Cache_TTL**: The time-to-live for cached profile data, defaulting to 5 minutes. After this period the cache is considered stale and a background re-fetch is triggered.
- **isDirty**: A boolean flag set to `true` in the Profile_Cache whenever the user successfully saves a profile update. When `true`, the next profile screen visit triggers an immediate re-fetch regardless of TTL.

---

## Requirements

### Requirement 1: Profile Screen Loads Latest Data on Open

**User Story:** As a farmer, I want to see my up-to-date profile information as soon as I open the profile tab, so that I do not need to tap "Edit" to trigger a data refresh.

#### Acceptance Criteria

1. WHEN the Profile_Screen gains focus (tab navigation or app resume) and the Profile_Cache is empty, THE UserProfileContext SHALL fetch from the backend API and display an activity indicator until the first response is received.
2. WHEN the Profile_Screen gains focus and the Profile_Cache contains data that is NOT stale (within Cache_TTL) AND `isDirty` is `false`, THE UserProfileContext SHALL render the cached data immediately without making a network request.
3. WHEN the Profile_Screen gains focus and the Profile_Cache is stale (older than Cache_TTL) OR `isDirty` is `true`, THE UserProfileContext SHALL display the cached data immediately and trigger a background re-fetch. Once the response arrives, the screen SHALL update in place without a full-screen loading spinner.
4. WHEN the backend returns updated profile data, THE Profile_Screen SHALL re-render all fields — including address fields (village, gramPanchayat, district, state, tehsil, block, pinCode) — with the new values without requiring any user interaction.
5. IF the background re-fetch fails, THE UserProfileContext SHALL retain the last successfully cached profile data and THE Profile_Screen SHALL remain visible with that data.
6. WHEN the user successfully saves a profile update (via the edit form), THE UserProfileContext SHALL set `isDirty = true` in the Profile_Cache so the next profile visit triggers a fresh fetch.

---

### Requirement 2: Profile Data Smart Caching

**User Story:** As the app operator, I want profile data to be cached locally so that the server receives significantly fewer requests as the user base grows to 10,000+ users, while farmers still see accurate data.

#### Acceptance Criteria

1. THE Profile_Cache SHALL persist the last successfully fetched `UserProfile` object, a `cachedAt` ISO-8601 timestamp, and an `isDirty` boolean to AsyncStorage under a stable key (e.g. `profile_cache`).
2. THE Cache_TTL SHALL default to 5 minutes and SHALL be configurable via a named constant `PROFILE_CACHE_TTL_MS` in the UserProfileContext module.
3. WHEN the app is launched and the Profile_Cache contains valid (non-stale, non-dirty) data, THE UserProfileContext SHALL hydrate from the cache without making a network request, so the profile is visible instantly even before any API call completes.
4. WHEN a background re-fetch succeeds, THE Profile_Cache SHALL be updated with the new profile data, a new `cachedAt` timestamp, and `isDirty = false`.
5. WHEN the user explicitly pulls-to-refresh on the Profile_Screen, THE UserProfileContext SHALL bypass the cache TTL and immediately trigger a network request, then update the cache on success.
6. THE Profile_Cache SHALL be cleared when the user logs out, so a subsequent login always fetches fresh data.
7. THE caching logic SHALL be encapsulated entirely within UserProfileContext — no other component or screen SHALL read from or write to the Profile_Cache directly.

#### Correctness Properties

- **Cache freshness invariant**: At any point in time, if `isDirty === false` and `Date.now() - cachedAt < PROFILE_CACHE_TTL_MS`, no network request SHALL be made on profile focus.
- **Dirty flag reset**: After every successful background re-fetch, `isDirty` SHALL equal `false`.
- **Logout clears cache**: After logout, reading the Profile_Cache from AsyncStorage SHALL return `null`.

---

### Requirement 3: Detailed Address Dropdowns for Bhadohi and Mirzapur

**User Story:** As a farmer from Bhadohi or Mirzapur, I want to select my exact village, Gram Panchayat, Nyay Panchayat, and Tehsil from dropdowns, so that my address is recorded accurately without free-text entry errors.

#### Acceptance Criteria

1. WHEN a user selects "Bhadohi" or "Mirzapur" as their district in the Personal_Details_Form, THE AddressDropdowns SHALL render four cascading dropdown fields in the order: Tehsil → Nyay Panchayat → Gram Panchayat → Village.
2. WHEN a user selects a Tehsil value, THE AddressDropdowns SHALL populate the Nyay Panchayat dropdown with only the Nyay Panchayats that belong to the selected Tehsil.
3. WHEN a user selects a Nyay Panchayat value, THE AddressDropdowns SHALL populate the Gram Panchayat dropdown with only the Gram Panchayats that belong to the selected Nyay Panchayat.
4. WHEN a user selects a Gram Panchayat value, THE AddressDropdowns SHALL populate the Village dropdown with only the villages that belong to the selected Gram Panchayat.
5. WHEN a user changes a parent dropdown selection (Tehsil, Nyay Panchayat, or Gram Panchayat), THE AddressDropdowns SHALL clear all child dropdown selections that are no longer valid.
6. THE AddressDropdowns SHALL be available in both the onboarding Personal_Details_Form and the profile-edit Personal_Details_Form.
7. WHEN a district other than Bhadohi or Mirzapur is selected, THE Personal_Details_Form SHALL display the existing free-text input fields for village, Gram Panchayat, Nyay Panchayat, and Tehsil.
8. WHEN the user saves the form, THE OnboardingStore SHALL persist the selected village, gramPanchayat, nyayPanchayat, and tehsil values from the AddressDropdowns into `personalDetails`.
9. THE Address_Hierarchy data for Bhadohi and Mirzapur SHALL be stored as a static data file within the app (no network request required to render the dropdowns).
10. WHERE the app language is set to Hindi, THE AddressDropdowns SHALL display all place names in Devanagari script.

---

### Requirement 4: Crop Categorisation by Season

**User Story:** As a farmer, I want to select crops grouped by their growing season (Rabi, Kharif, Zayed), so that I can quickly find the crops relevant to the season I am planning for.

#### Acceptance Criteria

1. THE CropSelector SHALL organise all crop options into three labelled sections: Rabi, Kharif, and Zayed.
2. WHEN a user opens the CropSelector, THE CropSelector SHALL display section headers for Rabi, Kharif, and Zayed before the crops belonging to each season.
3. THE onboardingOptions module SHALL export a `cropsBySeason` data structure that maps each Crop_Season to its list of crop options.
4. THE Land_Details_Form SHALL use `cropsBySeason` to render the CropSelector in both the onboarding flow and the profile-edit flow.
5. WHEN a user selects crops from multiple seasons, THE CropSelector SHALL allow multi-selection across all season sections.
6. WHERE the app language is set to Hindi, THE CropSelector SHALL display all crop names and season headers in Hindi.

---

### Requirement 5: Remove Cotton from Crop List

**User Story:** As an app administrator, I want cotton removed from the crop selection list, so that farmers are not presented with an unsupported crop option.

#### Acceptance Criteria

1. THE onboardingOptions module SHALL NOT include cotton (`value: "cotton"`) in any exported crop option array.
2. WHEN the Land_Details_Form renders the CropSelector, THE CropSelector SHALL NOT display cotton as a selectable option.
3. IF a user's existing saved profile contains cotton as a selected crop, THEN THE Profile_Screen SHALL continue to display the stored cotton value without error (backwards compatibility for existing data).
4. THE removal of cotton SHALL apply to all forms that use the crop options from onboardingOptions, including the onboarding Land_Details_Form and the profile-edit Land_Details_Form.
