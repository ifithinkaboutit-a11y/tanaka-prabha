/**
 * Bug 15 — Auth Stack: Video Header and Keyboard UX
 * Bug Condition Exploration Test (Static Analysis)
 *
 * **Validates: Requirements 1.15**
 *
 * Property 1: Bug Condition — Auth Screens Render Video Component
 *
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists: auth screens import and render
 * `AuthVideoBackground` or `VideoView` components, consuming 28–55% of
 * screen height and obscuring form fields when the keyboard opens.
 *
 * Approach: Static code analysis — read each auth screen file and assert
 * that no video-related imports or JSX usages are present. This is a
 * practical approach for React Native screens that are hard to render in
 * Jest without extensive mocking.
 *
 * Counterexamples documented:
 *   - phone-input.tsx: imports AuthVideoBackground, renders <AuthVideoBackground>
 *     inside <View className="h-[55vh]">
 *   - otp-input.tsx: imports AuthVideoBackground, renders <AuthVideoBackground>
 *     inside <View className="h-[52vh]">
 *   - set-password.tsx: imports AuthVideoBackground, renders <AuthVideoBackground>
 *     inside <View className="h-[52vh]">
 *   - personal-details.tsx: imports VideoView + useVideoPlayer from expo-video,
 *     renders <VideoView> at screenHeight * 0.28
 *   - land-details.tsx: imports VideoView + useVideoPlayer from expo-video,
 *     renders <VideoView> at screenHeight * 0.28
 *   - livestock-details.tsx: imports VideoView + useVideoPlayer from expo-video,
 *     renders <VideoView> at screenHeight * 0.28
 *
 * Root cause (from design.md):
 *   1. phone-input.tsx renders <AuthVideoBackground> inside <View className="h-[55vh]">
 *   2. land-details.tsx and livestock-details.tsx render an inline VideoView at
 *      screenHeight * 0.28
 *   3. KeyboardAvoidingView is misconfigured (behavior="padding" on both platforms,
 *      or placed inside the content card below the video)
 */

import * as fs from "fs";
import * as path from "path";

// ── File paths ────────────────────────────────────────────────────────────────

const AUTH_SCREENS_DIR = path.resolve(
  __dirname,
  "../../src/app/(auth)"
);

const AUTH_SCREEN_FILES: Record<string, string> = {
  "phone-input": path.join(AUTH_SCREENS_DIR, "phone-input.tsx"),
  "otp-input": path.join(AUTH_SCREENS_DIR, "otp-input.tsx"),
  "set-password": path.join(AUTH_SCREENS_DIR, "set-password.tsx"),
  "personal-details": path.join(AUTH_SCREENS_DIR, "personal-details.tsx"),
  "land-details": path.join(AUTH_SCREENS_DIR, "land-details.tsx"),
  "livestock-details": path.join(AUTH_SCREENS_DIR, "livestock-details.tsx"),
};

// ── Static analysis helpers ───────────────────────────────────────────────────

/**
 * Returns true if the file content contains an import of AuthVideoBackground.
 */
function importsAuthVideoBackground(content: string): boolean {
  return /import\s+.*AuthVideoBackground.*from/.test(content);
}

/**
 * Returns true if the file content contains a JSX usage of <AuthVideoBackground.
 */
function usesAuthVideoBackground(content: string): boolean {
  return /<AuthVideoBackground[\s/>]/.test(content);
}

/**
 * Returns true if the file content imports VideoView from expo-video.
 */
function importsVideoView(content: string): boolean {
  return /import\s+.*VideoView.*from\s+['"]expo-video['"]/.test(content) ||
    /import\s+\{[^}]*VideoView[^}]*\}\s+from\s+['"]expo-video['"]/.test(content);
}

/**
 * Returns true if the file content contains a JSX usage of <VideoView.
 */
function usesVideoView(content: string): boolean {
  return /<VideoView[\s/>]/.test(content);
}

/**
 * Returns true if the file content imports useVideoPlayer from expo-video.
 */
function importsUseVideoPlayer(content: string): boolean {
  return /useVideoPlayer/.test(content) &&
    /expo-video/.test(content);
}

/**
 * Returns true if the file renders any video component (AuthVideoBackground or VideoView).
 */
function rendersVideoComponent(content: string): boolean {
  return usesAuthVideoBackground(content) || usesVideoView(content);
}

/**
 * Returns true if the file has a correctly configured KeyboardAvoidingView at root level.
 * Correct means: behavior={Platform.OS === "ios" ? "padding" : "height"}
 * Bug: behavior="padding" on both platforms, or KAV placed inside content card below video.
 */
