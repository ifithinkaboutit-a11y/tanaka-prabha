// src/components/molecules/PhotoUploadProgress.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLanguageStore } from '@/stores/languageStore';
import { theme } from '@/styles/colors';

interface PhotoUploadProgressProps {
  currentPhotoUrl?: string;
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  onSelectImage?: (uri: string) => void;
  size?: number;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function PhotoUploadProgress({
  currentPhotoUrl,
  onUploadComplete,
  onUploadError,
  onSelectImage,
  size = 120,
}: PhotoUploadProgressProps) {
  const { currentLanguage } = useLanguageStore();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const startProgressAnimation = () => {
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  };

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
    return interval;
  };

  const resetState = () => {
    setUploadState('idle');
    setProgress(0);
    setErrorMessage(null);
    progressAnim.setValue(0);
  };

  const handleUploadSuccess = (url: string) => {
    setUploadState('success');
    setProgress(100);
    setUploadedUrl(url);
    onUploadComplete(url);

    setTimeout(() => {
      setUploadState('idle');
      progressAnim.setValue(0);
    }, 2000);
  };

  const handleUploadError = (error: string) => {
    setUploadState('error');
    setErrorMessage(error);
    onUploadError?.(error);
    progressAnim.setValue(0);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      handleUploadError('Failed to select image');
    }
  };

  const uploadImage = async (uri: string) => {
    setUploadState('uploading');
    setProgress(0);
    setErrorMessage(null);

    startProgressAnimation();
    const progressInterval = simulateProgress();

    try {
      onSelectImage?.(uri);

      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      handleUploadSuccess(uri);

    } catch (error: unknown) {
      clearInterval(progressInterval);
      const message = error instanceof Error ? error.message : 'Upload failed';
      handleUploadError(message);
    }
  };

  const displayUrl = uploadedUrl || currentPhotoUrl;
  const isHindi = currentLanguage === 'hi';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <TouchableOpacity
        style={[
          styles.photoButton,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        onPress={pickImage}
        disabled={uploadState === 'uploading'}
        activeOpacity={0.8}
      >
        {displayUrl ? (
          <Image
            source={{ uri: displayUrl }}
            style={[styles.photo, { width: size, height: size, borderRadius: size / 2 }]}
          />
        ) : (
          <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <Ionicons name="camera" size={size * 0.3} color={theme.text.muted} />
            <Text style={styles.placeholderText}>
              {isHindi ? 'फोटो जोड़ें' : 'Add Photo'}
            </Text>
          </View>
        )}

        {uploadState === 'uploading' && (
          <View style={[styles.uploadOverlay, { width: size, height: size, borderRadius: size / 2 }]}>
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <View style={styles.progressInfo}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          </View>
        )}

        {uploadState === 'success' && (
          <View style={[styles.successOverlay, { width: size, height: size, borderRadius: size / 2 }]}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {uploadState === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={resetState}>
            <Text style={styles.retryText}>{isHindi ? 'पुनः प्रयास' : 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {uploadState === 'success' && (
        <View style={styles.successBadgeContainer}>
          <View style={styles.successMessage}>
            <Ionicons name="checkmark-circle" size={14} color={theme.primary.green} />
            <Text style={styles.successMessageText}>
              {isHindi ? 'अपलोड हो गया' : 'Uploaded'}
            </Text>
          </View>
        </View>
      )}

      {uploadState === 'idle' && !displayUrl && (
        <Text style={styles.hintText}>
          {isHindi ? 'टैप करके फोटो चुनें' : 'Tap to select photo'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  photoButton: {
    overflow: 'hidden',
    backgroundColor: theme.background.neutralSubtle,
  },
  photo: {
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.border.subtle,
    borderStyle: 'dashed',
    backgroundColor: theme.background.screen,
  },
  placeholderText: {
    color: theme.text.muted,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  uploadOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.primary.green,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: theme.semantic.error,
    fontSize: 12,
  },
  retryText: {
    color: theme.semantic.error,
    fontSize: 12,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  successBadgeContainer: {
    marginTop: 4,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  successMessageText: {
    color: theme.primary.green,
    fontSize: 12,
    fontWeight: '600',
  },
  hintText: {
    color: theme.text.muted,
    fontSize: 11,
    textAlign: 'center',
  },
});