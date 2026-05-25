// src/app/(tab)/schemes.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import AppText from "../../components/atoms/AppText";
import SearchBar from "../../components/molecules/SearchBar";
import { schemeCategories } from "../../data/content/schemeCategories";
import { schemesApi, Scheme } from "@/services/apiService";
import { fetchWithCache, CACHE_KEYS } from "@/utils/offlineCache";
import { SchemeCardSkeleton } from "@/components/atoms/Skeleton";
import { useTranslation } from "../../i18n";
import { useLanguageStore } from "../../stores/languageStore";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { cdn } from "@/utils/cloudinaryUtils";
import { theme } from "@/styles/colors";
import { SchemeEligibilityBadge, checkSchemeEligibility } from "@/components/molecules/SchemeEligibilityBadge";

// Scheme Card Component
const SchemeCard = ({
  scheme,
  onPress,
  width,
  userProfile,
}: {
  scheme: Scheme;
  onPress: () => void;
  width?: number;
  userProfile?: {
    landDetails?: { totalLandArea?: number };
    livestockDetails?: Record<string, number>;
    district?: string;
    interests?: string[];
  };
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
          borderRadius: 24,
          overflow: "hidden",
          marginBottom: 16,
          backgroundColor: theme.background.input,
          borderWidth: 1.5,
          borderColor: "rgba(0,0,0,0.06)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 4,
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        }}
      >
        <Image
          source={{ uri: cdn(scheme.imageUrl) || "https://via.placeholder.com/400x200/386641/FFFFFF?text=Scheme" }}
          style={{ width: "100%", height: width ? 160 : 180 }}
          resizeMode="cover"
        />
        <View
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <AppText
            variant="bodySm"
            style={{ color: theme.primary.green, fontWeight: "800", fontSize: 11, textTransform: "uppercase" }}
          >
            {scheme.category}
          </AppText>
        </View>

        <View style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <AppText
              variant="bodyMd"
              style={{ fontWeight: "800", color: theme.text.primary, fontSize: 16, lineHeight: 22, letterSpacing: -0.3, flex: 1, marginRight: 8 }}
              numberOfLines={2}
            >
              {displayTitle}
            </AppText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
            <AppText variant="bodySm" style={{ color: theme.primary.green, fontWeight: "700" }}>
              Explore Details
            </AppText>
            <Ionicons name="arrow-forward" size={14} color={theme.primary.green} style={{ marginLeft: 6 }} />
          </View>
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
          style={{ fontWeight: "700", color: theme.text.primary, fontSize: 16, marginBottom: 4, letterSpacing: -0.2 }}
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
      <Ionicons name="chevron-forward" size={22} color={theme.text.placeholder} />
    </Pressable>
  );
};

export default function Schemes() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageStore();
  const { profile: userProfile } = useUserProfile();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Real counts per category from backend
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Transform userProfile for eligibility check
  const eligibilityProfile = userProfile ? {
    landDetails: userProfile.landDetails,
    livestockDetails: userProfile.livestockDetails,
    district: userProfile.district,
    interests: [],
  } : undefined;

  const fetchSchemes = async () => {
    try {
      const data = await fetchWithCache(CACHE_KEYS.SCHEMES, () => schemesApi.getAll({ limit: 50 }));
      setSchemes(data);
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

  const filteredSchemes = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return schemes;
    const lower = query.toLowerCase();
    return schemes.filter(
      (s) =>
        s.title.toLowerCase().includes(lower) ||
        (s.category && s.category.toLowerCase().includes(lower))
    );
  }, [schemes, searchQuery]);

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

  const isSearchActive = searchQuery.trim().length > 0;

  // Recommended schemes — featured only, up to 5
  const recommendedSchemes = filteredSchemes.filter((s) => s.isFeatured).slice(0, 5);

  if (loading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: theme.background.screen }} showsVerticalScrollIndicator={false}>
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
      style={{ flex: 1, backgroundColor: theme.background.screen }}
      showsVerticalScrollIndicator={true}
      indicatorStyle="black"
      stickyHeaderIndices={[0]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.primary.green]}
          tintColor={theme.primary.green}
        />
      }
    >
      {/* Elevated Header */}
      <View style={{
        backgroundColor: theme.background.header,
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
            style={{ fontWeight: "700", color: theme.text.primary, fontSize: 26, letterSpacing: -0.3 }}
          >
            {t("schemesPage.title")}
          </AppText>
          <AppText
            variant="bodySm"
            style={{ color: theme.text.muted, marginTop: 4, fontSize: 13, fontWeight: "500" }}
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


      {/* Recommended Schemes */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 24, backgroundColor: theme.background.screen }}>
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
              style={{ fontWeight: "700", color: theme.text.primary, fontSize: 20, letterSpacing: -0.2 }}
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

        <View style={{ position: "relative" }}>
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
                  width={290}
                  userProfile={eligibilityProfile}
                />
            ))}
            {/* End spacing for scroll cue */}
            <View style={{ width: 16 }} />
          </ScrollView>
          {/* Scroll Cue Arrow */}
          {recommendedSchemes.length > 1 && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 60,
                justifyContent: "center",
                alignItems: "flex-end",
                paddingRight: 8
              }}
            >
              <View style={{
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: 20,
                width: 32,
                height: 32,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.05)"
              }}>
                <Ionicons name="chevron-forward" size={18} color={theme.primary.green} />
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Categories */}
      {!isSearchActive && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 24,
            padding: 20,
            backgroundColor: theme.background.input,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: theme.border.subtle,
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
                backgroundColor: theme.primary.green,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="grid-outline" size={20} color={theme.text.onPrimary} />
            </View>
            <AppText
              variant="h3"
              style={{ fontWeight: "700", color: theme.text.secondary, fontSize: 20 }}
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
      )}

      {/* All Schemes section — latest 5 with View All */}
      {!isSearchActive && filteredSchemes.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <AppText variant="h3" style={{ fontWeight: "700", color: theme.text.primary, fontSize: 20, letterSpacing: -0.2 }}>
              {t("schemesPage.allSchemes")}
            </AppText>
           <Pressable
              onPress={handleViewAllSchemes}
              style={({ pressed }) => ({
                marginTop: 12,
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: "#16A34A",
                alignItems: "center",
                backgroundColor: pressed ? "#F0FDF4" : "transparent",
              })}
            >
              <AppText style={{ color: "#16A34A", fontWeight: "700", fontSize: 14 }}>
                {t("schemesPage.viewAll")} ({filteredSchemes.length - 5} {t("schemesPage.more")})
              </AppText>
            </Pressable>
          </View>
          {filteredSchemes.slice(0, 5).map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onPress={() => handleSchemePress(scheme.id)}
              userProfile={eligibilityProfile}
            />
          ))}
        </View>
      )}

      {/* No results message */}
      {isSearchActive && filteredSchemes.length === 0 && (
        <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 32 }}>
          <AppText variant="bodyMd" style={{ color: "#6B7280", textAlign: "center", fontSize: 16 }}>
            {t("schemesPage.noSchemesFound")}
          </AppText>
        </View>
      )}

      {/* Bottom Spacing */}
      <View style={{ height: 24 }} />

    </ScrollView>
  );
}
