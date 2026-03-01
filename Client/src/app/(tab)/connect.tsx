import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  ScrollView,
  View,
} from "react-native";
import AppText from "../../components/atoms/AppText";
import QuickActionGrid from "../../components/molecules/QuickActionGrid";
import { useTranslation } from "../../i18n";

export default function Connect() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleEmergencyPress = () => {
    const emergencyNumber = "tel:1800180111";
    Linking.openURL(emergencyNumber);
  };

  // Mirror the QuickActionGrid item shape exactly as the home page does
  const serviceActions = [
    {
      title: t("connect.services.trainingGuidance"),
      icon: "leaf-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#16A34A",
      bgColor: "#DCFCE7",
      onPress: () =>
        router.push({
          pathname: "/connect-listing",
          params: { category: "agricultural" },
        } as any),
    },
    {
      title: t("connect.services.livestockVeterinary"),
      icon: "paw-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#D97706",
      bgColor: "#FEF3C7",
      onPress: () =>
        router.push({
          pathname: "/connect-listing",
          params: { category: "veterinary" },
        } as any),
    },
    {
      title: t("connect.services.marketBuyers"),
      icon: "storefront-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#DB2777",
      bgColor: "#FCE7F3",
      onPress: () =>
        router.push({
          pathname: "/connect-listing",
          params: { category: "financial" },
        } as any),
    },
    {
      title: t("connect.services.governmentSchemes"),
      icon: "business-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#2563EB",
      bgColor: "#DBEAFE",
      onPress: () =>
        router.push({
          pathname: "/connect-listing",
          params: { category: "doctor" },
        } as any),
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: 48,
          paddingBottom: 24,
          paddingHorizontal: 20,
          backgroundColor: "#386641",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <AppText
          variant="h2"
          style={{ fontWeight: "800", color: "#FFFFFF", fontSize: 28 }}
        >
          {t("connect.title")}
        </AppText>
        <AppText
          variant="bodySm"
          style={{ color: "rgba(255,255,255,0.85)", marginTop: 4, fontSize: 14 }}
        >
          {t("connect.subtitle")}
        </AppText>
      </View>

      {/* What do you need help with? */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <AppText
          variant="h3"
          style={{
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: 16,
            fontSize: 18,
          }}
        >
          {t("connect.whatHelpWith")}
        </AppText>

        {/* Services 2×2 Grid — same QuickActionGrid used on the home screen */}
        <QuickActionGrid actions={serviceActions} />
      </View>

      {/* Emergency Help */}
      <View
        style={{
          marginHorizontal: 10,
          marginTop: 34,
          backgroundColor: "#FEF2F2",
          borderRadius: 20,
          padding: 20,
          minHeight: 340,
          borderWidth: 1,
          borderColor: "#FECACA",
        }}
        className="flex items-center"
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Ionicons name="alert-circle" size={24} color="#DC2626" />
          <AppText
            variant="h3"
            style={{ fontWeight: "700", color: "#DC2626", marginLeft: 8, fontSize: 18 }}
          >
            {t("connect.emergencyTitle")}
          </AppText>
        </View>
        <AppText
          variant="bodySm"
          style={{
            color: "#7F1D1D",
            marginBottom: 20,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          {t("connect.emergencySubtitle")}
        </AppText>

        {/* Emergency Button */}
        <View
          style={{ alignItems: "center", justifyContent: "center", marginTop: 16, marginBottom: 8 }}
          className="flex items-center justify-center py-10"
        >
          {/* Outer Ring */}
          <View
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: "rgba(220, 38, 38, 0.15)",
              alignSelf: "center",
            }}
          />
          {/* Inner Ring */}
          <View
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: "rgba(220, 38, 38, 0.25)",
              alignSelf: "center",
            }}
          />
          {/* Main Button */}
          <View
            onTouchEnd={handleEmergencyPress}
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: "#DC2626",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#DC2626",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 8,
              alignSelf: "center",
            }}
          >
            <Ionicons name="call" size={56} color="white" />
          </View>
        </View>

        <AppText
          variant="bodySm"
          style={{
            color: "#991B1B",
            marginTop: 16,
            fontWeight: "600",
            fontSize: 13,
          }}
        >
          {t("connect.tapToCall")}
        </AppText>
      </View>

      {/* Bottom padding for tab bar */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
