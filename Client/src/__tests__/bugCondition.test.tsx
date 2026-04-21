/**
 * Bug Condition Exploration Tests
 *
 * These tests encode the EXPECTED (fixed) behavior for 8 bug areas.
 * They MUST FAIL on unfixed code — failure confirms the bugs exist.
 * They will PASS after the fixes are implemented.
 *
 * DO NOT fix the code or the tests when they fail.
 *
 * Validates: Requirements 1.3, 1.5, 1.7, 1.9, 1.10, 1.13, 1.17, 1.18
 */

import * as fs from "fs";
import * as path from "path";

// ─── File readers ─────────────────────────────────────────────────────────────

function readFile(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, relativePath), "utf-8");
}

// ─── Test 1a — Address dropdowns absent in Step2 (add-beneficiary) ────────────
// Bug: Step2 uses plain TextInput for State/District instead of <Select> dropdowns.
// Expected: Step2 renders <Select> components for State and District.
// Will FAIL on unfixed code — only TextInput renders in the manual fallback.
describe("Test 1a — Address dropdowns in Step2 (add-beneficiary)", () => {
  let content: string;

  beforeAll(() => {
    content = readFile("../app/(admin)/add-beneficiary.tsx");
  });

  /**
   * Property: Bug Condition — Step2 must render <Select> for State
   * Validates: Requirements 1.3, 2.3, 2.21
   *
   * The bug: Step2 uses <TextInput> for state/district (plain text fallback).
   * The fix: Replace TextInput with <Select> backed by indianStates/indianDistricts.
   */
  test("Step2 uses <Select> for State field (not plain TextInput)", () => {
    // After fix, Step2 should import and use indianStates for a Select dropdown.
    // The buggy code has a TextInput with placeholder "e.g. Uttar Pradesh" for state.
    const hasStatePlainTextInput = /placeholder=["']e\.g\. Uttar Pradesh["']/.test(content);
    // On unfixed code this is true (TextInput present), so the assertion below fails.
    expect(hasStatePlainTextInput).toBe(false);
  });

  test("Step2 uses <Select> for District field (not plain TextInput)", () => {
    // After fix, Step2 should use a Select for district.
    // The buggy code has a TextInput with placeholder "e.g. Lucknow" for district.
    const hasDistrictPlainTextInput = /placeholder=["']e\.g\. Lucknow["']/.test(content);
    expect(hasDistrictPlainTextInput).toBe(false);
  });

  test("Step2 imports indianStates for dropdown options", () => {
    // After fix, the file must import indianStates to populate the Select.
    const importsIndianStates = /indianStates/.test(content);
    expect(importsIndianStates).toBe(true);
  });
});

// ─── Test 1b — "Beneficiary" label visible in Beneficiaries screen ────────────
// Bug: The header in beneficiaries.tsx reads "Beneficiaries" instead of "Farmers".
// Expected: Header text reads "Farmers".
// Will FAIL on unfixed code — header reads "Beneficiaries".
describe("Test 1b — Beneficiaries screen header label", () => {
  let content: string;

  beforeAll(() => {
    content = readFile("../app/(admin)/beneficiaries.tsx");
  });

  /**
   * Property: Bug Condition — Header must NOT display "Beneficiaries"
   * Validates: Requirements 1.5, 2.5
   *
   * The bug: The screen title AppText contains the string "Beneficiaries".
   * The fix: Change the title to "Farmers".
   */
  test('header title does NOT read "Beneficiaries"', () => {
    // The buggy code has: <AppText style={s.title}>Beneficiaries</AppText>
    // After fix it should read "Farmers".
    const hasBeneficiariesTitle = />Beneficiaries</.test(content);
    expect(hasBeneficiariesTitle).toBe(false);
  });

  test('header title reads "Farmers"', () => {
    // After fix, the title AppText should contain "Farmers".
    const hasFarmersTitle = />Farmers</.test(content);
    expect(hasFarmersTitle).toBe(true);
  });
});

// ─── Test 1c — Keyboard overlap on personal-details ──────────────────────────
// Bug: The bottom button bar is rendered OUTSIDE the KeyboardAwareScrollView,
//      so the keyboard obscures it when a field near the bottom is focused.
// Expected: The bottom button bar is inside the scroll container.
// Will FAIL on unfixed code — button bar is outside scroll.
describe("Test 1c — Keyboard overlap on personal-details", () => {
  let content: string;

  beforeAll(() => {
    content = readFile("../app/(auth)/personal-details.tsx");
  });

  /**
   * Property: Bug Condition — Bottom button bar must be inside KeyboardAwareScrollView
   * Validates: Requirements 1.9, 2.9
   *
   * The bug: The bottom buttons View (with padding: 20) is rendered after the
   *          closing </KeyboardAwareScrollView> tag, outside the scroll area.
   * The fix: Move the button bar inside the KeyboardAwareScrollView content area,
   *          or wrap the screen in a KeyboardAvoidingView.
   */
  test("bottom button bar is NOT rendered after the closing KeyboardAwareScrollView tag", () => {
    // In the buggy code, the structure is:
    //   </KeyboardAwareScrollView>
    //   <View style={{ padding: 20, ... }}>  ← button bar OUTSIDE scroll
    //
    // After fix, the button bar should be inside the scroll or the screen
    // should use KeyboardAvoidingView so buttons lift with the keyboard.
    //
    // We detect the bug by checking if the bottom button bar View appears
    // after the KeyboardAwareScrollView closing tag in the source.
    const scrollCloseIdx = content.indexOf("</KeyboardAwareScrollView>");
    const buttonBarIdx = content.indexOf("Bottom Buttons");
    // On unfixed code: buttonBarIdx > scrollCloseIdx (button bar is after scroll close)
    // After fix: buttonBarIdx < scrollCloseIdx (button bar is inside scroll)
    //            OR KeyboardAvoidingView wraps the whole screen
    const buttonBarIsOutsideScroll =
      scrollCloseIdx !== -1 &&
      buttonBarIdx !== -1 &&
      buttonBarIdx > scrollCloseIdx;
    expect(buttonBarIsOutsideScroll).toBe(false);
  });
});

// ─── Test 1d — Photo picker skips modal in Profile ───────────────────────────
// Bug: handleAvatarUpload in profile.tsx calls ImagePicker directly without
//      first showing an Alert/ActionSheet with Camera and Gallery options.
// Expected: An Alert with "Camera" and "Gallery" options is shown first.
// Will FAIL on unfixed code — picker launches directly.
describe("Test 1d — Photo picker skips Camera/Gallery modal in Profile", () => {
  let content: string;

  beforeAll(() => {
    content = readFile("../app/(tab)/profile.tsx");
  });

  /**
   * Property: Bug Condition — handleAvatarUpload must show Alert before ImagePicker
   * Validates: Requirements 1.10, 2.10
   *
   * The bug: handleAvatarUpload calls launchImageLibraryAsync directly.
   * The fix: Show Alert.alert("Choose Photo", ...) with Camera/Gallery options first.
   */
  test("handleAvatarUpload shows an Alert with Camera option before launching picker", () => {
    // After fix, handleAvatarUpload must contain Alert.alert with a "Camera" text option.
    // The buggy code has no such Alert — it calls launchImageLibraryAsync directly.
    // We look for Alert.alert with "Camera" as a button text (not just the word "camera" in styles).
    const hasCameraAlertButton = /Alert\.alert\s*\([^)]*"Camera"/.test(content) ||
      /text:\s*["']Camera["']/.test(content);
    expect(hasCameraAlertButton).toBe(true);
  });

  test("handleAvatarUpload shows an Alert with Gallery option before launching picker", () => {
    // After fix, handleAvatarUpload must contain Alert.alert with a "Gallery" text option.
    const hasGalleryAlertButton = /Alert\.alert\s*\([^)]*"Gallery"/.test(content) ||
      /text:\s*["']Gallery["']/.test(content);
    expect(hasGalleryAlertButton).toBe(true);
  });

  test("handleAvatarUpload does NOT call launchImageLibraryAsync directly without an Alert guard", () => {
    // The buggy code calls launchImageLibraryAsync immediately in handleAvatarUpload
    // without any Alert guard. After fix, launchImageLibraryAsync is only called
    // inside an Alert callback (launchGallery helper).
    //
    // Detect the bug: in the buggy code, launchImageLibraryAsync is called directly
    // in handleAvatarUpload (not inside a nested callback from Alert).
    // We check that the function body contains a "Choose Photo" or similar Alert title
    // that guards the picker call.
    const hasChoosePhotoAlert = /["']Choose Photo["']/.test(content) ||
      /["']Select Photo["']/.test(content) ||
      /["']Upload Photo["']/.test(content);
    expect(hasChoosePhotoAlert).toBe(true);
  });
});

// ─── Test 1e — Multi-parcel land UI in AuthLandDetailsScreen ─────────────────
// Bug: land-details.tsx renders a CropSelector multi-entry section and an
//      "Add Land Parcel" button instead of a single "Total Land (in Ha)" input.
// Expected: Single numeric input labelled "Total Land (in Ha)"; no "Add Land Parcel".
// Will FAIL on unfixed code — CropSelector multi-entry renders.
describe("Test 1e — Multi-parcel land UI in AuthLandDetailsScreen", () => {
  let content: string;

  beforeAll(() => {
    content = readFile("../app/(auth)/land-details.tsx");
  });

  /**
   * Property: Bug Condition — No "Add Land Parcel" button; single total-land input
   * Validates: Requirements 1.13, 2.13
   *
   * The bug: The screen renders CropSelector and an "Add Land Parcel" button.
   * The fix: Remove CropSelector; render a single TextInput labelled "Total Land (in Ha)".
   */
  test('does NOT render a CropSelector component', () => {
    // After fix, CropSelector should be removed from the screen.
    const hasCropSelector = /CropSelector/.test(content);
    expect(hasCropSelector).toBe(false);
  });

  test('renders a single input labelled "Total Land (in Ha)"', () => {
    // After fix, there should be a label or placeholder containing "Total Land (in Ha)".
    const hasTotalLandLabel = /Total Land \(in Ha\)/.test(content);
    expect(hasTotalLandLabel).toBe(true);
  });

  test('does NOT use CropSelector for multi-crop selection (single total-land input expected)', () => {
    // The bug is that CropSelector is used for multi-crop selection.
    // After fix, CropSelector should be removed and replaced with a single numeric input.
    // This test is a duplicate assertion to reinforce the CropSelector removal.
    const importsCropSelector = /import.*CropSelector/.test(content);
    expect(importsCropSelector).toBe(false);
  });
});

// ─── Test 1f — Non-recommended schemes visible in Schemes screen ──────────────
// Bug: recommendedSchemes in schemes.tsx includes non-featured schemes via a
//      fallback that appends all non-featured schemes after featured ones.
// Expected: Only isFeatured=true schemes appear in the recommended list.
// Will FAIL on unfixed code — all schemes render.
describe("Test 1f — Non-recommended schemes visible in Schemes screen", () => {
  let content: string;

  beforeAll(() => {
    content = readFile("../app/(tab)/schemes.tsx");
  });

  /**
   * Property: Bug Condition — recommendedSchemes must only contain featured schemes
   * Validates: Requirements 1.17, 2.17
   *
   * The bug: recommendedSchemes is built by spreading featured + non-featured:
   *   [...filteredSchemes.filter(s => s.isFeatured), ...filteredSchemes.filter(s => !s.isFeatured)].slice(0, 5)
   * The fix: Only include featured schemes:
   *   filteredSchemes.filter(s => s.isFeatured).slice(0, 5)
   */
  test("recommendedSchemes derivation does NOT include non-featured schemes", () => {
    // The buggy code spreads non-featured schemes into recommendedSchemes:
    //   ...filteredSchemes.filter((s) => !s.isFeatured)
    // After fix, this spread must be removed.
    const hasNonFeaturedSpread = /filter\s*\(\s*\(s\)\s*=>\s*!s\.isFeatured\s*\)/.test(content);
    expect(hasNonFeaturedSpread).toBe(false);
  });

  test("recommendedSchemes derivation filters to ONLY isFeatured schemes (no non-featured fallback)", () => {
    // After fix, recommendedSchemes should be derived with ONLY .filter(s => s.isFeatured)
    // without a non-featured fallback spread.
    // The buggy code has both featured AND non-featured in the array.
    // After fix, only featured schemes should be included.
    // We verify by checking that the non-featured spread is gone AND isFeatured filter exists.
    const hasNonFeaturedSpread = /filter\s*\(\s*\(s\)\s*=>\s*!s\.isFeatured\s*\)/.test(content);
    const hasFeaturedFilter = /filter\s*\(\s*\(s\)\s*=>\s*s\.isFeatured\s*\)/.test(content);
    // After fix: no non-featured spread AND featured filter exists
    expect(hasNonFeaturedSpread).toBe(false);
    expect(hasFeaturedFilter).toBe(true);
  });

  test("ProgramSection does NOT receive all filteredSchemes (must filter to featured only)", () => {
    // The buggy code passes filteredSchemes.slice(0, 9) to ProgramSection.
    // After fix, it should pass filteredSchemes.filter(s => s.isFeatured).slice(0, 9).
    // Detect the bug: ProgramSection programs prop uses filteredSchemes.slice without isFeatured filter.
    const programSectionWithAllSchemes =
      /programs=\{filteredSchemes\.slice\(0,\s*9\)/.test(content) ||
      /programs=\{filteredSchemes\.map/.test(content);
    // On unfixed code this is true; after fix it should be false.
    expect(programSectionWithAllSchemes).toBe(false);
  });
});

// ─── Test 1g — "Participate Now" does not toggle in SchemeDetailsScreen ───────
// Bug: The interest button label uses "I'm Interested" / "✓ I'm Interested"
//      instead of "Participate Now" / "Applied ✓".
// Expected: After tap, button label changes to "Applied ✓".
// Will FAIL on unfixed code — label stays "I'm Interested".
describe("Test 1g — Participate Now button label toggle in SchemeDetailsScreen", () => {
  let content: string;

  beforeAll(() => {
    content = readFile("../app/scheme-details.tsx");
  });

  /**
   * Property: Bug Condition — Button label must be "Participate Now" / "Applied ✓"
   * Validates: Requirements 1.18, 2.18
   *
   * The bug: Button label is `isInterested ? "✓ I'm Interested" : "I'm Interested"`.
   * The fix: Change to `isInterested ? "Applied ✓" : "Participate Now"`.
   */
  test('button label does NOT use "I\'m Interested" text', () => {
    // After fix, "I'm Interested" should not appear as a button label.
    const hasImInterestedLabel = /I'm Interested/.test(content);
    expect(hasImInterestedLabel).toBe(false);
  });

  test('button label uses "Participate Now" for the default (not-interested) state', () => {
    // After fix, the button label for the not-interested state should be "Participate Now".
    const hasParticipateNow = /Participate Now/.test(content);
    expect(hasParticipateNow).toBe(true);
  });

  test('button label uses "Applied ✓" for the interested (applied) state', () => {
    // After fix, the button label for the interested state should be "Applied ✓".
    const hasAppliedLabel = /Applied\s*✓/.test(content);
    expect(hasAppliedLabel).toBe(true);
  });
});

// ─── Test 1h — "Emergency Help" label in Connect screen ──────────────────────
// Bug: connect.emergencyTitle i18n key resolves to "Emergency Help" instead of "SOS".
// Expected: Emergency section title reads "SOS".
// Will FAIL on unfixed code — reads "Emergency Help".
describe("Test 1h — Emergency Help label in Connect screen", () => {
  let enJson: Record<string, any>;

  beforeAll(() => {
    const raw = readFile("../i18n/en.json");
    enJson = JSON.parse(raw);
  });

  /**
   * Property: Bug Condition — connect.emergencyTitle must be "SOS"
   * Validates: Requirements 1.7, 2.7
   *
   * The bug: en.json has connect.emergencyTitle = "Emergency Help".
   * The fix: Change the value to "SOS".
   */
  test('connect.emergencyTitle is NOT "Emergency Help"', () => {
    const emergencyTitle = enJson?.connect?.emergencyTitle;
    expect(emergencyTitle).not.toBe("Emergency Help");
  });

  test('connect.emergencyTitle is "SOS"', () => {
    const emergencyTitle = enJson?.connect?.emergencyTitle;
    expect(emergencyTitle).toBe("SOS");
  });
});
