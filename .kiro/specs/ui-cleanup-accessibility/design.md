# Design Document: UI Cleanup & Accessibility

## Overview

This design covers a two-area pass over the Tanak Prabha React Native / Expo app:

1. **Visual cleanup** — swap emoji for vector icons in `LivestockDetailsForm` and `LandDetailsForm`, enforce camera-only profile photo capture in `PersonalDetailsScreen`, fix crop-button opacity, fix the broken `Toggle` component, and remove the "Skip for now" escape hatch from `LocationPickerScreen` during onboarding.
2. **Accessibility** — add `accessibilityLabel` / `accessibilityRole` / `accessibilityHint` / `accessibilityState` to every interactive element, enforce 44 × 44 pt minimum touch targets, auto-default heading roles in `AppText`, derive labels in `FormInput`, add a live region to `SearchScreen`, and implement a focus trap in the `Select` modal.

All changes are confined to existing files — no new screens, stores, or navigation routes are introduced. The `onboardingStore` already uses Zustand + AsyncStorage persistence; Requirement 6 adds a single `onboardingStep` field to that store.

---

## Architecture

The changes are purely at the component and screen layer. No backend, API, or navigation-structure changes are required.

```
┌─────────────────────────────────────────────────────────────┐
│                        Screens                              │
│  personal-details  location-picker  search  (tab)/_layout   │
└────────────┬───────────────┬──────────┬──────────┬──────────┘
             │               │          │          │
┌────────────▼───────────────▼──────────▼──────────▼──────────┐
│                       Molecules                             │
│        LivestockDetailsForm    LandDetailsForm              │
│        GreetingHeader                                       │
└────────────┬───────────────────────────────────────────────┘
             │
┌────────────▼───────────────────────────────────────────────┐
│                        Atoms                               │
│  Button  AppText  FormInput  Select  Toggle  AnimatedPressable│
└────────────────────────────────────────────────────────────┘
             │
┌────────────▼───────────────────────────────────────────────┐
│                       Stores                               │
│              onboardingStore (Zustand + AsyncStorage)       │
└────────────────────────────────────────────────────────────┘
```

Each requirement maps to one or more files. No cross-cutting infrastructure changes are needed.

---

## Components and Interfaces

### Req 1 — LivestockDetailsForm: emoji → MaterialCommunityIcons

Replace the `emoji` string field in `ANIMAL_DATA` with a `MaterialCommunityIcons` icon name. The `AnimalCounter` sub-component receives an `iconName` prop instead of `emoji`.

```ts
// Before
{ key: "cow", emoji: "🐄", color: "#FEF3C7", iconColor: "#D97706" }

// After
{ key: "cow", iconName: "cow", color: "#FEF3C7", iconColor: "#D97706" }
```

Icon mapping:

| Animal   | MaterialCommunityIcons name |
|----------|-----------------------------|
| cow      | `cow`                       |
| buffalo  | `cow` (tinted differently)  |
| sheep    | `sheep`                     |
| goat     | `goat`                      |
| pig      | `pig`                       |
| poultry  | `bird`                      |
| others   | `paw` (Ionicons fallback)   |

The `emojiBox` container already has `width: 44, height: 44` — no size change needed.

### Req 2 — LandDetailsForm: emoji → MaterialCommunityIcons

Replace the `icon` string field in `SEASONS` with an `iconName` for `MaterialCommunityIcons`.

```ts
// Before
{ field: "rabiCrop", icon: "❄️", ... }

// After
{ field: "rabiCrop", iconName: "snowflake", iconLib: "mci", ... }
```

Icon mapping:

| Season | Icon name          | Library               |
|--------|--------------------|-----------------------|
| Rabi   | `snowflake`        | MaterialCommunityIcons |
| Kharif | `weather-rainy`    | MaterialCommunityIcons |
| Zaid   | `weather-sunny`    | MaterialCommunityIcons |

### Req 3 — PersonalDetailsScreen: camera-only capture

Replace `handlePhotoUpload` logic:

1. Call `ImagePicker.requestCameraPermissionsAsync()` first.
2. If denied → `Alert` with "Open Settings" button (`Linking.openSettings()`). No library fallback in the normal path.
3. If granted → `ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.75 })`.
4. On no-camera device (catch block when `launchCameraAsync` throws `ERR_CAMERA_UNAVAILABLE` or similar) → show alert "Live photo preferred", then fall back to `launchImageLibraryAsync`.

