# Design Document: App Theme and UX Improvements

## Overview

This feature delivers three targeted improvements to the Tanak Prabha platform:

1. **Centralized Design Token System (Mobile)** — Introduce a `theme` object in `Client/src/styles/colors.ts` as the single source of truth for all color values, add a tinted green palette, and migrate hardcoded colors across all components.
2. **Admin Dashboard Avatar Dropdown Fix (Web)** — Diagnose and fix the `NavUser` component's `DropdownMenu` positioning and rendering issue in the Next.js admin dashboard.
3. **Test Watermark Overlay (Mobile)** — Add an env-gated, full-screen diagonal "TEST" watermark rendered above all navigation stacks in the App Shell.

The mobile app is built with React Native / Expo + NativeWind (Tailwind). The admin dashboard is Next.js with shadcn/ui components backed by Radix UI primitives.

---

## Architecture

### Mobile App (Client)

The existing style system lives in `Client/src/styles/`:

```
colors.ts       ← exports `colors` (existing) — will also export `theme` (new)
global.css      ← CSS custom properties for NativeWind
index.ts        ← re-exports all style modules
typography.ts, spacing.ts, radii.ts, shadow.ts
```

Components consume colors in two ways:
- **StyleSheet / inline styles** — import `colors` or `theme` from `@/styles/colors`
- **NativeWind classes** — use `bg-[#386641]` style arbitrary values or CSS variable references

The new `theme` object will be a superset of `colors`, adding `background`, `text`, and `border` namespaces. The existing `colors` export is preserved unchanged for backward compatibility.

### Admin Dashboard (Server)

The dashboard is a Next.js app using shadcn/ui components. The sidebar is built with a custom `Sidebar` context (`sidebar.jsx`). `NavUser` sits in `SidebarFooter` and uses Radix UI's `DropdownMenu`.

The root cause of the dropdown issue: the `SidebarFooter` and its parent `Sidebar` component likely apply `overflow: hidden` or a stacking context that clips the Radix portal. The `DropdownMenuContent` already wraps in `DropdownMenuPrimitive.Portal` (which teleports to `document.body`), so the fix is ensuring the portal is not blocked by a CSS stacking context on the sidebar wrapper, and that the `w-(--radix-dropdown-menu-trigger-width)` CSS variable syntax is valid for the Tailwind version in use.

---

## Components and Interfaces

### 1. `theme` object — `Client/src/styles/colors.ts`

```typescript
export const theme = {
  primary: {
    green: "#386641",
    greenLight: "#6A8F74",
    greenDark: "#005005",
  },
  secondary: {
    soil: "#7F5539",
    harvest: "#FBC02D",
    clay: "#F57C00",
    sky: "#4FC3F7",
  },
  background: {
    screen: "#F0F4F1",   // tinted green surface — replaces #F8FAFC / #FFFFFF
    card: "#EBF0EC",     // slightly deeper tinted card surface — replaces #F6F6F6
    input: "#FFFFFF",    // form inputs stay white for legibility
    header: "#FFFFFF",   // sticky headers stay white
  },
  text: {
    primary: "#111827",
    secondary: "#1F2937",
    muted: "#6B7280",
    light: "#9E9E9E",
    medium: "#616161",
    dark: "#212121",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
  },
  border: {
    default: "#D9D9D9",
    subtle: "#E5E7EB",
    card: "#D1D5DB",
  },
  semantic: {
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FF9800",
    info: "#0275D8",
  },
} as const;

// Backward-compatible re-export (unchanged)
export const colors = { ... };
```

The `colors` export is left structurally identical to today so zero existing imports break.

### 2. CSS Custom Properties — `Client/src/styles/global.css`

New variables added to `:root` alongside existing ones:

```css
--color-background-screen: #F0F4F1;
--color-background-card: #EBF0EC;
--color-background-input: #FFFFFF;
--color-background-header: #FFFFFF;
--color-text-primary: #111827;
--color-text-secondary: #1F2937;
--color-text-muted: #6B7280;
--color-border-default: #D9D9D9;
--color-border-subtle: #E5E7EB;
--color-border-card: #D1D5DB;
```

### 3. `WatermarkOverlay` component — `Client/src/components/atoms/WatermarkOverlay.tsx`

A new atomic component:

```typescript
interface WatermarkOverlayProps {}

export default function WatermarkOverlay(): JSX.Element
```

Renders a `View` with `position: absolute`, `top: 0`, `left: 0`, `right: 0`, `bottom: 0`, `pointerEvents: "none"`, `zIndex: 9999`. Inside it renders a grid of "TEST" `Text` nodes rotated ~35°, tiled to cover the full screen. Uses `useWindowDimensions()` to compute the tile count.

### 4. `NavUser` fix — `Server/dashboard/src/components/nav-user.jsx`

No new interface — same props. The fix involves:
- Ensuring `DropdownMenuContent` is rendered via `DropdownMenuPrimitive.Portal` (already present in the shared `dropdown-menu.jsx` wrapper — confirmed)
- Fixing the `w-(--radix-dropdown-menu-trigger-width)` class: this uses the CSS variable shorthand syntax that requires Tailwind v4. If the project is on Tailwind v3, replace with `min-w-56`
- Adding `collisionPadding={8}` to `DropdownMenuContent` to prevent viewport edge clipping
- Verifying the sidebar wrapper does not set `overflow: hidden` that would clip a non-portaled element (moot since portal is used, but worth confirming)

