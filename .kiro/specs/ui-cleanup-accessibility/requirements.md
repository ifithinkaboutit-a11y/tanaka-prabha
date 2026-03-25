# Requirements Document

## Introduction

This feature covers a UI cleanup and accessibility pass for the Tanak Prabha React Native / Expo agricultural app. The work falls into two broad areas:

1. **Visual cleanup** — remove all emoji and cartoon-style visuals, enforce camera-only profile photo capture, fix the crop button opacity, and remove the skippable location step.
2. **Accessibility** — add ARIA-equivalent props (`accessibilityLabel`, `accessibilityRole`, `accessibilityHint`) to every interactive element, enforce 44 × 44 pt minimum touch targets, fix the broken Toggle component, add a live region to search results, add a focus trap to the Select modal, and expose accessibility props through the AppText, FormInput, and Button atoms.

## Glossary

- **App**: The Tanak Prabha React Native / Expo application.
- **Button**: The `Button` atom at `Client/src/components/atoms/Button.tsx`.
- **AppText**: The `AppText` atom at `Client/src/components/atoms/AppText.tsx`.
- **FormInput**: The `FormInput` atom at `Client/src/components/atoms/FormInput.tsx`.
- **Select**: The `Select` atom / modal at `Client/src/components/atoms/Select.tsx`.
- **Toggle**: The `Toggle` atom at `Client/src/components/atoms/Toggle.tsx`.
- **LivestockDetailsForm**: The molecule at `Client/src/components/molecules/LivestockDetailsForm.tsx`.
- **LandDetailsForm**: The molecule at `Client/src/components/molecules/LandDetailsForm.tsx`.
- **PersonalDetailsScreen**: The screen at `Client/src/app/(auth)/personal-details.tsx`.
- **LocationPickerScreen**: The screen at `Client/src/app/(auth)/location-picker.tsx`.
- **SearchScreen**: The screen at `Client/src/app/search.tsx`.
- **TabLayout**: The tab navigator at `Client/src/app/(tab)/_layout.tsx`.
- **Screen_Reader**: Any platform accessibility service (TalkBack on Android, VoiceOver on iOS).
- **Touch_Target**: The tappable hit area of an interactive element.
- **Live_Region**: A React Native `accessibilityLiveRegion` prop that causes Screen_Reader to announce content changes automatically.
- **Focus_Trap**: A pattern that keeps Screen_Reader focus inside a modal until the modal is dismissed, used in Requirement 12.
- **MaterialCommunityIcons**: The `@expo/vector-icons` icon set that includes animal-specific icons (e.g. `cow`, `sheep`, `pig`) not available in Ionicons.
- **Disabled_Opacity**: The visual opacity applied to a disabled interactive element; standardised at `0.45` across the App for consistency.

---

## Requirements

### Requirement 1: Remove Emoji from LivestockDetailsForm

**User Story:** As a farmer using the app, I want the livestock form to look professional, so that the app feels trustworthy and suitable for official use.

#### Acceptance Criteria

1. THE LivestockDetailsForm SHALL replace each animal emoji (`🐄 🐃 🐑 🐐 🐷 🐔 🐾`) with an icon from `MaterialCommunityIcons` (preferred, e.g. `cow`, `sheep`, `pig`) or, where no suitable icon exists, a small monochrome SVG/PNG asset that conveys the same animal category. `Ionicons` may be used only where a matching icon exists.
2. WHEN the LivestockDetailsForm renders an animal row, THE LivestockDetailsForm SHALL display the replacement icon at the same 44 × 44 pt bounding box currently used by the emoji container.
3. THE LivestockDetailsForm SHALL preserve the existing background colour chip for each animal row after the emoji is replaced.

---

### Requirement 2: Remove Emoji from LandDetailsForm

**User Story:** As a farmer using the app, I want the land/crop form to look professional, so that the app feels trustworthy and suitable for official use.

#### Acceptance Criteria

