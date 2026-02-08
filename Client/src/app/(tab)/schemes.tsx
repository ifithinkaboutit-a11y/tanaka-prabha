// src/app/(tab)/schemes.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    Image,
    ScrollView,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import AppText from "../../components/atoms/AppText";
import SearchBar from "../../components/molecules/SearchBar";
import { schemeCategories } from "../../data/content/schemeCategories";
import { schemesApi, Scheme } from "@/services/apiService";
import { useTranslation } from "../../i18n";

export default function Schemes() {

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch schemes on mount
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const data = await schemesApi.getAll({ limit: 10 });
        setSchemes(data);
      } catch (error) {
        console.error("Error fetching schemes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    router.push("/search" as any);
  };

  const handleSchemePress = (schemeId: string) => {
    router.push({
      pathname: "/scheme-details",
      params: { schemeId },
    } as any);
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: "/category-listing",
      params: { category: categoryId, type: "scheme" },
    } as any);
  };

  const handleViewAllSchemes = () => {
    router.push({
      pathname: "/category-listing",
      params: { category: "all", type: "scheme" },
    } as any);
  };

  // Featured scheme (first one)
  const featuredScheme = schemes[0];
  // Recommended schemes (next 2)
  const recommendedSchemes = schemes.slice(1, 3);

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-white">
        <AppText variant="h2" className="font-bold text-neutral-textDark">
          {t("schemesPage.title")}
        </AppText>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-4 bg-white">
        <SearchBar
          placeholder={t("schemesPage.searchPlaceholder")}
          onSearch={setSearchQuery}
        />
      </View>

      {/* Featured Scheme Banner */}
      {featuredScheme && (
        <TouchableOpacity
          onPress={() => handleSchemePress(featuredScheme.id)}
          className="mx-4 mb-4"
        >
          <View className="rounded-3xl overflow-hidden shadow-md">
            <Image
              source={{ uri: featuredScheme.imageUrl }}
              className="w-full h-44"
              resizeMode="cover"
            />
            <View className="absolute bottom-0 left-0 right-0 px-5 py-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <AppText variant="bodyMd" className="text-white font-bold mb-1">
                {featuredScheme.title}
              </AppText>
              <AppText
                variant="bodyXs"
                className="text-white/90 uppercase font-medium"
              >
                {featuredScheme.date}
              </AppText>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Recommended Schemes */}
      <View className="px-4 py-4 bg-white">
        <View className="flex-row justify-between items-center mb-4">
          <AppText variant="h3" className="font-bold text-neutral-textDark">
            {t("schemesPage.recommendedSchemes")}
          </AppText>
          <TouchableOpacity onPress={handleViewAllSchemes}>
            <AppText
              variant="bodySm"
              className="text-primary-forest font-medium"
            >
              {t("schemesPage.viewAll")}
            </AppText>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 px-4"
        >
          {recommendedSchemes.map((scheme) => (
            <TouchableOpacity
              key={scheme.id}
              onPress={() => handleSchemePress(scheme.id)}
              className="mr-4"
              style={{ width: 260 }}
            >
              <View className="rounded-2xl overflow-hidden bg-white shadow-sm border border-neutral-border">
                <View className="relative">
                  <Image
                    source={{ uri: scheme.imageUrl }}
                    className="w-full h-36"
                    resizeMode="cover"
                  />
                  {/* Bookmark Icon */}
                  <View className="absolute top-3 right-3 bg-white rounded-full p-2">
                    <Ionicons
                      name="bookmark-outline"
                      size={18}
                      color="#1F2937"
                    />
                  </View>
                </View>
                <View className="p-4">
                  <AppText
                    variant="bodySm"
                    className="font-semibold text-neutral-textDark"
                    numberOfLines={2}
                  >
                    {scheme.title}
                  </AppText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Categories */}
      <View className="px-4 py-6 bg-white">
        <AppText variant="h3" className="font-bold text-neutral-textDark mb-4">
          {t("schemesPage.categories")}
        </AppText>

        {schemeCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleCategoryPress(category.id)}
            className={`flex-row items-center py-4 ${
              index < schemeCategories.length - 1
                ? "border-b border-neutral-border"
                : ""
            }`}
          >
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
              style={{ backgroundColor: category.color }}
            >
              <AppText variant="h2">{category.icon}</AppText>
            </View>
            <View className="flex-1">
              <AppText
                variant="bodyMd"
                className="font-semibold text-neutral-textDark mb-1"
              >
                {t(category.titleKey)}
              </AppText>
              <AppText variant="bodySm" className="text-neutral-textMedium">
                {category.count} {t("schemesPage.schemesAvailable")}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        ))}
      </View>

      <View className="h-8" />
    </ScrollView>
  );
};
