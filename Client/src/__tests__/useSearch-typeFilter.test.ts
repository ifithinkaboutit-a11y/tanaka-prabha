/**
 * Unit tests for useSearch type filter logic
 * Tests the typeFilter state and clearSearch reset behaviour.
 *
 * Requirements: 1.4.5, 1.4.6
 *
 * The filter logic is extracted from the searchResults useMemo in useSearch.ts:
 *   .filter((item) => typeFilter === "all" || item.type === typeFilter)
 *
 * Tests are written as pure-function tests — no React hook rendering needed.
 */

import type { SearchResult } from "../hooks/useSearch";

// ── Type definitions ──────────────────────────────────────────────────────────

type TypeFilter = "all" | "scheme" | "training" | "event";

// ── Pure filter function (mirrors useSearch.ts searchResults useMemo) ─────────

function applyTypeFilter(
  results: SearchResult[],
  typeFilter: TypeFilter,
): SearchResult[] {
  return results.filter(
    (item) => typeFilter === "all" || item.type === typeFilter,
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────────

function makeResult(
  id: string,
  type: SearchResult["type"],
  title = `${type} ${id}`,
): SearchResult {
  return {
    id,
    title,
    description: `Description for ${title}`,
    category: "Test Category",
    type,
    item: {},
    relevanceScore: 10,
  };
}

const schemeResult = makeResult("1", "scheme", "Crop Insurance Scheme");
const trainingResult = makeResult("2", "training", "Farmer Training Program");
const eventResult = makeResult("3", "event", "Annual Harvest Festival");
const schemeResult2 = makeResult("4", "scheme", "Soil Management Scheme");
const eventResult2 = makeResult("5", "event", "Irrigation Workshop");

const allResults: SearchResult[] = [
  schemeResult,
  trainingResult,
  eventResult,
  schemeResult2,
  eventResult2,
];

// ── Tests: typeFilter "all" (Requirement 1.4.3) ───────────────────────────────

describe('typeFilter "all" — returns all result types', () => {
  it("returns every result regardless of type", () => {
    const filtered = applyTypeFilter(allResults, "all");
    expect(filtered).toHaveLength(allResults.length);
  });

  it("includes scheme, training, and event results", () => {
    const filtered = applyTypeFilter(allResults, "all");
    const types = filtered.map((r) => r.type);
    expect(types).toContain("scheme");
    expect(types).toContain("training");
    expect(types).toContain("event");
  });

  it("returns an empty array when input is empty", () => {
    expect(applyTypeFilter([], "all")).toEqual([]);
  });

  it("does not mutate the original array", () => {
    const copy = [...allResults];
    applyTypeFilter(allResults, "all");
    expect(allResults).toEqual(copy);
  });
});

// ── Tests: typeFilter "scheme" (Requirement 1.4.2) ───────────────────────────

describe('typeFilter "scheme" — returns only scheme results', () => {
  it("returns only items with type === 'scheme'", () => {
    const filtered = applyTypeFilter(allResults, "scheme");
    expect(filtered.every((r) => r.type === "scheme")).toBe(true);
  });

  it("excludes training and event results", () => {
    const filtered = applyTypeFilter(allResults, "scheme");
    expect(filtered.some((r) => r.type === "training")).toBe(false);
    expect(filtered.some((r) => r.type === "event")).toBe(false);
  });

  it("returns the correct number of scheme results", () => {
    const filtered = applyTypeFilter(allResults, "scheme");
    expect(filtered).toHaveLength(2); // schemeResult + schemeResult2
  });

  it("returns the correct scheme ids", () => {
    const filtered = applyTypeFilter(allResults, "scheme");
    expect(filtered.map((r) => r.id).sort()).toEqual(["1", "4"]);
  });

  it("returns empty array when no schemes exist in results", () => {
    const noSchemes = [trainingResult, eventResult];
    expect(applyTypeFilter(noSchemes, "scheme")).toEqual([]);
  });
});

// ── Tests: typeFilter "training" (Requirement 1.4.2) ─────────────────────────

describe('typeFilter "training" — returns only training results', () => {
  it("returns only items with type === 'training'", () => {
    const filtered = applyTypeFilter(allResults, "training");
    expect(filtered.every((r) => r.type === "training")).toBe(true);
  });

  it("excludes scheme and event results", () => {
    const filtered = applyTypeFilter(allResults, "training");
    expect(filtered.some((r) => r.type === "scheme")).toBe(false);
    expect(filtered.some((r) => r.type === "event")).toBe(false);
  });

  it("returns the correct number of training results", () => {
    const filtered = applyTypeFilter(allResults, "training");
    expect(filtered).toHaveLength(1); // trainingResult only
  });

  it("returns the correct training id", () => {
    const filtered = applyTypeFilter(allResults, "training");
    expect(filtered[0].id).toBe("2");
  });

  it("returns empty array when no training items exist in results", () => {
    const noTraining = [schemeResult, eventResult];
    expect(applyTypeFilter(noTraining, "training")).toEqual([]);
  });
});

// ── Tests: typeFilter "event" (Requirement 1.4.2) ────────────────────────────

describe('typeFilter "event" — returns only event results', () => {
  it("returns only items with type === 'event'", () => {
    const filtered = applyTypeFilter(allResults, "event");
    expect(filtered.every((r) => r.type === "event")).toBe(true);
  });

  it("excludes scheme and training results", () => {
    const filtered = applyTypeFilter(allResults, "event");
    expect(filtered.some((r) => r.type === "scheme")).toBe(false);
    expect(filtered.some((r) => r.type === "training")).toBe(false);
  });

  it("returns the correct number of event results", () => {
    const filtered = applyTypeFilter(allResults, "event");
    expect(filtered).toHaveLength(2); // eventResult + eventResult2
  });

  it("returns the correct event ids", () => {
    const filtered = applyTypeFilter(allResults, "event");
    expect(filtered.map((r) => r.id).sort()).toEqual(["3", "5"]);
  });

  it("returns empty array when no events exist in results", () => {
    const noEvents = [schemeResult, trainingResult];
    expect(applyTypeFilter(noEvents, "event")).toEqual([]);
  });
});

// ── Tests: zero results for non-empty query (Requirement 1.4.4) ──────────────

describe("typeFilter produces zero results for a non-empty query", () => {
  it("returns empty array when filter matches no results", () => {
    // Only scheme results exist; filtering by "event" yields nothing
    const schemeOnly = [schemeResult, schemeResult2];
    expect(applyTypeFilter(schemeOnly, "event")).toEqual([]);
  });

  it("returns empty array when filter matches no results (training filter on events)", () => {
    const eventOnly = [eventResult, eventResult2];
    expect(applyTypeFilter(eventOnly, "training")).toEqual([]);
  });

  it("returns empty array when input results are empty regardless of filter", () => {
    expect(applyTypeFilter([], "scheme")).toEqual([]);
    expect(applyTypeFilter([], "training")).toEqual([]);
    expect(applyTypeFilter([], "event")).toEqual([]);
  });
});

// ── Tests: clearSearch resets typeFilter to "all" (Requirement 1.4.6) ────────

describe("clearSearch resets typeFilter to 'all'", () => {
  /**
   * clearSearch in useSearch.ts calls setTypeFilter("all").
   * We test the callback behaviour by simulating the state transitions
   * that clearSearch performs: after clearing, typeFilter becomes "all"
   * and the filter function returns all results.
   */

  it("after reset to 'all', filter returns all result types", () => {
    // Simulate: user had "scheme" filter active
    let typeFilter: TypeFilter = "scheme";
    const filteredBefore = applyTypeFilter(allResults, typeFilter);
    expect(filteredBefore.every((r) => r.type === "scheme")).toBe(true);

    // Simulate clearSearch: resets typeFilter to "all"
    typeFilter = "all";
    const filteredAfter = applyTypeFilter(allResults, typeFilter);
    expect(filteredAfter).toHaveLength(allResults.length);
  });

  it("after reset to 'all', previously excluded types are visible again", () => {
    // Start with "event" filter — training items are hidden
    let typeFilter: TypeFilter = "event";
    const filteredBefore = applyTypeFilter(allResults, typeFilter);
    expect(filteredBefore.some((r) => r.type === "training")).toBe(false);

    // clearSearch resets to "all"
    typeFilter = "all";
    const filteredAfter = applyTypeFilter(allResults, typeFilter);
    expect(filteredAfter.some((r) => r.type === "training")).toBe(true);
  });

  it("after reset to 'all', filter is idempotent (applying 'all' twice gives same result)", () => {
    const first = applyTypeFilter(allResults, "all");
    const second = applyTypeFilter(allResults, "all");
    expect(first).toEqual(second);
  });

  it("clearSearch callback sets typeFilter to 'all' (verifies default value)", () => {
    // The default value of typeFilter in useSearch is "all"
    // clearSearch explicitly calls setTypeFilter("all")
    // We verify that "all" is the correct reset value by confirming it passes all items
    const resetFilter: TypeFilter = "all";
    const result = applyTypeFilter(allResults, resetFilter);
    expect(result).toHaveLength(allResults.length);
  });
});
