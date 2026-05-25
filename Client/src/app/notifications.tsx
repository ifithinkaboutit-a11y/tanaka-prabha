// src/app/notifications.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../components/atoms/AppText";
import { useTranslation } from "../i18n";
import { notificationsApi, Notification } from "../services/apiService";
import { NotificationItemSkeleton } from "../components/atoms/Skeleton";
import { colors, theme } from "../styles/colors";

// ── Notification type config ────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  approval: { icon: "checkmark-circle", color: "#2196F3", bg: "#E3F2FD" },
  reminder: { icon: "calendar", color: "#E91E63", bg: "#FCE4EC" },
  alert:    { icon: "alert-circle", color: "#FF5722", bg: "#FBE9E7" },
  info:     { icon: "information-circle", color: "#607D8B", bg: "#ECEFF1" },
  default:  { icon: "notifications", color: "#9C27B0", bg: "#F3E5F5" },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.default;
}

// ── Helper: group by date ───────────────────────────────────────────────────
const groupNotificationsByDate = (notifs: Notification[]) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { title: string; titleKey: string; data: Notification[] }[] = [
    { title: "Today", titleKey: "notifications.today", data: [] },
    { title: "Yesterday", titleKey: "notifications.yesterday", data: [] },
    { title: "Earlier", titleKey: "notifications.others", data: [] },
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

// ── Single notification item ────────────────────────────────────────────────
const NotificationItem = ({ notification, onPress }: { notification: Notification; onPress?: () => void }) => {
  const { t } = useTranslation();
  const config = getTypeConfig(notification.type);

  const safeT = (key?: string, fallback?: string): string => {
    if (!key) return fallback || "";
    const result = t(key);
    if (result === key) {
      if (fallback) return fallback;
      const lastSegment = key.split(".").pop() || key;
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/([A-Z])/g, " $1");
    }
    return result;
  };

  const title = notification.titleKey
    ? safeT(notification.titleKey, notification.title)
    : (notification.title || "Notification");

  const description = notification.descriptionKey
    ? safeT(notification.descriptionKey, notification.description)
    : notification.description;

  return (
    <Pressable
      onPress={onPress}
      style={{
        marginBottom: 10,
        flexDirection: "row",
        // Background tint replaces side-stripe (absolute ban)
        backgroundColor: notification.isRead ? theme.background.input : theme.background.successSubtle,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: notification.isRead ? 0 : 0.06,
        shadowRadius: 4,
        elevation: notification.isRead ? 0 : 2,
      }}
    >
        {/* Icon badge */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
            backgroundColor: notification.iconBgColor || config.bg,
          }}
        >
          <Ionicons
            name={notification.icon ? (notification.icon as any) : config.icon}
            size={22}
            color={notification.iconBgColor ? "#FFFFFF" : config.color}
          />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <AppText
              variant="bodyMd"
              style={{
                fontWeight: notification.isRead ? "600" : "700",
                color: theme.text.primary,
                flex: 1,
                marginRight: 12,
              }}
              numberOfLines={2}
            >
              {title}
            </AppText>
          </View>

          {description ? (
            <AppText
              variant="bodySm"
              style={{ color: theme.text.muted, marginTop: 4 }}
              numberOfLines={2}
            >
              {description}
            </AppText>
          ) : null}

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 }}>
            <Ionicons name="time-outline" size={12} color={theme.text.placeholder} />
            <AppText variant="caption" style={{ color: theme.text.placeholder }}>
              {notification.time}
            </AppText>
            {/* Type badge */}
            <View style={{
              marginLeft: 6,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              backgroundColor: config.bg,
            }}>
              <AppText style={{ fontSize: 10, fontWeight: "600", color: config.color, textTransform: "uppercase" }}>
                {notification.type || "info"}
              </AppText>
            </View>
          </View>
        </View>
      </Pressable>
  );
};

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getMy();
      setNotifications(data);
      const hasUnread = data.some((n) => !n.isRead);
      if (hasUnread) {
        try { await notificationsApi.markAllAsRead(); } catch { /* best effort */ }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const groupedNotifications = groupNotificationsByDate(notifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background.screen }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{
          flexDirection: "row", alignItems: "center",
          paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16,
          borderBottomWidth: 1, borderBottomColor: theme.border.subtle,
          backgroundColor: theme.background.header,
        }}>
          <View style={{ width: 40, height: 24, borderRadius: 6, backgroundColor: theme.border.subtle, marginRight: 16 }} />
          <View style={{ width: 140, height: 20, borderRadius: 6, backgroundColor: theme.border.subtle }} />
        </View>
        <View style={{ padding: 16, paddingTop: 20 }}>
          {[0, 1, 2, 3, 4].map((i) => <NotificationItemSkeleton key={i} />)}
        </View>
      </View>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: theme.background.screen }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border.subtle,
        backgroundColor: theme.background.header,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={theme.text.secondary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <AppText variant="h3" style={{ color: theme.text.secondary, fontWeight: "700", fontSize: 18 }}>
            {t("notifications.title") || "Notifications"}
          </AppText>
          {unreadCount > 0 && (
            <AppText variant="caption" style={{ color: theme.text.muted, fontSize: 12, marginTop: 2 }}>
              {unreadCount} {t("notifications.unread")}
            </AppText>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={async () => {
              try { await notificationsApi.markAllAsRead(); } catch { /* */ }
              setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: theme.primary.green + "15",
            }}
          >
            <AppText style={{ fontSize: 12, fontWeight: "600", color: theme.primary.green }}>
              {t("notifications.markAllRead")}
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary.green]} />
        }
      >
        {groupedNotifications.length === 0 ? (
          /* ── Empty state ── */
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
            <View style={{
              width: 100, height: 100, borderRadius: 50,
              backgroundColor: "#F3E5F5", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}>
              <Ionicons name="notifications-off-outline" size={48} color="#9C27B0" />
            </View>
            <AppText variant="h3" style={{ color: theme.text.primary, fontWeight: "700", fontSize: 18, marginBottom: 6 }}>
              {t("notifications.empty") || "No notifications yet"}
            </AppText>
            <AppText variant="bodySm" style={{ color: theme.text.muted, textAlign: "center", maxWidth: 260, lineHeight: 20 }}>
              {t("notifications.emptySubtitle") || "You'll be notified about schemes, events and updates here"}
            </AppText>
          </View>
        ) : (
          <View style={{ paddingBottom: 40, paddingTop: 16 }}>
            {groupedNotifications.map((group, index) => (
              <View key={index} style={{ marginBottom: 24 }}>
                {/* Section header */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <AppText variant="h3" style={{
                    fontSize: 12, fontWeight: "700",
                    color: theme.text.placeholder,
                    textTransform: "uppercase", letterSpacing: 0.8,
                  }}>
                    {t(group.titleKey) || group.title}
                  </AppText>
                  <View style={{ flex: 1, height: 1, backgroundColor: theme.border.subtle, marginLeft: 12 }} />
                  <AppText variant="caption" style={{ color: theme.text.placeholder, fontSize: 11, marginLeft: 8 }}>
                    {group.data.length}
                  </AppText>
                </View>
                {group.data.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onPress={() => {
                      // Navigate based on notification data
                      const data = (notification as any).data || {};
                      if (data.screen) {
                        const routeMap: Record<string, string> = {
                          "scheme-details": "/scheme-details",
                          "event-details": "/event-details",
                          "program-details": "/program-details",
                        };
                        const route = routeMap[data.screen] || `/${data.screen}`;
                        if (data.id) {
                          router.push({ pathname: route as any, params: { id: String(data.id) } });
                        } else {
                          router.push(route as any);
                        }
                      }
                    }}
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