```ts
const handlePhotoUpload = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Camera Required", "...", [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]);
    return;
  }
  try {
    const result = await ImagePicker.launchCameraAsync({ ... });
    if (!result.canceled) await processPhoto(result.assets[0].uri);
  } catch {
    // No camera device
    Alert.alert("No Camera", "A live photo is preferred. Opening your photo library instead.");
    const result = await ImagePicker.launchImageLibraryAsync({ ... });
    if (!result.canceled) await processPhoto(result.assets[0].uri);
  }
};
```

### Req 4 — LandDetailsForm: crop button opacity

The `Button` atom already applies `opacity: 0.45` (via `opacity-50` Tailwind class — currently 0.5, needs correction to 0.45) when `disabled={true}`. The save button in `LandDetailsForm` is never passed `disabled`, so it always renders at full opacity. No change needed to the button itself for the enabled state. The `Button` atom's disabled opacity class should be updated from `opacity-50` (0.5) to a custom `opacity-[0.45]` to match the spec.

### Req 5 — Toggle: full rewrite

Current issues: no `Animated` value, thumb position uses `alignSelf` (works but not animated), opacity is 0.5 not 0.45, no accessibility props.

New implementation:

```ts
interface ToggleProps {
  label?: string;
  value?: boolean;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}
```

Key changes:
- Use `Animated.Value` for thumb `translateX` (0 → trackWidth - thumbSize - padding).
- `useEffect` on `currentValue` to drive `Animated.timing` (200 ms, `useNativeDriver: true`).
- Pressable: `minWidth: 44, minHeight: 44` for touch target.
- `accessibilityRole="switch"`, `accessibilityState={{ checked: currentValue }}`.
- `disabled` → `opacity: 0.45`, no press response.

Track dimensions: width 52, height 30, padding 3. Thumb: 24 × 24. Travel: 52 - 24 - 6 = 22 pt.

### Req 6 — LocationPickerScreen: remove skip, persist step

**Remove skip buttons:**
- In the bottom sheet: remove the `<Pressable style={styles.skipBtn}>` block when `!isProfileMode`.
- In the permission-denied view: remove the `<Pressable style={styles.skipLinkBtn}>` block when `!isProfileMode`.
- Keep `handleSkip` for profile-edit mode only.

**Persist onboarding step:**
Add `onboardingStep` to `onboardingStore`:

```ts
// In OnboardingState interface
onboardingStep: number;  // 0=personal, 1=location, 2=land, 3=livestock
setOnboardingStep: (step: number) => void;
```

The store already persists to AsyncStorage via `zustand/middleware/persist`, so this field is automatically persisted. Call `setOnboardingStep(1)` when `PersonalDetailsScreen` navigates to `location-picker`. The root `_layout.tsx` (or the auth layout) reads `onboardingStep` on mount to redirect to the correct screen.

### Req 7 — Accessibility labels on interactive elements

**Button atom** — add to props interface and forward:
```ts
interface ButtonProps {
  // existing...
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
// In Pressable:
accessibilityLabel={accessibilityLabel}
accessibilityRole="button"
accessibilityState={{ disabled: !!disabled }}
```

**AnimatedPressable** — extend interface and forward to inner `Pressable`:
```ts
interface AnimatedPressableProps {
  // existing...
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityHint?: string;
  accessibilityState?: object;
}
```

**GreetingHeader** — notification bell label:
```tsx
accessibilityLabel={hasNotifications ? "Notifications, unread" : "Notifications"}
accessibilityRole="button"
```

**TabLayout** — add `accessibilityLabel` and `accessibilityRole="tab"` to each `Tabs.Screen` option.

**SearchScreen** — back button and clear button labels (see Req 8 for sizing).

**LocationPickerScreen** — confirm button label.

**PersonalDetailsScreen** — photo upload pressable label.

### Req 8 — Minimum 44 × 44 pt touch targets

| Element | Current size | Fix |
|---------|-------------|-----|
| SearchScreen back button | ~32 × 32 | Add `padding: 10` to reach 44 × 44 |
| SearchScreen clear button | 28 × 28 (`w-7 h-7`) | Replace with `width: 44, height: 44` container, keep inner icon |
| Select modal close button | ~30 × 30 | Add `padding: 11` |
| Toggle Pressable | 52 × 30 | Add `minHeight: 44` |
| LocationPickerScreen my-location button | needs check | Add `width: 44, height: 44` minimum |

### Req 9 — AppText heading role

```ts
// Derive default role
const headingVariants: Variant[] = ["h1", "h2", "h3"];

export default function AppText({ variant = "bodyMd", accessibilityRole, ...props }) {
  const role = accessibilityRole ?? (headingVariants.includes(variant) ? "header" : undefined);
  return <Text accessibilityRole={role} style={[variantStyles[variant], props.style]} {...props} />;
}
```

