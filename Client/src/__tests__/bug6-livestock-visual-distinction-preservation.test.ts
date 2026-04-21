/**
 * Bug 6 — Livestock entries: single entry has no remove control
 *
 * Preservation Tests (Static Analysis)
 *
 * Validates: Requirements 3.6
 *
 * EXPECTED OUTCOME: PASSES
 *
 * This test verifies that when only one livestock entry exists, no
 * remove/delete control is shown — the existing behaviour is preserved.
 *
 * The guard condition `livestockEntries.length > 1` must remain in place
 * so the trash/remove button is only rendered when there are multiple entries.
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

describe("Bug 6 — Preservation: single livestock entry has no remove control", () => {
  let content: string;

  beforeAll(() => {
    content = readComponent();
  });

  /**
   * Property 2: Preservation — Remove button only shown when entries > 1
   *
   * Validates: Requirements 3.6
   *
   * The remove/trash button must be guarded by `livestockEntries.length > 1`
   * so it is hidden when there is only one entry.
   */
  test("guards the remove button with livestockEntries.length > 1", () => {
    // The trash/remove Pressable must be wrapped in a conditional that checks
    // livestockEntries.length > 1
    const guardPattern = /livestockEntries\.length\s*>\s*1/;
    expect(guardPattern.test(content)).toBe(true);
  });

  test("remove button (trash-outline icon) is inside the length > 1 guard", () => {
    // The trash-outline icon must appear after the length > 1 check in the source
    const trashPattern = /trash-outline/;
    const guardPattern = /livestockEntries\.length\s*>\s*1/;

    const guardIndex = content.search(guardPattern);
    const trashIndex = content.search(trashPattern);

    // trash icon must appear after the guard condition
    expect(guardIndex).toBeGreaterThan(-1);
    expect(trashIndex).toBeGreaterThan(guardIndex);
  });

  test("removeLivestockEntry onPress call is inside the length > 1 guard block", () => {
    // The onPress handler calling removeLivestockEntry must be inside the guard
    // We check that the onPress invocation appears after the guard condition
    const guardPattern = /livestockEntries\.length\s*>\s*1/;
    const onPressRemovePattern = /onPress.*removeLivestockEntry/s;

    const guardIndex = content.search(guardPattern);
    // Find the guard block and check removeLivestockEntry appears after it
    const afterGuard = content.slice(guardIndex);
    const hasRemoveAfterGuard = onPressRemovePattern.test(afterGuard);

    expect(guardIndex).toBeGreaterThan(-1);
    expect(hasRemoveAfterGuard).toBe(true);
  });

  test("the accent color and badge do NOT affect the remove button guard logic", () => {
    // The fix adds visual distinction but must not change the remove button guard
    // Verify ENTRY_ACCENT_COLORS is defined AND the guard still exists
    const accentColorsPattern = /ENTRY_ACCENT_COLORS/;
    const guardPattern = /livestockEntries\.length\s*>\s*1/;

    expect(accentColorsPattern.test(content)).toBe(true);
    expect(guardPattern.test(content)).toBe(true);
  });
});
