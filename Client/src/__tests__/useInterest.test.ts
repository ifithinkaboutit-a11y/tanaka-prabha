/**
 * Tests for useInterest toggle logic
 *
 * Tests are written as pure logic tests (no component rendering).
 * The toggle state machine is extracted and tested directly.
 *
 * Task 13.3 — Property test: double-toggle idempotency
 *   Validates: Requirements 5.1.3, 5.1.5
 *
 * Task 13.4 — Unit tests: optimistic revert on API failure
 *   Requirements: 5.1.10
 */

import * as fc from "fast-check";

// ── Pure toggle state machine (mirrors useInterest hook logic) ────────────────

interface InterestState {
  isInterested: boolean;
  interestCount: number;
}

/**
 * Compute the optimistic state after a toggle (before API response).
 */
function applyOptimisticToggle(state: InterestState): InterestState {
  const nextInterested = !state.isInterested;
  const nextCount = nextInterested
    ? state.interestCount + 1
    : Math.max(0, state.interestCount - 1);
  return { isInterested: nextInterested, interestCount: nextCount };
}

/**
 * Apply the API response count to the optimistic state.
 */
function applyApiResponse(
  state: InterestState,
  apiCount: number
): InterestState {
  return { ...state, interestCount: apiCount };
}

/**
 * Revert to the pre-toggle snapshot on API failure.
 */
function revertToggle(
  _current: InterestState,
  snapshot: InterestState
): InterestState {
  return snapshot;
}

/**
 * Simulate a full toggle cycle:
 *   1. Snapshot pre-toggle state
 *   2. Apply optimistic update
 *   3. Either apply API response or revert
 */
async function simulateToggle(
  state: InterestState,
  apiCall: (nextInterested: boolean) => Promise<number>
): Promise<InterestState> {
  const snapshot = { ...state };
  const optimistic = applyOptimisticToggle(state);

  try {
    const apiCount = await apiCall(optimistic.isInterested);
    return applyApiResponse(optimistic, apiCount);
  } catch {
    return revertToggle(optimistic, snapshot);
  }
}

// ── Task 13.3: Property test — double-toggle idempotency ─────────────────────
// Validates: Requirements 5.1.3, 5.1.5

describe("useInterest toggle — Property 1: double-toggle returns to original state", () => {
  /**
   * **Validates: Requirements 5.1.3, 5.1.5**
   *
   * For any initial (isInterested, interestCount) pair, toggling twice with
   * a successful API that returns count ± 1 must restore the original state.
   */
  it("double-toggle is idempotent when API succeeds", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Constrain to valid states: if interested, count must be >= 1
        // (isInterested=true with count=0 is an inconsistent state that cannot
        //  occur in practice — you cannot be interested with 0 interest count)
        fc.boolean().chain((interested) =>
          fc.integer({ min: interested ? 1 : 0, max: 1000 }).map((count) => ({
            interested,
            count,
          }))
        ),
        async ({ interested: initialInterested, count: initialCount }) => {
          const initial: InterestState = {
            isInterested: initialInterested,
            interestCount: initialCount,
          };

          // First toggle: API returns count adjusted by +1 or -1
          const afterFirst = await simulateToggle(initial, async (nextInterested) => {
            return nextInterested ? initialCount + 1 : Math.max(0, initialCount - 1);
          });

          // Second toggle: API returns count back to original
          const afterSecond = await simulateToggle(afterFirst, async (nextInterested) => {
            return nextInterested
              ? afterFirst.interestCount + 1
              : Math.max(0, afterFirst.interestCount - 1);
          });

          // After two toggles, state must match original
          return (
            afterSecond.isInterested === initial.isInterested &&
            afterSecond.interestCount === initial.interestCount
          );
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * **Validates: Requirements 5.1.3, 5.1.5**
   *
   * The optimistic count never goes below zero regardless of initial count.
   */
  it("interestCount never goes below zero after toggle", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        (count) => {
          const state: InterestState = { isInterested: true, interestCount: count };
          const next = applyOptimisticToggle(state);
          return next.interestCount >= 0;
        }
      ),
      { numRuns: 500 }
    );
  });
});

// ── Task 13.4: Unit tests — optimistic revert on API failure ─────────────────
// Requirements: 5.1.10

describe("useInterest — optimistic revert on API failure", () => {
  it("reverts isInterested to false when addInterest API fails", async () => {
    const initial: InterestState = { isInterested: false, interestCount: 5 };

    const result = await simulateToggle(initial, async () => {
      throw new Error("Network error");
    });

    expect(result.isInterested).toBe(false);
  });

  it("reverts interestCount to original value when addInterest API fails", async () => {
    const initial: InterestState = { isInterested: false, interestCount: 5 };

    const result = await simulateToggle(initial, async () => {
      throw new Error("Network error");
    });

    expect(result.interestCount).toBe(5);
  });

  it("reverts isInterested to true when removeInterest API fails", async () => {
    const initial: InterestState = { isInterested: true, interestCount: 10 };

    const result = await simulateToggle(initial, async () => {
      throw new Error("Server error");
    });

    expect(result.isInterested).toBe(true);
  });

  it("reverts interestCount to original value when removeInterest API fails", async () => {
    const initial: InterestState = { isInterested: true, interestCount: 10 };

    const result = await simulateToggle(initial, async () => {
      throw new Error("Server error");
    });

    expect(result.interestCount).toBe(10);
  });

  it("does not revert when API succeeds", async () => {
    const initial: InterestState = { isInterested: false, interestCount: 7 };

    const result = await simulateToggle(initial, async () => 8);

    expect(result.isInterested).toBe(true);
    expect(result.interestCount).toBe(8);
  });

  it("uses API-returned count (not optimistic count) on success", async () => {
    const initial: InterestState = { isInterested: false, interestCount: 7 };

    // API returns a different count than the optimistic +1
    const result = await simulateToggle(initial, async () => 42);

    expect(result.interestCount).toBe(42);
  });

  it("reverts both fields atomically — no partial state on failure", async () => {
    const initial: InterestState = { isInterested: true, interestCount: 3 };

    const result = await simulateToggle(initial, async () => {
      throw new Error("Timeout");
    });

    // Both fields must match the original snapshot
    expect(result.isInterested).toBe(initial.isInterested);
    expect(result.interestCount).toBe(initial.interestCount);
  });
});

// ── Additional unit tests for applyOptimisticToggle ───────────────────────────

describe("applyOptimisticToggle — state transitions", () => {
  it("increments count when toggling from not-interested to interested", () => {
    const state: InterestState = { isInterested: false, interestCount: 5 };
    const next = applyOptimisticToggle(state);
    expect(next.isInterested).toBe(true);
    expect(next.interestCount).toBe(6);
  });

  it("decrements count when toggling from interested to not-interested", () => {
    const state: InterestState = { isInterested: true, interestCount: 5 };
    const next = applyOptimisticToggle(state);
    expect(next.isInterested).toBe(false);
    expect(next.interestCount).toBe(4);
  });

  it("clamps count at 0 when removing interest from count of 0", () => {
    const state: InterestState = { isInterested: true, interestCount: 0 };
    const next = applyOptimisticToggle(state);
    expect(next.interestCount).toBe(0);
  });
});
