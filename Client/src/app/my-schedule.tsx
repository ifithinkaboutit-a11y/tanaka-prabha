// src/app/my-schedule.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    Linking,
    Pressable,
    RefreshControl,
    View,
} from "react-native";
import AppText from "../components/atoms/AppText";
import { AppointmentCardSkeleton } from "../components/atoms/Skeleton";
import { Appointment, appointmentsApi } from "../services/apiService";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; dot: string; icon: keyof typeof Ionicons.glyphMap }> = {
    pending:   { color: "#D97706", bg: "#FEF3C7", label: "Pending",   dot: "#F59E0B", icon: "time-outline" },
    scheduled: { color: "#2563EB", bg: "#DBEAFE", label: "Scheduled", dot: "#3B82F6", icon: "calendar-outline" },
    completed: { color: "#16A34A", bg: "#DCFCE7", label: "Completed", dot: "#22C55E", icon: "checkmark-circle-outline" },
    cancelled: { color: "#DC2626", bg: "#FEE2E2", label: "Cancelled", dot: "#EF4444", icon: "close-circle-outline" },
    missed:    { color: "#6B7280", bg: "#F3F4F6", label: "Missed",    dot: "#9CA3AF", icon: "alert-circle-outline" },
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
}

export default function MySchedule() {
    const router = useRouter();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

    const load = useCallback(async () => {
        try {
            const data = await appointmentsApi.getMyAppointments();
            setAppointments(data as any);
        } catch (err) {
            console.warn("Failed to load appointments:", err);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        load().finally(() => setLoading(false));
    }, [load]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }, [load]);

    const today = new Date().toISOString().split("T")[0];

    const upcoming = appointments.filter((a) => {
        const apptDate = (a as any).appointment_date || (a as any).date || "";
        const status = (a as any).status || "";
        return apptDate >= today && !["cancelled", "completed", "missed"].includes(status);
    });

    const past = appointments.filter((a) => {
        const apptDate = (a as any).appointment_date || (a as any).date || "";
        const status = (a as any).status || "";
        return apptDate < today || ["cancelled", "completed", "missed"].includes(status);
    });

    const displayed = tab === "upcoming" ? upcoming : past;

    const handleCancel = async (id: string) => {
        try {
            await appointmentsApi.cancel(id);
            await load();
        } catch { /* silent */ }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

            {/* ── Header ── */}
            <View style={{ backgroundColor: "#386641", paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 }}>
                <Pressable onPress={() => router.back()} className="mb-3 w-9 h-9 rounded-full bg-white/20 items-center justify-center">
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </Pressable>
                <AppText style={{ color: "#fff", fontWeight: "800", fontSize: 28 }}>My Schedule</AppText>
                <AppText style={{ color: "rgba(255,255,255,0.75)", marginTop: 4, fontSize: 13 }}>
                    Your appointments & sessions
                </AppText>

                {/* Tab Row */}
                <View className="flex-row bg-white/15 rounded-xl p-1 mt-4">
                    {(["upcoming", "past"] as const).map((t) => (
                        <Pressable
                            key={t}
                            onPress={() => setTab(t)}
                            className={`flex-1 py-2.5 rounded-[10px] items-center ${tab === t ? "bg-white" : "bg-transparent"}`}
                        >
                            <AppText style={{
                                color: tab === t ? "#386641" : "rgba(255,255,255,0.85)",
                                fontWeight: "700",
                                fontSize: 13,
                                textTransform: "capitalize",
                            }}>
                                {t} ({t === "upcoming" ? upcoming.length : past.length})
                            </AppText>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* ── Content ── */}
            {loading ? (
                <View className="p-4 pt-2">
                    {[0, 1, 2].map((i) => <AppointmentCardSkeleton key={i} />)}
                </View>
            ) : (
                <FlatList
                    data={displayed}
                    keyExtractor={(item) => (item as any).id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#386641"]}
                            tintColor="#386641"
                        />
                    }
                    ListEmptyComponent={() => (
                        <View className="items-center pt-20">
                            <View className="w-24 h-24 rounded-full bg-slate-100 items-center justify-center mb-4">
                                <Ionicons name="calendar-outline" size={44} color="#D1D5DB" />
                            </View>
                            <AppText style={{ color: "#6B7280", fontSize: 16, fontWeight: "700" }}>
                                No {tab} appointments
                            </AppText>
                            <AppText style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4 }}>
                                {tab === "upcoming" ? "Book a session with an expert" : "Your past sessions will appear here"}
                            </AppText>
                            {tab === "upcoming" && (
                                <Pressable
                                    onPress={() => router.push("/(tab)/connect" as any)}
                                    className="mt-5 bg-[#386641] rounded-xl px-6 py-3 active:opacity-90"
                                >
                                    <AppText style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                                        Book an Appointment
                                    </AppText>
                                </Pressable>
                            )}
                        </View>
                    )}
                    renderItem={({ item }) => {
                        const a = item as any;
                        const status = a.status || "pending";
                        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                        const phone = a.professionalPhone || a.professional_phone;
                        const whatsapp = a.professionalWhatsapp || a.professional_whatsapp || phone;
                        const apptDate = a.appointment_date || a.date || "";
                        const apptTime = a.appointment_time || a.time || "";
                        const isUpcomingItem = apptDate >= today && !["cancelled", "completed", "missed"].includes(status);
                        const professionalName = a.professionalName || a.professional_name || "Professional";
                        const professionalRole = a.professionalRole || a.professional_role || "";

                        // Avatar initials
                        const initials = professionalName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

                        return (
                            <View
                                className="bg-white rounded-[22px] mb-4 overflow-hidden"
                                style={{ elevation: 3, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}
                            >
                                {/* ── Colored top accent bar ── */}
                                <View style={{ height: 4, backgroundColor: cfg.dot }} />

                                <View className="p-4">
                                    {/* ── Top row: Avatar + Name + Status badge ── */}
                                    <View className="flex-row items-center mb-4">
                                        {/* Avatar */}
                                        <View
                                            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                                            style={{ backgroundColor: cfg.bg }}
                                        >
                                            <AppText style={{ color: cfg.color, fontSize: 16, fontWeight: "800" }}>
                                                {initials}
                                            </AppText>
                                        </View>

                                        {/* Name + Role */}
                                        <View className="flex-1">
                                            <AppText style={{ fontWeight: "800", color: "#111827", fontSize: 16, lineHeight: 22 }}>
                                                {professionalName}
                                            </AppText>
                                            {professionalRole ? (
                                                <AppText style={{ color: "#6B7280", fontSize: 12, marginTop: 1 }}>
                                                    {professionalRole}
                                                </AppText>
                                            ) : null}
                                        </View>

                                        {/* Status badge */}
                                        <View
                                            className="flex-row items-center px-2.5 py-1.5 rounded-full"
                                            style={{ backgroundColor: cfg.bg }}
                                        >
                                            <Ionicons name={cfg.icon} size={11} color={cfg.color} style={{ marginRight: 4 }} />
                                            <AppText style={{ color: cfg.color, fontWeight: "700", fontSize: 11 }}>
                                                {cfg.label}
                                            </AppText>
                                        </View>
                                    </View>

                                    {/* ── Date & Time chips ── */}
                                    <View className="flex-row gap-2 mb-4">
                                        <View className="flex-row items-center bg-slate-50 px-3 py-2 rounded-xl gap-1.5">
                                            <Ionicons name="calendar-outline" size={14} color="#386641" />
                                            <AppText style={{ color: "#374151", fontSize: 12, fontWeight: "600" }}>
                                                {formatDate(apptDate)}
                                            </AppText>
                                        </View>
                                        <View className="flex-row items-center bg-slate-50 px-3 py-2 rounded-xl gap-1.5">
                                            <Ionicons name="time-outline" size={14} color="#386641" />
                                            <AppText style={{ color: "#374151", fontSize: 12, fontWeight: "600" }}>
                                                {apptTime}
                                            </AppText>
                                        </View>
                                    </View>

                                    {/* ── Divider ── */}
                                    {isUpcomingItem && (
                                        <View className="h-px bg-slate-100 mb-3.5" />
                                    )}

                                    {/* ── Action Buttons ── */}
                                    {isUpcomingItem && (
                                        <View className="flex-row gap-2">
                                            {phone && (
                                                <Pressable
                                                    onPress={() => Linking.openURL(`tel:${phone}`)}
                                                    className="flex-1 flex-row items-center justify-center bg-blue-50 rounded-xl py-2.5 gap-1.5 active:opacity-80"
                                                >
                                                    <Ionicons name="call" size={16} color="#2563EB" />
                                                    <AppText style={{ color: "#2563EB", fontWeight: "700", fontSize: 13 }}>
                                                        Call
                                                    </AppText>
                                                </Pressable>
                                            )}
                                            {whatsapp && (
                                                <Pressable
                                                    onPress={() => Linking.openURL(`https://wa.me/${whatsapp.replace(/\D/g, "")}`)}
                                                    className="flex-1 flex-row items-center justify-center bg-emerald-50 rounded-xl py-2.5 gap-1.5 active:opacity-80"
                                                >
                                                    <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
                                                    <AppText style={{ color: "#16A34A", fontWeight: "700", fontSize: 13 }}>
                                                        WhatsApp
                                                    </AppText>
                                                </Pressable>
                                            )}
                                            <Pressable
                                                onPress={() => handleCancel((item as any).id)}
                                                className="w-fit p-4 items-center justify-center bg-red-50 rounded-xl active:opacity-80 flex-row gap-1.5"
                                            >
                                                <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
                                                <AppText style={{ color: "#DC2626", fontWeight: "700", fontSize: 13 }}>
                                                    Cancel
                                                </AppText>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}