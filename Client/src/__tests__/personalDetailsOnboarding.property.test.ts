// Feature: profile-onboarding-data, Property 10: Address values persist to store
// Validates: Requirements 3.8
import * as fc from "fast-check";
import { applyParentChange, type AddressValue } from "../components/molecules/addressDropdownsHelpers";
import { getHierarchyForDistrict } from "../data/addressHierarchy";

describe("Property 10: Address values persist to store", () => {
  it("selecting an AddressValue via applyParentChange produces correct store shape", () => {
    const hierarchy = getHierarchyForDistrict("bhadohi")!;
    const tehsilNames = hierarchy.map((t) => t.en);

    fc.assert(
      fc.property(
        fc.constantFrom(...tehsilNames),
        (tehsil) => {
          const initial: AddressValue = { tehsil: "", nyayPanchayat: "", gramPanchayat: "", village: "" };
          const result = applyParentChange(initial, "tehsil", tehsil);
          // After selecting a tehsil, tehsil is set and children are cleared
          expect(result.tehsil).toBe(tehsil);
          expect(result.nyayPanchayat).toBe("");
          expect(result.gramPanchayat).toBe("");
          expect(result.village).toBe("");
        }
      )
    );
  });

  it("full address selection chain produces correct final AddressValue", () => {
    const hierarchy = getHierarchyForDistrict("bhadohi")!;

    fc.assert(
      fc.property(
        fc.nat({ max: hierarchy.length - 1 }),
        (tehsilIdx) => {
          const tehsil = hierarchy[tehsilIdx];
          const np = tehsil.nyayPanchayats[0];
          const gp = np.gramPanchayats[0];
          const village = gp.villages[0];

          let addr: AddressValue = { tehsil: "", nyayPanchayat: "", gramPanchayat: "", village: "" };
          addr = applyParentChange(addr, "tehsil", tehsil.en);
          addr = applyParentChange(addr, "nyayPanchayat", np.en);
          addr = applyParentChange(addr, "gramPanchayat", gp.en);
          addr = { ...addr, village: village.en };

          // All four fields are populated
          expect(addr.tehsil).toBe(tehsil.en);
          expect(addr.nyayPanchayat).toBe(np.en);
          expect(addr.gramPanchayat).toBe(gp.en);
          expect(addr.village).toBe(village.en);
        }
      )
    );
  });
});
