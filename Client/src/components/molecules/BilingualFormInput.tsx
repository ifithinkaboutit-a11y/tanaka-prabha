// src/components/molecules/BilingualFormInput.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { theme } from '@/styles/colors';

// Theme-based status colors
const successColor = theme.semantic.success;
const errorColor = theme.semantic.error;

// Validation rule interface
export interface ValidationRule {
  validate: (value: string) => boolean;
  message?: string; // Bilingual fallback message in format: "English | Hindi"
  messageKey?: string;
  messageParams?: Record<string, string | number>;
}

// Common validation patterns
export const ValidationPatterns = {
  required: (fieldName: string): ValidationRule => ({
    validate: (v) => v.trim().length > 0,
    messageKey: "validation.required",
    messageParams: { field: fieldName },
  }),
  minLength: (min: number, _fieldName: string): ValidationRule => ({
    validate: (v) => v.length >= min,
    messageKey: "validation.minLength",
    messageParams: { min },
  }),
  maxLength: (max: number, _fieldName: string): ValidationRule => ({
    validate: (v) => v.length <= max,
    messageKey: "validation.maxLength",
    messageParams: { max },
  }),
  numeric: (): ValidationRule => ({
    validate: (v) => !v || /^\d+$/.test(v),
    messageKey: "validation.numeric",
  }),
  phone: (): ValidationRule => ({
    validate: (v) => !v || /^[6-9]\d{9}$/.test(v),
    messageKey: "validation.phone",
  }),
  pincode: (): ValidationRule => ({
    validate: (v) => !v || /^[1-9]\d{5}$/.test(v),
    messageKey: "validation.pincode",
  }),
  aadhaar: (): ValidationRule => ({
    validate: (v) => !v || /^\d{4}\s?\d{4}\s?\d{4}$/.test(v),
    messageKey: "validation.aadhaar",
  }),
  name: (): ValidationRule => ({
    validate: (v) => !v || /^[a-zA-Zऀ-ॳ\s]+$/.test(v),
    messageKey: "validation.name",
  }),
  email: (): ValidationRule => ({
    validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    messageKey: "validation.email",
  }),
};

interface BilingualFormInputProps {
  label: string;
  labelHi?: string;
  value: string;
  onChangeText: (text: string) => void;
  rules?: ValidationRule[];
  placeholder?: string;
  placeholderHi?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  containerStyle?: ViewStyle;
  showSuccess?: boolean;
}

