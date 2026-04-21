/**
 * Bug 2 — KeyboardAwareScrollView: Insufficient bottom margin on Android
 *
 * Bug Condition Exploration Test (Static Analysis)
 *
 * Validates: Requirements 1.2, 2.2
 *
 * EXPECTED OUTCOME (after fix): PASSES
 *
 * This test verifies that the KeyboardAwareScrollView component:
 * 1. Uses e.endCoordinates.screenY as the visible area bottom (keyboard top Y)
 * 2. Ensures at least 20 px of breathing room above the keyboard on Android
 * 3. The overlap calculation is correct: inputBottom - visibleAreaBottom
 */

import * as fs from "fs";
import * as path from "path";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "../components/atoms/KeyboardAwareScrollView.tsx"
);

function readComponent(): string {
  return fs.readFileSync(COMPONENT_PATH, "utf-8");
}

describe("Bug 2 — KeyboardAwareScrollView Android bottom margin fix", () => {
  let content: string;

  beforeAll(() => {
    content = readComponent();
  });

  /**
   * Property 1: Bug Condition — Keyboard overlaps focused input on Android
   *
   * Validates: Requirements 1.2, 2.2
   *
   * The bug was that the overlap calculation used:
   *   screenBottom - keyboardHeight  (wrong: keyboard top Y minus keyboard height)
   * instead of:
   *   e.endCoordinates.screenY  (correct: keyboard top Y = visible area bottom)
   *
   * After the fix, the component must use screenY as the visible area bottom.
   */
  test("uses e.endCoordinates.screenY as the visible area bottom (not screenY - keyboardHeight)", () => {
    // The buggy pattern: subtracting keyboardHeight from screenY/screenBottom
    const buggyPattern = /\(screenBottom\s*-\s*keyboardHeight\)/;
    const hasBuggyCalculation = buggyPattern.test(content);

    // The fixed pattern: using screenY directly as the visible area bottom
    const fixedPattern = /endCoordinates\.screenY/;
    const hasFixedCalculation = fixedPattern.test(content);

    expect(hasBuggyCalculation).toBe(false);
    expect(hasFixedCalculation).toBe(true);
  });

  test("enforces a minimum of 20 px breathing room above the keyboard on Android", () => {
    // Must define ANDROID_MIN_EXTRA_HEIGHT = 20
    const minHeightDefined = /ANDROID_MIN_EXTRA_HEIGHT\s*=\s*20/.test(content);
    expect(minHeightDefined).toBe(true);
  });

  test("applies Math.max to ensure extraScrollHeight is at least ANDROID_MIN_EXTRA_HEIGHT", () => {
    // Must use Math.max(extraScrollHeight, ANDROID_MIN_EXTRA_HEIGHT)
    const mathMaxPattern = /Math\.max\s*\(\s*extraScrollHeight\s*,\s*ANDROID_MIN_EXTRA_HEIGHT\s*\)/;
    expect(mathMaxPattern.test(content)).toBe(true);
  });

  test("Android scroll logic is guarded by Platform.OS === 'ios' early return", () => {
    // The useEffect must return early for iOS, so Android logic only runs on Android
    const iosGuard = /Platform\.OS\s*===\s*["']ios["']/;
    expect(iosGuard.test(content)).toBe(true);
  });

  test("overlap is computed as inputBottom minus visibleAreaBottom", () => {
    // The overlap must be: inputBottom - visibleAreaBottom
    const overlapPattern = /overlap\s*=\s*inputBottom\s*-\s*visibleAreaBottom/;
    expect(overlapPattern.test(content)).toBe(true);
  });
});