1. THE LandDetailsForm SHALL replace each season emoji (`❄️ 🌧️ ☀️`) with an icon from `MaterialCommunityIcons` (preferred, e.g. `snowflake`, `weather-rainy`, `weather-sunny`) or `Ionicons` where a suitable icon exists. The same library precedence established in Requirement 1 applies here.
2. WHEN the LandDetailsForm renders a season header, THE LandDetailsForm SHALL display the replacement icon at the same size and position currently occupied by the emoji.
3. THE LandDetailsForm SHALL preserve the existing season background colour and label text after the emoji is replaced.

---

### Requirement 3: Camera-Only Profile Photo Capture

**User Story:** As an onboarding user, I want to take a live photo for my profile, so that the app can verify I am a real person and not using a stock image.

#### Acceptance Criteria

1. WHEN the user taps the profile photo area in PersonalDetailsScreen, THE PersonalDetailsScreen SHALL launch the device camera directly using `ImagePicker.launchCameraAsync`.
2. THE PersonalDetailsScreen SHALL NOT present the media library picker (`ImagePicker.launchImageLibraryAsync`) as an option for profile photo capture.
3. IF the user denies camera permission, THEN THE PersonalDetailsScreen SHALL display an alert explaining that camera access is required and offering a button to open device Settings.
4. WHEN a photo is captured, THE PersonalDetailsScreen SHALL upload the photo and display an upload progress indicator until the upload completes.
5. IF the photo upload fails, THEN THE PersonalDetailsScreen SHALL display an error alert and clear the local photo preview.
6. IF the device has no camera (e.g. a tablet or simulator where `ImagePicker.getCameraPermissionsAsync` is unavailable or `ImagePicker.launchCameraAsync` throws), THEN THE PersonalDetailsScreen SHALL fall back to the media library picker and SHALL display an alert (not an inline notice) informing the user that a live photo is preferred, before opening the library.

---

### Requirement 4: Fix Crop Button Visibility

**User Story:** As a farmer editing user details, I want the crop action button to be clearly visible, so that I can tap it without difficulty.

#### Acceptance Criteria

1. THE User details SHALL render the crop save/confirm button with an opacity of 1.0 (fully opaque) in its default enabled state.
2. WHEN the crop button is disabled, THE form SHALL render it with the app-wide Disabled_Opacity of `0.45`, matching the `Button` atom's disabled appearance for visual consistency.

---

### Requirement 5: Fix Toggle Component

**User Story:** As a user interacting with toggle switches, I want the toggle to visually reflect its on/off state and respond correctly to taps, so that I can control settings reliably.

#### Acceptance Criteria

1. WHEN the Toggle value is `true`, THE Toggle SHALL display the thumb at the trailing (right) end of the track.
2. WHEN the Toggle value is `false`, THE Toggle SHALL display the thumb at the leading (left) end of the track.
3. WHEN the user taps the Toggle, THE Toggle SHALL call `onValueChange` (or `onChange`) with the inverted boolean value.
4. WHILE the Toggle `disabled` prop is `true`, THE Toggle SHALL NOT respond to tap events and SHALL render at the app-wide Disabled_Opacity of `0.45`.
5. THE Toggle SHALL animate the thumb position transition using a `react-native` `Animated` value so the movement is smooth.
6. THE Toggle SHALL set `accessibilityRole="switch"` on its tappable `Pressable`.
7. THE Toggle SHALL set `accessibilityState={{ checked: value }}` so Screen_Reader announces the current on/off state when the element is focused.
8. WHEN the Toggle value changes, THE Toggle SHALL update `accessibilityState` immediately so Screen_Reader announces the new state without requiring the user to re-focus the element.

---

### Requirement 6: Remove "Skip for now" from LocationPickerScreen

**User Story:** As a product owner, I want the location step to be mandatory during onboarding, so that every user has a confirmed map pin before proceeding.

#### Acceptance Criteria

