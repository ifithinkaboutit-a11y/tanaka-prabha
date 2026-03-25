import * as fc from "fast-check";
import { getHierarchyForDistrict, bhadohiHierarchy } from "../data/addressHierarchy";
import type { Village, GramPanchayat, NyayPanchayat, Tehsil } from "../data/addressHierarchy";

// ─── Task 9.1: Unit tests for Bhadohi hierarchy ───────────────────────────────

describe("getHierarchyForDistrict unit tests", () => {
  it('returns a non-empty array for "bhadohi"', () => {
    const result = getHierarchyForDistrict("bhadohi");
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect((result as Tehsil[]).length).toBeGreaterThan(0);
  });

  it('returns the same array for alias "bhadui"', () => {
    const bhadohi = getHierarchyForDistrict("bhadohi");
    const bhadui = getHierarchyForDistrict("bhadui");
    expect(bhadui).toBe(bhadohi);
  });

  it('returns null for "lucknow"', () => {
    expect(getHierarchyForDistrict("lucknow")).toBeNull();
  });
});

// ─── Task 9.2: Property 11 — Hindi labels contain Devanagari ─────────────────

// Feature: profile-onboarding-data, Property 11: Hindi labels contain Devanagari

/**
 * Property 11: Hindi labels contain Devanagari
 * Validates: Requirements 3.10
 *
 * For every place name node in bhadohiHierarchy, the `hi` field must contain
 * at least one Devanagari character (Unicode range U+0900–U+097F).
 */
describe("Property 11: Hindi labels contain Devanagari", () => {
  const DEVANAGARI = /[\u0900-\u097F]/;

  // Collect all place name nodes from the hierarchy into a flat array
  const allNodes: Array<{ en: string; hi: string }> = [];

  for (const tehsil of bhadohiHierarchy) {
    allNodes.push({ en: tehsil.en, hi: tehsil.hi });
    for (const np of tehsil.nyayPanchayats) {
      allNodes.push({ en: np.en, hi: np.hi });
      for (const gp of np.gramPanchayats) {
        allNodes.push({ en: gp.en, hi: gp.hi });
        for (const village of gp.villages) {
          allNodes.push({ en: village.en, hi: village.hi });
        }
      }
    }
  }

  it("every place name node has a hi field containing Devanagari", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allNodes), (node) => {
        return DEVANAGARI.test(node.hi);
      }),
      { numRuns: 100 },
    );
  });

  it("bhadohiHierarchy has nodes to test", () => {
    expect(allNodes.length).toBeGreaterThan(0);
  });
});

// ─── Task 10.1: Unit tests for Mirzapur hierarchy ────────────────────────────

describe('getHierarchyForDistrict unit tests (Mirzapur)', () => {
  it('returns a non-empty array for "mirzapur"', () => {
    const result = getHierarchyForDistrict("mirzapur");
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect((result as import("../data/addressHierarchy").Tehsil[]).length).toBeGreaterThan(0);
  });
});

// ─── Task 10.2: Property 11 — Hindi labels contain Devanagari (Mirzapur) ─────

// Feature: profile-onboarding-data, Property 11: Hindi labels contain Devanagari (Mirzapur)

import { mirzapurHierarchy } from "../data/addressHierarchy";

/**
 * Property 11: Hindi labels contain Devanagari (Mirzapur)
 * Validates: Requirements 3.10
 *
 * For every place name node in mirzapurHierarchy, the `hi` field must contain
 * at least one Devanagari character (Unicode range U+0900–U+097F).
 */
describe("Property 11: Hindi labels contain Devanagari (Mirzapur)", () => {
  const DEVANAGARI = /[\u0900-\u097F]/;

  const allMirzapurNodes: Array<{ en: string; hi: string }> = [];

  for (const tehsil of mirzapurHierarchy) {
    allMirzapurNodes.push({ en: tehsil.en, hi: tehsil.hi });
    for (const np of tehsil.nyayPanchayats) {
      allMirzapurNodes.push({ en: np.en, hi: np.hi });
      for (const gp of np.gramPanchayats) {
        allMirzapurNodes.push({ en: gp.en, hi: gp.hi });
        for (const village of gp.villages) {
          allMirzapurNodes.push({ en: village.en, hi: village.hi });
        }
      }
    }
  }

  it("every place name node has a hi field containing Devanagari", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allMirzapurNodes), (node) => {
        return DEVANAGARI.test(node.hi);
      }),
      { numRuns: 100 },
    );
  });

  it("mirzapurHierarchy has nodes to test", () => {
    expect(allMirzapurNodes.length).toBeGreaterThan(0);
  });
});
