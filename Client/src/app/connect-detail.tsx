// src/app/connect-detail.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Image, Modal, ScrollView, TouchableOpacity, View, ActivityIndicator } from "react-native";
import AppText from "../components/atoms/AppText";
import Button from "../components/atoms/Button";
import { professionalsApi, Professional } from "@/services/apiService";
import { useTranslation } from "../i18n";

const ConnectDetailScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { professionalId } = useLocalSearchParams<{ professionalId: string }>();
  const [showOverlay, setShowOverlay] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch professional on mount
  useEffect(() => {
    const fetchProfessional = async () => {
      if (!professionalId) return;
      
      try {
        setLoading(true);
        const data = await professionalsApi.getById(professionalId);
        setProfessional(data);
      } catch (error) {
        console.error("Error fetching professional:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [professionalId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-surface">
        <ActivityIndicator size="large" color="#386641" />
      </View>
    );
  }

  if (!professional) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-surface">
        <AppText variant="bodyMd">{t("connect.professionalNotFound")}</AppText>
        <Button label={t("common.goBack")} onPress={() => router.back()} className="mt-4" />
      </View>
    );
  }

  const handleConnect = () => {
    setShowOverlay(true);
  };

  const handleCall = () => {
    setShowOverlay(false);
    console.log("Calling", professional.phone);
  };

  const handleChat = () => {
    setShowOverlay(false);
    console.log("Opening chat with", professional.name);
  };

  const handleBookAppointment = () => {
    setShowOverlay(false);
    console.log("Booking appointment with", professional.name);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-4 bg-white border-b border-neutral-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <AppText variant="h3" className="font-semibold" numberOfLines={1}>
          {professional.category ? t(`connect.services.${professional.category.replace(/-/g, '')}`) : t("connect.services.livestockVeterinary")}
        </AppText>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="px-4 py-6">
          {/* Large Profile Image */}
          <View className="items-center mb-6">
            <Image
              source={{ uri: professional.imageUrl || 'https://via.placeholder.com/150' }}
              className="w-36 h-40 rounded-2xl"
              resizeMode="cover"
            />
          </View>

          {/* Name and Basic Info */}
          <AppText variant="h2" className="font-bold text-neutral-textDark text-center mb-2">
            {professional.name}
          </AppText>
          <AppText variant="bodyMd" className="text-neutral-textMedium text-center mb-1">
            <AppText className="font-medium">Role:</AppText> {professional.role}
          </AppText>
          <AppText variant="bodyMd" className="text-neutral-textMedium text-center">
            <AppText className="font-medium">Department:</AppText> {professional.department}
          </AppText>
        </View>

        {/* Service Area Section */}
        <View className="px-4 py-5 border-t border-neutral-border">
          <AppText variant="h3" className="font-bold text-neutral-textDark mb-4">
            {t("connect.serviceArea")}
          </AppText>

          <View className="mb-3 flex-row items-start">
            <AppText variant="bodyMd" className="text-neutral-textDark mr-2">•</AppText>
            <AppText variant="bodyMd" className="text-neutral-textDark">
              <AppText className="font-medium">District:</AppText> {professional.serviceArea?.district || professional.district || 'N/A'}
            </AppText>
          </View>

          <View className="mb-3 flex-row items-start">
            <AppText variant="bodyMd" className="text-neutral-textDark mr-2">•</AppText>
            <AppText variant="bodyMd" className="text-neutral-textDark flex-1">
              <AppText className="font-medium">Blocks Covered:</AppText> {professional.serviceArea?.blocks?.join(", ") || 'N/A'}
            </AppText>
          </View>

          <View className="mb-3 flex-row items-start">
            <AppText variant="bodyMd" className="text-neutral-textDark mr-2">•</AppText>
            <AppText variant="bodyMd" className="text-neutral-textDark">
              <AppText className="font-medium">State:</AppText> {professional.serviceArea?.state || 'N/A'}
            </AppText>
          </View>

          {professional.isAvailable && (
            <AppText variant="bodySm" className="text-green-600 mt-2 italic">
              {t("connect.availableForOnCall")}
            </AppText>
          )}
        </View>

        {/* Specialization Section */}
        <View className="px-4 py-5 border-t border-neutral-border">
          <AppText variant="h3" className="font-bold text-neutral-textDark mb-4">
            {t("connect.specialization")}
          </AppText>

          {(professional.specializations || []).map((spec, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <AppText variant="bodyMd" className="text-neutral-textDark mr-2">•</AppText>
              <AppText variant="bodyMd" className="text-neutral-textDark flex-1">
                {spec}
              </AppText>
            </View>
          ))}
        </View>

        <View className="h-28" />
      </ScrollView>

      {/* Call Button - Fixed at Bottom */}
      <View className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-neutral-border">
        <TouchableOpacity
          onPress={handleConnect}
          className="w-full py-4 rounded-full flex-row items-center justify-center"
          style={{ backgroundColor: '#DC2626' }}
        >
          <Ionicons name="call" size={20} color="white" />
          <AppText variant="bodyMd" className="text-white font-semibold ml-2">
            {t("connect.callThem")}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Connect Options Overlay */}
      <Modal
        visible={showOverlay}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOverlay(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowOverlay(false)}
        >
          <View className="mt-auto bg-white rounded-t-3xl px-6 py-8">
            <AppText
              variant="h3"
              className="font-semibold text-neutral-textDark mb-6"
            >
              {t("connect.howToConnect")}
            </AppText>

            <Button
              variant="primary"
              onPress={handleCall}
              className="w-full py-4 mb-3"
            >
              <AppText
                variant="bodyMd"
                className="text-white font-semibold text-center"
              >
                {t("connect.callThem")}
              </AppText>
            </Button>

            <Button
              variant="secondary"
              onPress={handleChat}
              className="w-full py-4 mb-3 bg-green-100"
            >
              <AppText
                variant="bodyMd"
                className="text-primary font-semibold text-center"
              >
                {t("connect.chatWithThem")}
              </AppText>
            </Button>

            <Button
              variant="secondary"
              onPress={handleBookAppointment}
              className="w-full py-4 bg-green-100"
            >
              <AppText
                variant="bodyMd"
                className="text-primary font-semibold text-center"
              >
                {t("connect.bookAppointment")}
              </AppText>
            </Button>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ConnectDetailScreen;
