// src/hooks/useVoiceInput.ts
import { useEffect, useState } from "react";

interface UseVoiceInputOptions {
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

export const useVoiceInput = (options: UseVoiceInputOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // For now, disable voice input due to compatibility issues
    // TODO: Implement voice input when @react-native-voice/voice is properly configured
    setIsAvailable(false);
  }, []);

  const startListening = async () => {
    if (!isAvailable) {
      options.onError?.("Voice recognition is not available on this device");
      return;
    }
    // Voice input implementation would go here
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return {
    isListening,
    isAvailable,
    startListening,
    stopListening,
  };
};
