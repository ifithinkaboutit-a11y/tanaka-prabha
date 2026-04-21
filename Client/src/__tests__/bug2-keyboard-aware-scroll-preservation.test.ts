/**
 * Bug 2 — KeyboardAwareScrollView: iOS keyboard handling preservation
 *
 * Preservation Property Tests (Static Analysis)
 *
 * Validates: Requirements 3.2
 *
 * EXPECTED OUTCOME: PASSES (on both unfixed and fixed code)
 *
 * This test verifies that the iOS keyboard handling path is unchanged:
 * - KeyboardAvoidingView with behavior="padding" is used on iOS
 * - The Android fix does not affect iOS behavior
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

describe("Bug 2 — KeyboardAwareScrollView iOS preservation", () => {
  let content: string;

  beforeAll(() => {
    content = readComponent();
  });

  /**
   * Property 2: Preservation — iOS KeyboardAvoidingView behavior unchanged
   *
   * Validates: Requirements 3.2
   *
   * iOS must continue to use KeyboardAvoidingView with behavior="padding".
   */
  test("iOS path uses KeyboardAvoidingView with behavior='padding'", () => {
    // Must render KeyboardAvoidingView for iOS
    const hasKAV = /KeyboardAvoidingView/.test(content);
    expect(hasKAV).toBe(true);

    // Must use behavior="padding" (the iOS-specific behavior)
    const hasPaddingBehavior = /behavior=["']padding["']/.test(content);
    expect(hasPaddingBehavior).toBe(true);
  });

  test("iOS path is conditionally rendered via Platform.OS check", () => {
    // The iOS branch must be guarded by Platform.OS === 'ios'
    const iosCheck = /Platform\.OS\s*===\s*["']ios["']/;
    expect(iosCheck.test(content)).toBe(true);
  });

  test("Android keyboard listener is skipped on iOS via early return", () => {
    // The useEffect must have an early return for iOS
    const earlyReturn = /if\s*\(\s*Platform\.OS\s*===\s*["']ios["']\s*\)\s*return/;
    expect(earlyReturn.test(content)).toBe(true);
  });

  test("component exports KeyboardAwareScrollView as both named and default export", () => {
    const hasNamedExport = /export\s+function\s+KeyboardAwareScrollView/.test(content);
    const hasDefaultExport = /export\s+default\s+KeyboardAwareScrollView/.test(content);
    expect(hasNamedExport).toBe(true);
    expect(hasDefaultExport).toBe(true);
  });

  test("extraScrollHeight prop is still accepted and defaults to ANDROID_MIN_EXTRA_HEIGHT", () => {
    // The prop interface must include extraScrollHeight
    const hasProp = /extraScrollHeight\?\s*:\s*number/.test(content);
    expect(hasProp).toBe(true);

    // Default must be ANDROID_MIN_EXTRA_HEIGHT (not a hardcoded number)
    const hasDefault = /extraScrollHeight\s*=\s*ANDROID_MIN_EXTRA_HEIGHT/.test(content);
    expect(hasDefault).toBe(true);
  });
});
