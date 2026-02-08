// src/app/notifications.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import AppText from "../components/atoms/AppText";
import { useTranslation } from "../i18n";
import { notificationsApi, Notification } from "../services/apiService";

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
  const getIconColor = (type: string) => {
    switch (type) {
      case "approval":
        return "#2196F3";
      case "reminder":
        return "#E91E63";
      case "alert":
        return "#FF5722";
      default:
        return "#757575";
    }
  };

  return (
    <TouchableOpacity className="flex-row items-start py-4 px-4 bg-white">
      {/* Icon */}
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: notification.iconBgColor }}
      >
        <Ionicons
          name={notification.icon as keyof typeof Ionicons.glyphMap}
          size={24}
          color={getIconColor(notification.type)}
        />
      </View>

      {/* Content */}
      <View className="flex-1">
        <AppText
          variant="bodyMd"
          className="font-semibold text-neutral-textDark"
        >
          {notification.title}
        </AppText>
        <AppText variant="bodySm" className="text-neutral-textMedium mt-0.5">
          {notification.description}
        </AppText>
        <AppText variant="bodyLg" className="text-neutral-textLight mt-1">
          {notification.time}
        </AppText>
      </View>

      {/* Unread indicator */}
      {!notification.isRead && (
        <View className="w-2.5 h-2.5 rounded-full bg-primary mt-2" />
      )}
    </TouchableOpacity>
  );
};

const NotificationsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationsApi.getMy();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const groupedNotifications = groupNotificationsByDate(notifications);

  if (loading) {
    return (
      <View className="flex-1 bg-neutral-surface">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-neutral-border">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#212121" />
            </TouchableOpacity>
            <AppText variant="h3" className="font-semibold">
              {t("notifications.title")}
            </AppText>
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-surface">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-neutral-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#212121" />
          </TouchableOpacity>
          <AppText variant="h3" className="font-semibold">
            {t("notifications.title")}
          </AppText>
        </View>
      </View>

      <ScrollView className="flex-1">
        {groupedNotifications.map((group) => (
          <View key={group.titleKey}>
            {/* Group Header */}
            <View className="px-4 py-3 bg-neutral-surface">
              <AppText
                variant="bodySm"
                className="text-neutral-textMedium font-medium"
              >
                {t(group.titleKey)}
              </AppText>
            </View>

            {/* Notifications */}
            <View className="bg-white">
              {group.data.map((notification, index) => (
                <View key={notification.id}>
                  <NotificationItem notification={notification} />
                  {index < group.data.length - 1 && (
                    <View className="h-px bg-neutral-border ml-16 mr-4" />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
