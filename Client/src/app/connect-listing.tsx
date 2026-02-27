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
      className="bg-white rounded-2xl p-3 mb-4 shadow-sm w-[48%]"
      style={({ pressed }) => ({
        elevation: 3,
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View className="relative mb-3 items-center">
        <Image
          source={{ uri: professional.imageUrl || 'https://via.placeholder.com/150' }}
          className="w-full h-24 rounded-xl"
          resizeMode="cover"
        />
        <View
          className={`absolute bottom-2 left-2 right-2 rounded-lg py-1 items-center z-10 ${professional.isAvailable ? "bg-green-600/90" : "bg-gray-400/90"
            }`}
        >
          <AppText
            variant="bodySm"
            className="text-white text-[10px] font-semibold"
            numberOfLines={1}
          >
            {professional.isAvailable ? t("connect.available") : t("connect.busy")}
          </AppText>
        </View>
      </View>
      <View className="flex-1 justify-center items-center">
        <AppText
          variant="h3"
          className="font-bold text-gray-800 mb-1 text-center text-[14px]"
          numberOfLines={1}
        >
          {professional.name}
        </AppText>
        <View className="bg-green-100 px-2 py-1 rounded-xl mb-2 items-center">
          <AppText
            variant="bodySm"
            className="text-green-800 font-semibold text-[10px] text-center"
            numberOfLines={1}
          >
            {professional.role}
          </AppText>
        </View>
        <View className="flex-row items-center justify-center mb-1">
          <Ionicons name="location-outline" size={12} color="#6B7280" />
          <AppText
            variant="bodySm"
            className="text-gray-500 ml-1 text-[10px]"
            numberOfLines={1}
          >
            {professional.district}
          </AppText>
        </View>
      </View>

      <View className="flex-row mt-2 pt-2 border-t border-gray-100 justify-between gap-x-2">
        <Pressable
          onPress={onCall}
          className="flex-1 flex-row items-center justify-center bg-blue-50 py-2 rounded-xl active:bg-blue-100"
        >
          <Ionicons name="call" size={14} color="#2563EB" />
        </Pressable>
        <Pressable
          onPress={onWhatsApp}
          className="flex-1 flex-row items-center justify-center bg-emerald-50 py-2 rounded-xl active:bg-emerald-100"
        >
          <Ionicons name="logo-whatsapp" size={14} color="#059669" />
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
        <View className="items-center pt-16">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <Ionicons name="search" size={28} color="#386641" />
          </View>
          <AppText variant="bodySm" className="text-gray-500 text-[14px]">
            {t("connect.loading")}
          </AppText>
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
          contentContainerClassName="p-4 pb-10"
          columnWrapperClassName="justify-between"
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
