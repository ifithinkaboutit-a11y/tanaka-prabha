/**
 * Bug 6 — Livestock entries: identical visual styling
 *
 * Bug Condition Exploration Test (Static Analysis)
 *
 * Validates: Requirements 1.6, 2.6
 *
 * EXPECTED OUTCOME (after fix): PASSES
 *
 * This test verifies that the livestock-details onboarding screen
 * visually distinguishes each entry with a unique accent color or
 * numbered badge based on its index.
 *
 * Bug condition: multiple livestock entries → all rendered with identical
 * visual styling (same backgroundColor, no badge, no accent color).
 *
 * Fix: each entry has a unique accent color (borderLeftColor) and a
 * numbered badge derived from its index.
 */

import * as fs from "fs";
import * as path from "path";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "../app/(auth)/livestock-details.tsx"
);

function readComponent(): string {
  return fs.readFileSync(COMPONENT_PATH, "utf-8");
}

describe("Bug 6 — Livestock entries: visually distinct (exploration — expected to pass after fix)", () => {
  let content: string;

  beforeAll(() => {
    content = readComponent();
  });

  /**
   * Property 1: Bug Condition → Expected Behavior
   * Each entry must have a unique accent color derived from its index.
   *
   * Validates: Requirements 1.6, 2.6
   */
  test("defines an ENTRY_ACCENT_COLORS array with multiple distinct colors", () => {
    // After fix: a constant array of accent colors is defined
    const accentColorsPattern = /ENTRY_ACCENT_COLORS\s*=\s*\[/;
    expect(accentColorsPattern.test(content)).toBe(true);
  });

  test("uses index to select an accent color from ENTRY_ACCENT_COLORS", () => {
    // After fix: accent color is selected via index modulo the array length
    const indexedColorPattern = /ENTRY_ACCENT_COLORS\[index\s*%/;
    expect(indexedColorPattern.test(content)).toBe(true);
  });

  test("applies accentColor as borderLeftColor to each entry card", () => {
    // After fix: each entry card has borderLeftColor set to accentColor
    const borderLeftColorPattern = /borderLeftColor\s*:\s*accentColor/;
    expect(borderLeftColorPattern.test(content)).toBe(true);
  });

  test("renders a numbered badge with the entry index + 1", () => {
    // After fix: a badge View with backgroundColor: accentColor is rendered
    // and it displays {index + 1}
    const badgePattern = /backgroundColor\s*:\s*accentColor/;
    expect(badgePattern.test(content)).toBe(true);
  });

  test("entries are rendered via livestockEntries.map with index parameter", () => {
    // The map callback must use the index parameter to derive the accent color
    const mapWithIndexPattern = /livestockEntries\.map\s*\(\s*\(\s*entry\s*,\s*index\s*\)/;
    expect(mapWithIndexPattern.test(content)).toBe(true);
  });
});
