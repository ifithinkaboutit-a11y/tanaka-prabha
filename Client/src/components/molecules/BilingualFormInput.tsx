// src/components/molecules/BilingualFormInput.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '@/stores/languageStore';
import { theme } from '@/styles/colors';

// Local color definitions
const successColor = '#22c55e';
const errorColor = '#ef4444';

// Validation rule interface
export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string; // Bilingual message in format: "English | Hindi"
}

// Common validation patterns
export const ValidationPatterns = {
  required: (fieldName: string): ValidationRule => ({
    validate: (v) => v.trim().length > 0,
    message: `${fieldName} is required | ${fieldName} आवश्यक है`,
  }),
  minLength: (min: number, fieldName: string): ValidationRule => ({
    validate: (v) => v.length >= min,
    message: `Minimum ${min} characters | न्यूनतम ${min} अक्षर`,
  }),
  maxLength: (max: number, fieldName: string): ValidationRule => ({
    validate: (v) => v.length <= max,
    message: `Maximum ${max} characters | अधिकतम ${max} अक्षर`,
  }),
  numeric: (): ValidationRule => ({
    validate: (v) => !v || /^\d+$/.test(v),
    message: `Please enter a valid number | कृपया एक वैध संख्या दर्ज करें`,
  }),
  phone: (): ValidationRule => ({
    validate: (v) => !v || /^[6-9]\d{9}$/.test(v),
    message: `Enter valid 10-digit number | 10 अंकों का नंबर दर्ज करें`,
  }),
  pincode: (): ValidationRule => ({
    validate: (v) => !v || /^[1-9]\d{5}$/.test(v),
    message: `Enter valid 6-digit pincode | 6 अंकों का पिनकोड दर्ज करें`,
  }),
  aadhaar: (): ValidationRule => ({
    validate: (v) => !v || /^\d{4}\s?\d{4}\s?\d{4}$/.test(v),
    message: `Enter valid 12-digit Aadhaar | 12 अंकों का आधार दर्ज करें`,
  }),
  name: (): ValidationRule => ({
    validate: (v) => !v || /^[a-zA-Zऀ-ॳ\s]+$/.test(v),
    message: `Enter valid name (letters only) | केवल अक्षर दर्ज करें`,
  }),
  email: (): ValidationRule => ({
    validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: `Enter valid email | वैध ईमेल दर्ज करें`,
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
  const { currentLanguage } = useLanguageStore();
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isHindi = currentLanguage === 'hi';

  // Parse bilingual message
  const getMessage = useCallback((message: string): string => {
    const parts = message.split('|');
    if (parts.length >= 2) {
      return isHindi ? parts[1].trim() : parts[0].trim();
    }
    return message;
  }, [isHindi]);

  // Validate on value change (only if touched)
  useEffect(() => {
    if (touched && rules.length > 0) {
      for (const rule of rules) {
        if (!rule.validate(value)) {
          setError(getMessage(rule.message));
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
          setError(getMessage(rule.message));
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
  const rules = [
    ValidationPatterns.minLength(2, label || 'Name'),
    ValidationPatterns.name(),
  ];
  if (required) {
    rules.unshift(ValidationPatterns.required(label || 'Name'));
  }

  return (
    <BilingualFormInput
      label={label || 'Name'}
      labelHi={label ? undefined : 'नाम'}
      value={value}
      onChangeText={onChangeText}
      rules={rules}
      placeholder="Enter your name"
      placeholderHi="अपना नाम दर्ज करें"
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
  const rules = [ValidationPatterns.phone()];
  if (required) {
    rules.unshift(ValidationPatterns.required(label || 'Phone'));
  }

  return (
    <BilingualFormInput
      label={label || 'Phone Number'}
      labelHi={label ? undefined : 'फोन नंबर'}
      value={value}
      onChangeText={onChangeText}
      rules={rules}
      placeholder="Enter 10-digit number"
      placeholderHi="10 अंकों का नंबर दर्ज करें"
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
  const rules = [ValidationPatterns.pincode()];
  if (required) {
    rules.unshift(ValidationPatterns.required(label || 'Pincode'));
  }

  return (
    <BilingualFormInput
      label={label || 'Pincode'}
      labelHi={label ? undefined : 'पिनकोड'}
      value={value}
      onChangeText={onChangeText}
      rules={rules}
      placeholder="Enter 6-digit pincode"
      placeholderHi="6 अंकों का पिनकोड दर्ज करें"
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
  const rules: ValidationRule[] = [ValidationPatterns.numeric()];
  if (required) {
    rules.unshift(ValidationPatterns.required(label || 'Number'));
  }
  if (min !== undefined) {
    rules.push({
      validate: (v) => !v || parseFloat(v) >= min,
      message: `Minimum value is ${min} | न्यूनतम मान ${min} है`,
    });
  }
  if (max !== undefined) {
    rules.push({
      validate: (v) => !v || parseFloat(v) <= max,
      message: `Maximum value is ${max} | अधिकतम मान ${max} है`,
    });
  }

  return (
    <BilingualFormInput
      label={label || 'Number'}
      value={value}
      onChangeText={onChangeText}
      rules={rules}
      placeholder="Enter number"
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