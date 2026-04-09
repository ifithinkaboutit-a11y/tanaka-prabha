# Requirements Document

## Introduction

This feature covers three targeted improvements across the Tanak Prabha platform:

1. **Centralized Theme / Design System (Mobile App)** — Replace all hardcoded color values scattered across the React Native / Expo client with a single source-of-truth theme file. The app currently uses `colors.ts` and CSS variables in `global.css`, but many screens and components bypass these and inline hex values directly. The client also wants the overall palette to feel more tinted (less stark white) to better reflect the agricultural brand identity.

2. **Admin Dashboard Avatar Hover Popup Fix (Web App)** — The `NavUser` component in the Next.js admin dashboard renders a `DropdownMenu` triggered by the sidebar avatar button. The dropdown content (popup) is not rendering or positioning correctly on hover/click, while the full-page profile area works fine. This needs to be diagnosed and fixed.

3. **Test Watermark Overlay (Mobile App)** — An absolute-positioned, full-screen overlay that renders the word "TEST" diagonally across every screen of the client mobile app, making it immediately clear to testers and clients that the build is not production-ready.

---

## Glossary

- **Theme_System**: The centralized design token layer in the mobile app (`Client/src/styles/colors.ts` + `global.css`) that defines all color, typography, spacing, and radius values.
- **Design_Token**: A named, reusable value (e.g. `primary.green`, `neutral.surface`) that represents a visual decision and is consumed by components.
- **Hardcoded_Color**: A raw hex, RGB, or named color string written directly inside a component file rather than referencing a Design_Token.
- **NavUser**: The React component (`Server/dashboard/src/components/nav-user.jsx`) that renders the admin avatar button and its dropdown popup in the sidebar.
- **Dropdown_Popup**: The `DropdownMenuContent` rendered by Radix UI's `DropdownMenu` when the `NavUser` avatar button is activated.
- **Watermark_Overlay**: A full-screen, pointer-events-none `View` rendered above all app content that displays the text "TEST" diagonally.
- **App_Shell**: The root layout component (`Client/src/app/_layout.tsx`) that wraps all screens in the mobile app.
- **Tinted_Surface**: A background color that carries a subtle hue derived from the primary brand color rather than pure white (`#FFFFFF`) or near-white (`#F8FAFC`).

---

## Requirements

### Requirement 1: Centralized Design Token File

**User Story:** As a developer, I want all color values to be defined in a single theme file, so that changing one variable updates the entire mobile app's appearance without hunting through individual component files.

#### Acceptance Criteria

1. THE Theme_System SHALL export a single `theme` object that contains all color, background, surface, border, text, and semantic tokens used across the mobile app.
2. WHEN a Design_Token value is changed in the theme file, THE Theme_System SHALL propagate that change to every component that references the token without requiring edits to individual component files.
3. THE Theme_System SHALL define a `tintedSurface` background token with a value that carries a visible green tint derived from the primary brand color (`#386641`), replacing pure-white and near-white (`#FFFFFF`, `#F8FAFC`, `#F6F6F6`) screen backgrounds.
4. THE Theme_System SHALL remain backward-compatible with the existing `colors` export so that components already importing from `@/styles/colors` continue to compile without modification.
5. WHERE the app uses NativeWind Tailwind classes with hardcoded hex values (e.g. `bg-[#386641]`), THE Theme_System SHALL provide equivalent named CSS custom properties in `global.css` so those classes can be replaced with semantic utility names.

---

### Requirement 2: Migrate Hardcoded Colors to Design Tokens (Mobile App)

**User Story:** As a developer, I want all component files to reference Design_Tokens instead of raw hex values, so that the visual theme can be updated from one place.

#### Acceptance Criteria

1. WHEN a component file contains a Hardcoded_Color, THE component SHALL be updated to reference the equivalent Design_Token from the Theme_System.
2. THE App_Shell (`_layout.tsx`) SHALL set the root background color using a Design_Token rather than a hardcoded value.
3. THE Theme_System SHALL cover at minimum: primary action color, secondary action color, screen background, card/surface background, border color, primary text, secondary text, muted text, success, error, warning, and info semantic colors.
4. IF a component requires a color that has no existing Design_Token, THEN THE Theme_System SHALL be extended with a new named token before the component is updated.
5. THE migrated components SHALL produce visually identical output to the pre-migration state for all tokens that are not intentionally changed as part of the tinting update.

