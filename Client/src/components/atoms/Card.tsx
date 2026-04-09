// src/components/atoms/Card.tsx
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../../styles/colors";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border.card,
  },
});
