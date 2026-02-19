// src/components/atoms/TextArea.tsx
import React from "react";
import { TextInput, View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../styles/colors";

type TextAreaProps = {
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  numberOfLines?: number;
  disabled?: boolean;
  style?: ViewStyle;
};

const TextArea = ({
  value,
  placeholder,
  onChangeText,
  numberOfLines = 4,
  disabled = false,
  style,
}: TextAreaProps) => {
  return (
    <View style={[styles.container, disabled && styles.disabled, style]}>
      <TextInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        editable={!disabled}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        style={styles.input}
        placeholderTextColor={colors.neutral.textLight}
      />
    </View>
  );
};

export default TextArea;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    fontSize: 15,
    color: colors.neutral.textDark,
  },
});
