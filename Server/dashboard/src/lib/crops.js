import { CROP_OPTIONS } from "./constants"

/**
 * Crop parsing helpers.
 *
 * `land_details.rabi_crop` / `kharif_crop` / `zaid_crop` are plain TEXT columns,
 * but the app writes *multiple* crops into each one joined with ", "
 * (see Client/src/app/(auth)/livestock-details.tsx → `rabiCrops.join(", ")`).
 *
 * Worse, the two write paths disagree on the value format: onboarding stores
 * display labels ("Wheat", "Tur/Arhar (Pigeon Pea)") while the admin
 * add-beneficiary form stores option slugs ("wheat", "tur_arhar"). Anything
 * comparing the raw column to a single slug therefore misses most rows — which
 * is why the crop filter matched almost nothing.
 *
 * Everything here canonicalises to the CROP_OPTIONS `value` so display,
 * filtering and export all agree.
 */

export const CROP_SEASONS = [
    {
        key: "rabi",
        field: "rabi_crop",
        label: "Rabi",
        chipClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    },
    {
        key: "kharif",
        field: "kharif_crop",
        label: "Kharif",
        chipClass: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    },
    {
        key: "zaid",
        field: "zaid_crop",
        label: "Zaid",
        chipClass: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
    },
]

/** Strip everything but alphanumerics so "Tur/Arhar (Pigeon Pea)" and "tur_arhar" can be matched. */
function normalise(value) {
    return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

// Both the slug and the human label resolve to the same canonical slug.
const CANONICAL_BY_KEY = new Map()
const LABEL_BY_VALUE = new Map()
for (const { value, label } of CROP_OPTIONS) {
    CANONICAL_BY_KEY.set(normalise(value), value)
    CANONICAL_BY_KEY.set(normalise(label), value)
    LABEL_BY_VALUE.set(value, label)
}

/** Map any stored crop spelling onto its CROP_OPTIONS value, or keep it as-is if unknown. */
export function canonicalCrop(raw) {
    const trimmed = String(raw ?? "").trim()
    if (!trimmed) return ""
    return CANONICAL_BY_KEY.get(normalise(trimmed)) ?? trimmed
}

/** Human label for a canonical crop value; unknown free-text crops are shown verbatim. */
export function cropLabel(value) {
    if (!value) return ""
    return LABEL_BY_VALUE.get(value) ?? value
}

/**
 * Split one season column into individual crops.
 * Only comma/semicolon are separators — "/" appears inside real crop names
 * such as "Tur/Arhar (Pigeon Pea)".
 */
export function parseCropList(raw) {
    if (raw == null || raw === "") return []
    const parts = Array.isArray(raw) ? raw : String(raw).split(/[,;]+/)

    const seen = new Set()
    const crops = []
    for (const part of parts) {
        const value = canonicalCrop(part)
        if (!value) continue
        const key = normalise(value)
        if (seen.has(key)) continue
        seen.add(key)
        crops.push(value)
    }
    return crops
}

/** `{ rabi: [...], kharif: [...], zaid: [...] }` of canonical crop values for one farmer. */
export function farmerCropsBySeason(farmer) {
    const land = farmer?.land_details || {}
    const bySeason = {}
    for (const season of CROP_SEASONS) {
        bySeason[season.key] = parseCropList(land[season.field])
    }
    return bySeason
}

/**
 * Does this farmer match the selected crops and seasons?
 *
 * Empty selection means "no constraint". When both are set, the crop must be
 * grown *in* one of the selected seasons rather than in any season.
 */
export function matchesCropFilter(farmer, selectedCrops = [], selectedSeasons = []) {
    const hasCropFilter = selectedCrops.length > 0
    const hasSeasonFilter = selectedSeasons.length > 0
    if (!hasCropFilter && !hasSeasonFilter) return true

    const bySeason = farmerCropsBySeason(farmer)
    const seasons = hasSeasonFilter
        ? selectedSeasons
        : CROP_SEASONS.map((s) => s.key)

    const wanted = new Set(selectedCrops.map(normalise))

    for (const seasonKey of seasons) {
        const crops = bySeason[seasonKey] || []
        if (!hasCropFilter) {
            // Season-only filter: farmer just needs to grow something that season.
            if (crops.length > 0) return true
            continue
        }
        if (crops.some((c) => wanted.has(normalise(c)))) return true
    }
    return false
}

/** Every distinct crop present in the loaded rows, for building filter options. */
export function collectCropOptions(farmers = []) {
    const found = new Map()
    for (const farmer of farmers) {
        const bySeason = farmerCropsBySeason(farmer)
        for (const crops of Object.values(bySeason)) {
            for (const value of crops) {
                if (!found.has(value)) found.set(value, cropLabel(value))
            }
        }
    }

    // Offer the full master list too, so a filter is available before the
    // relevant page of farmers has loaded.
    for (const { value, label } of CROP_OPTIONS) {
        if (!found.has(value)) found.set(value, label)
    }

    return [...found.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label))
}
