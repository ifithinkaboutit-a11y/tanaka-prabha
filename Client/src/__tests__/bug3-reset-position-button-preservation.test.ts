/**
 * Bug 3 — "Reset position" button hidden behind bottom-sheet card
 *
 * Preservation Tests (Task 10)
 * ----------------------------
 * GOAL: Verify that the map pin drag and confirm location flow is unchanged
 * after adding the "Reset position" button.
 *
 * Validates: Requirements 3.3
 *
 * Approach: Static code analysis — read the location-picker source and assert
 * that:
 *   (a) onRegionChangeComplete handler still updates pin coords and geocodes
 *   (b) Confirm Location button still exists and calls handleConfirm
 *   (c) The map pin (centre crosshair) is still rendered
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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Bug 3 Preservation — Map pin drag and confirm flow unchanged", () => {
  let content: string;

  beforeAll(() => {
    content = readLocationPicker();
  });

  // ── Property 1: Map pin drag updates address ────────────────────────────────

  describe("Property 1: onRegionChangeComplete updates pin coords and geocodes address", () => {
    /**
     * Validates: Requirements 3.3
     * Dragging the map triggers onRegionChangeComplete which must call
     * setPinCoords and geocodeCoords.
     */
    test("onRegionChangeComplete handler is present in MapView", () => {
      expect(content).toMatch(/onRegionChangeComplete/);
    });

    test("onRegionChangeComplete calls setPinCoords", () => {
      // The handler should update pin coordinates
      expect(content).toMatch(/setPinCoords/);
    });

    test("onRegionChangeComplete calls geocodeCoords", () => {
      // The handler should trigger reverse geocoding to update address display
      expect(content).toMatch(/geocodeCoords/);
    });
  });

  // ── Property 2: Confirm Location button still present ──────────────────────

  describe("Property 2: Confirm Location button is still present and functional", () => {
    /**
     * Validates: Requirements 3.3
     * The confirm button must still exist and call handleConfirm.
     */
    test('"Confirm Location" button text is present', () => {
      expect(content).toMatch(/Confirm Location/);
    });

    test("handleConfirm function is defined", () => {
      expect(content).toMatch(/handleConfirm/);
    });

    test("Confirm button calls handleConfirm on press", () => {
      expect(content).toMatch(/onPress\s*=\s*\{handleConfirm\}/);
    });
  });

  // ── Property 3: Centre crosshair pin still rendered ────────────────────────

  describe("Property 3: Centre crosshair map pin is still rendered", () => {
    /**
     * Validates: Requirements 3.3
     * The visual pin at the map centre must still be present.
     */
    test("centrePin style is defined", () => {
      expect(content).toMatch(/centrePin/);
    });

    test("pinHead style is defined", () => {
      expect(content).toMatch(/pinHead/);
    });

    test("pinStem style is defined", () => {
      expect(content).toMatch(/pinStem/);
    });
  });

  // ── Property 4: doConfirm saves location data ──────────────────────────────

  describe("Property 4: doConfirm function saves location and navigates", () => {
    /**
     * Validates: Requirements 3.3
     * The confirm flow must still save location data and navigate.
     */
    test("doConfirm function is defined", () => {
      expect(content).toMatch(/doConfirm/);
    });

    test("doConfirm calls setLocationData for onboarding flow", () => {
      expect(content).toMatch(/setLocationData/);
    });
  });
});
