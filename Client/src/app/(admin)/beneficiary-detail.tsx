// src/app/(admin)/beneficiary-detail.tsx
import AppText from "@/components/atoms/AppText";
import apiService, { ApiUserProfile } from "@/services/apiService";
import { theme } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { cropTypes } from "@/data/content/onboardingOptions";
import { useLanguageStore } from "@/stores/languageStore";

// ─── Section Card ─────────────────────────────────────────────
function SectionCard({ title, children, rightElement }: { title: string; children: React.ReactNode; rightElement?: React.ReactNode }) {
    return (
        <View style={sc.card}>
            <View style={sc.headerRow}>
                <AppText style={sc.title}>{title}</AppText>
                {rightElement}
            </View>
            {children}
        </View>
    );
}

const sc = StyleSheet.create({
    card: {
        backgroundColor: theme.background.input,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        fontSize: 12,
        fontWeight: "700",
        color: theme.text.muted,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
});

// ─── Info Row ─────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
    if (value === undefined || value === null || value === "") return null;
    return (
        <View style={ir.row}>
            <AppText style={ir.label}>{label}</AppText>
            <AppText style={ir.value}>{String(value)}</AppText>
        </View>
    );
}

const ir = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: theme.background.screen,
    },
    label: { fontSize: 13, color: theme.text.placeholder, flex: 1 },
    value: { fontSize: 13, color: theme.text.primary, fontWeight: "600", flex: 2, textAlign: "right" },
});

// ─── Season Row ───────────────────────────────────────────────
function SeasonRow({ season, crop, area }: { season: string; crop?: string; area?: number }) {
    const lang = useLanguageStore((s) => s.currentLanguage);
    if (!crop && !area) return null;
    const localizedCrop = crop
        ? crop
            .split(",")
            .map((part) => {
                const v = part.trim();
                const found = cropTypes.find((c) => c.value === v);
                return lang === "hi" ? found?.labelHi || v : found?.label || v;
            })
            .join(", ")
        : undefined;
    return (
        <View style={sr.row}>
            <View style={sr.badge}>
                <AppText style={sr.badgeText}>{season}</AppText>
            </View>
            <View style={sr.info}>
                {localizedCrop ? <AppText style={sr.crop}>{localizedCrop}</AppText> : null}
                {area ? <AppText style={sr.area}>{area} acres</AppText> : null}
            </View>
        </View>
    );
}

const sr = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.background.screen,
    },
    badge: {
        backgroundColor: "#EFF6FF",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 60,
        alignItems: "center",
    },
    badgeText: { fontSize: 12, fontWeight: "700", color: theme.secondary.sky },
    info: { flex: 1 },
    crop: { fontSize: 13, fontWeight: "600", color: theme.text.primary },
    area: { fontSize: 12, color: theme.text.muted, marginTop: 2 },
});

// ─── Livestock Item ───────────────────────────────────────────
function LivestockItem({ label, count }: { label: string; count?: number }) {
    if (!count) return null;
    return (
        <View style={li.item}>
            <AppText style={li.label}>{label}</AppText>
            <AppText style={li.count}>{count}</AppText>
        </View>
    );
}

const li = StyleSheet.create({
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: theme.background.screen,
    },
    label: { fontSize: 13, color: "#374151" },
    count: { fontSize: 13, fontWeight: "700", color: theme.text.primary },
});

