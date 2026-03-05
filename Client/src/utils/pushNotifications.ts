// src/utils/pushNotifications.ts
// Handles Expo push token registration and notification setup

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { tokenManager } from "@/services/apiService";

// ── How foreground notifications behave ──────────────────────────────────────
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,   // banner drop-down (expo-notifications >= 0.28)
        shouldShowList: true,     // notification tray list
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});


// ── Android channel setup ─────────────────────────────────────────────────────
async function ensureAndroidChannel() {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#386641",
        });
    }
}

// ── Get the Expo push token ───────────────────────────────────────────────────
export async function getExpoPushToken(): Promise<string | null> {
    // Push tokens only work on real physical devices
    if (!Device.isDevice) {
        console.log("📲 Push notifications require a physical device (not emulator).");
        return null;
    }

    await ensureAndroidChannel();

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.warn("📲 Push notification permission denied.");
        return null;
    }

    // Get the token – projectId is required for Expo Go and managed workflow
    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

    if (!projectId) {
        console.error("📲 EAS projectId not found in app config.");
        return null;
    }

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        console.log("📲 Expo Push Token:", tokenData.data);
        return tokenData.data;
    } catch (error) {
        console.error("📲 Failed to get push token:", error);
        return null;
    }
}

// ── Register token with backend ───────────────────────────────────────────────
export async function registerPushTokenWithBackend(pushToken: string): Promise<void> {
    try {
        const authToken = await tokenManager.getToken();
        if (!authToken) return;

        const API_BASE = process.env.EXPO_PUBLIC_API_URL;
        const res = await fetch(`${API_BASE}/notifications/register-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                push_token: pushToken,
                platform: Platform.OS,
            }),
        });

        if (res.ok) {
            console.log("📲 Push token registered with backend successfully.");
        } else {
            const data = await res.json();
            console.warn("📲 Failed to register push token:", data.message);
        }
    } catch (error) {
        // Non-fatal — app still works without push token registration
        console.warn("📲 Could not register push token with backend:", error);
    }
}

// ── Main function: call this once after login ─────────────────────────────────
export async function setupPushNotifications(): Promise<string | null> {
    const token = await getExpoPushToken();
    if (token) {
        await registerPushTokenWithBackend(token);
    }
    return token ?? null;
}

// ── Notification listeners (use in App root) ──────────────────────────────────
/**
 * Call this in your root component to listen for incoming notifications.
 * Returns a cleanup function — call it in useEffect's return.
 *
 * @example
 * useEffect(() => {
 *   const cleanup = addNotificationListeners(
 *     (notification) => console.log("Received:", notification),
 *     (response) => console.log("Tapped:", response),
 *   );
 *   return cleanup;
 * }, []);
 */
export function addNotificationListeners(
    onReceived?: (notification: Notifications.Notification) => void,
    onResponse?: (response: Notifications.NotificationResponse) => void,
): () => void {
    const receivedSub = Notifications.addNotificationReceivedListener(
        (notification) => {
            console.log("📲 Notification received:", notification);
            onReceived?.(notification);
        }
    );

    const responseSub = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            console.log("📲 Notification tapped:", response);
            onResponse?.(response);
        }
    );

    return () => {
        receivedSub.remove();
        responseSub.remove();
    };
}

// ── Utility: send a LOCAL notification (for testing without a server) ─────────
export async function sendLocalNotification(title: string, body: string, data?: Record<string, any>) {
    await Notifications.scheduleNotificationAsync({
        content: { title, body, data: data ?? {}, sound: true },
        trigger: null, // fire immediately
    });
}
