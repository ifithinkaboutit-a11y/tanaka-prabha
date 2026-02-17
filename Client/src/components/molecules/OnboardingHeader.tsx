// src/components/molecules/OnboardingHeader.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../../styles/colors";
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
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </View>

      {/* Sun icon */}
      <View style={styles.iconRow}>
        <View style={styles.sunOuter}>
          {/* Sun rays */}
          <View style={styles.raysContainer}>
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.ray,
                  {
                    transform: [
                      { translateX: -2 },
                      { translateY: -40 },
                      { rotate: `${i * 45}deg` },
                    ],
                  },
                ]}
              />
            ))}
          </View>
          {/* Sun circle */}
          <View style={styles.sunCircle} />
        </View>
      </View>

      {/* Title */}
      <AppText variant="h2" style={styles.title}>
        {title}
      </AppText>

      {/* Subtitle */}
      <AppText variant="bodySm" style={styles.subtitle}>
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.green,
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  progressContainer: {
    marginBottom: 24,
  },
  iconRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  sunOuter: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  raysContainer: {
    position: "absolute",
    width: 96,
    height: 96,
  },
  ray: {
    position: "absolute",
    width: 4,
    height: 16,
    backgroundColor: colors.secondary.harvest,
    borderRadius: 999,
    top: "50%",
    left: "50%",
  },
  sunCircle: {
    width: 48,
    height: 48,
    backgroundColor: colors.secondary.harvest,
    borderRadius: 24,
  },
  title: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 24,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 8,
  },
});
