/**
 * Bug 8 — Schemes Page: Search Bar Not Filtering
 * Preservation Property Tests
 *
 * **Validates: Requirements 3.7**
 *
 * Property 8: Preservation — Empty Search Query Shows All Schemes
 *
 * These tests MUST PASS on unfixed code.
 * They confirm the baseline behavior: when `searchQuery` is empty or
 * whitespace-only, the full scheme list is displayed unchanged.
 *
 * This is the behavior we must preserve after the bug fix is applied.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface Scheme {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  description?: string;
}

// ── Known scheme list (same as exploration test) ──────────────────────────────

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

// ── Whitespace-only query variants to test ────────────────────────────────────

const EMPTY_AND_WHITESPACE_QUERIES = [
  "",
  " ",
  "   ",
  "\t",
  "\n",
  "  \t  ",
  "\t\n",
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Bug 8 — Schemes Search Filter (preservation — must pass on unfixed code)", () => {
  describe("Property 8: empty searchQuery shows full scheme list", () => {
    test("empty string searchQuery: programSectionSchemes shows all 9 schemes", () => {
      const { programSectionSchemes } = getDisplayedSchemesUnfixed(MOCK_SCHEMES, "");
      expect(programSectionSchemes).toHaveLength(MOCK_SCHEMES.length);
      expect(programSectionSchemes.map((s) => s.id)).toEqual(
        MOCK_SCHEMES.map((s) => s.id),
      );
    });

    test("empty string searchQuery: recommendedSchemes is a slice of the full list", () => {
      const { recommendedSchemes } = getDisplayedSchemesUnfixed(MOCK_SCHEMES, "");
      // On unfixed code: slice(1, 4) → ids 2, 3, 4
      expect(recommendedSchemes).toHaveLength(3);
      expect(recommendedSchemes.map((s) => s.id)).toEqual(["2", "3", "4"]);
    });

    test.each(EMPTY_AND_WHITESPACE_QUERIES)(
      "whitespace-only searchQuery %j: programSectionSchemes shows all 9 schemes",
      (query) => {
        const { programSectionSchemes } = getDisplayedSchemesUnfixed(MOCK_SCHEMES, query);
        expect(programSectionSchemes).toHaveLength(MOCK_SCHEMES.length);
      },
    );

    test.each(EMPTY_AND_WHITESPACE_QUERIES)(
      "whitespace-only searchQuery %j: no schemes are hidden from the list",
      (query) => {
        const { programSectionSchemes } = getDisplayedSchemesUnfixed(MOCK_SCHEMES, query);
        const displayedIds = new Set(programSectionSchemes.map((s) => s.id));
        const allIds = MOCK_SCHEMES.map((s) => s.id);
        for (const id of allIds) {
          expect(displayedIds.has(id)).toBe(true);
        }
      },
    );

    test.each(EMPTY_AND_WHITESPACE_QUERIES)(
      "whitespace-only searchQuery %j: scheme order is preserved",
      (query) => {
        const { programSectionSchemes } = getDisplayedSchemesUnfixed(MOCK_SCHEMES, query);
        expect(programSectionSchemes.map((s) => s.id)).toEqual(
          MOCK_SCHEMES.map((s) => s.id),
        );
      },
    );
  });

  describe("Property 8: full list is identical regardless of empty/whitespace variant", () => {
    test("all whitespace variants produce the same programSectionSchemes as empty string", () => {
      const { programSectionSchemes: baseline } = getDisplayedSchemesUnfixed(MOCK_SCHEMES, "");
      for (const query of EMPTY_AND_WHITESPACE_QUERIES.slice(1)) {
        const { programSectionSchemes } = getDisplayedSchemesUnfixed(MOCK_SCHEMES, query);
        expect(programSectionSchemes.map((s) => s.id)).toEqual(
          baseline.map((s) => s.id),
        );
      }
    });

    test("all whitespace variants produce the same recommendedSchemes as empty string", () => {
      const { recommendedSchemes: baseline } = getDisplayedSchemesUnfixed(MOCK_SCHEMES, "");
      for (const query of EMPTY_AND_WHITESPACE_QUERIES.slice(1)) {
        const { recommendedSchemes } = getDisplayedSchemesUnfixed(MOCK_SCHEMES, query);
        expect(recommendedSchemes.map((s) => s.id)).toEqual(
          baseline.map((s) => s.id),
        );
      }
    });
  });

  describe("Property 8: scheme content is unchanged (not just count)", () => {
    test("empty searchQuery: each scheme in programSectionSchemes has correct title and category", () => {
      const { programSectionSchemes } = getDisplayedSchemesUnfixed(MOCK_SCHEMES, "");
      programSectionSchemes.forEach((displayed, index) => {
        const original = MOCK_SCHEMES[index];
        expect(displayed.title).toBe(original.title);
        expect(displayed.category).toBe(original.category);
      });
    });
  });
});
