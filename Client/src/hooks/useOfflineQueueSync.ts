// src/hooks/useOfflineQueueSync.ts
import { useEffect, useRef } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { offlineQueue } from "../utils/offlineQueue";
import { eventsApi } from "../services/apiService";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

async function syncQueue(): Promise<void> {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  const entries = await offlineQueue.getAll();
  const now = Date.now();
  const eligible = entries.filter(
    (e) => now - new Date(e.savedAt).getTime() >= SIX_HOURS_MS
  );

  for (const entry of eligible) {
    try {
      if (entry.type === "create-event") {
        await eventsApi.create(entry.payload as any);
      } else if (entry.type === "mark-attendance") {
        const p = entry.payload as {
          eventId: string;
          mobileNumber: string;
          status: "present" | "absent";
          name?: string;
        };
        await eventsApi.markAttendance(p.eventId, p.mobileNumber, p.status, p.name);
      }
      await offlineQueue.dequeue(entry.id);
    } catch {
      await offlineQueue.markAttempt(entry.id, false);
      Alert.alert(
        "Upload Failed",
        `A cached ${entry.type === "create-event" ? "event" : "attendance"} submission could not be uploaded. It will be retried later.`
      );
    }
  }
}

export function useOfflineQueueSync(): void {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (appState.current !== "active" && nextState === "active") {
          syncQueue().catch(() => {});
        }
        appState.current = nextState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);
}
