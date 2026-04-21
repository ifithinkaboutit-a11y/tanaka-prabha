import React, { useRef, useEffect, useCallback } from "react";
import {
  ScrollView,
  ScrollViewProps,
  Keyboard,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  KeyboardEvent,
  Dimensions,
} from "react-native";

// Minimum breathing room above the keyboard on Android (px)
const ANDROID_MIN_EXTRA_HEIGHT = 20;

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  /** Extra pixels to scroll beyond the focused input (breathing room). */
  extraScrollHeight?: number;
  /**
   * Vertical offset for KeyboardAvoidingView on iOS.
   * Use this to account for custom headers / status-bar height.
   * Default: 0.
   */
  keyboardVerticalOffset?: number;
}

export function KeyboardAwareScrollView({
  children,
  extraScrollHeight = 24,
  keyboardVerticalOffset = 0,
  ...scrollViewProps
}: KeyboardAwareScrollViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef<number>(0);

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
      scrollViewProps.onScroll?.(event as any);
    },
    [scrollViewProps.onScroll]
  );

  // ── Android: manually scroll the focused input into view ──
  useEffect(() => {
    if (Platform.OS === "ios") return;

    const screenHeight = Dimensions.get("window").height;

    const showSub = Keyboard.addListener(
      "keyboardDidShow",
      (e: KeyboardEvent) => {
        const focusedInput = TextInput.State.currentlyFocusedInput();
        if (!focusedInput || !scrollViewRef.current) return;

        focusedInput.measure((_x, _y, _width, height, _pageX, pageY) => {
          const keyboardTop = screenHeight - e.endCoordinates.height;
          const inputBottom = pageY + height + extraScrollHeight;
          const overlap = inputBottom - keyboardTop;

          if (overlap > 0) {
            scrollViewRef.current?.scrollTo({
              y: scrollOffsetRef.current + overlap,
              animated: true,
            });
          }
        });
      }
    );

    // Don't snap back on hide — let the user stay where they scrolled
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {});

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [extraScrollHeight]);

  const scrollView = (
    <ScrollView
      ref={scrollViewRef}
      keyboardShouldPersistTaps="handled"
      {...scrollViewProps}
      onScroll={handleScroll}
      scrollEventThrottle={scrollViewProps.scrollEventThrottle ?? 16}
    >
      {children}
    </ScrollView>
  );

  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {scrollView}
      </KeyboardAvoidingView>
    );
  }

  // Android: no KeyboardAvoidingView wrapper — the manual listener
  // combined with android:windowSoftInputMode handles it.
  return scrollView;
}

export default KeyboardAwareScrollView;

