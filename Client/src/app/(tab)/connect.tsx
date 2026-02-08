// src/app/(tab)/connect.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
    Image,
    Linking,
    ScrollView,
    Pressable,
    View,
    RefreshControl,
} from "react-native";
import AppText from "../../components/atoms/AppText";
import { connectServices } from "../../data/content/connectServices";
import { professionalsApi, Professional } from "@/services/apiService";
import { useTranslation } from "../../i18n";

const SERVICE_COLORS: Record<string, string> = {
  "crop": "#DCFCE7",
  "livestock": "#FEF3C7",
  "soil": "#DBEAFE",
  "market": "#FCE7F3",
};

const SERVICE_ICON_COLORS: Record<string, string> = {
  "crop": "#16A34A",
  "livestock": "#D97706",
  "soil": "#2563EB",
  "market": "#DB2777",
};

export default function Connect() {
  const router = useRouter();
  const { t } = useTranslation();
  const [recentProfessionals, setRecentProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Get a few professionals to show as recent connections
      const professionals = await professionalsApi.getAll({ limit: 3, available_only: true });
      setRecentProfessionals(professionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

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

  const handleViewAllConnections = () => {
    router.push({
      pathname: "/connect-listing",
      params: { category: "all" },
    } as any);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#386641"]}
          tintColor="#386641"
        />
      }
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
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {connectServices.map((service) => (
            <Pressable
              key={service.id}
              onPress={() => handleServicePress(service.id)}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: "45%",
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
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                    backgroundColor: SERVICE_COLORS[service.id] || service.iconBgColor,
                  }}
                >
                  <Ionicons
                    name={service.icon}
                    size={36}
                    color={SERVICE_ICON_COLORS[service.id] || "#386641"}
                  />
                </View>
                <AppText
                  variant="bodySm"
                  style={{
                    textAlign: "center",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: 14,
                  }}
                >
                  {t(service.titleKey)}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Recent Connections */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 24,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={20} color="#386641" />
            <AppText
              variant="h3"
              style={{ fontWeight: "700", color: "#1F2937", marginLeft: 8, fontSize: 16 }}
            >
              {t("connect.recentConnections")}
            </AppText>
          </View>
          <Pressable
            onPress={handleViewAllConnections}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              flexDirection: "row",
              alignItems: "center",
            })}
          >
            <AppText
              variant="bodySm"
              style={{ color: "#386641", fontWeight: "600" }}
            >
              {t("connect.viewAll")}
            </AppText>
            <Ionicons name="chevron-forward" size={16} color="#386641" />
          </Pressable>
        </View>

        {recentProfessionals.map((professional, index) => (
          <Pressable
            key={professional.id}
            onPress={() =>
              router.push({
                pathname: "/connect-detail",
                params: { professionalId: professional.id },
              } as any)
            }
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#F8FAFC" : "#F3F4F6",
              borderRadius: 16,
              padding: 16,
              marginBottom: index < recentProfessionals.length - 1 ? 12 : 0,
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: professional.imageUrl || 'https://via.placeholder.com/64' }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  marginRight: 14,
                  borderWidth: 2,
                  borderColor: professional.isAvailable ? "#16A34A" : "#D1D5DB",
                }}
              />
              <View style={{ flex: 1 }}>
                <AppText
                  variant="bodyMd"
                  style={{ fontWeight: "700", color: "#1F2937", fontSize: 15, marginBottom: 2 }}
                >
                  {professional.name}
                </AppText>
                <AppText
                  variant="bodySm"
                  style={{ color: "#6B7280", fontSize: 13 }}
                >
                  {professional.role}
                </AppText>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                  <AppText
                    variant="bodySm"
                    style={{ color: "#9CA3AF", fontSize: 12, marginLeft: 4 }}
                  >
                    {professional.district}
                  </AppText>
                </View>
              </View>
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: professional.isAvailable ? "#16A34A" : "#D1D5DB",
                    marginBottom: 4,
                  }}
                />
                <AppText
                  variant="bodySm"
                  style={{
                    color: professional.isAvailable ? "#16A34A" : "#9CA3AF",
                    fontSize: 10,
                    fontWeight: "600",
                  }}
                >
                  {professional.isAvailable ? t("connect.available") : t("connect.busy")}
                </AppText>
              </View>
            </View>
          </Pressable>
        ))}

        {recentProfessionals.length === 0 && !loading && (
          <View style={{ alignItems: "center", paddingVertical: 24 }}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <AppText
              variant="bodySm"
              style={{ color: "#9CA3AF", textAlign: "center", marginTop: 12 }}
            >
              {t("connect.noRecentConnections")}
            </AppText>
          </View>
        )}
      </View>

      {/* Emergency Help */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 24,
          backgroundColor: "#FEF2F2",
          borderRadius: 20,
          padding: 24,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#FECACA",
        }}
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
          })}
        >
          {/* Outer Ring */}
          <View
            style={{
              position: "absolute",
              width: 144,
              height: 144,
              borderRadius: 72,
              backgroundColor: "rgba(220, 38, 38, 0.15)",
            }}
          />
          {/* Inner Ring */}
          <View
            style={{
              position: "absolute",
              width: 128,
              height: 128,
              borderRadius: 64,
              backgroundColor: "rgba(220, 38, 38, 0.25)",
            }}
          />
          {/* Main Button */}
          <View
            style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              backgroundColor: "#DC2626",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#DC2626",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Ionicons name="call" size={48} color="white" />
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