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

  // Sync interestCount when the parent provides a fresh value from the API
  useEffect(() => {
    setInterestCount(initialCount);
  }, [initialCount]);

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

    const prevInterested = isInterested;
    const prevCount = interestCount;

    const nextInterested = !isInterested;
    const optimisticCount = nextInterested
      ? interestCount + 1
      : Math.max(0, interestCount - 1);

    setIsInterested(nextInterested);
    setInterestCount(optimisticCount);
    setLoading(true);

    try {
      // Persist locally first — works even if the backend route doesn't exist yet
      await AsyncStorage.setItem(storageKey(id), String(nextInterested));

      try {
        const result = nextInterested
          ? await schemesApi.addInterest(id)
          : await schemesApi.removeInterest(id);
        // Update count from API response only if the call succeeded
        setInterestCount(result.interestCount);
      } catch (apiErr: any) {
        // 404 means the interest endpoint isn't deployed yet — keep local state,
        // don't revert and don't show an error to the user.
        if (apiErr?.status === 404) {
          console.warn("⚠️ Interest API not available — using local state only");
        } else {
          // Real error — revert everything
          setIsInterested(prevInterested);
          setInterestCount(prevCount);
          await AsyncStorage.setItem(storageKey(id), String(prevInterested));
          Alert.alert(
            "Error",
            nextInterested
              ? "Could not add interest. Please try again."
              : "Could not remove interest. Please try again."
          );
        }
      }
    } catch {
      // AsyncStorage failure — revert UI
      setIsInterested(prevInterested);
      setInterestCount(prevCount);
    } finally {
      setLoading(false);
    }
  }, [id, isInterested, interestCount, loading]);

  return { isInterested, interestCount, toggleInterest, loading };
}
