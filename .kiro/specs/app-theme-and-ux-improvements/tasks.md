# Implementation Plan: App Theme and UX Improvements

## Overview

Implement three targeted improvements: (1) centralize the mobile app's design token system and apply a tinted green palette, (2) fix the admin dashboard `NavUser` dropdown popup, and (3) add an env-gated test watermark overlay to the mobile app.

## Tasks

- [x] 1. Extend `colors.ts` with the `theme` export and new CSS custom properties
  - Add the `theme` object to `Client/src/styles/colors.ts` with `primary`, `secondary`, `background`, `text`, `border`, and `semantic` namespaces as defined in the design
  - Preserve the existing `colors` export unchanged so all current imports continue to compile
  - Add the new `--color-background-*`, `--color-text-*`, and `--color-border-*` CSS custom properties to the `:root` block in `Client/src/styles/global.css`
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 1.1 Write unit tests for theme token completeness
    - Assert `theme` exports all required top-level keys: `primary`, `secondary`, `background`, `text`, `border`, `semantic`
    - Assert `colors` export still has its original shape (backward compatibility)
    - Assert `theme.primary.green === "#386641"` and `theme.secondary.soil === "#7F5539"` (brand colors unchanged)
    - Assert `theme.background.screen` is not `#FFFFFF`, `#F8FAFC`, or `#F6F6F6`
    - _Requirements: 1.1, 1.4, 3.5_

  - [x] 1.2 Write property test for text/background contrast ratio
    - **Property 1: Text/background contrast ratio**
    - For every (text token, background token) pair in `theme`, the WCAG 2.1 contrast ratio SHALL be ≥ 4.5:1
    - Use `fast-check` with `fc.constantFrom(...textBackgroundPairs)` derived from the `theme` object at test time
    - **Validates: Requirements 3.4**

- [x] 2. Migrate hardcoded colors in the App Shell and tab navigator
  - Update `Client/src/app/_layout.tsx` to set the root background using `theme.background.screen` instead of any hardcoded value
  - Update `Client/src/app/(tab)/_layout.tsx` to replace the hardcoded `ACTIVE_COLOR = "#386641"` and `INACTIVE_COLOR = "#9E9E9E"` constants with `theme.primary.green` and `theme.text.light` respectively, and replace the hardcoded `borderTopColor: "#E0E0E0"` with `theme.border.subtle`
  - _Requirements: 2.1, 2.2, 3.3_

- [x] 3. Migrate hardcoded colors in atom components
  - Audit and update all files under `Client/src/components/atoms/` that contain hardcoded hex color strings
  - Replace each hardcoded value with the equivalent `theme` token (import `theme` from `@/styles/colors`)
  - If a color has no existing token, extend `theme` with a new named token first (Requirement 2.4)
  - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [x] 4. Migrate hardcoded colors in molecule and organism components
  - Audit and update all files under `Client/src/components/molecules/` and `Client/src/components/organisms/` that contain hardcoded hex color strings
  - Apply the same token-replacement pattern as Task 3
  - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [x] 5. Migrate hardcoded colors in screen files
  - Audit and update all screen files under `Client/src/app/` (auth, tab, admin routes, and top-level screens) that contain hardcoded hex color strings
  - Apply the tinted background tokens (`theme.background.screen`, `theme.background.card`) to screen-level `View` containers and `SafeAreaView` wrappers
  - _Requirements: 2.1, 3.1, 3.2, 3.3_

- [ ] 7. Fix the `NavUser` dropdown popup in the admin dashboard
  - Open `Server/dashboard/src/components/nav-user.jsx`
  - Replace the `w-(--radix-dropdown-menu-trigger-width)` Tailwind v4 class on `DropdownMenuContent` with `min-w-56` for Tailwind v3 compatibility
  - Add `collisionPadding={8}` to `DropdownMenuContent` to prevent viewport-edge clipping
  - Verify the `DropdownMenuContent` in `Server/dashboard/src/components/ui/dropdown-menu.jsx` is already wrapped in `DropdownMenuPrimitive.Portal`; if not, add the portal wrapper
  - Inspect the sidebar wrapper component for any `overflow: hidden` rule that could clip a non-portaled element and remove or scope it if found
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ] 7.1 Write unit tests for `NavUser`
    - With a mock session: assert the dropdown label shows the user's name and email, and all four menu items (Profile, Settings, Notifications, Log out) are present
    - With `session = null`: assert fallback values render without throwing
    - Simulate clicking "Log out": assert `signOut` is called with `{ callbackUrl: "/login" }`
    - Assert `isMobile=true` produces `side="bottom"` and `isMobile=false` produces `side="right"` on `DropdownMenuContent`
    - _Requirements: 4.3, 4.4, 4.5_

- [ ] 8. Final checkpoint — ensure all tests pass
  - Run the full test suite for both `Client` and `Server/dashboard`
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Sub-tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use `fast-check` / `@fast-check/jest`; install if not already present
- The `colors` export in `colors.ts` must remain structurally identical throughout — do not rename or remove any existing keys
- The `EXPO_PUBLIC_` prefix on the watermark env var is required for Expo to expose it at runtime
