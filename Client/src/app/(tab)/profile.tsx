// src/app/(tab)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import AppText from "../../components/atoms/AppText";
import Avatar from "../../components/atoms/Avatar";
import Button from "../../components/atoms/Button";
import { useTranslation } from "../../i18n";
import { userApi, UserProfile } from "../../services/apiService";

// Profile Info Row Component
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
    }}
  >
    <AppText variant="bodySm" style={{ color: "#6B7280", fontSize: 14 }}>
      {label}
    </AppText>
    <AppText variant="bodySm" style={{ color: "#1F2937", fontWeight: "600", fontSize: 14 }}>
      {value || "-"}
    </AppText>
  </View>
);

// Section Card Component
const SectionCard = ({
  title,
  icon,
  iconBgColor,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBgColor: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) => (
  <View
    style={{
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 20,
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: iconBgColor,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name={icon} size={20} color="#FFFFFF" />
        </View>
        <AppText variant="h3" style={{ fontWeight: "700", color: "#1F2937", fontSize: 18 }}>
          {title}
        </AppText>
      </View>
      {actionLabel && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            opacity: pressed ? 0.7 : 1,
            backgroundColor: "#FEF3E2",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          })}
        >
          <Ionicons name="add" size={16} color="#8B5A3C" />
          <AppText variant="bodySm" style={{ color: "#8B5A3C", fontWeight: "600", fontSize: 13, marginLeft: 4 }}>
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
    {children}
  </View>
);

const Profile = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await userApi.getProfile();
      if (response.data?.user) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    };
    loadProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const maskAadhaar = (aadhaar: string) =>
    aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "XXXX XXXX $3");

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#386641" />
        <AppText variant="bodyMd" style={{ color: "#6B7280", marginTop: 12 }}>
          {t("common.loading")}
        </AppText>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="person-circle-outline" size={64} color="#9CA3AF" />
        <AppText variant="bodyMd" style={{ color: "#6B7280", marginTop: 12 }}>
          {t("profile.error")}
        </AppText>
        <Pressable
          onPress={onRefresh}
          style={{
            marginTop: 16,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#386641",
            borderRadius: 20,
          }}
        >
          <AppText variant="bodySm" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            {t("common.retry")}
          </AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#386641"]}
          tintColor="#386641"
        />
      }
    >
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 48,
          paddingBottom: 16,
          backgroundColor: "#F9FAFB",
        }}
      >
        <AppText variant="h2" style={{ fontWeight: "700", color: "#1F2937", fontSize: 28 }}>
          {t("profile.title")}
        </AppText>
        <Pressable
          onPress={() => router.replace("/(auth)/language-selection")}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="settings-outline" size={22} color="#1F2937" />
        </Pressable>
      </View>

      {/* PROFILE CARD */}
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 16,
          padding: 24,
          backgroundColor: "#386641",
          borderRadius: 24,
          shadowColor: "#386641",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        {/* Avatar and Name */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Avatar name={profile.name} size="3xl" shape="circle" bgColor="#FFFFFF" />
          <AppText
            variant="h2"
            style={{
              color: "#FFFFFF",
              fontWeight: "700",
              fontSize: 24,
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {profile.name}
          </AppText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              backgroundColor: "rgba(255,255,255,0.2)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Ionicons name="call-outline" size={14} color="#FFFFFF" />
            <AppText variant="bodySm" style={{ color: "#FFFFFF", marginLeft: 6, fontWeight: "500" }}>
              {profile.mobileNumber}
            </AppText>
          </View>
        </View>

        {/* Quick Stats */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: 16,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <AppText variant="h3" style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 20 }}>
              {profile.age || "-"}
            </AppText>
            <AppText variant="bodySm" style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 }}>
              {t("profile.age")}
            </AppText>
          </View>
          <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />
          <View style={{ alignItems: "center" }}>
            <AppText variant="h3" style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 20 }}>
              {profile.gender || "-"}
            </AppText>
            <AppText variant="bodySm" style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 }}>
              {t("profile.gender")}
            </AppText>
          </View>
          <View style={{ width: 1, backgroundColor: "rgba(255,255,255,0.3)" }} />
          <View style={{ alignItems: "center" }}>
            <AppText variant="h3" style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 20 }}>
              {profile.landDetails?.totalLandArea || 0}
            </AppText>
            <AppText variant="bodySm" style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 }}>
              {t("profile.bigha")}
            </AppText>
          </View>
        </View>

        {/* Edit Button */}
        <Pressable
          onPress={() => router.push("/personal-details" as any)}
          style={({ pressed }) => ({
            marginTop: 20,
            backgroundColor: "#FFFFFF",
            borderRadius: 25,
            paddingVertical: 14,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Ionicons name="create-outline" size={18} color="#386641" />
          <AppText variant="bodyMd" style={{ color: "#386641", fontWeight: "700", marginLeft: 8, fontSize: 15 }}>
            {t("profile.editDetails")}
          </AppText>
        </Pressable>
      </View>

      {/* PERSONAL DETAILS */}
      <SectionCard
        title={t("profile.personalDetails")}
        icon="person-outline"
        iconBgColor="#2563EB"
      >
        <InfoRow label={t("profile.mobileNumber")} value={profile.mobileNumber} />
        <InfoRow
          label={t("profile.aadhaar")}
          value={profile.aadhaarNumber ? maskAadhaar(profile.aadhaarNumber) : "-"}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 }}>
          <AppText variant="bodySm" style={{ color: "#6B7280", fontSize: 14 }}>
            {t("profile.address")}
          </AppText>
          <AppText variant="bodySm" style={{ color: "#1F2937", fontWeight: "600", fontSize: 14, maxWidth: "60%", textAlign: "right" }}>
            {profile.village || "-"}, {profile.district || "-"}
          </AppText>
        </View>
        <Pressable
          onPress={() => router.push("/personal-details" as any)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <AppText variant="bodySm" style={{ color: "#386641", fontWeight: "600", fontSize: 14 }}>
            {t("profile.viewAll")}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color="#386641" style={{ marginLeft: 4 }} />
        </Pressable>
      </SectionCard>

      {/* LAND & CROP SUMMARY */}
      <SectionCard
        title={t("landDetails.title")}
        icon="leaf-outline"
        iconBgColor="#16A34A"
        actionLabel={t("landDetails.addLand")}
        onAction={() => router.push("/land-details")}
      >
        <InfoRow label={t("profile.landOwned")} value={`${profile.landDetails?.totalLandArea || 0} ${t("profile.bigha")}`} />
        <InfoRow label={t("profile.primaryCrop")} value={profile.landDetails?.rabiCrop || "-"} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 }}>
          <AppText variant="bodySm" style={{ color: "#6B7280", fontSize: 14 }}>
            {t("profile.fieldsAdded")}
          </AppText>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "#DCFCE7",
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <AppText variant="bodySm" style={{ color: "#16A34A", fontWeight: "700", fontSize: 14 }}>
                2
              </AppText>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/land-details")}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <AppText variant="bodySm" style={{ color: "#386641", fontWeight: "600", fontSize: 14 }}>
            {t("profile.viewAll")}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color="#386641" style={{ marginLeft: 4 }} />
        </Pressable>
      </SectionCard>

      {/* LIVESTOCK */}
      <SectionCard
        title={t("livestockDetails.title")}
        icon="paw-outline"
        iconBgColor="#EA580C"
        actionLabel={t("livestockDetails.addLivestock")}
        onAction={() => router.push("/livestock-details")}
      >
        <InfoRow label={t("livestockDetails.cows")} value={String(profile.livestockDetails?.cow || 0)} />
        <InfoRow label={t("livestockDetails.buffaloes")} value={String(profile.livestockDetails?.buffalo || 0)} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 }}>
          <AppText variant="bodySm" style={{ color: "#6B7280", fontSize: 14 }}>
            {t("livestockDetails.goats")}
          </AppText>
          <AppText variant="bodySm" style={{ color: "#1F2937", fontWeight: "600", fontSize: 14 }}>
            {String(profile.livestockDetails?.goat || 0)}
          </AppText>
        </View>
        <Pressable
          onPress={() => router.push("/livestock-details")}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <AppText variant="bodySm" style={{ color: "#386641", fontWeight: "600", fontSize: 14 }}>
            {t("profile.viewAll")}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color="#386641" style={{ marginLeft: 4 }} />
        </Pressable>
      </SectionCard>

      {/* Bottom Spacing */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

export default Profile;
