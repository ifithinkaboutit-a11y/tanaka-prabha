// src/hooks/useVoiceInput.ts
import { useEffect, useState } from "react";

// Try to import @react-native-voice/voice
let Voice: any = null;
try {
  const VoiceModule = require("@react-native-voice/voice");
  Voice = VoiceModule.default || VoiceModule;
} catch (error) {
  console.warn("Voice recognition module not available:", error);
}

interface UseVoiceInputOptions {
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

export const useVoiceInput = (options: UseVoiceInputOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Check if voice recognition is available
    const checkAvailability = async () => {
      console.log("Voice module:", Voice ? "Available" : "Not available");

      if (!Voice) {
        console.warn("Voice recognition not supported on this platform");
        setIsAvailable(false);
        return;
      }

      try {
        // Try different methods to check availability
        let available = false;

        try {
          if (Voice && typeof Voice.isAvailable === "function") {
            console.log("Using Voice.isAvailable()");
            available = await Voice.isAvailable();
          } else if (Voice && Voice.isRecognizing !== undefined) {
            console.log("Voice module exists, assuming available");
            available = true;
          } else {
            console.log("No availability check method found");
            available = false;
          }
        } catch (err) {
          console.warn("Error checking voice availability:", err);
          available = false;
        }

        console.log("Voice recognition available:", available);
        setIsAvailable(available);

        if (available) {
          // Set up event listeners
          Voice.onSpeechResults = (e: any) => {
            const text = e.value?.[0] || "";
            if (text) {
              options.onResult?.(text);
            }
            setIsListening(false);
          };

          Voice.onSpeechError = (e: any) => {
            options.onError?.(e.error?.message || "Speech recognition error");
            setIsListening(false);
          };
        }
      } catch (error) {
        console.warn("Voice recognition initialization failed:", error);
        setIsAvailable(false);
      }
    };

    checkAvailability();

    // Cleanup
    return () => {
      if (Voice && typeof Voice.destroy === "function") {
        try {
          Voice.destroy()
            .then(() => {
              if (typeof Voice.removeAllListeners === "function") {
                Voice.removeAllListeners();
              }
            })
            .catch(() => {});
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [options.onResult, options.onError]);

  const startListening = async () => {
    if (!isAvailable || !Voice) {
      options.onError?.("Voice recognition is not available on this device");
      return;
    }

    try {
      setIsListening(true);
      await Voice.start(options.language || "en-US");
    } catch (error) {
      setIsListening(false);
      options.onError?.("Failed to start voice input");
      console.warn("Voice start error:", error);
    }
  };

  const stopListening = () => {
    if (Voice && typeof Voice.stop === "function") {
      try {
        Voice.stop();
      } catch (error) {
        console.warn("Voice stop error:", error);
      }
    }
    setIsListening(false);
  };

  return {
    isListening,
    isAvailable,
    startListening,
    stopListening,
  };
};
