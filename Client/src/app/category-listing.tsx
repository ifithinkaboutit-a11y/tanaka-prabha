// src/app/category-listing.tsx - Category Listing (Screen 3)
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AppText from "../components/atoms/AppText";
import SchemePreviewCard from "../components/atoms/SchemePreviewCard";
import { schemesApi, Scheme } from "@/services/apiService";
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

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "date":
          // Assuming date is in format "DD Month YYYY"
          return (
            new Date(b.eventDate || "").getTime() - new Date(a.eventDate || "").getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [schemes, searchQuery, sortBy]);

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
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Sticky Top Header Area */}
      <View style={{
        backgroundColor: "#FFFFFF",
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
            backgroundColor: pressed ? "#F3F4F6" : "transparent"
          })}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </Pressable>
          <AppText
            variant="h3"
            style={{ color: "#111827", flex: 1, fontWeight: "700", fontSize: 18, letterSpacing: -0.2 }}
            numberOfLines={1}
          >
            {displayTitle}
          </AppText>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={{ flex: 1, marginLeft: 10, fontSize: 15, color: "#111827", fontWeight: "400" }}
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
                {t("schemesPage.noSchemesFound") || "No schemes found"}
              </AppText>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Bar for Sort and Filter */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        paddingVertical: 16,
        paddingBottom: 32, // for safe area
        borderTopWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
      }}>
        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#E5E7EB' }}
          onPress={() => setSortBy(sortBy === "name" ? "date" : "name")}
        >
          <Ionicons name="filter-outline" size={20} color="#4B5563" style={{ transform: [{ rotate: '180deg' }] }} />
          <AppText variant="bodyMd" style={{ color: "#4B5563", marginLeft: 8, fontWeight: "600" }}>
            Sort By {sortBy === "name" ? "(A-Z)" : "(Date)"}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color="#4B5563" />
          <AppText variant="bodyMd" style={{ color: "#4B5563", marginLeft: 8, fontWeight: "600" }}>
            Filters
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Mocked Filter Dropdown just changing the search query logic could happen here, keeping simple for UI */}
    </View>
  );
};

export default CategoryListing;
