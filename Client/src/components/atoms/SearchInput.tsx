// src/components/atoms/SearchInput.tsx
import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { useTranslation } from "../../i18n";

type SearchInputProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
};

export default function SearchInput({
  placeholder,
  value,
  onChangeText,
}: SearchInputProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder || t("common.searchPlaceholder");
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color={colors.neutral.textLight} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={resolvedPlaceholder}
        style={styles.input}
        placeholderTextColor={colors.neutral.textLight}
        accessibilityLabel={t("search.accessibilityLabel")}
        accessibilityHint={t("search.accessibilityHint")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: colors.neutral.textDark,
  },
});
