import Constants from "expo-constants";
import { useState } from "react";
// Imports removed for Expo SDK 53 compatibility

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

export interface NotificationState {
  expoPushToken: string | null;
  notification: any | null;
  isLoading: boolean;
  error: string | null;
}

export function useNotifications() {
  const [isLoading, setIsLoading] = useState(false);

  return {
    expoPushToken: null,
    notification: null,
    isLoading,
    error: null,
    sendNotification: async () => { },
  };
}
