// src/components/atoms/CategoryCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { colors } from "../../styles/colors";
import AppText from "./AppText";
import Card from "./Card";

type CategoryCardProps = {
  title: string;
  count: number;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  onPress?: () => void;
};

export default function CategoryCard({
  title,
  count,
  icon,
  onPress,
}: CategoryCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.leftRow}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={20} color={colors.primary.green} />
            </View>
            <View style={styles.textContainer}>
              <AppText
                variant="bodyMd"
                style={styles.title}
              >
                {title}
              </AppText>
              <AppText variant="caption" style={styles.count}>
                {count} schemes
              </AppText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(56, 102, 65, 0.1)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    color: colors.neutral.textDark,
  },
  count: {
    color: colors.neutral.textMedium,
  },
});