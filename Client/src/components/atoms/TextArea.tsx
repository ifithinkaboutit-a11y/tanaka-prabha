// src/components/atoms/TextArea.tsx
import React from "react";
import { TextInput, View } from "react-native";
import clsx from "clsx";

type TextAreaProps = {
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  numberOfLines?: number;
  disabled?: boolean;
  className?: string;
};

const TextArea = ({
  value,
  placeholder,
  onChangeText,
  numberOfLines = 4,
  disabled = false,
  className,
}: TextAreaProps) => {
  return (
    <View
      className={clsx(
        "bg-neutral-surface border border-neutral-border rounded-lg px-3 py-3",
        disabled && "opacity-50",
        className
      )}
    >
      <TextInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        editable={!disabled}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        className="text-bodyMd text-neutral-textDark"
        placeholderTextColor="#9E9E9E"
      />
    </View>
  );
};

export default TextArea;