The `AppTextProps` type must include `accessibilityRole` from `React.ComponentProps<typeof Text>`.

### Req 10 — FormInput accessibility label

```ts
interface FormInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  accessibilityLabel?: string;
}

// Derived label
const derivedLabel = accessibilityLabel ?? label;

// TextInput
<TextInput accessibilityLabel={derivedLabel} ... />

// Error view
{error && (
  <View accessibilityLiveRegion="assertive">
    <AppText variant="bodySm" style={styles.error}>{error}</AppText>
  </View>
)}
```

### Req 11 — Search results live region

Wrap the results-count display in a live-region view:

```tsx
<View
  accessible={true}
  accessibilityLiveRegion="polite"
  accessibilityLabel={
    totalResults > 0
      ? `${totalResults} results found`
      : hasQuery ? "No results found" : ""
  }
>
  {hasQuery && totalResults > 0 && !isSearching && (
    <AppText>...</AppText>
  )}
  {showEmpty && (
    <AppText>No results found</AppText>
  )}
</View>
```

The zero-results state (`showEmpty`) is currently rendered in a separate section. It should be moved inside the live-region view, or the live-region view should update its `accessibilityLabel` to reflect the zero state.

### Req 12 — Select modal focus trap

```tsx
{/* Backdrop — hides content behind modal from screen reader */}
<Pressable
  className="flex-1 bg-black/50"
  importantForAccessibility="no-hide-descendants"
  onPress={closeModal}
>
  {/* Sheet — accessible content */}
  <Pressable ... onPress={(e) => e.stopPropagation()}>
    ...
    {/* Close button */}
    <TouchableOpacity
      onPress={closeModal}
      accessibilityLabel="Close"
      accessibilityRole="button"
      style={{ padding: 11 }}  // 44pt target
    >
      <Ionicons name="close" size={22} />
    </TouchableOpacity>
    ...
  </Pressable>
</Pressable>
```

Trigger button:
```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel={selectedOption?.label ?? placeholder}
  onPress={openModal}
>
```

Focus return on close: use a `triggerRef` (`useRef<View>(null)`) attached to the trigger `Pressable`. On `closeModal`, call `AccessibilityInfo.setAccessibilityFocus(findNodeHandle(triggerRef.current))`.

---

## Data Models

### onboardingStore additions (Req 6)

```ts
// New field in OnboardingState
onboardingStep: number;  // persisted step index: 0=personal, 1=location, 2=land, 3=livestock

// New action
setOnboardingStep: (step: number) => void;
```

Initial value: `0`. Updated by each screen before navigating forward. Because the store already uses `createJSONStorage(() => AsyncStorage)` with `persist`, this field is automatically written to AsyncStorage on every change and rehydrated on app launch.

### Toggle internal state (Req 5)

```ts
// Internal to Toggle component — not stored externally
const thumbAnim = useRef(new Animated.Value(currentValue ? THUMB_TRAVEL : 0)).current;
```

`THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2 = 52 - 24 - 6 = 22`

### AnimatedPressable props extension (Req 7, 10)

