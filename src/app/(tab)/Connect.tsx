import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import AppText from "../../components/atoms/AppText";
import Card from "../../components/atoms/Card";
import { useTranslation } from "../../i18n";

type ConnectService = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

const Connect = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const services: ConnectService[] = [
    {
      title: t("connect.training"),
      icon: "school-outline",
      onPress: () => router.push("/"), // Redirect to home for now
    },
    {
      title: t("connect.marketBuyers"),
      icon: "storefront-outline",
      onPress: () => router.push("/"), // Redirect to home for now
    },
    {
      title: t("connect.livestockVet"),
      icon: "medical-outline",
      onPress: () => router.push("/"), // Redirect to home for now
    },
    {
      title: t("connect.governmentHelpline"),
      icon: "call-outline",
      onPress: () => router.push("/"), // Redirect to home for now
    },
  ];

  return (
    <ScrollView className="flex-1 bg-neutral-surface">
      {/* Header */}
      <View className="pt-12 pb-6 px-4 bg-white">
        <AppText variant="h2" className="mb-2">
          {t("connect.title")}
        </AppText>
        <AppText variant="bodyMd" className="text-neutral-textLight">
          {t("connect.subtitle")}
        </AppText>
      </View>

      {/* Services Grid */}
      <View className="px-4 pb-8">
        <View className="flex-row flex-wrap justify-between">
          {services.map((service, index) => (
            <View key={index} className="w-[48%] mb-4">
              <Card
                className="items-center justify-center h-40 p-4"
                onPress={service.onPress}
              >
                <Ionicons name={service.icon} size={32} color="#386641" />
                <AppText
                  variant="bodyMd"
                  className="mt-3 text-center font-medium"
                >
                  {service.title}
                </AppText>
              </Card>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Connect;
