/**
 * Unit tests for category-listing filter logic
 * Tests category multi-select and type toggle filtering.
 *
 * Requirements: 1.2.4, 1.2.5, 1.2.6
 *
 * The filter logic is extracted from the filteredSchemes useMemo in
 * category-listing.tsx and tested here as pure functions — no React rendering.
 */

import { FilterState, TypeFilter } from "../components/molecules/FilterPanel";

// ── Minimal scheme shape needed for filter tests ──────────────────────────────

interface FilterableScheme {
  id: string;
  title: string;
  category: string;
  type?: string;
}

// ── Filter functions (mirrors category-listing.tsx filteredSchemes useMemo) ───

function applyFilters(
  schemes: FilterableScheme[],
  activeFilters: FilterState,
): FilterableScheme[] {
  let filtered = schemes;

  // Apply category filter
  if (activeFilters.categories.length > 0) {
    filtered = filtered.filter((scheme) =>
      activeFilters.categories.includes(scheme.category),
    );
  }

  // Apply type filter (skip if 'both')
  if (activeFilters.typeFilter !== "both") {
    filtered = filtered.filter(
      (scheme) => (scheme as any).type === activeFilters.typeFilter,
    );
  }

  return filtered;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockSchemes: FilterableScheme[] = [
  {
    id: "1",
    title: "Crop Insurance Scheme A",
    category: "Crop Insurance",
    type: "scheme",
  },
  {
    id: "2",
    title: "Financial Support Program",
    category: "Financial Support",
    type: "program",
  },
  {
    id: "3",
    title: "Soil Management Scheme",
    category: "Soil Management",
    type: "scheme",
  },
  {
    id: "4",
    title: "Agricultural Development Program",
    category: "Agricultural Development",
    type: "program",
  },
  {
    id: "5",
    title: "Training Scheme",
    category: "Training",
    type: "scheme",
  },
  {
    id: "6",
    title: "Crop Insurance Program",
    category: "Crop Insurance",
    type: "program",
  },
];

// ── Tests: Category multi-select (Requirements 1.2.4, 1.2.5) ─────────────────

describe("Category multi-select filtering", () => {
  it("selecting one category returns only schemes matching that category", () => {
    const filters: FilterState = { categories: ["Crop Insurance"], typeFilter: "both" };
    const result = applyFilters(mockSchemes, filters);
    expect(result.map((s) => s.id)).toEqual(["1", "6"]);
    result.forEach((s) => expect(s.category).toBe("Crop Insurance"));
  });

  it("selecting multiple categories returns schemes matching any selected category (OR logic)", () => {
    const filters: FilterState = {
      categories: ["Financial Support", "Soil Management"],
      typeFilter: "both",
    };
    const result = applyFilters(mockSchemes, filters);
    expect(result.map((s) => s.id).sort()).toEqual(["2", "3"]);
    result.forEach((s) =>
      expect(["Financial Support", "Soil Management"]).toContain(s.category),
    );
  });

  it("selecting no categories returns all schemes (Requirement 1.2.5)", () => {
    const filters: FilterState = { categories: [], typeFilter: "both" };
    const result = applyFilters(mockSchemes, filters);
    expect(result).toHaveLength(mockSchemes.length);
    expect(result.map((s) => s.id).sort()).toEqual(
      mockSchemes.map((s) => s.id).sort(),
    );
  });

  it("selecting a category with no matching schemes returns empty array", () => {
    const filters: FilterState = { categories: ["NonExistentCategory"], typeFilter: "both" };
    const result = applyFilters(mockSchemes, filters);
    expect(result).toHaveLength(0);
  });

  it("selecting all categories returns all schemes", () => {
    const allCategories = [
      "Crop Insurance",
      "Financial Support",
      "Soil Management",
      "Agricultural Development",
      "Training",
    ];
    const filters: FilterState = { categories: allCategories, typeFilter: "both" };
    const result = applyFilters(mockSchemes, filters);
    expect(result).toHaveLength(mockSchemes.length);
  });

  it("does not mutate the original array", () => {
    const original = [...mockSchemes];
    applyFilters(mockSchemes, { categories: ["Training"], typeFilter: "both" });
    expect(mockSchemes).toEqual(original);
  });
});

// ── Tests: Type toggle (Requirements 1.2.4, 1.2.5) ───────────────────────────

describe("Type toggle filtering", () => {
  it('"scheme" filter returns only schemes with type="scheme"', () => {
    const filters: FilterState = { categories: [], typeFilter: "scheme" };
    const result = applyFilters(mockSchemes, filters);
    expect(result.map((s) => s.id).sort()).toEqual(["1", "3", "5"]);
    result.forEach((s) => expect(s.type).toBe("scheme"));
  });

  it('"program" filter returns only schemes with type="program"', () => {
    const filters: FilterState = { categories: [], typeFilter: "program" };
    const result = applyFilters(mockSchemes, filters);
    expect(result.map((s) => s.id).sort()).toEqual(["2", "4", "6"]);
    result.forEach((s) => expect(s.type).toBe("program"));
  });

  it('"both" returns all types (Requirement 1.2.5)', () => {
    const filters: FilterState = { categories: [], typeFilter: "both" };
    const result = applyFilters(mockSchemes, filters);
    expect(result).toHaveLength(mockSchemes.length);
  });

  it("type filter excludes items with no type field when filter is not both", () => {
    const schemesWithMissingType: FilterableScheme[] = [
      { id: "a", title: "No Type Scheme", category: "Training" },
      { id: "b", title: "Typed Scheme", category: "Training", type: "scheme" },
    ];
    const filters: FilterState = { categories: [], typeFilter: "scheme" };
    const result = applyFilters(schemesWithMissingType, filters);
    expect(result.map((s) => s.id)).toEqual(["b"]);
  });
});

// ── Tests: Combined category + type filters (Requirement 1.2.4) ──────────────

describe("Combined category AND type filtering", () => {
  it("category + type filter together applies AND logic", () => {
    const filters: FilterState = {
      categories: ["Crop Insurance"],
      typeFilter: "scheme",
    };
    const result = applyFilters(mockSchemes, filters);
    // Only id=1 is Crop Insurance AND scheme; id=6 is Crop Insurance but program
    expect(result.map((s) => s.id)).toEqual(["1"]);
  });

  it("category filter with program type returns only matching programs", () => {
    const filters: FilterState = {
      categories: ["Crop Insurance"],
      typeFilter: "program",
    };
    const result = applyFilters(mockSchemes, filters);
    expect(result.map((s) => s.id)).toEqual(["6"]);
  });

  it("multiple categories + type filter narrows results correctly", () => {
    const filters: FilterState = {
      categories: ["Financial Support", "Agricultural Development"],
      typeFilter: "program",
    };
    const result = applyFilters(mockSchemes, filters);
    // id=2 (Financial Support, program) and id=4 (Agricultural Development, program)
    expect(result.map((s) => s.id).sort()).toEqual(["2", "4"]);
  });

  it("multiple categories + scheme type returns only matching schemes", () => {
    const filters: FilterState = {
      categories: ["Soil Management", "Training"],
      typeFilter: "scheme",
    };
    const result = applyFilters(mockSchemes, filters);
    // id=3 (Soil Management, scheme) and id=5 (Training, scheme)
    expect(result.map((s) => s.id).sort()).toEqual(["3", "5"]);
  });
});

// ── Tests: Zero-result state (Requirement 1.2.6) ─────────────────────────────

describe("Zero-result state", () => {
  it("returns empty array when category filter matches nothing", () => {
    const filters: FilterState = { categories: ["Unknown Category"], typeFilter: "both" };
    const result = applyFilters(mockSchemes, filters);
    expect(result).toEqual([]);
  });

  it("returns empty array when type filter matches nothing", () => {
    const schemesAllPrograms: FilterableScheme[] = mockSchemes.filter(
      (s) => s.type === "program",
    );
    const filters: FilterState = { categories: [], typeFilter: "scheme" };
    const result = applyFilters(schemesAllPrograms, filters);
    expect(result).toEqual([]);
  });

  it("returns empty array when combined filters produce no matches", () => {
    // Training category only has a scheme (id=5), not a program
    const filters: FilterState = {
      categories: ["Training"],
      typeFilter: "program",
    };
    const result = applyFilters(mockSchemes, filters);
    expect(result).toEqual([]);
  });

  it("returns empty array when input is empty regardless of filters", () => {
    const filters: FilterState = {
      categories: ["Crop Insurance"],
      typeFilter: "scheme",
    };
    const result = applyFilters([], filters);
    expect(result).toEqual([]);
  });
});
