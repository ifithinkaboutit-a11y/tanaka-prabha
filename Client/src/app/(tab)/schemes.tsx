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
import SearchBar from "../../components/molecules/SearchBar";
import { schemeCategories } from "../../data/content/schemeCategories";
import { schemesApi, Scheme } from "@/services/apiService";
import { useTranslation } from "../../i18n";

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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

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
          borderColor: "#E5E7EB",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        }}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: scheme.imageUrl || "https://via.placeholder.com/400x200/386641/FFFFFF?text=Scheme" }}
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
            style={{ fontWeight: "600", color: "#1F2937", fontSize: 14, lineHeight: 20 }}
            numberOfLines={2}
          >
            {scheme.title}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

// Category Item Component
const CategoryItem = ({
  category,
  onPress,
  isLast,
}: {
  category: typeof schemeCategories[0];
  onPress: () => void;
  isLast: boolean;
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
          width: 56,
          height: 56,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
          backgroundColor: category.color,
        }}
      >
        <AppText variant="h2" style={{ fontSize: 26 }}>
          {category.icon}
        </AppText>
      </View>
      <View style={{ flex: 1 }}>
        <AppText
          variant="bodyMd"
          style={{ fontWeight: "600", color: "#1F2937", fontSize: 16, marginBottom: 4 }}
        >
          {t(category.titleKey)}
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: "#DBEAFE",
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <AppText
              variant="bodySm"
              style={{ color: "#2563EB", fontWeight: "600", fontSize: 12 }}
            >
              {category.count}
            </AppText>
          </View>
          <AppText
            variant="bodySm"
            style={{ color: "#6B7280", marginLeft: 6, fontSize: 13 }}
          >
            {t("schemesPage.schemesAvailable")}
          </AppText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
    </Pressable>
  );
};

export default function Schemes() {
  const router = useRouter();
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSchemes = async () => {
    try {
      const data = await schemesApi.getAll({ limit: 10 });
      setSchemes(data);
    } catch (error) {
      console.error("Error fetching schemes:", error);
    }
  };

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
      <View style={{ flex: 1, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#386641" />
        <AppText variant="bodyMd" style={{ color: "#6B7280", marginTop: 12 }}>
          {t("common.loading")}
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#386641"]}
          tintColor="#386641"
        />
      }
    >
      {/* Header */}
      <View
        style={{
          paddingTop: 48,
          paddingBottom: 8,
          paddingHorizontal: 16,
          backgroundColor: "#FFFFFF",
        }}
      >
        <AppText
          variant="h2"
          style={{ fontWeight: "700", color: "#1F2937", fontSize: 28 }}
        >
          {t("schemesPage.title")}
        </AppText>
        <AppText
          variant="bodySm"
          style={{ color: "#6B7280", marginTop: 4, fontSize: 14 }}
        >
          {t("schemesPage.subtitle")}
        </AppText>
      </View>

      {/* Search Bar */}
      <View style={{ paddingBottom: 16, backgroundColor: "#FFFFFF" }}>
        <SearchBar
          placeholder={t("schemesPage.searchPlaceholder")}
          onSearch={setSearchQuery}
        />
      </View>

      {/* Featured Scheme Banner */}
      {featuredScheme && (
        <Pressable
          onPress={() => handleSchemePress(featuredScheme.id)}
          style={{ marginHorizontal: 16, marginBottom: 24 }}
        >
          <View
            style={{
              borderRadius: 24,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Image
              source={{ uri: featuredScheme.imageUrl || "https://via.placeholder.com/400x200/386641/FFFFFF?text=Featured" }}
              style={{ width: "100%", height: 200 }}
              resizeMode="cover"
            />
            {/* Gradient Overlay */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "70%",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            />
            {/* Featured Badge */}
            <View
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                backgroundColor: "#EAB308",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="star" size={14} color="#FFFFFF" />
              <AppText
                variant="bodySm"
                style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12, marginLeft: 4 }}
              >
                {t("schemesPage.featured")}
              </AppText>
            </View>
            {/* Content */}
            <View
              style={{
                position: "absolute",
                bottom: 20,
                left: 20,
                right: 20,
              }}
            >
              <AppText
                variant="h3"
                style={{
                  color: "#FFFFFF",
                  fontWeight: "700",
                  fontSize: 20,
                  marginBottom: 6,
                  textShadowColor: "rgba(0,0,0,0.3)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
                numberOfLines={2}
              >
                {featuredScheme.title}
              </AppText>
              <AppText
                variant="bodySm"
                style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "500" }}
              >
                {featuredScheme.date || featuredScheme.category}
              </AppText>
            </View>
          </View>
        </Pressable>
      )}

      {/* Recommended Schemes */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 24, backgroundColor: "#FFFFFF" }}>
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
              style={{ fontWeight: "700", color: "#1F2937", fontSize: 20 }}
            >
              {t("schemesPage.recommendedSchemes")}
            </AppText>
            <View
              style={{
                backgroundColor: "#DCFCE7",
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginLeft: 8,
              }}
            >
              <AppText
                variant="bodySm"
                style={{ color: "#16A34A", fontWeight: "600", fontSize: 12 }}
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
          >
            <AppText
              variant="bodySm"
              style={{ color: "#386641", fontWeight: "600", fontSize: 14 }}
            >
              {t("schemesPage.viewAll")}
            </AppText>
            <Ionicons name="chevron-forward" size={18} color="#386641" style={{ marginLeft: 2 }} />
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
          />
        ))}
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
