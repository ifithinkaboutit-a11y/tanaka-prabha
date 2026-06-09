import React, { useRef, useEffect, useCallback } from "react";
import {
  ScrollView,
  ScrollViewProps,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  KeyboardEvent,
  findNodeHandle,
  UIManager,
} from "react-native";

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  extraScrollHeight?: number;
  keyboardVerticalOffset?: number;
}

export function KeyboardAwareScrollView({
  children,
  extraScrollHeight = 24,
  keyboardVerticalOffset = Platform.OS === "ios" ? 0 : 0,
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
    const showSub = Keyboard.addListener(
      "keyboardDidShow",
      (e: KeyboardEvent) => {
        if (!scrollViewRef.current) return;
        const scrollResponder = scrollViewRef.current?.getScrollResponder();
        if (!scrollResponder) return;

        const handle = findNodeHandle(scrollResponder as unknown as number);
        if (!handle) return;

        UIManager.measure(handle, (_x, _y, _w, contentHeight, _px, pageY) => {
          const keyboardTop = e.endCoordinates.screenY;
          const scrollBottom = pageY + contentHeight;
          const overlap = scrollBottom - keyboardTop + extraScrollHeight;

          if (overlap > 0) {
            scrollViewRef.current?.scrollTo({
              y: scrollOffsetRef.current + overlap,
              animated: true,
            });
          }
        });
      }
    );

    return () => {
      showSub.remove();
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

export default KeyboardAwareScrollView;

