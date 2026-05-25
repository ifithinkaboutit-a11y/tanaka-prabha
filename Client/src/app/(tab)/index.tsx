import GreetingHeader from "@/components/molecules/GreetingHeader";
import NotificationAlert from "@/components/molecules/NotificationAlert";
import QuickActionGrid from "@/components/molecules/QuickActionGrid";
import SchemePreviewList from "@/components/molecules/SchemePreviewList";
import WeatherWidget from "@/components/molecules/WeatherWidget";
import EventCard from "@/components/atoms/EventCard";
import { quickActions as quickActionsData } from "@/data/content/quickActions";
import { schemesApi, notificationsApi, eventsApi, Scheme, Notification, ApiEvent } from "@/services/apiService";
import { fetchWithCache, CACHE_KEYS } from "@/utils/offlineCache";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { HomeScreenSkeleton } from "@/components/atoms/Skeleton";
import AppText from "../../components/atoms/AppText";
import { useTranslation } from "../../i18n";
import { useLanguageStore } from "../../stores/languageStore";
import { theme } from "@/styles/colors";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageStore();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  // Use UserProfileContext photo first (freshest, updated after uploads),
  // fall back to AuthContext user photo (available immediately from cache)
  const avatarUri = profile?.photoUrl || user?.photoUrl || undefined;

  // State for API data
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch latest unread notifications (up to 3)
        const unread = await notificationsApi.getMy({ unread_only: true, limit: 3 });
        setNotifications(unread);
        setUnreadCount(unread.length);
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

  // Get user's display name
  const userName = user?.name || t("common.farmer");

  if (loading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: theme.background.screen }} showsVerticalScrollIndicator={false}>
        <HomeScreenSkeleton />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background.screen }}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
    >
      {/* Top Header Section (Greeting only) */}
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
        marginBottom: 16,
      }}>
        <GreetingHeader
          name={userName}
          avatarUri={avatarUri}
          onNotificationPress={handleNotificationPress}
          onAvatarPress={() => router.push("/(tab)/profile")}
          hasNotifications={unreadCount > 0}
        />
      </View>

      {/* NotificationAlert — stacked list of up to 3 unread notifications */}
      {notifications.filter((n) => !dismissedIds.has(n.id)).length > 0 && (
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <NotificationAlert
            notifications={notifications
              .filter((n) => !dismissedIds.has(n.id))
              .map((n) => ({
                id: n.id,
                title: n.title,
                description: n.description ?? "",
                createdAt: n.date ? new Date(n.date).toISOString() : new Date().toISOString(),
              }))}
            onDismiss={(id) => setDismissedIds((prev) => new Set([...prev, id]))}
            onViewAll={() => router.push("/notifications" as any)}
          />
        </View>
      )}

      {/* Weather Widget */}
      <WeatherWidget district={profile?.district} language={currentLanguage as "en" | "hi"} />

      {/* Quick Actions Section */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <AppText
          variant="bodyMd"
          style={{
            fontWeight: "700",
            color: theme.text.primary,
            marginBottom: 16,
          }}
        >
          {t("home.quickActions")}
        </AppText>
        <QuickActionGrid actions={quickActions} />
      </View>

      <View style={{ height: 10 }} />
    </ScrollView>
  );
};
