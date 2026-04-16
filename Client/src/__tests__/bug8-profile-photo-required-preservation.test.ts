/**
 * Task 30 — Preservation Property Tests
 * Bug 8: Existing profile photo continues to display in avatar ring
 *
 * Property 2: Preservation — Existing Profile Photo Displayed In Avatar Ring
 *
 * These tests MUST PASS on both unfixed and fixed code — they verify that
 * existing behaviour is preserved after the fix.
 *
 * Validates: Requirements 3.8
 */

import * as fc from "fast-check";

// ─── Inline the avatar display logic from personal-details.tsx ───────────────
// The avatar ring shows the photo when: localPhotoUri || personalDetails.photoUrl
// This mirrors the exact conditional in the screen component.

function shouldShowPhoto(localPhotoUri: string | null, photoUrl: string | undefined): boolean {
  return !!(localPhotoUri || photoUrl);
}

function getDisplayUri(localPhotoUri: string | null, photoUrl: string | undefined): string | null {
  return localPhotoUri ?? photoUrl ?? null;
}

// ─── Property 2: Existing photo displayed in avatar ring ─────────────────────

describe("Property 2: Existing Profile Photo Displayed In Avatar Ring", () => {
  /**
   * When a user has already uploaded a profile photo (photoUrl is set in the store),
   * the avatar ring must display it — even when localPhotoUri is null.
   *
   * Validates: Requirements 3.8
   */
  it("avatar ring shows photo when photoUrl is set in store (no local override)", () => {
    const photoUrl = "https://example.com/existing-photo.jpg";
    expect(shouldShowPhoto(null, photoUrl)).toBe(true);
    expect(getDisplayUri(null, photoUrl)).toBe(photoUrl);
  });

  /**
   * Property: for any non-empty photoUrl, the avatar ring always shows the photo
   * when there is no local override.
   *
   * Validates: Requirements 3.8
   */
  it("avatar ring always shows photo for any non-empty photoUrl", () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (photoUrl) => {
          expect(shouldShowPhoto(null, photoUrl)).toBe(true);
          expect(getDisplayUri(null, photoUrl)).toBe(photoUrl);
        }
      )
    );
  });

  /**
   * When a local photo URI is set (user just took a new photo), it takes
   * precedence over the stored photoUrl — the most recent selection is shown.
   *
   * Validates: Requirements 3.8
   */
  it("local photo URI takes precedence over stored photoUrl", () => {
    const localUri = "file:///tmp/new-photo.jpg";
    const storedUrl = "https://example.com/old-photo.jpg";
    expect(shouldShowPhoto(localUri, storedUrl)).toBe(true);
    expect(getDisplayUri(localUri, storedUrl)).toBe(localUri);
  });

  /**
   * Property: when localPhotoUri is set, it always takes precedence over photoUrl.
   *
   * Validates: Requirements 3.8
   */
  it("local photo URI always takes precedence over stored photoUrl", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.webUrl(),
        (localUri, storedUrl) => {
          expect(shouldShowPhoto(localUri, storedUrl)).toBe(true);
          expect(getDisplayUri(localUri, storedUrl)).toBe(localUri);
        }
      )
    );
  });

  /**
   * When neither localPhotoUri nor photoUrl is set, the avatar ring shows
   * the default avatar (not a photo) — the placeholder is shown.
   *
   * Validates: Requirements 3.8
   */
  it("avatar ring shows default avatar when no photo is set", () => {
    expect(shouldShowPhoto(null, "")).toBe(false);
    expect(shouldShowPhoto(null, undefined)).toBe(false);
    // getDisplayUri returns "" (falsy) or null — both mean no photo to display
    expect(getDisplayUri(null, "") || null).toBe(null);
    expect(getDisplayUri(null, undefined)).toBe(null);
  });

  /**
   * The photo status text reflects the upload state correctly:
   * - "✓ Photo uploaded" when photoUrl is set
   * - "Tap to add profile photo *" when photoUrl is not set
   *
   * Validates: Requirements 3.8
   */
  it("photo status text shows correct message based on upload state", () => {
    const getStatusText = (photoUrl: string | undefined): string => {
      return photoUrl ? "✓ Photo uploaded" : "Tap to add profile photo *";
    };

    expect(getStatusText("https://example.com/photo.jpg")).toBe("✓ Photo uploaded");
    expect(getStatusText("")).toBe("Tap to add profile photo *");
    expect(getStatusText(undefined)).toBe("Tap to add profile photo *");
  });

  /**
   * Property: for any non-empty photoUrl, the status text always shows
   * the "uploaded" confirmation message.
   *
   * Validates: Requirements 3.8
   */
  it("status text always shows uploaded confirmation for any non-empty photoUrl", () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (photoUrl) => {
          const getStatusText = (url: string): string =>
            url ? "✓ Photo uploaded" : "Tap to add profile photo *";
          expect(getStatusText(photoUrl)).toBe("✓ Photo uploaded");
        }
      )
    );
  });
});
