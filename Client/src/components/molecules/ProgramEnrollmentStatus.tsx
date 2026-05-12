// src/components/molecules/ProgramEnrollmentStatus.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '@/stores/languageStore';
import { theme } from '@/styles/colors';

type EnrollmentStatus = 'not_enrolled' | 'enrolled' | 'completed' | 'cancelled';

interface ProgramEnrollmentStatusProps {
  status: EnrollmentStatus;
  enrolledAt?: string | Date;
  completionDate?: string | Date;
  onEnroll?: () => void;
  onCancel?: () => void;
  showDetails?: boolean;
}

// Local color definitions
const successColor = theme.primary.green;
const errorColor = theme.semantic.error;

const STATUS_CONFIG: Record<EnrollmentStatus, {
  bg: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  labelHiKey: string;
  actionLabelKey?: string;
  actionLabelHiKey?: string;
}> = {
  not_enrolled: {
    bg: theme.background.screen,
    color: successColor,
    icon: 'add-circle-outline',
    labelKey: 'enroll_now',
    labelHiKey: 'अभी नामांकित करें',
    actionLabelKey: 'enroll',
    actionLabelHiKey: 'नामांकित करें',
  },
  enrolled: {
    bg: theme.background.successSubtle,
    color: successColor,
    icon: 'checkmark-circle',
    labelKey: 'enrolled',
    labelHiKey: 'नामांकित',
    actionLabelKey: 'cancel',
    actionLabelHiKey: 'रद्द करें',
  },
  completed: {
    bg: theme.background.successSubtle,
    color: successColor,
    icon: 'trophy',
    labelKey: 'completed',
    labelHiKey: 'पूर्ण',
  },
  cancelled: {
    bg: theme.background.errorSubtle,
    color: errorColor,
    icon: 'close-circle',
    labelKey: 'cancelled',
    labelHiKey: 'रद्द',
    actionLabelKey: 're_enroll',
    actionLabelHiKey: 'फिर से नामांकित करें',
  },
};

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelativeTime(date: string | Date, lang: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (days > 30) {
    return formatDate(d);
  } else if (days > 0) {
    return lang === 'hi' ? `${days} दिन पहले` : `${days} days ago`;
  } else if (hours > 0) {
    return lang === 'hi' ? `${hours} घंटे पहले` : `${hours} hours ago`;
  } else {
    return lang === 'hi' ? 'अभी' : 'Just now';
  }
}

export function ProgramEnrollmentStatus({
  status,
  enrolledAt,
  completionDate,
  onEnroll,
  onCancel,
  showDetails = false,
}: ProgramEnrollmentStatusProps) {
  const { currentLanguage } = useLanguageStore();
  const isHindi = currentLanguage === 'hi';
  const config = STATUS_CONFIG[status];

  const handleAction = () => {
    if (status === 'not_enrolled' && onEnroll) {
      onEnroll();
    } else if (status === 'enrolled' && onCancel) {
      onCancel();
    } else if (status === 'cancelled' && onEnroll) {
      onEnroll();
    }
  };

  const showAction = status === 'not_enrolled' || status === 'enrolled' || status === 'cancelled';

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon} size={18} color={config.color} />
      <View style={styles.textContainer}>
        <Text style={[styles.statusText, { color: config.color }]}>
          {isHindi ? config.labelHiKey : config.labelKey}
        </Text>
        {showDetails && enrolledAt && status === 'enrolled' && (
          <Text style={styles.subText}>
            {formatRelativeTime(enrolledAt, currentLanguage)}
          </Text>
        )}
        {showDetails && completionDate && status === 'completed' && (
          <Text style={styles.subText}>
            {isHindi ? 'पूर्ण' : 'Completed'} {formatDate(completionDate)}
          </Text>
        )}
      </View>

      {showAction && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: status === 'enrolled'
                ? theme.background.errorSubtle
                : successColor,
            },
          ]}
          onPress={handleAction}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.actionText,
              {
                color: status === 'enrolled'
                  ? errorColor
                  : '#FFFFFF',
              },
            ]}
          >
            {isHindi ? (config.actionLabelHiKey || config.labelHiKey) : (config.actionLabelKey || config.labelKey)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 10,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  subText: {
    fontSize: 11,
    color: theme.text.muted,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});