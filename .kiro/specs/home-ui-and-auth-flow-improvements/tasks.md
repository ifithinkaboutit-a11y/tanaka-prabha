# Implementation Plan: Home UI & Auth Flow Improvements

## Overview

Five targeted changes across Banner.tsx, index.tsx, scheme-details.tsx, phone-input.tsx, and a new NotificationAlert component. Each task maps to one file or one discrete change.

## Tasks

- [x] 1. Add chevron controls to BannerSlideshow
  - File: `Client/src/components/molecules/Banner.tsx`
  - Refactor `goToIndex((prev) => ...)` into `goToSlide(nextIndex: number)` that accepts a direct index value and runs the existing cross-fade + state update logic
  - Add two absolutely-positioned `Pressable` chevron buttons inside the banner card `View`, left at `left: 10` and right at `right: 10`, vertically centred with `top: "50%"` + `transform: [{ translateY: -22 }]`
  - Each chevron uses `Ionicons` `chevron-back` / `chevron-forward`, size 24, color `#fff`, wrapped in a `View` with `backgroundColor: "rgba(0,0,0,0.35)"`, `borderRadius: 22`, `padding: 10` (44×44 pt touch target)
  - Left chevron calls `goToSlide((currentIndex - 1 + banners.length) % banners.length)`
  - Right chevron calls `goToSlide((currentIndex + 1) % banners.length)`
  - Render both chevrons only when `banners.length > 1` (same condition as dot indicators)
  - Update the auto-slide `setInterval` to call `goToSlide` instead of `goToIndex`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Restructure home screen layout — remove SearchBar, BannerSlideshow, and banner data
  - File: `Client/src/app/(tab)/index.tsx`
  - Remove `BannerSlideshow` and `SearchBar` imports
  - Remove `bannersApi` from the `apiService` import
  - Remove `banners` and `translatedBanners` state, `FALLBACK_BANNERS` constant, and the `bannersApi.getAll()` call from `fetchData` (keep `schemesApi` and `notificationsApi` calls)
  - Remove the `<BannerSlideshow>` render block and its wrapping `<View>`
  - Remove the `<SearchBar>` render block and its wrapping `<View style={{ marginTop: 4 }}>`; the sticky header card now contains only `<GreetingHeader>`
  - Move the Quick Actions `<View>` (heading + `<QuickActionGrid>`) to be the first content block directly after the sticky header card
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Create NotificationAlert component
  - File: `Client/src/components/molecules/NotificationAlert.tsx` (new file)
  - Define `NotificationAlertProps` interface with `notification: { id: string; title: string; description: string }`, `onDismiss: () => void`, `onViewAll: () => void`
  - Render a `View` with `backgroundColor: "#FFFBEB"`, `borderWidth: 1`, `borderColor: "#FDE68A"`, `borderRadius: 12`, left accent bar (`position: "absolute"`, `left: 0`, `top: 0`, `bottom: 0`, `width: 4`, `backgroundColor: "#F59E0B"`, `borderRadius` left sides)
  - Top row: `Ionicons` `notifications-outline` size 18 color `#D97706`, title `AppText`, and a dismiss `TouchableOpacity` with `Ionicons` `close-outline` size 18
  - Body: `AppText` with `numberOfLines={2}` for truncation
  - Bottom row: `TouchableOpacity` "View All →" with `color: "#386641"` calling `onViewAll`
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 4. Integrate NotificationAlert into home screen
  - File: `Client/src/app/(tab)/index.tsx`
  - Import `NotificationAlert` from `@/components/molecules/NotificationAlert`
  - Add `Notification` to the `apiService` import
  - Add state: `const [latestNotification, setLatestNotification] = useState<Notification | null>(null)` and `const [notificationDismissed, setNotificationDismissed] = useState(false)`
  - In `fetchData`, replace `notificationsApi.getUnreadCount()` with `notificationsApi.getMy({ unread_only: true, limit: 1 })`; if the result array is non-empty, call `setLatestNotification(unread[0])` and `setUnreadCount(1)`
  - Render `<NotificationAlert>` conditionally between the sticky header card and the Quick Actions section: `{latestNotification && !notificationDismissed && ( <NotificationAlert notification={latestNotification} onDismiss={() => setNotificationDismissed(true)} onViewAll={() => router.push("/notifications")} /> )}`
  - _Requirements: 3.1, 3.4, 3.5, 3.6, 3.7_

- [x] 5. Replace heart button with "I'm Interested" button on scheme details
  - File: `Client/src/app/scheme-details.tsx`
  - In the scheme title row `<View>` (the `flexDirection: "row"` view containing the title `AppText` and `<InterestButton>`), remove the `<InterestButton>` component and the `marginRight: 12` / `flex: 1` constraints — the title `AppText` should now take full width
  - Remove the `InterestButton` import
  - In the fixed bottom action area, add an "I'm Interested" `<Button>` directly above the existing "Apply Now" `<Button>`
  - Button props: `label={isInterested ? \`✓ I'm Interested (\${interestCount})\` : \`I'm Interested (\${interestCount})\`}`, `variant={isInterested ? "primary" : "outline"}`, `onPress={toggleInterest}`, `disabled={interestLoading}`, `style={{ width: "100%", borderRadius: 16, marginBottom: 12 }}`
  - If `interestLoading` is true, show `ActivityIndicator` inside the button or use the `loading` prop if `Button` atom supports it; otherwise disable the button
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 6. Fix Forgot Password inline error handling
  - File: `Client/src/app/(auth)/phone-input.tsx`
  - In `handleForgotPassword`, replace the `Alert.alert("Error", ...)` call in the `catch` block with `setValidationError(e.message || "Failed to send OTP. Please try again.")` followed by `shake()`
  - Remove the `Alert.alert(...)` call entirely from the catch block — do not keep it alongside `setValidationError`
  - The validation guard at the top of `handleForgotPassword` (phone number invalid) should also use `setValidationError` + `shake()` instead of `Alert.alert` — replace `Alert.alert("Enter Phone Number", "Please enter your 10-digit mobile number first.")` with `setValidationError("Please enter your 10-digit mobile number first.")` and `shake()`
  - _Requirements: 5.2, 5.6, 5.9_

- [x] 7. Checkpoint — verify all changes compile and integrate correctly
  - Ensure all imports resolve (no missing modules)
  - Confirm `NotificationAlert` renders without errors when a notification is present and is absent when `latestNotification` is null
  - Confirm the home screen no longer references `bannersApi`, `BannerSlideshow`, or `SearchBar`
  - Confirm `scheme-details.tsx` no longer imports `InterestButton`
  - Ask the user if any questions arise before proceeding to manual testing

## Notes

- Tasks marked with `*` are optional — none in this plan since tests are excluded per user request
- Each task targets a single file where possible for easy incremental review
- Task 4 depends on Task 3 (NotificationAlert must exist before it can be imported)
- Task 2 and Task 4 both modify `index.tsx` — complete Task 2 first, then apply Task 4 on top