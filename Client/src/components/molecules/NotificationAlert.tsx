import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../atoms/AppText";

interface NotificationAlertProps {
  notification: {
    id: string;
    title: string;
    description: string;
  };
  onDismiss: () => void;
  onViewAll: () => void;
}

export default function NotificationAlert({
  notification,
  onDismiss,
  onViewAll,
}: NotificationAlertProps) {
  return (
    <View
      style={{
        backgroundColor: "#FFFBEB",
        borderWidth: 1,
        borderColor: "#FDE68A",
        borderRadius: 12,
        padding: 12,
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

      {/* Top row: bell icon, title, dismiss button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Ionicons
          name="notifications-outline"
          size={18}
          color="#D97706"
          style={{ marginRight: 6 }}
        />
        <AppText
          variant="bodySm"
          style={{ flex: 1, fontWeight: "600", color: "#92400E" }}
          numberOfLines={1}
        >
          {notification.title}
        </AppText>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-outline" size={18} color="#92400E" />
        </TouchableOpacity>
      </View>

      {/* Body text — max 2 lines */}
      <AppText
        variant="caption"
        style={{ color: "#78350F", marginBottom: 8 }}
        numberOfLines={2}
      >
        {notification.description}
      </AppText>

      {/* Bottom row: View All link */}
      <View style={{ alignItems: "flex-end" }}>
        <TouchableOpacity onPress={onViewAll}>
          <AppText variant="caption" style={{ color: "#386641", fontWeight: "600" }}>
            View All →
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
