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
  StatusBar,
  Text,
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
  const avatarUrl =
    professional.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=386641&color=fff&size=300&bold=true`;

  return (
    <Pressable
      onPress={onPress}
      className="w-[48%] mb-4 rounded-[20px] bg-white overflow-hidden shadow-md active:opacity-95"
    >
      {/* Portrait Image */}
      <View className="h-40 relative">
        <Image source={{ uri: avatarUrl }} className="w-full h-full" resizeMode="cover" />

        {/* Availability pill — top-right */}
        <View
          className={`absolute top-2.5 right-2.5 flex-row items-center px-2 py-1 rounded-full ${
            professional.isAvailable ? "bg-green-600" : "bg-gray-600"
          }`}
        >
          <View className="w-1.5 h-1.5 rounded-full bg-white mr-1" />
          <AppText style={{ color: "#FFFFFF", fontSize: 9, fontWeight: "700", letterSpacing: 0.3 }}>
            {professional.isAvailable ? t("connect.available") : t("connect.busy")}
          </AppText>
        </View>

        {/* Name + Role overlay */}
        <View className="absolute bottom-0 left-0 right-0 p-2.5">
          <AppText
            numberOfLines={1}
            style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "800", marginBottom: 4 }}
          >
            {professional.name}
          </AppText>
          <View className="flex-row">
            <View className="bg-[#386641]/90 px-[7px] py-0.5 rounded-lg">
              <AppText
                numberOfLines={1}
                style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "600" }}
              >
                {professional.role}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom content */}
      <View className="p-2.5">
        {/* Location */}
        <View className="flex-row items-center mb-2 gap-0.5">
          <Ionicons name="location-outline" size={12} color="#6B7280" />
          <AppText
            numberOfLines={1}
            style={{ color: "#4B5563", fontSize: 11, flex: 1, marginLeft: 2 }}
          >
            {professional.district || "—"}
          </AppText>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-1.5">
          <Pressable
            onPress={onCall}
            className="flex-1 flex-row items-center justify-center bg-blue-50 py-2 rounded-xl gap-1"
            hitSlop={6}
          >
            <Ionicons name="call" size={15} color="#2563EB" />
            <AppText style={{ color: "#2563EB", fontSize: 12, fontWeight: "700" }}>Call</AppText>
          </Pressable>
          <Pressable
            onPress={onWhatsApp}
            className="flex-1 flex-row items-center justify-center bg-emerald-50 py-2 rounded-xl gap-1"
            hitSlop={6}
          >
            <Ionicons name="logo-whatsapp" size={15} color="#059669" />
            <AppText style={{ color: "#059669", fontSize: 12, fontWeight: "700" }}>Chat</AppText>
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
    [category]
  );

  const fetchProfessionals = useCallback(async () => {
    if (!category) return;
    try {
      const data =
        category === "all"
          ? await professionalsApi.getAll({})
          : await professionalsApi.getByCategory(category);
      setProfessionals(data);
    } catch (error) {
      console.error("Error fetching professionals:", error);
    }
  }, [category]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProfessionals();
      setLoading(false);
    };
    load();
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
      Linking.openURL(`tel:${professional.phone.replace(/\D/g, "")}`);
    }
  };

  const handleWhatsApp = (professional: Professional) => {
    if (professional.phone) {
      const num = professional.phone.replace(/\D/g, "");
      const formatted = num.startsWith("91") ? num : `91${num}`;
      Linking.openURL(`whatsapp://send?phone=${formatted}`);
    }
  };

  const availableCount = professionals.filter((p) => p.isAvailable).length;

  return (
    <View className="flex-1 bg-slate-100">
      <StatusBar barStyle="light-content" backgroundColor="#386641" />

      {/* Header */}
      <View className="bg-[#386641] pt-[52px] pb-4 px-5 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3.5"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View className="flex-1">
          <AppText
            numberOfLines={1}
            style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "800" }}
          >
            {service ? t(service.titleKey) : t("connect.allExperts")}
          </AppText>
          <AppText style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 }}>
            Find your specialist
          </AppText>
        </View>
      </View>

      {/* Stats strip */}
      {!loading && professionals.length > 0 && (
        <View className="flex-row bg-white py-3 px-6 border-b border-slate-200 items-center">
          <View className="flex-1 items-center">
            <AppText style={{ fontSize: 18, fontWeight: "800", color: "#1F2937" }}>
              {professionals.length}
            </AppText>
            <AppText style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
              {t("connect.experts")}
            </AppText>
          </View>

          <View className="w-px h-8 bg-slate-200" />

          <View className="flex-1 items-center">
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2 rounded-full bg-green-600" />
              <AppText style={{ fontSize: 18, fontWeight: "800", color: "#16A34A" }}>
                {availableCount}
              </AppText>
            </View>
            <AppText style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
              {t("connect.availableNow")}
            </AppText>
          </View>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View className="flex-row flex-wrap justify-between p-4">
          {[0, 1, 2, 3].map((i) => (
            <ProfessionalCardSkeleton key={i} />
          ))}
        </View>
      ) : professionals.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 pt-16">
          <View className="w-[88px] h-[88px] rounded-full bg-slate-100 items-center justify-center mb-4">
            <Ionicons name="people-outline" size={44} color="#9CA3AF" />
          </View>
          <AppText style={{ fontSize: 16, fontWeight: "700", color: "#374151", textAlign: "center" }}>
            {t("connect.noProfessionalsFound")}
          </AppText>
          <AppText style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", marginTop: 6 }}>
            {t("connect.tryDifferentCategory")}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={professionals}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
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