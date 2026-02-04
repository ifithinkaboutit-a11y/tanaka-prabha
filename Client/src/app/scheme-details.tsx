// src/app/scheme-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, Linking, Pressable, ScrollView, View } from "react-native";
import AppText from "../components/atoms/AppText";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import { schemes } from "../data/content/schemes";
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

  const scheme = useMemo(
    () => schemes.find((s) => s.id === schemeId),
    [schemeId],
  );

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

  const handleApplyNow = () => {
    if (scheme.applyUrl) {
      Linking.openURL(scheme.applyUrl);
    }
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
    <ScrollView className="flex-1 bg-neutral-surface">
      {/* Navigation Header */}
      <View className="flex-row items-center pt-12 pb-4 px-4 bg-white">
        <Pressable onPress={() => router.back()} className="mr-4 p-2">
          <Ionicons name="arrow-back" size={24} color="#386641" />
        </Pressable>
        <AppText
          variant="h2"
          className="text-neutral-textDark flex-1"
          numberOfLines={1}
        >
          {scheme.title}
        </AppText>
      </View>

      {/* Hero Image */}
      {scheme.heroImageUrl && (
        <Image
          source={{ uri: scheme.heroImageUrl }}
          className="w-full h-48"
          resizeMode="cover"
        />
      )}

      {/* Scheme Title & Description */}
      <View className="px-4 py-6">
        <AppText variant="h1" className="text-neutral-textDark mb-4">
          {scheme.title}
        </AppText>
        <AppText variant="bodyLg" className="text-neutral-textMedium leading-6">
          {scheme.description}
        </AppText>
      </View>

      {/* Segmented Content Tabs */}
      <View className="px-4 mb-6">
        <View className="flex-row bg-neutral-surface border border-neutral-border rounded-lg p-1">
          {[
            { key: "overview", label: t("programReader.tabs.overview") },
            { key: "eligibility", label: t("schemesPage.eligibility") },
            { key: "process", label: t("programReader.tabs.process") },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-md ${
                activeTab === tab.key ? "bg-[#7F5539]" : "bg-transparent"
              }`}
            >
              <AppText
                variant="bodyMd"
                className={`text-center ${
                  activeTab === tab.key
                    ? "text-white font-medium"
                    : "text-neutral-textMedium"
                }`}
              >
                {tab.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        {/* Tab Content */}
        <Card className="mt-4 p-4">{renderTabContent()}</Card>
      </View>

      {/* Apply Now CTA */}
      <View className="px-4 pb-8">
        <Button
          label={t("programReader.applyNow")}
          variant="primary"
          size="lg"
          onPress={handleApplyNow}
          className="w-full"
        />
      </View>
    </ScrollView>
  );
};

export default SchemeDetailsScreen;