// ─── Main Screen ──────────────────────────────────────────────
export default function BeneficiaryDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [farmer, setFarmer] = useState<ApiUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        apiService.user.getById(id)
            .then((data) => {
                if (!data) throw new Error("Farmer not found");
                setFarmer(data);
            })
            .catch(() => {
                Alert.alert(
                    "Error",
                    "Failed to load farmer profile. Please go back and try again.",
                    [{ text: "Go Back", onPress: () => router.back() }]
                );
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color={theme.secondary.sky} />
                <AppText style={s.loadingText}>Loading profile…</AppText>
            </View>
        );
    }

    async function handleToggleVerification() {
        if (!farmer) return;
        const newStatus = !farmer.is_verified;
        
        try {
            // Optimistic update
            setFarmer({ ...farmer, is_verified: newStatus });
            
            await apiService.user.update(farmer.id, { is_verified: newStatus });
            Alert.alert(
                "Success", 
                `Farmer has been successfully ${newStatus ? 'verified' : 'unverified'}.`
            );
        } catch (error) {
            // Revert on error
            setFarmer({ ...farmer, is_verified: !newStatus });
            console.error("Failed to update verification status", error);
            Alert.alert("Error", "Failed to update status. Please try again.");
        }
    }

    if (!farmer) return null;

    const land = farmer.land_details;
    const livestock = farmer.livestock_details;

    return (
        <View style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#1F2937" />
                </TouchableOpacity>
                <View style={s.headerInfo}>
                    <AppText style={s.headerName}>{farmer.name || "—"}</AppText>
                    <View style={s.headerMeta}>
                        {farmer.village ? (
                            <AppText style={s.headerMetaText}>{farmer.village}</AppText>
                        ) : null}
                        {farmer.district ? (
                            <AppText style={s.headerMetaText}>· {farmer.district}</AppText>
                        ) : null}
                    </View>
                </View>
                {farmer.is_verified !== undefined ? (
                    <View style={[s.badge, farmer.is_verified ? s.badgeVerified : s.badgePending]}>
                        <AppText style={[s.badgeText, farmer.is_verified ? s.badgeTextVerified : s.badgeTextPending]}>
                            {farmer.is_verified ? "Verified" : "Pending"}
                        </AppText>
                    </View>
                ) : null}
            </View>

            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Mobile + Call */}
                <View style={s.callRow}>
                    <View style={s.callInfo}>
                        <Ionicons name="call-outline" size={16} color="#6B7280" />
                        <AppText style={s.callNumber}>{farmer.mobile_number}</AppText>
                    </View>
                    <TouchableOpacity
                        style={s.callBtn}
                        onPress={() => Linking.openURL("tel:" + farmer.mobile_number)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="call" size={16} color="#fff" />
                        <AppText style={s.callBtnText}>Call</AppText>
                    </TouchableOpacity>
                </View>

                {/* Personal Info */}
                <SectionCard title="Personal Info">
                    <InfoRow label="Name" value={farmer.name} />
                    <InfoRow label="Age" value={farmer.age} />
                    <InfoRow label="Gender" value={farmer.gender} />
                    <InfoRow label="Aadhaar" value={farmer.aadhaar_number} />
                    <InfoRow label="Father's Name" value={farmer.fathers_name} />
                    <InfoRow label="Mother's Name" value={farmer.mothers_name} />
                </SectionCard>

                {/* Address */}
                <SectionCard 
                    title="Address"
                    rightElement={
                        <TouchableOpacity
                            onPress={() => {
                                const lat = farmer.location?.lat || farmer.location?.latitude;
                                const lng = farmer.location?.lng || farmer.location?.longitude;
                                if (lat && lng) {
                                    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                                } else if (farmer.village && farmer.district) {
                                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${farmer.village}, ${farmer.district}, ${farmer.state}`)}`);
                                }
                            }}
                            style={s.mapBtn}
                        >
                            <Ionicons name="map-outline" size={14} color={theme.secondary.sky} />
                            <AppText style={s.mapBtnText}>Open Maps</AppText>
                        </TouchableOpacity>
                    }
                >
                    <InfoRow label="Village" value={farmer.village} />
                    <InfoRow label="Block" value={farmer.block} />
                    <InfoRow label="District" value={farmer.district} />
                    <InfoRow label="State" value={farmer.state} />
                    <InfoRow label="PIN Code" value={farmer.pin_code} />
                </SectionCard>

                {/* Land Details */}
                {land ? (
                    <SectionCard title="Land Details">
                        {land.total_land_area ? (
                            <InfoRow label="Total Area" value={`${land.total_land_area} acres`} />
                        ) : null}
                        <SeasonRow season="Rabi" crop={land.rabi_crop} />
                        <SeasonRow season="Kharif" crop={land.kharif_crop} />
                        <SeasonRow season="Zaid" crop={land.zaid_crop} />
                    </SectionCard>
                ) : null}

                {/* Livestock */}
                {livestock ? (
                    <SectionCard title="Livestock">
                        <LivestockItem label="Cow" count={livestock.cow} />
                        <LivestockItem label="Buffalo" count={livestock.buffalo} />
                        <LivestockItem label="Goat" count={livestock.goat} />
                        <LivestockItem label="Sheep" count={livestock.sheep} />
                        <LivestockItem label="Poultry" count={livestock.poultry} />
                        <LivestockItem label="Others" count={livestock.others} />
                    </SectionCard>
                ) : null}

                {/* Verification Action */}
                <TouchableOpacity
                    style={[
                        s.verifyBtn,
                        farmer.is_verified ? s.unverifyBtn : s.verifyBtnActive
                    ]}
                    onPress={handleToggleVerification}
                    activeOpacity={0.8}
                >
                    <Ionicons 
                        name={farmer.is_verified ? "close-circle-outline" : "checkmark-circle-outline"} 
                        size={20} 
                        color="#fff" 
                    />
                    <AppText style={s.verifyBtnText}>
                        {farmer.is_verified ? "Unverify Farmer" : "Verify Farmer"}
                    </AppText>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background.screen },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background.screen, gap: 12 },
    loadingText: { color: theme.text.placeholder, fontSize: 14 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
        backgroundColor: theme.background.input,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 12,
    },
    backBtn: { padding: 8, backgroundColor: theme.background.screen, borderRadius: 12 },
    headerInfo: { flex: 1 },
    headerName: { fontSize: 18, fontWeight: "800", color: theme.text.primary },
    headerMeta: { flexDirection: "row", gap: 4, marginTop: 2 },
    headerMetaText: { fontSize: 12, color: theme.text.muted },

    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeVerified: { backgroundColor: "#D1FAE5" },
    badgePending: { backgroundColor: "#FEF3C7" },
    badgeText: { fontSize: 12, fontWeight: "600" },
    badgeTextVerified: { color: "#059669" },
    badgeTextPending: { color: "#D97706" },

    callRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.background.input,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    callInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
    callNumber: { fontSize: 15, fontWeight: "600", color: theme.text.primary },
    callBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: theme.semantic.success,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 9,
    },
    callBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
    verifyBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 10,
        marginBottom: 20,
    },
    verifyBtnActive: {
        backgroundColor: theme.semantic.success,
    },
    unverifyBtn: {
        backgroundColor: "#9CA3AF",
    },
    verifyBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    mapBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.secondary.sky + "15",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.secondary.sky + "30",
    },
    mapBtnText: {
        color: theme.secondary.sky,
        fontWeight: "700",
        fontSize: 12,
        marginLeft: 6,
    },
});
