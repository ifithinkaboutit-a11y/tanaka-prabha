// src/components/atoms/ProgressBar.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../../styles/colors";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.step,
            {
              backgroundColor:
                index <= currentStep
                  ? colors.secondary.harvest
                  : "rgba(255, 255, 255, 0.3)",
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 8,
    gap: 4,
  },
  step: {
    flex: 1,
    borderRadius: 999,
  },
});
