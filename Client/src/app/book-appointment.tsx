// src/app/book-appointment.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
} from "react-native";
import AppText from "../components/atoms/AppText";
import { appointmentsApi } from "../services/apiService";

function generateDays() {
    const days: { label: string; value: string; dayName: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push({
            value: d.toISOString().split("T")[0],
            dayName: d.toLocaleDateString("en-IN", { weekday: "short" }),
            label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        });
    }
    return days;
}

export default function BookAppointment() {
    const { professionalId, professionalName } = useLocalSearchParams<{
        professionalId: string;
        professionalName: string;
    }>();
    const router = useRouter();

    const [days] = useState(generateDays);
    const [selectedDay, setSelectedDay] = useState<string>(generateDays()[0].value);
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isFullyBooked, setIsFullyBooked] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const fetchSlots = useCallback(
        async (date: string) => {
            setLoadingSlots(true);
            setSelectedSlot(null);
            setSlots([]);
            setIsFullyBooked(false);
            try {
                const [available, fullyBooked] = await Promise.all([
                    appointmentsApi.getAvailableSlots(professionalId!, date),
                    appointmentsApi.isDateFullyBooked(professionalId!, date),
                ]);
                setSlots(available);
                setIsFullyBooked(fullyBooked);
            } catch {
                setSlots(["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]);
            } finally {
                setLoadingSlots(false);
            }
        },
        [professionalId]
    );

    useEffect(() => {
        if (professionalId) fetchSlots(selectedDay);
    }, [selectedDay, fetchSlots, professionalId]);

    const handleBook = async () => {
        if (!selectedSlot || !professionalId) return;
        setSubmitting(true);
        try {
            await appointmentsApi.create({
                professionalId: professionalId!,
                date: selectedDay,
                time: selectedSlot,
            });
            setSuccess(true);
        } catch (error: any) {
            Alert.alert(
                "Booking Failed",
                error?.message || "Could not complete your booking. Please try again.",
                [{ text: "OK" }]
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success State ──────────────────────────────────────────────────────────
    if (success) {
        const successDate = days.find((d) => d.value === selectedDay);
        return (
            <View style={styles.successScreen}>
                <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
                <View style={styles.successCircle}>
                    <View style={styles.successInner}>
                        <Ionicons name="checkmark" size={52} color="#FFFFFF" />
                    </View>
                </View>
                <AppText style={styles.successTitle}>Appointment Booked!</AppText>
                <AppText style={styles.successSub}>
                    Your appointment with{" "}
                    <AppText style={{ fontWeight: "700", color: "#1F2937" }}>{professionalName}</AppText>
                    {" "}has been confirmed.
                </AppText>

                <View style={styles.successCard}>
                    {[
                        { icon: "person" as const, label: "Professional", value: professionalName ?? "" },
                        { icon: "calendar" as const, label: "Date", value: successDate ? `${successDate.dayName}, ${successDate.label}` : selectedDay },
                        { icon: "time" as const, label: "Time", value: selectedSlot ?? "" },
                    ].map((row) => (
                        <View key={row.label} style={styles.successRow}>
                            <View style={styles.successRowIcon}>
                                <Ionicons name={row.icon} size={16} color="#386641" />
                            </View>
                            <View>
                                <AppText style={styles.successRowLabel}>{row.label}</AppText>
                                <AppText style={styles.successRowValue}>{row.value}</AppText>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.reminderBox}>
                    <Ionicons name="notifications" size={16} color="#1D4ED8" style={{ marginRight: 8 }} />
                    <AppText style={styles.reminderText}>
                        You'll receive a reminder before your appointment.
                    </AppText>
                </View>

                {/* ── Success Buttons ── */}
                <Pressable
                    onPress={() => router.replace("/(tab)/connect" as any)}
                    className="w-full bg-[#386641] rounded-2xl py-4 items-center active:opacity-90 mb-3"
                >
                    <AppText style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800" }}>
                        Back to Connect
                    </AppText>
                </Pressable>

                <Pressable
                    onPress={() => router.push("/my-schedule" as any)}
                    className="mt-1 py-2"
                >
                    <AppText style={{ color: "#386641", fontWeight: "600", fontSize: 14 }}>
                        View My Schedule →
                    </AppText>
                </Pressable>
            </View>
        );
    }

    // ── Main Booking Screen ────────────────────────────────────────────────────
    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor="#386641" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                    hitSlop={8}
                >
                    <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </Pressable>
                <View style={{ flex: 1, marginLeft: 14 }}>
                    <AppText style={styles.headerTitle}>Book Appointment</AppText>
                    <AppText style={styles.headerSub}>with {professionalName}</AppText>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Date Strip ── */}
                <AppText style={styles.sectionLabel}>Select Date</AppText>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateStrip}
                    contentContainerStyle={{ paddingHorizontal: 2, gap: 10 }}
                >
                    {days.map((day) => {
                        const isSel = day.value === selectedDay;
                        return (
                            <Pressable
                                key={day.value}
                                onPress={() => setSelectedDay(day.value)}
                                style={[styles.dayCard, isSel && styles.dayCardSel]}
                            >
                                <AppText style={[styles.dayName, isSel && styles.dayNameSel]}>
                                    {day.dayName}
                                </AppText>
                                <AppText style={[styles.dayNum, isSel && styles.dayNumSel]}>
                                    {day.label.split(" ")[0]}
                                </AppText>
                                <AppText style={[styles.dayMon, isSel && styles.dayMonSel]}>
                                    {day.label.split(" ")[1]}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* ── Time Slots ── */}
                <AppText style={[styles.sectionLabel, { marginTop: 24 }]}>Select Time Slot</AppText>

                {loadingSlots ? (
                    <View style={styles.slotsLoading}>
                        <ActivityIndicator size="large" color="#386641" />
                        <AppText style={styles.loadingText}>Fetching available slots…</AppText>
                    </View>
                ) : isFullyBooked ? (
                    <View style={styles.fullyBookedCard}>
                        <Ionicons name="close-circle" size={40} color="#DC2626" />
                        <AppText style={styles.fullyBookedTitle}>Fully Booked</AppText>
                        <AppText style={styles.fullyBookedSub}>
                            No more slots on this day. Try another date.
                        </AppText>
                    </View>
                ) : (
                    <View style={styles.slotsGrid}>
                        {slots.length === 0 ? (
                            <View style={styles.noSlots}>
                                <Ionicons name="time-outline" size={40} color="#D1D5DB" />
                                <AppText style={styles.noSlotsText}>No slots available</AppText>
                            </View>
                        ) : (
                            slots.map((slot) => {
                                const isSel = slot === selectedSlot;
                                return (
                                    <Pressable
                                        key={slot}
                                        onPress={() => setSelectedSlot(slot)}
                                        style={[styles.slotChip, isSel && styles.slotChipSel]}
                                    >
                                        <Ionicons
                                            name="time-outline"
                                            size={14}
                                            color={isSel ? "#FFFFFF" : "#6B7280"}
                                            style={{ marginRight: 5 }}
                                        />
                                        <AppText style={[styles.slotText, isSel && styles.slotTextSel]}>
                                            {slot}
                                        </AppText>
                                    </Pressable>
                                );
                            })
                        )}
                    </View>
                )}

                {/* ── Summary Card ── */}
                {selectedSlot && (
                    <View style={styles.summaryCard}>
                        <AppText style={styles.summaryTitle}>Appointment Summary</AppText>
                        {[
                            { icon: "person" as const, label: professionalName ?? "" },
                            {
                                icon: "calendar" as const,
                                label: new Date(selectedDay + "T00:00:00").toLocaleDateString("en-IN", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }),
                            },
                            { icon: "time" as const, label: selectedSlot },
                        ].map((row) => (
                            <View key={row.label} style={styles.summaryRow}>
                                <Ionicons name={row.icon} size={15} color="#2563EB" style={{ marginRight: 10 }} />
                                <AppText style={styles.summaryRowText}>{row.label}</AppText>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* ── Confirm Button (Sticky Footer) ── */}
            <View style={styles.footer}>
                <Pressable
                    onPress={handleBook}
                    disabled={!selectedSlot || submitting}
                    className={`w-full rounded-2xl py-[18px] flex-row items-center justify-center gap-2.5 ${
                        selectedSlot ? "bg-[#386641] active:opacity-90" : "bg-slate-200"
                    }`}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Ionicons
                                name="checkmark-circle"
                                size={22}
                                color={selectedSlot ? "#FFFFFF" : "#9CA3AF"}
                            />
                            <AppText style={{
                                fontSize: 17,
                                fontWeight: "800",
                                color: selectedSlot ? "#FFFFFF" : "#9CA3AF",
                            }}>
                                Confirm Appointment
                            </AppText>
                        </>
                    )}
                </Pressable>

                {!selectedSlot && (
                    <AppText style={styles.footerHint}>
                        Please select a date and time slot to continue
                    </AppText>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#F1F5F9" },

    header: {
        backgroundColor: "#386641",
        paddingTop: 52,
        paddingBottom: 18,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
    headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },

    scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 160 },
    sectionLabel: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 12, letterSpacing: 0.2 },

    dateStrip: { marginBottom: 4 },
    dayCard: {
        width: 60, height: 78, borderRadius: 16, backgroundColor: "#FFFFFF",
        alignItems: "center", justifyContent: "center",
        borderWidth: 1.5, borderColor: "#E2E8F0",
        elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4,
    },
    dayCardSel: { backgroundColor: "#386641", borderColor: "#386641", elevation: 4, shadowOpacity: 0.15 },
    dayName: { fontSize: 10, fontWeight: "600", color: "#9CA3AF" },
    dayNameSel: { color: "rgba(255,255,255,0.8)" },
    dayNum: { fontSize: 22, fontWeight: "900", color: "#1F2937", marginVertical: 1 },
    dayNumSel: { color: "#FFFFFF" },
    dayMon: { fontSize: 10, color: "#9CA3AF" },
    dayMonSel: { color: "rgba(255,255,255,0.7)" },

    slotsLoading: { alignItems: "center", paddingVertical: 40, gap: 12 },
    loadingText: { color: "#9CA3AF", fontSize: 13 },
    fullyBookedCard: {
        backgroundColor: "#FEF2F2", borderRadius: 16, padding: 24,
        alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#FECACA",
    },
    fullyBookedTitle: { fontSize: 16, fontWeight: "800", color: "#DC2626" },
    fullyBookedSub: { fontSize: 13, color: "#7F1D1D", textAlign: "center" },
    slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    slotChip: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
        backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E2E8F0",
        elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3,
    },
    slotChipSel: { backgroundColor: "#386641", borderColor: "#386641", elevation: 3, shadowOpacity: 0.14 },
    slotText: { fontSize: 14, fontWeight: "700", color: "#374151" },
    slotTextSel: { color: "#FFFFFF" },
    noSlots: { alignItems: "center", paddingVertical: 24, width: "100%", gap: 8 },
    noSlotsText: { color: "#9CA3AF", fontSize: 14 },

    summaryCard: {
        marginTop: 24, backgroundColor: "#EFF6FF", borderRadius: 16,
        padding: 18, borderWidth: 1, borderColor: "#BFDBFE", gap: 10,
    },
    summaryTitle: { fontSize: 14, fontWeight: "800", color: "#1E40AF", marginBottom: 4 },
    summaryRow: { flexDirection: "row", alignItems: "center" },
    summaryRowText: { fontSize: 14, color: "#1E3A8A", fontWeight: "500", flex: 1 },

    footer: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32,
        borderTopWidth: 1, borderTopColor: "#E2E8F0",
        elevation: 14, shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12,
        alignItems: "stretch",
    },
    footerHint: { textAlign: "center", color: "#9CA3AF", fontSize: 12, marginTop: 8 },

    successScreen: {
        flex: 1, backgroundColor: "#F0FDF4",
        alignItems: "center", justifyContent: "center", paddingHorizontal: 32,
    },
    successCircle: {
        width: 116, height: 116, borderRadius: 58,
        backgroundColor: "rgba(56,102,65,0.12)",
        alignItems: "center", justifyContent: "center", marginBottom: 28,
    },
    successInner: {
        width: 88, height: 88, borderRadius: 44,
        backgroundColor: "#386641", alignItems: "center", justifyContent: "center",
    },
    successTitle: { fontSize: 28, fontWeight: "900", color: "#1F2937", marginBottom: 10 },
    successSub: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 24 },
    successCard: {
        backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20,
        width: "100%", gap: 14, elevation: 3,
        shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8, marginBottom: 20,
    },
    successRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    successRowIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center",
    },
    successRowLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
    successRowValue: { fontSize: 14, color: "#1F2937", fontWeight: "700" },
    reminderBox: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#DBEAFE", borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        width: "100%", marginBottom: 28,
    },
    reminderText: { flex: 1, color: "#1D4ED8", fontSize: 13, lineHeight: 18 },
});