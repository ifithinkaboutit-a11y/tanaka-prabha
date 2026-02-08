// src/app/connect-listing.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import { Image, ScrollView, TouchableOpacity, View, ActivityIndicator } from "react-native";
import AppText from "../components/atoms/AppText";
import { connectServices } from "../data/content/connectServices";
import { professionalsApi, Professional } from "@/services/apiService";
import { useTranslation } from "../i18n";

const ProfessionalCard = ({
  professional,
  onPress,
}: {
  professional: Professional;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-neutral-border shadow-sm"
    >
      <View className="flex-row">
        <Image
          source={{ uri: professional.imageUrl || 'https://via.placeholder.com/100' }}
          className="w-24 h-28 rounded-xl mr-4"
          resizeMode="cover"
        />
        <View className="flex-1 justify-center">
          <AppText
            variant="h3"
            className="font-bold text-neutral-textDark mb-1"
          >
            {professional.name}
          </AppText>
          <View className="flex-row items-center mb-2">
            <AppText variant="bodySm" className="text-[#386641] font-medium">
              {professional.role}
            </AppText>
          </View>
          <View className="flex-row items-center">
            <AppText variant="bodySm" className="text-neutral-textMedium">
              {professional.district}
            </AppText>
            <View className="w-1 h-1 rounded-full bg-neutral-textLight mx-2" />
            <AppText variant="caption" className="text-neutral-textLight">
              Role
            </AppText>
          </View>
          {professional.isAvailable && (
            <View className="flex-row items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <AppText variant="caption" className="text-green-600">
                Available
              </AppText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ConnectListingScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  const service = useMemo(
    () => connectServices.find((s) => s.id === category),
    [category],
  );

  // Fetch professionals by category
  useEffect(() => {
    const fetchProfessionals = async () => {
      if (!category) return;
      
      try {
        setLoading(true);
        const data = await professionalsApi.getByCategory(category);
        setProfessionals(data);
      } catch (error) {
        console.error("Error fetching professionals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, [category]);

  const handleProfessionalPress = (professional: Professional) => {
    router.push({
      pathname: "/connect-detail",
      params: { professionalId: professional.id },
    } as any);
  };

  return (
    <View className="flex-1 bg-neutral-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-4 bg-white border-b border-neutral-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <AppText variant="h3" className="font-semibold flex-1" numberOfLines={1}>
          {service ? t(service.titleKey) : t("connect.title")}
        </AppText>
      </View>

      {/* Results Count */}
      {!loading && professionals.length > 0 && (
        <View className="px-4 py-3 bg-white border-b border-neutral-border">
          <AppText variant="bodySm" className="text-neutral-textMedium">
            Showing {professionals.length} results
          </AppText>
        </View>
      )}

      {/* Professionals List */}
      <ScrollView className="flex-1 px-4 pt-4">
        {loading ? (
          <ActivityIndicator size="large" color="#386641" style={{ marginTop: 40 }} />
        ) : (
          <>
            {professionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onPress={() => handleProfessionalPress(professional)}
              />
            ))}

            {professionals.length === 0 && (
              <View className="items-center justify-center py-12">
                <Ionicons name="people-outline" size={48} color="#9E9E9E" />
                <AppText variant="bodyMd" className="text-neutral-textMedium mt-4">
                  {t("connect.noProfessionalsFound")}
                </AppText>
              </View>
            )}
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default ConnectListingScreen;
