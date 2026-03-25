/**
 * Property test for bidirectional i18n key parity between en.json and hi.json.
 *
 * **Validates: Requirements 13.1, 13.2**
 *
 * Property 1: Bidirectional translation key parity
 * - Every leaf key in en.json must resolve to a non-empty, non-key string in hi.json
 * - Every leaf key in hi.json must resolve to a non-empty, non-key string in en.json
 */

import * as fc from "fast-check";
import en from "../i18n/en.json";
import hi from "../i18n/hi.json";

function flattenKeys(obj: Record<string, any>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    // Only recurse into plain objects (not arrays, not null, not strings with dots in key names)
    return typeof v === "object" && v !== null && !Array.isArray(v)
      ? flattenKeys(v, path)
      : [path];
  });
}

function resolveKey(obj: Record<string, any>, key: string): any {
  const parts = key.split(".");
  let current: any = obj;
  let i = 0;
  while (i < parts.length) {
    if (current === null || typeof current !== "object") return undefined;
    // Try progressively longer literal keys from position i
    let matched = false;
    for (let j = parts.length; j > i; j--) {
      const literalKey = parts.slice(i, j).join(".");
      if (literalKey in current) {
        current = current[literalKey];
        i = j;
        matched = true;
        break;
      }
    }
    if (!matched) return undefined;
  }
  return current;
}

const allEnKeys = flattenKeys(en as Record<string, any>);
const allHiKeys = flattenKeys(hi as Record<string, any>);

test("every en.json key resolves to a non-empty, non-key string in hi.json", () => {
  fc.assert(
    fc.property(fc.constantFrom(...allEnKeys), (key) => {
      const value = resolveKey(hi as Record<string, any>, key);
      return (
        typeof value === "string" &&
        value.trim().length > 0 &&
        value !== key
      );
    }),
    { numRuns: allEnKeys.length }
  );
});

test("every hi.json key resolves to a non-empty, non-key string in en.json", () => {
  fc.assert(
    fc.property(fc.constantFrom(...allHiKeys), (key) => {
      const value = resolveKey(en as Record<string, any>, key);
      return (
        typeof value === "string" &&
        value.trim().length > 0 &&
        value !== key
      );
    }),
    { numRuns: allHiKeys.length }
  );
});
