// src/app/(tab)/schemes.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";
import AppText from "../../components/atoms/AppText";
import BannerSlideshow from "@/components/molecules/Banner";
import ProgramSection from "../../components/molecules/ProgramSection";
import SearchBar from "../../components/molecules/SearchBar";
import { schemeCategories } from "../../data/content/schemeCategories";
import { bannersApi, schemesApi, Scheme, Banner } from "@/services/apiService";
import { SchemeCardSkeleton } from "@/components/atoms/Skeleton";
import { useTranslation } from "../../i18n";
import { useLanguageStore } from "../../stores/languageStore";
import { cdn } from "@/utils/cloudinaryUtils";

// Scheme Card Component
const SchemeCard = ({
  scheme,
  onPress,
  width,
}: {
  scheme: Scheme;
  onPress: () => void;
  width?: number;
}) => {
  const { currentLanguage } = useLanguageStore();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const displayTitle = currentLanguage === 'hi' && scheme.titleHi ? scheme.titleHi : scheme.title;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={{ width: width || "100%", marginRight: width ? 16 : 0 }}
    >
      <View
        style={{
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.05)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        }}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: cdn(scheme.imageUrl) || "https://via.placeholder.com/400x200/386641/FFFFFF?text=Scheme" }}
            style={{ width: "100%", height: 140 }}
            resizeMode="cover"
          />
          {/* Category Badge */}
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: "rgba(56, 102, 65, 0.9)",
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <AppText
              variant="bodySm"
              style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 11 }}
            >
              {scheme.category}
            </AppText>
          </View>
          {/* Bookmark */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={isBookmarked ? "#386641" : "#1F2937"}
            />
          </Pressable>
        </View>
        <View style={{ padding: 14 }}>
          <AppText
            variant="bodyMd"
            style={{ fontWeight: "800", color: "#111827", fontSize: 15, lineHeight: 22, letterSpacing: -0.2 }}
            numberOfLines={2}
          >
            {displayTitle}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

const CategoryItem = ({
  category,
  onPress,
  isLast,
  realCount,
}: {
  category: typeof schemeCategories[0];
  onPress: () => void;
  isLast: boolean;
  realCount: number;
}) => {
  const { t } = useTranslation();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "#F3F4F6",
        backgroundColor: isPressed ? "#F9FAFB" : "transparent",
      }}
    >
      <View
        style={{
          width: 56, height: 56, borderRadius: 16,
          alignItems: "center", justifyContent: "center",
          marginRight: 16, backgroundColor: category.color,
        }}
      >
        <AppText variant="h2" style={{ fontSize: 26 }}>{category.icon}</AppText>
      </View>
      <View style={{ flex: 1 }}>
        <AppText
          variant="bodyMd"
          style={{ fontWeight: "700", color: "#111827", fontSize: 16, marginBottom: 4, letterSpacing: -0.2 }}
        >
          {t(category.titleKey)}
        </AppText>
        {realCount > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ backgroundColor: "#E0E7FF", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
              <AppText variant="bodySm" style={{ color: "#4F46E5", fontWeight: "700", fontSize: 12 }}>
                {realCount}
              </AppText>
            </View>
            <AppText variant="bodySm" style={{ color: "#6B7280", marginLeft: 6, fontSize: 13 }}>
              {t("schemesPage.schemesAvailable")}
            </AppText>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
    </Pressable>
  );
};

