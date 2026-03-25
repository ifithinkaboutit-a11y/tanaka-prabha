/**
 * Shared utility for bilingual form validation.
 * Used by create-event.tsx and testable in isolation.
 */

export function validateBilingualForm(data: {
  title: string;
  title_hi: string;
}): { valid: boolean } {
  if (data.title.trim() === "") {
    return { valid: false };
  }
  if (data.title_hi.trim() === "") {
    return { valid: false };
  }
  return { valid: true };
}
