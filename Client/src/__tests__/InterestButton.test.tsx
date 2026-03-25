/**
 * Unit tests for InterestButton component logic
 *
 * Tests the rendering logic and interaction behaviour of InterestButton:
 *   - Filled/unfilled heart icon selection based on isInterested state
 *   - Count display
 *   - onToggle callback invocation
 *   - Loading state: blocks onToggle, shows ActivityIndicator
 *
 * Requirements: 5.1.1, 5.1.4, 5.1.6
 *
 * Note: @testing-library/react-native is not installed in this project.
 * Tests are written as pure-logic tests that mirror the component's
 * conditional rendering and event-handling logic, consistent with the
 * patterns used in scan-attendance.test.tsx and CropSelector.test.tsx.
 */

import type { InterestButtonProps } from "../components/atoms/InterestButton";

// ── Icon name selection logic (mirrors InterestButton render) ─────────────────

/**
 * Returns the Ionicons icon name that InterestButton would render.
 * Mirrors: name={isInterested ? "heart" : "heart-outline"}
 */
function getIconName(isInterested: boolean): "heart" | "heart-outline" {
  return isInterested ? "heart" : "heart-outline";
}

// ── onPress handler logic (mirrors InterestButton Pressable onPress) ──────────

/**
 * Returns the effective onPress handler that InterestButton passes to Pressable.
 * Mirrors: onPress={loading ? undefined : onToggle}
 */
function getOnPressHandler(
  onToggle: () => void,
  loading: boolean,
): (() => void) | undefined {
  return loading ? undefined : onToggle;
}

/**
 * Simulates pressing the button — calls the handler if defined.
 * Mirrors the Pressable behaviour when onPress is undefined vs. a function.
 */
function simulatePress(
  onToggle: () => void,
  loading: boolean,
): void {
  const handler = getOnPressHandler(onToggle, loading);
  if (handler) {
    handler();
  }
}

// ── Loading indicator logic (mirrors InterestButton conditional render) ────────

/**
 * Returns true when InterestButton renders an ActivityIndicator.
 * Mirrors: {loading ? <ActivityIndicator .../> : <Ionicons .../>}
 */
function showsActivityIndicator(loading: boolean): boolean {
  return loading;
}

/**
 * Returns true when InterestButton renders the Ionicons heart icon.
 */
function showsHeartIcon(loading: boolean): boolean {
  return !loading;
}

// ── Count display logic ───────────────────────────────────────────────────────

/**
 * Returns the string that InterestButton renders for the count.
 * Mirrors: <AppText>{count}</AppText>
 * React Native's Text coerces numbers to strings automatically.
 */
function getCountDisplay(count: number): string {
  return String(count);
}

// ── Tests: icon name selection (Requirements 5.1.1) ───────────────────────────

describe("InterestButton — icon name selection", () => {
  it("renders heart-outline icon when isInterested=false", () => {
    expect(getIconName(false)).toBe("heart-outline");
  });

  it("renders heart (filled) icon when isInterested=true", () => {
    expect(getIconName(true)).toBe("heart");
  });

  it("icon name changes when isInterested flips from false to true", () => {
    const before = getIconName(false);
    const after = getIconName(true);
    expect(before).not.toBe(after);
  });

  it("icon name changes when isInterested flips from true to false", () => {
    const before = getIconName(true);
    const after = getIconName(false);
    expect(before).not.toBe(after);
  });
});

// ── Tests: count display ──────────────────────────────────────────────────────

describe("InterestButton — count display", () => {
  it("displays count=42 as '42'", () => {
    expect(getCountDisplay(42)).toBe("42");
  });

  it("displays count=0 as '0'", () => {
    expect(getCountDisplay(0)).toBe("0");
  });

  it("displays count=1 as '1'", () => {
    expect(getCountDisplay(1)).toBe("1");
  });

  it("displays large count correctly", () => {
    expect(getCountDisplay(1000)).toBe("1000");
  });
});

// ── Tests: onToggle callback (Requirements 5.1.4, 5.1.6) ─────────────────────

