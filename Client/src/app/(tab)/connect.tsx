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
  crop: "#DCFCE7",
  livestock: "#FEF3C7",
  soil: "#DBEAFE",
  market: "#FCE7F3",
};

const SERVICE_ICON_COLORS: Record<string, string> = {
  crop: "#16A34A",
  livestock: "#D97706",
  soil: "#2563EB",
  market: "#DB2777",
};

export default function Connect() {
  const router = useRouter();
  const { t } = useTranslation();
  const [recentProfessionals, setRecentProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
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
    router.push({ pathname: "/connect-listing", params: { category: serviceId } } as any);
  };

  const handleEmergencyPress = () => {
    Linking.openURL("tel:1800180111");
  };

  const handleViewAllConnections = () => {
    router.push({ pathname: "/connect-listing", params: { category: "all" } } as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Sticky Header */}
      <View style={{
        backgroundColor: "#FFFFFF",
        paddingBottom: 16,
        paddingTop: 52,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 4,
        zIndex: 10,
      }}>
        <AppText variant="h2" style={{ fontWeight: "800", color: "#111827", fontSize: 26, letterSpacing: -0.3 }}>
          {t("connect.title")}
        </AppText>
        <AppText variant="bodySm" style={{ color: "#6B7280", marginTop: 4, fontSize: 13, fontWeight: "500" }}>
          {t("connect.subtitle")}
        </AppText>
      </View>

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
        {/* What do you need help with? */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <AppText variant="h3" style={{ fontWeight: "700", color: "#111827", marginBottom: 16, fontSize: 18, letterSpacing: -0.2 }}>
            {t("connect.whatHelpWith")}
          </AppText>

          {/* Services Grid */}
          <View className="flex-row flex-wrap gap-3">
            {connectServices.map((service) => (
              <Pressable
                key={service.id}
                onPress={() => handleServicePress(service.id)}
                className="active:opacity-90 active:scale-[0.98]"
                style={{ flex: 1, minWidth: "45%" }}
              >
                <View className="bg-white rounded-[20px] items-center justify-center py-6 px-4 shadow-sm elevation-3">
                  <View
                    className="w-18 h-18 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: SERVICE_COLORS[service.id] || service.iconBgColor }}
                  >
                    <Ionicons
                      name={service.icon}
                      size={36}
                      color={SERVICE_ICON_COLORS[service.id] || "#386641"}
                    />
                  </View>
                  <AppText variant="bodySm" className="text-center font-semibold text-gray-700 text-sm">
                    {t(service.titleKey)}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Connections */}
        <View style={{
          marginHorizontal: 20,
          marginTop: 24,
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.03)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 12,
          elevation: 2,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time-outline" size={20} color="#16A34A" />
              <AppText variant="h3" style={{ fontWeight: "700", color: "#111827", marginLeft: 8, fontSize: 16 }}>
                {t("connect.recentConnections")}
              </AppText>
            </View>
            <Pressable
              onPress={handleViewAllConnections}
              style={({ pressed }) => ({
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 4,
                opacity: pressed ? 0.7 : 1,
              })}
              className="flex items-center justify-center flex-row"
            >
              <AppText variant="bodySm" style={{ color: "#16A34A", fontWeight: "600", fontSize: 13 }}>
                {t("connect.viewAll")}
              </AppText>
              <Ionicons name="chevron-forward" size={16} color="#16A34A" />
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
                borderRadius: 16,
                padding: 16,
                backgroundColor: pressed ? "#F8FAFC" : "#F3F4F6",
                marginBottom: index < recentProfessionals.length - 1 ? 12 : 0,
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.02)",
              })}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={{ uri: professional.imageUrl || "https://via.placeholder.com/64" }}
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
                  <AppText variant="bodyMd" style={{ fontWeight: "700", color: "#111827", fontSize: 15, marginBottom: 2 }}>
                    {professional.name}
                  </AppText>
                  <AppText variant="bodySm" style={{ color: "#6B7280", fontSize: 13 }}>
                    {professional.role}
                  </AppText>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                    <AppText variant="bodySm" style={{ color: "#9CA3AF", fontSize: 12, marginLeft: 4 }}>
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
                      marginBottom: 4,
                      backgroundColor: professional.isAvailable ? "#16A34A" : "#D1D5DB"
                    }}
                  />
                  <AppText
                    variant="bodySm"
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: professional.isAvailable ? "#16A34A" : "#9CA3AF"
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
              <AppText variant="bodySm" style={{ color: "#9CA3AF", textAlign: "center", marginTop: 12 }}>
                {t("connect.noRecentConnections")}
              </AppText>
            </View>
          )}
        </View>

        {/* Emergency Help */}
        <View style={{
          marginHorizontal: 20,
          marginTop: 24,
          backgroundColor: "#FEF2F2",
          borderRadius: 24,
          padding: 24,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#FECACA",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Ionicons name="alert-circle" size={24} color="#DC2626" />
            <AppText variant="h3" style={{ fontWeight: "800", color: "#DC2626", marginLeft: 8, fontSize: 18 }}>
              {t("connect.emergencyTitle")}
            </AppText>
          </View>
          <AppText variant="bodySm" style={{ color: "#7F1D1D", marginBottom: 20, textAlign: "center", fontSize: 13 }}>
            {t("connect.emergencySubtitle")}
          </AppText>

          {/* Emergency Button */}
          <Pressable
            onPress={handleEmergencyPress}
            style={({ pressed }) => ({
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
              height: 160,
              width: 160,
              alignSelf: "center",
            })}
          >
            <View className="flex items-center justify-center p-8">
              {/* Outermost Ring */}
              <View style={{ position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(220,38,38,0.08)", borderWidth: 1, borderColor: "rgba(220,38,38,0.12)" }} />
              {/* Outer Ring */}
              <View style={{ position: "absolute", width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(220,38,38,0.15)", borderWidth: 1, borderColor: "rgba(220,38,38,0.2)" }} />
              {/* Inner Ring */}
              <View style={{ position: "absolute", width: 120, height: 120, borderRadius: 62.5, backgroundColor: "rgba(220,38,38,0.25)" }} />
              {/* Main Button */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#DC2626",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#DC2626",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.45,
                  shadowRadius: 14,
                  elevation: 10,
                }}
              >
                <Ionicons name="call" size={46} color="white" />
              </View>
            </View>
          </Pressable>

          <AppText variant="bodySm" style={{ color: "#991B1B", marginTop: 16, fontWeight: "700", fontSize: 13 }}>
            {t("connect.tapToCall")}
          </AppText>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 96 }} />
      </ScrollView>
    </View>
  );
}