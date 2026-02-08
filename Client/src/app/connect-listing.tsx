// src/app/connect-listing.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Image,
  ScrollView,
  Pressable,
  View,
  RefreshControl,
  Linking,
} from "react-native";
import AppText from "../components/atoms/AppText";
import { connectServices } from "../data/content/connectServices";
import { professionalsApi, Professional } from "@/services/apiService";
import { useTranslation } from "../i18n";

const ProfessionalCard = ({
  professional,
  onPress,
  onCall,
  onWhatsApp,
  t,
}: {
  professional: Professional;
  onPress: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
  t: (key: string) => string;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.995 : 1 }],
      })}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: professional.imageUrl || 'https://via.placeholder.com/100' }}
            style={{
              width: 88,
              height: 100,
              borderRadius: 16,
              marginRight: 14,
            }}
            resizeMode="cover"
          />
          {/* Availability Badge */}
          <View
            style={{
              position: "absolute",
              bottom: 4,
              left: 4,
              right: 18,
              backgroundColor: professional.isAvailable
                ? "rgba(22, 163, 74, 0.9)"
                : "rgba(156, 163, 175, 0.9)",
              borderRadius: 8,
              paddingVertical: 4,
              alignItems: "center",
            }}
          >
            <AppText
              variant="bodySm"
              style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "600" }}
            >
              {professional.isAvailable ? t("connect.available") : t("connect.busy")}
            </AppText>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <AppText
            variant="h3"
            style={{ fontWeight: "700", color: "#1F2937", marginBottom: 4, fontSize: 16 }}
          >
            {professional.name}
          </AppText>
          <View
            style={{
              backgroundColor: "#DCFCE7",
              alignSelf: "flex-start",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              marginBottom: 8,
            }}
          >
            <AppText
              variant="bodySm"
              style={{ color: "#166534", fontWeight: "600", fontSize: 12 }}
            >
              {professional.role}
            </AppText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <AppText
              variant="bodySm"
              style={{ color: "#6B7280", marginLeft: 4, fontSize: 13 }}
            >
              {professional.district}
            </AppText>
          </View>
          {professional.serviceArea && (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Ionicons name="map-outline" size={14} color="#9CA3AF" />
              <AppText
                variant="bodySm"
                style={{ color: "#9CA3AF", marginLeft: 4, fontSize: 12 }}
              >
                {typeof professional.serviceArea === 'string' 
                  ? professional.serviceArea 
                  : [professional.serviceArea.district, professional.serviceArea.state].filter(Boolean).join(', ')}
              </AppText>
            </View>
          )}
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 14,
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          gap: 10,
        }}
      >
        <Pressable
          onPress={onCall}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed ? "#DBEAFE" : "#EFF6FF",
            paddingVertical: 10,
            borderRadius: 12,
          })}
        >
          <Ionicons name="call" size={18} color="#2563EB" />
          <AppText
            variant="bodySm"
            style={{ color: "#2563EB", fontWeight: "600", marginLeft: 6, fontSize: 13 }}
          >
            {t("connect.options.call")}
          </AppText>
        </Pressable>
        <Pressable
          onPress={onWhatsApp}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed ? "#D1FAE5" : "#ECFDF5",
            paddingVertical: 10,
            borderRadius: 12,
          })}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#059669" />
          <AppText
            variant="bodySm"
            style={{ color: "#059669", fontWeight: "600", marginLeft: 6, fontSize: 13 }}
          >
            {t("connect.options.chat")}
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
};

const ConnectListingScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const service = useMemo(
    () => connectServices.find((s) => s.id === category),
    [category],
  );

  const fetchProfessionals = useCallback(async () => {
    if (!category) return;
    
    try {
      const data = category === "all"
        ? await professionalsApi.getAll({})
        : await professionalsApi.getByCategory(category);
      setProfessionals(data);
    } catch (error) {
      console.error("Error fetching professionals:", error);
    }
  }, [category]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProfessionals();
      setLoading(false);
    };
    loadData();
  }, [fetchProfessionals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfessionals();
    setRefreshing(false);
  }, [fetchProfessionals]);

  const handleProfessionalPress = (professional: Professional) => {
    router.push({
      pathname: "/connect-detail",
      params: { professionalId: professional.id },
    } as any);
  };

  const handleCall = (professional: Professional) => {
    if (professional.phone) {
      const phoneNumber = professional.phone.replace(/\D/g, "");
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleWhatsApp = (professional: Professional) => {
    if (professional.phone) {
      const phoneNumber = professional.phone.replace(/\D/g, "");
      // Add country code if not present (assuming India)
      const formattedNumber = phoneNumber.startsWith("91")
        ? phoneNumber
        : `91${phoneNumber}`;
      Linking.openURL(`whatsapp://send?phone=${formattedNumber}`);
    }
  };

  const availableCount = professionals.filter((p) => p.isAvailable).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 48,
          paddingBottom: 16,
          backgroundColor: "#386641",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <AppText
          variant="h3"
          style={{ flex: 1, fontWeight: "700", color: "#FFFFFF", fontSize: 20 }}
          numberOfLines={1}
        >
          {service ? t(service.titleKey) : t("connect.allExperts")}
        </AppText>
      </View>

      {/* Results Summary */}
      {!loading && professionals.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 14,
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <AppText variant="bodySm" style={{ color: "#6B7280", fontSize: 14 }}>
            {t("connect.showing")} {professionals.length} {t("connect.experts")}
          </AppText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#DCFCE7",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#16A34A",
                marginRight: 6,
              }}
            />
            <AppText
              variant="bodySm"
              style={{ color: "#166534", fontWeight: "600", fontSize: 12 }}
            >
              {availableCount} {t("connect.availableNow")}
            </AppText>
          </View>
        </View>
      )}

      {/* Professionals List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
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
        {loading ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "#DCFCE7",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="search" size={28} color="#386641" />
            </View>
            <AppText
              variant="bodySm"
              style={{ color: "#6B7280", fontSize: 14 }}
            >
              {t("connect.loading")}
            </AppText>
          </View>
        ) : (
          <>
            {professionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onPress={() => handleProfessionalPress(professional)}
                onCall={() => handleCall(professional)}
                onWhatsApp={() => handleWhatsApp(professional)}
                t={t}
              />
            ))}

            {professionals.length === 0 && (
              <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#F3F4F6",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="people-outline" size={40} color="#9CA3AF" />
                </View>
                <AppText
                  variant="bodyMd"
                  style={{ color: "#6B7280", textAlign: "center", fontWeight: "500" }}
                >
                  {t("connect.noProfessionalsFound")}
                </AppText>
                <AppText
                  variant="bodySm"
                  style={{ color: "#9CA3AF", textAlign: "center", marginTop: 8 }}
                >
                  {t("connect.tryDifferentCategory")}
                </AppText>
              </View>
            )}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

export default ConnectListingScreen;
