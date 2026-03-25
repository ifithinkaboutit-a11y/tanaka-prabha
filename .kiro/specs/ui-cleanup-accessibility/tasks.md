# Tasks

## Task List

- [x] 1. Replace animal emojis with MaterialCommunityIcons in LivestockDetailsForm
  - [x] 1.1 Add `@expo/vector-icons` `MaterialCommunityIcons` import to `LivestockDetailsForm.tsx`
  - [x] 1.2 Replace `emoji` field in `ANIMAL_DATA` with `iconName` (MCI) and `iconLib` fields
  - [x] 1.3 Update `AnimalCounter` sub-component to render `MaterialCommunityIcons` (or `Ionicons` for "others") instead of `<Text>{emoji}</Text>`
  - [x] 1.4 Verify `emojiBox` container retains `width: 44, height: 44` and per-animal `backgroundColor`

- [x] 2. Replace season emojis with MaterialCommunityIcons in LandDetailsForm
  - [x] 2.1 Add `MaterialCommunityIcons` import to `LandDetailsForm.tsx`
  - [x] 2.2 Replace `icon` emoji string in `SEASONS` array with `iconName` for `snowflake`, `weather-rainy`, `weather-sunny`
  - [x] 2.3 Update season header render to use `<MaterialCommunityIcons>` instead of `<Text>{icon}</Text>`
  - [x] 2.4 Confirm season `bg` colour and label text are unchanged

- [x] 3. Enforce camera-only profile photo capture in PersonalDetailsScreen
  - [x] 3.1 Rewrite `handlePhotoUpload` to call `requestCameraPermissionsAsync` first
  - [x] 3.2 On permission denied, show `Alert` with "Open Settings" CTA (`Linking.openSettings()`) — no library fallback
  - [x] 3.3 On permission granted, call `launchCameraAsync` only
  - [x] 3.4 Wrap `launchCameraAsync` in try/catch; on error (no-camera device) show alert then fall back to `launchImageLibraryAsync`
  - [x] 3.5 Add `Linking` import if not already present

- [x] 4. Fix crop button opacity in LandDetailsForm
  - [x] 4.1 Update `Button` atom disabled opacity class from `opacity-50` to `opacity-[0.45]`
  - [x] 4.2 Confirm the save button in `LandDetailsForm` has no `disabled` prop in its default state (renders at opacity 1.0)

- [x] 5. Fix Toggle component
  - [x] 5.1 Add `Animated` import from `react-native` and define `TRACK_WIDTH=52`, `THUMB_SIZE=24`, `THUMB_TRAVEL=22` constants
  - [x] 5.2 Replace `alignSelf` thumb positioning with `Animated.Value` driving `translateX`
  - [x] 5.3 Add `useEffect` to run `Animated.timing` (200 ms, `useNativeDriver: true`) when `currentValue` changes
  - [x] 5.4 Set `minWidth: 44, minHeight: 44` on the tappable `Pressable` for touch target compliance
  - [x] 5.5 Change disabled opacity from `0.5` to `0.45`
  - [x] 5.6 Add `accessibilityRole="switch"` to the `Pressable`
  - [x] 5.7 Add `accessibilityState={{ checked: currentValue }}` to the `Pressable`

- [x] 6. Remove "Skip for now" from LocationPickerScreen in onboarding mode and persist step
  - [x] 6.1 Remove the bottom-sheet `<Pressable style={styles.skipBtn}>` block when `!isProfileMode`
  - [x] 6.2 Remove the permission-denied `<Pressable style={styles.skipLinkBtn}>` block when `!isProfileMode`
  - [x] 6.3 Add `onboardingStep: number` field and `setOnboardingStep` action to `onboardingStore`
  - [x] 6.4 Call `setOnboardingStep(1)` in `PersonalDetailsScreen` before navigating to `location-picker`
  - [x] 6.5 In the auth `_layout.tsx` (or root layout), read `onboardingStep` on mount and redirect to the correct screen if mid-onboarding

