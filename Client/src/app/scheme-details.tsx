// src/app/scheme-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Image, Linking, Pressable, ScrollView, View, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import AppText from "../components/atoms/AppText";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import { schemesApi, Scheme } from "@/services/apiService";
import { useTranslation } from "../i18n";

export const options = {
  headerShown: false,
};

const SchemeDetailsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { schemeId } = useLocalSearchParams<{ schemeId: string }>();
  const [activeTab, setActiveTab] = useState<
    "overview" | "eligibility" | "process"
  >("overview");
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch scheme on mount
  useEffect(() => {
    const fetchScheme = async () => {
      if (!schemeId) return;
      
      try {
        setLoading(true);
        const data = await schemesApi.getById(schemeId);
        setScheme(data);
      } catch (error) {
        console.error("Error fetching scheme:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [schemeId]);

  if (loading) {
    return (
      <View className="flex-1 bg-neutral-surface items-center justify-center">
        <ActivityIndicator size="large" color="#386641" />
      </View>
    );
  }

  if (!scheme) {
    return (
      <View className="flex-1 bg-neutral-surface items-center justify-center">
        <AppText variant="h2" className="text-neutral-textDark mb-4">
          {t("schemesPage.schemeNotFound")}
        </AppText>
        <Button label={t("common.goBack")} onPress={() => router.back()} />
      </View>
    );
  }

  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleApplyNow = async () => {
    if (scheme.applyUrl) {
      try {
        const supported = await Linking.canOpenURL(scheme.applyUrl);
        if (supported) {
          await Linking.openURL(scheme.applyUrl);
        } else {
          Alert.alert(
            t("common.error") || "Error",
            t("schemesPage.cannotOpenUrl") || "Cannot open this URL"
          );
        }
      } catch (error) {
        Alert.alert(
          t("common.error") || "Error",
          t("schemesPage.urlOpenFailed") || "Failed to open the application URL"
        );
      }
    } else {
      Alert.alert(
        t("schemesPage.noApplicationUrl") || "No Application URL",
        t("schemesPage.contactAuthorities") || "Please contact the relevant authorities to apply for this scheme."
      );
    }
  };

  const handleReadMore = () => {
    setShowFullDescription(!showFullDescription);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <View>
            <AppText
              variant="bodyLg"
              className="text-neutral-textDark mb-6 leading-6"
            >
              {scheme.overview}
            </AppText>

            {/* Key Objectives */}
            <AppText variant="h3" className="text-neutral-textDark mb-4">
              {t("programReader.keyObjectives")}
            </AppText>
            <View className="mb-6">
              {scheme.keyObjectives?.map((objective: string, index: number) => (
                <View key={index} className="flex-row items-start mb-3">
                  <AppText
                    variant="bodyMd"
                    className="text-neutral-textDark mr-2"
                  >
                    •
                  </AppText>
                  <AppText
                    variant="bodyMd"
                    className="text-neutral-textDark flex-1"
                  >
                    {objective}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        );
      case "eligibility":
        return (
          <View>
            <AppText variant="h3" className="text-neutral-textDark mb-3">
              {t("schemesPage.eligibility")}
            </AppText>
            <View className="mb-6">
              {scheme.eligibility?.map((criterion: string, index: number) => (
                <View key={index} className="flex-row items-start mb-3">
                  <AppText
                    variant="bodyMd"
                    className="text-neutral-textDark mr-2"
                  >
                    •
                  </AppText>
                  <AppText
                    variant="bodyMd"
                    className="text-neutral-textDark flex-1"
                  >
                    {criterion}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        );
      case "process":
        return (
          <AppText variant="bodyLg" className="text-neutral-textDark leading-6">
            {scheme.process}
          </AppText>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Navigation Header */}
        <View className="flex-row items-center pt-12 pb-4 px-4 bg-white">
          <Pressable onPress={() => router.back()} className="mr-4 p-1">
            <Ionicons name="arrow-back" size={24} color="#212121" />
          </Pressable>
          <AppText
            variant="h3"
            className="text-neutral-textDark flex-1 font-semibold"
            numberOfLines={1}
          >
            {t("schemesPage.schemeDetails")}
          </AppText>
        </View>

        {/* Hero Image */}
        {scheme.heroImageUrl && (
          <Image
            source={{ uri: scheme.heroImageUrl }}
            className="w-full h-52"
            resizeMode="cover"
          />
        )}

        {/* Scheme Title & Description */}
        <View className="px-4 py-5">
          <AppText variant="h2" className="text-neutral-textDark mb-3 font-bold">
            {scheme.title}
          </AppText>
          <AppText variant="bodyMd" className="text-neutral-textMedium leading-6">
            {showFullDescription 
              ? scheme.description 
              : scheme.description?.slice(0, 150) + (scheme.description?.length > 150 ? "..." : "")}
          </AppText>
          {scheme.description?.length > 150 && (
            <TouchableOpacity onPress={handleReadMore}>
              <AppText variant="bodyMd" className="text-[#2196F3] font-medium mt-2">
                {showFullDescription 
                  ? (t("common.readLess") || "Read less") 
                  : (t("common.readMore") || "Read more")}
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Segmented Tab Buttons */}
        <View className="px-4 mb-4">
          <View className="flex-row">
            {[
              { key: "overview", label: t("programReader.tabs.overview") },
              { key: "eligibility", label: t("schemesPage.eligibility") },
              { key: "process", label: t("programReader.tabs.process") },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                className={`py-2.5 px-5 mr-2 rounded-full border ${
                  activeTab === tab.key 
                    ? "bg-[#7F5539] border-[#7F5539]" 
                    : "bg-white border-neutral-border"
                }`}
              >
                <AppText
                  variant="bodyMd"
                  className={`font-medium ${
                    activeTab === tab.key
                      ? "text-white"
                      : "text-neutral-textDark"
                  }`}
                >
                  {tab.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-4 pb-6">{renderTabContent()}</View>
      </ScrollView>

      {/* Fixed Apply Now Button */}
      <View className="px-4 py-4 bg-white border-t border-neutral-border">
        <Button
          label={t("programReader.applyNow")}
          variant="primary"
          size="lg"
          onPress={handleApplyNow}
          className="w-full rounded-full"
        />
      </View>
    </View>
  );
};

export default SchemeDetailsScreen;
