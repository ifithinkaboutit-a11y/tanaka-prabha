import GreetingHeader from "@/components/molecules/GreetingHeader";
import NotificationAlert from "@/components/molecules/NotificationAlert";
import QuickActionGrid from "@/components/molecules/QuickActionGrid";
import SchemePreviewList from "@/components/molecules/SchemePreviewList";
import WeatherWidget from "@/components/molecules/WeatherWidget";
import EventCard from "@/components/atoms/EventCard";
import { quickActions as quickActionsData } from "@/data/content/quickActions";
import { schemesApi, notificationsApi, eventsApi, Scheme, Notification, ApiEvent } from "@/services/apiService";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
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
  const { profile } = useUserProfile();
  // Use UserProfileContext photo first (freshest, updated after uploads),
  // fall back to AuthContext user photo (available immediately from cache)
  const avatarUri = profile?.photoUrl || user?.photoUrl || undefined;

  // State for API data
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [todayEvents, setTodayEvents] = useState<ApiEvent[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const schemesData = await schemesApi.getAll({ limit: 5 });
        setSchemes(schemesData);
        // Fetch latest unread notifications (up to 3)
        const unread = await notificationsApi.getMy({ unread_only: true, limit: 3 });
        setNotifications(unread);
        setUnreadCount(unread.length);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }

      // Fetch today's events independently so failures don't affect other sections
      try {
        const todayString = new Date().toISOString().split("T")[0];
        const allEvents = await eventsApi.getAll();
        const filtered = allEvents.filter(
          (event) => event.date && event.date.split("T")[0] === todayString
        );
        setTodayEvents(filtered);
        setEventsError(null);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEventsError("Unable to load today's programmes.");
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
      {/* Top Header Section (Greeting only) */}
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

      {/* Weather Widget */}
      <WeatherWidget district={profile?.district} language={currentLanguage as "en" | "hi"} />

      {/* Popular Schemes Section */}
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

      {/* Programme Happening Today Section */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        <AppText
          variant="h2"
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: 12,
          }}
        >
          {t("home.programmesToday")}
        </AppText>

        {eventsError ? (
          <AppText style={{ color: "#EF4444", fontSize: 14 }}>{eventsError}</AppText>
        ) : todayEvents.length === 0 ? (
          <AppText style={{ color: "#6B7280", fontSize: 14 }}>{t("home.noProgrammesToday")}</AppText>
        ) : (
          todayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/event-details?eventId=${event.id}` as any)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};