---

## Data Models

### Theme Token Shape

```typescript
type ThemeColors = {
  primary: { green: string; greenLight: string; greenDark: string };
  secondary: { soil: string; harvest: string; clay: string; sky: string };
  background: { screen: string; card: string; input: string; header: string };
  text: {
    primary: string; secondary: string; muted: string;
    light: string; medium: string; dark: string;
    onPrimary: string; onSecondary: string;
  };
  border: { default: string; subtle: string; card: string };
  semantic: { success: string; error: string; warning: string; info: string };
};
```

### Watermark Environment Gate

```
EXPO_PUBLIC_SHOW_TEST_WATERMARK=true   → overlay renders
EXPO_PUBLIC_SHOW_TEST_WATERMARK=false  → overlay hidden
(unset)                                → overlay hidden
```

Accessed via `process.env.EXPO_PUBLIC_SHOW_TEST_WATERMARK` in `_layout.tsx`. The `EXPO_PUBLIC_` prefix makes it available at runtime in Expo builds.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Text/background contrast ratio

*For any* (text token, background token) pair defined in the `theme` object, the WCAG 2.1 relative luminance contrast ratio between the text color and its paired background color SHALL be greater than or equal to 4.5:1.

**Validates: Requirements 3.4**

### Property 2: Watermark env-var gate

*For any* value assigned to `EXPO_PUBLIC_SHOW_TEST_WATERMARK`, the `WatermarkOverlay` SHALL be rendered by the App Shell if and only if that value is exactly the string `"true"`. For all other values (including `"false"`, `undefined`, empty string, or any arbitrary string), the overlay SHALL not be rendered.

**Validates: Requirements 5.6**

---

## Error Handling

### Theme System
- If a component references a token that does not exist on the `theme` object, TypeScript's `as const` typing will produce a compile-time error, preventing silent runtime failures.
- The `colors` export is preserved verbatim; any component that still imports `colors` will continue to compile and run without change.

### Watermark Overlay
- If `useWindowDimensions()` returns zero dimensions (edge case during initial render), the overlay renders with a safe fallback of a single centered "TEST" label. No crash.
- If the env var is missing or malformed, the condition `=== "true"` safely evaluates to `false` and the overlay is not rendered.

### NavUser Dropdown
- If `useSession()` returns `null` or `undefined`, the component falls back to `{ name: "Admin", email: "admin@tanakprabha.gov.in", avatar: "/avatars/admin.jpg" }` — already implemented in the current code.
- If `signOut` throws, the error propagates naturally; no additional wrapping is needed since Next.js handles unhandled promise rejections in client components.

---

## Testing Strategy

### Unit / Example Tests

**Theme token completeness** (`colors.test.ts`):
- Assert `theme` exports all required top-level keys: `primary`, `secondary`, `background`, `text`, `border`, `semantic`
- Assert `colors` export still has original shape (backward compatibility)
- Assert `theme.primary.green === "#386641"` and `theme.secondary.soil === "#7F5539"` (unchanged brand colors)
- Assert `theme.background.screen` is not `#FFFFFF`, `#F8FAFC`, or `#F6F6F6`

**WatermarkOverlay** (`WatermarkOverlay.test.tsx`):
- Renders with `pointerEvents="none"`
- Contains multiple "TEST" text nodes
- Rotation transform is between 30° and 45°
- Text opacity is between 0.08 and 0.15

**NavUser** (`nav-user.test.jsx`):
- With mock session: dropdown shows name, email, and all 4 menu items
- With null session: renders fallback values without throwing
- Click "Log out": calls `signOut({ callbackUrl: "/login" })`
- `isMobile=true` → `side="bottom"`, `isMobile=false` → `side="right"`

### Property-Based Tests

Uses **fast-check** (TypeScript/JavaScript PBT library) for the mobile client and **@fast-check/jest** for the dashboard.

**Property 1 — Contrast ratio** (`theme.property.test.ts`):
```
// Feature: app-theme-and-ux-improvements, Property 1: text/background contrast ratio >= 4.5:1
fc.assert(
  fc.property(
    fc.constantFrom(...textBackgroundPairs),
    ([textColor, bgColor]) => wcagContrastRatio(textColor, bgColor) >= 4.5
  ),
  { numRuns: 100 }
)
```
The `textBackgroundPairs` array is derived from the theme object at test time, so adding new token pairs automatically extends coverage.

**Property 2 — Watermark env gate** (`watermark.property.test.tsx`):
```
// Feature: app-theme-and-ux-improvements, Property 2: watermark renders iff env === "true"
fc.assert(
  fc.property(
    fc.oneof(fc.constant("true"), fc.constant("false"), fc.constant(undefined), fc.string()),
    (envValue) => {
      const rendered = renderWithEnv(envValue);
      const hasOverlay = rendered.queryByTestId("watermark-overlay") !== null;
      return hasOverlay === (envValue === "true");
    }
  ),
  { numRuns: 100 }
)
```

### Integration Tests
- Visual smoke test: run the Expo app in a simulator with `EXPO_PUBLIC_SHOW_TEST_WATERMARK=true` and confirm the watermark is visible on the home screen.
- Admin dashboard: manually verify the dropdown opens and positions correctly in both collapsed and expanded sidebar states.
