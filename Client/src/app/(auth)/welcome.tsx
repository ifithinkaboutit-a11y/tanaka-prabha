// src/app/(auth)/welcome.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import AuthVideoBackground from "@/components/molecules/AuthVideoBackground";
import { useTranslation } from "@/i18n";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, Text, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleSignUp = () => {
    // New user — phone-input in signup mode
    router.push({ pathname: "/(auth)/phone-input", params: { mode: "signup" } } as any);
  };

  const handleLogin = () => {
    // Returning user — phone-input in login mode
    router.push({ pathname: "/(auth)/phone-input", params: { mode: "login" } } as any);
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        {/* Image Background fills top, card overlaps it */}
        <View style={s.videoBg}>
          <AuthVideoBackground />
        </View>

        {/* Bottom card overlay */}
        <View style={s.card}>
          {/* Decorative Icon */}
          <View style={s.iconCircle}>
            <Ionicons name="leaf-outline" size={28} color="#386641" />
          </View>

          {/* Title */}
          <AppText variant="h2" style={s.title}>
            {t("auth.welcomeTitle") || "Kisan Mitra"}
          </AppText>

          {/* Subtitle */}
          <Text style={s.subtitle}>
            {t("auth.welcomeDescription") || "Your digital partner for modern agriculture and government schemes."}
          </Text>

          {/* Sign Up Button (primary) */}
          <Button
            label={t("auth.signUp") || "Create Account"}
            variant="primary"
            onPress={handleSignUp}
            style={s.btn}
          >
            <View style={s.btnRow}>
              <Text style={s.btnTextPrimary}>{t("auth.signUp") || "Create Account"}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </View>
          </Button>

          {/* Login Button (outline) */}
          <Button
            label={t("auth.loginWithPhone") || "Log In"}
            variant="outline"
            onPress={handleLogin}
            style={s.btnOutlined}
          >
            <View style={s.btnRow}>
              <Text style={s.btnTextOutline}>{t("auth.loginWithPhone") || "Log In"}</Text>
            </View>
          </Button>

          {/* Admin Login Link */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/admin-login" as any)}
            style={s.adminLink}
          >
            <Ionicons name="shield-checkmark-outline" size={14} color="#6B7280" />
            <Text style={s.adminText}>Admin Portal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  videoBg: {
    // Gives the image section a defined height; card overlaps via negative marginTop
    // We make it slightly taller than the others since welcome screen has less content
    height: 600,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
    marginTop: -32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
    alignItems: "center",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(56, 102, 65, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 102, 65, 0.2)",
  },
  title: {
    textAlign: "center",
    color: "#111827",
    fontWeight: "700",
    fontSize: 26,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 15,
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  btn: {
    width: "100%",
    paddingVertical: 16,
    marginBottom: 16,
    borderRadius: 14,
  },
  btnOutlined: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 32,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnTextPrimary: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  btnTextOutline: {
    color: "#386641",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  adminLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  adminText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
});