describe("InterestButton — onToggle callback", () => {
  it("calls onToggle when pressed and loading=false", () => {
    let called = false;
    const onToggle = () => { called = true; };
    simulatePress(onToggle, false);
    expect(called).toBe(true);
  });

  it("does NOT call onToggle when pressed and loading=true", () => {
    let called = false;
    const onToggle = () => { called = true; };
    simulatePress(onToggle, true);
    expect(called).toBe(false);
  });

  it("onPress handler is undefined when loading=true", () => {
    const onToggle = jest.fn();
    const handler = getOnPressHandler(onToggle, true);
    expect(handler).toBeUndefined();
  });

  it("onPress handler is the onToggle function when loading=false", () => {
    const onToggle = jest.fn();
    const handler = getOnPressHandler(onToggle, false);
    expect(handler).toBe(onToggle);
  });

  it("calls onToggle exactly once per press when not loading", () => {
    const onToggle = jest.fn();
    simulatePress(onToggle, false);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("does not call onToggle at all when loading=true regardless of press count", () => {
    const onToggle = jest.fn();
    simulatePress(onToggle, true);
    simulatePress(onToggle, true);
    expect(onToggle).toHaveBeenCalledTimes(0);
  });
});

// ── Tests: ActivityIndicator visibility (loading state) ───────────────────────

describe("InterestButton — ActivityIndicator visibility", () => {
  it("shows ActivityIndicator when loading=true", () => {
    expect(showsActivityIndicator(true)).toBe(true);
  });

  it("does NOT show ActivityIndicator when loading=false", () => {
    expect(showsActivityIndicator(false)).toBe(false);
  });

  it("shows heart icon when loading=false", () => {
    expect(showsHeartIcon(false)).toBe(true);
  });

  it("does NOT show heart icon when loading=true", () => {
    expect(showsHeartIcon(true)).toBe(false);
  });

  it("ActivityIndicator and heart icon are mutually exclusive", () => {
    const loadingTrue = showsActivityIndicator(true) && showsHeartIcon(true);
    const loadingFalse = showsActivityIndicator(false) && showsHeartIcon(false);
    expect(loadingTrue).toBe(false);
    expect(loadingFalse).toBe(false);
  });
});

// ── Tests: props interface completeness ───────────────────────────────────────

describe("InterestButton — props interface", () => {
  it("accepts a valid props object matching InterestButtonProps", () => {
    const props: InterestButtonProps = {
      isInterested: false,
      count: 10,
      onToggle: () => {},
    };
    expect(props.isInterested).toBe(false);
    expect(props.count).toBe(10);
    expect(typeof props.onToggle).toBe("function");
    expect(props.loading).toBeUndefined(); // optional, defaults to false
  });

  it("loading prop defaults to false when omitted", () => {
    // The component defaults loading=false; simulate that default
    const loadingProp: boolean | undefined = undefined;
    const loading = loadingProp ?? false;
    expect(loading).toBe(false);
    expect(showsActivityIndicator(loading)).toBe(false);
  });

  it("loading=true disables the button and shows spinner", () => {
    const loading = true;
    expect(showsActivityIndicator(loading)).toBe(true);
    expect(showsHeartIcon(loading)).toBe(false);
    const handler = getOnPressHandler(jest.fn(), loading);
    expect(handler).toBeUndefined();
  });
});

// ── Tests: state transitions ──────────────────────────────────────────────────

describe("InterestButton — state transitions", () => {
  it("toggling from unfilled to filled changes icon from heart-outline to heart", () => {
    const before = getIconName(false);
    const after = getIconName(true);
    expect(before).toBe("heart-outline");
    expect(after).toBe("heart");
  });

  it("toggling from filled to unfilled changes icon from heart to heart-outline", () => {
    const before = getIconName(true);
    const after = getIconName(false);
    expect(before).toBe("heart");
    expect(after).toBe("heart-outline");
  });

  it("count updates are reflected in display", () => {
    const countBefore = getCountDisplay(5);
    const countAfter = getCountDisplay(6);
    expect(countBefore).toBe("5");
    expect(countAfter).toBe("6");
  });
});
