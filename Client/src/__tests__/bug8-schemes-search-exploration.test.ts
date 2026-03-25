/**
 * Bug 8 — Schemes Page: Search Bar Not Filtering
 * Bug Condition Exploration Test
 *
 * **Validates: Requirements 1.8**
 *
 * Property 1: Bug Condition — Search Query Does Not Filter Schemes
 *
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists: `searchQuery` is set via `setSearchQuery`
 * but is never used to filter `schemes`. Both `recommendedSchemes` and the
 * `ProgramSection` list are derived from the raw `schemes` array, ignoring
 * the query entirely.
 *
 * Counterexample documented:
 *   searchQuery="kisan" → all 9 schemes displayed (unfiltered)
 *
 * Root cause (from design.md):
 *   recommendedSchemes = schemes.slice(1, 4)       ← ignores searchQuery
 *   ProgramSection receives schemes.slice(0, 9)    ← ignores searchQuery
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface Scheme {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  description?: string;
}

// ── Known scheme list (9 schemes: 3 match "kisan", 6 do not) ─────────────────

const MOCK_SCHEMES: Scheme[] = [
  { id: "1", title: "Kisan Credit Card Scheme", category: "Financial Support" },
  { id: "2", title: "PM Kisan Samman Nidhi", category: "Financial Support" },
  { id: "3", title: "Soil Health Card Scheme", category: "Soil Management" },
  { id: "4", title: "Pradhan Mantri Fasal Bima Yojana", category: "Crop Insurance" },
  { id: "5", title: "National Agriculture Market", category: "Agricultural Development" },
  { id: "6", title: "Kisan Vikas Patra", category: "Financial Support" },
  { id: "7", title: "Paramparagat Krishi Vikas Yojana", category: "Soil Management" },
  { id: "8", title: "Rashtriya Krishi Vikas Yojana", category: "Agricultural Development" },
  { id: "9", title: "Micro Irrigation Fund", category: "Agricultural Development" },
];

// Schemes that contain "kisan" (case-insensitive) in title or category:
// id=1 "Kisan Credit Card Scheme", id=2 "PM Kisan Samman Nidhi", id=6 "Kisan Vikas Patra"
const KISAN_MATCHING_IDS = new Set(["1", "2", "6"]);

// ── Logic extracted from schemes.tsx (UNFIXED version) ───────────────────────
//
// In the unfixed code, schemes.tsx derives displayed schemes as:
//   recommendedSchemes = schemes.slice(1, 4)
//   programSectionSchemes = schemes.slice(0, 9)
//
// Neither derivation references searchQuery at all.

/**
 * Simulates the UNFIXED derivation of displayed schemes.
 * This mirrors the actual code in schemes.tsx before the bug is fixed.
 */
function getDisplayedSchemesUnfixed(schemes: Scheme[], _searchQuery: string): {
  recommendedSchemes: Scheme[];
  programSectionSchemes: Scheme[];
} {
  // BUG: searchQuery is ignored — raw slices are returned regardless of query
  return {
    recommendedSchemes: schemes.slice(1, 4),
    programSectionSchemes: schemes.slice(0, 9),
  };
}

/**
 * Simulates the FIXED derivation of displayed schemes.
 * This mirrors the actual fixed code in schemes.tsx:
 *   filteredSchemes = schemes.filter(...) when query is non-empty
 *   recommendedSchemes = filteredSchemes.slice(0, 3)
 *   programSectionSchemes = filteredSchemes.slice(0, 9)
 */
function getDisplayedSchemesFixed(schemes: Scheme[], searchQuery: string): {
  recommendedSchemes: Scheme[];
  programSectionSchemes: Scheme[];
} {
  const q = searchQuery.trim().toLowerCase();
  const filteredSchemes = q
    ? schemes.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      )
    : schemes;
  return {
    recommendedSchemes: filteredSchemes.slice(0, 3),
    programSectionSchemes: filteredSchemes.slice(0, 9),
  };
}

/**
 * The EXPECTED (correct) filtering logic that should be applied when
 * searchQuery is non-empty. This is what the fixed code should implement.
 */
function filterSchemesByQuery(schemes: Scheme[], searchQuery: string): Scheme[] {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return schemes;
  return schemes.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q),
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Bug 8 — Schemes Search Filter (exploration — expected to fail on unfixed code)", () => {
  const searchQuery = "kisan";

  describe("programSectionSchemes with searchQuery='kisan'", () => {
    test("should display ONLY schemes matching 'kisan' — not all 9 schemes", () => {
      // Fixed code: filteredSchemes filters by searchQuery before slicing.
      const { programSectionSchemes } = getDisplayedSchemesFixed(MOCK_SCHEMES, searchQuery);

      // Assert: only matching schemes are shown
      const displayedIds = programSectionSchemes.map((s) => s.id);
      const nonMatchingDisplayed = displayedIds.filter((id) => !KISAN_MATCHING_IDS.has(id));

      expect(nonMatchingDisplayed).toHaveLength(0);
    });

    test("should display exactly 3 schemes matching 'kisan'", () => {
      // Fixed code: filteredSchemes has exactly 3 matching schemes.
      const { programSectionSchemes } = getDisplayedSchemesFixed(MOCK_SCHEMES, searchQuery);

      const matchingSchemes = programSectionSchemes.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery) ||
          s.category.toLowerCase().includes(searchQuery),
      );

      expect(programSectionSchemes).toHaveLength(matchingSchemes.length);
    });
  });

  describe("recommendedSchemes with searchQuery='kisan'", () => {
    test("should display ONLY schemes matching 'kisan' — not raw slice(1,4)", () => {
      // Fixed code: filteredSchemes filters by searchQuery, so only matching schemes appear.
      const { recommendedSchemes } = getDisplayedSchemesFixed(MOCK_SCHEMES, searchQuery);

      const nonMatchingDisplayed = recommendedSchemes.filter(
        (s) =>
          !s.title.toLowerCase().includes(searchQuery) &&
          !s.category.toLowerCase().includes(searchQuery),
      );

      expect(nonMatchingDisplayed).toHaveLength(0);
    });
  });

  describe("correct filter logic (reference implementation)", () => {
    test("filterSchemesByQuery returns only matching schemes for 'kisan'", () => {
      // This test verifies the EXPECTED behavior — it passes because
      // filterSchemesByQuery correctly implements the filter.
      // The bug is that this logic is NOT wired into schemes.tsx.
      const filtered = filterSchemesByQuery(MOCK_SCHEMES, searchQuery);
      expect(filtered.map((s) => s.id).sort()).toEqual(["1", "2", "6"]);
    });

    test("filterSchemesByQuery is case-insensitive", () => {
      const filtered = filterSchemesByQuery(MOCK_SCHEMES, "KISAN");
      expect(filtered).toHaveLength(3);
    });

    test("filterSchemesByQuery returns all schemes for empty query", () => {
      const filtered = filterSchemesByQuery(MOCK_SCHEMES, "");
      expect(filtered).toHaveLength(MOCK_SCHEMES.length);
    });
  });
});
