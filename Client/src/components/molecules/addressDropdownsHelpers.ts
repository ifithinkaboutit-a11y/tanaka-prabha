// Pure helper functions for AddressDropdowns — no React Native dependency
import type { DistrictHierarchy } from "../../data/addressHierarchy";

export interface AddressValue {
  tehsil: string;
  nyayPanchayat: string;
  gramPanchayat: string;
  village: string;
  postOffice: string;
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
 * Returns the post-office options for a given gram panchayat.
 */
export function getPostOfficeOptions(
  hierarchy: DistrictHierarchy,
  gramPanchayatValue: string,
  language: "en" | "hi",
): { label: string; value: string }[] {
  for (const tehsil of hierarchy) {
    for (const np of tehsil.nyayPanchayats) {
      const gp = np.gramPanchayats.find((g) => g.en === gramPanchayatValue);
      if (gp) {
        return (gp.postOffices || []).map((po) => ({
          label: language === "hi" ? po.hi : po.en,
          value: po.en,
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
      postOffice: "",
    };
  }
  if (changedLevel === "nyayPanchayat") {
    return {
      ...address,
      nyayPanchayat: newValue,
      gramPanchayat: "",
      village: "",
      postOffice: "",
    };
  }
  // changedLevel === "gramPanchayat"
  return {
    ...address,
    gramPanchayat: newValue,
    village: "",
    postOffice: "",
  };
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/[\s-]+/g, "_");

function findTehsil(hierarchy: DistrictHierarchy, candidate: string) {
  const c = normalize(candidate);
  return hierarchy.find((t) => normalize(t.en) === c)?.en || "";
}

function findNyayPanchayat(hierarchy: DistrictHierarchy, tehsil: string, candidate: string) {
  const c = normalize(candidate);
  for (const t of hierarchy) {
    if (tehsil && t.en !== tehsil) continue;
    const np = t.nyayPanchayats.find((n) => normalize(n.en) === c);
    if (np) return np.en;
  }
  return "";
}

function findGramPanchayat(hierarchy: DistrictHierarchy, nyayPanchayat: string, candidate: string) {
  const c = normalize(candidate);
  for (const t of hierarchy) {
    for (const np of t.nyayPanchayats) {
      if (nyayPanchayat && np.en !== nyayPanchayat) continue;
      const gp = np.gramPanchayats.find((g) => normalize(g.en) === c);
      if (gp) return gp.en;
    }
  }
  return "";
}

function findVillage(hierarchy: DistrictHierarchy, gramPanchayat: string, candidate: string) {
  const c = normalize(candidate);
  for (const t of hierarchy) {
    for (const np of t.nyayPanchayats) {
      for (const gp of np.gramPanchayats) {
        if (gramPanchayat && gp.en !== gramPanchayat) continue;
        const v = gp.villages.find((v) => normalize(v.en) === c);
        if (v) return v.en;
      }
    }
  }
  return "";
}

function findPostOffice(hierarchy: DistrictHierarchy, gramPanchayat: string, candidate: string) {
  const c = normalize(candidate);
  for (const t of hierarchy) {
    for (const np of t.nyayPanchayats) {
      for (const gp of np.gramPanchayats) {
        if (gramPanchayat && gp.en !== gramPanchayat) continue;
        const po = (gp.postOffices || []).find((p) => normalize(p.en) === c);
        if (po) return po.en;
      }
    }
  }
  return "";
}

/**
 * Extracts a 6-digit PIN from a post-office option value such as
 * "Gyanpur S.O. (221304)". Returns "" when no PIN is present.
 */
export function getPinFromPostOffice(postOfficeValue: string): string {
  const match = postOfficeValue.match(/\((\d{6})\)/);
  return match ? match[1] : "";
}

/**
 * Builds an AddressValue from possibly-slugified / partial stored values,
 * resolving each level to its canonical English name within the hierarchy.
 * Levels that don't match are left as the raw candidate.
 */
export function resolveAddressValue(
  hierarchy: DistrictHierarchy | null,
  stored: Partial<AddressValue>,
): AddressValue {
  const raw: AddressValue = {
    tehsil: stored.tehsil || "",
    nyayPanchayat: stored.nyayPanchayat || "",
    gramPanchayat: stored.gramPanchayat || "",
    village: stored.village || "",
    postOffice: stored.postOffice || "",
  };

  if (!hierarchy) return raw;

  const tehsil = findTehsil(hierarchy, stored.tehsil || "");
  const nyayPanchayat = findNyayPanchayat(hierarchy, tehsil, stored.nyayPanchayat || "");
  const gramPanchayat = findGramPanchayat(hierarchy, nyayPanchayat, stored.gramPanchayat || "");
  const village = findVillage(hierarchy, gramPanchayat, stored.village || "");
  const postOffice = findPostOffice(hierarchy, gramPanchayat, stored.postOffice || "");

  return {
    tehsil: tehsil || raw.tehsil,
    nyayPanchayat: nyayPanchayat || raw.nyayPanchayat,
    gramPanchayat: gramPanchayat || raw.gramPanchayat,
    village: village || raw.village,
    postOffice: postOffice || raw.postOffice,
  };
}
