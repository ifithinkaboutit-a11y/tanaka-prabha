// src/components/atoms/FormInput.tsx
import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface FormInputProps extends Omit<TextInputProps, "className"> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export default function FormInput({
  label,
  error,
  containerClassName = "",
  ...props
}: FormInputProps) {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-neutral-textMedium text-sm mb-2">{label}</Text>
      )}

      <TextInput
        className={`border rounded-xl px-4 py-4 bg-white text-base text-neutral-textDark ${
          error ? "border-semantic-error" : "border-neutral-border"
        }`}
        placeholderTextColor="#9E9E9E"
        {...props}
      />

      {error && (
        <Text className="text-semantic-error text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}
