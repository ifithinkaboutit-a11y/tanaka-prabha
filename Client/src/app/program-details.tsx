// src/app/program-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Image, Linking, Pressable, ScrollView, View } from "react-native";
import AppText from "../components/atoms/AppText";
import { DetailPageSkeleton } from "../components/atoms/Skeleton";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import InterestButton from "../components/atoms/InterestButton";
import { schemesApi, Scheme } from "@/services/apiService";
import { useTranslation } from "../i18n";
import { useInterest } from "../hooks/useInterest";
import { theme } from "@/styles/colors";

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
  const { isInterested, interestCount, toggleInterest, loading: interestLoading } = useInterest(
    programId ?? "",
    program?.interestCount ?? 0
  );

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
      <View style={{ flex: 1, backgroundColor: theme.background.screen }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: theme.background.header }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={theme.primary.green} />
          </Pressable>
          <View style={{ width: 140, height: 20, borderRadius: 6, backgroundColor: theme.border.subtle }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <DetailPageSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (!program) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background.card, alignItems: "center", justifyContent: "center" }}>
        <AppText variant="h2" style={{ color: theme.text.dark, marginBottom: 16 }}>
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

  const emptyStyle = { color: theme.text.placeholder, fontStyle: "italic" as const };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <View>
            {program.overview ? (
              <AppText
                variant="bodyLg"
                style={{ color: theme.text.dark, marginBottom: 24, lineHeight: 24 }}
              >
                {program.overview}
              </AppText>
            ) : (
              <AppText variant="bodyMd" style={{ ...emptyStyle, marginBottom: 24 }}>
                {t("schemesPage.noOverview") || "No overview information available."}
              </AppText>
            )}

            {/* Objectives / Benefits — the heading used to render with nothing
                under it whenever the program had no objectives saved. */}
            <AppText variant="h3" style={{ color: theme.text.dark, marginBottom: 16 }}>
              {t("programReader.keyObjectives")}
            </AppText>
            <View style={{ marginBottom: 24 }}>
              {program.keyObjectives?.length ? (
                program.keyObjectives.map((objective, index) => (
                  <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
                    <AppText variant="bodyMd" style={{ color: theme.text.dark, marginRight: 8 }}>
                      •
                    </AppText>
                    <AppText variant="bodyMd" style={{ color: theme.text.dark, flex: 1 }}>
                      {objective}
                    </AppText>
                  </View>
                ))
              ) : (
                <AppText variant="bodyMd" style={emptyStyle}>
                  {t("schemesPage.noKeyObjectives") || "No objectives listed."}
                </AppText>
              )}
            </View>
          </View>
        );
      case "process":
        return program.process ? (
          <AppText variant="bodyLg" style={{ color: theme.text.dark, lineHeight: 24 }}>
            {program.process}
          </AppText>
        ) : (
          <AppText variant="bodyMd" style={emptyStyle}>
            {t("schemesPage.noProcess") || "No process/procedure information available."}
          </AppText>
        );
      case "support":
        return program.supportContact ? (
          <AppText variant="bodyLg" style={{ color: theme.text.dark, lineHeight: 24 }}>
            {program.supportContact}
          </AppText>
        ) : (
          <AppText variant="bodyMd" style={emptyStyle}>
            {t("schemesPage.noSupport") || "No support contact available."}
          </AppText>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background.screen }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Navigation Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: theme.background.header }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={theme.primary.green} />
          </Pressable>
          <AppText
            variant="h2"
            style={{ color: theme.text.dark, flex: 1 }}
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
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <AppText variant="h1" style={{ color: theme.text.dark, flex: 1, marginRight: 12 }}>
              {program.title}
            </AppText>
            <InterestButton
              isInterested={isInterested}
              count={interestCount}
              onToggle={toggleInterest}
              loading={interestLoading}
            />
          </View>
          <AppText variant="bodyLg" style={{ color: theme.text.medium, lineHeight: 24 }}>
            {program.description}
          </AppText>
        </View>

        {/* Segmented Content Tabs - Pill Style */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: theme.background.screen,
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
                  backgroundColor: activeTab === tab.key ? theme.primary.green : "transparent",
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
          backgroundColor: theme.background.header,
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingBottom: 24,
          borderTopWidth: 1,
          borderTopColor: theme.border.subtle,
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
