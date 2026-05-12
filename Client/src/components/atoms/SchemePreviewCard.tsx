// src/components/molecules/SchemePreviewCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { colors, theme } from "../../styles/colors";
import AppText from "../atoms/AppText";
import Card from "../atoms/Card";
import { SchemeEligibilityBadge, checkSchemeEligibility } from "../molecules/SchemeEligibilityBadge";

type SchemePreviewCardProps = {
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  category: string;
  imageUrl?: string;
  onPress?: () => void;
  showBookmark?: boolean;
  interestCount?: number;
  isEligible?: boolean;
  eligibilityDetails?: {
    minLandArea?: number;
    maxLandArea?: number;
    requiredCategories?: string[];
    districts?: string[];
  };
  userProfile?: {
    landDetails?: { totalLandArea?: number };
    livestockDetails?: Record<string, number>;
    district?: string;
    interests?: string[];
  };
};

export default function SchemePreviewCard({
  title,
  titleHi,
  description,
  descriptionHi,
  category,
  imageUrl,
  onPress,
  showBookmark = true,
  interestCount,
  isEligible: propEligible,
  eligibilityDetails,
  userProfile,
}: SchemePreviewCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Calculate eligibility if not provided
  const { isEligible, matchDetails } = React.useMemo(() => {
    if (propEligible !== undefined) {
      return { isEligible: propEligible, matchDetails: undefined };
    }
    if (eligibilityDetails && userProfile) {
      return checkSchemeEligibility(eligibilityDetails, userProfile);
    }
    return { isEligible: true, matchDetails: undefined };
  }, [propEligible, eligibilityDetails, userProfile]);

  const isHindi = require('@/stores/languageStore').useLanguageStore.getState?.()?.currentLanguage === 'hi' || false;

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
            {(isHindi && titleHi) || title}
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
          {(isHindi && descriptionHi) || description}
        </AppText>

        {/* Category Badge + Interest Count */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <AppText variant="caption" style={styles.badgeText}>
              {category}
            </AppText>
          </View>
          {interestCount !== undefined && (
            <View style={styles.interestBadge}>
              <Ionicons name="heart" size={12} color={theme.semantic.like} />
              <AppText variant="caption" style={styles.interestText}>
                {interestCount}
              </AppText>
            </View>
          )}
        </View>

        {/* Eligibility Badge */}
        <View style={styles.eligibilityRow}>
          <SchemeEligibilityBadge
            isEligible={isEligible}
            matchDetails={matchDetails}
          />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: theme.background.input,
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
    gap: 8,
  },
  badge: {
    backgroundColor: theme.background.successSubtle,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: colors.primary.green,
    fontWeight: "500",
  },
  interestBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.background.errorSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  interestText: {
    color: theme.semantic.like,
    fontWeight: "500",
  },
  eligibilityRow: {
    marginTop: 12,
  },
});
