/**
 * Unit tests for Dashboard bilingual event form validation logic.
 *
 * Validates: Requirements 1.4, 1.5, 2.3, 14.1, 14.2, 14.3
 */

/**
 * Pure validation function extracted from the inline form logic in
 * events/page.jsx and events/[id]/page.jsx.
 *
 * Returns true when the Hindi title should be considered empty
 * (i.e. submission must be blocked).
 */
function isHindiTitleEmpty(titleHi: string): boolean {
  return titleHi.trim() === "";
}

/**
 * Simulates the full bilingual form validation used before calling
 * eventsApi.create() / eventsApi.update().
 */
function validateBilingualEventForm(formData: {
  title: string;
  title_hi: string;
}): { valid: boolean; error?: string } {
  if (!formData.title.trim()) {
    return { valid: false, error: "Please enter the English title" };
  }
  if (!formData.title_hi.trim()) {
    return {
      valid: false,
      error: "Please enter the Hindi title (हिंदी शीर्षक आवश्यक है)",
    };
  }
  return { valid: true };
}

// ─── isHindiTitleEmpty ────────────────────────────────────────────

describe("isHindiTitleEmpty", () => {
  it("rejects empty string", () => {
    expect(isHindiTitleEmpty("")).toBe(true);
  });

  it("rejects single space", () => {
    expect(isHindiTitleEmpty(" ")).toBe(true);
  });

  it("rejects tab and newline whitespace", () => {
    expect(isHindiTitleEmpty("\t\n")).toBe(true);
  });

  it("rejects string with only spaces and tabs", () => {
    expect(isHindiTitleEmpty("   \t   ")).toBe(true);
  });

  it("accepts single Hindi character", () => {
    expect(isHindiTitleEmpty("क")).toBe(false);
  });

  it("accepts a full Hindi title", () => {
    expect(isHindiTitleEmpty("कृषि मेला 2024")).toBe(false);
  });

  it("accepts a Hindi title with surrounding whitespace (trimmed)", () => {
    // whitespace around a real value should still be accepted
    expect(isHindiTitleEmpty("  क  ")).toBe(false);
  });
});

// ─── validateBilingualEventForm ───────────────────────────────────

describe("validateBilingualEventForm", () => {
  it("fails when both title and title_hi are empty", () => {
    const result = validateBilingualEventForm({ title: "", title_hi: "" });
    expect(result.valid).toBe(false);
  });

  it("fails when English title is empty even if Hindi title is filled", () => {
    const result = validateBilingualEventForm({
      title: "",
      title_hi: "हिंदी शीर्षक",
    });
    expect(result.valid).toBe(false);
  });

  it("fails when Hindi title is empty and English title is filled", () => {
    const result = validateBilingualEventForm({
      title: "Farmer Training Event",
      title_hi: "",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("हिंदी शीर्षक आवश्यक है");
  });

  it("fails when Hindi title is whitespace-only (single space)", () => {
    const result = validateBilingualEventForm({
      title: "Farmer Training Event",
      title_hi: " ",
    });
    expect(result.valid).toBe(false);
  });

  it("fails when Hindi title is whitespace-only (tab + newline)", () => {
    const result = validateBilingualEventForm({
      title: "Farmer Training Event",
      title_hi: "\t\n",
    });
    expect(result.valid).toBe(false);
  });

  it("passes when both English and Hindi titles are non-empty", () => {
    const result = validateBilingualEventForm({
      title: "Farmer Training Event",
      title_hi: "किसान प्रशिक्षण कार्यक्रम",
    });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("passes with minimal single-character Hindi title", () => {
    const result = validateBilingualEventForm({
      title: "Event",
      title_hi: "क",
    });
    expect(result.valid).toBe(true);
  });
});