1. THE LocationPickerScreen SHALL NOT render the "Skip for now" button in the bottom sheet when the screen is in onboarding mode (i.e. `isProfileMode` is `false`).
2. THE LocationPickerScreen SHALL NOT render the "Skip for now" link in the permission-denied fallback view when the screen is in onboarding mode.
3. WHEN the user is in onboarding mode and location permission is denied, THE LocationPickerScreen SHALL display only the "Enable in Settings" button, directing the user to grant permission.
4. WHERE the screen is opened in profile-edit mode (`isProfileMode` is `true`), THE LocationPickerScreen SHALL retain a dismiss/back action so the user can exit without confirming a new pin.
5. WHEN a user force-quits the app mid-onboarding (after reaching the location step but before confirming a pin) and relaunches, THE App SHALL resume the onboarding flow at the LocationPickerScreen rather than restarting from the beginning, so that already-entered personal details are not lost. The onboarding progress step SHALL be persisted using the existing `onboardingStore` (Zustand with AsyncStorage persistence) — no additional storage mechanism shall be introduced.

---

### Requirement 7: Accessibility Labels on Interactive Elements

**User Story:** As a user who relies on a Screen_Reader, I want every button, pressable, input, and icon to have a descriptive label, so that I can understand and operate the app without seeing the screen.

#### Acceptance Criteria

1. THE Button SHALL accept and forward an `accessibilityLabel` prop to its underlying `Pressable`.
2. THE Button SHALL set `accessibilityRole="button"` on its underlying `Pressable`.
3. THE Button SHALL set `accessibilityState={{ disabled: true }}` when the `disabled` prop is `true`.
4. WHEN a tab item is rendered in TabLayout, THE TabLayout SHALL provide a descriptive `accessibilityLabel` and `accessibilityRole="tab"` for each tab icon.
5. THE SearchScreen back-navigation `Pressable` SHALL have `accessibilityLabel="Go back"` and `accessibilityRole="button"`.
6. THE SearchScreen clear-query `Pressable` SHALL have `accessibilityLabel="Clear search"` and `accessibilityRole="button"`.
7. THE LocationPickerScreen confirm button SHALL have `accessibilityLabel="Confirm location"` and `accessibilityRole="button"`.
8. THE PersonalDetailsScreen photo upload `Pressable` SHALL have `accessibilityLabel="Upload profile photo"` and `accessibilityRole="button"`.
9. THE GreetingHeader notification bell `Pressable` SHALL have `accessibilityLabel="Notifications"` (or `"Notifications, unread"` when `hasNotifications` is `true`) and `accessibilityRole="button"`.
10. THE `AnimatedPressable` wrapper component SHALL forward all accessibility props — `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`, and `accessibilityState` — to its underlying `Pressable`, so that labels set on any element using `AnimatedPressable` are not silently swallowed.

---

### Requirement 8: Minimum 44 × 44 pt Touch Targets

**User Story:** As a user with limited fine motor control, I want all tappable elements to be large enough to tap reliably, so that I do not accidentally miss buttons.

#### Acceptance Criteria

1. THE SearchScreen clear-query button SHALL have a minimum width and height of 44 pt (currently 28 × 28 pt), achieved by increasing the element's padding rather than using `hitSlop`, to avoid overlapping touch areas with the adjacent search input.
2. THE SearchScreen back-navigation button SHALL have a minimum Touch_Target of 44 × 44 pt, achieved via padding.
3. THE Select modal close button SHALL have a minimum Touch_Target of 44 × 44 pt, achieved via padding (not `hitSlop`), since it sits adjacent to the modal title.
4. THE Toggle SHALL have a minimum Touch_Target of 44 × 44 pt on its tappable `Pressable`.
5. THE LocationPickerScreen "my location" button SHALL have a minimum Touch_Target of 44 × 44 pt.
6. WHEN any interactive element in the App has a visual size smaller than 44 × 44 pt and is not adjacent to another tappable element, THE App MAY use `hitSlop` to expand the Touch_Target. WHERE elements are adjacent, padding SHALL be used instead to prevent overlapping touch areas.

---

### Requirement 9: AppText Heading Role Support

**User Story:** As a Screen_Reader user, I want heading text to be announced as a heading, so that I can navigate the screen structure efficiently.

#### Acceptance Criteria

