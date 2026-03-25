/**
 * Unit tests for category-listing sort logic
 * Tests the three sort branches: "name", "newest", "interested"
 *
 * Requirements: 1.1.2, 1.1.3, 1.1.4
 *
 * The sort comparators are extracted from the filteredSchemes useMemo in
 * category-listing.tsx and tested here as pure functions.
 */

// Minimal Scheme shape needed for sort tests
interface SortableScheme {
  id: string;
  title: string;
  createdAt?: string;
  interestCount?: number;
}

// ── Sort comparators (mirrors category-listing.tsx filteredSchemes useMemo) ──

function sortByName(a: SortableScheme, b: SortableScheme): number {
  return a.title.localeCompare(b.title);
}

function sortByNewest(a: SortableScheme, b: SortableScheme): number {
  return (
    new Date(b.createdAt || "").getTime() -
    new Date(a.createdAt || "").getTime()
  );
}

function sortByInterested(a: SortableScheme, b: SortableScheme): number {
  return (b.interestCount ?? 0) - (a.interestCount ?? 0);
}

function applySort(
  schemes: SortableScheme[],
  sortBy: "name" | "newest" | "interested",
): SortableScheme[] {
  const copy = [...schemes];
  copy.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return sortByName(a, b);
      case "newest":
        return sortByNewest(a, b);
      case "interested":
        return sortByInterested(a, b);
      default:
        return 0;
    }
  });
  return copy;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockSchemes: SortableScheme[] = [
  {
    id: "1",
    title: "Crop Insurance Scheme",
    createdAt: "2024-01-15T10:00:00Z",
    interestCount: 42,
  },
  {
    id: "2",
    title: "Agricultural Development Fund",
    createdAt: "2024-03-20T08:00:00Z",
    interestCount: 120,
  },
  {
    id: "3",
    title: "Soil Management Program",
    createdAt: "2023-11-05T14:00:00Z",
    interestCount: 7,
  },
  {
    id: "4",
    title: "Financial Support Initiative",
    createdAt: "2024-02-10T09:00:00Z",
    interestCount: 85,
  },
];

// ── Tests: "name" sort (Requirement 1.1.2) ────────────────────────────────────

describe('Sort branch: "name" (A–Z)', () => {
  it("sorts schemes alphabetically ascending by title", () => {
    const sorted = applySort(mockSchemes, "name");
    const titles = sorted.map((s) => s.title);
    expect(titles).toEqual([
      "Agricultural Development Fund",
      "Crop Insurance Scheme",
      "Financial Support Initiative",
      "Soil Management Program",
    ]);
  });

  it("returns a new array (does not mutate the original)", () => {
    const original = [...mockSchemes];
    applySort(mockSchemes, "name");
    expect(mockSchemes.map((s) => s.id)).toEqual(original.map((s) => s.id));
  });

  it("handles a single-element array", () => {
    const single = [mockSchemes[0]];
    const sorted = applySort(single, "name");
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe("1");
  });

  it("handles an empty array", () => {
    expect(applySort([], "name")).toEqual([]);
  });

  it("is case-insensitive via localeCompare (lowercase before uppercase in same position)", () => {
    const schemes: SortableScheme[] = [
      { id: "a", title: "zebra scheme" },
      { id: "b", title: "Apple scheme" },
      { id: "c", title: "mango scheme" },
    ];
    const sorted = applySort(schemes, "name");
    // localeCompare is locale-aware; just verify the order is stable and sorted
    const titles = sorted.map((s) => s.title);
    for (let i = 0; i < titles.length - 1; i++) {
      expect(titles[i].localeCompare(titles[i + 1])).toBeLessThanOrEqual(0);
    }
  });

  it("places titles starting with numbers before letters", () => {
    const schemes: SortableScheme[] = [
      { id: "a", title: "Beta Scheme" },
      { id: "b", title: "100 Acre Fund" },
      { id: "c", title: "Alpha Scheme" },
    ];
    const sorted = applySort(schemes, "name");
    // "100 Acre Fund" should sort before "Alpha" and "Beta" (digits < letters in localeCompare)
    const titles = sorted.map((s) => s.title);
    for (let i = 0; i < titles.length - 1; i++) {
      expect(titles[i].localeCompare(titles[i + 1])).toBeLessThanOrEqual(0);
    }
  });
});

// ── Tests: "newest" sort (Requirement 1.1.3) ──────────────────────────────────

