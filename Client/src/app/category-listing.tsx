// src/app/category-listing.tsx - Category Listing (Screen 3)
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../components/atoms/AppText";
import SchemePreviewCard from "../components/atoms/SchemePreviewCard";
import { schemesApi, Scheme } from "@/services/apiService";
import {
  categoryToSchemeCategory,
  schemeCategories,
} from "../data/content/schemeCategories";
import { useTranslation } from "../i18n";
import FilterPanel, { FilterState, TypeFilter } from "../components/molecules/FilterPanel";
import { theme } from "../styles/colors";

const CategoryListing = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    category: string;
    type?: string;
    sortBy?: string;
    categories?: string;
    typeFilter?: string;
  }>();
  const { category, type } = params;
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "newest" | "interested">(
    (params.sortBy as "name" | "newest" | "interested") || "name"
  );
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: params.categories ? params.categories.split(",") : [],
    typeFilter: (params.typeFilter as TypeFilter) || "both",
  });
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  // Get category info
  const categoryInfo = useMemo(() => {
    return schemeCategories.find((c) => c.id === category);
  }, [category]);

  // Get the mapped category name for filtering
  const mappedCategory = useMemo(() => {
    if (category === "all") return undefined;
    return categoryToSchemeCategory[category] || category;
  }, [category]);

  // Fetch schemes from API
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const data = await schemesApi.getAll({
          category: mappedCategory,
          limit: 50,
        });
        setSchemes(data);
      } catch (error) {
        console.error("Error fetching schemes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [mappedCategory]);

  // Filter and sort schemes based on search and sort options
  const filteredSchemes = useMemo(() => {
    let filtered = schemes;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (scheme) =>
          scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (scheme.description || "").toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply category filter
    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter((scheme) =>
        activeFilters.categories.includes(scheme.category)
      );
    }

    // Apply type filter (scheme.type field not present — skip if 'both')
    if (activeFilters.typeFilter !== "both") {
      filtered = filtered.filter(
        (scheme) => (scheme as any).type === activeFilters.typeFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "newest":
          return (
            new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
          );
        case "interested":
          return (b.interestCount ?? 0) - (a.interestCount ?? 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [schemes, searchQuery, sortBy, activeFilters]);

  const handleSchemePress = (scheme: any) => {
    router.push({
      pathname: "/scheme-details",
      params: { schemeId: scheme.id },
    });
  };

  const handleBack = () => {
    router.back();
  };

  // Sync sort and filter state to URL params
  useEffect(() => {
    router.setParams({
      sortBy,
      categories: activeFilters.categories.length > 0 ? activeFilters.categories.join(",") : undefined,
      typeFilter: activeFilters.typeFilter !== "both" ? activeFilters.typeFilter : undefined,
    });
  }, [sortBy, activeFilters]);

  // Count active filters for badge
  const activeFilterCount =
    activeFilters.categories.length + (activeFilters.typeFilter !== "both" ? 1 : 0);

  const clearFilters = () => {
    setActiveFilters({ categories: [], typeFilter: "both" });
    router.setParams({ categories: undefined, typeFilter: undefined });
  };

  // Get display title
  const displayTitle = categoryInfo
    ? t(categoryInfo.titleKey)
    : category === "all"
      ? t("schemesPage.allSchemes")
      : category;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: theme.background.screen }}>
      {/* Sticky Top Header Area */}
      <View style={{
        backgroundColor: theme.background.input,
        paddingBottom: 16,
      }}>
        {/* Navigation Header */}
        <View style={{
          paddingTop: 52,
          paddingBottom: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center"
        }}>
          <Pressable onPress={handleBack} style={({ pressed }) => ({
            marginRight: 16,
            padding: 8,
            borderRadius: 20,
            backgroundColor: pressed ? theme.background.screen : "transparent"
          })}>
            <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
          </Pressable>
          <AppText
            variant="h3"
            style={{ color: theme.text.primary, flex: 1, fontWeight: "700", fontSize: 18, letterSpacing: -0.2 }}
            numberOfLines={1}
          >
            {displayTitle}
          </AppText>
        </View>

        {/* Search Bar + Filters Button */}
        <View style={{ paddingHorizontal: 16, marginTop: 4, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.background.input,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: theme.border.subtle,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={{ flex: 1, marginLeft: 10, fontSize: 15, color: theme.text.primary, fontWeight: "400" }}
              placeholder={t("schemesPage.searchPlaceholder") || "Search for schemes"}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {/* Filters Button */}
          <TouchableOpacity
            onPress={() => setShowFilterPanel(true)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: activeFilterCount > 0 ? theme.primary.greenDark : theme.border.subtle,
              backgroundColor: activeFilterCount > 0 ? theme.background.successSubtle : theme.background.input,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? theme.primary.greenDark : theme.text.muted} />
            {activeFilterCount > 0 && (
              <View style={{
                marginLeft: 6,
                backgroundColor: theme.primary.greenDark,
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 4,
              }}>
                <AppText variant="caption" style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
                  {activeFilterCount}
                </AppText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Schemes List */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {filteredSchemes.map((scheme) => (
            <SchemePreviewCard
              key={scheme.id}
              title={scheme.title}
              description={scheme.description || ""}
              category={scheme.category}
              imageUrl={scheme.imageUrl}
              onPress={() => handleSchemePress(scheme)}
            />
          ))}

          {filteredSchemes.length === 0 && (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 48 }}>
              <Ionicons name="search" size={48} color="#D1D5DB" />
              <AppText
                variant="bodyMd"
                style={{ color: "#616161", marginTop: 16, textAlign: "center" }}
              >
                {activeFilterCount > 0
                  ? "No results found"
                  : t("schemesPage.noSchemesFound") || "No schemes found"}
              </AppText>
              {activeFilterCount > 0 && (
                <TouchableOpacity
                  onPress={clearFilters}
                  activeOpacity={0.7}
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: theme.primary.greenDark,
                    backgroundColor: theme.background.input,
                  }}
                >
                  <AppText variant="bodyMd" style={{ color: theme.primary.greenDark, fontWeight: "600" }}>
                    Clear Filters
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Sort_Bar */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.background.input,
        flexDirection: 'row',
        paddingVertical: 12,
        paddingBottom: 28,
        borderTopWidth: 1,
        borderColor: theme.border.subtle,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
      }}>
        {(
          [
            { key: "name", label: "Name (A–Z)" },
            { key: "newest", label: "Newest First" },
            { key: "interested", label: "Most Interested" },
          ] as const
        ).map(({ key, label }, index, arr) => {
          const isActive = sortBy === key;
          return (
            <TouchableOpacity
              key={key}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                paddingHorizontal: 4,
                marginHorizontal: 6,
                borderRadius: 20,
                backgroundColor: isActive ? theme.primary.greenDark : 'transparent',
                borderWidth: isActive ? 0 : 1,
                borderColor: theme.border.subtle,
              }}
              onPress={() => setSortBy(key)}
            >
              <AppText
                variant="bodyMd"
                style={{
                  color: isActive ? theme.text.onPrimary : theme.text.subtle,
                  fontWeight: isActive ? '700' : '500',
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                {label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter Panel */}
      <FilterPanel
        visible={showFilterPanel}
        initialFilters={activeFilters}
        onApply={(f) => { setActiveFilters(f); setShowFilterPanel(false); }}
        onClear={() => { clearFilters(); setShowFilterPanel(false); }}
        onClose={() => setShowFilterPanel(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default CategoryListing;
