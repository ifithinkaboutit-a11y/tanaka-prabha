import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Image,
  Pressable,
  View,
  RefreshControl,
  Linking,
  FlatList,
} from "react-native";
import AppText from "../components/atoms/AppText";
import { ProfessionalCardSkeleton } from "../components/atoms/Skeleton";
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
        width: "48%",
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        overflow: "hidden",
      })}
    >
      {/* Image Section */}
      <View style={{ position: "relative", height: 140 }}>
        <Image
          source={{ uri: professional.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=386641&color=fff&size=200` }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        {/* Availability Badge */}
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: professional.isAvailable ? "#16A34A" : "#6B7280",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#FFFFFF", marginRight: 4 }} />
          <AppText variant="bodySm" style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "700" }}>
            {professional.isAvailable ? t("connect.available") : t("connect.busy")}
          </AppText>
        </View>
      </View>

      {/* Content */}
      <View style={{ padding: 12 }}>
        <AppText
          variant="h3"
          style={{ fontWeight: "800", color: "#111827", fontSize: 14, marginBottom: 4 }}
          numberOfLines={1}
        >
          {professional.name}
        </AppText>
        <View style={{ backgroundColor: "#F0FDF4", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start", marginBottom: 6 }}>
          <AppText variant="bodySm" style={{ color: "#16A34A", fontSize: 11, fontWeight: "600" }} numberOfLines={1}>
            {professional.role}
          </AppText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <Ionicons name="location-outline" size={12} color="#6B7280" />
          <AppText variant="bodySm" style={{ color: "#6B7280", fontSize: 11, marginLeft: 3 }} numberOfLines={1}>
            {professional.district}
          </AppText>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={onCall}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#EFF6FF", paddingVertical: 8, borderRadius: 12 }}
          >
            <Ionicons name="call" size={15} color="#2563EB" />
          </Pressable>
          <Pressable
            onPress={onWhatsApp}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#ECFDF5", paddingVertical: 8, borderRadius: 12 }}
          >
            <Ionicons name="logo-whatsapp" size={15} color="#059669" />
          </Pressable>
        </View>
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
      const formattedNumber = phoneNumber.startsWith("91")
        ? phoneNumber
        : `91${phoneNumber}`;
      Linking.openURL(`whatsapp://send?phone=${formattedNumber}`);
    }
  };

  const availableCount = professionals.filter((p) => p.isAvailable).length;

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-5 pt-12 pb-4 bg-[#386641]">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3 active:opacity-70"
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <AppText
          variant="h3"
          className="flex-1 font-bold text-white text-[20px]"
          numberOfLines={1}
        >
          {service ? t(service.titleKey) : t("connect.allExperts")}
        </AppText>
      </View>

      {!loading && professionals.length > 0 && (
        <View className="flex-row justify-between items-center px-5 py-3 bg-white border-b border-gray-200">
          <AppText variant="bodySm" className="text-gray-500 text-[14px]">
            {t("connect.showing")} {professionals.length} {t("connect.experts")}
          </AppText>
          <View className="flex-row items-center bg-green-100 px-3 py-1 rounded-xl">
            <View className="w-2 h-2 rounded-full bg-green-600 mr-2" />
            <AppText
              variant="bodySm"
              className="text-green-800 font-semibold text-[12px]"
            >
              {availableCount} {t("connect.availableNow")}
            </AppText>
          </View>
        </View>
      )}

      {loading ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", padding: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <ProfessionalCardSkeleton key={i} />
          ))}
        </View>
      ) : professionals.length === 0 ? (
        <View className="items-center justify-center pt-16">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Ionicons name="people-outline" size={40} color="#9CA3AF" />
          </View>
          <AppText variant="bodyMd" className="text-gray-500 text-center font-medium">
            {t("connect.noProfessionalsFound")}
          </AppText>
          <AppText variant="bodySm" className="text-gray-400 text-center mt-2">
            {t("connect.tryDifferentCategory")}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={professionals}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#386641"]}
              tintColor="#386641"
            />
          }
          renderItem={({ item }) => (
            <ProfessionalCard
              professional={item}
              onPress={() => handleProfessionalPress(item)}
              onCall={() => handleCall(item)}
              onWhatsApp={() => handleWhatsApp(item)}
              t={t}
            />
          )}
        />
      )}
    </View>
  );
};

export default ConnectListingScreen;
