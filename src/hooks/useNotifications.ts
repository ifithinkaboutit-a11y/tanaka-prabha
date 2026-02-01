// src/hooks/useNotifications.ts
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    NotificationType,
    registerForPushNotificationsAsync,
    sendImmediateNotification,
} from "../services/notificationService";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

export interface NotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  isLoading: boolean;
  error: string | null;
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Skip notification setup in Expo Go (not supported in SDK 53+)
    if (isExpoGo) {
      console.log(
        "Push notifications not available in Expo Go. Use a development build.",
      );
      setIsLoading(false);
      return;
    }

    // Register for push notifications
    registerForPushNotificationsAsync()
      .then((token) => {
        setExpoPushToken(token);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });

    // Listener for when a notification is received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        console.log("Notification received:", notification);
      });

    // Listener for when user taps on a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("Notification tapped:", data);

        // Navigate based on notification data
        if (data?.screen) {
          const screen = data.screen as string;
          if (screen === "notifications") {
            router.push("/notifications" as any);
          } else if (screen === "schemes" && data.schemeId) {
            router.push({
              pathname: "/scheme-details",
              params: { schemeId: data.schemeId as string },
            } as any);
          } else if (screen === "connect") {
            router.push("/(tab)/connect" as any);
          }
        }
      });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);

  // Function to send a notification
  const sendNotification = async (
    title: string,
    body: string,
    data?: Record<string, unknown>,
    type?: NotificationType,
  ) => {
    try {
      const id = await sendImmediateNotification(title, body, data, type);
      return id;
    } catch (err) {
      console.error("Error sending notification:", err);
      throw err;
    }
  };

  return {
    expoPushToken,
    notification,
    isLoading,
    error,
    sendNotification,
  };
}
