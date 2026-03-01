import BannerSlideshow from "@/components/molecules/Banner";
import GreetingHeader from "@/components/molecules/GreetingHeader";
import QuickActionGrid from "@/components/molecules/QuickActionGrid";
import SchemePreviewList from "@/components/molecules/SchemePreviewList";
import SearchBar from "@/components/molecules/SearchBar";
import { quickActions as quickActionsData } from "@/data/content/quickActions";
import { bannersApi, schemesApi, notificationsApi, Banner, Scheme } from "@/services/apiService";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { HomeScreenSkeleton } from "@/components/atoms/Skeleton";
import AppText from "../../components/atoms/AppText";
import { useTranslation } from "../../i18n";
import { useLanguageStore } from "../../stores/languageStore";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageStore();
  const { user } = useAuth();

  // State for API data
  const [banners, setBanners] = useState<Banner[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bannersData, schemesData] = await Promise.all([
          bannersApi.getAll(),
          schemesApi.getAll({ limit: 5 }),
        ]);
        setBanners(bannersData);
        setSchemes(schemesData);
        // Fetch unread notification count
        const count = await notificationsApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNotificationPress = () => {
    router.push("/notifications" as any);
  };

  const quickActions = quickActionsData.map((action) => ({
    ...action,
    title: t(action.title), // Translate the title
    onPress: () => {
      switch (
      action.title // Use original key for comparison
      ) {
        case "home.updateProfile":
          router.push("/(tab)/profile");
          break;
        case "home.ongoingEvents":
          router.push("/(tab)/program");
          break;
        case "home.governmentSchemes":
          router.push("/(tab)/schemes");
          break;
        case "home.bookAppointment":
          router.push("/(tab)/connect");
          break;
        default:
          break;
      }
    },
  }));

  // Translate banners - use API data with fallback translations
  const translatedBanners = banners.map((banner, index) => {
    const displayTitle = currentLanguage === 'hi' && banner.titleHi ? banner.titleHi : banner.title;
    const displaySubtitle = currentLanguage === 'hi' && banner.subtitleHi ? banner.subtitleHi : banner.subtitle;
    return {
      id: banner.id,
      title: displayTitle || (index === 0
        ? t("banners.welcome.title")
        : index === 1
          ? t("banners.programs.title")
          : t("banners.connect.title")),
      subtitle: displaySubtitle || (index === 0
        ? t("banners.welcome.subtitle")
        : index === 1
          ? t("banners.programs.subtitle")
          : t("banners.connect.subtitle")),
      imageUrl: banner.imageUrl,
      url: banner.redirectUrl,
    };
  });

  // Get user's display name
  const userName = user?.name || t("common.farmer");

  if (loading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#F8FAFC" }} showsVerticalScrollIndicator={false}>
        <HomeScreenSkeleton />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
    >
      {/* Top Header Section (Greeting + Search) */}
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
        marginBottom: 16,
      }}>
        <GreetingHeader
          name={userName}
          onNotificationPress={handleNotificationPress}
          onAvatarPress={() => router.push("/(tab)/profile")}
          hasNotifications={unreadCount > 0}
        />
        <View style={{ marginTop: 4 }}>
          <SearchBar
            placeholder={t("home.searchPlaceholder")}
            onSearch={(query) => {
              router.push(`/search?q=${encodeURIComponent(query)}`);
            }}
          />
        </View>
      </View>

      {/* Banner Slideshow */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
        <BannerSlideshow banners={translatedBanners} />
      </View>
      {/* Quick Actions Section */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <AppText
          variant="h2"
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 16,
            letterSpacing: -0.2,
          }}
        >
          {t("home.quickActions")}
        </AppText>
        <QuickActionGrid actions={quickActions} />
      </View>
      {/* Popular Schemes Section - Hidden for cleaner look matching Figma */}
      {/* Uncomment if needed: */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <AppText
          variant="h2"
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: 12,
          }}
        >
          {t("home.popularSchemes")}
        </AppText>
        <SchemePreviewList
          schemes={schemes.map((scheme) => ({
            ...scheme,
            title: currentLanguage === 'hi' && scheme.titleHi ? scheme.titleHi : scheme.title,
            description: (currentLanguage === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description) || "",
            onPress: () =>
              router.push(`/scheme-details?schemeId=${scheme.id}` as any),
          })) as any}
        />
      </View>
    </ScrollView>
  );
};