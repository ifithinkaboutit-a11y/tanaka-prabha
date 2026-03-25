// src/components/molecules/Banner.tsx
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Linking,
  Pressable,
  View,
} from "react-native";
import AppText from "../atoms/AppText";
import AnimatedPressable from "../atoms/AnimatedPressable";
import { cdn } from "@/utils/cloudinaryUtils";

type Banner = {
  title: string;
  subtitle: string;
  imageUrl?: string;
  url?: string;
};

type BannerSlideshowProps = {
  banners: Banner[];
  /** Auto-slide interval in ms. Default 5000 */
  autoSlideInterval?: number;
};

export default function BannerSlideshow({
  banners,
  autoSlideInterval = 5000,
}: BannerSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dot pill widths
  const animatedWidths = useRef(
    banners.map(() => new Animated.Value(8))
  ).current;

  // Cross-fade opacity for the incoming slide
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Auto-slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      goToIndex((prev) => (prev + 1) % banners.length);
    }, autoSlideInterval);
    return () => clearInterval(interval);
  }, [banners.length, autoSlideInterval]);

  const goToIndex = (updater: (prev: number) => number) => {
    setCurrentIndex((prev) => {
      const next = updater(prev);
      // Cross-fade: fade out then back in
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      return next;
    });
  };

  // Animate dot pills — width is a layout prop, must use useNativeDriver: false
  useEffect(() => {
    animatedWidths.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === currentIndex ? 28 : 10,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    });
  }, [currentIndex, animatedWidths]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const handleBannerPress = () => {
    if (currentBanner?.url) Linking.openURL(currentBanner.url);
  };

  return (
    <View>
      <AnimatedPressable onPress={handleBannerPress} scaleOnPress={0.97}>
        <View className="h-[200px] rounded-[20px] overflow-hidden bg-[#386641]">
          {/* Animated content layer — fades in on each slide change */}
          <Animated.View
            className="absolute inset-0"
            style={{ opacity: fadeAnim }}
          >
            {currentBanner?.imageUrl && (
              <Image
                source={{ uri: cdn(currentBanner.imageUrl) }}
                className="absolute inset-0 w-full h-full"
                resizeMode="cover"
              />
            )}

            {/* Dark overlay for text legibility */}
            <View
              className="absolute bottom-0 left-0 right-0"
              style={{ height: "65%", backgroundColor: "rgba(0,0,0,0.38)" }}
            />

            {/* Text content */}
            <View className="absolute bottom-5 left-5 right-5">
              <AppText
                variant="h2"
                style={{
                  color: "#FFFFFF",
                  fontSize: 22,
                  fontWeight: "800",
                  marginBottom: 4,
                  letterSpacing: -0.3,
                  textShadowColor: "rgba(0,0,0,0.4)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                }}
              >
                {currentBanner?.title}
              </AppText>
              <AppText
                variant="bodySm"
                style={{
                  color: "rgba(255,255,255,0.92)",
                  fontSize: 13,
                  fontWeight: "500",
                  lineHeight: 18,
                }}
              >
                {currentBanner?.subtitle}
              </AppText>
            </View>
          </Animated.View>
        </View>
      </AnimatedPressable>

      {/* Dot indicators */}
      {banners.length > 1 && (
        <View className="flex-row justify-center items-center mt-[14px] gap-2">
          {banners.map((_, index) => (
            <AnimatedPressable
              key={index}
              onPress={() => goToIndex(() => index)}
              scaleOnPress={0.85}
            >
              <Animated.View
                style={{
                  width: animatedWidths[index],
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === currentIndex ? "#386641" : "#D1D5DB",
                }}
              />
            </AnimatedPressable>
          ))}
        </View>
      )}
    </View>
  );
}
