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
    <View style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
      {/* Header */}
      <View style={{ paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: "#FFFFFF" }}>
        <AppText variant="h2" style={{ marginBottom: 16 }}>
          {t("search.title")}
        </AppText>
        <SearchBar
          placeholder={t("search.placeholder")}
          onSearch={performSearch}
        />
        {totalResults > 0 && (
          <AppText variant="bodySm" style={{ marginTop: 8, color: "#9E9E9E" }}>
            {t("search.resultsCount", { count: totalResults })}
          </AppText>
        )}
      </View>

      {/* Search Results */}
      <SearchResults results={searchResults} />
    </View>
  );
}
