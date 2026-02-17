// src/components/atoms/FormInput.tsx
import React from "react";
import { TextInput, TextInputProps, View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../styles/colors";
import AppText from "./AppText";

interface FormInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function FormInput({
  label,
  error,
  containerStyle,
  ...props
}: FormInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <AppText variant="bodySm" style={styles.label}>
          {label}
        </AppText>
      )}

      <TextInput
        style={[styles.input, error ? styles.inputError : styles.inputNormal]}
        placeholderTextColor={colors.neutral.textLight}
        {...props}
      />

      {error && (
        <AppText variant="bodySm" style={styles.error}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: colors.neutral.textMedium,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: colors.neutral.textDark,
  },
  inputNormal: {
    borderColor: colors.neutral.border,
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  error: {
    color: colors.semantic.error,
    fontSize: 13,
    marginTop: 4,
  },
});
