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

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  extraScrollHeight?: number;
}

export function KeyboardAwareScrollView({
  children,
  extraScrollHeight = 20,
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
        const keyboardHeight = e.endCoordinates.height;
        const focusedInput = TextInput.State.currentlyFocusedInput();

        if (!focusedInput || !scrollViewRef.current) return;

        focusedInput.measure((_x, _y, _width, height, _pageX, pageY) => {
          const inputBottom = pageY + height + extraScrollHeight;
          const screenBottom =
            e.endCoordinates.screenY ?? e.endCoordinates.height;
          const overlap = inputBottom - (screenBottom - keyboardHeight);

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
