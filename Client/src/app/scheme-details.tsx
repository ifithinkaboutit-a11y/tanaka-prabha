// src/app/scheme-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Image, Linking, Pressable, ScrollView, View } from "react-native";
import AppText from "../components/atoms/AppText";
import { DetailPageSkeleton } from "../components/atoms/Skeleton";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import ExpandableText from "../components/atoms/ExpandableText";
import { schemesApi, Scheme } from "@/services/apiService";
import { useTranslation } from "../i18n";
import { useLanguageStore } from "../stores/languageStore";
import { useInterest } from "../hooks/useInterest";
import { theme } from "@/styles/colors";

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
  const { currentLanguage } = useLanguageStore();
  const { isInterested, interestCount, toggleInterest, loading: interestLoading } = useInterest(
    schemeId ?? "",
    scheme?.interestCount ?? 0
  );

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
      <View style={{ flex: 1, backgroundColor: theme.background.header }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: theme.background.header, borderBottomWidth: 1, borderBottomColor: theme.background.screen }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
          </Pressable>
          <View style={{ width: 160, height: 20, borderRadius: 6, backgroundColor: theme.border.subtle }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <DetailPageSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (!scheme) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background.card, alignItems: "center", justifyContent: "center" }}>
        <AppText variant="h2" style={{ color: theme.text.dark, marginBottom: 16 }}>
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
    const overviewText = currentLanguage === 'hi' && scheme.overviewHi ? scheme.overviewHi : scheme.overview;
    const processText = currentLanguage === 'hi' && scheme.processHi ? scheme.processHi : scheme.process;
    const keyObjectives = currentLanguage === 'hi' && scheme.keyObjectivesHi ? scheme.keyObjectivesHi : scheme.keyObjectives;
    // eligibility comes from the DB as a plain text string — convert to an array of lines
    const eligibilityRaw = currentLanguage === 'hi' && scheme.eligibilityHi ? scheme.eligibilityHi : scheme.eligibility;
    const eligibility: string[] = Array.isArray(eligibilityRaw)
      ? eligibilityRaw
      : typeof eligibilityRaw === 'string' && eligibilityRaw.trim()
        ? eligibilityRaw.split(/\n|(?<=\.)\s+(?=[A-Z])/).map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
        : [];

    switch (activeTab) {
      case "overview":
        return (
          <View>
            <AppText
              variant="bodyLg"
              style={{ color: theme.text.dark, marginBottom: 24, lineHeight: 24 }}
            >
              {overviewText}
            </AppText>

            {/* Key Objectives */}
            <AppText variant="h3" style={{ color: theme.text.dark, marginBottom: 16 }}>
              {t("programReader.keyObjectives")}
            </AppText>
            <View style={{ marginBottom: 24 }}>
              {keyObjectives?.map((objective: string, index: number) => (
                <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
                  <AppText variant="bodyMd" style={{ color: theme.text.dark, marginRight: 8 }}>
                    •
                  </AppText>
                  <AppText variant="bodyMd" style={{ color: theme.text.dark, flex: 1 }}>
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
            <AppText variant="h3" style={{ color: theme.text.dark, marginBottom: 12 }}>
              {t("schemesPage.eligibility")}
            </AppText>
            <View style={{ marginBottom: 24 }}>
              {eligibility?.map((criterion: string, index: number) => (
                <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
                  <AppText variant="bodyMd" style={{ color: theme.text.dark, marginRight: 8 }}>
                    •
                  </AppText>
                  <AppText variant="bodyMd" style={{ color: theme.text.dark, flex: 1 }}>
                    {criterion}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        );
      case "process":
        return (
          <AppText variant="bodyLg" style={{ color: theme.text.dark, lineHeight: 24 }}>
            {processText}
          </AppText>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background.header }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Navigation Header */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 52,
          paddingBottom: 16,
          paddingHorizontal: 16,
          backgroundColor: theme.background.header,
          borderBottomWidth: 1,
          borderBottomColor: theme.background.screen,
        }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({
            marginRight: 16,
            padding: 8,
            borderRadius: 20,
            backgroundColor: pressed ? theme.background.screen : "transparent"
          })}>
            <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
          </Pressable>
          <AppText
            variant="h3"
            style={{ color: theme.text.primary, flex: 1, fontWeight: "700", fontSize: 20, letterSpacing: -0.2 }}
            numberOfLines={1}
          >
            {t("schemesPage.schemeDetails")}
          </AppText>
        </View>

        {/* Hero Image */}
        {scheme.heroImageUrl && (
          <Image
            source={{ uri: scheme.heroImageUrl }}
            style={{ width: "100%", height: 208 }}
            resizeMode="cover"
          />
        )}

        {/* Scheme Title & Description */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
          <View style={{ marginBottom: 12 }}>
            <AppText variant="h2" style={{ color: theme.text.primary, fontWeight: "800", fontSize: 24, letterSpacing: -0.5, lineHeight: 32 }}>
              {currentLanguage === 'hi' && scheme.titleHi ? scheme.titleHi : scheme.title}
            </AppText>
          </View>
          <ExpandableText
            text={(currentLanguage === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description) ?? ""}
            style={{ color: theme.text.subtle, lineHeight: 24, fontSize: 15 }}
            wordLimit={100}
          />
        </View>

        {/* Segmented Tab Buttons */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", backgroundColor: theme.background.screen, borderRadius: 12, padding: 4 }}>
            {[
              { key: "overview", label: t("programReader.tabs.overview") },
              { key: "eligibility", label: t("schemesPage.eligibility") },
              { key: "process", label: t("programReader.tabs.process") },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: "center",
                  borderRadius: 10,
                  backgroundColor: activeTab === tab.key ? theme.background.input : "transparent",
                  shadowColor: activeTab === tab.key ? "#000" : "transparent",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: activeTab === tab.key ? 0.05 : 0,
                  shadowRadius: 2,
                  elevation: activeTab === tab.key ? 2 : 0,
                }}
              >
                <AppText
                  variant="bodyMd"
                  style={{
                    fontWeight: activeTab === tab.key ? "700" : "500",
                    color: activeTab === tab.key ? theme.text.primary : theme.text.muted,
                    fontSize: 14,
                  }}
                >
                  {tab.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>{renderTabContent()}</View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: theme.background.header,
        borderTopWidth: 1,
        borderTopColor: theme.background.screen,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
      }}>
        {/* Interested / Remove Interest toggle */}
        <Button
          label={isInterested ? t("interested.interested") : t("interested.notInterested")}
          variant={isInterested ? "primary" : "outline"}
          onPress={toggleInterest}
          disabled={interestLoading}
          style={{ width: "100%", borderRadius: 16, marginBottom: 12 }}
        />
        {/* Apply Now — opens external URL */}
        <Button
          label={t("programReader.applyNow")}
          variant="primary"
          size="lg"
          onPress={handleApplyNow}
          style={{ width: "100%", borderRadius: 16, backgroundColor: theme.semantic.success }}
        />
      </View>
    </View>
  );
};

export default SchemeDetailsScreen;
