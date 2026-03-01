// src/app/my-schedule.tsx
// User's appointment schedule — shows all bookings with Call / WhatsApp join buttons
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Linking,
    Pressable,
    RefreshControl,
    View,
} from "react-native";
import AppText from "../components/atoms/AppText";
import { AppointmentCardSkeleton } from "../components/atoms/Skeleton";
import { Appointment, appointmentsApi } from "../services/apiService";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; dot: string }> = {
    pending: { color: "#D97706", bg: "#FEF3C7", label: "Pending", dot: "#F59E0B" },
    scheduled: { color: "#2563EB", bg: "#DBEAFE", label: "Scheduled", dot: "#3B82F6" },
    completed: { color: "#16A34A", bg: "#DCFCE7", label: "Completed", dot: "#22C55E" },
    cancelled: { color: "#DC2626", bg: "#FEE2E2", label: "Cancelled", dot: "#EF4444" },
    missed: { color: "#6B7280", bg: "#F3F4F6", label: "Missed", dot: "#9CA3AF" },
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
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
        } catch {
            // Silent fail
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
            {/* Header */}
            <View style={{ backgroundColor: "#386641", paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 }}>
                <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <AppText variant="h2" style={{ color: "#fff", fontWeight: "800", fontSize: 28 }}>My Schedule</AppText>
                <AppText variant="bodySm" style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
                    Your appointments & sessions
                </AppText>
                {/* Tab Row */}
                <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 4, marginTop: 16 }}>
                    {(["upcoming", "past"] as const).map((t) => (
                        <Pressable
                            key={t}
                            onPress={() => setTab(t)}
                            style={{ flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center", backgroundColor: tab === t ? "#fff" : "transparent" }}
                        >
                            <AppText variant="bodySm" style={{ color: tab === t ? "#386641" : "rgba(255,255,255,0.8)", fontWeight: "700", textTransform: "capitalize" }}>
                                {t} {t === "upcoming" ? `(${upcoming.length})` : `(${past.length})`}
                            </AppText>
                        </Pressable>
                    ))}
                </View>
            </View>

            {loading ? (
                <View style={{ padding: 16, paddingTop: 8 }}>
                    {[0, 1, 2].map((i) => <AppointmentCardSkeleton key={i} />)}
                </View>
            ) : (
                <FlatList
                    data={displayed}
                    keyExtractor={(item) => (item as any).id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#386641"]} tintColor="#386641" />}
                    ListEmptyComponent={() => (
                        <View style={{ alignItems: "center", paddingTop: 80 }}>
                            <Ionicons name="calendar-outline" size={72} color="#D1D5DB" />
                            <AppText variant="bodyMd" style={{ color: "#9CA3AF", marginTop: 12, fontWeight: "600" }}>
                                No {tab} appointments
                            </AppText>
                            {tab === "upcoming" && (
                                <Pressable
                                    onPress={() => router.push("/(tab)/connect" as any)}
                                    style={{ marginTop: 16, backgroundColor: "#386641", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}
                                >
                                    <AppText variant="bodySm" style={{ color: "#fff", fontWeight: "700" }}>Book an Appointment</AppText>
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

                        return (
                            <View style={{ backgroundColor: "#fff", borderRadius: 18, padding: 18, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                                {/* Top row */}
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <AppText variant="bodyMd" style={{ fontWeight: "800", color: "#1F2937", fontSize: 16 }}>
                                            {a.professionalName || a.professional_name || "Professional"}
                                        </AppText>
                                        <AppText variant="bodySm" style={{ color: "#6B7280", marginTop: 2 }}>
                                            {a.professionalRole || a.professional_role || ""}
                                        </AppText>
                                    </View>
                                    <View style={{ backgroundColor: cfg.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, flexDirection: "row", alignItems: "center" }}>
                                        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: cfg.dot, marginRight: 5 }} />
                                        <AppText variant="bodySm" style={{ color: cfg.color, fontWeight: "700", fontSize: 11 }}>{cfg.label}</AppText>
                                    </View>
                                </View>

                                {/* Date & Time */}
                                <View style={{ flexDirection: "row", gap: 16, marginBottom: 14 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Ionicons name="calendar-outline" size={15} color="#9CA3AF" />
                                        <AppText variant="bodySm" style={{ color: "#374151", marginLeft: 6, fontWeight: "600" }}>
                                            {formatDate(apptDate)}
                                        </AppText>
                                    </View>
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Ionicons name="time-outline" size={15} color="#9CA3AF" />
                                        <AppText variant="bodySm" style={{ color: "#374151", marginLeft: 6, fontWeight: "600" }}>{apptTime}</AppText>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                {isUpcomingItem && (
                                    <View style={{ flexDirection: "row", gap: 10 }}>
                                        {phone && (
                                            <Pressable
                                                onPress={() => Linking.openURL(`tel:${phone}`)}
                                                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#DBEAFE", borderRadius: 12, paddingVertical: 11 }}
                                            >
                                                <Ionicons name="call" size={18} color="#2563EB" />
                                                <AppText variant="bodySm" style={{ color: "#2563EB", fontWeight: "700", marginLeft: 6 }}>Call</AppText>
                                            </Pressable>
                                        )}
                                        {whatsapp && (
                                            <Pressable
                                                onPress={() => Linking.openURL(`https://wa.me/${whatsapp.replace(/\D/g, "")}`)}
                                                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#DCFCE7", borderRadius: 12, paddingVertical: 11 }}
                                            >
                                                <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
                                                <AppText variant="bodySm" style={{ color: "#16A34A", fontWeight: "700", marginLeft: 6 }}>WhatsApp</AppText>
                                            </Pressable>
                                        )}
                                        <Pressable
                                            onPress={() => handleCancel((item as any).id)}
                                            style={{ paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FEE2E2", borderRadius: 12, paddingVertical: 11 }}
                                        >
                                            <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}
