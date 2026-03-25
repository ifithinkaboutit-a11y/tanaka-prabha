/**
 * Bug 7 — Livestock Translation: Missing i18n Keys
 * Preservation Property Tests
 *
 * **Validates: Requirements 3.5, 3.6**
 *
 * Property 2: Preservation — Existing Livestock i18n Keys Unchanged
 *
 * These tests MUST PASS on unfixed code. They confirm the baseline
 * translations that must be preserved after adding the missing pig/poultry keys.
 *
 * Observed on unfixed code:
 *   T.translate("livestockDetails.cow")     → "Cow"
 *   T.translate("livestockDetails.buffalo") → "Buffalo"
 *   T.translate("livestockDetails.sheep")   → "Sheep"
 *   T.translate("livestockDetails.goat")    → "Goat"
 *   T.translate("livestockDetails.hen")     → "Hen / Poultry"
 *   T.translate("livestockDetails.others")  → "Others"
 */

import en from "../i18n/en.json";

/**
 * Mirrors the translate logic in languageStore.ts / i18n/index.ts:
 * split key on ".", traverse the JSON object, return the string value
 * or fall back to the raw key if not found.
 */
function translate(key: string, locale: Record<string, any> = en): string {
  const keys = key.split(".");
  let value: any = locale;
  for (const k of keys) {
    value = value?.[k];
  }
  return typeof value === "string" ? value : key;
}

describe("Bug 7 — Livestock Translation Keys (preservation — must pass on unfixed code)", () => {
  const existingKeys: Array<{ key: string; expected: string }> = [
    { key: "livestockDetails.cow", expected: "Cow" },
    { key: "livestockDetails.buffalo", expected: "Buffalo" },
    { key: "livestockDetails.sheep", expected: "Sheep" },
    { key: "livestockDetails.goat", expected: "Goat" },
    { key: "livestockDetails.hen", expected: "Hen / Poultry" },
    { key: "livestockDetails.others", expected: "Others" },
  ];

  test.each(existingKeys)(
    'T.translate("$key") should return "$expected"',
    ({ key, expected }) => {
      const result = translate(key);
      expect(result).toBe(expected);
    }
  );
});
