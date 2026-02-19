// src/components/molecules/SearchResults.tsx
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTranslation } from "../../i18n";
import { colors } from "../../styles/colors";
import AppText from "../atoms/AppText";
import Card from "../atoms/Card";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "scheme" | "training" | "quickAction";
  item: any;
}

interface SearchResultsProps {
  results: SearchResult[];
  onResultPress?: (result: SearchResult) => void;
}

export default function SearchResults({
  results,
  onResultPress,
}: SearchResultsProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleResultPress = (result: SearchResult) => {
    if (onResultPress) {
      onResultPress(result);
      return;
    }

    // Default navigation based on type
    switch (result.type) {
      case "scheme":
        router.push(`/scheme-details?schemeId=${result.id}` as any);
        break;
      case "training":
        router.push(`/program-details?programId=${result.id}` as any);
        break;
      case "quickAction":
        // Handle quick action navigation based on the result item
        if (result.item?.route) {
          router.push(result.item.route as any);
        }
        break;
      default:
        break;
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity onPress={() => handleResultPress(item)}>
      <Card style={styles.resultCard}>
        <View style={styles.resultContent}>
          <View style={styles.resultHeader}>
            <AppText variant="h3" style={styles.resultTitle}>
              {item.title}
            </AppText>
            <View style={styles.categoryBadge}>
              <AppText variant="caption" style={styles.categoryText}>
                {item.category}
              </AppText>
            </View>
          </View>
          <AppText variant="bodySm" style={styles.resultDescription}>
            {item.description}
          </AppText>
          <AppText variant="caption" style={styles.resultType}>
            {item.type === "scheme"
              ? t("search.scheme")
              : item.type === "training"
                ? t("search.trainingProgram")
                : t("search.quickAction")}
          </AppText>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AppText variant="bodyMd" style={styles.emptyText}>
          {t("search.noResults")}
        </AppText>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      renderItem={renderResult}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 8 }}
    />
  );
}

const styles = StyleSheet.create({
  resultCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  resultContent: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  resultTitle: {
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: "rgba(56, 102, 65, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: colors.primary.green,
  },
  resultDescription: {
    color: colors.neutral.textLight,
    marginBottom: 8,
  },
  resultType: {
    color: colors.neutral.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    color: colors.neutral.textLight,
    textAlign: "center",
  },
});
