# Design Document — Home UI & Auth Flow Improvements

## Overview

This document covers the technical design for five targeted improvements to the Tanak Prabha React Native / Expo app:

1. Carousel chevron controls on `BannerSlideshow`
2. Home screen layout restructure (remove search bar + carousel, promote `QuickActionGrid`)
3. Inline notification alert on the home screen
4. "I'm Interested" button on scheme details (replaces heart/like button)
5. Forgot Password flow via OTP (phone-input → otp-input → set-password → login)

The app uses Expo Router v3, React Native, NativeWind (Tailwind-for-RN), and TypeScript. All changes are additive or surgical replacements — no new routes, no new global state stores.

---

## Architecture

All five changes are self-contained within the existing file structure. No new routes or context providers are required.

```
Client/src/
├── app/
│   ├── (tab)/index.tsx          ← Changes 2 & 3
│   ├── (auth)/phone-input.tsx   ← Change 5 (already partially implemented)
│   ├── (auth)/otp-input.tsx     ← Change 5 (already partially implemented)
│   ├── (auth)/set-password.tsx  ← Change 5 (already partially implemented)
│   └── scheme-details.tsx       ← Change 4
└── components/
    └── molecules/
        ├── Banner.tsx            ← Change 1
        └── NotificationAlert.tsx ← Change 3 (new component)
```

### Data flow summary

- **BannerSlideshow**: purely local state (`currentIndex`), no API calls.
- **Home screen**: fetches latest unread notification via `notificationsApi.getMy({ unread_only: true, limit: 1 })` on mount; dismiss is session-local state.
- **Scheme details**: `useInterest` hook already handles all interest toggle logic; the UI change is purely presentational.
- **Forgot Password**: the full flow already exists in the codebase (`handleForgotPassword` in `phone-input.tsx`, `mode=forgot-password` branch in `otp-input.tsx`, `mode=reset` branch in `set-password.tsx`). The design confirms and documents the intended behaviour.

---

## Components and Interfaces

### 1. BannerSlideshow — Chevron Controls

**File:** `Client/src/components/molecules/Banner.tsx`

Add two `Pressable` chevron buttons absolutely positioned over the left and right edges of the banner card. They call a new `goToSlide(index: number)` helper (refactored from the existing `goToIndex` updater pattern).

```
┌─────────────────────────────────────────┐
│      [banner image / gradient text]     │
│                                         │
│              ● ○ ○                      │
└─────────────────────────────────────────┘
                                    <   >    

```

Props interface — no changes to the public API:

```ts
type BannerSlideshowProps = {
  banners: Banner[];
  autoSlideInterval?: number; // default 5000 ms
};
```

Internal changes:
- Refactor `goToIndex((prev) => ...)` into `goToSlide(nextIndex: number)` so chevrons can call it directly.
- Render chevrons only when `banners.length > 1`.
- Left chevron: `(currentIndex - 1 + banners.length) % banners.length`
- Right chevron: `(currentIndex + 1) % banners.length`
- Minimum touch target: 44×44 pt (achieved via `padding: 10` on a 24 pt icon).
- Chevrons are semi-transparent white circles (`rgba(0,0,0,0.35)` background) positioned `absolute` at `top: "50%"`, `left: 10` / `right: 10`, `transform: [{ translateY: -22 }]`.

---

### 2. Home Screen Layout Restructure

**File:** `Client/src/app/(tab)/index.tsx`

Remove `SearchBar` and `BannerSlideshow` from the rendered output. Move `QuickActionGrid` (with its section heading) to be the first content block after the `GreetingHeader`.

The sticky header card (`GreetingHeader` wrapper) loses its `SearchBar` child — it becomes a pure greeting/avatar/notification-bell row.

New render order inside `<ScrollView>`:
1. Sticky header — `GreetingHeader` only (no search bar)
2. `NotificationAlert` (conditional — see Change 3)
3. Quick Actions section heading + `QuickActionGrid`
4. Popular Schemes section + `SchemePreviewList`

The `banners` state, `translatedBanners`, and `FALLBACK_BANNERS` can be removed entirely since `BannerSlideshow` is no longer rendered. The `bannersApi.getAll()` call in `fetchData` should also be removed.

---

### 3. NotificationAlert Component

**File (new):** `Client/src/components/molecules/NotificationAlert.tsx`

A dismissible inline banner that shows the latest unread notification.

```ts
interface NotificationAlertProps {
  notification: {
    id: string;
    title: string;
    description: string;
  };
  onDismiss: () => void;
  onViewAll: () => void;
}
```

Visual layout:
```
┌──────────────────────────────────────────┐
│ 🔔  [Title]                          ✕  │
│     [Body — max 2 lines, truncated]      │
│                          [View All →]    │
└──────────────────────────────────────────┘
```

- Background: `#FFFBEB` (amber-50), border: `#FDE68A` (amber-200), left accent bar: `#F59E0B` (amber-500).
- Bell icon: `Ionicons` `notifications-outline`, size 18, color `#D97706`.
- Dismiss button: `Ionicons` `close-outline`, size 18, top-right.
- Body text: `numberOfLines={2}` to enforce truncation.
- "View All" is a `TouchableOpacity` with `#386641` text.

**Home screen integration** (`index.tsx`):

```ts
// New state
const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
const [notificationDismissed, setNotificationDismissed] = useState(false);

// In fetchData — replace getUnreadCount() with:
const unread = await notificationsApi.getMy({ unread_only: true, limit: 1 });
if (unread.length > 0) {
  setLatestNotification(unread[0]);
  setUnreadCount(1); // still drives the bell badge
}
```

Render condition:
```tsx
{latestNotification && !notificationDismissed && (
  <NotificationAlert
    notification={latestNotification}
    onDismiss={() => setNotificationDismissed(true)}
    onViewAll={() => router.push("/notifications")}
  />
)}
```