export default function Schemes() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageStore();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Real counts per category from backend
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const fetchSchemes = async () => {
    try {
      const [data, bannersData] = await Promise.all([
        schemesApi.getAll({ limit: 50 }),
        bannersApi.getAll(),
      ]);
      setSchemes(data);
      setBanners(bannersData);
      // Compute real counts per category from returned data
      const counts: Record<string, number> = {};
      data.forEach((s) => {
        if (s.category) {
          // Map API category name back to category ID
          const catEntry = Object.entries({
            "financial-support": "Financial Support",
            "agricultural-development": "Agricultural Development",
            "soil-management": "Soil Management",
            "crop-insurance": "Crop Insurance",
          }).find(([, v]) => v.toLowerCase() === s.category.toLowerCase());
          if (catEntry) {
            counts[catEntry[0]] = (counts[catEntry[0]] || 0) + 1;
          }
        }
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error("Error fetching schemes:", error);
    }
  };

  // Translate banners - use API data with fallback translations
  // const translatedBanners = banners.map((banner, index) => {
  //   const displayTitle = currentLanguage === 'hi' && banner.titleHi ? banner.titleHi : banner.title;
  //   const displaySubtitle = currentLanguage === 'hi' && banner.subtitleHi ? banner.subtitleHi : banner.subtitle;
  //   return {
  //     id: banner.id,
  //     title: displayTitle || (index === 0
  //       ? t("banners.welcome.title")
  //       : index === 1
  //         ? t("banners.programs.title")
  //         : t("banners.connect.title")),
  //     subtitle: displaySubtitle || (index === 0
  //       ? t("banners.welcome.subtitle")
  //       : index === 1
  //         ? t("banners.programs.subtitle")
  //         : t("banners.connect.subtitle")),
  //     imageUrl: banner.imageUrl,
  //     url: banner.redirectUrl,
  //   };
  // });

  // Fetch schemes on mount
  useEffect(() => {
    const loadSchemes = async () => {
      setLoading(true);
      await fetchSchemes();
      setLoading(false);
    };
    loadSchemes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchemes();
    setRefreshing(false);
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
  // Recommended schemes (next 3)
  const recommendedSchemes = schemes.slice(1, 4);

  if (loading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#F8FAFC" }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, paddingTop: 24 }}>
          <SchemeCardSkeleton />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}><SchemeCardSkeleton /></View>
            <View style={{ flex: 1 }}><SchemeCardSkeleton /></View>
          </View>
          {[0, 1].map((i) => <SchemeCardSkeleton key={i} />)}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#386641"]}
          tintColor="#386641"
        />
      }
    >
      {/* Elevated Header */}
      <View style={{
        backgroundColor: "#FFFFFF",
        paddingBottom: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 20,
      }}>
        {/* Title Area */}
        <View
          style={{
            paddingTop: 48,
            paddingBottom: 8,
            paddingHorizontal: 20,
          }}
        >
          <AppText
            variant="h2"
            style={{ fontWeight: "700", color: "#111827", fontSize: 26, letterSpacing: -0.3 }}
          >
            {t("schemesPage.title")}
          </AppText>
          <AppText
            variant="bodySm"
            style={{ color: "#6B7280", marginTop: 4, fontSize: 13, fontWeight: "500" }}
          >
            {t("schemesPage.subtitle")}
          </AppText>
        </View>

        {/* Search Bar */}
        <View style={{ marginTop: 4 }}>
          <SearchBar
            placeholder={t("schemesPage.searchPlaceholder")}
            onSearch={setSearchQuery}
          />
        </View>
      </View>

      {/* Banner Slideshow — live data from bannersApi */}
      <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
        <BannerSlideshow
          banners={banners.map((b) => ({
            title: (currentLanguage === 'hi' && b.titleHi ? b.titleHi : b.title) || "",
            subtitle: (currentLanguage === 'hi' && b.subtitleHi ? b.subtitleHi : b.subtitle) || "",
            imageUrl: b.imageUrl,
            url: b.redirectUrl,
          }))}
          autoSlideInterval={4000}
        />
      </View>

      {/* Recommended Schemes */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 24, backgroundColor: "#F8FAFC" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AppText
              variant="h3"
              style={{ fontWeight: "700", color: "#111827", fontSize: 20, letterSpacing: -0.2 }}
            >
              {t("schemesPage.recommendedSchemes")}
            </AppText>
            <View
              style={{
                backgroundColor: "#DCFCE7",
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginLeft: 10,
              }}
            >
              <AppText
                variant="bodySm"
                style={{ color: "#16A34A", fontWeight: "700", fontSize: 12 }}
              >
                {recommendedSchemes.length}
              </AppText>
            </View>
          </View>
          <Pressable
            onPress={handleViewAllSchemes}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
            className="flex flex-row items-center justify-center"
          >
            <AppText
              variant="bodySm"
              style={{ color: "#16A34A", fontWeight: "600", fontSize: 14 }}
            >
              {t("schemesPage.viewAll")}
            </AppText>
            <Ionicons name="chevron-forward" size={16} color="#16A34A" style={{ marginLeft: 2 }} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -16 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {recommendedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onPress={() => handleSchemePress(scheme.id)}
              width={260}
            />
          ))}
        </ScrollView>
      </View>

      {/* Categories */}
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 24,
          padding: 20,
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#386641",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="grid-outline" size={20} color="#FFFFFF" />
          </View>
          <AppText
            variant="h3"
            style={{ fontWeight: "700", color: "#1F2937", fontSize: 20 }}
          >
            {t("schemesPage.categories")}
          </AppText>
        </View>

        {schemeCategories.map((category, index) => (
          <CategoryItem
            key={category.id}
            category={category}
            onPress={() => handleCategoryPress(category.id)}
            isLast={index === schemeCategories.length - 1}
            realCount={categoryCounts[category.id] || 0}
          />
        ))}
      </View>

      {/* Government Schemes — ProgramSection cards */}
      <ProgramSection
        title={t("schemesPage.recommendedSchemes")}
        programs={schemes.slice(0, 9).map((s) => ({
          ...s,
          title: currentLanguage === 'hi' && s.titleHi ? s.titleHi : s.title,
          description: (currentLanguage === 'hi' && s.descriptionHi ? s.descriptionHi : s.description) || "",
        }))}
        onViewAll={handleViewAllSchemes}
        onProgramPress={(program) => handleSchemePress(program.id)}
      />

      {/* Bottom Spacing */}
      <View style={{ height: 24 }} />

    </ScrollView>
  );
}
