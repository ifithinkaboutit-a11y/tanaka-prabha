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
    <ScrollView style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
      {/* Navigation Header */}
      <View style={{ paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#D9D9D9" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={handleBack} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#212121" />
          </Pressable>
          <AppText
            variant="h3"
            style={{ color: "#212121", flex: 1, fontWeight: "600" }}
            numberOfLines={1}
          >
            {displayTitle}
          </AppText>
        </View>
      </View>

      {/* Search Bar */}
      <View style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: "#FFFFFF" }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F6F6F6", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: "#D9D9D9" }}>
          <Ionicons name="search" size={20} color="#9E9E9E" />
          <TextInput
            style={{ flex: 1, marginLeft: 12, fontSize: 16, color: "#212121" }}
            placeholder={t("schemesPage.searchPlaceholder")}
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Sort and Filter Controls */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", flexDirection: "row", justifyContent: "center", alignItems: "center", borderTopWidth: 1, borderTopColor: "#D9D9D9" }}>
        <TouchableOpacity
          onPress={() => setSortBy(sortBy === "name" ? "date" : "name")}
          style={{ flexDirection: "row", alignItems: "center", marginRight: 32 }}
        >
          <Ionicons name="swap-vertical" size={16} color="#757575" />
          <AppText variant="bodySm" style={{ color: "#616161", marginLeft: 8 }}>
            {t("schemesPage.sortBy")}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons name="options-outline" size={16} color="#757575" />
          <AppText variant="bodySm" style={{ color: "#616161", marginLeft: 8 }}>
            {t("schemesPage.filters")}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Schemes List */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
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
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 48 }}>
            <Ionicons name="search" size={48} color="#D1D5DB" />
            <AppText
              variant="bodyMd"
              style={{ color: "#616161", marginTop: 16, textAlign: "center" }}
            >
              {t("schemesPage.noSchemesFound")}
            </AppText>
          </View>
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

export default CategoryListing;
