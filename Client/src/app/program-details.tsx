// src/app/program-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Image, Linking, Pressable, ScrollView, View } from "react-native";
import AppText from "../components/atoms/AppText";
import { DetailPageSkeleton } from "../components/atoms/Skeleton";
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
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: "#FFFFFF" }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#386641" />
          </Pressable>
          <View style={{ width: 140, height: 20, borderRadius: 6, backgroundColor: "#E5E7EB" }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <DetailPageSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (!program) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F6F6", alignItems: "center", justifyContent: "center" }}>
        <AppText variant="h2" style={{ color: "#212121", marginBottom: 16 }}>
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
              style={{ color: "#212121", marginBottom: 24, lineHeight: 24 }}
            >
              {program.overview}
            </AppText>

            {/* Key Objectives */}
            <AppText variant="h3" style={{ color: "#212121", marginBottom: 16 }}>
              {t("programReader.keyObjectives")}
            </AppText>
            <View style={{ marginBottom: 24 }}>
              {program.keyObjectives?.map((objective, index) => (
                <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
                  <AppText variant="bodyMd" style={{ color: "#212121", marginRight: 8 }}>
                    •
                  </AppText>
                  <AppText variant="bodyMd" style={{ color: "#212121", flex: 1 }}>
                    {objective}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        );
      case "process":
        return (
          <AppText variant="bodyLg" style={{ color: "#212121", lineHeight: 24 }}>
            {program.process}
          </AppText>
        );
      case "support":
        return (
          <AppText variant="bodyLg" style={{ color: "#212121", lineHeight: 24 }}>
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
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: "#FFFFFF" }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#386641" />
          </Pressable>
          <AppText
            variant="h2"
            style={{ color: "#212121", flex: 1 }}
            numberOfLines={1}
          >
            {program.title}
          </AppText>
        </View>

        {/* Hero Image */}
        {program.heroImageUrl && (
          <Image
            source={{ uri: program.heroImageUrl }}
            style={{ width: "100%", height: 192 }}
            resizeMode="cover"
          />
        )}

        {/* Program Title & Description */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
          <AppText variant="h1" style={{ color: "#212121", marginBottom: 16 }}>
            {program.title}
          </AppText>
          <AppText variant="bodyLg" style={{ color: "#616161", lineHeight: 24 }}>
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
          <Card style={{ marginTop: 16, padding: 16 }}>{renderTabContent()}</Card>
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
          style={{ width: "100%" }}
        />
      </View>
    </View>
  );
};

export default ProgramDetails;
