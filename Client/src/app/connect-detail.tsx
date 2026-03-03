import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Pressable,
  View,
  Linking,
  Alert,
  RefreshControl,
  StatusBar,
  Dimensions,
} from "react-native";
import AppText from "../components/atoms/AppText";
import { professionalsApi, Professional } from "@/services/apiService";
import { ProfessionalDetailSkeleton } from "../components/atoms/Skeleton";
import { useTranslation } from "../i18n";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 300;

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({
  icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
}) => (
  <View className="flex-row items-center mb-4">
    <View
      className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
      style={{ backgroundColor: iconBg }}
    >
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View className="flex-1">
      <AppText style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </AppText>
      <AppText style={{ fontSize: 15, color: "#1F2937", fontWeight: "600", marginTop: 1 }}>
        {value || "—"}
      </AppText>
    </View>
  </View>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({
  title,
  icon,
  iconBg,
  iconColor,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}) => (
  <View className="mx-5 mb-4 bg-white rounded-[20px] p-5 shadow-sm" style={{ elevation: 2 }}>
    <View className="flex-row items-center mb-4">
      <View
        className="w-[38px] h-[38px] rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <AppText style={{ fontSize: 16, fontWeight: "800", color: "#1F2937" }}>
        {title}
      </AppText>
    </View>
    {children}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ConnectDetailScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { professionalId } = useLocalSearchParams<{ professionalId: string }>();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfessional = useCallback(async () => {
    if (!professionalId) return;
    try {
      const data = await professionalsApi.getById(professionalId);
      setProfessional(data);
    } catch (error) {
      console.error("Error fetching professional:", error);
    }
  }, [professionalId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProfessional();
      setLoading(false);
    };
    load();
  }, [fetchProfessional]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfessional();
    setRefreshing(false);
  }, [fetchProfessional]);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-100">
        <StatusBar barStyle="light-content" backgroundColor="#386641" />
        <View className="bg-[#386641] pt-[52px] pb-4 px-5 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </View>
        </View>
        <ProfessionalDetailSkeleton />
      </View>
    );
  }

  if (!professional) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 p-8">
        <View className="w-[88px] h-[88px] rounded-full bg-red-50 items-center justify-center mb-4">
          <Ionicons name="alert-circle" size={44} color="#DC2626" />
        </View>
        <AppText style={{ fontSize: 15, color: "#6B7280", textAlign: "center" }}>
          {t("connect.professionalNotFound")}
        </AppText>
        <Pressable
          onPress={() => router.back()}
          className="mt-5 bg-[#386641] px-7 py-3.5 rounded-xl"
        >
          <AppText style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
            {t("common.goBack")}
          </AppText>
        </Pressable>
      </View>
    );
  }

  const handleCall = () => {
    setShowConnectModal(false);
    if (professional.phone) {
      Linking.openURL(`tel:${professional.phone.replace(/\D/g, "")}`).catch(() => {
        Alert.alert(t("connect.error"), t("connect.cannotMakeCall"));
      });
    } else {
      Alert.alert(t("connect.error"), t("connect.noPhoneNumber"));
    }
  };

  const handleChat = () => {
    setShowConnectModal(false);
    if (professional.phone) {
      const num = professional.phone.replace(/\D/g, "");
      const formatted = num.startsWith("91") ? num : `91${num}`;
      Linking.openURL(`whatsapp://send?phone=${formatted}`).catch(() => {
        Linking.openURL(`https://wa.me/${formatted}`).catch(() => {
          Alert.alert(t("connect.error"), t("connect.cannotOpenWhatsApp"));
        });
      });
    } else {
      Alert.alert(t("connect.error"), t("connect.noPhoneNumber"));
    }
  };

  const handleBookAppointment = () => {
    setShowConnectModal(false);
    router.push({
      pathname: "/book-appointment" as any,
      params: { professionalId: professional!.id, professionalName: professional!.name },
    });
  };

  const avatarUrl =
    professional.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=386641&color=fff&size=300&bold=true`;

  return (
    <View className="flex-1 bg-slate-100">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#386641"]}
            tintColor="#386641"
          />
        }
      >
        {/* ── Hero Section ── */}
        <View style={{ height: HERO_HEIGHT }} className="relative">
          <Image source={{ uri: avatarUrl }} className="w-full h-full" resizeMode="cover" />


          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            className="absolute top-[52px] left-5 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          {/* Hero content */}
          <View className="absolute bottom-0 left-0 right-0 p-5">
            {/* Status pill */}
            <View
              className="flex-row items-center self-start px-2.5 py-1 rounded-full mb-2.5"
              style={{ backgroundColor: professional.isAvailable ? "#16A34A" : "#6B7280" }}
            >
              <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
              <AppText style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
                {professional.isAvailable ? t("connect.available") : t("connect.busy")}
              </AppText>
            </View>

            <AppText style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginBottom: 8, lineHeight: 30 }}>
              {professional.name}
            </AppText>

            <View className="flex-row items-center flex-wrap gap-1.5 mb-2">
              <View
                className="px-2.5 py-1 rounded-lg border border-white/20"
                style={{ backgroundColor: "rgba(56,102,65,0.9)" }}
              >
                <AppText style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
                  {professional.role}
                </AppText>
              </View>
              {professional.department && (
                <AppText style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "500" }}>
                  • {professional.department}
                </AppText>
              )}
            </View>

            {professional.district && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                <AppText style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                  {professional.district}
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View className="flex-row mx-5 mt-4 mb-1 gap-3">
          {[
            { label: t("connect.options.call"), icon: "call" as const, bg: "#2563EB", onPress: handleCall },
            { label: t("connect.options.chat"), icon: "logo-whatsapp" as const, bg: "#10B981", onPress: handleChat },
            { label: "Schedule", icon: "calendar" as const, bg: "#F59E0B", onPress: handleBookAppointment },
          ].map((action) => (
            <Pressable key={action.label} onPress={action.onPress} className="flex-1 items-center">
              <View
                className="w-[52px] h-[52px] rounded-2xl items-center justify-center mb-1.5"
                style={{ backgroundColor: action.bg, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }}
              >
                <Ionicons name={action.icon} size={20} color="#FFFFFF" />
              </View>
              <AppText style={{ fontSize: 12, color: "#374151", fontWeight: "600" }}>
                {action.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        {/* ── Professional Info ── */}
        <SectionCard title="Professional Info" icon="person-circle" iconBg="#EEF2FF" iconColor="#4F46E5">
          <InfoRow icon="briefcase-outline" label="Role" value={professional.role} iconBg="#F0FDF4" iconColor="#16A34A" />
          <InfoRow icon="business-outline" label="Department" value={professional.department || "—"} iconBg="#EFF6FF" iconColor="#2563EB" />
          <InfoRow icon="location-outline" label="District" value={professional.district || "—"} iconBg="#FFFBEB" iconColor="#D97706" />
          {professional.phone ? (
            <Pressable onPress={handleCall}>
              <InfoRow icon="call-outline" label="Phone" value={professional.phone} iconBg="#F0FDF4" iconColor="#16A34A" />
            </Pressable>
          ) : null}
        </SectionCard>

        {/* ── Service Area ── */}
        {(professional.serviceArea?.district || professional.serviceArea?.state) && (
          <SectionCard title={t("connect.serviceArea")} icon="map-outline" iconBg="#EFF6FF" iconColor="#2563EB">
            {professional.serviceArea?.district && (
              <InfoRow icon="location" label={t("connect.district")} value={professional.serviceArea.district} iconBg="#F0FDF4" iconColor="#16A34A" />
            )}
            {professional.serviceArea?.blocks?.length ? (
              <InfoRow
                icon="grid-outline"
                label={t("connect.blocksCovered")}
                value={professional.serviceArea.blocks.join(", ")}
                iconBg="#FFFBEB"
                iconColor="#D97706"
              />
            ) : null}
            {professional.serviceArea?.state && (
              <InfoRow icon="flag-outline" label={t("connect.state")} value={professional.serviceArea.state} iconBg="#FDF2F8" iconColor="#9333EA" />
            )}
          </SectionCard>
        )}

        {/* ── Specializations ── */}
        {professional.specializations && professional.specializations.length > 0 && (
          <SectionCard title={t("connect.specialization")} icon="star-outline" iconBg="#FFFBEB" iconColor="#D97706">
            <View className="flex-row flex-wrap gap-2">
              {professional.specializations.map((spec, index) => (
                <View
                  key={index}
                  className="flex-row items-center px-3 py-1.5 rounded-full border border-green-200"
                  style={{ backgroundColor: "#F0FDF4" }}
                >
                  <Ionicons name="checkmark-circle" size={13} color="#386641" style={{ marginRight: 5 }} />
                  <AppText style={{ color: "#166534", fontSize: 13, fontWeight: "600" }}>
                    {spec}
                  </AppText>
                </View>
              ))}
            </View>
          </SectionCard>
        )}
      </ScrollView>

      {/* ── Sticky Book Button ── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-3.5 pb-7 border-t border-slate-200"
        style={{ elevation: 12, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10 }}
      >
        <Pressable
          onPress={handleBookAppointment}
          className="bg-[#386641] rounded-2xl py-4 flex-row items-center justify-center gap-2.5 active:opacity-90"
        >
          <Ionicons name="calendar" size={21} color="#FFFFFF" />
          <AppText style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>
            {t("connect.bookAppointment")}
          </AppText>
        </Pressable>
      </View>

      {/* ── Connect Options Modal ── */}
      <Modal
        visible={showConnectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConnectModal(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setShowConnectModal(false)}
        >
          <View className="bg-white rounded-t-[28px] px-5 pt-4 pb-9">
            <View className="w-10 h-1 bg-slate-200 rounded-full self-center mb-5" />
            <AppText style={{ fontSize: 19, fontWeight: "800", color: "#1F2937", marginBottom: 16 }}>
              {t("connect.howToConnect")}
            </AppText>

            {[
              { icon: "call" as const, label: t("connect.callThem"), sub: t("connect.callDescription"), bg: "#EFF6FF", iconBg: "#2563EB", onPress: handleCall },
              { icon: "logo-whatsapp" as const, label: t("connect.chatWithThem"), sub: t("connect.chatDescription"), bg: "#ECFDF5", iconBg: "#10B981", onPress: handleChat },
              { icon: "calendar" as const, label: t("connect.bookAppointment"), sub: t("connect.bookDescription"), bg: "#FFFBEB", iconBg: "#F59E0B", onPress: handleBookAppointment },
            ].map((opt) => (
              <Pressable
                key={opt.label}
                onPress={opt.onPress}
                className="flex-row items-center rounded-2xl p-3.5 mb-2.5 gap-3 active:opacity-85"
                style={{ backgroundColor: opt.bg }}
              >
                <View
                  className="w-12 h-12 rounded-[14px] items-center justify-center"
                  style={{ backgroundColor: opt.iconBg }}
                >
                  <Ionicons name={opt.icon} size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <AppText style={{ fontSize: 15, fontWeight: "700", color: "#1F2937", marginBottom: 1 }}>
                    {opt.label}
                  </AppText>
                  <AppText style={{ fontSize: 12, color: "#6B7280" }}>
                    {opt.sub}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ConnectDetailScreen;