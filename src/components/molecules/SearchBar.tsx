// src/components/molecules/SearchBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, TextInput, View } from "react-native";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { colors } from "../../styles/colors";

type SearchBarProps = {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onVoiceInput?: () => void;
};

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  onVoiceInput,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { isListening, startListening, stopListening, isAvailable } =
    useVoiceInput({
      onResult: (text) => {
        setSearchQuery(text);
        if (onSearch) {
          onSearch(text);
        }
      },
      onError: (error) => {
        Alert.alert("Voice Input Error", error);
      },
    });

  const handleVoicePress = () => {
    if (!isAvailable) {
      Alert.alert(
        "Voice Input",
        "Voice recognition is currently not available. This feature requires additional setup for your device. Please use text search for now.",
      );
      return;
    }

    if (onVoiceInput) {
      onVoiceInput();
    } else {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    }
  };

  const handleSubmit = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 16,
      }}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={colors.neutral.textLight}
      />

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={placeholder}
        style={{
          flex: 1,
          marginLeft: 12,
          fontSize: 15,
          color: "#1F2937",
        }}
        placeholderTextColor={colors.neutral.textLight}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
      />

      <Ionicons
        name={isListening ? "mic" : "mic-outline"}
        size={20}
        color={
          !isAvailable
            ? "#ccc" // Disabled color
            : isListening
              ? colors.primary.main
              : colors.neutral.textLight
        }
        onPress={handleVoicePress}
        style={{ marginLeft: 8 }}
      />
    </View>
  );
}
