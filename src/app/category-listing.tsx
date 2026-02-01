// src/app/category-listing.tsx - Category Listing (Screen 3)
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AppText from "../components/atoms/AppText";
import SchemePreviewCard from "../components/atoms/SchemePreviewCard";
import { schemes } from "../data/content";
import {
    categoryToSchemeCategory,
    schemeCategories,
} from "../data/content/schemeCategories";
import { useTranslation } from "../i18n";

const CategoryListing = () => {
  const router = useRouter();
  const { category, type } = useLocalSearchParams<{
    category: string;
    type?: string;
  }>();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  // Get category info
  const categoryInfo = useMemo(() => {
    return schemeCategories.find((c) => c.id === category);
  }, [category]);

  // Get the mapped category name for filtering
  const mappedCategory = useMemo(() => {
    if (category === "all") return null;
    return categoryToSchemeCategory[category] || category;
  }, [category]);

  // Filter schemes by category
  const categorySchemes = useMemo(() => {
    if (!mappedCategory) return schemes; // "all" category shows all schemes
    return schemes.filter((scheme) => scheme.category === mappedCategory);
  }, [mappedCategory]);

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
      pathname: "/scheme-details",
      params: { schemeId: scheme.id },
    });
  };

  const handleBack = () => {
    router.back();
  };

  // Get display title
  const displayTitle = categoryInfo
    ? t(categoryInfo.titleKey)
    : category === "all"
      ? t("schemesPage.allSchemes")
      : category;

  return (
    <ScrollView className="flex-1 bg-neutral-surface">
      {/* Navigation Header */}
      <View className="pt-12 pb-4 px-4 bg-white border-b border-neutral-border">
        <View className="flex-row items-center">
          <Pressable onPress={handleBack} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#212121" />
          </Pressable>
          <AppText
            variant="h3"
            className="text-neutral-textDark flex-1 font-semibold"
            numberOfLines={1}
          >
            {displayTitle}
          </AppText>
        </View>
      </View>

      {/* Search Bar */}
      <View className="py-3 px-4 bg-white">
        <View className="flex-row items-center bg-neutral-surface rounded-xl px-4 py-3 border border-neutral-border">
          <Ionicons name="search" size={20} color="#9E9E9E" />
          <TextInput
            className="flex-1 ml-3 text-neutral-textDark"
            placeholder={t("schemesPage.searchPlaceholder")}
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="mic-outline" size={20} color="#9E9E9E" />
        </View>
      </View>

      {/* Sort and Filter Controls */}
      <View className="px-4 py-3 bg-white flex-row justify-center items-center border-t border-neutral-border">
        <TouchableOpacity
          onPress={() => setSortBy(sortBy === "name" ? "date" : "name")}
          className="flex-row items-center mr-8"
        >
          <Ionicons name="swap-vertical" size={16} color="#757575" />
          <AppText variant="bodySm" className="text-neutral-textMedium ml-2">
            {t("schemesPage.sortBy")}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className="flex-row items-center"
        >
          <Ionicons name="options-outline" size={16} color="#757575" />
          <AppText variant="bodySm" className="text-neutral-textMedium ml-2">
            {t("schemesPage.filters")}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Schemes List */}
      <View className="px-4 pt-4">
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
              {t("schemesPage.noSchemesFound")}
            </AppText>
          </View>
        )}
      </View>

      <View className="h-8" />
    </ScrollView>
  );
};

export default CategoryListing;
