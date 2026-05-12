// components/ScreenWrapper.tsx

import React from "react";
import { KeyboardAwareScrollView } from "@/components/atoms/KeyboardAwareScrollView";

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
            extraScrollHeight={extraScrollHeight}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            {children}
        </KeyboardAwareScrollView>
    );
}