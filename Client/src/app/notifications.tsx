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
    <Card className="mb-3 flex-row items-center p-3 border-transparent shadow-sm bg-white">
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${notification.iconBgColor || getIconColor(notification.type)}15` }}
      >
        <Ionicons
          name={getIconName(notification.type)}
          size={24}
          color={notification.iconBgColor || getIconColor(notification.type)}
        />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <AppText variant="bodyMd" className="font-semibold text-neutral-textDark flex-1 mr-2">
            {notification.titleKey ? t(notification.titleKey) : notification.title}
          </AppText>
          <AppText variant="caption" className="text-neutral-textLight text-xs mt-1">
            {notification.time}
          </AppText>
        </View>
        <AppText variant="bodySm" className="text-neutral-textMedium">
           {notification.descriptionKey ? t(notification.descriptionKey) : notification.description}
        </AppText>
      </View>
      {!notification.isRead && (
        <View className="w-2 h-2 rounded-full bg-red-500 absolute top-3 right-3" />
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
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Stack.Screen options={{ title: t("notifications.title") || "Notifications" }} />
        <ActivityIndicator size="large" color={colors.primary.green} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{ 
            title: t("notifications.title") || "Notifications",
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#F9FAFB' },
            headerTitleStyle: { color: '#1F2937' }, 
            headerTintColor: '#1F2937'
        }} 
      />
      
      {/* Fallback header if Stack.Screen is not managing it (e.g. if _layout doesn't use stack properly here) */}
      <View className="px-4 py-2">
         {/* Optional: Add custom header content here if needed, but Stack.Screen handles the title */}
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.green]} />
        }
      >
        {groupedNotifications.length === 0 ? (
          <View className="items-center justify-center py-20 opacity-60">
            <Ionicons name="notifications-off-outline" size={64} color={colors.neutral.textLight} />
             <AppText className="mt-4 text-neutral-textMedium text-center">
              {t("notifications.empty") || "No notifications yet"}
            </AppText>
          </View>
        ) : (
          <View className="pb-8">
            {groupedNotifications.map((group, index) => (
              <View key={index} className="mb-6">
                <AppText variant="h3" className="mb-3 ml-1 text-base font-bold text-neutral-textMedium">
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
