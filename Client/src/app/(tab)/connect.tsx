import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Constants from "expo-constants";
import AppText from "../../components/atoms/AppText";
import QuickActionGrid from "../../components/molecules/QuickActionGrid";
import { useTranslation } from "../../i18n";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { auditLogApi } from "../../services/apiService";
import { theme } from "@/styles/colors";

const HELPLINE_EMAIL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SOS_EMAIL || "ifithinkaboutit@gmail.com";
const HELPLINE_PHONE = Constants.expoConfig?.extra?.EXPO_PUBLIC_SOS_PHONE || "7355045954";
const AFTER_HOURS = 18; // 6:00 PM

/** Returns true if current local hour >= 18 (6 PM) */
function isAfterHours(): boolean {
  return new Date().getHours() >= AFTER_HOURS;
}

export default function Connect() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile } = useUserProfile();

  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonFocused, setReasonFocused] = useState(false);

  // ── SOS button handler ────────────────────────────────────────────────────
  const handleEmergencyPress = () => {
    console.log("[TRACKING]: SOS/Emergency button clicked by user at", new Date().toISOString());
    // Audit log: track SOS trigger
    auditLogApi.logEvent("sos_trigger", undefined, {
      type: "call",
      timestamp: new Date().toISOString(),
      userId: profile?.id,
    });
    const emergencyNumber = `tel:${HELPLINE_PHONE}`;
    Linking.openURL(emergencyNumber);
  };

  // ── After-hours modal handlers ────────────────────────────────────────────
  const handleCallAnyway = () => {
    setModalVisible(false);
    Linking.openURL(`tel:${HELPLINE_PHONE}`);
  };

  const handleSendEmail = () => {
    const name = profile?.name ?? "Unknown";
    const mobile = profile?.mobileNumber ?? "Unknown";
    const id = profile?.id ?? "Unknown";
    const location = [profile?.village, profile?.district].filter(Boolean).join(", ") || "Unknown";
    const body = encodeURIComponent(
      `Name: ${name}\nMobile: ${mobile}\nFarmer ID: ${id}\nLocation: ${location}\n\nReason:\n${reason}`
    );
    const subject = encodeURIComponent("SOS After-Hours Support Request");
    // Audit log: track SOS email trigger
    auditLogApi.logEvent("sos_email", undefined, {
      type: "email",
      reason: reason || "(no reason provided)",
      timestamp: new Date().toISOString(),
      userId: profile?.id,
    });
    Linking.openURL(`mailto:${HELPLINE_EMAIL}?subject=${subject}&body=${body}`);
    setModalVisible(false);
  };

  // ── Service grid ──────────────────────────────────────────────────────────
  const serviceActions = [
    {
      title: t("connect.services.trainingGuidance"),
      icon: "leaf-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#16A34A",
      bgColor: "#DCFCE7",
      onPress: () =>
        router.push({ pathname: "/connect-listing", params: { category: "agricultural" } } as any),
    },
    {
      title: t("connect.services.livestockVeterinary"),
      icon: "paw-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#D97706",
      bgColor: "#FEF3C7",
      onPress: () =>
        router.push({ pathname: "/connect-listing", params: { category: "veterinary" } } as any),
    },
    {
      title: t("connect.services.marketBuyers"),
      icon: "storefront-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#DB2777",
      bgColor: "#FCE7F3",
      onPress: () =>
        router.push({ pathname: "/connect-listing", params: { category: "financial" } } as any),
    },
    {
      title: t("connect.services.governmentSchemes"),
      icon: "business-outline" as keyof typeof Ionicons.glyphMap,
      iconColor: "#2563EB",
      bgColor: "#DBEAFE",
      onPress: () =>
        router.push({ pathname: "/connect-listing", params: { category: "doctor" } } as any),
    },
  ];

  const afterHours = isAfterHours();

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background.screen }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View
          style={{
            backgroundColor: theme.primary.green,
            paddingTop: 52,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: theme.primary.green,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 4,
            marginBottom: 16,
          }}
        >
          <AppText
            variant="h2"
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: theme.text.onPrimary,
              letterSpacing: -0.5,
            }}
          >
            {t("connect.title")}
          </AppText>
          <AppText
            variant="bodySm"
            style={{ color: "rgba(255,255,255,0.85)", marginTop: 4, fontSize: 13 }}
          >
            {t("connect.subtitle")}
          </AppText>
        </View>

        {/* ── Services 2×2 Grid ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <AppText
            variant="h3"
            style={{
              fontWeight: "700",
              color: theme.text.secondary,
              marginBottom: 16,
              fontSize: 18,
            }}
          >
            {t("connect.whatHelpWith")}
          </AppText>
          <QuickActionGrid actions={serviceActions} />
        </View>

        <View className="flex-col md:flex-row gap-4 px-5 py-6 w-full">

          {/* ── Emergency / Helpline section ── */}
          <View className="w-full md:w-1/2">
            <AppText
              variant="h3"
              className="font-bold text-lg mb-1.5"
              style={{ color: theme.text.secondary }}
            >
              {t("connect.emergencyTitle")}
            </AppText>

            <AppText
              variant="bodySm"
              className="mb-4 text-[13px]"
              style={{ color: theme.text.muted }}
            >
              {t("connect.emergencySubtitle")}
            </AppText>

            <Pressable
              onPress={afterHours ? () => setModalVisible(true) : handleEmergencyPress}
              className={`
                flex-row items-center
                p-4 my-4 rounded-lg border
                bg-red-600 border-red-800
                active:bg-red-800
                min-h-[80px]
              `}
              accessibilityRole="button"
              accessibilityLabel={t("connect.emergencyA11yLabel")}
              accessibilityHint={t("connect.emergencyA11yHint")}
            >
              <View
                className="w-14 h-14 rounded-2xl bg-white/30 items-center justify-center mr-4"
              >
                <Ionicons name="call" size={28} color={theme.text.onPrimary} />
              </View>

              <View className="flex-1">
                <AppText className="font-bold text-xl" style={{ color: theme.text.onPrimary }}>
                  {t("connect.emergencyTitle")}
                </AppText>
                <AppText
                  className="text-white font-medium text-sm mt-0.5"
                  style={{ color: theme.text.onPrimary }}
                >
                  {t("connect.tapToCall")}
                </AppText>
              </View>

              <Ionicons name="chevron-forward" size={22} color={theme.text.onPrimary} />
            </Pressable>
          </View>

          {/* ── My Schedule section ── */}
          <View className="w-full md:w-1/2">
            <AppText
              variant="h3"
              className="font-bold text-lg mb-1.5"
              style={{ color: theme.text.secondary }}
            >
              {t("connect.mySchedule")}
            </AppText>

            <AppText
              variant="bodySm"
              className="mb-4 text-[13px]"
              style={{ color: theme.text.muted }}
            >
              {t("connect.myScheduleSubtitle") || "View your upcoming appointments"}
            </AppText>

            <Pressable
              onPress={() => router.push("/my-schedule")}
              className={`
                flex-row items-center
                p-4 my-4 rounded-lg border
                bg-green-600 border-green-800
                active:bg-green-800
                min-h-[80px]
              `}
              accessibilityRole="button"
              accessibilityLabel={t("connect.myScheduleA11yLabel") || "My Schedule button"}
              accessibilityHint={t("connect.myScheduleA11yHint") || "Double tap to view your appointments"}
            >
              <View
                className="w-14 h-14 rounded-2xl bg-white/40 items-center justify-center mr-4"
              >
                <Ionicons name="calendar" size={28} color={theme.text.onPrimary} />
              </View>

              <View className="flex-1">
                <AppText className="font-bold text-xl" style={{ color: theme.text.onPrimary }}>
                  {t("connect.mySchedule")}
                </AppText>
                <AppText
                  className="text-white font-medium text-sm mt-0.5"
                  style={{ color: theme.text.onPrimary }}
                >
                  {t("connect.myScheduleTap")}
                </AppText>
              </View>

              <Ionicons name="chevron-forward" size={22} color={theme.text.onPrimary} />
            </Pressable>
          </View>

        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── After-hours reason modal ── */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <Pressable className="absolute inset-0" onPress={() => setModalVisible(false)} />

            <KeyboardAvoidingView
              behavior="padding"
              className="bg-white dark:bg-zinc-900 rounded-t-3xl px-5 pt-4 pb-8"
            >
              {/* Handle */}
              <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-zinc-700 self-center mb-5" />

              {/* Header */}
              <View className="flex-row items-start mb-5">
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center"
                  style={{ backgroundColor: theme.semantic.errorBackground }}
                >
                  <Ionicons name="mail" size={22} color={theme.semantic.error} />
                </View>

                <View className="flex-1 ml-3">
                  <AppText
                    variant="h3"
                    className="font-bold text-[17px]"
                    style={{ color: theme.text.primary }}
                  >
                    {t("connect.sosAfterHoursTitle")}
                  </AppText>
                  <AppText
                    variant="bodySm"
                    className="text-xs mt-0.5"
                    style={{ color: theme.text.muted }}
                  >
                    {t("connect.sosAfterHoursMessage")}
                  </AppText>
                </View>
              </View>

              {/* Pre-filled user info preview */}
              <View className="bg-gray-50 dark:bg-zinc-800 rounded-2xl px-4 py-1 mb-5">
                <InfoLine
                  icon="person-outline"
                  label={t("connect.sosNameLabel") || "Name"}
                  value={profile?.name ?? "—"}
                />
                <InfoLine
                  icon="call-outline"
                  label={t("connect.sosMobileLabel") || "Mobile"}
                  value={profile?.mobileNumber ?? "—"}
                />
                <InfoLine
                  icon="id-card-outline"
                  label={t("connect.sosFarmerIdLabel") || "Farmer ID"}
                  value={profile?.id ?? "—"}
                />
                <InfoLine
                  icon="location-outline"
                  label={t("connect.sosLocationLabel") || "Location"}
                  value={
                    [profile?.village, profile?.district].filter(Boolean).join(", ") || "—"
                  }
                  isLast
                />
              </View>

              {/* Reason input */}
              <AppText
                variant="bodySm"
                className="text-sm font-semibold mb-2"
                style={{ color: theme.text.primary }}
              >
                {t("connect.sosReasonTitle")}
              </AppText>
              <TextInput
                className={`
                  rounded-xl px-4 py-3 text-sm min-h-[88px]
                  border
                  ${reasonFocused
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                    : "border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800"
                  }
                `}
                value={reason}
                onChangeText={setReason}
                placeholder={t("connect.sosReasonPlaceholder")}
                placeholderTextColor={theme.text.placeholder}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit
                onFocus={() => setReasonFocused(true)}
                onBlur={() => setReasonFocused(false)}
                style={{ color: theme.text.primary }}
              />

              {/* Actions */}
              <View className="flex-row gap-3 mt-5">
                {/* Call anyway */}
                <Pressable
                  onPress={handleCallAnyway}
                  accessibilityRole="button"
                  accessibilityLabel={t("connect.sosCallInstead")}
                  className="flex-1 flex-row items-center justify-center
                    py-3.5 px-4 rounded-xl
                    border border-gray-200 dark:border-zinc-700
                    bg-white dark:bg-zinc-800
                    active:opacity-70"
                >
                  <Ionicons
                    name="call-outline"
                    size={16}
                    color={theme.text.secondary}
                    style={{ marginRight: 6 }}
                  />
                  <AppText
                    variant="bodySm"
                    className="font-semibold text-sm"
                    style={{ color: theme.text.secondary }}
                  >
                    {t("connect.sosCallInstead")}
                  </AppText>
                </Pressable>

                {/* Send email */}
                <Pressable
                  onPress={handleSendEmail}
                  disabled={!reason.trim()}
                  accessibilityRole="button"
                  accessibilityLabel={t("connect.sosSendEmail")}
                  accessibilityState={{ disabled: !reason.trim() }}
                  className={`
                    flex-1 flex-row items-center justify-center
                    py-3.5 px-4 rounded-xl
                    bg-red-600 active:bg-red-800
                    ${!reason.trim() ? "opacity-40" : "opacity-100"}
                  `}
                >
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={theme.text.onPrimary}
                    style={{ marginRight: 6 }}
                  />
                  <AppText
                    variant="bodySm"
                    className="font-bold text-sm"
                    style={{ color: theme.text.onPrimary }}
                  >
                    {t("connect.sosSendEmail")}
                  </AppText>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

    </>
  );
}

