// src/components/molecules/EventCountdown.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { theme } from '@/styles/colors';

interface EventLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface EventCountdownProps {
  eventDate: string | Date;
  eventLocation?: EventLocation;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  total: number;
}

function calculateTimeLeft(eventDate: Date): TimeLeft | null {
  const diff = eventDate.getTime() - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, total: diff };
}

function formatNumber(n: number): string {
  return n.toString().padStart(2, '0');
}

export function EventCountdown({ eventDate, eventLocation, compact = false }: EventCountdownProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => {
    const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
    return calculateTimeLeft(date);
  });

  useEffect(() => {
    const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
    setTimeLeft(calculateTimeLeft(date));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(date));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [eventDate]);

  const openMaps = async () => {
    if (!eventLocation) return;

    const { latitude, longitude, address } = eventLocation;

    try {
      // Try Google Maps first
      const mapsUrl = address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
        : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

      const canOpen = await Linking.canOpenURL(mapsUrl);
      if (canOpen) {
        await Linking.openURL(mapsUrl);
      } else {
        // Fallback to generic geo URL
        await Linking.openURL(`geo:${latitude},${longitude}?q=${latitude},${longitude}`);
      }
    } catch (error) {
      Alert.alert(
        t('events.countdown.mapErrorTitle'),
        t('events.countdown.mapErrorMessage')
      );
    }
  };

  // Event is live/ongoing — static indicator (PRODUCT.md: no micro-animations)
  if (!timeLeft) {
    return (
      <View style={[styles.container, styles.liveContainer, compact && styles.compact]}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>
          {t('events.countdown.live')}
        </Text>
        <Text style={styles.liveSubtext}>
          {t('events.countdown.liveSubtext')}
        </Text>
      </View>
    );
  }

  // Event passed
  if (timeLeft.total < 0) {
    return (
      <View style={[styles.container, styles.passedContainer, compact && styles.compact]}>
        <Ionicons name="checkmark-circle" size={16} color={theme.text.muted} />
        <Text style={styles.passedText}>
          {t('events.countdown.ended')}
        </Text>
      </View>
    );
  }

  const { days, hours, minutes } = timeLeft;

  // Countdown container with map button
  return (
    <View style={styles.wrapper}>
      <View style={[styles.countdownContainer, compact && styles.compactCountdown]}>
        {days > 0 && (
          <>
            <View style={styles.timeBlock}>
              <Text style={styles.timeValue}>{days}</Text>
              <Text style={styles.timeLabel}>
                {t('events.countdown.days')}
              </Text>
            </View>
            <Text style={styles.separator}>:</Text>
          </>
        )}
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>{formatNumber(hours)}</Text>
          <Text style={styles.timeLabel}>
            {t('events.countdown.hoursShort')}
          </Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timeBlock}>
          <Text style={styles.timeValue}>{formatNumber(minutes)}</Text>
          <Text style={styles.timeLabel}>
            {t('events.countdown.minutesShort')}
          </Text>
        </View>
      </View>

      {eventLocation && (
        <TouchableOpacity
          style={styles.mapButton}
          onPress={openMaps}
          activeOpacity={0.7}
        >
          <Ionicons name="location" size={14} color={theme.primary.green} />
          <Text style={styles.mapText}>
            {t('events.countdown.map')}
          </Text>
          <Ionicons name="chevron-forward" size={12} color={theme.primary.green} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// Export a simpler version for EventCard to use
export function EventCountdownSimple({ eventDate, compact = true }: { eventDate: string | Date; compact?: boolean }) {
  return <EventCountdown eventDate={eventDate} compact={compact} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compact: {
    marginTop: 8,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactCountdown: {
    flex: 1,
  },
  timeBlock: {
    alignItems: 'center',
    backgroundColor: theme.primary.green,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 44,
  },
  timeValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    marginTop: 1,
  },
  separator: {
    color: theme.primary.green,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 2,
  },
  liveContainer: {
    backgroundColor: theme.background.errorSubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.semantic.error,
  },
  liveText: {
    color: theme.semantic.error,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  liveSubtext: {
    color: theme.semantic.error,
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  passedContainer: {
    backgroundColor: theme.background.neutralSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  passedText: {
    color: theme.text.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.successSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  mapText: {
    color: theme.primary.green,
    fontSize: 12,
    fontWeight: '600',
  },
});