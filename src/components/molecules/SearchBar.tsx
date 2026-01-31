// src/components/molecules/SearchBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, TextInput, View } from "react-native";
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

  const handleVoicePress = () => {
    if (onVoiceInput) {
      onVoiceInput();
    } else {
      // Placeholder for voice input functionality
      Alert.alert(
        "Voice Input",
        "Voice input feature would be implemented here using a speech recognition library like @react-native-voice/voice",
      );
    }
  };

  const handleSubmit = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 py-2 mx-8">
      <Ionicons
        name="search-outline"
        size={20}
        color={colors.neutral.textLight}
      />

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={placeholder}
        className="flex-1 ml-2 text-bodyMd text-neutral-textDark"
        placeholderTextColor={colors.neutral.textLight}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
      />

      <Ionicons
        name="mic-outline"
        size={20}
        color={colors.neutral.textLight}
        onPress={handleVoicePress}
        style={{ marginLeft: 8 }}
      />
    </View>
  );
}