Dismiss is session-only (state resets on app restart). No persistence needed per requirements.

Error handling: the `try/catch` in `fetchData` already swallows API errors — if `getMy` throws, `latestNotification` stays `null` and the alert is simply not rendered.

---

### 4. "I'm Interested" Button on Scheme Details

**File:** `Client/src/app/scheme-details.tsx`

Two changes:

**a) Reformat** the `<InterestButton>` from the scheme title row (the `flexDirection: "row"` view that contains the title `AppText` and the heart button) to a "I'm Interested" `Button` with outline and same color fill logic in the bottom action area, directly above the existing "Apply Now" button , render the button without the count of interests shown.

The `useInterest` hook and all its logic remain unchanged. The new button reuses the same `isInterested`, `interestCount`, `toggleInterest`, and `interestLoading` values.

Bottom action area — new layout:
```
┌─────────────────────────────────────────┐
│  [I'm Interested]                       │  ← outlined/filled based on state
│  [Apply Now ↗]                          │  ← existing green primary button
└─────────────────────────────────────────┘
```

"I'm Interested" button spec:
- Uses the existing `Button` atom with `variant="outline"` when not interested, `variant="primary"` (or a green-tinted outline) when interested.
- Label: `"I'm Interested"` with interest count appended: `"I'm Interested (42)"`.
- Shows `ActivityIndicator` and is `disabled` while `interestLoading` is true.
- `style={{ width: "100%", borderRadius: 16, marginBottom: 12 }}`

The `InterestButton` atom component itself is not deleted — it may be used elsewhere. It is simply not rendered on this screen.

---

### 5. Forgot Password Flow

**Files:** `phone-input.tsx`, `otp-input.tsx`, `set-password.tsx`

The full flow is already implemented in the codebase. This section documents the intended behaviour and the one gap to close.

#### Flow diagram

```
phone-input (mode=login)
  │
  ├─ [user enters valid 10-digit number]
  │
  └─ tap "Forgot Password?"
        │
        ├─ [number invalid] → inline error: "Please enter your 10-digit mobile number first"
        │
        ├─ [API: authApi.forgotPassword(+91XXXXXXXXXX)]
        │     ├─ success → navigate to otp-input (mode=forgot-password, phoneNumber)
        │     └─ error (not registered) → inline error on phone-input, stay on screen
        │
        └─ otp-input (mode=forgot-password)
              │
              └─ [OTP verified via signIn()]
                    │
                    └─ navigate to set-password (mode=reset, phoneNumber)
                          │
                          └─ [authApi.setPassword(phone, newPassword)]
                                │
                                └─ router.replace("/(auth)/") ← Login screen
                                   (NO auto-login)
```

#### Gap to close — error handling in `handleForgotPassword`

The current implementation in `phone-input.tsx` shows an `Alert` on API failure. Per requirement 5.9, the error should be shown inline (as `validationError`) and the user should stay on the login screen. The `Alert` call should be replaced with `setValidationError(...)`.

Additionally, for the "number not registered" case (requirement 5.6), the API is expected to return a specific error message. The catch block should surface that message via `setValidationError`.

#### Requirement 5.8 — login does NOT trigger OTP

Already satisfied: `handleLoginWithPassword` calls `authApi.loginWithPassword` directly. The OTP path (`handleSendOTP`) is only triggered by the "Send OTP" button (signup mode) or the "No Password Set" alert action. No changes needed.

#### Requirement 5.7 — OTP used in exactly two flows

Already satisfied by the existing routing logic:
- Signup: `phone-input (mode=signup)` → `otp-input (mode=signup)`
- Forgot password: `phone-input (mode=login)` → `otp-input (mode=forgot-password)`

No OTP is triggered during normal password login.

---

## Data Models

No new data models. Existing types used:

```ts
// From apiService.ts
interface Notification {
  id: string;
  title: string;
  description: string;  // maps from n.message
  isRead: boolean;
  // ...other fields not needed by NotificationAlert
}

// Banner type (used only internally in BannerSlideshow — no longer needed in index.tsx)
type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  url?: string;
};
```

The `NotificationAlertProps.notification` shape is a subset of the existing `Notification` type — no new interface needed beyond what's already exported.

---

## Error Handling

| Scenario | Handling |
|---|---|
| `notificationsApi.getMy` fails on home screen load | `latestNotification` stays `null`; alert not rendered; rest of screen unaffected |
| Interest toggle API fails | `useInterest` hook reverts optimistic state and shows `Alert` (existing behaviour) |
| `authApi.forgotPassword` fails (network/server error) | Set `validationError` inline on `phone-input`; stay on screen |
| `authApi.forgotPassword` fails (number not registered) | Set `validationError` with "number not found" message; stay on screen |
| OTP verification fails | Existing shake + `validationError` in `otp-input` |
| `authApi.setPassword` fails | Existing shake + `Alert` in `set-password` |
| Single banner in carousel | Chevrons hidden; dot indicators hidden (existing behaviour preserved) |

---

## Testing Strategy

Unit tests should cover:

- `BannerSlideshow`: chevron press advances/wraps index; chevrons hidden when `banners.length === 1`.
- `NotificationAlert`: renders title and truncated body; calls `onDismiss` when close pressed; calls `onViewAll` when "View All" pressed.
- Home screen: `NotificationAlert` not rendered when `latestNotification` is null; not rendered after dismiss.
- `handleForgotPassword` in `phone-input`: shows inline error when phone is empty; shows inline error when API throws; navigates to `otp-input` with correct params on success.
- `set-password` with `mode=reset`: navigates to `/(auth)/` (login) after success, not to onboarding.