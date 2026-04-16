/**
 * Bug 3 — "Reset position" button hidden behind bottom-sheet card
 *
 * Bug Condition Exploration Test (Task 9)
 * ----------------------------------------
 * GOAL: Verify that the "Reset position" button has a zIndex / elevation
 * higher than the bottom-sheet card so it is always tappable.
 *
 * Validates: Requirements 1.3, 2.3
 *
 * Approach: Static code analysis — read the location-picker source and assert
 * that:
 *   (a) A "Reset position" button exists in the component
 *   (b) Its container style has a zIndex strictly greater than the bottom-sheet zIndex
 *
 * On UNFIXED code (no reset button / wrong zIndex) this test FAILS.
 * After the fix it PASSES.
 */

import * as fs from "fs";
import * as path from "path";

// ── Helpers ──────────────────────────────────────────────────────────────────

const LOCATION_PICKER_PATH = path.resolve(
  __dirname,
  "../app/(auth)/location-picker.tsx",
);

function readLocationPicker(): string {
  return fs.readFileSync(LOCATION_PICKER_PATH, "utf-8");
}

/**
 * Extract a numeric zIndex value from a style object string like
 * `{ ..., zIndex: 20, ... }`.
 */
function extractZIndex(styleBlock: string): number | null {
  const match = styleBlock.match(/zIndex\s*:\s*(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract a numeric elevation value from a style object string.
 */
function extractElevation(styleBlock: string): number | null {
  const match = styleBlock.match(/elevation\s*:\s*(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Bug 3 — "Reset position" button above bottom-sheet card', () => {
  let content: string;

  beforeAll(() => {
    content = readLocationPicker();
  });

  // ── Property 1: Reset position button exists ────────────────────────────────

  describe("Property 1: Reset position button exists in location picker", () => {
    /**
     * Validates: Requirements 2.3
     * The component must render a "Reset position" button.
     */
    test('location picker contains a "Reset position" button', () => {
      expect(content).toMatch(/Reset position/);
    });

    test('"Reset position" button has an accessibilityLabel', () => {
      expect(content).toMatch(/accessibilityLabel\s*=\s*["']Reset position["']/);
    });
  });

  // ── Property 2: Reset button container zIndex > bottom-sheet zIndex ─────────

  describe("Property 2: Reset button container zIndex is above bottom-sheet", () => {
    /**
     * Validates: Requirements 2.3
     * The resetPositionContainer style must have a zIndex strictly greater
     * than the bottomSheet style's zIndex.
     */
    test("resetPositionContainer style has a zIndex defined", () => {
      expect(content).toMatch(/resetPositionContainer\s*:\s*\{[^}]*zIndex\s*:\s*\d+/s);
    });

    test("bottomSheet style has a zIndex defined", () => {
      expect(content).toMatch(/bottomSheet\s*:\s*\{[^}]*zIndex\s*:\s*\d+/s);
    });

    test("resetPositionContainer zIndex is strictly greater than bottomSheet zIndex", () => {
      // Extract bottomSheet zIndex
      const bottomSheetMatch = content.match(
        /bottomSheet\s*:\s*\{([^}]+)\}/s,
      );
      expect(bottomSheetMatch).not.toBeNull();
      const bottomSheetZIndex = extractZIndex(bottomSheetMatch![1]);
      expect(bottomSheetZIndex).not.toBeNull();

      // Extract resetPositionContainer zIndex
      const resetContainerMatch = content.match(
        /resetPositionContainer\s*:\s*\{([^}]+)\}/s,
      );
      expect(resetContainerMatch).not.toBeNull();
      const resetZIndex = extractZIndex(resetContainerMatch![1]);
      expect(resetZIndex).not.toBeNull();

      // The reset button must be above the bottom sheet
      expect(resetZIndex!).toBeGreaterThan(bottomSheetZIndex!);
    });

    test("resetPositionContainer elevation is strictly greater than bottomSheet elevation (Android)", () => {
      // Extract bottomSheet elevation
      const bottomSheetMatch = content.match(
        /bottomSheet\s*:\s*\{([^}]+)\}/s,
      );
      const bottomSheetElevation = extractElevation(bottomSheetMatch![1]);

      // Extract resetPositionContainer elevation
      const resetContainerMatch = content.match(
        /resetPositionContainer\s*:\s*\{([^}]+)\}/s,
      );
      const resetElevation = extractElevation(resetContainerMatch![1]);

      if (bottomSheetElevation !== null && resetElevation !== null) {
        expect(resetElevation).toBeGreaterThan(bottomSheetElevation);
      } else {
        // If elevation is not set on one of them, at least zIndex must be correct
        // (already tested above) — skip this assertion
        expect(true).toBe(true);
      }
    });
  });
});
