import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  Linking,
  ScrollView,
  Pressable,
  View,
  RefreshControl,
} from "react-native";
import AppText from "../../components/atoms/AppText";
import { connectServices } from "../../data/content/connectServices";
import { useTranslation } from "../../i18n";

const SERVICE_COLORS: Record<string, string> = {
  "agricultural": "#DCFCE7",
  "veterinary": "#FEF3C7",
  "financial": "#FCE7F3",
  "doctor": "#DBEAFE",
};

const SERVICE_ICON_COLORS: Record<string, string> = {
  "agricultural": "#16A34A",
  "veterinary": "#D97706",
  "financial": "#DB2777",
  "doctor": "#2563EB",
};

export default function Connect() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleServicePress = (serviceId: string) => {
    router.push({
      pathname: "/connect-listing",
      params: { category: serviceId },
    } as any);
  };

  const handleEmergencyPress = () => {
    const emergencyNumber = "tel:1800180111";
    Linking.openURL(emergencyNumber);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Gradient */}
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
          style={{ fontWeight: "700", color: "#1F2937", marginBottom: 16, fontSize: 18 }}
        >
          {t("connect.whatHelpWith")}
        </AppText>

        {/* Services Grid - 2x2 */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          {connectServices.map((service) => (
            <Pressable
              key={service.id}
              onPress={() => handleServicePress(service.id)}
              style={({ pressed }) => ({
                width: "47%",
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 24,
                  paddingHorizontal: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                    backgroundColor: SERVICE_COLORS[service.id] || service.iconBgColor,
                  }}
                >
                  <Ionicons
                    name={service.icon}
                    size={34}
                    color={SERVICE_ICON_COLORS[service.id] || "#386641"}
                  />
                </View>
                <AppText
                  variant="bodySm"
                  style={{
                    textAlign: "center",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: 13,
                  }}
                >
                  {t(service.titleKey)}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>
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
        {/* Emergency Button - Animated Pulse Effect */}
        <Pressable
          onPress={handleEmergencyPress}
          style={({ pressed }) => ({
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
            marginTop: 16,
            marginBottom: 8,
          })}
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
        </Pressable>
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