// ── Small helper component ────────────────────────────────────────────────────
const InfoLine = ({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <View style={[il.row, !isLast && il.rowBorder]}>
    <Ionicons name={icon} size={14} color={theme.text.subtle} style={{ marginRight: 8 }} />
    <AppText variant="bodySm" style={il.label}>{label}</AppText>
    <AppText variant="bodySm" style={il.value} numberOfLines={1}>{value}</AppText>
  </View>
);

const il = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border.default },
  label: { color: theme.text.muted, fontSize: 12, width: 90 },
  value: { flex: 1, color: theme.text.primary, fontSize: 13, fontWeight: "600", textAlign: "right" },
});

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border.subtle,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sheetIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // Info card
  infoCard: {
    backgroundColor: theme.background.neutralSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border.card,
  },

  // Reason input
  reasonLabel: {
    color: theme.text.secondary,
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 8,
  },
  reasonInput: {
    backgroundColor: theme.background.neutralSubtle,
    borderWidth: 1.5,
    borderColor: theme.border.default,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.text.primary,
    minHeight: 80,
    marginBottom: 20,
  },
  reasonInputFocused: {
    borderColor: theme.semantic.error,
    backgroundColor: "#FFFFFF",
  },

  // Buttons
  btnRow: {
    flexDirection: "row",
    gap: 12,
  },
  btnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.semantic.error,
    backgroundColor: theme.semantic.errorBackground,
  },
  btnPrimary: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.semantic.errorDark,
    backgroundColor: theme.semantic.error,
  },
});
