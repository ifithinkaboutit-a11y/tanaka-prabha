// src/app/(tab)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppText from "../../components/atoms/AppText";
import Button from "@/components/atoms/Button";
import Avatar from "../../components/atoms/Avatar";
import { useTranslation } from "../../i18n";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { useLanguageStore } from "../../stores/languageStore";
import TextArea from "@/components/atoms/TextArea";

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <View style={s.infoRow}>
    <View style={s.infoLeft}>
      <View style={[s.infoIconBox, accent && s.infoIconBoxAccent]}>
        <Ionicons name={icon} size={15} color={accent ? "#386641" : "#6B7280"} />
      </View>
      <Text style={s.infoLabel}>{label}</Text>
    </View>
    <Text style={[s.infoValue, accent && s.infoValueAccent]} numberOfLines={1}>
      {value || "—"}
    </Text>
  </View>
);

const SectionCard = ({
  title,
  icon,
  accentColor,
  onEdit,
  editLabel,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  onEdit?: () => void;
  editLabel?: string;
  children: React.ReactNode;
}) => (
  <View style={s.card}>
    <View style={s.cardHeader}>
      <View style={s.cardHeaderLeft}>
        <View style={[s.cardIconBg, { backgroundColor: accentColor + "18" }]}>
          <Ionicons name={icon} size={18} color={accentColor} />
        </View>
        <Text style={[s.cardTitle, { color: accentColor }]}>{title}</Text>
      </View>
      {onEdit && (
        <Button
          size="sm"
          variant="outline"
          onPress={onEdit}
          style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0", borderRadius: 20 }}
        >
          <Ionicons name="pencil-outline" size={13} color="#386641" style={{ marginRight: 6 }} />
          <Text style={{ color: "#386641", fontSize: 12, fontWeight: "600" }}>{editLabel || "Edit"}</Text>
        </Button>
      )}
    </View>
    <View style={s.cardBody}>{children}</View>
  </View>
);

