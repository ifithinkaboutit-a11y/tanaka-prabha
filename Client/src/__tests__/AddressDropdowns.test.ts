// Feature: profile-onboarding-data, Property 8: child options match parent
// Feature: profile-onboarding-data, Property 9: parent change clears children

import * as fc from "fast-check";
import {
  getChildOptions,
  applyParentChange,
  type AddressValue,
} from "../components/molecules/addressDropdownsHelpers";
import {
  getHierarchyForDistrict,
  bhadohiHierarchy,
} from "../data/addressHierarchy";
import type { DistrictHierarchy } from "../data/addressHierarchy";

// ─── Task 11.1: Property 8 — Cascade filtering correctness ───────────────────

/**
 * Property 8: Child options match parent
 * Validates: Requirements 3.2, 3.3, 3.4
 */
describe("Property 8: child options match parent", () => {
  const hierarchy: DistrictHierarchy = bhadohiHierarchy;

  const allTehsils = hierarchy.map((t) => t);
  const allNyayPanchayats = hierarchy.flatMap((t) => t.nyayPanchayats);
  const allGramPanchayats = hierarchy.flatMap((t) =>
    t.nyayPanchayats.flatMap((np) => np.gramPanchayats),
  );

  it("tehsil → nyayPanchayat: options match exactly the NPs under that tehsil (en)", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allTehsils), (tehsil) => {
        const options = getChildOptions(hierarchy, "tehsil", tehsil.en, "en");
        const expectedValues = tehsil.nyayPanchayats.map((np) => np.en);
        const actualValues = options.map((o) => o.value);
        expect(actualValues).toEqual(expectedValues);
        expect(options.map((o) => o.label)).toEqual(expectedValues);
      }),
      { numRuns: 100 },
    );
  });

  it("tehsil → nyayPanchayat: Hindi labels match hi field", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allTehsils), (tehsil) => {
        const options = getChildOptions(hierarchy, "tehsil", tehsil.en, "hi");
        const expectedLabels = tehsil.nyayPanchayats.map((np) => np.hi);
        expect(options.map((o) => o.label)).toEqual(expectedLabels);
      }),
      { numRuns: 100 },
    );
  });

  it("nyayPanchayat → gramPanchayat: options match exactly the GPs under that NP", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allNyayPanchayats), (np) => {
        const options = getChildOptions(hierarchy, "nyayPanchayat", np.en, "en");
        const expectedValues = np.gramPanchayats.map((gp) => gp.en);
        expect(options.map((o) => o.value)).toEqual(expectedValues);
      }),
      { numRuns: 100 },
    );
  });

  it("gramPanchayat → village: options match exactly the villages under that GP", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allGramPanchayats), (gp) => {
        const options = getChildOptions(hierarchy, "gramPanchayat", gp.en, "en");
        const expectedValues = gp.villages.map((v) => v.en);
        expect(options.map((o) => o.value)).toEqual(expectedValues);
      }),
      { numRuns: 100 },
    );
  });

  it("returns empty array for unknown parent value", () => {
    expect(getChildOptions(hierarchy, "tehsil", "NonExistentTehsil", "en")).toEqual([]);
    expect(getChildOptions(hierarchy, "nyayPanchayat", "NonExistentNP", "en")).toEqual([]);
    expect(getChildOptions(hierarchy, "gramPanchayat", "NonExistentGP", "en")).toEqual([]);
  });
});

// ─── Task 11.2: Property 9 — Parent change clears children ───────────────────

/**
 * Property 9: Parent change clears children
 * Validates: Requirements 3.5
 */
describe("Property 9: parent change clears children", () => {
  const arbFullAddress = fc.record<AddressValue>({
    tehsil: fc.string({ minLength: 1 }),
    nyayPanchayat: fc.string({ minLength: 1 }),
    gramPanchayat: fc.string({ minLength: 1 }),
    village: fc.string({ minLength: 1 }),
  });

  const arbNewValue = fc.string({ minLength: 1 });

  it("changing tehsil clears nyayPanchayat, gramPanchayat, and village", () => {
    fc.assert(
      fc.property(arbFullAddress, arbNewValue, (address, newTehsil) => {
        const result = applyParentChange(address, "tehsil", newTehsil);
        expect(result.tehsil).toBe(newTehsil);
        expect(result.nyayPanchayat).toBe("");
        expect(result.gramPanchayat).toBe("");
        expect(result.village).toBe("");
      }),
      { numRuns: 100 },
    );
  });

  it("changing nyayPanchayat clears gramPanchayat and village, preserves tehsil", () => {
    fc.assert(
      fc.property(arbFullAddress, arbNewValue, (address, newNP) => {
        const result = applyParentChange(address, "nyayPanchayat", newNP);
        expect(result.tehsil).toBe(address.tehsil);
        expect(result.nyayPanchayat).toBe(newNP);
        expect(result.gramPanchayat).toBe("");
        expect(result.village).toBe("");
      }),
      { numRuns: 100 },
    );
  });

  it("changing gramPanchayat clears village, preserves tehsil and nyayPanchayat", () => {
    fc.assert(
      fc.property(arbFullAddress, arbNewValue, (address, newGP) => {
        const result = applyParentChange(address, "gramPanchayat", newGP);
        expect(result.tehsil).toBe(address.tehsil);
        expect(result.nyayPanchayat).toBe(address.nyayPanchayat);
        expect(result.gramPanchayat).toBe(newGP);
        expect(result.village).toBe("");
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Task 11.3: Unit tests for AddressDropdowns data logic ───────────────────

describe("AddressDropdowns data logic unit tests", () => {
  it('getHierarchyForDistrict("bhadohi") returns non-null (component would render 4 selects)', () => {
    const hierarchy = getHierarchyForDistrict("bhadohi");
    expect(hierarchy).not.toBeNull();
    expect(Array.isArray(hierarchy)).toBe(true);
    expect(hierarchy!.length).toBeGreaterThan(0);
  });

  it('getHierarchyForDistrict("varanasi") returns null (component would render null)', () => {
    const hierarchy = getHierarchyForDistrict("varanasi");
    expect(hierarchy).toBeNull();
  });

  it("bhadohi hierarchy has 3 tehsils (one Select per level = 4 Selects total)", () => {
    const hierarchy = getHierarchyForDistrict("bhadohi")!;
    expect(hierarchy.length).toBe(3);
  });

  it("each tehsil in bhadohi has 3 nyay panchayats", () => {
    const hierarchy = getHierarchyForDistrict("bhadohi")!;
    for (const tehsil of hierarchy) {
      expect(tehsil.nyayPanchayats.length).toBe(3);
    }
  });

  it("each nyay panchayat has 2 gram panchayats", () => {
    const hierarchy = getHierarchyForDistrict("bhadohi")!;
    for (const tehsil of hierarchy) {
      for (const np of tehsil.nyayPanchayats) {
        expect(np.gramPanchayats.length).toBe(2);
      }
    }
  });

  it("each gram panchayat has 2 villages", () => {
    const hierarchy = getHierarchyForDistrict("bhadohi")!;
    for (const tehsil of hierarchy) {
      for (const np of tehsil.nyayPanchayats) {
        for (const gp of np.gramPanchayats) {
          expect(gp.villages.length).toBe(2);
        }
      }
    }
  });

  it("applyParentChange returns a new object (immutability)", () => {
    const address: AddressValue = {
      tehsil: "Gyanpur",
      nyayPanchayat: "Gyanpur",
      gramPanchayat: "Gyanpur",
      village: "Rampur",
    };
    const result = applyParentChange(address, "tehsil", "Bhadohi");
    expect(result).not.toBe(address);
  });
});
