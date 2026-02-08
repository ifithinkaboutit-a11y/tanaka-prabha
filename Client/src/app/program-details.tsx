// src/app/program-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Image, Linking, Pressable, ScrollView, View, ActivityIndicator } from "react-native";
import AppText from "../components/atoms/AppText";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import { schemesApi, Scheme } from "@/services/apiService";
import { useTranslation } from "../i18n";

export const options = {
  headerShown: false,
};

const ProgramDetails = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const [activeTab, setActiveTab] = useState<
    "overview" | "process" | "support"
  >("overview");
  const [program, setProgram] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch program on mount
  useEffect(() => {
    const fetchProgram = async () => {
      if (!programId) return;
      
      try {
        setLoading(true);
        const data = await schemesApi.getById(programId);
        setProgram(data);
      } catch (error) {
        console.error("Error fetching program:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  if (loading) {
    return (
      <View className="flex-1 bg-neutral-surface items-center justify-center">
        <ActivityIndicator size="large" color="#386641" />
      </View>
    );
  }

  if (!program) {
    return (
      <View className="flex-1 bg-neutral-surface items-center justify-center">
        <AppText variant="h2" className="text-neutral-textDark mb-4">
          Program Not Found
        </AppText>
        <Button label="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handleApplyNow = () => {
    if (program.applyUrl) {
      Linking.openURL(program.applyUrl);
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
              {program.overview}
            </AppText>

            {/* Key Objectives */}
            <AppText variant="h3" className="text-neutral-textDark mb-4">
              {t("programReader.keyObjectives")}
            </AppText>
            <View className="mb-6">
              {program.keyObjectives?.map((objective, index) => (
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
      case "process":
        return (
          <AppText variant="bodyLg" className="text-neutral-textDark leading-6">
            {program.process}
          </AppText>
        );
      case "support":
        return (
          <AppText variant="bodyLg" className="text-neutral-textDark leading-6">
            {program.supportContact}
          </AppText>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
          {program.title}
        </AppText>
      </View>

      {/* Hero Image */}
      {program.heroImageUrl && (
        <Image
          source={{ uri: program.heroImageUrl }}
          className="w-full h-48"
          resizeMode="cover"
        />
      )}

      {/* Program Title & Description */}
      <View className="px-4 py-6">
        <AppText variant="h1" className="text-neutral-textDark mb-4">
          {program.title}
        </AppText>
        <AppText variant="bodyLg" className="text-neutral-textMedium leading-6">
          {program.description}
        </AppText>
      </View>

      {/* Segmented Content Tabs - Pill Style */}
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#F3F4F6",
            borderRadius: 25,
            padding: 4,
          }}
        >
          {[
            { key: "overview", label: t("programReader.tabs.overview") },
            { key: "process", label: t("programReader.tabs.process") },
            { key: "support", label: t("programReader.tabs.support") },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 22,
                backgroundColor: activeTab === tab.key ? "#386641" : "transparent",
              }}
            >
              <AppText
                variant="bodyMd"
                style={{
                  textAlign: "center",
                  color: activeTab === tab.key ? "#FFFFFF" : "#6B7280",
                  fontWeight: activeTab === tab.key ? "600" : "500",
                  fontSize: 14,
                }}
              >
                {tab.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        {/* Tab Content */}
        <Card className="mt-4 p-4">{renderTabContent()}</Card>
      </View>
      </ScrollView>

      {/* Fixed Apply Now CTA */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingBottom: 24,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Button
          label={t("programReader.applyNow")}
          variant="primary"
          size="lg"
          onPress={handleApplyNow}
          className="w-full"
        />
      </View>
    </View>
  );
};

export default ProgramDetails;
