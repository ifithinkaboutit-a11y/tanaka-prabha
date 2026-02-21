// src/components/molecules/SearchBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

type SearchBarProps = {
  placeholder?: string;
  onSearch?: (query: string) => void;
};

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}` as any);
      }
    }
  };

  return (
    <View
      style={{
        marginHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderWidth: 1.5,
        borderColor: isFocused ? "#386641" : "#E5E7EB",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Ionicons
        name="search"
        size={22}
        color={isFocused ? "#386641" : "#9CA3AF"}
      />

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={placeholder}
        style={{
          flex: 1,
          marginLeft: 12,
          fontSize: 16,
          color: "#1F2937",
          fontWeight: "400",
        }}
        placeholderTextColor="#9CA3AF"
        onSubmitEditing={handleSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
      />

      {searchQuery.length > 0 && (
        <Pressable onPress={() => setSearchQuery("")}>
          <Ionicons name="close-circle" size={20} color="#9CA3AF" />
        </Pressable>
      )}
    </View>
  );
}
