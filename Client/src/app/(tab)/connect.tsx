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
    <ScrollView
      className="flex-1 bg-[#F8FAFC]"
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
      {/* Header */}
      <View className="pt-12 pb-6 px-5 bg-[#386641] rounded-b-[28px]">
        <AppText variant="h2" className="font-extrabold text-white text-[28px]">
          {t("connect.title")}
        </AppText>
        <AppText variant="bodySm" className="text-white/85 mt-1 text-sm">
          {t("connect.subtitle")}
        </AppText>
      </View>

      {/* What do you need help with? */}
      <View className="px-5 pt-6">
        <AppText variant="h3" className="font-bold text-gray-800 mb-4 text-lg">
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
      <View className="mx-5 mt-6 bg-white rounded-[20px] p-5 shadow-sm elevation-3">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={20} color="#386641" />
            <AppText variant="h3" className="font-bold text-gray-800 ml-2 text-base">
              {t("connect.recentConnections")}
            </AppText>
          </View>
          <Pressable
            onPress={handleViewAllConnections}
            className="flex-row items-center active:opacity-70"
          >
            <AppText variant="bodySm" className="text-[#386641] font-semibold">
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
            className="rounded-2xl p-4 active:bg-[#F8FAFC] bg-gray-100"
            style={{ marginBottom: index < recentProfessionals.length - 1 ? 12 : 0 }}
          >
            <View className="flex-row items-center">
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
              <View className="flex-1">
                <AppText variant="bodyMd" className="font-bold text-gray-800 text-[15px] mb-0.5">
                  {professional.name}
                </AppText>
                <AppText variant="bodySm" className="text-gray-500 text-[13px]">
                  {professional.role}
                </AppText>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                  <AppText variant="bodySm" className="text-gray-400 text-xs ml-1">
                    {professional.district}
                  </AppText>
                </View>
              </View>
              <View className="items-center">
                <View
                  className="w-2.5 h-2.5 rounded-full mb-1"
                  style={{ backgroundColor: professional.isAvailable ? "#16A34A" : "#D1D5DB" }}
                />
                <AppText
                  variant="bodySm"
                  className="text-[10px] font-semibold"
                  style={{ color: professional.isAvailable ? "#16A34A" : "#9CA3AF" }}
                >
                  {professional.isAvailable ? t("connect.available") : t("connect.busy")}
                </AppText>
              </View>
            </View>
          </Pressable>
        ))}

        {recentProfessionals.length === 0 && !loading && (
          <View className="items-center py-6">
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <AppText variant="bodySm" className="text-gray-400 text-center mt-3">
              {t("connect.noRecentConnections")}
            </AppText>
          </View>
        )}
      </View>

      {/* Emergency Help */}
      <View className="mx-5 mt-6 bg-red-50 rounded-[20px] p-6 items-center border border-red-200">
        <View className="flex-row items-center mb-2">
          <Ionicons name="alert-circle" size={24} color="#DC2626" />
          <AppText variant="h3" className="font-bold text-red-600 ml-2 text-lg">
            {t("connect.emergencyTitle")}
          </AppText>
        </View>
        <AppText variant="bodySm" className="text-red-900 mb-5 text-center text-[13px]">
          {t("connect.emergencySubtitle")}
        </AppText>

        {/* Emergency Button */}
        <Pressable
          onPress={handleEmergencyPress}
          className="items-center justify-center active:opacity-90 active:scale-[0.95]"
        >
          {/* Outer Ring */}
          <View className="absolute w-36 h-36 rounded-full bg-red-600/15" />
          {/* Inner Ring */}
          <View className="absolute w-32 h-32 rounded-full bg-red-600/25" />
          {/* Main Button */}
          <View
            className="w-28 h-28 rounded-full bg-red-600 items-center justify-center elevation-8"
            style={{
              shadowColor: "#DC2626",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
            }}
          >
            <Ionicons name="call" size={48} color="white" />
          </View>
        </Pressable>

        <AppText variant="bodySm" className="text-red-800 mt-4 font-semibold text-[13px]">
          {t("connect.tapToCall")}
        </AppText>
      </View>

      {/* Bottom padding for tab bar */}
      <View className="h-24" />
    </ScrollView>
  );
}