1. THE AppText SHALL accept an `accessibilityRole` prop of type `React.ComponentProps<typeof Text>["accessibilityRole"]`.
2. WHEN `accessibilityRole` is provided to AppText, THE AppText SHALL forward it to the underlying `Text` element.
3. WHEN AppText is rendered with variant `h1`, `h2`, or `h3` and no explicit `accessibilityRole` is provided, THE AppText SHALL default `accessibilityRole` to `"header"`.
4. WHEN AppText is rendered with any variant other than `h1`, `h2`, or `h3` and no explicit `accessibilityRole` is provided, THE AppText SHALL NOT apply a default `accessibilityRole`, leaving the element as plain text for Screen_Reader.

---

### Requirement 10: FormInput Accessibility Label

**User Story:** As a Screen_Reader user filling in a form, I want each text input to announce its label, so that I know what information to enter.

#### Acceptance Criteria

1. THE FormInput SHALL accept an `accessibilityLabel` prop.
2. WHEN `accessibilityLabel` is provided to FormInput, THE FormInput SHALL forward it to the underlying `TextInput`.
3. WHEN `accessibilityLabel` is not provided but `label` is, THE FormInput SHALL derive `accessibilityLabel` from the `label` string and forward it to the underlying `TextInput`.
4. WHEN FormInput has a non-empty `error` prop, THE FormInput SHALL render the error message inside a `View` with `accessibilityLiveRegion="assertive"` so Screen_Reader announces the validation error immediately without the user moving focus.

---

### Requirement 11: Search Results Live Region

**User Story:** As a Screen_Reader user searching for content, I want the result count to be announced automatically when it changes, so that I know how many results were found without moving focus.

#### Acceptance Criteria

1. THE SearchScreen results-count view SHALL set `accessibilityLiveRegion="polite"` so Screen_Reader announces changes without interrupting ongoing speech.
2. WHEN `totalResults` changes and is greater than zero, THE SearchScreen SHALL render the results-count text inside the live-region view so Screen_Reader reads the updated count.
3. THE SearchScreen results-count view SHALL set `accessible={true}` and include a descriptive `accessibilityLabel` that includes the numeric count.
4. WHEN `totalResults` is zero and a search query is active, THE SearchScreen SHALL render a "No results found" message inside the same live-region view so Screen_Reader announces the zero-results state automatically.

---

### Requirement 12: Select Modal Focus Trap and Accessible Dismiss

**User Story:** As a Screen_Reader user, I want focus to stay inside the Select modal while it is open and to be able to dismiss it accessibly, so that I do not accidentally interact with content behind the modal.

#### Acceptance Criteria

1. WHEN the Select modal is open, THE Select SHALL implement a Focus_Trap by setting `importantForAccessibility="no-hide-descendants"` on the backdrop view so Screen_Reader cannot reach content behind the modal.
2. THE Select modal close button SHALL have `accessibilityLabel="Close"` and `accessibilityRole="button"`.
3. THE Select modal SHALL handle the `onRequestClose` callback (Android back button) by calling `closeModal` so Screen_Reader users can dismiss with the standard back gesture.
4. WHEN an option is selected, THE Select SHALL announce the selected option label via `accessibilityLabel` on the option row.
5. THE Select trigger button SHALL have `accessibilityRole="button"` and an `accessibilityLabel` that includes the currently selected option label or the placeholder text when nothing is selected.
6. WHEN the Select modal closes (whether by selecting an option or dismissing), THE Select SHALL return Screen_Reader focus to the trigger button that opened the modal.

---

## Testing & Definition of Done

The following criteria must be met before this feature is considered complete. These are QA gates, not feature requirements.

1. EACH requirement in this document SHALL be verified using TalkBack on Android (API 30+) and VoiceOver on iOS (iOS 16+) before the feature is marked complete.
2. THE developer SHALL use the iOS Accessibility Inspector to confirm that all `accessibilityLabel`, `accessibilityRole`, and `accessibilityHint` values are correctly reported for Requirements 7–12.
3. THE developer SHALL run the Android Accessibility Scanner app against all modified screens to catch contrast, touch target, and label issues that TalkBack alone may not surface.
4. WHEN verifying Requirement 11, THE developer SHALL confirm that TalkBack and VoiceOver announce result count changes (including the zero-results state) without the user moving focus.
5. WHEN verifying Requirement 12, THE developer SHALL confirm that focus returns to the Select trigger button after the modal closes on both platforms.
