import { colors, theme } from "../colors";

describe("theme token completeness", () => {
  it("exports all required top-level keys", () => {
    expect(theme).toHaveProperty("primary");
    expect(theme).toHaveProperty("secondary");
    expect(theme).toHaveProperty("background");
    expect(theme).toHaveProperty("text");
    expect(theme).toHaveProperty("border");
    expect(theme).toHaveProperty("semantic");
  });

  it("has correct brand colors unchanged", () => {
    expect(theme.primary.green).toBe("#386641");
    expect(theme.secondary.soil).toBe("#7F5539");
  });

  it("background.screen is a tinted green, not pure/near white", () => {
    expect(theme.background.screen).not.toBe("#FFFFFF");
    expect(theme.background.screen).not.toBe("#F8FAFC");
    expect(theme.background.screen).not.toBe("#F6F6F6");
  });
});

describe("colors backward compatibility", () => {
  it("still exports primary, secondary, neutral, and semantic keys", () => {
    expect(colors).toHaveProperty("primary");
    expect(colors).toHaveProperty("secondary");
    expect(colors).toHaveProperty("neutral");
    expect(colors).toHaveProperty("semantic");
  });

  it("preserves original neutral surface value", () => {
    expect(colors.neutral.surface).toBe("#F6F6F6");
  });

  it("preserves original primary green value", () => {
    expect(colors.primary.green).toBe("#386641");
  });
});
