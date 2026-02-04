import BannerSlideshow from "@/components/molecules/Banner";
import GreetingHeader from "@/components/molecules/GreetingHeader";
import QuickActionGrid from "@/components/molecules/QuickActionGrid";
import SchemePreviewList from "@/components/molecules/SchemePreviewList";
import SearchBar from "@/components/molecules/SearchBar";
import { banners } from "@/data/content/banners";
import { quickActions as quickActionsData } from "@/data/content/quickActions";
import { schemes } from "@/data/content/schemes";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import AppText from "../../components/atoms/AppText";
import { useTranslation } from "../../i18n";

const Home = () => {
  const router = useRouter();
  const { t } = useTranslation();

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

  // Translate banners
  const translatedBanners = banners.map((banner, index) => ({
    ...banner,
    title:
      index === 0
        ? t("banners.welcome.title")
        : index === 1
          ? t("banners.programs.title")
          : t("banners.connect.title"),
    subtitle:
      index === 0
        ? t("banners.welcome.subtitle")
        : index === 1
          ? t("banners.programs.subtitle")
          : t("banners.connect.subtitle"),
  }));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with greeting and notification */}
      <View style={{ backgroundColor: "#FFFFFF" }}>
        <GreetingHeader
          name="Shivansh Ji"
          onNotificationPress={handleNotificationPress}
          onAvatarPress={() => router.push("/(tab)/profile")}
        />
      </View>
      {/* Search Bar */}
      <View style={{ backgroundColor: "#FFFFFF", paddingBottom: 16 }}>
        <SearchBar
          placeholder={t("home.searchPlaceholder")}
          onSearch={(query) => {
            router.push(`/search?q=${encodeURIComponent(query)}`);
          }}
        />
      </View>
      {/* Banner Slideshow */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <BannerSlideshow banners={translatedBanners} />
      </View>
      {/* Quick Actions Section */}
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
          Quick Actions
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
            onPress: () =>
              router.push(`/scheme-details?schemeId=${scheme.id}` as any),
          }))}
        />
      </View>
    </ScrollView>
  );
};

export default Home;
