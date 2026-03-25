// src/utils/filterFarmers.ts
import type { ApiUserProfile } from "@/services/apiService";

/**
 * Filter a list of farmers by name or mobile number.
 * If query is empty/whitespace, all farmers are returned.
 */
export function filterFarmers(farmers: ApiUserProfile[], query: string): ApiUserProfile[] {
    if (!query.trim()) return farmers;
    const q = query.toLowerCase();
    return farmers.filter(
        (f) =>
            (f.name ?? "").toLowerCase().includes(q) ||
            (f.mobile_number ?? "").includes(query)
    );
}
