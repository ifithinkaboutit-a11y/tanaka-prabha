export { bhadohiHierarchy } from "./bhadohi";
export { mirzapurHierarchy } from "./mirzapur";
export type { DistrictHierarchy, Tehsil, NyayPanchayat, GramPanchayat, Village } from "./types";

import type { DistrictHierarchy } from "./types";
import { bhadohiHierarchy } from "./bhadohi";
import { mirzapurHierarchy } from "./mirzapur";

export function getHierarchyForDistrict(district: string): DistrictHierarchy | null {
  const d = district.toLowerCase();
  if (d === "bhadohi" || d === "bhadui") return bhadohiHierarchy;
  if (d === "mirzapur") return mirzapurHierarchy;
  return null;
}
