/**
 * Pure utility for computing top livestock regions from a farmers array.
 * Extracted as a separate module so it can be imported by both the
 * TopLivestockRegions component and unit tests without pulling in React/JSX.
 */

export interface FarmerLivestock {
  district?: string
  cow?: number
  buffalo?: number
  goat?: number
  sheep?: number
  poultry?: number
  others?: number
  [key: string]: unknown
}

export interface DistrictRegion {
  district: string
  total: number
  cow: number
  buffalo: number
  goat: number
  sheep: number
  poultry: number
  others: number
}

const ANIMAL_TYPES = ["cow", "buffalo", "goat", "sheep", "poultry", "others"] as const

/**
 * Groups farmers by district, sums all animal types per district,
 * sorts by total descending, and returns the top 5.
 */
export function getTopRegions(farmers: FarmerLivestock[]): DistrictRegion[] {
  if (!Array.isArray(farmers) || farmers.length === 0) return []

  const districtMap: Record<string, DistrictRegion> = {}

  for (const farmer of farmers) {
    const district = (farmer.district as string) || "Unknown"
    if (!districtMap[district]) {
      districtMap[district] = { district, total: 0, cow: 0, buffalo: 0, goat: 0, sheep: 0, poultry: 0, others: 0 }
    }
    const entry = districtMap[district]
    for (const type of ANIMAL_TYPES) {
      const count = (farmer[type] as number) || 0
      entry[type] += count
      entry.total += count
    }
  }

  return Object.values(districtMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
}
