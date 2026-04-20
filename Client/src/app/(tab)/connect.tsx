import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import AppText from "../../components/atoms/AppText";
import QuickActionGrid from "../../components/molecules/QuickActionGrid";
import { useTranslation } from "../../i18n";
import { theme } from "@/styles/colors";

export default function Connect() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleEmergencyPress = () => {
    // Mock backend tracking for SOS button hits
    console.log("[TRACKING]: SOS/Emergency button clicked by user at", new Date().toISOString());

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
      style={{ flex: 1, backgroundColor: theme.background.screen }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: 48,
          paddingBottom: 24,
          paddingHorizontal: 20,
          backgroundColor: theme.primary.green,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <AppText
              variant="h2"
              style={{ fontWeight: "800", color: theme.text.onPrimary, fontSize: 28 }}
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
          <Pressable
            onPress={() => router.push("/my-schedule" as any)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
              marginTop: 4,
            }}
          >
            <Ionicons name="calendar-outline" size={16} color={theme.text.onPrimary} />
            <AppText
              variant="bodySm"
              style={{ color: theme.text.onPrimary, fontWeight: "600", fontSize: 12, marginLeft: 6 }}
            >
              {t("connect.mySchedule")}
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* What do you need help with? */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <AppText
          variant="h3"
          style={{
            fontWeight: "700",
            color: theme.text.secondary,
            marginBottom: 16,
            fontSize: 18,
          }}
        >
          {t("connect.whatHelpWith")}
        </AppText>

        {/* Services 2×2 Grid — same QuickActionGrid used on the home screen */}
        <QuickActionGrid actions={serviceActions} />
      </View>      {/* Emergency Help */}
      <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
        <AppText
          variant="h3"
          style={{
            fontWeight: "700",
            color: theme.text.secondary,
            marginBottom: 6,
            fontSize: 18,
          }}
        >
          {t("connect.emergencyTitle")}
        </AppText>
        <AppText
          variant="bodySm"
          style={{
            color: theme.text.muted,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {t("connect.emergencySubtitle")}
        </AppText>

        {/* Emergency Button */}
        {/* <Pressable
          onPress={handleEmergencyPress}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: pressed ? theme.background.neutralSubtle : "#FFFFFF",
            borderWidth: 1.5,
            borderColor: "#FEE2E2",
          })}
        >
          <View
            style={{
              backgroundColor: "#FEF2F2",
              padding: 10,
              borderRadius: 12,
              marginRight: 16,
            }}
          >
            <Ionicons name="call" size={20} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <AppText
              style={{
                color: "#111827",
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              24/7 Helpline
            </AppText>
            <AppText
              style={{
                color: theme.text.muted,
                fontWeight: "500",
                fontSize: 12,
                marginTop: 1,
              }}
            >
              {t("connect.tapToCall")}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
        </Pressable> */}
        <Pressable
          onPress={handleEmergencyPress}
          className="flex-row items-center py-3.5 px-4 rounded-2xl border-[1.5px] border-red-100 bg-white active:bg-neutral-100"
        >
          <View className="bg-red-50 p-2.5 rounded-xl mr-4">
            <Ionicons name="call" size={20} color="#DC2626" />
          </View>

          <View className="flex-1">
            {/* <AppText className="text-gray-900 font-bold text-base">
              Helpline
            </AppText> */}

            <AppText className="text-xs font-medium mt-0.5 text-muted">
              {t("connect.tapToCall")}
            </AppText>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
        </Pressable>
      </View>

      {/* Bottom padding for tab bar */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