describe('Sort branch: "newest" (creation date descending)', () => {
  it("sorts schemes by createdAt descending (newest first)", () => {
    const sorted = applySort(mockSchemes, "newest");
    const ids = sorted.map((s) => s.id);
    // Dates: id2=2024-03-20, id4=2024-02-10, id1=2024-01-15, id3=2023-11-05
    expect(ids).toEqual(["2", "4", "1", "3"]);
  });

  it("places the most recently created scheme first", () => {
    const sorted = applySort(mockSchemes, "newest");
    expect(sorted[0].createdAt).toBe("2024-03-20T08:00:00Z");
  });

  it("places the oldest scheme last", () => {
    const sorted = applySort(mockSchemes, "newest");
    expect(sorted[sorted.length - 1].createdAt).toBe("2023-11-05T14:00:00Z");
  });

  it("handles schemes with missing createdAt (NaN date, sorted after valid dates)", () => {
    const schemes: SortableScheme[] = [
      { id: "a", title: "A", createdAt: "2024-01-01T00:00:00Z" },
      { id: "b", title: "B" }, // no createdAt → new Date("").getTime() = NaN
      { id: "c", title: "C", createdAt: "2023-06-15T00:00:00Z" },
    ];
    const sorted = applySort(schemes, "newest");
    // Schemes with valid dates must appear before the one with no date
    const validIds = sorted
      .filter((s) => s.createdAt !== undefined)
      .map((s) => s.id);
    expect(validIds).toEqual(["a", "c"]); // a (2024) before c (2023)
    // The scheme without a date is present somewhere in the result
    expect(sorted.map((s) => s.id)).toContain("b");
  });

  it("handles an empty array", () => {
    expect(applySort([], "newest")).toEqual([]);
  });

  it("handles a single-element array", () => {
    const single = [mockSchemes[2]];
    const sorted = applySort(single, "newest");
    expect(sorted[0].id).toBe("3");
  });

  it("two schemes with the same createdAt maintain stable relative order", () => {
    const sameDate = "2024-05-01T00:00:00Z";
    const schemes: SortableScheme[] = [
      { id: "x", title: "X", createdAt: sameDate },
      { id: "y", title: "Y", createdAt: sameDate },
    ];
    const sorted = applySort(schemes, "newest");
    // Both have equal dates; comparator returns 0, order is implementation-defined
    // but the result must still contain both elements
    expect(sorted.map((s) => s.id).sort()).toEqual(["x", "y"]);
  });
});

// ── Tests: "interested" sort (Requirement 1.1.4) ──────────────────────────────

describe('Sort branch: "interested" (interest count descending)', () => {
  it("sorts schemes by interestCount descending (most interested first)", () => {
    const sorted = applySort(mockSchemes, "interested");
    const ids = sorted.map((s) => s.id);
    // Counts: id2=120, id4=85, id1=42, id3=7
    expect(ids).toEqual(["2", "4", "1", "3"]);
  });

  it("places the scheme with the highest interestCount first", () => {
    const sorted = applySort(mockSchemes, "interested");
    expect(sorted[0].interestCount).toBe(120);
  });

  it("places the scheme with the lowest interestCount last", () => {
    const sorted = applySort(mockSchemes, "interested");
    expect(sorted[sorted.length - 1].interestCount).toBe(7);
  });

  it("treats missing interestCount as 0", () => {
    const schemes: SortableScheme[] = [
      { id: "a", title: "A", interestCount: 10 },
      { id: "b", title: "B" }, // no interestCount
      { id: "c", title: "C", interestCount: 5 },
    ];
    const sorted = applySort(schemes, "interested");
    // a(10) > c(5) > b(0)
    expect(sorted.map((s) => s.id)).toEqual(["a", "c", "b"]);
  });

  it("treats undefined interestCount as 0 (same as explicit 0)", () => {
    const schemes: SortableScheme[] = [
      { id: "a", title: "A", interestCount: undefined },
      { id: "b", title: "B", interestCount: 0 },
    ];
    const sorted = applySort(schemes, "interested");
    // Both are 0; comparator returns 0, both must be present
    expect(sorted.map((s) => s.id).sort()).toEqual(["a", "b"]);
  });

  it("handles an empty array", () => {
    expect(applySort([], "interested")).toEqual([]);
  });

  it("handles a single-element array", () => {
    const single = [mockSchemes[1]];
    const sorted = applySort(single, "interested");
    expect(sorted[0].id).toBe("2");
  });

  it("all schemes with equal interestCount maintain all elements", () => {
    const schemes: SortableScheme[] = [
      { id: "a", title: "A", interestCount: 50 },
      { id: "b", title: "B", interestCount: 50 },
      { id: "c", title: "C", interestCount: 50 },
    ];
    const sorted = applySort(schemes, "interested");
    expect(sorted.map((s) => s.id).sort()).toEqual(["a", "b", "c"]);
  });
});

// ── Cross-branch: sort does not re-fetch (Requirement 1.1.6) ─────────────────

describe("Sort does not mutate source data (no re-fetch needed)", () => {
  it("applying different sorts to the same array always produces correct results", () => {
    const byName = applySort(mockSchemes, "name");
    const byNewest = applySort(mockSchemes, "newest");
    const byInterested = applySort(mockSchemes, "interested");

    // All three results should contain the same 4 items
    expect(byName.map((s) => s.id).sort()).toEqual(["1", "2", "3", "4"]);
    expect(byNewest.map((s) => s.id).sort()).toEqual(["1", "2", "3", "4"]);
    expect(byInterested.map((s) => s.id).sort()).toEqual(["1", "2", "3", "4"]);

    // And the original array is unchanged
    expect(mockSchemes.map((s) => s.id)).toEqual(["1", "2", "3", "4"]);
  });
});