function hasCorrectRootKeyboardAvoidingView(content: string): boolean {
  // Check for the correct platform-conditional behavior pattern
  const correctPattern =
    /behavior=\{Platform\.OS\s*===\s*["']ios["']\s*\?\s*["']padding["']\s*:\s*["']height["']\}/.test(content);
  return correctPattern;
}

/**
 * Returns true if the file uses behavior="padding" hardcoded (the bug pattern).
 */
function hasBuggyKeyboardBehavior(content: string): boolean {
  // Matches behavior="padding" or behavior={'padding'} without platform check
  return /behavior=["']padding["']/.test(content) ||
    /behavior=\{["']padding["']\}/.test(content);
}

// ── Read file contents ────────────────────────────────────────────────────────

function readScreenContent(screenName: string): string {
  const filePath = AUTH_SCREEN_FILES[screenName];
  if (!fs.existsSync(filePath)) {
    throw new Error(`Auth screen file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Bug 15 — Auth Screens Video Component (exploration — expected to fail on unfixed code)", () => {

  describe("Auth screen files exist", () => {
    test.each(Object.entries(AUTH_SCREEN_FILES))(
      "%s screen file exists at expected path",
      (screenName, filePath) => {
        expect(fs.existsSync(filePath)).toBe(true);
      }
    );
  });

  describe("phone-input: should NOT render video components (FAILS on unfixed code)", () => {
    let content: string;

    beforeAll(() => {
      content = readScreenContent("phone-input");
    });

    test("phone-input should NOT import AuthVideoBackground", () => {
      // EXPECTED OUTCOME: FAILS — phone-input.tsx imports AuthVideoBackground
      // Counterexample: import AuthVideoBackground from "@/components/molecules/AuthVideoBackground"
      expect(importsAuthVideoBackground(content)).toBe(false);
    });

    test("phone-input should NOT render <AuthVideoBackground>", () => {
      // EXPECTED OUTCOME: FAILS — phone-input.tsx renders <AuthVideoBackground>
      // Counterexample: <View className="h-[55vh]"><AuthVideoBackground /></View>
      expect(usesAuthVideoBackground(content)).toBe(false);
    });

    test("phone-input should NOT import VideoView from expo-video", () => {
      expect(importsVideoView(content)).toBe(false);
    });

    test("phone-input should NOT render <VideoView>", () => {
      expect(usesVideoView(content)).toBe(false);
    });

    test("phone-input should NOT render any video component", () => {
      // EXPECTED OUTCOME: FAILS — video component present
      expect(rendersVideoComponent(content)).toBe(false);
    });
  });

  describe("otp-input: should NOT render video components (FAILS on unfixed code)", () => {
    let content: string;

    beforeAll(() => {
      content = readScreenContent("otp-input");
    });

    test("otp-input should NOT import AuthVideoBackground", () => {
      // EXPECTED OUTCOME: FAILS — otp-input.tsx imports AuthVideoBackground
      expect(importsAuthVideoBackground(content)).toBe(false);
    });

    test("otp-input should NOT render <AuthVideoBackground>", () => {
      // EXPECTED OUTCOME: FAILS — otp-input.tsx renders <AuthVideoBackground>
      // Counterexample: <View className="h-[52vh]"><AuthVideoBackground /></View>
      expect(usesAuthVideoBackground(content)).toBe(false);
    });

    test("otp-input should NOT render any video component", () => {
      expect(rendersVideoComponent(content)).toBe(false);
    });
  });

  describe("set-password: should NOT render video components (FAILS on unfixed code)", () => {
    let content: string;

    beforeAll(() => {
      content = readScreenContent("set-password");
    });

    test("set-password should NOT import AuthVideoBackground", () => {
      // EXPECTED OUTCOME: FAILS — set-password.tsx imports AuthVideoBackground
      expect(importsAuthVideoBackground(content)).toBe(false);
    });

    test("set-password should NOT render <AuthVideoBackground>", () => {
      // EXPECTED OUTCOME: FAILS — set-password.tsx renders <AuthVideoBackground>
      // Counterexample: <View className="h-[52vh]"><AuthVideoBackground /></View>
      expect(usesAuthVideoBackground(content)).toBe(false);
    });

    test("set-password should NOT render any video component", () => {
      expect(rendersVideoComponent(content)).toBe(false);
    });
  });

  describe("personal-details: should NOT render video components (FAILS on unfixed code)", () => {
    let content: string;

    beforeAll(() => {
      content = readScreenContent("personal-details");
    });

    test("personal-details should NOT import VideoView from expo-video", () => {
      // EXPECTED OUTCOME: FAILS — personal-details.tsx imports VideoView from expo-video
      expect(importsVideoView(content)).toBe(false);
    });

    test("personal-details should NOT import useVideoPlayer from expo-video", () => {
      // EXPECTED OUTCOME: FAILS — personal-details.tsx imports useVideoPlayer
      expect(importsUseVideoPlayer(content)).toBe(false);
    });

    test("personal-details should NOT render <VideoView>", () => {
      // EXPECTED OUTCOME: FAILS — personal-details.tsx renders <VideoView> at screenHeight * 0.28
      expect(usesVideoView(content)).toBe(false);
    });

    test("personal-details should NOT render any video component", () => {
      expect(rendersVideoComponent(content)).toBe(false);
    });
  });

  describe("land-details: should NOT render video components (FAILS on unfixed code)", () => {
    let content: string;

    beforeAll(() => {
      content = readScreenContent("land-details");
    });

    test("land-details should NOT import VideoView from expo-video", () => {
      // EXPECTED OUTCOME: FAILS — land-details.tsx imports VideoView from expo-video
      expect(importsVideoView(content)).toBe(false);
    });

    test("land-details should NOT import useVideoPlayer from expo-video", () => {
      // EXPECTED OUTCOME: FAILS — land-details.tsx imports useVideoPlayer
      expect(importsUseVideoPlayer(content)).toBe(false);
    });

    test("land-details should NOT render <VideoView>", () => {
      // EXPECTED OUTCOME: FAILS — land-details.tsx renders <VideoView> at screenHeight * 0.28
      // Counterexample: land-details renders VideoView at 28% height (videoHeight = screenHeight * 0.28)
      expect(usesVideoView(content)).toBe(false);
    });

    test("land-details should NOT render any video component", () => {
      expect(rendersVideoComponent(content)).toBe(false);
    });
  });

  describe("livestock-details: should NOT render video components (FAILS on unfixed code)", () => {
    let content: string;

    beforeAll(() => {
      content = readScreenContent("livestock-details");
    });

    test("livestock-details should NOT import VideoView from expo-video", () => {
      // EXPECTED OUTCOME: FAILS — livestock-details.tsx imports VideoView from expo-video
      expect(importsVideoView(content)).toBe(false);
    });

    test("livestock-details should NOT import useVideoPlayer from expo-video", () => {
      // EXPECTED OUTCOME: FAILS — livestock-details.tsx imports useVideoPlayer
      expect(importsUseVideoPlayer(content)).toBe(false);
    });

    test("livestock-details should NOT render <VideoView>", () => {
      // EXPECTED OUTCOME: FAILS — livestock-details.tsx renders <VideoView> at screenHeight * 0.28
      expect(usesVideoView(content)).toBe(false);
    });

    test("livestock-details should NOT render any video component", () => {
      expect(rendersVideoComponent(content)).toBe(false);
    });
  });

  describe("KeyboardAvoidingView: all screens should use correct platform-conditional behavior", () => {
    test.each(Object.keys(AUTH_SCREEN_FILES))(
      "%s should use behavior={Platform.OS === 'ios' ? 'padding' : 'height'} (not hardcoded 'padding')",
      (screenName) => {
        const content = readScreenContent(screenName);
        // EXPECTED OUTCOME: FAILS for phone-input, otp-input, set-password
        // which use behavior="padding" hardcoded on both platforms
        expect(hasCorrectRootKeyboardAvoidingView(content)).toBe(true);
      }
    );
  });

  describe("Summary: no auth screen should render a video component", () => {
    test("none of the six auth screens should render AuthVideoBackground or VideoView", () => {
      const screensWithVideo: string[] = [];

      for (const [screenName] of Object.entries(AUTH_SCREEN_FILES)) {
        const content = readScreenContent(screenName);
        if (rendersVideoComponent(content)) {
          screensWithVideo.push(screenName);
        }
      }

      // EXPECTED OUTCOME: FAILS — multiple screens render video components
      // Counterexamples:
      //   - phone-input renders AuthVideoBackground at h-[55vh]
      //   - otp-input renders AuthVideoBackground at h-[52vh]
      //   - set-password renders AuthVideoBackground at h-[52vh]
      //   - personal-details renders VideoView at 28% height
      //   - land-details renders VideoView at 28% height
      //   - livestock-details renders VideoView at 28% height
      expect(screensWithVideo).toEqual([]);
    });
  });
});
