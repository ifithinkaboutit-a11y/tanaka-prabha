// src/components/atoms/InterestButton.tsx
// Atom component for the "Interested" toggle button.
// Shows a filled/unfilled heart icon alongside the interest count.
// Requirements: 5.1.1, 5.1.2
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";
import { theme } from "../../styles/colors";

export interface InterestButtonProps {
  isInterested: boolean;
  count: number;
  onToggle: () => void;
  loading?: boolean;
}

export default function InterestButton({
  isInterested,
  count,
  onToggle,
  loading = false,
}: InterestButtonProps) {
  return (
    <Pressable
      onPress={loading ? undefined : onToggle}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={isInterested ? "Remove interest" : "Express interest"}
      accessibilityState={{ disabled: loading, checked: isInterested }}
      style={({ pressed }) => [
        styles.container,
        isInterested && styles.containerActive,
        pressed && !loading && styles.containerPressed,
        loading && styles.containerDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isInterested ? theme.semantic.like : theme.text.muted}
          style={styles.icon}
        />
      ) : (
        <Ionicons
          name={isInterested ? "heart" : "heart-outline"}
          size={18}
          color={isInterested ? theme.semantic.like : theme.text.muted}
          style={styles.icon}
        />
      )}
      <AppText
        variant="caption"
        style={[styles.count, isInterested && styles.countActive]}
      >
        {count}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border.card,
    backgroundColor: theme.background.input,
    minHeight: 48,
  },
  containerActive: {
    borderColor: theme.semantic.likeSubtle,
    backgroundColor: theme.semantic.likeBackground,
  },
  containerPressed: {
    opacity: 0.75,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 5,
  },
  count: {
    color: theme.text.muted,
    fontWeight: "600",
  },
  countActive: {
    color: theme.semantic.like,
  },
});
