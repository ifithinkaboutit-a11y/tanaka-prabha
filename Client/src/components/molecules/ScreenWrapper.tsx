// components/ScreenWrapper.tsx

import React from "react";
import { Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type Props = {
    children: React.ReactNode;
    extraScrollHeight?: number;
};

export default function ScreenWrapper({
    children,
    extraScrollHeight = 20,
}: Props) {
    return (
        <KeyboardAwareScrollView
            enableOnAndroid
            extraScrollHeight={extraScrollHeight}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            {children}
        </KeyboardAwareScrollView>
    );
}