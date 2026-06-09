// src/app/search.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, TextInput, View } from "react-native";
import AppText from "../components/atoms/AppText";
import SearchResults from "../components/molecules/SearchResults";
import { useSearch } from "../hooks/useSearch";
import { useTranslation } from "../i18n";
import { theme } from "../styles/colors";

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { q: initialQuery } = useLocalSearchParams<{ q: string }>();
  const { searchQuery, searchResults, performSearch, clearSearch, totalResults, loading, isSearching, typeFilter, setTypeFilter } = useSearch();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (initialQuery) performSearch(initialQuery);
  }, [initialQuery, performSearch]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const hasQuery = searchQuery.trim().length > 0;
  const showEmpty = hasQuery && totalResults === 0 && !isSearching && !loading;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: theme.background.screen }}>

      {/* ── Header ── */}
      <View style={{ paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: theme.background.input, borderBottomWidth: 1, borderBottomColor: theme.border.subtle }}>

        {/* Back + Title */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ marginRight: 12, backgroundColor: theme.background.screen, borderRadius: 12, padding: 12, minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </Pressable>
          <AppText style={{ color: "#111827", fontSize: 18, fontWeight: "700" }}>
            {t("search.title")}
          </AppText>
        </View>

        {/* Search Input */}
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.background.screen, borderRadius: 16, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: theme.border.subtle }}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            ref={inputRef}
            value={searchQuery}
            onChangeText={performSearch}
            placeholder={t("search.placeholder") || "Search schemes, programs, events..."}
            placeholderTextColor="#9CA3AF"
            style={{ flex: 1, marginLeft: 10, fontSize: 15, color: "#111827", fontWeight: "500" }}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {hasQuery && (
            <Pressable
              onPress={() => { clearSearch(); inputRef.current?.focus(); }}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={16} color="#6B7280" />
            </Pressable>
          )}
          {isSearching && (
            <ActivityIndicator size="small" color="#16A34A" style={{ marginLeft: 8 }} />
          )}
        </View>

        {/* Type-filter chip row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8, gap: 8 }}
          accessibilityRole="tablist"
        >
          {(
            [
              { label: "All", value: "all" },
              { label: "Scheme", value: "scheme" },
              { label: "Program", value: "training" },
              { label: "Event", value: "event" },
            ] as const
          ).map(({ label, value }) => {
            const active = typeFilter === value;
            return (
              <Pressable
                key={value}
                onPress={() => setTypeFilter(value)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Filter by ${label}`}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: active ? theme.primary.greenDark : theme.background.screen,
                  borderWidth: 1,
                  borderColor: active ? theme.primary.greenDark : theme.border.subtle,
                }}
              >
                <AppText
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: active ? theme.text.onPrimary : theme.text.muted,
                  }}
                >
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Results count — live region so screen reader announces changes */}
        <View
          accessible={true}
          accessibilityLiveRegion="polite"
          accessibilityLabel={
            hasQuery && totalResults > 0 && !isSearching
              ? `${totalResults} results found`
              : hasQuery && totalResults === 0 && !isSearching && !loading
              ? "No results found"
              : ""
          }
        >
          {hasQuery && totalResults > 0 && !isSearching && (
            <View className="flex-row items-center mt-2.5 gap-1.5">
              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
              <AppText style={{ color: "#6B7280", fontSize: 13, fontWeight: "500" }}>
                {t("search.resultsCount", { count: totalResults })}
              </AppText>
            </View>
          )}
        </View>
      </View>

      {/* ── States ── */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16A34A" />
          <AppText style={{ marginTop: 12, color: "#9CA3AF", fontSize: 13 }}>
            {t("common.loading")}
          </AppText>
        </View>

      ) : showEmpty ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.background.screen, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Ionicons name="search-outline" size={32} color="#D1D5DB" />
          </View>
          <AppText style={{ color: "#374151", fontSize: 17, fontWeight: "700", textAlign: "center", marginBottom: 6 }}>
            {t("search.noResults")}
          </AppText>
          <AppText style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
            {t("search.noResultsHint") || "Try using different keywords or check the spelling"}
          </AppText>
        </View>

      ) : !hasQuery ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.background.successSubtle, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Ionicons name="search-outline" size={32} color="#16A34A" />
          </View>
          <AppText style={{ color: "#374151", fontSize: 17, fontWeight: "700", textAlign: "center", marginBottom: 6 }}>
            {t("search.startSearching") || "Start searching"}
          </AppText>
          <AppText style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
            {t("search.startSearchingHint") || "Search for schemes, training programs, events and more"}
          </AppText>
        </View>

      ) : (
        <SearchResults results={searchResults} />
      )}
    </KeyboardAvoidingView>
  );
}