/**
 * Property-based test for bilingual mobile form validation.
 *
 * **Validates: Requirements 14.1, 14.2, 14.3**
 *
 * Property 2: Whitespace-aware bilingual form validation
 * - A form with a non-empty English title and a whitespace-only Hindi title
 *   must fail validation.
 */

import * as fc from "fast-check";
import { validateBilingualForm } from "../utils/validateBilingualForm";

describe("validateBilingualForm — Property 2: Whitespace-aware bilingual form validation", () => {
  /**
   * **Validates: Requirements 14.1, 14.2, 14.3**
   *
   * For any non-empty English title and any whitespace-only Hindi title,
   * validateBilingualForm must return { valid: false }.
   */
  it("form with non-empty English title and whitespace Hindi title fails validation", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        // Generate whitespace-only strings (empty or containing only whitespace chars)
        fc.stringMatching(/^[ \t\n\r]*$/),
        (title, titleHi) => {
          const result = validateBilingualForm({ title, title_hi: titleHi });
          return result.valid === false;
        }
      ),
      { numRuns: 200 }
    );
  });

  it("form with non-empty English title and empty Hindi title fails validation", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (title) => {
          const result = validateBilingualForm({ title, title_hi: "" });
          return result.valid === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("form with both non-empty titles passes validation", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (title, titleHi) => {
          const result = validateBilingualForm({ title, title_hi: titleHi });
          return result.valid === true;
        }
      ),
      { numRuns: 200 }
    );
  });

  it("form with empty English title fails validation regardless of Hindi title", () => {
    fc.assert(
      fc.property(fc.string(), (titleHi) => {
        const result = validateBilingualForm({ title: "", title_hi: titleHi });
        return result.valid === false;
      }),
      { numRuns: 100 }
    );
  });
});