export function BilingualFormInput({
  label,
  labelHi,
  value,
  onChangeText,
  rules = [],
  placeholder,
  placeholderHi,
  keyboardType = 'default',
  autoCapitalize = 'words',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  containerStyle,
  showSuccess = true,
}: BilingualFormInputProps) {
  const { currentLanguage, t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isHindi = currentLanguage === 'hi';

  // Parse bilingual message
  const getMessage = useCallback((rule: ValidationRule): string => {
    if (rule.messageKey) {
      return t(rule.messageKey, rule.messageParams);
    }
    const message = rule.message || "";
    const parts = message.split('|');
    if (parts.length >= 2) {
      return isHindi ? parts[1].trim() : parts[0].trim();
    }
    return message;
  }, [isHindi, t]);

  // Validate on value change (only if touched)
  useEffect(() => {
    if (touched && rules.length > 0) {
      for (const rule of rules) {
        if (!rule.validate(value)) {
          setError(getMessage(rule));
          return;
        }
      }
      setError(null);
    }
  }, [value, touched, rules, getMessage]);

  const handleBlur = () => {
    setTouched(true);
    setIsFocused(false);

    // Validate on blur
    if (rules.length > 0) {
      for (const rule of rules) {
        if (!rule.validate(value)) {
          setError(getMessage(rule));
          return;
        }
      }
      setError(null);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const isValid = touched && !error && value.length > 0;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label Row */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {labelHi && <Text style={styles.labelHi}>{labelHi}</Text>}
      </View>

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          isValid && styles.inputContainerValid,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            multiline && { height: numberOfLines * 24 + 24 },
          ]}
          value={value}
          onChangeText={onChangeText}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={isHindi ? (placeholderHi || placeholder) : placeholder}
          placeholderTextColor={theme.text.placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          textAlignVertical={multiline ? 'top' : 'center'}
        />

        {/* Status Icon */}
        {showSuccess && touched && value.length > 0 && (
          <View style={styles.iconContainer}>
            {error ? (
              <Ionicons name="close-circle" size={18} color={errorColor} />
            ) : (
              <Ionicons name="checkmark-circle" size={18} color={successColor} />
            )}
          </View>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={errorColor} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// Pre-built field component for common use cases
export function NameInput({
  value,
  onChangeText,
  label,
  required = false,
}: {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  required?: boolean;
}) {
  const { t } = useTranslation();
  const resolvedLabel = label || t("forms.labels.name");
  const rules = [
    ValidationPatterns.minLength(2, resolvedLabel),
    ValidationPatterns.name(),
  ];
  if (required) {
    rules.unshift(ValidationPatterns.required(resolvedLabel));
  }

  return (
    <BilingualFormInput
      label={resolvedLabel}
      value={value}
      onChangeText={onChangeText}
      rules={rules}
      placeholder={t("forms.placeholders.name")}
      autoCapitalize="words"
    />
  );
}

export function PhoneInput({
  value,
  onChangeText,
  label,
  required = false,
}: {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  required?: boolean;
}) {
  const { t } = useTranslation();
  const resolvedLabel = label || t("forms.labels.phoneNumber");
  const rules = [ValidationPatterns.phone()];
  if (required) {
    rules.unshift(ValidationPatterns.required(resolvedLabel));
  }

  return (
    <BilingualFormInput
      label={resolvedLabel}
      value={value}
      onChangeText={onChangeText}
      rules={rules}
      placeholder={t("forms.placeholders.phoneNumber")}
      keyboardType="phone-pad"
    />
  );
}

export function PincodeInput({
  value,
  onChangeText,
  label,
  required = false,
}: {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  required?: boolean;
}) {
  const { t } = useTranslation();
  const resolvedLabel = label || t("forms.labels.pincode");
  const rules = [ValidationPatterns.pincode()];
  if (required) {
    rules.unshift(ValidationPatterns.required(resolvedLabel));
  }

  return (
    <BilingualFormInput
      label={resolvedLabel}
      value={value}
      onChangeText={onChangeText}
      rules={rules}
      placeholder={t("forms.placeholders.pincode")}
      keyboardType="numeric"
    />
  );
}

export function NumericInput({
  value,
  onChangeText,
  label,
  required = false,
  min,
  max,
}: {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  const { t } = useTranslation();
  const resolvedLabel = label || t("forms.labels.number");
  const rules: ValidationRule[] = [ValidationPatterns.numeric()];
  if (required) {
    rules.unshift(ValidationPatterns.required(resolvedLabel));
  }
  if (min !== undefined) {
    rules.push({
      validate: (v) => !v || parseFloat(v) >= min,
      messageKey: "validation.minValue",
      messageParams: { min },
    });
  }
  if (max !== undefined) {
    rules.push({
      validate: (v) => !v || parseFloat(v) <= max,
      messageKey: "validation.maxValue",
      messageParams: { max },
    });
  }

  return (
    <BilingualFormInput
      label={resolvedLabel}
      value={value}
      onChangeText={onChangeText}
      rules={rules}
      placeholder={t("forms.placeholders.number")}
      keyboardType="decimal-pad"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  labelHi: {
    fontSize: 13,
    color: theme.text.muted,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.subtle,
    borderRadius: 12,
    backgroundColor: theme.background.input,
  },
  inputContainerFocused: {
    borderColor: theme.primary.green,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: errorColor,
  },
  inputContainerValid: {
    borderColor: successColor,
  },
  inputContainerDisabled: {
    backgroundColor: theme.background.neutralSubtle,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text.primary,
  },
  inputMultiline: {
    paddingTop: 12,
  },
  iconContainer: {
    paddingRight: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  errorText: {
    color: errorColor,
    fontSize: 12,
    flex: 1,
  },
});