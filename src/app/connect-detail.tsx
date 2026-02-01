// src/app/connect-detail.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import AppText from "../components/atoms/AppText";
import Button from "../components/atoms/Button";
import { getProfessionalById } from "../data/content/connectServices";
import { useTranslation } from "../i18n";

const ConnectDetailScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { professionalId } = useLocalSearchParams<{ professionalId: string }>();
  const [showOverlay, setShowOverlay] = useState(false);

  const professional = useMemo(
    () => (professionalId ? getProfessionalById(professionalId) : undefined),
    [professionalId],
  );

  if (!professional) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-surface">
        <AppText variant="bodyMd">{t("connect.professionalNotFound")}</AppText>
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
    <View className="flex-1 bg-neutral-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-4 bg-white border-b border-neutral-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <AppText variant="h3" className="font-semibold" numberOfLines={1}>
          {t("connect.services.livestockVeterinary")}
        </AppText>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Card */}
        <View className="bg-white px-4 py-6">
          <View className="flex-row items-start">
            <Image
              source={{ uri: professional.imageUrl }}
              className="w-24 h-24 rounded-xl mr-4"
            />
            <View className="flex-1">
              <AppText variant="h3" className="font-bold text-neutral-textDark">
                {professional.name}
              </AppText>
              <AppText
                variant="bodySm"
                className="text-neutral-textMedium mt-1"
              >
                {t("connect.roleLabel")}: {professional.role}
              </AppText>
              <AppText variant="bodySm" className="text-neutral-textMedium">
                {t("connect.departmentLabel")}: {professional.department}
              </AppText>
            </View>
          </View>
        </View>

        {/* Service Area */}
        <View className="bg-white px-4 py-4 mt-2">
          <AppText
            variant="bodyMd"
            className="font-semibold text-neutral-textDark mb-3"
          >
            {t("connect.serviceArea")}
          </AppText>

          <View className="pl-2">
            <View className="flex-row mb-2">
              <AppText
                variant="bodySm"
                className="text-neutral-textMedium w-20"
              >
                {t("connect.district")}:
              </AppText>
              <AppText
                variant="bodySm"
                className="text-neutral-textDark flex-1"
              >
                {professional.serviceArea.district}
              </AppText>
            </View>

            <View className="flex-row mb-2">
              <AppText
                variant="bodySm"
                className="text-neutral-textMedium w-20"
              >
                {t("connect.blocks")}:
              </AppText>
              <AppText
                variant="bodySm"
                className="text-neutral-textDark flex-1"
              >
                {professional.serviceArea.blocks.join(", ")}
              </AppText>
            </View>

            <View className="flex-row">
              <AppText
                variant="bodySm"
                className="text-neutral-textMedium w-20"
              >
                {t("connect.state")}:
              </AppText>
              <AppText
                variant="bodySm"
                className="text-neutral-textDark flex-1"
              >
                {professional.serviceArea.state}
              </AppText>
            </View>
          </View>

          <AppText variant="bodyLg" className="text-green-600 mt-3 italic">
            {t("connect.availableForOnCall")}
          </AppText>
        </View>

        {/* Specialization */}
        <View className="bg-white px-4 py-4 mt-2">
          <AppText
            variant="bodyMd"
            className="font-semibold text-neutral-textDark mb-3"
          >
            {t("connect.specialization")}
          </AppText>

          {professional.specializations.map((spec, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <View className="w-1.5 h-1.5 rounded-full bg-neutral-textDark mt-2 mr-3" />
              <AppText
                variant="bodySm"
                className="text-neutral-textDark flex-1"
              >
                {spec}
              </AppText>
            </View>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Connect Button */}
      <View className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-neutral-border">
        <Button
          variant="primary"
          onPress={handleConnect}
          className="w-full py-4"
        >
          <AppText
            variant="bodyMd"
            className="text-white font-semibold text-center"
          >
            {t("connect.callThem")}
          </AppText>
        </Button>
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
