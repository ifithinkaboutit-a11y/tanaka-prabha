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
        case "approval": return "checkmark-circle-outline";
        case "reminder": return "calendar-outline";
        case "alert": return "alert-circle-outline";
        default: return "notifications-outline";
    }
  }

  return (
    <Card style={{ marginBottom: 12, flexDirection: "row", alignItems: "center", padding: 12, borderColor: "transparent", backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
      <View
        style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginRight: 12, backgroundColor: `${notification.iconBgColor || getIconColor(notification.type)}15` }}
      >
        <Ionicons
          name={getIconName(notification.type)}
          size={24}
          color={notification.iconBgColor || getIconColor(notification.type)}
        />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <AppText variant="bodyMd" style={{ fontWeight: "600", color: "#212121", flex: 1, marginRight: 8 }}>
            {notification.titleKey ? t(notification.titleKey) : notification.title}
          </AppText>
          <AppText variant="caption" style={{ color: "#9E9E9E", fontSize: 12, marginTop: 4 }}>
            {notification.time}
          </AppText>
        </View>
        <AppText variant="bodySm" style={{ color: "#616161" }}>
           {notification.descriptionKey ? t(notification.descriptionKey) : notification.description}
        </AppText>
      </View>
      {!notification.isRead && (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", position: "absolute", top: 12, right: 12 }} />
      )}
    </Card>
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
      <Stack.Screen 
        options={{ 
            title: t("notifications.title") || "Notifications",
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#F9FAFB' },
            headerTitleStyle: { color: '#1F2937' }, 
            headerTintColor: '#1F2937'
        }} 
      />
      
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
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
          <View style={{ paddingBottom: 32 }}>
            {groupedNotifications.map((group, index) => (
              <View key={index} style={{ marginBottom: 24 }}>
                <AppText variant="h3" style={{ marginBottom: 12, marginLeft: 4, fontSize: 16, fontWeight: "700", color: "#616161" }}>
                  {t(group.titleKey) || group.title}
                </AppText>
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
