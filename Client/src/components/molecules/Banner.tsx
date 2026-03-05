// src/components/molecules/BannerSlideshow.tsx
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Linking,
  Pressable,
  View,
} from "react-native";
import AppText from "../atoms/AppText";
import { cdn } from "@/utils/cloudinaryUtils";

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

const { width } = Dimensions.get("window");

export default function BannerSlideshow({
  banners,
  autoSlideInterval = 5000,
}: BannerSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedWidths = useRef(
    banners.map(() => new Animated.Value(8)),
  ).current;

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [banners.length, autoSlideInterval]);

  useEffect(() => {
    // Animate dots
    animatedWidths.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === currentIndex ? 28 : 10,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    });
  }, [currentIndex, animatedWidths]);

  // Return null if no banners to display
  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const handleBannerPress = () => {
    if (currentBanner?.url) {
      Linking.openURL(currentBanner.url);
    }
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <View>
      <Pressable onPress={handleBannerPress}>
        <View
          style={{
            height: 200,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "#386641",
            position: "relative",
          }}
        >
          {/* Background Image */}
          {currentBanner?.imageUrl && (
            <Image
              source={{ uri: cdn(currentBanner.imageUrl) }}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
              }}
              resizeMode="cover"
            />
          )}

          {/* Dark Overlay for better text readability */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
          />

          {/* Content */}
          <View
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
            }}
          >
            <AppText
              variant="h2"
              style={{
                color: "#FFFFFF",
                fontSize: 22,
                fontWeight: "700",
                marginBottom: 6,
                textShadowColor: "rgba(0,0,0,0.3)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              {currentBanner?.title}
            </AppText>
            <AppText
              variant="bodySm"
              style={{
                color: "#FFFFFF",
                fontSize: 14,
                opacity: 0.95,
                fontWeight: "500",
              }}
            >
              {currentBanner?.subtitle}
            </AppText>
          </View>
        </View>
      </Pressable>

      {/* Dot Indicators */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 14,
          gap: 8,
        }}
      >
        {banners.map((_, index) => (
          <Pressable key={index} onPress={() => handleDotPress(index)}>
            <Animated.View
              style={{
                width: animatedWidths[index],
                height: 10,
                backgroundColor: index === currentIndex ? "#386641" : "#D1D5DB",
                borderRadius: 5,
              }}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
