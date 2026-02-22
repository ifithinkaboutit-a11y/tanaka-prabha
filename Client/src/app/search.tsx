// src/app/search.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import AppText from "../components/atoms/AppText";
import SearchResults from "../components/molecules/SearchResults";
import { useSearch } from "../hooks/useSearch";
import { useTranslation } from "../i18n";

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { q: initialQuery } = useLocalSearchParams<{ q: string }>();
  const { searchQuery, searchResults, performSearch, clearSearch, totalResults, loading, isSearching } = useSearch();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  // Auto-focus the input
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const hasQuery = searchQuery.trim().length > 0;
  const showEmpty = hasQuery && totalResults === 0 && !isSearching && !loading;

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View style={{
        paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
      }}>
        {/* Back + Title row */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              marginRight: 12, padding: 6,
              backgroundColor: "#F3F4F6", borderRadius: 10,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </Pressable>
          <AppText variant="h3" style={{ color: "#111827", fontSize: 18, fontWeight: "700" }}>
            {t("search.title")}
          </AppText>
        </View>

        {/* Search input */}
        <View style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: "#F3F4F6", borderRadius: 14,
          paddingHorizontal: 14, height: 48,
          borderWidth: 1, borderColor: "#E5E7EB",
        }}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            ref={inputRef}
            value={searchQuery}
            onChangeText={performSearch}
            placeholder={t("search.placeholder") || "Search schemes, programs, events..."}
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1, marginLeft: 10, fontSize: 15,
              color: "#111827", fontWeight: "500",
            }}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {hasQuery && (
            <Pressable
              onPress={() => {
                clearSearch();
                inputRef.current?.focus();
              }}
              style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: "#E5E7EB",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={16} color="#6B7280" />
            </Pressable>
          )}
          {isSearching && (
            <ActivityIndicator size="small" color="#16A34A" style={{ marginLeft: 8 }} />
          )}
        </View>

        {/* Results count */}
        {hasQuery && totalResults > 0 && !isSearching && (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 6 }}>
            <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
            <AppText variant="bodySm" style={{ color: "#6B7280", fontSize: 13, fontWeight: "500" }}>
              {t("search.resultsCount", { count: totalResults })}
            </AppText>
          </View>
        )}
      </View>

      {/* Search Results */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#16A34A" />
          <AppText variant="bodySm" style={{ marginTop: 12, color: "#9CA3AF" }}>
            {t("common.loading")}
          </AppText>
        </View>
      ) : showEmpty ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: "#F3F4F6",
            alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <Ionicons name="search-outline" size={32} color="#D1D5DB" />
          </View>
          <AppText variant="h3" style={{ color: "#374151", marginBottom: 6, textAlign: "center", fontWeight: "700" }}>
            {t("search.noResults")}
          </AppText>
          <AppText variant="bodySm" style={{ color: "#9CA3AF", textAlign: "center", lineHeight: 20 }}>
            {t("search.noResultsHint") || "Try using different keywords or check the spelling"}
          </AppText>
        </View>
      ) : !hasQuery ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: "#F0FDF4",
            alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <Ionicons name="search-outline" size={32} color="#16A34A" />
          </View>
          <AppText variant="h3" style={{ color: "#374151", marginBottom: 6, textAlign: "center", fontWeight: "700" }}>
            {t("search.startSearching") || "Start searching"}
          </AppText>
          <AppText variant="bodySm" style={{ color: "#9CA3AF", textAlign: "center", lineHeight: 20 }}>
            {t("search.startSearchingHint") || "Search for schemes, training programs, events and more"}
          </AppText>
        </View>
      ) : (
        <SearchResults results={searchResults} />
      )}
    </View>
  );
}