- [x] 7. Add accessibility labels and roles to all interactive elements
  - [x] 7.1 Add `accessibilityLabel`, `accessibilityRole="button"`, and `accessibilityState` props to `Button` atom and forward to `Pressable`
  - [x] 7.2 Extend `AnimatedPressable` interface with `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`, `accessibilityState` and forward all to inner `Pressable`
  - [x] 7.3 Add `accessibilityLabel` (with/without "unread") and `accessibilityRole="button"` to the notification bell in `GreetingHeader`
  - [x] 7.4 Add `accessibilityLabel` and `accessibilityRole="tab"` to each `Tabs.Screen` in `TabLayout`
  - [x] 7.5 Add `accessibilityLabel="Go back"` and `accessibilityRole="button"` to `SearchScreen` back button
  - [x] 7.6 Add `accessibilityLabel="Clear search"` and `accessibilityRole="button"` to `SearchScreen` clear button
  - [x] 7.7 Add `accessibilityLabel="Confirm location"` and `accessibilityRole="button"` to `LocationPickerScreen` confirm button
  - [x] 7.8 Add `accessibilityLabel="Upload profile photo"` and `accessibilityRole="button"` to `PersonalDetailsScreen` photo upload `Pressable`

- [x] 8. Enforce minimum 44 × 44 pt touch targets
  - [x] 8.1 Increase `SearchScreen` back button padding to achieve 44 × 44 pt target
  - [x] 8.2 Replace `SearchScreen` clear button `w-7 h-7` with `width: 44, height: 44` container (padding-based)
  - [x] 8.3 Add `padding: 11` to `Select` modal close `TouchableOpacity` to reach 44 × 44 pt
  - [x] 8.4 Ensure `Toggle` `Pressable` has `minHeight: 44` (covered by task 5.4)
  - [x] 8.5 Ensure `LocationPickerScreen` my-location button has `width: 44, height: 44` minimum

- [x] 9. Add heading accessibilityRole defaults to AppText
  - [x] 9.1 Add `accessibilityRole` to `AppTextProps` type (from `React.ComponentProps<typeof Text>`)
  - [x] 9.2 Derive default role: `"header"` for `h1`/`h2`/`h3` variants, `undefined` for all others
  - [x] 9.3 Forward the resolved role to the underlying `<Text>` element

- [x] 10. Add accessibility label derivation and live region to FormInput
  - [x] 10.1 Add `accessibilityLabel` prop to `FormInputProps`
  - [x] 10.2 Derive `accessibilityLabel` from explicit prop, falling back to `label` string
  - [x] 10.3 Forward derived label to `TextInput`
  - [x] 10.4 Wrap error `AppText` in a `View` with `accessibilityLiveRegion="assertive"`

- [x] 11. Add live region to SearchScreen results count
  - [x] 11.1 Wrap the results-count display in a `View` with `accessibilityLiveRegion="polite"`, `accessible={true}`, and a dynamic `accessibilityLabel` that includes the count
  - [x] 11.2 Include the zero-results ("No results found") message inside the same live-region view so it is announced automatically

- [x] 12. Implement Select modal focus trap and accessible dismiss
  - [x] 12.1 Add `importantForAccessibility="no-hide-descendants"` to the backdrop `Pressable` in `Select`
  - [x] 12.2 Add `accessibilityLabel="Close"` and `accessibilityRole="button"` to the modal close button
  - [x] 12.3 Confirm `onRequestClose` is wired to `closeModal` (already present — verify and keep)
  - [x] 12.4 Add `accessibilityLabel={option.label}` to each option row `TouchableOpacity`
  - [x] 12.5 Add `accessibilityRole="button"` and `accessibilityLabel={selectedOption?.label ?? placeholder}` to the trigger `Pressable`
  - [x] 12.6 Add a `triggerRef` to the trigger `Pressable` and call `AccessibilityInfo.setAccessibilityFocus` on close to return focus
