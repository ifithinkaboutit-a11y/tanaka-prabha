// src/components/molecules/OnboardingHeader.tsx
import React from "react";
import { View } from "react-native";
import AppText from "../atoms/AppText";
import ProgressBar from "../atoms/ProgressBar";

interface OnboardingHeaderProps {
  title: string;
  subtitle: string;
  currentStep?: number;
  totalSteps?: number;
}

export default function OnboardingHeader({
  title,
  subtitle,
  currentStep = 0,
  totalSteps = 3,
}: OnboardingHeaderProps) {
  return (
    <View className="bg-primary pt-12 pb-8 px-6 rounded-b-[40px]">
      {/* Progress Bar */}
      <View className="mb-6">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </View>

      {/* Sun icon */}
      <View className="items-center mb-4">
        <View className="w-20 h-20 items-center justify-center">
          {/* Sun rays */}
          <View className="absolute w-24 h-24">
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                className="absolute w-1 h-4 bg-secondary-harvest rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: [
                    { translateX: -2 },
                    { translateY: -40 },
                    { rotate: `${i * 45}deg` },
                  ],
                  transformOrigin: "center bottom",
                }}
              />
            ))}
          </View>
          {/* Sun circle */}
          <View className="w-12 h-12 bg-secondary-harvest rounded-full" />
        </View>
      </View>

      {/* Title */}
      <AppText
        variant="h2"
        className="text-white text-center font-bold text-2xl"
      >
        {title}
      </AppText>

      {/* Subtitle */}
      <AppText variant="bodySm" className="text-white/80 text-center mt-2">
        {subtitle}
      </AppText>
    </View>
  );
}
