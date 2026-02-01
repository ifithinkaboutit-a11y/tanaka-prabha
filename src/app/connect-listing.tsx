// src/app/connect-listing.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import AppText from "../components/atoms/AppText";
import {
    connectServices,
    getProfessionalsByCategory,
    Professional,
} from "../data/content/connectServices";
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
      className="flex-row bg-white rounded-xl p-4 mb-3 border border-neutral-border"
    >
      <Image
        source={{ uri: professional.imageUrl }}
        className="w-20 h-20 rounded-xl mr-4"
      />
      <View className="flex-1">
        <AppText
          variant="bodyMd"
          className="font-semibold text-neutral-textDark"
        >
          {professional.name}
        </AppText>
        <View className="flex-row items-center mt-1">
          <AppText variant="bodySm" className="text-primary">
            {professional.role}
          </AppText>
          <View className="w-1 h-1 rounded-full bg-neutral-textLight mx-2" />
          <AppText variant="bodySm" className="text-neutral-textMedium">
            {professional.district}
          </AppText>
        </View>
        {professional.isAvailable && (
          <View className="flex-row items-center mt-2">
            <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            <AppText variant="bodyLg" className="text-green-600">
              Available
            </AppText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ConnectListingScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { category } = useLocalSearchParams<{ category: string }>();

  const service = useMemo(
    () => connectServices.find((s) => s.id === category),
    [category],
  );

  const professionals = useMemo(
    () => (category ? getProfessionalsByCategory(category) : []),
    [category],
  );

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
        <AppText variant="h3" className="font-semibold" numberOfLines={1}>
          {service ? t(service.titleKey) : t("connect.title")}
        </AppText>
      </View>

      {/* Professionals List */}
      <ScrollView className="flex-1 px-4 pt-4">
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

        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default ConnectListingScreen;
