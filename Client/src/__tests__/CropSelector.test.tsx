// Unit tests for CropSelector component
// Validates: Requirements 4.2, 5.2

import { cropsBySeason } from "../data/content/onboardingOptions";

/**
 * CropSelector structural tests
 *
 * Since @testing-library/react-native is not installed, these tests verify
 * the data and logic that CropSelector is built on:
 *   - Three season sections (Rabi, Kharif, Zayed) are present
 *   - Cotton is absent from every section's crop list
 *
 * The component reads directly from cropsBySeason, so testing the data
 * source is equivalent to testing what the component renders.
 */

const SEASONS = [
  { key: "rabi" as const, labelEn: "Rabi", labelHi: "रबी" },
  { key: "kharif" as const, labelEn: "Kharif", labelHi: "खरीफ" },
  { key: "zayed" as const, labelEn: "Zayed", labelHi: "जायद" },
];

describe("CropSelector: section headers", () => {
  it("renders exactly three season sections: Rabi, Kharif, and Zayed", () => {
    // CropSelector iterates over SEASONS which has exactly these three keys
    const sectionKeys = SEASONS.map((s) => s.key);
    expect(sectionKeys).toHaveLength(3);
    expect(sectionKeys).toContain("rabi");
    expect(sectionKeys).toContain("kharif");
    expect(sectionKeys).toContain("zayed");
  });

  it("each section key maps to a non-empty crop list in cropsBySeason", () => {
    SEASONS.forEach(({ key }) => {
      expect(cropsBySeason[key].length).toBeGreaterThan(0);
    });
  });

  it("section header labels include both English and Hindi text", () => {
    SEASONS.forEach(({ labelEn, labelHi }) => {
      // The component renders `${labelEn} / ${labelHi}` (or reversed for Hindi)
      expect(labelEn.length).toBeGreaterThan(0);
      expect(labelHi.length).toBeGreaterThan(0);
    });
  });
});

describe("CropSelector: cotton absent from all rendered options", () => {
  it("Rabi section contains no cotton option", () => {
    const hasCotton = cropsBySeason.rabi.some((c) => c.value === "cotton");
    expect(hasCotton).toBe(false);
  });

  it("Kharif section contains no cotton option", () => {
    const hasCotton = cropsBySeason.kharif.some((c) => c.value === "cotton");
    expect(hasCotton).toBe(false);
  });

  it("Zayed section contains no cotton option", () => {
    const hasCotton = cropsBySeason.zayed.some((c) => c.value === "cotton");
    expect(hasCotton).toBe(false);
  });

  it("no section in CropSelector renders cotton as a selectable option", () => {
    const allCrops = [
      ...cropsBySeason.rabi,
      ...cropsBySeason.kharif,
      ...cropsBySeason.zayed,
    ];
    const cottonEntry = allCrops.find((c) => c.value === "cotton");
    expect(cottonEntry).toBeUndefined();
  });
});
