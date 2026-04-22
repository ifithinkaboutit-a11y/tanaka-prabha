import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

const HELPLINE_EMAIL = "support@example.com"; // replace with real address
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
    const emergencyNumber = "tel:1800180111";
    Linking.openURL(emergencyNumber);
  };

  // ── After-hours modal handlers ────────────────────────────────────────────
  const handleCallAnyway = () => {
    setModalVisible(false);
    Linking.openURL("tel:1800180111");
  };

  const handleSendEmail = () => {
    const name = profile?.name ?? "Unknown";
    const mobile = profile?.mobileNumber ?? "Unknown";
    const id = profile?.id ?? "Unknown";
    const location = [profile?.village, profile?.district].filter(Boolean).join(", ") || "Unknown";
    const body = encodeURIComponent(
      `Name: ${name}\nMobile: ${mobile}\nBeneficiary ID: ${id}\nLocation: ${location}\n\nReason:\n${reason}`
    );
    const subject = encodeURIComponent("SOS After-Hours Support Request");
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
            backgroundColor: theme.background.header,
            paddingTop: 52,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
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
              color: theme.text.primary,
              letterSpacing: -0.5,
            }}
          >
            {t("connect.title")}
          </AppText>
          <AppText
            variant="bodySm"
            style={{ color: theme.text.muted, marginTop: 4, fontSize: 13 }}
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

        {/* ── Emergency / Helpline section ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
          <AppText
            variant="h3"
            style={{
              fontWeight: "700",
              color: theme.text.secondary,
              marginBottom: 6,
              fontSize: 18,
            }}
          >
            {t("connect.emergencyTitle")}
          </AppText>
          <AppText
            variant="bodySm"
            style={{
              color: theme.text.muted,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {t("connect.emergencySubtitle")}
          </AppText>

          {/* Emergency Button */}
          <Pressable
            onPress={afterHours ? () => setModalVisible(true) : handleEmergencyPress}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 16,
              backgroundColor: pressed ? theme.background.neutralSubtle ?? "#F5F5F5" : "#FFFFFF",
              borderWidth: 1.5,
              borderColor: "#FEE2E2",
            })}
          >
            <View
              style={{
                backgroundColor: "#FEF2F2",
                padding: 10,
                borderRadius: 12,
                marginRight: 16,
              }}
            >
              <Ionicons name="call" size={20} color="#DC2626" />
            </View>

            <View style={{ flex: 1 }}>
              <AppText style={{ color: "#111827", fontWeight: "700", fontSize: 16 }}>
                24/7 Helpline
              </AppText>
              <AppText
                style={{
                  color: theme.text.muted,
                  fontWeight: "500",
                  fontSize: 12,
                  marginTop: 1,
                }}
              >
                {t("connect.tapToCall")}
              </AppText>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </Pressable>
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
