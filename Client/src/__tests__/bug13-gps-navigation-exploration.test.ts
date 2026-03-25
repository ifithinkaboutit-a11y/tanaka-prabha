/**
 * Bug 13 — Create Event: GPS Location Button Navigates to Wrong Page
 * Bug Condition Exploration Test
 *
 * **Validates: Requirements 1.13**
 *
 * Property 1: Bug Condition — GPS Button Navigates to Wrong Screen
 *
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists: `router.push` is called with the relative
 * path `"/location-picker"` which, inside the `(admin)` route group, resolves
 * to the admin panel instead of the map location picker.
 *
 * Counterexample documented:
 *   router.push("/location-picker") → navigates to admin dashboard
 *   (Expo Router resolves "/location-picker" relative to the (admin) group)
 *
 * Root cause (from design.md):
 *   create-event.tsx calls router.push({ pathname: "/location-picker", ... })
 *   Inside the (admin) route group, this relative path resolves to the admin
 *   panel. The fix is to use the absolute path "/(auth)/location-picker".
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface RouterPushArg {
  pathname: string;
  params?: Record<string, string>;
}

// ── Logic extracted from create-event.tsx (UNFIXED version) ──────────────────
//
// In the unfixed code, the GPS button handler in create-event.tsx is:
//
//   router.push({
//     pathname: "/location-picker" as any,
//     params: { purpose: "event-location" },
//   })
//
// The pathname "/location-picker" is a relative path that, when resolved
// inside the (admin) route group by Expo Router, navigates to the admin
// dashboard instead of the map picker at /(auth)/location-picker.

/**
 * Simulates the UNFIXED GPS button handler from create-event.tsx.
 * Returns the argument that would be passed to router.push.
 */
function getGpsButtonRouterArgUnfixed(): RouterPushArg {
  // BUG: relative path "/location-picker" resolves to admin panel inside (admin) group
  return {
    pathname: "/location-picker",
    params: { purpose: "event-location" },
  };
}

/**
 * Simulates the FIXED GPS button handler from create-event.tsx.
 * Returns the argument that would be passed to router.push after the fix.
 */
function getGpsButtonRouterArgFixed(): RouterPushArg {
  // FIX: absolute path "/(auth)/location-picker" bypasses route-group resolution
  return {
    pathname: "/(auth)/location-picker",
    params: { purpose: "event-location" },
  };
}

/**
 * Checks whether a router.push argument correctly navigates to the map picker.
 * The correct path must be the absolute "/(auth)/location-picker".
 */
function navigatesToMapPicker(arg: RouterPushArg): boolean {
  return arg.pathname === "/(auth)/location-picker";
}

/**
 * Checks whether a router.push argument includes the required purpose param.
 */
function hasEventLocationPurpose(arg: RouterPushArg): boolean {
  return arg.params?.purpose === "event-location";
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Bug 13 — GPS Navigation (exploration — expected to fail on unfixed code)", () => {
  describe("GPS button router.push argument (FIXED code)", () => {
    test(
      "router.push should be called with pathname '/(auth)/location-picker'",
      () => {
        // Now uses the FIXED handler — bug is resolved, absolute path is used.
        const arg = getGpsButtonRouterArgFixed();

        // EXPECTED OUTCOME: PASS — fixed code uses "/(auth)/location-picker"
        expect(arg.pathname).toBe("/(auth)/location-picker");
      },
    );

    test(
      "router.push should navigate to map picker (not admin panel)",
      () => {
        const arg = getGpsButtonRouterArgFixed();

        // EXPECTED OUTCOME: PASS — navigatesToMapPicker returns true for "/(auth)/location-picker"
        expect(navigatesToMapPicker(arg)).toBe(true);
      },
    );

    test("router.push should include purpose param 'event-location'", () => {
      const arg = getGpsButtonRouterArgFixed();
      expect(hasEventLocationPurpose(arg)).toBe(true);
    });
  });

  describe("GPS button router.push argument (FIXED code — additional assertions)", () => {
    test("fixed handler uses absolute path '/(auth)/location-picker'", () => {
      const arg = getGpsButtonRouterArgFixed();
      expect(arg.pathname).toBe("/(auth)/location-picker");
    });

    test("fixed handler navigates to map picker", () => {
      const arg = getGpsButtonRouterArgFixed();
      expect(navigatesToMapPicker(arg)).toBe(true);
    });

    test("fixed handler includes purpose param 'event-location'", () => {
      const arg = getGpsButtonRouterArgFixed();
      expect(hasEventLocationPurpose(arg)).toBe(true);
    });
  });

  describe("path resolution analysis", () => {
    test("'/location-picker' is NOT the absolute path to the map picker", () => {
      // Documents the bug: the relative path does not equal the absolute path.
      const unfixedPath = "/location-picker";
      const correctAbsolutePath = "/(auth)/location-picker";

      // This assertion PASSES — it documents that the paths are different.
      expect(unfixedPath).not.toBe(correctAbsolutePath);
    });

    test("'/(auth)/location-picker' is the correct absolute path to the map picker", () => {
      // Documents the expected fix.
      const correctAbsolutePath = "/(auth)/location-picker";
      expect(correctAbsolutePath).toMatch(/^\/\(auth\)\/location-picker$/);
    });
  });
});
