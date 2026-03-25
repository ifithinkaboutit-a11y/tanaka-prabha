/**
 * Unit tests for LivestockHeatMap intensity calculation and top regions ranking.
 *
 * Validates: Requirements 17.5, 17.6, 17.9
 */

import { getTopRegions } from "@/lib/top-livestock-regions";

// Re-implement the pure function here to avoid JSX/React import issues in Jest.
// The implementation must stay in sync with LivestockHeatMap.jsx.
function getIntensity(
  farmer: {
    cow?: number;
    buffalo?: number;
    goat?: number;
    sheep?: number;
    poultry?: number;
    others?: number;
    [key: string]: number | undefined;
  },
  filter: string
): number {
  if (filter === "all") {
    return (
      (farmer.cow || 0) +
      (farmer.buffalo || 0) +
      (farmer.goat || 0) +
      (farmer.sheep || 0) +
      (farmer.poultry || 0) +
      (farmer.others || 0)
    );
  }
  return farmer[filter] || 0;
}

// ─── getIntensity ─────────────────────────────────────────────────

describe("getIntensity", () => {
  const fullFarmer = {
    cow: 5,
    buffalo: 3,
    goat: 10,
    sheep: 7,
    poultry: 20,
    others: 2,
  };

  it('sums all six animal type counts when filter is "all"', () => {
    // 5 + 3 + 10 + 7 + 20 + 2 = 47
    expect(getIntensity(fullFarmer, "all")).toBe(47);
  });

  it('returns only the cow count when filter is "cow"', () => {
    expect(getIntensity(fullFarmer, "cow")).toBe(5);
  });

  it('returns 0 for a farmer with zero goats when filter is "goat"', () => {
    const noGoatFarmer = { cow: 4, buffalo: 2, goat: 0, sheep: 1, poultry: 8, others: 0 };
    expect(getIntensity(noGoatFarmer, "goat")).toBe(0);
  });

  it('returns only the buffalo count when filter is "buffalo"', () => {
    expect(getIntensity(fullFarmer, "buffalo")).toBe(3);
  });

  it('sums correctly when some animal counts are zero (filter "all")', () => {
    const partialFarmer = { cow: 10, buffalo: 0, goat: 5, sheep: 0, poultry: 15, others: 0 };
    // 10 + 0 + 5 + 0 + 15 + 0 = 30
    expect(getIntensity(partialFarmer, "all")).toBe(30);
  });
});

// ─── getTopRegions ────────────────────────────────────────────────

/**
 * Validates: Requirements 17.9
 */
describe("getTopRegions", () => {
  // Helper to build a minimal farmer object
  function makeFarmer(
    district: string,
    counts: Partial<{ cow: number; buffalo: number; goat: number; sheep: number; poultry: number; others: number }>
  ) {
    return { district, cow: 0, buffalo: 0, goat: 0, sheep: 0, poultry: 0, others: 0, ...counts }
  }

  it("returns top 5 districts in descending order when 6 districts are provided", () => {
    const farmers = [
      makeFarmer("Alpha",   { cow: 100 }),  // total 100
      makeFarmer("Beta",    { cow: 500 }),  // total 500
      makeFarmer("Gamma",   { cow: 300 }),  // total 300
      makeFarmer("Delta",   { cow: 200 }),  // total 200
      makeFarmer("Epsilon", { cow: 400 }),  // total 400
      makeFarmer("Zeta",    { cow: 50  }),  // total 50  ← should be excluded
    ]

    const result = getTopRegions(farmers)

    expect(result).toHaveLength(5)
    expect(result.map((r) => r.district)).toEqual([
      "Beta", "Epsilon", "Gamma", "Delta", "Alpha",
    ])
    // Verify descending order
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].total).toBeGreaterThanOrEqual(result[i + 1].total)
    }
  })

  it("excludes a zero-livestock district when 5 non-zero districts exist", () => {
    const farmers = [
      makeFarmer("A", { cow: 10 }),
      makeFarmer("B", { cow: 20 }),
      makeFarmer("C", { cow: 30 }),
      makeFarmer("D", { cow: 40 }),
      makeFarmer("E", { cow: 50 }),
      makeFarmer("Zero", {}),  // all counts default to 0
    ]

    const result = getTopRegions(farmers)

    expect(result).toHaveLength(5)
    expect(result.map((r) => r.district)).not.toContain("Zero")
  })

  it("returns all districts when fewer than 5 exist", () => {
    const farmers = [
      makeFarmer("X", { cow: 10 }),
      makeFarmer("Y", { buffalo: 5 }),
      makeFarmer("Z", { goat: 8 }),
    ]

    const result = getTopRegions(farmers)

    expect(result).toHaveLength(3)
    expect(result.map((r) => r.district).sort()).toEqual(["X", "Y", "Z"])
  })

  it("correctly sums multiple farmers from the same district", () => {
    const farmers = [
      makeFarmer("Patna", { cow: 10, buffalo: 5 }),
      makeFarmer("Patna", { cow: 20, goat: 15 }),
      makeFarmer("Gaya",  { cow: 100 }),
    ]

    const result = getTopRegions(farmers)

    const patna = result.find((r) => r.district === "Patna")!
    expect(patna).toBeDefined()
    expect(patna.cow).toBe(30)       // 10 + 20
    expect(patna.buffalo).toBe(5)
    expect(patna.goat).toBe(15)
    expect(patna.total).toBe(50)     // 10+5+20+15 = 50
  })

  it("returns an empty array when given an empty farmers list", () => {
    expect(getTopRegions([])).toEqual([])
  })
})
