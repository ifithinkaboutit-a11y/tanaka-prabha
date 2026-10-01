// src/app/about.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import AppText from "../components/atoms/AppText";
import { useTranslation } from "../i18n";
import { theme } from "../styles/colors";

const Section = ({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) => (
  <View style={{ marginBottom: 20 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <Ionicons name={icon} size={18} color={theme.primary.green} />
      <AppText variant="h3" style={{ color: theme.text.secondary, fontWeight: "700", fontSize: 15 }}>
        {title}
      </AppText>
    </View>
    {children}
  </View>
);

const About = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background.screen }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 48,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border.subtle,
          backgroundColor: theme.background.header,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={theme.text.secondary} />
        </TouchableOpacity>
        <AppText variant="h3" style={{ color: theme.text.secondary, fontWeight: "700", fontSize: 18 }}>
          {t("about.title") || "About & Disclaimer"}
        </AppText>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Non-government notice — kept visually distinct so it reads as an official disclosure */}
        <View
          style={{
            backgroundColor: theme.background.warningSubtle,
            borderWidth: 1,
            borderColor: "#FDE68A",
            borderRadius: 14,
            padding: 16,
            marginBottom: 24,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Ionicons name="alert-circle" size={20} color="#B45309" />
          <AppText
            variant="bodySm"
            style={{ color: "#92400E", fontSize: 13, lineHeight: 19, flex: 1 }}
          >
            {t("about.disclaimerBanner")}
          </AppText>
        </View>

        <Section icon="information-circle-outline" title={t("about.whatIsTitle")}>
          <AppText variant="bodySm" style={{ color: theme.text.muted, fontSize: 13.5, lineHeight: 20 }}>
            {t("about.whatIsBody")}
          </AppText>
        </Section>

        <Section icon="shield-checkmark-outline" title={t("about.sourcesTitle")}>
          <AppText variant="bodySm" style={{ color: theme.text.muted, fontSize: 13.5, lineHeight: 20 }}>
            {t("about.sourcesBody")}
          </AppText>
        </Section>

        <Section icon="mail-outline" title={t("about.contactTitle")}>
          <AppText variant="bodySm" style={{ color: theme.text.muted, fontSize: 13.5, lineHeight: 20 }}>
            {t("about.contactBody")}
          </AppText>
        </Section>
      </ScrollView>
    </View>
  );
};

export default About;