const StatBadge = ({ value, label, icon }: { value: string; label: string; icon: keyof typeof Ionicons.glyphMap }) => (
  <View style={s.statBadge}>
    <Ionicons name={icon} size={18} color="rgba(255,255,255,0.8)" />
    <Text style={s.statBadgeValue}>{value || "—"}</Text>
    <Text style={s.statBadgeLabel}>{label}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const Profile = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const { profile, loading, refreshProfile } = useUserProfile();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: async () => {
          try { await signOut(); } catch (e) { console.error(e); }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const maskAadhaar = (a: string) => a.replace(/(\d{4})(\d{4})(\d{4})/, "XXXX XXXX $3");

  const totalAnimals =
    (profile?.livestockDetails?.cow || 0) +
    (profile?.livestockDetails?.buffalo || 0) +
    (profile?.livestockDetails?.goat || 0) +
    (profile?.livestockDetails?.sheep || 0) +
    (profile?.livestockDetails?.poultry || 0) +
    (profile?.livestockDetails?.others || 0);

  // ── Loading ──
  if (loading && !profile) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#386641" />
        <Text style={s.centerText}>{t("common.loading")}</Text>
      </View>
    );
  }

  // ── No profile ──
  if (!profile) {
    return (
      <View style={s.center}>
        <View style={s.emptyIcon}>
          <Ionicons name="person-outline" size={40} color="#9CA3AF" />
        </View>
        <Text style={s.centerText}>Could not load profile</Text>
        <Pressable onPress={onRefresh} style={s.retryBtn}>
          <Ionicons name="refresh-outline" size={16} color="#fff" />
          <Text style={s.retryBtnText}>{t("common.retry")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#386641"]} tintColor="#386641" />
      }
    >
      {/* ── Hero Header ── */}
      <View style={s.hero}>
        {/* Top bar */}
        <View style={s.heroTopBar}>
          <Text style={s.heroScreenTitle}>{t("profile.title")}</Text>
          <Button
            size="sm"
            variant="outline"
            onPress={() => setLanguage(currentLanguage === "en" ? "hi" : "en")}
            style={{ backgroundColor: "rgba(255,255,255,0.18)", borderColor: "rgba(255,255,255,0.25)", borderRadius: 20 }}
          >
            <Ionicons name="language-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>
              {currentLanguage === "en" ? "हिंदी" : "English"}
            </Text>
          </Button>
        </View>

        {/* Avatar + Identity */}
        <View style={s.heroCenter}>
          <View style={s.avatarRing}>
            <Avatar name={profile.name} size="3xl" shape="circle" bgColor="#FFFFFF" />
          </View>
          <Text style={s.heroName}>{profile.name}</Text>
          <View style={s.heroPill}>
            <Ionicons name="call-outline" size={13} color="rgba(255,255,255,0.9)" />
            <Text style={s.heroPillText}>{profile.mobileNumber}</Text>
          </View>
          {(profile.village || profile.district) && (
            <View style={s.heroPill}>
              <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.9)" />
              <Text style={s.heroPillText} numberOfLines={1}>
                {[profile.village, profile.district, profile.state].filter(Boolean).join(", ")}
              </Text>
            </View>
          )}
        </View>

        {/* Stats strip */}
        <View style={s.statsStrip}>
          <StatBadge
            icon="calendar-outline"
            value={profile.age ? `${profile.age} yrs` : "—"}
            label={t("profile.age")}
          />
          <View style={s.statsDivider} />
          <StatBadge
            icon="person-outline"
            value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "—"}
            label={t("profile.gender")}
          />
          <View style={s.statsDivider} />
          <StatBadge
            icon="leaf-outline"
            value={profile.landDetails?.totalLandArea ? `${profile.landDetails.totalLandArea}` : "0"}
            label={t("profile.bigha")}
          />
          <View style={s.statsDivider} />
          <StatBadge
            icon="paw-outline"
            value={String(totalAnimals)}
            label="Animals"
          />
        </View>

        {/* Edit Profile CTA */}
        <Button
          size="md"
          variant="outline"
          onPress={() => router.push("/personal-details" as any)}
          style={{ backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 0 }}
        >
          <Ionicons name="create-outline" size={16} color="#386641" style={{ marginRight: 6 }} />
          <Text style={{ color: "#386641", fontSize: 15, fontWeight: "700" }}>{t("profile.editDetails")}</Text>
        </Button>
      </View>

      {/* ── Personal Details Card ── */}
      <SectionCard
        title={t("profile.personalDetails")}
        icon="person-outline"
        accentColor="#2563EB"
        onEdit={() => router.push("/personal-details" as any)}
        editLabel={t("profile.editPersonalDetails")}
      >
        <InfoRow icon="call-outline" label={t("profile.mobileNumber")} value={profile.mobileNumber} />
        {profile.aadhaarNumber && (
          <InfoRow icon="card-outline" label={t("profile.aadhaar")} value={maskAadhaar(profile.aadhaarNumber)} />
        )}
        {profile.fathersName && (
          <InfoRow icon="people-outline" label={t("personalDetails.fathersName")} value={profile.fathersName} />
        )}
        {profile.educationalQualification && (
          <InfoRow icon="school-outline" label={t("personalDetails.educationalQualification")} value={profile.educationalQualification} />
        )}
        <InfoRow
          icon="location-outline"
          label={t("profile.address")}
          value={[profile.village, profile.gramPanchayat, profile.district, profile.state].filter(Boolean).join(", ")}
          accent
        />
      </SectionCard>

      {/* ── Land Card ── */}
      <SectionCard
        title={t("landDetails.title")}
        icon="leaf-outline"
        accentColor="#16A34A"
        onEdit={() => router.push("/land-details" as any)}
        editLabel={t("profile.editLandDetails")}
      >
        {profile.landDetails ? (
          <>
            <InfoRow
              icon="resize-outline"
              label={t("landDetails.totalLandArea")}
              value={`${profile.landDetails.totalLandArea || 0} ${t("profile.bigha")}`}
              accent
            />
            {profile.landDetails.rabiCrop && (
              <InfoRow icon="sunny-outline" label={t("landDetails.rabiCrop")} value={profile.landDetails.rabiCrop} />
            )}
            {profile.landDetails.kharifCrop && (
              <InfoRow icon="rainy-outline" label={t("landDetails.kharifCrop")} value={profile.landDetails.kharifCrop} />
            )}
            {profile.landDetails.zaidCrop && (
              <InfoRow icon="partly-sunny-outline" label={t("landDetails.zaidCrop")} value={profile.landDetails.zaidCrop} />
            )}
          </>
        ) : (
          <View style={s.emptySection}>
            <Ionicons name="leaf-outline" size={32} color="#D1FAE5" />
            <Text style={s.emptySectionText}>No land details added yet</Text>
            <Button
              size="sm"
              variant="outline"
              onPress={() => router.push("/land-details" as any)}
              style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0", borderRadius: 20, marginTop: 8 }}
            >
              <Ionicons name="add-circle-outline" size={16} color="#16A34A" style={{ marginRight: 6 }} />
              <Text style={{ color: "#16A34A", fontSize: 13, fontWeight: "600" }}>{t("landDetails.addLand")}</Text>
            </Button>
          </View>
        )}
      </SectionCard>

      {/* ── Livestock Card ── */}
      <SectionCard
        title={t("livestockDetails.title")}
        icon="paw-outline"
        accentColor="#EA580C"
        onEdit={() => router.push("/livestock-details" as any)}
        editLabel={t("profile.editLivestockDetails")}
      >
        {totalAnimals > 0 ? (
          <View style={s.livestockGrid}>
            {profile.livestockDetails?.cow ? (
              <View style={s.livestockItem}>
                <Text style={s.livestockEmoji}>🐄</Text>
                <Text style={s.livestockCount}>{profile.livestockDetails.cow}</Text>
                <Text style={s.livestockLabel}>{t("livestockDetails.cow")}</Text>
              </View>
            ) : null}
            {profile.livestockDetails?.buffalo ? (
              <View style={s.livestockItem}>
                <Text style={s.livestockEmoji}>🐃</Text>
                <Text style={s.livestockCount}>{profile.livestockDetails.buffalo}</Text>
                <Text style={s.livestockLabel}>{t("livestockDetails.buffalo")}</Text>
              </View>
            ) : null}
            {profile.livestockDetails?.goat ? (
              <View style={s.livestockItem}>
                <Text style={s.livestockEmoji}>🐐</Text>
                <Text style={s.livestockCount}>{profile.livestockDetails.goat}</Text>
                <Text style={s.livestockLabel}>{t("livestockDetails.goat")}</Text>
              </View>
            ) : null}
            {profile.livestockDetails?.sheep ? (
              <View style={s.livestockItem}>
                <Text style={s.livestockEmoji}>🐑</Text>
                <Text style={s.livestockCount}>{profile.livestockDetails.sheep}</Text>
                <Text style={s.livestockLabel}>{t("livestockDetails.sheep")}</Text>
              </View>
            ) : null}
            {profile.livestockDetails?.poultry ? (
              <View style={s.livestockItem}>
                <Text style={s.livestockEmoji}>🐓</Text>
                <Text style={s.livestockCount}>{profile.livestockDetails.poultry}</Text>
                <Text style={s.livestockLabel}>{t("livestockDetails.hen")}</Text>
              </View>
            ) : null}
            {profile.livestockDetails?.others ? (
              <View style={s.livestockItem}>
                <Text style={s.livestockEmoji}>🐾</Text>
                <Text style={s.livestockCount}>{profile.livestockDetails.others}</Text>
                <Text style={s.livestockLabel}>{t("livestockDetails.others")}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={s.emptySection}>
            <Ionicons name="paw-outline" size={32} color="#FED7AA" />
            <Text style={s.emptySectionText}>No livestock details added yet</Text>
            <Button
              size="sm"
              variant="outline"
              onPress={() => router.push("/livestock-details" as any)}
              style={{ backgroundColor: "#FFF7ED", borderColor: "#FED7AA", borderRadius: 20, marginTop: 8 }}
            >
              <Ionicons name="add-circle-outline" size={16} color="#EA580C" style={{ marginRight: 6 }} />
              <Text style={{ color: "#EA580C", fontSize: 13, fontWeight: "600" }}>{t("livestockDetails.addLivestock")}</Text>
            </Button>
          </View>
        )}
      </SectionCard>

      {/* ── Settings Card ── */}
      <SectionCard
        title={t("profile.settings")}
        icon="settings-outline"
        accentColor="#6B7280"
      >
        {/* Language */}
        <Pressable
          onPress={() => setLanguage(currentLanguage === "en" ? "hi" : "en")}
          style={({ pressed }) => [s.settingRow, pressed && { opacity: 0.7 }]}
          className="flex flex-row justify-between items-center"
        >
          <View style={s.settingLeft}>
            <View style={[s.settingIconBg, { backgroundColor: "#EFF6FF", marginRight: 12 }]}>
              <Ionicons name="language-outline" size={18} color="#2563EB" />
            </View>
            <Text style={s.settingLabel}>{t("profile.appLanguage")}</Text>
          </View>
          <View style={s.settingRight}>
            <Text style={[s.settingBadge, { marginRight: 8 }]}>{currentLanguage === "en" ? "English" : "हिंदी"}</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </Pressable>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [s.settingRow, s.logoutRow, pressed && { opacity: 0.7 }]}
          className="flex flex-row justify-between items-center"
        >
          <View style={s.settingLeft}>
            <View style={[s.settingIconBg, { backgroundColor: "#FEF2F2", marginRight: 12 }]}>
              <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginLeft: 3}}/>
            </View>
            <Text style={[s.settingLabel, { color: "#DC2626" }]}>{t("profile.logout")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#DC2626" />
        </Pressable>
      </SectionCard>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

export default Profile;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { paddingBottom: 16 },

  // States
  center: { flex: 1, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", gap: 12 },
  centerText: { color: "#6B7280", fontSize: 15 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#386641", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24 },
  retryBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },

  // Hero
  hero: {
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#1B4332",
  },
  heroTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  heroScreenTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  langBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },

  heroCenter: { alignItems: "center", marginBottom: 24 },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  heroName: { color: "#FFFFFF", fontSize: 22, fontWeight: "700", letterSpacing: -0.2, marginBottom: 8 },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 5,
    maxWidth: 260,
  },
  heroPillText: { color: "rgba(255,255,255,0.95)", fontSize: 13, fontWeight: "500" },

  statsStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statBadge: { flex: 1, alignItems: "center", gap: 4 },
  statBadgeValue: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  statBadgeLabel: { color: "rgba(255,255,255,0.65)", fontSize: 10, textAlign: "center" },
  statsDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 4 },

  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 13,
  },
  editProfileBtnText: { color: "#386641", fontSize: 15, fontWeight: "700" },

  // Section card
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.1 },
  editChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  editChipText: { color: "#386641", fontSize: 12, fontWeight: "600" },
  cardBody: { paddingHorizontal: 18, paddingVertical: 10 },

  // Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  infoIconBoxAccent: { backgroundColor: "#F0FDF4" },
  infoLabel: { color: "#6B7280", fontSize: 13, flex: 1 },
  infoValue: { color: "#1F2937", fontSize: 13, fontWeight: "600", maxWidth: "45%", textAlign: "right" },
  infoValueAccent: { color: "#386641" },

  // Livestock grid
  livestockGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 8,
  },
  livestockItem: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  livestockEmoji: { fontSize: 24, marginBottom: 4 },
  livestockCount: { fontSize: 18, fontWeight: "700", color: "#EA580C" },
  livestockLabel: { fontSize: 11, color: "#9A3412", marginTop: 2 },

  // Empty state
  emptySection: { alignItems: "center", paddingVertical: 20, gap: 8 },
  emptySectionText: { color: "#9CA3AF", fontSize: 14 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    marginTop: 4,
  },
  addBtnText: { color: "#16A34A", fontSize: 13, fontWeight: "600" },

  // Settings
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  logoutRow: { borderBottomWidth: 0 },
  settingLeft: { flexDirection: "row", alignItems: "center" },
  settingIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 15, color: "#1F2937", fontWeight: "500" },
  settingRight: { flexDirection: "row", alignItems: "center" },
  settingBadge: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
});