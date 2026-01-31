// src/components/molecules/SearchResults.tsx
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { useTranslation } from "../../i18n";
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
        router.push(`/scheme-details?id=${result.id}`);
        break;
      case "training":
        router.push(`/program-details?id=${result.id}`);
        break;
      case "quickAction":
        // Handle quick action navigation
        break;
      default:
        break;
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity onPress={() => handleResultPress(item)}>
      <Card className="mx-4 mb-2">
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <AppText variant="h3" className="flex-1 mr-2">
              {item.title}
            </AppText>
            <View className="bg-primary-light px-2 py-1 rounded">
              <AppText variant="caption" className="text-primary-main">
                {item.category}
              </AppText>
            </View>
          </View>
          <AppText variant="bodySm" className="text-neutral-textLight mb-2">
            {item.description}
          </AppText>
          <AppText variant="caption" className="text-neutral-textLight">
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
      <View className="flex-1 justify-center items-center p-8">
        <AppText
          variant="bodyMd"
          className="text-neutral-textLight text-center"
        >
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