```ts
interface AnimatedPressableProps {
  // existing props...
  accessibilityLabel?: string;
  accessibilityRole?: React.ComponentProps<typeof Pressable>["accessibilityRole"];
  accessibilityHint?: string;
  accessibilityState?: React.ComponentProps<typeof Pressable>["accessibilityState"];
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Animal rows use icons, not emoji, and preserve layout

*For any* animal entry in `ANIMAL_DATA`, when `LivestockDetailsForm` renders that entry, the rendered output should contain a `MaterialCommunityIcons` (or `Ionicons`) component — not a raw emoji character — and the icon container should have `width: 44` and `height: 44`, and the container's `backgroundColor` should equal the entry's `color` value.

**Validates: Requirements 1.1, 1.2, 1.3**

---

### Property 2: Season rows use icons, not emoji, and preserve background/label

*For any* season entry in `SEASONS`, when `LandDetailsForm` renders that entry, the rendered output should contain a `MaterialCommunityIcons` component — not a raw emoji character — and the season header's `backgroundColor` should equal the entry's `bg` value, and the label text should equal the translated season name.

**Validates: Requirements 2.1, 2.2, 2.3**

---

### Property 3: Toggle thumb position matches value

*For any* boolean `value` passed to `Toggle`, the thumb's animated `translateX` should be `THUMB_TRAVEL` when `value` is `true` and `0` when `value` is `false`.

**Validates: Requirements 5.1, 5.2**

---

### Property 4: Toggle tap inverts value

*For any* boolean `value` passed to `Toggle` (when not disabled), tapping the `Pressable` should call `onValueChange` with `!value`.

**Validates: Requirement 5.3**

---

### Property 5: Toggle accessibilityState mirrors value

*For any* boolean `value` passed to `Toggle`, the `Pressable`'s `accessibilityState.checked` should equal `value`.

**Validates: Requirements 5.7, 5.8**

---

### Property 6: Onboarding step persists across rehydration

*For any* `onboardingStep` value written to `onboardingStore`, after the store is serialized to AsyncStorage and a new store instance is rehydrated from that storage, the `onboardingStep` value should equal the original value.

**Validates: Requirement 6.5**

---

### Property 7: Button forwards accessibilityLabel and disabled state

*For any* `accessibilityLabel` string and `disabled` boolean passed to `Button`, the underlying `Pressable` should receive `accessibilityLabel` equal to the prop and `accessibilityState.disabled` equal to the `disabled` prop.

**Validates: Requirements 7.1, 7.3**

---

### Property 8: Tab bar items have accessibilityLabel and role

*For any* tab screen rendered in `TabLayout`, the tab bar item should have a non-empty `accessibilityLabel` and `accessibilityRole="tab"`.

**Validates: Requirement 7.4**

---

### Property 9: Notification bell label reflects unread state

*For any* `hasNotifications` boolean passed to `GreetingHeader`, the notification bell `Pressable`'s `accessibilityLabel` should be `"Notifications, unread"` when `hasNotifications` is `true` and `"Notifications"` when `false`.

**Validates: Requirement 7.9**

---

### Property 10: AnimatedPressable forwards all accessibility props

*For any* combination of `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`, and `accessibilityState` passed to `AnimatedPressable`, all of those props should appear unchanged on the inner `Pressable`.

**Validates: Requirement 7.10**

---

### Property 11: AppText heading variants default to "header" role; others do not

*For any* variant in `{h1, h2, h3}` with no explicit `accessibilityRole`, the rendered `Text` element's `accessibilityRole` should be `"header"`. *For any* variant not in that set with no explicit `accessibilityRole`, the rendered `Text` element should have no `accessibilityRole` (or `undefined`).

**Validates: Requirements 9.3, 9.4**

---

### Property 12: AppText forwards explicit accessibilityRole

*For any* `accessibilityRole` value explicitly passed to `AppText`, the underlying `Text` element should receive that exact value, regardless of variant.

**Validates: Requirements 9.1, 9.2**

---

### Property 13: FormInput derives accessibilityLabel from label or explicit prop

*For any* `FormInput` rendered with either an explicit `accessibilityLabel` prop or a `label` prop (but not both), the underlying `TextInput`'s `accessibilityLabel` should equal the explicit prop if provided, otherwise the `label` string.

**Validates: Requirements 10.2, 10.3**

---

### Property 14: FormInput error view has assertive live region

*For any* non-empty `error` string passed to `FormInput`, the error message should be rendered inside a `View` whose `accessibilityLiveRegion` prop equals `"assertive"`.

**Validates: Requirement 10.4**

---

### Property 15: Search results count live region reflects count

*For any* positive `totalResults` value, the results-count view should have `accessibilityLiveRegion="polite"`, `accessible={true}`, and an `accessibilityLabel` that includes the numeric count as a substring.

**Validates: Requirements 11.1, 11.2, 11.3**

---

### Property 16: Select option rows have accessibilityLabel equal to option label

*For any* option in the `options` array passed to `Select`, the rendered option row's `accessibilityLabel` should equal `option.label`.

**Validates: Requirement 12.4**

---

### Property 17: Select trigger accessibilityLabel reflects selection or placeholder

*For any* `value` and `options` array passed to `Select`, the trigger `Pressable`'s `accessibilityLabel` should equal the matching option's `label` when a match exists, or the `placeholder` string when no match exists.

**Validates: Requirement 12.5**

---

## Error Handling

### Camera permission denied (Req 3)
Show `Alert.alert` with a single "Open Settings" CTA (`Linking.openSettings()`). Do not silently fall back to the library — the user must make an explicit choice.

### No-camera device (Req 3)
Wrap `launchCameraAsync` in a try/catch. On any thrown error, show an alert explaining that a live photo is preferred, then open the library. This covers simulators and tablets.

### Photo upload failure (Req 3)
On `uploadApi.uploadUserPhoto` rejection, show an error alert, clear `localPhotoUri`, and clear `personalDetails.photoUrl` so the user can retry.

### Location permission denied (Req 6)
In onboarding mode, show only the "Enable in Settings" button. The user cannot proceed without granting permission (no skip). In profile-edit mode, retain the back/dismiss action.

### Geocode failure (Req 6, existing)
The existing `geocodeError` state already handles Nominatim failures gracefully — the confirm button remains enabled so the user can still pin their location without a resolved address.

### Toggle disabled state (Req 5)
When `disabled={true}`, the `Pressable`'s `onPress` is set to `undefined` (not just ignored) and `opacity: 0.45` is applied. This prevents any accidental activation.

---

## Testing Strategy

### Unit tests (Jest + React Native Testing Library)

Unit tests cover specific examples, edge cases, and error conditions. They should be focused and not duplicate what property tests cover.

Key unit test scenarios:
- `Toggle`: disabled state does not call `onValueChange`; `accessibilityRole="switch"` is present.
- `PersonalDetailsScreen`: tapping photo area calls `launchCameraAsync` (not `launchImageLibraryAsync`); permission-denied path shows alert.
- `LocationPickerScreen`: "Skip for now" is absent when `isProfileMode=false`; present when `isProfileMode=true`.
- `Select`: `onRequestClose` calls `closeModal`; backdrop has `importantForAccessibility="no-hide-descendants"`.
- `SearchScreen`: zero-results state renders inside the live-region view.
- `FormInput`: error view has `accessibilityLiveRegion="assertive"`.

### Property-based tests (fast-check)

Use [fast-check](https://github.com/dubzzz/fast-check) for React Native. Each property test runs a minimum of **100 iterations**.

Tag format for each test: `// Feature: ui-cleanup-accessibility, Property N: <property_text>`

