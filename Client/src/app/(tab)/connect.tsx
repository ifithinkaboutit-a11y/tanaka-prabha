import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import AppText from "../../components/atoms/AppText";
import QuickActionGrid from "../../components/molecules/QuickActionGrid";
import { useTranslation } from "../../i18n";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { theme } from "@/styles/colors";

const HELPLINE_NUMBER = "tel:1800180111";
const AFTER_HOURS = 18; // 6:00 PM

/** Returns true if current local hour >= 18 (6 PM) */
function isAfterHours(): boolean {
  return new Date().getHours() >= AFTER_HOURS;
}

/** Format a Date as "DD/MM/YYYY HH:MM" */
function formatDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
    if (!isAfterHours()) {
      // Before 6 PM — direct call
      Linking.openURL(HELPLINE_NUMBER);
      return;
    }
    // After 6 PM — show reason modal before sending email
    setReason("");
    setModalVisible(true);
  };

  const handleSendEmail = async () => {
    const now = new Date();
    const timestamp = formatDateTime(now);

    const beneficiaryId = profile?.id ?? "N/A";
    const userName = profile?.name ?? "N/A";
    const mobile = profile?.mobileNumber ?? "N/A";
    const location = [profile?.village, profile?.district, profile?.state]
      .filter(Boolean)
      .join(", ") || "N/A";

    const subject = encodeURIComponent(
      `[SOS After-Hours] Emergency Request — ${userName} — ${timestamp}`
    );

    const body = encodeURIComponent(
      `EMERGENCY CONTACT REQUEST\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Beneficiary ID : ${beneficiaryId}\n` +
      `Name           : ${userName}\n` +
      `Mobile Number  : ${mobile}\n` +
      `Location       : ${location}\n` +
      `Time of Request: ${timestamp}\n\n` +
      `Reason / Description:\n${reason.trim() || "(No reason provided)"}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `This message was sent automatically from the TanakPrabha app.\n`
    );

    const mailtoUrl = `mailto:ifithinkaboutit@gmail.com?subject=${subject}&body=${body}`;

    setModalVisible(false);

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (!supported) {
        Alert.alert(
          t("common.error"),
          `${t("connect.sosEmailError")}`
        );
        return;
      }
      await Linking.openURL(mailtoUrl);
      Alert.alert(t("connect.sosEmailSent"), t("connect.sosEmailSentMessage"));
    } catch {
      Alert.alert(
        t("common.error"),
        `${t("connect.sosEmailError")}`
      );
    }
  };

  const handleCallAnyway = () => {
    setModalVisible(false);
    Linking.openURL(HELPLINE_NUMBER);
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
        {/* Header */}
        <View
          style={{
            paddingTop: 48,
            paddingBottom: 24,
            paddingHorizontal: 20,
            backgroundColor: theme.primary.green,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <AppText variant="h2" style={{ fontWeight: "800", color: theme.text.onPrimary, fontSize: 28 }}>
                {t("connect.title")}
              </AppText>
              <AppText variant="bodySm" style={{ color: "rgba(255,255,255,0.85)", marginTop: 4, fontSize: 14 }}>
                {t("connect.subtitle")}
              </AppText>
            </View>
            <Pressable
              onPress={() => router.push("/my-schedule" as any)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
                marginTop: 4,
              }}
            >
              <Ionicons name="calendar-outline" size={16} color={theme.text.onPrimary} />
              <AppText variant="bodySm" style={{ color: theme.text.onPrimary, fontWeight: "600", fontSize: 12, marginLeft: 6 }}>
                {t("connect.mySchedule")}
              </AppText>
            </Pressable>
          </View>
        </View>

        {/* What do you need help with? */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <AppText variant="h3" style={{ fontWeight: "700", color: theme.text.secondary, marginBottom: 16, fontSize: 18 }}>
            {t("connect.whatHelpWith")}
          </AppText>
          <QuickActionGrid actions={serviceActions} />
        </View>

        {/* Emergency / SOS */}
        <View
          style={{
            marginHorizontal: 10,
            marginTop: 34,
            backgroundColor: theme.semantic.errorBackground,
            borderRadius: 20,
            padding: 20,
            minHeight: 340,
            borderWidth: 1,
            borderColor: theme.semantic.likeSubtle,
          }}
          className="flex items-center"
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Ionicons name="alert-circle" size={24} color={theme.semantic.like} />
            <AppText variant="h3" style={{ fontWeight: "700", color: theme.semantic.like, marginLeft: 8, fontSize: 18 }}>
              {t("connect.emergencyTitle")}
            </AppText>
          </View>

          <AppText variant="bodySm" style={{ color: theme.semantic.errorDark, marginBottom: 4, textAlign: "center", fontSize: 13 }}>
            {t("connect.emergencySubtitle")}
          </AppText>

          {/* SOS Button — always shows call icon; logic handled in onPress */}
          <View
            style={{ alignItems: "center", justifyContent: "center", marginTop: 16, marginBottom: 8 }}
            className="flex items-center justify-center py-10"
          >
            {/* Outer Ring */}
            <View style={s.ringOuter} />
            {/* Inner Ring */}
            <View style={s.ringInner} />
            {/* Main Button */}
            <Pressable
              onPress={handleEmergencyPress}
              style={({ pressed }) => [s.sosBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
              accessibilityRole="button"
              accessibilityLabel={t("connect.emergencyTitle")}
            >
              <Ionicons
                name="call"
                size={52}
                color="white"
              />
            </Pressable>
          </View>

          <AppText variant="bodySm" style={{ color: theme.semantic.errorDeep, marginTop: 16, fontWeight: "600", fontSize: 13 }}>
            {t("connect.tapToCall")}
          </AppText>
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
        <Pressable style={s.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            {/* Handle */}
            <View style={s.handle} />

            {/* Header */}
            <View style={s.sheetHeader}>
              <View style={s.sheetIconBg}>
                <Ionicons name="mail" size={22} color="#DC2626" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="h3" style={{ fontWeight: "700", color: "#1F2937", fontSize: 17 }}>
                  {t("connect.sosAfterHoursTitle")}
                </AppText>
                <AppText variant="bodySm" style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>
                  {t("connect.sosAfterHoursMessage")}
                </AppText>
              </View>
            </View>

            {/* Pre-filled user info preview */}
            <View style={s.infoCard}>
              <InfoLine icon="person-outline" label="Name" value={profile?.name ?? "—"} />
              <InfoLine icon="call-outline" label="Mobile" value={profile?.mobileNumber ?? "—"} />
              <InfoLine icon="id-card-outline" label="Beneficiary ID" value={profile?.id ?? "—"} />
              <InfoLine
                icon="location-outline"
                label="Location"
                value={[profile?.village, profile?.district].filter(Boolean).join(", ") || "—"}
                isLast
              />
            </View>

            {/* Reason input */}
            <AppText variant="bodySm" style={s.reasonLabel}>
              {t("connect.sosReasonTitle")}
            </AppText>
            <TextInput
              style={[s.reasonInput, reasonFocused && s.reasonInputFocused]}
              value={reason}
              onChangeText={setReason}
              placeholder={t("connect.sosReasonPlaceholder")}
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onFocus={() => setReasonFocused(true)}
              onBlur={() => setReasonFocused(false)}
            />

            {/* Actions */}
            <View style={s.btnRow}>
              <Pressable
                onPress={handleCallAnyway}
                style={({ pressed }) => [s.btnSecondary, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="call-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
                <AppText variant="bodySm" style={{ color: "#374151", fontWeight: "600", fontSize: 14 }}>
                  {t("connect.sosCallInstead")}
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleSendEmail}
                style={({ pressed }) => [s.btnPrimary, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="mail-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <AppText variant="bodySm" style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>
                  {t("connect.sosSendEmail")}
                </AppText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
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
    <Ionicons name={icon} size={14} color="#6B7280" style={{ marginRight: 8 }} />
    <AppText variant="bodySm" style={il.label}>{label}</AppText>
    <AppText variant="bodySm" style={il.value} numberOfLines={1}>{value}</AppText>
  </View>
);

const il = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F3F4F6" },
  label: { color: "#6B7280", fontSize: 12, width: 90 },
  value: { flex: 1, color: "#1F2937", fontSize: 13, fontWeight: "600", textAlign: "right" },
});

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // SOS button rings
  ringOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(220, 38, 38, 0.15)",
    alignSelf: "center",
  },
  ringInner: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(220, 38, 38, 0.25)",
    alignSelf: "center",
  },
  sosBtn: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.semantic.like,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.semantic.like,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    alignSelf: "center",
  },

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
    backgroundColor: "#E5E7EB",
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
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  // Info card
  infoCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },

  // Reason input
  reasonLabel: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 8,
  },
  reasonInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
    minHeight: 80,
    marginBottom: 20,
  },
  reasonInputFocused: {
    borderColor: "#DC2626",
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
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  btnPrimary: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#DC2626",
  },
});
