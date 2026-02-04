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

  return (
    <View>
      <Pressable onPress={handleBannerPress}>
        <View
          style={{
            height: 180,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "#E5E7EB",
            position: "relative",
          }}
        >
          {/* Background Image */}
          {currentBanner.imageUrl && (
            <Image
              source={{ uri: currentBanner.imageUrl }}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
              }}
              resizeMode="cover"
            />
          )}

          <View
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              right: 16,
            }}
          >
            <AppText
              variant="h2"
              style={{
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              {currentBanner.title}
            </AppText>
            <AppText
              variant="bodySm"
              style={{
                color: "#FFFFFF",
                fontSize: 12,
                opacity: 0.9,
              }}
            >
              {currentBanner.subtitle}
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
          marginTop: 12,
          gap: 8,
        }}
      >
        {banners.map((_, index) => (
          <Pressable key={index} onPress={() => handleDotPress(index)}>
            <Animated.View
              style={{
                width: animatedWidths[index],
                height: 8,
                backgroundColor: index === currentIndex ? "#386641" : "#D1D5DB",
                borderRadius: 4,
              }}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
