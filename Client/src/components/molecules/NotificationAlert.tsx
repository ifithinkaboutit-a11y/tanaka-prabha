import React, { useEffect, useRef } from "react";
import {
  Animated,
  TouchableOpacity,
  View,
  StyleSheet,
  AccessibilityInfo,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../atoms/AppText";
import { theme } from "@/styles/colors";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationItem {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationAlert({
  notifications,
  onDismiss,
  onViewAll,
}: NotificationAlertProps) {
  const slideAnim = useRef(new Animated.Value(-8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animate in whenever notifications change (new item arrives)
  useEffect(() => {
    if (notifications.length === 0) return;

    slideAnim.setValue(-8);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 18,
        stiffness: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Announce to screen readers
    AccessibilityInfo.announceForAccessibility(
      `New notification: ${notifications[0].title}. ${notifications[0].description}`
    );
  }, [notifications.length]);

  if (notifications.length === 0) return null;

  const latest = notifications[0];
  const extraCount = notifications.length - 1;
  const timeLabel = relativeTime(latest.createdAt);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
      ]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`Notification: ${latest.title}. ${latest.description}. Received ${timeLabel}.`}
    >
      {/* Left accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.inner}>
        {/* ── Header row ── */}
        <View style={styles.headerRow}>
          {/* Icon badge */}
          <View style={styles.iconBadge} accessibilityElementsHidden>
            <Ionicons name="notifications" size={14} color={COLORS.amber700} />
          </View>

          {/* Title */}
          <AppText
            style={styles.title}
            numberOfLines={1}
            accessibilityElementsHidden
          >
            {latest.title}
          </AppText>

          {/* Timestamp */}
          <AppText
            style={styles.timestamp}
            accessibilityElementsHidden
          >
            {timeLabel}
          </AppText>

          {/* Dismiss */}
          <TouchableOpacity
            onPress={() => onDismiss(latest.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            style={styles.dismissButton}
          >
            <Ionicons name="close-circle" size={18} color={COLORS.amber600} />
          </TouchableOpacity>
        </View>

        {/* ── Description ── */}
        <AppText style={styles.description} numberOfLines={2}>
          {latest.description}
        </AppText>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          {extraCount > 0 ? (
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>+{extraCount} more</AppText>
            </View>
          ) : (
            <View />
          )}

          <TouchableOpacity
            onPress={onViewAll}
            style={styles.viewAllButton}
            accessibilityRole="button"
            accessibilityLabel={`View all ${notifications.length} notifications`}
          >
            <AppText style={styles.viewAllText}>View All</AppText>
            <Ionicons name="arrow-forward" size={12} color={theme.primary.green} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const COLORS = {
  bgSurface: "#FFFBEB",
  border: "#FDE68A",
  accentBar: "#F59E0B",
  iconBg: "#FEF3C7",
  amber600: "#D97706",
  amber700: "#B45309",
  amber800: "#92400E",
  amber900: "#78350F",
  badgeBg: "#FDE68A",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgSurface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    overflow: "hidden",
    // Elevation for Android / shadow for iOS
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accentBar,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.accentBar,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  inner: {
    paddingLeft: 20,
    paddingRight: 12,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.iconBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontWeight: "700",
    color: COLORS.amber800,
    fontSize: 13,
  },
  timestamp: {
    color: COLORS.amber700,
    fontSize: 11,
    marginRight: 8,
  },
  dismissButton: {
    padding: 2,
  },
  description: {
    color: COLORS.amber900,
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 34,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginLeft: 34,
  },
  badge: {
    backgroundColor: COLORS.badgeBg,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: COLORS.amber800,
    fontSize: 11,
    fontWeight: "700",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  viewAllText: {
    color: theme.primary.green,
    fontSize: 12,
    fontWeight: "700",
  },
});