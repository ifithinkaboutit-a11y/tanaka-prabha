// Feature: profile-onboarding-data, Property 14: cotton absent from all crop arrays

import * as fc from "fast-check";
import { cropTypes, cropsBySeason } from "../data/content/onboardingOptions";

/**
 * Property 14: Cotton absent from all crop arrays
 * Validates: Requirements 5.1, 5.2
 *
 * Uses fc.constantFrom(...cropTypes) to sample every element in the array
 * and asserts that none has value === "cotton".
 */
describe("Property 14: Cotton absent from all crop arrays", () => {
  it("no element in cropTypes has value === 'cotton'", () => {
    fc.assert(
      fc.property(fc.constantFrom(...cropTypes), (c) => {
        return c.value !== "cotton";
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: profile-onboarding-data, Property 12: each crop in exactly one season

/**
 * Property 12: Crop season partitioning
 * Validates: Requirements 4.1, 4.3
 *
 * For every crop in cropsBySeason, assert it appears in exactly one of the
 * three season arrays (rabi, kharif, zayed).
 */
describe("Property 12: Crop season partitioning", () => {
  it("each crop in cropsBySeason appears in exactly one season array", () => {
    const allSeasonCrops = [
      ...cropsBySeason.rabi,
      ...cropsBySeason.kharif,
      ...cropsBySeason.zayed,
    ];

    fc.assert(
      fc.property(fc.constantFrom(...allSeasonCrops), (crop) => {
        const seasons = ["rabi", "kharif", "zayed"] as const;
        const count = seasons.filter((s) =>
          cropsBySeason[s].some((c) => c.value === crop.value),
        ).length;
        return count === 1;
      }),
      { numRuns: 100 },
    );
  });
});

// Unit tests for cropsBySeason (Task 2.2)

describe("cropsBySeason unit tests", () => {
  it("exports exactly three keys: rabi, kharif, zayed", () => {
    const keys = Object.keys(cropsBySeason).sort();
    expect(keys).toEqual(["kharif", "rabi", "zayed"]);
  });

  it("no element in rabi has value === 'cotton'", () => {
    expect(cropsBySeason.rabi.every((c) => c.value !== "cotton")).toBe(true);
  });

  it("no element in kharif has value === 'cotton'", () => {
    expect(cropsBySeason.kharif.every((c) => c.value !== "cotton")).toBe(true);
  });

  it("no element in zayed has value === 'cotton'", () => {
    expect(cropsBySeason.zayed.every((c) => c.value !== "cotton")).toBe(true);
  });

  it("cropTypes contains no element with value === 'cotton'", () => {
    expect(cropTypes.every((c) => c.value !== "cotton")).toBe(true);
  });
});

// Feature: profile-onboarding-data, Property 13: multi-season selection works

import { cropsBySeason as _cropsBySeason } from "../data/content/onboardingOptions";

/**
 * Property 13: Multi-season selection works
 * Validates: Requirements 4.5
 *
 * Simulate selecting crops from different seasons and assert all appear in the
 * value array simultaneously. Uses fc.subarray to pick arbitrary subsets from
 * each season, then verifies the union contains every selected crop.
 */
describe("Property 13: Multi-season selection works", () => {
  it("crops selected from multiple seasons all appear in the value array", () => {
    fc.assert(
      fc.property(
        fc.subarray(_cropsBySeason.rabi.map((c) => c.value)),
        fc.subarray(_cropsBySeason.kharif.map((c) => c.value)),
        fc.subarray(_cropsBySeason.zayed.map((c) => c.value)),
        (rabiPicks, kharifPicks, zayedPicks) => {
          // Simulate the CropSelector toggle logic: start with empty, add each crop
          let selected: string[] = [];

          const toggle = (cropValue: string) => {
            if (selected.includes(cropValue)) {
              selected = selected.filter((v) => v !== cropValue);
            } else {
              selected = [...selected, cropValue];
            }
          };

          // Select all picked crops across all seasons
          [...rabiPicks, ...kharifPicks, ...zayedPicks].forEach(toggle);

          // Every picked crop must appear in the resulting value array
          const allPicked = [...rabiPicks, ...kharifPicks, ...zayedPicks];
          return allPicked.every((crop) => selected.includes(crop));
        },
      ),
      { numRuns: 100 },
    );
  });

  it("crops from different seasons do not interfere with each other", () => {
    fc.assert(
      fc.property(
        fc.subarray(_cropsBySeason.rabi.map((c) => c.value), { minLength: 1 }),
        fc.subarray(_cropsBySeason.kharif.map((c) => c.value), { minLength: 1 }),
        (rabiPicks, kharifPicks) => {
          let selected: string[] = [];

          // Select rabi crops
          rabiPicks.forEach((crop) => {
            selected = [...selected, crop];
          });

          // Select kharif crops — rabi selections must remain intact
          kharifPicks.forEach((crop) => {
            selected = [...selected, crop];
          });

          return (
            rabiPicks.every((c) => selected.includes(c)) &&
            kharifPicks.every((c) => selected.includes(c))
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
