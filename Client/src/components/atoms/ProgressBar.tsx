// src/components/atoms/ProgressBar.tsx
import React from "react";
import { View } from "react-native";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  return (
    <View className="flex-row h-2 gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`flex-1 rounded-full ${
            index <= currentStep ? "bg-secondary-harvest" : "bg-white/30"
          }`}
        />
      ))}
    </View>
  );
}
