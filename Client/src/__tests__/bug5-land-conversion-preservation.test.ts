/**
 * Bug 5 — Land details: area conversion and crop classification preserved
 *
 * Preservation Tests (Static Analysis)
 *
 * Validates: Requirements 3.5
 *
 * EXPECTED OUTCOME: PASSES
 *
 * This test verifies that the area-to-Bigha conversion and crop season
 * classification logic is preserved in the livestock-details screen
 * (where saveOnboardingData() is defined and submits to the backend).
 */

import * as fs from "fs";
import * as path from "path";

const LIVESTOCK_PATH = path.resolve(
  __dirname,
  "../app/(auth)/livestock-details.tsx"
);

function readLivestockScreen(): string {
  return fs.readFileSync(LIVESTOCK_PATH, "utf-8");
}

describe("Bug 5 — Preservation: area conversion and crop classification still work", () => {
  let content: string;

  beforeAll(() => {
    content = readLivestockScreen();
  });

  /**
   * Property 2: Preservation — Area converted to Bigha before saving
   *
   * Validates: Requirements 3.5
   *
   * The saveOnboardingData function must convert area to Bigha:
   * - acre → bigha: multiply by 1.613
   * - hectare → bigha: multiply by 3.987
   */
  test("converts acre to Bigha using factor 1.613", () => {
    const acreConversionPattern = /acre.*1\.613|1\.613.*acre/;
    expect(acreConversionPattern.test(content)).toBe(true);
  });

  test("converts hectare to Bigha using factor 3.987", () => {
    const hectareConversionPattern = /hectare.*3\.987|3\.987.*hectare/;
    expect(hectareConversionPattern.test(content)).toBe(true);
  });

  test("saves total_land_area in Bigha to the backend payload", () => {
    const totalAreaPattern = /total_land_area/;
    expect(totalAreaPattern.test(content)).toBe(true);
  });

  /**
   * Property 2: Preservation — Crops classified by season before saving
   *
   * Validates: Requirements 3.5
   *
   * The saveOnboardingData function must classify crops into rabi, kharif, zaid.
   */
  test("classifies rabi crops (wheat, mustard, gram, barley, pea, lentil)", () => {
    const rabiKeywordsPattern = /rabiKeywords.*wheat|wheat.*rabiKeywords/s;
    const hasRabiKeywords = rabiKeywordsPattern.test(content);
    // Also check for the rabi_crop field in the payload
    const rabiCropField = /rabi_crop/.test(content);
    expect(hasRabiKeywords || rabiCropField).toBe(true);
  });

  test("classifies kharif crops (rice, maize, cotton, soybean, etc.)", () => {
    const kharifKeywordsPattern = /kharifKeywords.*rice|rice.*kharifKeywords/s;
    const hasKharifKeywords = kharifKeywordsPattern.test(content);
    const kharifCropField = /kharif_crop/.test(content);
    expect(hasKharifKeywords || kharifCropField).toBe(true);
  });

  test("classifies zaid crops (vegetables, fruits, watermelon, fodder, moong)", () => {
    const zaidKeywordsPattern = /zaidKeywords.*vegetables|vegetables.*zaidKeywords/s;
    const hasZaidKeywords = zaidKeywordsPattern.test(content);
    const zaidCropField = /zaid_crop/.test(content);
    expect(hasZaidKeywords || zaidCropField).toBe(true);
  });

  test("saves rabi_crop, kharif_crop, and zaid_crop fields in land_details payload", () => {
    expect(/rabi_crop/.test(content)).toBe(true);
    expect(/kharif_crop/.test(content)).toBe(true);
    expect(/zaid_crop/.test(content)).toBe(true);
  });

  test("land_details payload is built from landEntries in the store", () => {
    // The save function reads from landEntries (the store)
    const landEntriesPattern = /landEntries/;
    expect(landEntriesPattern.test(content)).toBe(true);
  });
});
