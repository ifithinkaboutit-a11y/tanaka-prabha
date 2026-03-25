// Pure helper functions for AddressDropdowns — no React Native dependency
import type { DistrictHierarchy } from "../../data/addressHierarchy";

export interface AddressValue {
  tehsil: string;
  nyayPanchayat: string;
  gramPanchayat: string;
  village: string;
}

/**
 * Returns the child options for a given level and parent value.
 *
 * @param hierarchy    The district hierarchy array
 * @param level        The parent level whose children we want
 * @param parentValue  The selected parent value (English name)
 * @param language     "en" or "hi"
 */
export function getChildOptions(
  hierarchy: DistrictHierarchy,
  level: "tehsil" | "nyayPanchayat" | "gramPanchayat",
  parentValue: string,
  language: "en" | "hi",
): { label: string; value: string }[] {
  if (level === "tehsil") {
    const tehsil = hierarchy.find((t) => t.en === parentValue);
    if (!tehsil) return [];
    return tehsil.nyayPanchayats.map((np) => ({
      label: language === "hi" ? np.hi : np.en,
      value: np.en,
    }));
  }

  if (level === "nyayPanchayat") {
    for (const tehsil of hierarchy) {
      const np = tehsil.nyayPanchayats.find((n) => n.en === parentValue);
      if (np) {
        return np.gramPanchayats.map((gp) => ({
          label: language === "hi" ? gp.hi : gp.en,
          value: gp.en,
        }));
      }
    }
    return [];
  }

  // level === "gramPanchayat"
  for (const tehsil of hierarchy) {
    for (const np of tehsil.nyayPanchayats) {
      const gp = np.gramPanchayats.find((g) => g.en === parentValue);
      if (gp) {
        return gp.villages.map((v) => ({
          label: language === "hi" ? v.hi : v.en,
          value: v.en,
        }));
      }
    }
  }
  return [];
}

/**
 * Returns a new AddressValue with the changed level set and all child levels
 * cleared to empty string.
 */
export function applyParentChange(
  address: AddressValue,
  changedLevel: "tehsil" | "nyayPanchayat" | "gramPanchayat",
  newValue: string,
): AddressValue {
  if (changedLevel === "tehsil") {
    return {
      tehsil: newValue,
      nyayPanchayat: "",
      gramPanchayat: "",
      village: "",
    };
  }
  if (changedLevel === "nyayPanchayat") {
    return {
      ...address,
      nyayPanchayat: newValue,
      gramPanchayat: "",
      village: "",
    };
  }
  // changedLevel === "gramPanchayat"
  return {
    ...address,
    gramPanchayat: newValue,
    village: "",
  };
}
