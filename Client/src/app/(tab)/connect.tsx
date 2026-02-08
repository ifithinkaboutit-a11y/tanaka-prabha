// src/app/(tab)/connect.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    Image,
    Linking,
    ScrollView,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import AppText from "../../components/atoms/AppText";
import { connectServices } from "../../data/content/connectServices";
import { professionalsApi, Professional } from "@/services/apiService";
import { useTranslation } from "../../i18n";

export default function Connect() {
  const router = useRouter();
  const { t } = useTranslation();
  const [recentProfessionals, setRecentProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent professionals (showing recently available ones as a proxy for recent connections)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get a few professionals to show as recent connections
        const professionals = await professionalsApi.getAll({ limit: 2, available_only: true });
        setRecentProfessionals(professionals);
      } catch (error) {
        console.error("Error fetching professionals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleServicePress = (serviceId: string) => {
    router.push({
      pathname: "/connect-listing",
      params: { category: serviceId },
    } as any);
  };

  const handleEmergencyPress = () => {
    // Emergency helpline number (example: 1800-XXX-XXXX)
    const emergencyNumber = "tel:1800180111";
    Linking.openURL(emergencyNumber);
  };

  const handleViewAllConnections = () => {
    console.log("View all connections");
  };

  return (
    <ScrollView className="flex-1 bg-neutral-surface">
      {/* Header */}
      <View className="pt-12 pb-6 px-4 bg-white">
        <AppText variant="h2" className="font-bold text-neutral-textDark">
          {t("connect.title")}
        </AppText>
      </View>

      {/* What do you need help with? */}
      <View className="px-4 py-6 bg-white">
        <AppText variant="h3" className="font-bold text-neutral-textDark mb-4">
          {t("connect.whatHelpWith")}
        </AppText>

        {/* Services Grid - 2x2 */}
        <View className="flex-row flex-wrap gap-3">
          {connectServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              className="flex-1 min-w-[45%]"
              onPress={() => handleServicePress(service.id)}
            >
              <View className="bg-white border border-neutral-border rounded-2xl items-center justify-center py-6 px-4 shadow-sm">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: service.iconBgColor }}
                >
                  <Ionicons name={service.icon} size={40} color="#386641" />
                </View>
                <AppText
                  variant="bodySm"
                  className="text-center font-medium text-neutral-textDark"
                >
                  {t(service.titleKey)}
                </AppText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Connections */}
      <View className="px-4 py-6 mt-2 bg-white">
        <View className="flex-row justify-between items-center mb-4">
          <AppText variant="h3" className="font-bold text-neutral-textDark">
            {t("connect.recentConnections")}
          </AppText>
          <TouchableOpacity onPress={handleViewAllConnections}>
            <AppText
              variant="bodySm"
              className="text-primary-forest font-medium"
            >
              {t("connect.viewAll")}
            </AppText>
          </TouchableOpacity>
        </View>

        {recentProfessionals.map((professional) => (
            <TouchableOpacity
              key={professional.id}
              className="bg-neutral-surface rounded-2xl p-4 mb-3 shadow-sm"
              onPress={() =>
                router.push({
                  pathname: "/connect-detail",
                  params: { professionalId: professional.id },
                } as any)
              }
            >
              <View className="flex-row items-center">
                <Image
                  source={{ uri: professional.imageUrl || 'https://via.placeholder.com/64' }}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <View className="flex-1">
                  <AppText
                    variant="bodyMd"
                    className="font-semibold text-neutral-textDark mb-1"
                  >
                    {professional.name}
                  </AppText>
                  <AppText variant="bodySm" className="text-neutral-textMedium">
                    {professional.role}
                  </AppText>
                  <AppText variant="bodySm" className="text-neutral-textMedium">
                    {professional.district}
                  </AppText>
                </View>
                <View className={`w-3 h-3 rounded-full ${professional.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
              </View>
            </TouchableOpacity>
          ))}

        {recentProfessionals.length === 0 && !loading && (
          <AppText variant="bodySm" className="text-neutral-textMedium text-center py-4">
            No recent connections
          </AppText>
        )}
      </View>

      {/* Emergency Help */}
      <View className="px-4 py-8 mt-2 bg-white items-center">
        <AppText
          variant="h3"
          className="font-bold text-neutral-textDark mb-2 text-center"
        >
          {t("connect.emergencyTitle")}
        </AppText>
        <AppText
          variant="bodySm"
          className="text-neutral-textMedium mb-8 text-center"
        >
          {t("connect.emergencySubtitle")}
        </AppText>

        {/* Emergency Button - Large Red Circle */}
        <TouchableOpacity
          onPress={handleEmergencyPress}
          className="items-center justify-center"
          activeOpacity={0.8}
        >
          <View className="w-40 h-40 rounded-full bg-red-500 items-center justify-center shadow-lg">
            <Ionicons name="call" size={56} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom padding for tab bar */}
      <View className="h-4" />
    </ScrollView>
  );
};