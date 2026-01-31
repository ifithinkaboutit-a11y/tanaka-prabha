// src/app/search.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import AppText from "../components/atoms/AppText";
import SearchBar from "../components/molecules/SearchBar";
import SearchResults from "../components/molecules/SearchResults";
import { useSearch } from "../hooks/useSearch";
import { useTranslation } from "../i18n";

export default function SearchScreen() {
  const { t } = useTranslation();
  const { q: initialQuery } = useLocalSearchParams<{ q: string }>();
  const { searchResults, performSearch, totalResults } = useSearch();

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  return (
    <View className="flex-1 bg-neutral-surface">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-white">
        <AppText variant="h2" className="mb-4">
          {t("search.title")}
        </AppText>
        <SearchBar
          placeholder={t("search.placeholder")}
          onSearch={performSearch}
        />
        {totalResults > 0 && (
          <AppText variant="bodySm" className="mt-2 text-neutral-textLight">
            {t("search.resultsCount", { count: totalResults })}
          </AppText>
        )}
      </View>

      {/* Search Results */}
      <SearchResults results={searchResults} />
    </View>
  );
}
