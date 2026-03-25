/**
 * useInterest hook
 *
 * Manages the "interested" state for a scheme or program.
 * - Reads persisted state from AsyncStorage on mount (key: `interest:{id}`)
 * - Exposes isInterested, interestCount, and toggleInterest()
 * - Optimistically updates state on toggle; reverts + alerts on API failure
 *
 * Requirements: 5.1.3, 5.1.4, 5.1.5, 5.1.6, 5.1.7, 5.1.8, 5.1.10
 */

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { schemesApi } from "../services/apiService";

const storageKey = (id: string) => `interest:${id}`;

export interface UseInterestResult {
  isInterested: boolean;
  interestCount: number;
  toggleInterest: () => Promise<void>;
  loading: boolean;
}

export function useInterest(
  id: string,
  initialCount = 0
): UseInterestResult {
  const [isInterested, setIsInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // On mount: read persisted interest state from AsyncStorage (Req 5.1.8)
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey(id))
      .then((value) => {
        if (!cancelled && value !== null) {
          setIsInterested(value === "true");
        }
      })
      .catch(() => {
        // Gracefully ignore AsyncStorage read failures
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleInterest = useCallback(async () => {
    if (loading) return;

    // Snapshot pre-toggle state for potential revert (Req 5.1.10)
    const prevInterested = isInterested;
    const prevCount = interestCount;

    // Optimistic update
    const nextInterested = !isInterested;
    const optimisticCount = nextInterested
      ? interestCount + 1
      : Math.max(0, interestCount - 1);

    setIsInterested(nextInterested);
    setInterestCount(optimisticCount);
    setLoading(true);

    try {
      const result = nextInterested
        ? await schemesApi.addInterest(id)      // Req 5.1.3
        : await schemesApi.removeInterest(id);  // Req 5.1.5

      // Update count from API response (Req 5.1.4, 5.1.6)
      setInterestCount(result.interestCount);

      // Persist new state to AsyncStorage (Req 5.1.7)
      await AsyncStorage.setItem(storageKey(id), String(nextInterested));
    } catch {
      // Revert on failure (Req 5.1.10)
      setIsInterested(prevInterested);
      setInterestCount(prevCount);

      Alert.alert(
        "Error",
        nextInterested
          ? "Could not add interest. Please try again."
          : "Could not remove interest. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id, isInterested, interestCount, loading]);

  return { isInterested, interestCount, toggleInterest, loading };
}