---

### Requirement 3: Tinted App Palette

**User Story:** As a client, I want the mobile app to feel more tinted and on-brand rather than stark white, so that the visual identity reflects the agricultural theme.

#### Acceptance Criteria

1. THE Theme_System SHALL define a `background.screen` token with a light green-tinted value (e.g. `#F0F4F1` or equivalent) to replace pure-white and near-white screen backgrounds.
2. THE Theme_System SHALL define a `background.card` token with a slightly warmer or tinted surface value to replace `#F6F6F6` and `#FFFFFF` card backgrounds.
3. WHEN the `background.screen` token is applied, THE App_Shell and all tab screens SHALL render with the tinted background instead of white.
4. THE tinted palette SHALL maintain a minimum contrast ratio of 4.5:1 between body text tokens and their respective background tokens to preserve readability.
5. THE tinted palette SHALL not alter the primary action color (`#386641`), secondary action color (`#7F5539`), or any semantic colors (success, error, warning, info).

---

### Requirement 4: Admin Dashboard Avatar Dropdown Popup Fix

**User Story:** As an admin, I want the avatar dropdown popup in the sidebar to open and display correctly, so that I can access profile, settings, and logout actions without navigating away.

#### Acceptance Criteria

1. WHEN the admin clicks or hovers the avatar button in the sidebar, THE NavUser SHALL render the Dropdown_Popup with all menu items visible and correctly positioned.
2. THE Dropdown_Popup SHALL appear to the right of the sidebar on desktop viewports and below the trigger on mobile viewports, matching the `side` prop logic already present in `nav-user.jsx`.
3. WHEN the Dropdown_Popup is open, THE NavUser SHALL display the admin's name, email, avatar, and the menu items: Profile, Settings, Notifications, and Log out.
4. IF the admin session is unavailable, THEN THE NavUser SHALL fall back to displaying "Admin" and "admin@tanakprabha.gov.in" as placeholder values without throwing a runtime error.
5. WHEN the admin clicks "Log out" in the Dropdown_Popup, THE NavUser SHALL call `signOut` with `callbackUrl: "/login"` and redirect the admin to the login page.
6. THE Dropdown_Popup SHALL not overlap or be clipped by the sidebar container, and SHALL have a z-index sufficient to render above all other dashboard content.

---

### Requirement 5: Test Watermark Overlay (Mobile App)

**User Story:** As a QA tester or client reviewer, I want a visible "TEST" watermark displayed diagonally across every screen of the mobile app, so that it is immediately clear this build is not intended for production use.

#### Acceptance Criteria

1. THE Watermark_Overlay SHALL be rendered as an absolute-positioned `View` that covers the full screen dimensions (width and height of the device) on every screen of the mobile app.
2. THE Watermark_Overlay SHALL display the text "TEST" rotated at a diagonal angle (between 30° and 45°) across the center of the screen.
3. THE Watermark_Overlay SHALL use a `pointerEvents="none"` prop so that all underlying interactive elements remain fully functional.
4. THE Watermark_Overlay SHALL use a semi-transparent color (opacity between 0.08 and 0.15) so that underlying content remains readable.
5. THE App_Shell SHALL render the Watermark_Overlay as the topmost child in the component tree so that it appears above all navigation stacks and modals.
6. WHEN the `EXPO_PUBLIC_SHOW_TEST_WATERMARK` environment variable is set to `"true"`, THE App_Shell SHALL render the Watermark_Overlay; otherwise THE App_Shell SHALL not render it, allowing the overlay to be disabled for production builds without a code change.
7. THE Watermark_Overlay SHALL repeat the "TEST" text in a tiled or multi-instance pattern so that the watermark is visible regardless of scroll position or screen size.
