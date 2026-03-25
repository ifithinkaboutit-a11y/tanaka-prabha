/**
 * Bug 7 — Livestock Translation: Missing i18n Keys
 * Bug Condition Exploration Test
 *
 * **Validates: Requirements 1.7**
 *
 * Property 1: Bug Condition — Pig and Poultry Translation Keys Missing
 *
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists: `livestockDetails.pig` and
 * `livestockDetails.poultry` are absent from en.json, so the translation
 * function returns the raw key string instead of the human-readable label.
 *
 * Counterexamples documented:
 *   T.translate("livestockDetails.pig")     → "livestockDetails.pig"  (bug)
 *   T.translate("livestockDetails.poultry") → "livestockDetails.poultry" (bug)
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

describe("Bug 7 — Livestock Translation Keys (exploration — expected to fail on unfixed code)", () => {
  test('T.translate("livestockDetails.pig") should return "Pig", not the raw key', () => {
    // On unfixed code: en.json has no "pig" key under "livestockDetails"
    // so translate() returns "livestockDetails.pig" — this assertion FAILS
    const result = translate("livestockDetails.pig");
    expect(result).toBe("Pig");
  });

  test('T.translate("livestockDetails.poultry") should return "Poultry", not the raw key', () => {
    // On unfixed code: en.json has no "poultry" key under "livestockDetails"
    // so translate() returns "livestockDetails.poultry" — this assertion FAILS
    const result = translate("livestockDetails.poultry");
    expect(result).toBe("Poultry");
  });
});
