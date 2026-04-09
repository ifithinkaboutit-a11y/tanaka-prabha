// src/components/molecules/SearchBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "@/styles/colors";

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
        borderColor: isFocused ? theme.primary.green : theme.border.subtle,
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
        color={isFocused ? theme.primary.green : theme.text.placeholder}
      />

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={placeholder}
        style={{
          flex: 1,
          marginLeft: 12,
          fontSize: 16,
          color: theme.text.secondary,
          fontWeight: "400",
        }}
        placeholderTextColor={theme.text.placeholder}
        onSubmitEditing={handleSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
      />

      {searchQuery.length > 0 ? (
        <Pressable onPress={() => setSearchQuery("")}>
          <Ionicons name="close-circle" size={30} color={theme.text.placeholder} />
        </Pressable>
      ) : (
        <></>
      )}
    </View>
  );
}
