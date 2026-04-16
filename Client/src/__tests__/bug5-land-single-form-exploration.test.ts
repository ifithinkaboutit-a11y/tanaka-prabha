/**
 * Bug 5 — Land details: multiple parcel entries allowed
 *
 * Bug Condition Exploration Test (Static Analysis)
 *
 * Validates: Requirements 1.5, 2.5
 *
 * EXPECTED OUTCOME (after fix): PASSES
 *
 * This test verifies that the land-details onboarding screen:
 * 1. Does NOT render an "Add another land entry" button
 * 2. Presents a single land holding form (not a multi-entry list)
 * 3. Does NOT map over landEntries to render multiple entry cards
 */

import * as fs from "fs";
import * as path from "path";

const COMPONENT_PATH = path.resolve(
  __dirname,
  "../app/(auth)/land-details.tsx"
);

function readComponent(): string {
  return fs.readFileSync(COMPONENT_PATH, "utf-8");
}

describe("Bug 5 — Land details: single land holding form (no multi-entry list)", () => {
  let content: string;

  beforeAll(() => {
    content = readComponent();
  });

  /**
   * Property 1: Bug Condition — "Add another land entry" button must NOT be present
   *
   * Validates: Requirements 1.5, 2.5
   *
   * The bug was that the form had an "Add another land entry" button allowing
   * users to add multiple separate land parcel entries.
   * After the fix, this button must be removed.
   */
  test("does NOT contain an 'Add another land entry' button", () => {
    // Check for the translation key used by the add button
    const addButtonTranslationKey = /addAnotherLand/;
    const hasAddButton = addButtonTranslationKey.test(content);
    expect(hasAddButton).toBe(false);
  });

  test("does NOT have a standalone Pressable whose sole purpose is adding a land entry", () => {
    // The buggy code had a dedicated Pressable button with onPress={() => addLandEntry(...)}
    // After fix, addLandEntry is only called inside the Toggle onChange (not a standalone add button)
    // Check that there is no Pressable with onPress directly calling addLandEntry on the same line
    const lines = content.split("\n");
    const hasStandaloneAddButton = lines.some(
      (line) => line.includes("onPress") && line.includes("addLandEntry")
    );
    expect(hasStandaloneAddButton).toBe(false);
  });

  test("does NOT render a list of multiple land entry cards via landEntries.map", () => {
    // The buggy code mapped over landEntries to render multiple entry cards
    // After fix, there should be no landEntries.map rendering multiple cards
    const mapPattern = /landEntries\.map\s*\(/;
    const hasMappedEntries = mapPattern.test(content);
    expect(hasMappedEntries).toBe(false);
  });

  test("uses a single entry reference (entry = landEntries[0]) for the form", () => {
    // After fix, the form should work with a single entry reference
    const singleEntryPattern = /landEntries\[0\]/;
    const usesSingleEntry = singleEntryPattern.test(content);
    expect(usesSingleEntry).toBe(true);
  });

  test("does NOT import or use removeLandEntry (no delete button for entries)", () => {
    // The multi-entry form had a trash/remove button per entry
    // After fix, removeLandEntry should not be used
    const removePattern = /removeLandEntry/;
    const hasRemoveEntry = removePattern.test(content);
    expect(hasRemoveEntry).toBe(false);
  });
});
