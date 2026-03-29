import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../atoms/AppText";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface NotificationAlertProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  onViewAll: () => void;
}

function relativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

export default function NotificationAlert({
  notifications,
  onDismiss,
  onViewAll,
}: NotificationAlertProps) {
  if (notifications.length === 0) return null;

  // Show only the most recent notification; badge the rest
  const latest = notifications[0];
  const extraCount = notifications.length - 1;

  return (
    <View style={{
      backgroundColor: "#FFFBEB",
      borderWidth: 1,
      borderColor: "#FDE68A",
      borderRadius: 16,
      overflow: "hidden",
    }}>
      {/* Left accent bar */}
      <View style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 4, backgroundColor: "#F59E0B",
        borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
      }} />

      <View style={{ paddingLeft: 16, paddingRight: 12, paddingTop: 12, paddingBottom: 12 }}>
        {/* Header row */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
            <Ionicons name="notifications" size={15} color="#D97706" />
          </View>
          <AppText style={{ flex: 1, fontWeight: "700", color: "#92400E", fontSize: 13 }} numberOfLines={1}>
            {latest.title}
          </AppText>
          <AppText style={{ color: "#B45309", fontSize: 11, marginRight: 8 }}>
            {relativeTime(latest.createdAt)}
          </AppText>
          <TouchableOpacity onPress={() => onDismiss(latest.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#D97706" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <AppText style={{ color: "#78350F", fontSize: 12, lineHeight: 17, marginLeft: 36 }} numberOfLines={2}>
          {latest.description}
        </AppText>

        {/* Footer: extra badge + view all */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, marginLeft: 36 }}>
          {extraCount > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ backgroundColor: "#FDE68A", borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 }}>
                <AppText style={{ color: "#92400E", fontSize: 11, fontWeight: "700" }}>
                  +{extraCount} more
                </AppText>
              </View>
            </View>
          ) : <View />}
          <TouchableOpacity onPress={onViewAll} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <AppText style={{ color: "#386641", fontSize: 12, fontWeight: "700" }}>View All</AppText>
            <Ionicons name="arrow-forward" size={12} color="#386641" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
