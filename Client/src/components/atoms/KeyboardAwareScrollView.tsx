import React, { useRef, useEffect, useCallback } from "react";
import {
  ScrollView,
  ScrollViewProps,
  Keyboard,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  KeyboardEvent,
} from "react-native";

// Minimum breathing room above the keyboard on Android (px)
const ANDROID_MIN_EXTRA_HEIGHT = 20;

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  extraScrollHeight?: number;
}

export function KeyboardAwareScrollView({
  children,
  extraScrollHeight = ANDROID_MIN_EXTRA_HEIGHT,
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

  useEffect(() => {
    if (Platform.OS === "ios") return;

    const showSub = Keyboard.addListener(
      "keyboardDidShow",
      (e: KeyboardEvent) => {
        const focusedInput = TextInput.State.currentlyFocusedInput();

        if (!focusedInput || !scrollViewRef.current) return;

        focusedInput.measure((_x, _y, _width, height, _pageX, pageY) => {
          // Bottom edge of the focused input, plus the required breathing room
          const androidExtra = Math.max(extraScrollHeight, ANDROID_MIN_EXTRA_HEIGHT);
          const inputBottom = pageY + height + androidExtra;
          // The keyboard top Y is the bottom of the visible area
          const visibleAreaBottom = e.endCoordinates.screenY;
          const overlap = inputBottom - visibleAreaBottom;

          if (overlap > 0) {
            scrollViewRef.current?.scrollTo({
              y: scrollOffsetRef.current + overlap,
              animated: true,
            });
          }
        });
      }
    );

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      scrollViewRef.current?.scrollTo({
        y: scrollOffsetRef.current,
        animated: true,
      });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [extraScrollHeight]);

  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          {...scrollViewProps}
          onScroll={handleScroll}
          scrollEventThrottle={scrollViewProps.scrollEventThrottle ?? 16}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      {...scrollViewProps}
      onScroll={handleScroll}
      scrollEventThrottle={scrollViewProps.scrollEventThrottle ?? 16}
    >
      {children}
    </ScrollView>
  );
}

export default KeyboardAwareScrollView;