**Property 1** — `fc.constantFrom(...ANIMAL_DATA)` → render `AnimalCounter` → assert no emoji in output, container size 44×44, backgroundColor matches.

**Property 2** — `fc.constantFrom(...SEASONS)` → render season header → assert no emoji, backgroundColor matches, label text present.

**Property 3** — `fc.boolean()` → render `Toggle` with `value` → assert `thumbAnim` final value equals `value ? THUMB_TRAVEL : 0`.

**Property 4** — `fc.boolean()` → render `Toggle` with `value`, tap → assert `onValueChange` called with `!value`.

**Property 5** — `fc.boolean()` → render `Toggle` with `value` → assert `accessibilityState.checked === value`.

**Property 6** — `fc.integer({ min: 0, max: 3 })` → write to store → serialize → deserialize → assert step equals original.

**Property 7** — `fc.string()` × `fc.boolean()` → render `Button` → assert `accessibilityLabel` and `accessibilityState.disabled` forwarded.

**Property 8** — `fc.constantFrom(...TAB_NAMES)` → render `TabLayout` → assert each tab has non-empty `accessibilityLabel` and `accessibilityRole="tab"`.

**Property 9** — `fc.boolean()` → render `GreetingHeader` with `hasNotifications` → assert label matches expected string.

**Property 10** — `fc.record({ accessibilityLabel: fc.string(), accessibilityRole: fc.string(), accessibilityHint: fc.string() })` → render `AnimatedPressable` → assert all props forwarded to inner `Pressable`.

**Property 11** — `fc.constantFrom("h1","h2","h3","bodyLg","bodyMd","bodySm","caption")` → render `AppText` without explicit role → assert role is `"header"` iff variant is heading.

**Property 12** — `fc.string()` × `fc.constantFrom(ALL_VARIANTS)` → render `AppText` with explicit `accessibilityRole` → assert forwarded unchanged.

**Property 13** — `fc.string()` × `fc.option(fc.string())` → render `FormInput` → assert `TextInput.accessibilityLabel` equals explicit prop or label.

**Property 14** — `fc.string({ minLength: 1 })` → render `FormInput` with `error` → assert error container has `accessibilityLiveRegion="assertive"`.

**Property 15** — `fc.integer({ min: 1 })` → render `SearchScreen` with `totalResults` → assert live-region view has correct props and label includes count.

**Property 16** — `fc.array(fc.record({ label: fc.string(), value: fc.string() }), { minLength: 1 })` → render `Select` open → assert each option row's `accessibilityLabel` equals its `label`.

**Property 17** — `fc.option(fc.string())` × `fc.array(...)` → render `Select` trigger → assert `accessibilityLabel` equals selected label or placeholder.

### Manual / QA gates (from requirements)

- TalkBack (Android API 30+) and VoiceOver (iOS 16+) verification for all Requirements 7–12.
- iOS Accessibility Inspector for label/role/hint values.
- Android Accessibility Scanner for contrast, touch targets, and label issues.
- Confirm TalkBack/VoiceOver announce result count changes without focus move (Req 11).
- Confirm focus returns to Select trigger after modal close on both platforms (Req 12).
