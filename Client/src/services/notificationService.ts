// src/services/notificationService.ts
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Check if running in Expo Go.
// Constants.appOwnership was removed in SDK 50. Use executionEnvironment instead.
// In Expo Go executionEnvironment === "storeClient"; in preview/production it is "standalone".
const isExpoGo =
  Constants.executionEnvironment === "storeClient" ||
  // Fallback: older SDK may still have appOwnership
  (Constants as any).appOwnership === "expo";

// Configure how notifications are handled when the app is in the foreground.
// IMPORTANT: Do NOT call this in Expo Go (SDK 53+).
// Calling setNotificationHandler at module load time — even inside a try/catch —
// triggers expo-notifications' internal DevicePushTokenAutoRegistration side-effect
// which crashes because remote notifications were removed from Expo Go in SDK 53.
if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    // Silently ignore — unsupported environment
  }
}

// Notification types
export type NotificationType = "approval" | "reminder" | "alert" | "info";

export interface LocalNotification {
  id?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  type?: NotificationType;
  scheduledTime?: Date;
}

// Register for push notifications and get the token
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  let token: string | null = null;

  // Push token registration doesn't work in Expo Go (SDK 53+)
  // but local notifications still work fine — only skip token acquisition
  if (isExpoGo) {
    console.log(
      "📵 Push token unavailable in Expo Go — local notifications still work.",
    );
    return null;
  }

  // Check if running on a physical device
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  // Set up Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#386641",
    });

    // Create specific channels for different notification types
    await Notifications.setNotificationChannelAsync("approvals", {
      name: "Approvals",
      description: "Scheme and application approval notifications",
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: "#2196F3",
    });

    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Reminders",
      description: "Payment and deadline reminders",
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: "#E91E63",
    });

    await Notifications.setNotificationChannelAsync("alerts", {
      name: "Alerts",
      description: "Weather and emergency alerts",
      importance: Notifications.AndroidImportance.MAX,
      lightColor: "#FF5722",
    });
  }

  // Check existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push notification permission");
    return null;
  }

  // Get Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const pushToken = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    token = pushToken.data;
    console.log("Push token:", token);
  } catch (error) {
    console.log("Error getting push token:", error);
  }

  return token;
}

// Schedule a local notification
export async function scheduleLocalNotification(
  notification: LocalNotification,
): Promise<string> {
  const channelId = getChannelForType(notification.type);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: {
        ...notification.data,
        type: notification.type,
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    // expo-notifications ~0.28+ requires an explicit `type` field on triggers.
    trigger: notification.scheduledTime
      ? {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notification.scheduledTime,
        channelId,
      }
      : {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        channelId,
        repeats: false,
      },
  });

  return id;
}

// Schedule notification for a specific time
export async function scheduleNotificationAtTime(
  notification: LocalNotification,
  date: Date,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });

  return id;
}

// Send immediate local notification
export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  type?: NotificationType,
): Promise<string> {
  return scheduleLocalNotification({
    title,
    body,
    data,
    type,
  });
}

// Cancel a specific notification
export async function cancelNotification(
  notificationId: string,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return Notifications.getAllScheduledNotificationsAsync();
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

// Set badge count
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Helper to get channel ID based on notification type
function getChannelForType(type?: NotificationType): string {
  switch (type) {
    case "approval":
      return "approvals";
    case "reminder":
      return "reminders";
    case "alert":
      return "alerts";
    default:
      return "default";
  }
}

// Demo notifications - for testing
export const demoNotifications: LocalNotification[] = [
  {
    title: "Kisan Credit Card Approved",
    body: "Your Kisan Credit Card application has been approved! Visit your nearest bank branch.",
    type: "approval",
    data: { screen: "notifications", schemeId: "kcc" },
  },
  {
    title: "Loan Repayment Reminder",
    body: "Your KCC loan repayment is due in 15 days. Amount: ₹25,000",
    type: "reminder",
    data: { screen: "notifications", action: "payment" },
  },
  {
    title: "Weather Alert",
    body: "Heavy rainfall expected in your area. Consider crop insurance review.",
    type: "alert",
    data: { screen: "notifications", alertType: "weather" },
  },
  {
    title: "New Scheme Available",
    body: "PM-KISAN 16th installment is now available for eligible farmers.",
    type: "info",
    data: { screen: "schemes", schemeId: "pm-kisan" },
  },
];

// Send a demo notification (for testing)
export async function sendDemoNotification(index: number = 0): Promise<string> {
  const notification = demoNotifications[index % demoNotifications.length];
  return sendImmediateNotification(
    notification.title,
    notification.body,
    notification.data,
    notification.type,
  );
}
