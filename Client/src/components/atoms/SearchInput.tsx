// src/components/atoms/SearchInput.tsx
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type SearchInputProps = {
  placeholder?: string;
};

export default function SearchInput({
  placeholder = "Search...",
}: SearchInputProps) {
  return (
    <View className="flex-row items-center bg-neutral-surface border border-neutral-border rounded-lg px-3 py-2">
      <Ionicons name="search-outline" size={20} color="#9E9E9E" />
      <TextInput
        placeholder={placeholder}
        className="flex-1 ml-2 text-bodyMd text-neutral-textDark"
        placeholderTextColor="#9E9E9E"
      />
    </View>
  );
}
