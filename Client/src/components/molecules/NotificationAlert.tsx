import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../atoms/AppText";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO timestamp
}

interface NotificationAlertProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  onViewAll: () => void;
}

function relativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}

export default function NotificationAlert({
  notifications,
  onDismiss,
  onViewAll,
}: NotificationAlertProps) {
  if (notifications.length === 0) return null;

  const visible = notifications.slice(0, 3);

  return (
    <View
      style={{
        backgroundColor: "#FFFBEB",
        borderWidth: 1,
        borderColor: "#FDE68A",
        borderRadius: 12,
        paddingLeft: 16,
        overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: "#F59E0B",
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
        }}
      />

      {visible.map((item, index) => (
        <View
          key={item.id}
          style={{
            paddingTop: 12,
            paddingRight: 12,
            paddingBottom: index < visible.length - 1 ? 10 : 8,
            borderBottomWidth: index < visible.length - 1 ? 1 : 0,
            borderBottomColor: "#FDE68A",
          }}
        >
          {/* Row: bell icon, title, timestamp, dismiss */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Ionicons
              name="notifications-outline"
              size={16}
              color="#D97706"
              style={{ marginRight: 6 }}
            />
            <AppText
              variant="bodySm"
              style={{ flex: 1, fontWeight: "600", color: "#92400E" }}
              numberOfLines={1}
            >
              {item.title}
            </AppText>
            <AppText variant="caption" style={{ color: "#B45309", marginRight: 8 }}>
              {relativeTime(item.createdAt)}
            </AppText>
            <TouchableOpacity
              onPress={() => onDismiss(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-outline" size={18} color="#92400E" />
            </TouchableOpacity>
          </View>

          {/* Description — max 2 lines */}
          <AppText
            variant="caption"
            style={{ color: "#78350F" }}
            numberOfLines={2}
          >
            {item.description}
          </AppText>
        </View>
      ))}

      {/* View All link */}
      <View style={{ alignItems: "flex-end", paddingRight: 12, paddingBottom: 10, paddingTop: 6 }}>
        <TouchableOpacity onPress={onViewAll}>
          <AppText variant="caption" style={{ color: "#386641", fontWeight: "600" }}>
            View All →
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
