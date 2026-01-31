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
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "../../i18n";

const Home = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const quickActions = quickActionsData.map((action) => ({
    ...action,
    title: t(action.title), // Translate the title
    onPress: () => {
      switch (
        action.title // Use original key for comparison
      ) {
        case "home.updateProfile":
          router.push("/profile");
          break;
        case "home.ongoingEvents":
          console.log("Navigate to events");
          break;
        case "home.governmentSchemes":
          console.log("Navigate to schemes");
          break;
        case "home.bookAppointment":
          console.log("Navigate to connect/appointments");
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
      className="flex-1 bg-[#F6F6F6]"
      showsVerticalScrollIndicator={false}
    >
      <GreetingHeader
        name="John Doe"
        onNotificationPress={() => console.log("Notifications pressed")}
        onAvatarPress={() => router.push("/profile")}
      />
      <SearchBar placeholder={t("home.searchPlaceholder")} />
      <View className="px-4 py-2">
        <BannerSlideshow banners={translatedBanners} />
      </View>
      <View className="px-8 pb-8">
        <Text className="text-left text-black text-3xl font-bold">
          {t("home.quickAccess")}
        </Text>
        <QuickActionGrid actions={quickActions} />
      </View>
      <View className="px-8 pb-8">
        <Text className="text-left text-black text-3xl font-bold mb-4">
          {t("home.popularSchemes")}
        </Text>
        <SchemePreviewList
          schemes={schemes.map((scheme) => ({
            ...scheme,
            onPress: () => console.log(`Navigate to ${scheme.title} details`),
          }))}
        />
      </View>
    </ScrollView>
  );
};

export default Home;
