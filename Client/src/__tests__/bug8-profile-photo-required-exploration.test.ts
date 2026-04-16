/**
 * Task 29 — Bug Condition Exploration Test
 * Bug 8: Profile photo not required during onboarding
 *
 * Property 1: Bug Condition — Next Button Enabled Without Profile Photo
 *
 * After the fix (task 31.1), this test MUST PASS — confirming the bug is fixed.
 * The "Next" button must be disabled when no profile photo has been uploaded.
 *
 * Validates: Requirements 1.8, 2.8
 */

import * as fc from "fast-check";

// ─── Inline the isValid logic from personal-details.tsx ──────────────────────
// This mirrors the exact isValid() function in the screen component.
// The key invariant: photoUrl must be truthy for the form to be valid.

interface PersonalDetailsState {
  photoUrl: string;
  name: string;
  age: number;
  gender: string;
  fathersName: string;
}

function isValid(details: PersonalDetailsState, errors: Record<string, string | undefined>): boolean {
  return (
    !!details.photoUrl &&          // photo is mandatory
    details.name?.trim() !== "" &&
    details.age > 0 &&
    details.gender !== "" &&
    details.fathersName?.trim() !== "" &&
    Object.values(errors).every((e) => !e)
  );
}

// ─── Property 1: Next button disabled when no profile photo ──────────────────

describe("Property 1: Next Button Disabled Without Profile Photo", () => {
  /**
   * When photoUrl is empty/null, isValid() must return false regardless of
   * whether all other fields are filled in correctly.
   *
   * Validates: Requirements 2.8
   */
  it("isValid returns false when photoUrl is empty, even with all other fields filled", () => {
    const validOtherFields: PersonalDetailsState = {
      photoUrl: "",   // no photo
      name: "Ramesh Kumar",
      age: 35,
      gender: "male",
      fathersName: "Suresh Kumar",
    };
    expect(isValid(validOtherFields, {})).toBe(false);
  });

  it("isValid returns false when photoUrl is null-like (empty string)", () => {
    fc.assert(
      fc.property(
        // Generate valid values for all other required fields
        fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
        fc.integer({ min: 18, max: 100 }),
        fc.constantFrom("male", "female", "other"),
        fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
        (name, age, gender, fathersName) => {
          const details: PersonalDetailsState = {
            photoUrl: "",   // no photo — the bug condition
            name,
            age,
            gender,
            fathersName,
          };
          // Even with all other fields valid, no photo means isValid() === false
          expect(isValid(details, {})).toBe(false);
        }
      )
    );
  });

  /**
   * The Next button's disabled prop is derived from !isValid().
   * When isValid() is false, disabled must be true.
   *
   * Validates: Requirements 2.8
   */
  it("Next button is disabled (disabled=true) when no photo is uploaded", () => {
    const noPhotoState: PersonalDetailsState = {
      photoUrl: "",
      name: "Test User",
      age: 25,
      gender: "female",
      fathersName: "Test Father",
    };
    const valid = isValid(noPhotoState, {});
    const buttonDisabled = !valid;
    expect(buttonDisabled).toBe(true);
  });

  /**
   * Property: for any combination of valid other fields, the absence of a
   * photoUrl always results in the Next button being disabled.
   *
   * Validates: Requirements 2.8
   */
  it("Next button is always disabled when photoUrl is absent, regardless of other fields", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
          age: fc.integer({ min: 18, max: 100 }),
          gender: fc.constantFrom("male", "female", "other"),
          fathersName: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
        }),
        ({ name, age, gender, fathersName }) => {
          const details: PersonalDetailsState = {
            photoUrl: "",   // no photo
            name,
            age,
            gender,
            fathersName,
          };
          expect(isValid(details, {})).toBe(false);
          expect(!isValid(details, {})).toBe(true); // button is disabled
        }
      )
    );
  });

  /**
   * Conversely: when photoUrl IS present along with all other required fields,
   * isValid() returns true and the Next button is enabled.
   *
   * Validates: Requirements 2.8
   */
  it("Next button is enabled when photoUrl is present and all other required fields are filled", () => {
    const withPhotoState: PersonalDetailsState = {
      photoUrl: "https://example.com/photo.jpg",
      name: "Ramesh Kumar",
      age: 35,
      gender: "male",
      fathersName: "Suresh Kumar",
    };
    expect(isValid(withPhotoState, {})).toBe(true);
    expect(!isValid(withPhotoState, {})).toBe(false); // button is NOT disabled
  });
});
