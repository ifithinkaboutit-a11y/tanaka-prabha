/**
 * Property 1: Text/background contrast ratio
 * Validates: Requirements 3.4
 *
 * For every (text token, background token) pair in `theme`, the WCAG 2.1
 * contrast ratio SHALL be >= 4.5:1.
 */
import * as fc from "fast-check";
import { theme } from "../colors";

/** Convert a hex color string to linear RGB [0..1] components. */
function hexToLinearRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return [toLinear(r), toLinear(g), toLinear(b)];
}

/** Relative luminance per WCAG 2.1. */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToLinearRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio between two colors. */
function contrastRatio(color1: string, color2: string): number {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Pairs of (text token, background token) that represent realistic
 * text-on-background combinations in the app.
 */
const textBackgroundPairs: Array<[string, string]> = [
  // Primary text on screen backgrounds
  [theme.text.primary, theme.background.screen],
  [theme.text.primary, theme.background.card],
  [theme.text.primary, theme.background.input],
  [theme.text.primary, theme.background.header],
  // Secondary text on screen backgrounds
  [theme.text.secondary, theme.background.screen],
  [theme.text.secondary, theme.background.card],
  [theme.text.secondary, theme.background.input],
  // Muted text on screen backgrounds
  [theme.text.muted, theme.background.screen],
  [theme.text.muted, theme.background.card],
  [theme.text.muted, theme.background.input],
  // Dark text variants on backgrounds
  [theme.text.dark, theme.background.screen],
  [theme.text.dark, theme.background.card],
  [theme.text.medium, theme.background.screen],
  [theme.text.medium, theme.background.card],
  // onPrimary text on primary green
  [theme.text.onPrimary, theme.primary.green],
  [theme.text.onPrimary, theme.primary.greenDark],
  // onSecondary text on secondary soil
  [theme.text.onSecondary, theme.secondary.soil],
];

describe("Property 1: text/background contrast ratio >= 4.5:1", () => {
  it("all defined text/background pairs meet WCAG AA contrast", () => {
    fc.assert(
      fc.property(fc.constantFrom(...textBackgroundPairs), ([textColor, bgColor]) => {
        return contrastRatio(textColor, bgColor) >= 4.5;
      }),
      { numRuns: 100 }
    );
  });
});
