// src/app/scheme-details.tsx
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
      <View style={{ flex: 1, backgroundColor: "#F6F6F6", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#386641" />
      </View>
    );
  }

  if (!scheme) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F6F6", alignItems: "center", justifyContent: "center" }}>
        <AppText variant="h2" style={{ color: "#212121", marginBottom: 16 }}>
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
              style={{ color: "#212121", marginBottom: 24, lineHeight: 24 }}
            >
              {scheme.overview}
            </AppText>

            {/* Key Objectives */}
            <AppText variant="h3" style={{ color: "#212121", marginBottom: 16 }}>
              {t("programReader.keyObjectives")}
            </AppText>
            <View style={{ marginBottom: 24 }}>
              {scheme.keyObjectives?.map((objective: string, index: number) => (
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
      case "eligibility":
        return (
          <View>
            <AppText variant="h3" style={{ color: "#212121", marginBottom: 12 }}>
              {t("schemesPage.eligibility")}
            </AppText>
            <View style={{ marginBottom: 24 }}>
              {scheme.eligibility?.map((criterion: string, index: number) => (
                <View key={index} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
                  <AppText variant="bodyMd" style={{ color: "#212121", marginRight: 8 }}>
                    •
                  </AppText>
                  <AppText variant="bodyMd" style={{ color: "#212121", flex: 1 }}>
                    {criterion}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        );
      case "process":
        return (
          <AppText variant="bodyLg" style={{ color: "#212121", lineHeight: 24 }}>
            {scheme.process}
          </AppText>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Navigation Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: "#FFFFFF" }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16, padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#212121" />
          </Pressable>
          <AppText
            variant="h3"
            style={{ color: "#212121", flex: 1, fontWeight: "600" }}
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
        <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
          <AppText variant="h2" style={{ color: "#212121", marginBottom: 12, fontWeight: "700" }}>
            {scheme.title}
          </AppText>
          <AppText variant="bodyMd" style={{ color: "#616161", lineHeight: 24 }}>
            {scheme.description}{" "}
            <AppText variant="bodyMd" style={{ color: "#2196F3", fontWeight: "500" }}>
              Read more
            </AppText>
          </AppText>
        </View>

        {/* Segmented Tab Buttons */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: "row" }}>
            {[
              { key: "overview", label: t("programReader.tabs.overview") },
              { key: "eligibility", label: t("schemesPage.eligibility") },
              { key: "process", label: t("programReader.tabs.process") },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginRight: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  backgroundColor: activeTab === tab.key ? "#7F5539" : "#FFFFFF",
                  borderColor: activeTab === tab.key ? "#7F5539" : "#D9D9D9",
                }}
              >
                <AppText
                  variant="bodyMd"
                  style={{
                    fontWeight: "500",
                    color: activeTab === tab.key ? "#FFFFFF" : "#212121",
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

      {/* Fixed Apply Now Button */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#D9D9D9" }}>
        <Button
          label={t("programReader.applyNow")}
          variant="primary"
          size="lg"
          onPress={handleApplyNow}
          style={{ width: "100%", borderRadius: 999 }}
        />
      </View>
    </View>
  );
};

export default SchemeDetailsScreen;
