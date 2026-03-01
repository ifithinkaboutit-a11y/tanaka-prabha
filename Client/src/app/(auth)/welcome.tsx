// src/app/(auth)/welcome.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import MediaPath from "@/constants/MediaPath";
import { useTranslation } from "@/i18n";
import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, TouchableOpacity, Text, View } from "react-native";

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
      {/* Full-screen background image */}
      <ImageBackground
        source={MediaPath.images.authBgImage}
        style={s.bgImage}
        resizeMode="cover"
      >
        <View style={s.overlay} />
      </ImageBackground>

      {/* Bottom card overlay */}
      <View style={s.card}>
        {/* Title */}
        <AppText variant="h2" style={s.title}>
          {t("auth.welcomeTitle")}
        </AppText>

        {/* Description */}
        <AppText variant="bodySm" style={s.description}>
          {t("auth.welcomeDescription")}
        </AppText>

        {/* Sign Up Button (primary) */}
        <Button
          label={t("auth.signUp") || "Create Account"}
          variant="primary"
          onPress={handleSignUp}
          style={{ width: "100%", paddingVertical: 16, marginBottom: 12 }}
        />

        {/* Login Button (outline) */}
        <Button
          label={t("auth.loginWithPhone") || "Log In"}
          variant="outline"
          onPress={handleLogin}
          style={{ width: "100%", paddingVertical: 16 }}
        />

        {/* Separator hint */}
        <TouchableOpacity onPress={handleLogin} style={s.hintRow}>
          <Text style={s.hintText}>
            {t("auth.alreadyHaveAccount") || "Already have an account? "}
            <Text style={s.hintLink}>{t("auth.login") || "Log In"}</Text>
          </Text>
        </TouchableOpacity>

        {/* Admin Login Link */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/admin-login" as any)}
          style={{ marginTop: 24, alignItems: "center" }}
        >
          <Text style={{ color: "#9E9E9E", fontSize: 13, textDecorationLine: "underline" }}>
            Admin Portal
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    textAlign: "center",
    color: "#212121",
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    textAlign: "center",
    color: "#616161",
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  hintRow: {
    marginTop: 16,
    alignItems: "center",
  },
  hintText: {
    textAlign: "center",
    color: "#9E9E9E",
    fontSize: 13,
  },
  hintLink: {
    color: "#386641",
    fontWeight: "600",
  },
});