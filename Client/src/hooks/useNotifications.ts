// src/hooks/useNotifications.ts
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  registerForPushNotificationsAsync,
  scheduleLocalNotification,
  sendImmediateNotification,
  type LocalNotification,
  type NotificationType,
} from "../services/notificationService";

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

  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    // Register for push notifications
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
      } catch (err: any) {
        setError(err?.message ?? "Failed to register for notifications");
      } finally {
        setIsLoading(false);
      }
    })();

    // Listener: notification received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((n) => {
        setNotification(n);
      });

    // Listener: user tapped on a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as any;
        console.log("🔔 Notification tapped:", data);
        // TODO: navigate based on data.screen when router is available here
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  /** Send an immediate local notification (works without push token) */
  const sendNotification = useCallback(
    async (
      title: string,
      body: string,
      data?: Record<string, unknown>,
      type?: NotificationType,
    ) => {
      try {
        const id = await sendImmediateNotification(title, body, data, type);
        return id;
      } catch (err: any) {
        console.warn("Failed to send notification:", err);
      }
    },
    [],
  );

  /** Schedule a notification at a specific time */
  const scheduleNotification = useCallback(
    async (notification: LocalNotification) => {
      try {
        const id = await scheduleLocalNotification(notification);
        return id;
      } catch (err: any) {
        console.warn("Failed to schedule notification:", err);
      }
    },
    [],
  );

  return {
    expoPushToken,
    notification,
    isLoading,
    error,
    sendNotification,
    scheduleNotification,
  };
}
