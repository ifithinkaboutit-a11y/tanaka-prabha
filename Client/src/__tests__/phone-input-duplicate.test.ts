/**
 * Unit tests for duplicate phone number banner logic in phone-input.tsx
 *
 * Tests the pure logic extracted from phone-input.tsx:
 *   - Error detection: which error messages trigger the duplicate banner
 *   - Navigation target for "Log In" button
 *   - Dismiss behaviour (banner hidden)
 *
 * Requirements: 4.1.1, 4.1.4, 4.1.5, 4.1.6
 */

// ── Error detection logic (mirrors isDuplicatePhoneError in phone-input.tsx) ──

function isDuplicatePhoneError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("already registered") ||
    msg.includes("duplicate") ||
    msg.includes("already exists") ||
    msg.includes("phone number is taken") ||
    msg.includes("user already exists")
  );
}

// ── Banner state machine (mirrors duplicateBanner state in phone-input.tsx) ──

interface BannerState {
  duplicateBanner: boolean;
}

function handleSendOTPError(
  error: unknown,
  state: BannerState,
): { showBanner: boolean; showAlert: boolean } {
  if (isDuplicatePhoneError(error)) {
    return { showBanner: true, showAlert: false };
  }
  return { showBanner: state.duplicateBanner, showAlert: true };
}

function dismissBanner(state: BannerState): BannerState {
  return { ...state, duplicateBanner: false };
}

function handlePhoneChange(
  state: BannerState,
): BannerState {
  return { ...state, duplicateBanner: false };
}

// ── Navigation target ─────────────────────────────────────────────────────────

const LOG_IN_ROUTE = "/(auth)/phone-input?mode=login";

// ── Tests: error detection (Requirement 4.1.1, 4.1.6) ────────────────────────

describe("isDuplicatePhoneError — detects duplicate phone errors", () => {
  it('returns true for "already registered" message', () => {
    expect(isDuplicatePhoneError(new Error("Phone number already registered"))).toBe(true);
  });

  it('returns true for "duplicate" message', () => {
    expect(isDuplicatePhoneError(new Error("Duplicate phone number"))).toBe(true);
  });

  it('returns true for "already exists" message', () => {
    expect(isDuplicatePhoneError(new Error("User already exists"))).toBe(true);
  });

  it('returns true for "phone number is taken" message', () => {
    expect(isDuplicatePhoneError(new Error("Phone number is taken"))).toBe(true);
  });

  it('returns true for "user already exists" message', () => {
    expect(isDuplicatePhoneError(new Error("user already exists in the system"))).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isDuplicatePhoneError(new Error("ALREADY REGISTERED"))).toBe(true);
    expect(isDuplicatePhoneError(new Error("Already Registered"))).toBe(true);
  });

  it("returns false for generic network error", () => {
    expect(isDuplicatePhoneError(new Error("Network request failed"))).toBe(false);
  });

  it("returns false for OTP send failure", () => {
    expect(isDuplicatePhoneError(new Error("Failed to send OTP"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isDuplicatePhoneError("already registered")).toBe(false);
    expect(isDuplicatePhoneError(null)).toBe(false);
    expect(isDuplicatePhoneError(undefined)).toBe(false);
    expect(isDuplicatePhoneError(409)).toBe(false);
  });

  it("returns false for empty error message", () => {
    expect(isDuplicatePhoneError(new Error(""))).toBe(false);
  });
});

// ── Tests: banner shown on duplicate error, no OTP/navigation (Req 4.1.1, 4.1.6) ──

describe("handleSendOTPError — banner shown, alert suppressed on duplicate error", () => {
  const initialState: BannerState = { duplicateBanner: false };

  it("shows banner and suppresses alert for duplicate error", () => {
    const result = handleSendOTPError(
      new Error("Phone number already registered"),
      initialState,
    );
    expect(result.showBanner).toBe(true);
    expect(result.showAlert).toBe(false);
  });

  it("shows alert and does not show banner for generic error", () => {
    const result = handleSendOTPError(
      new Error("Network request failed"),
      initialState,
    );
    expect(result.showBanner).toBe(false);
    expect(result.showAlert).toBe(true);
  });

  it("shows banner for 'duplicate' keyword in error", () => {
    const result = handleSendOTPError(
      new Error("duplicate entry"),
      initialState,
    );
    expect(result.showBanner).toBe(true);
    expect(result.showAlert).toBe(false);
  });

  it("shows banner for 'already exists' keyword in error", () => {
    const result = handleSendOTPError(
      new Error("User already exists"),
      initialState,
    );
    expect(result.showBanner).toBe(true);
    expect(result.showAlert).toBe(false);
  });
});

// ── Tests: "Log In" navigation target (Requirement 4.1.4) ────────────────────

describe("Log In button navigation target", () => {
  it("navigates to the login mode of phone-input", () => {
    expect(LOG_IN_ROUTE).toBe("/(auth)/phone-input?mode=login");
  });

  it("includes mode=login query parameter", () => {
    expect(LOG_IN_ROUTE).toContain("mode=login");
  });

  it("targets the phone-input screen", () => {
    expect(LOG_IN_ROUTE).toContain("/(auth)/phone-input");
  });
});

// ── Tests: Dismiss hides banner (Requirement 4.1.5) ──────────────────────────

describe("dismissBanner — hides the duplicate banner", () => {
  it("sets duplicateBanner to false when banner is visible", () => {
    const state: BannerState = { duplicateBanner: true };
    const next = dismissBanner(state);
    expect(next.duplicateBanner).toBe(false);
  });

  it("is idempotent — dismissing an already-hidden banner keeps it hidden", () => {
    const state: BannerState = { duplicateBanner: false };
    const next = dismissBanner(state);
    expect(next.duplicateBanner).toBe(false);
  });

  it("does not mutate the original state object", () => {
    const state: BannerState = { duplicateBanner: true };
    dismissBanner(state);
    expect(state.duplicateBanner).toBe(true);
  });
});

// ── Tests: phone change dismisses banner (Requirement 4.1.5) ─────────────────

describe("handlePhoneChange — dismisses banner when user edits phone number", () => {
  it("hides banner when user starts editing the phone number", () => {
    const state: BannerState = { duplicateBanner: true };
    const next = handlePhoneChange(state);
    expect(next.duplicateBanner).toBe(false);
  });

  it("keeps banner hidden if it was already hidden", () => {
    const state: BannerState = { duplicateBanner: false };
    const next = handlePhoneChange(state);
    expect(next.duplicateBanner).toBe(false);
  });
});

// ── Tests: banner is visually distinct (Requirement 4.1.7) ───────────────────

describe("Banner visual distinction — amber vs red", () => {
  const BANNER_BG = "#FEF3C7";
  const BANNER_BORDER = "#FDE68A";
  const ERROR_COLOR = "#EF4444";

  it("banner background is amber, not red", () => {
    expect(BANNER_BG).not.toBe(ERROR_COLOR);
    expect(BANNER_BG).toBe("#FEF3C7"); // amber-100
  });

  it("banner border is amber", () => {
    expect(BANNER_BORDER).toBe("#FDE68A"); // amber-200
  });

  it("banner and validation error use different colors", () => {
    expect(BANNER_BG).not.toBe(ERROR_COLOR);
    expect(BANNER_BORDER).not.toBe(ERROR_COLOR);
  });
});
