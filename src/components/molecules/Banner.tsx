// src/components/molecules/BannerSlideshow.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Linking,
  Pressable,
  View,
} from "react-native";
import { colors } from "../../styles/colors";
import AppText from "../atoms/AppText";
import Card from "../atoms/Card";

type Banner = {
  title: string;
  subtitle: string;
  imageUrl?: string;
  url?: string;
};

type BannerSlideshowProps = {
  banners: Banner[];
  autoSlideInterval?: number; // in ms, default 5000
};

export default function BannerSlideshow({
  banners,
  autoSlideInterval = 5000,
}: BannerSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedWidths = useRef(
    banners.map(() => new Animated.Value(8)),
  ).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [banners.length, autoSlideInterval]);

  useEffect(() => {
    // Animate dots
    animatedWidths.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === currentIndex ? 24 : 8,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    });
  }, [currentIndex, animatedWidths]);

  const currentBanner = banners[currentIndex];

  const handleBannerPress = () => {
    if (currentBanner.url) {
      Linking.openURL(currentBanner.url);
    }
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <View className="p-4">
      <Pressable onPress={handleBannerPress}>
        <Card className="p-0 overflow-hidden">
          <View className="h-36 bg-neutral-border relative">
            {currentBanner.imageUrl && (
              <Image
                source={{ uri: currentBanner.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
            {/* Overlay for text if needed, but since text is below, maybe not */}
          </View>

          <View className="p-4">
            <AppText variant="bodyLg">{currentBanner.title}</AppText>
            <AppText variant="caption" className="mt-1">
              {currentBanner.subtitle}
            </AppText>
          </View>
        </Card>
      </Pressable>

      {/* Navigation Section */}
      <View className="flex-row justify-center items-center mt-4 gap-4">
        <Pressable onPress={handlePrevious} className="p-2">
          <Ionicons
            name="chevron-back"
            size={24}
            color={colors.primary.green}
          />
        </Pressable>

        <View className="flex-row gap-2">
          {banners.map((_, index) => (
            <Pressable key={index} onPress={() => handleDotPress(index)}>
              <Animated.View
                style={{
                  width: animatedWidths[index],
                  height: 8,
                  backgroundColor:
                    index === currentIndex
                      ? colors.primary.green
                      : colors.primary.greenLight,
                  borderRadius: 4,
                }}
              />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={handleNext} className="p-2">
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.primary.green}
          />
        </Pressable>
      </View>
    </View>
  );
}
