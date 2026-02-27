// src/app/notifications.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  View,
  RefreshControl,
  TouchableOpacity
} from "react-native";
import AppText from "../components/atoms/AppText";
import Card from "../components/atoms/Card";
import { useTranslation } from "../i18n";
import { notificationsApi, Notification } from "../services/apiService";
import { colors } from "../styles/colors";

// Helper to group notifications by date
const groupNotificationsByDate = (notifs: Notification[]) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { title: string; titleKey: string; data: Notification[] }[] = [
    { title: "Today", titleKey: "notifications.today", data: [] },
    { title: "Yesterday", titleKey: "notifications.yesterday", data: [] },
    { title: "Others", titleKey: "notifications.others", data: [] },
  ];

  notifs.forEach((notif) => {
    const notifDate = new Date(notif.date);
    if (notifDate.toDateString() === today.toDateString()) {
      groups[0].data.push(notif);
    } else if (notifDate.toDateString() === yesterday.toDateString()) {
      groups[1].data.push(notif);
    } else {
      groups[2].data.push(notif);
    }
  });

  return groups.filter((g) => g.data.length > 0);
};

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const { t } = useTranslation();

  const getIconColor = (type: string) => {
    switch (type) {
      case "approval":
        return "#2196F3"; // info
      case "reminder":
        return "#E91E63"; // accent/error
      case "alert":
        return "#FF5722"; // warning
      default:
        return "#757575"; // neutral
    }
  };

  const getIconName = (type: string): keyof typeof Ionicons.glyphMap => {
    if (notification.icon) return notification.icon as any;
    switch (type) {
      case "approval": return "checkmark-circle";
      case "reminder": return "calendar";
      case "alert": return "alert-circle";
      default: return "notifications";
    }
  }

  return (
    <View style={{
      marginBottom: 12,
      flexDirection: "row",
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
      position: "relative",
    }}>
      {/* Icon badge */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
          backgroundColor: notification.iconBgColor || getIconColor(notification.type),
        }}
      >
        <Ionicons
          name={getIconName(notification.type)}
          size={24}
          color="#FFFFFF"
        />
      </View>

      {/* Content wrapper */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <AppText
            variant="bodyMd"
            style={{
              fontWeight: "700",
              color: "#111827",
              flex: 1,
              marginRight: 16,
              fontSize: 15,
            }}
          >
            {notification.titleKey ? t(notification.titleKey) : notification.title}
          </AppText>

          {/* Unread dot indicator */}
          {!notification.isRead && (
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#0EA5E9",
              marginTop: 6
            }} />
          )}
        </View>

        <AppText
          variant="bodySm"
          style={{
            color: "#6B7280",
            fontSize: 13,
            lineHeight: 18,
            marginTop: 4,
          }}
          numberOfLines={2}
        >
          {notification.descriptionKey ? t(notification.descriptionKey) : notification.description}
        </AppText>

        <AppText variant="caption" style={{ color: "#9CA3AF", fontSize: 11, fontWeight: "500", marginTop: 6 }}>
          {notification.time}
        </AppText>
      </View>
    </View>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      // Fallback to getMy if available, or getAll
      const data = await (notificationsApi as any).getMy();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const groupedNotifications = groupNotificationsByDate(notifications);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" }}>
        <Stack.Screen options={{ title: t("notifications.title") || "Notifications" }} />
        <ActivityIndicator size="large" color={colors.primary.green} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <AppText
          variant="h3"
          style={{ color: "#1F2937", flex: 1, fontWeight: "700", fontSize: 18 }}
          numberOfLines={1}
        >
          {t("notifications.title") || "Notifications"}
        </AppText>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.green]} />
        }
      >
        {groupedNotifications.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 80, opacity: 0.6 }}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.neutral.textLight} />
            <AppText style={{ marginTop: 16, color: "#616161", textAlign: "center" }}>
              {t("notifications.empty") || "No notifications yet"}
            </AppText>
          </View>
        ) : (
          <View style={{ paddingBottom: 40, paddingTop: 10 }}>
            {groupedNotifications.map((group, index) => (
              <View key={index} style={{ marginBottom: 28 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                  <AppText variant="h3" style={{ fontSize: 13, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {t(group.titleKey) || group.title}
                  </AppText>
                  <View style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB", marginLeft: 12 }} />
                </View>
                {group.data.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
