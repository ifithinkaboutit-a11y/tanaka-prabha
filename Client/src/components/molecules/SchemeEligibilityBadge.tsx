// src/components/molecules/SchemeEligibilityBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '@/stores/languageStore';
import { theme } from '@/styles/colors';

// Local color definitions to avoid circular import issues
const successColor = '#22c55e';
const errorColor = '#ef4444';

interface SchemeMatchDetails {
  hasLand?: boolean;
  hasLivestock?: boolean;
  districtMatch?: boolean;
  landAreaMatch?: boolean;
  categoryMatch?: boolean;
}

interface SchemeEligibilityBadgeProps {
  isEligible: boolean;
  matchDetails?: SchemeMatchDetails;
}

export function SchemeEligibilityBadge({ isEligible, matchDetails }: SchemeEligibilityBadgeProps) {
  const { currentLanguage } = useLanguageStore();

  if (!isEligible) {
    return (
      <View style={styles.notEligibleBadge}>
        <Ionicons name="close-circle" size={14} color={errorColor} />
        <Text style={styles.notEligibleText}>
          {currentLanguage === 'hi' ? 'पात्र नहीं' : 'Not Eligible'}
        </Text>
      </View>
    );
  }

  const matchCount = [
    matchDetails?.hasLand,
    matchDetails?.hasLivestock,
    matchDetails?.districtMatch,
    matchDetails?.landAreaMatch,
    matchDetails?.categoryMatch,
  ].filter(Boolean).length;

  return (
    <View style={styles.eligibleContainer}>
      <View style={styles.eligibleBadge}>
        <Ionicons name="checkmark-circle" size={16} color={successColor} />
        <Text style={styles.eligibleText}>
          {currentLanguage === 'hi' ? 'पात्र' : 'Eligible'}
        </Text>
      </View>

      {matchDetails && matchCount > 0 && (
        <View style={styles.matchIndicators}>
          {matchDetails.hasLand && (
            <View style={styles.matchChip}>
              <Text style={styles.matchChipEmoji}>🌾</Text>
              <Text style={styles.matchChipText}>
                {currentLanguage === 'hi' ? 'जमीन' : 'Land'}
              </Text>
            </View>
          )}
          {matchDetails.hasLivestock && (
            <View style={styles.matchChip}>
              <Text style={styles.matchChipEmoji}>🐄</Text>
              <Text style={styles.matchChipText}>
                {currentLanguage === 'hi' ? 'पशु' : 'Livestock'}
              </Text>
            </View>
          )}
          {matchDetails.districtMatch && (
            <View style={styles.matchChip}>
              <Text style={styles.matchChipEmoji}>📍</Text>
              <Text style={styles.matchChipText}>
                {currentLanguage === 'hi' ? 'जिला' : 'District'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// Helper function to check eligibility based on user profile
export function checkSchemeEligibility(
  scheme: {
    minLandArea?: number;
    maxLandArea?: number;
    requiredCategories?: string[];
    districts?: string[];
  },
  userProfile: {
    landDetails?: { totalLandArea?: number };
    livestockDetails?: Record<string, number>;
    district?: string;
    interests?: string[];
  }
): { isEligible: boolean; matchDetails: SchemeMatchDetails } {
  const matchDetails: SchemeMatchDetails = {
    hasLand: false,
    hasLivestock: false,
    districtMatch: false,
    landAreaMatch: false,
    categoryMatch: false,
  };

  // Check land
  if (userProfile.landDetails?.totalLandArea && userProfile.landDetails.totalLandArea > 0) {
    matchDetails.hasLand = true;

    // Check land area criteria
    if (scheme.minLandArea && userProfile.landDetails.totalLandArea >= scheme.minLandArea) {
      matchDetails.landAreaMatch = true;
    }
    if (scheme.maxLandArea && userProfile.landDetails.totalLandArea <= scheme.maxLandArea) {
      matchDetails.landAreaMatch = true;
    }
    if (!scheme.minLandArea && !scheme.maxLandArea) {
      matchDetails.landAreaMatch = true;
    }
  }

  // Check livestock
  const totalLivestock = Object.values(userProfile.livestockDetails || {}).reduce((a, b) => a + b, 0);
  if (totalLivestock > 0) {
    matchDetails.hasLivestock = true;
  }

  // Check district
  if (scheme.districts && userProfile.district) {
    matchDetails.districtMatch = scheme.districts.some(
      d => d.toLowerCase() === userProfile.district?.toLowerCase()
    );
  }

  // Check category/interests
  if (scheme.requiredCategories && userProfile.interests) {
    matchDetails.categoryMatch = scheme.requiredCategories.some(
      cat => userProfile.interests?.includes(cat)
    );
  }

  // Eligible if any criteria match OR no specific criteria defined
  const hasCriteria = scheme.minLandArea || scheme.maxLandArea ||
                      scheme.requiredCategories?.length || scheme.districts?.length;

  const isEligible = !hasCriteria ||
    matchDetails.hasLand === true ||
    matchDetails.hasLivestock === true ||
    matchDetails.districtMatch === true ||
    matchDetails.landAreaMatch === true ||
    matchDetails.categoryMatch === true;

  return { isEligible: Boolean(isEligible), matchDetails };
}

const styles = StyleSheet.create({
  eligibleContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  eligibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.successSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  eligibleText: {
    color: successColor,
    fontSize: 12,
    fontWeight: '600',
  },
  matchIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  matchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.successSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  matchChipEmoji: {
    fontSize: 10,
  },
  matchChipText: {
    color: successColor,
    fontSize: 10,
    fontWeight: '500',
  },
  notEligibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.errorSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  notEligibleText: {
    color: errorColor,
    fontSize: 12,
    fontWeight: '600',
  },
});
