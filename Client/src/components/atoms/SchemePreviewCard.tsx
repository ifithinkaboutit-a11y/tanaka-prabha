// src/components/molecules/SchemePreviewCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { colors } from "../../styles/colors";
import AppText from "../atoms/AppText";
import Card from "../atoms/Card";

type SchemePreviewCardProps = {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  onPress?: () => void;
  showBookmark?: boolean;
};

export default function SchemePreviewCard({
  title,
  description,
  category,
  imageUrl,
  onPress,
  showBookmark = true,
}: SchemePreviewCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        {/* Title and Bookmark Row */}
        <View style={styles.titleRow}>
          <AppText
            variant="h3"
            style={styles.title}
            numberOfLines={2}
          >
            {title}
          </AppText>
          {showBookmark && (
            <TouchableOpacity
              onPress={() => setIsBookmarked(!isBookmarked)}
              style={styles.bookmarkBtn}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={22}
                color={isBookmarked ? colors.primary.green : colors.neutral.textLight}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <AppText
          variant="bodyMd"
          numberOfLines={3}
          ellipsizeMode="tail"
          style={styles.description}
        >
          {description}
        </AppText>

        {/* Category Badge */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <AppText variant="caption" style={styles.badgeText}>
              {category}
            </AppText>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    color: colors.primary.green,
    fontWeight: "600",
    flex: 1,
    paddingRight: 8,
  },
  bookmarkBtn: {
    padding: 4,
  },
  description: {
    color: colors.neutral.textMedium,
    lineHeight: 20,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: colors.primary.green,
    fontWeight: "500",
  },
});
