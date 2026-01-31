// src/app/category-listing.tsx - Category Listing (Screen 3)
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import AppText from "../components/atoms/AppText";
import SchemePreviewCard from "../components/atoms/SchemePreviewCard";
import SearchBar from "../components/molecules/SearchBar";
import { schemes } from "../data/content";
import { useTranslation } from "../i18n";

const CategoryListing = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  // Filter schemes by category
  const categorySchemes = useMemo(() => {
    return schemes.filter((scheme) => scheme.category === category);
  }, [category]);

  // Filter and sort schemes based on search and sort options
  const filteredSchemes = useMemo(() => {
    let filtered = categorySchemes;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (scheme) =>
          scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scheme.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "date":
          // Assuming date is in format "DD Month YYYY"
          return (
            new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [categorySchemes, searchQuery, sortBy]);

  const handleSchemePress = (scheme: any) => {
    router.push({
      pathname: "/program-details",
      params: { programId: scheme.id },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-neutral-surface">
      {/* Navigation Header */}
      <View className="pt-12 pb-4 px-8 bg-white">
        <View className="flex-row items-center mb-2">
          <Pressable onPress={handleBack} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <AppText variant="h1" className="text-neutral-textDark flex-1">
            {category}
          </AppText>
        </View>
        <AppText variant="bodyMd" className="text-neutral-textMedium">
          {filteredSchemes.length} {t("schemes.schemeDetails")}
        </AppText>
      </View>

      {/* Search Bar */}
      <View className="py-4 px-4">
        <SearchBar
          placeholder={t("schemes.searchPlaceholder")}
          onSearch={setSearchQuery}
        />
      </View>

      {/* Sort and Filter Controls */}
      <View className="px-4 pb-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <AppText variant="bodyMd" className="text-neutral-textDark mr-2">
              {t("schemes.sortBy")}:
            </AppText>
            <Pressable
              onPress={() => setSortBy(sortBy === "name" ? "date" : "name")}
              className="flex-row items-center"
            >
              <AppText variant="bodyMd" className="text-primary mr-1">
                {sortBy === "name"
                  ? t("schemes.sortByName")
                  : t("schemes.sortByDate")}
              </AppText>
              <Ionicons name="chevron-down" size={16} color="#386641" />
            </Pressable>
          </View>

          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            className="flex-row items-center"
          >
            <Ionicons name="filter" size={16} color="#386641" />
            <AppText variant="bodyMd" className="text-primary ml-1">
              {t("schemes.filters")}
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* Schemes List */}
      <View className="px-4">
        {filteredSchemes.map((scheme) => (
          <SchemePreviewCard
            key={scheme.id}
            title={scheme.title}
            description={scheme.description}
            category={scheme.category}
            imageUrl={scheme.imageUrl}
            onPress={() => handleSchemePress(scheme)}
          />
        ))}

        {filteredSchemes.length === 0 && (
          <View className="items-center justify-center py-12">
            <Ionicons name="search" size={48} color="#D1D5DB" />
            <AppText
              variant="bodyMd"
              className="text-neutral-textMedium mt-4 text-center"
            >
              {t("schemes.noSchemesFound")}
            </AppText>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CategoryListing;
