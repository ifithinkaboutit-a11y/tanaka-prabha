// src/app/notifications.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  View,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Alert,
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

const NotificationItem = ({ notification, onPress, onMarkRead }: { 
  notification: Notification; 
  onPress?: () => void;
  onMarkRead?: (id: string) => void;
}) => {
  const { t } = useTranslation();
  
  const getIconColor = (type: string) => {
    switch (type) {
      case "approval":
        return "#16A34A"; // success green
      case "reminder":
        return "#2563EB"; // info blue
      case "alert":
        return "#DC2626"; // warning red
      case "update":
        return "#7C3AED"; // purple
      default:
        return "#6B7280"; // neutral
    }
  };

  const getIconName = (type: string): keyof typeof Ionicons.glyphMap => {
    if (notification.icon) return notification.icon as any;
    switch (type) {
        case "approval": return "checkmark-circle";
        case "reminder": return "calendar";
        case "alert": return "alert-circle";
        case "update": return "arrow-up-circle";
        default: return "notifications";
    }
  }

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "flex-start",
          padding: 16,
          backgroundColor: notification.isRead ? "#FFFFFF" : "#F0F9FF",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: notification.isRead ? "#E5E7EB" : "#BAE6FD",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
            backgroundColor: `${getIconColor(notification.type)}15`,
          }}
        >
          <Ionicons
            name={getIconName(notification.type)}
            size={24}
            color={getIconColor(notification.type)}
          />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <AppText 
              variant="bodyMd" 
              style={{ 
                fontWeight: notification.isRead ? "500" : "700", 
                color: "#1F2937", 
                flex: 1, 
                marginRight: 8,
                fontSize: 15,
              }}
            >
              {notification.titleKey ? t(notification.titleKey) : notification.title}
            </AppText>
            <AppText variant="caption" style={{ color: "#9CA3AF", fontSize: 11 }}>
              {notification.time}
            </AppText>
          </View>
          <AppText variant="bodySm" style={{ color: "#6B7280", lineHeight: 20 }}>
            {notification.descriptionKey ? t(notification.descriptionKey) : notification.description}
          </AppText>
          
          {/* Action buttons for unread */}
          {!notification.isRead && onMarkRead && (
            <TouchableOpacity 
              onPress={() => onMarkRead(notification.id)}
              style={{ marginTop: 10 }}
            >
              <AppText variant="bodySm" style={{ color: "#2563EB", fontWeight: "600", fontSize: 13 }}>
                {t("notifications.markAsRead") || "Mark as read"}
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Unread indicator */}
        {!notification.isRead && (
          <View 
            style={{ 
              width: 8, 
              height: 8, 
              borderRadius: 4, 
              backgroundColor: "#2563EB",
              position: "absolute",
              top: 16,
              right: 16,
            }} 
          />
        )}
      </View>
    </Pressable>
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

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    // TODO: Call API to mark as read
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      t("notifications.markAllReadTitle") || "Mark All as Read",
      t("notifications.markAllReadConfirm") || "Mark all notifications as read?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("common.confirm") || "Confirm",
          onPress: () => {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      t("notifications.clearAllTitle") || "Clear All",
      t("notifications.clearAllConfirm") || "Are you sure you want to clear all notifications?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("common.clear") || "Clear",
          style: "destructive",
          onPress: () => {
            setNotifications([]);
          },
        },
      ]
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const groupedNotifications = groupNotificationsByDate(notifications);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" }}>
        <ActivityIndicator size="large" color={colors.primary.green} />
        <AppText variant="bodyMd" style={{ color: "#6B7280", marginTop: 12 }}>
          {t("common.loading") || "Loading..."}
        </AppText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Custom Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 48,
          paddingBottom: 16,
          paddingHorizontal: 20,
          backgroundColor: "#F9FAFB",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="arrow-back" size={20} color="#1F2937" />
          </Pressable>
          <View>
            <AppText variant="h2" style={{ fontWeight: "700", color: "#1F2937", fontSize: 24 }}>
              {t("notifications.title") || "Notifications"}
            </AppText>
            {unreadCount > 0 && (
              <AppText variant="bodySm" style={{ color: "#6B7280", marginTop: 2 }}>
                {unreadCount} {t("notifications.unread") || "unread"}
              </AppText>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {unreadCount > 0 && (
              <Pressable
                onPress={handleMarkAllAsRead}
                style={({ pressed }) => ({
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#EEF2FF",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name="checkmark-done" size={20} color="#4F46E5" />
              </Pressable>
            )}
            <Pressable
              onPress={handleClearAll}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#FEE2E2",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary.green]}
            tintColor={colors.primary.green}
          />
        }
      >
        {groupedNotifications.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
            </View>
            <AppText variant="h3" style={{ color: "#4B5563", fontWeight: "600", marginBottom: 8 }}>
              {t("notifications.noNotifications") || "No Notifications"}
            </AppText>
            <AppText variant="bodySm" style={{ color: "#9CA3AF", textAlign: "center", maxWidth: 250 }}>
              {t("notifications.emptyMessage") || "You're all caught up! Check back later for updates."}
            </AppText>
          </View>
        ) : (
          <View>
            {groupedNotifications.map((group, index) => (
              <View key={index} style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, paddingLeft: 4 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#386641",
                      marginRight: 10,
                    }}
                  />
                  <AppText 
                    variant="bodyMd" 
                    style={{ 
                      fontWeight: "700", 
                      color: "#374151",
                      fontSize: 15,
                      letterSpacing: 0.3,
                    }}
                  >
                    {t(group.titleKey) || group.title}
                  </AppText>
                  <View
                    style={{
                      marginLeft: 8,
                      backgroundColor: "#E5E7EB",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 10,
                    }}
                  >
                    <AppText variant="caption" style={{ color: "#6B7280", fontWeight: "600", fontSize: 11 }}>
                      {group.data.length}
                    </AppText>
                  </View>
                </View>
                {group.data.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification}
                    onMarkRead={handleMarkAsRead}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
