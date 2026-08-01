// src/app/book-appointment.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
} from "react-native";
import Constants from "expo-constants";
import AppText from "../components/atoms/AppText";
import { useAuth } from "../contexts/AuthContext";
import { appointmentsApi } from "../services/apiService";
import { useTranslation } from "../i18n";
import { theme } from "../styles/colors";

const BOOKING_EMAIL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BOOKING_EMAIL || "bookings@tanakaprabha.com";

function generateDays() {
    const days: { label: string; value: string; dayName: string }[] = [];
    const today = new Date();
    for (let i = 1; i < 14; i++) {
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
    const { user } = useAuth();
    const { t } = useTranslation();

    const [days] = useState(generateDays);
    const [selectedDay, setSelectedDay] = useState<string>(generateDays()[0].value);
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState(false);
    const [isFullyBooked, setIsFullyBooked] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const fetchSlots = useCallback(
        async (date: string) => {
            setLoadingSlots(true);
            setSelectedSlot(null);
            setSlots([]);
            setIsFullyBooked(false);
            setSlotsError(false);
            try {
                const [available, fullyBooked] = await Promise.all([
                    appointmentsApi.getAvailableSlots(professionalId!, date),
                    appointmentsApi.isDateFullyBooked(professionalId!, date),
                ]);
                setSlots(available);
                setIsFullyBooked(fullyBooked);
            } catch {
                // Don't fabricate availability on a fetch failure — an invented
                // slot list could let the user "book" a time that was never
                // actually free. Show a real error with a retry instead.
                setSlotsError(true);
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
            const userName = user?.name ?? "";
            Linking.openURL(
                `mailto:${BOOKING_EMAIL}?subject=New Appointment Booking&body=Professional: ${professionalName}%0ADate: ${selectedDay}%0ATime: ${selectedSlot}%0AUser: ${userName}`
            );
        } catch (error: any) {
            Alert.alert(
                t("connect.booking.error"),
                error?.message || t("connect.booking.errorMessage"),
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
                <StatusBar barStyle="dark-content" backgroundColor={theme.background.successSubtle} />
                <View style={styles.successCircle}>
                    <View style={styles.successInner}>
                        <Ionicons name="checkmark" size={52} color="#FFFFFF" />
                    </View>
                </View>
                <AppText style={styles.successTitle}>{t("connect.booking.success")}</AppText>
                <AppText style={styles.successSub}>
                    {t("connect.booking.successSubtitlePrefix")}{" "}
                    <AppText style={{ fontWeight: "700", color: theme.text.secondary }}>{professionalName}</AppText>
                    {" "}{t("connect.booking.successSubtitleSuffix")}
                </AppText>

                <View style={styles.successCard}>
                    {[
                        { icon: "person" as const, label: t("connect.booking.professionalLabel"), value: professionalName ?? "" },
                        { icon: "calendar" as const, label: t("connect.booking.dateLabel"), value: successDate ? `${successDate.dayName}, ${successDate.label}` : selectedDay },
                        { icon: "time" as const, label: t("connect.booking.timeLabel"), value: selectedSlot ?? "" },
                    ].map((row) => (
                        <View key={row.label} style={styles.successRow}>
                            <View style={styles.successRowIcon}>
                                <Ionicons name={row.icon} size={16} color={theme.primary.green} />
                            </View>
                            <View>
                                <AppText style={styles.successRowLabel}>{row.label}</AppText>
                                <AppText style={styles.successRowValue}>{row.value}</AppText>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.reminderBox}>
                    <Ionicons name="notifications" size={16} color={theme.secondary.sky} style={{ marginRight: 8 }} />
                    <AppText style={styles.reminderText}>
                        {t("connect.booking.reminderMessage")}
                    </AppText>
                </View>

                {/* ── Success Buttons ── */}
                <Pressable
                    onPress={() => router.replace("/(tab)/connect" as any)}
                    className="w-full rounded-2xl py-4 items-center active:opacity-90 mb-3"
                    style={{ backgroundColor: theme.primary.green }}
                >
                    <AppText style={{ color: theme.text.onPrimary, fontSize: 16, fontWeight: "800" }}>
                        {t("connect.booking.backToConnect")}
                    </AppText>
                </Pressable>

                <Pressable
                    onPress={() => router.push("/my-schedule" as any)}
                    className="mt-1 py-2"
                >
                    <AppText style={{ color: theme.primary.green, fontWeight: "600", fontSize: 14 }}>
                        {t("connect.booking.viewMySchedule")}
                    </AppText>
                </Pressable>
            </View>
        );
    }

    // ── Main Booking Screen ────────────────────────────────────────────────────
    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor={theme.primary.green} />

            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                    hitSlop={8}
                >
                    <Ionicons name="arrow-back" size={22} color={theme.text.onPrimary} />
                </Pressable>
                <View style={{ flex: 1, marginLeft: 14 }}>
                    <AppText style={styles.headerTitle}>{t("connect.booking.title")}</AppText>
                    <AppText style={styles.headerSub}>with {professionalName}</AppText>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Date Strip ── */}
                <AppText style={styles.sectionLabel}>{t("connect.booking.selectDate")}</AppText>
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
                <AppText style={[styles.sectionLabel, { marginTop: 24 }]}>{t("connect.booking.selectTimeSlot")}</AppText>

                {loadingSlots ? (
                    <View style={styles.slotsLoading}>
                        <ActivityIndicator size="large" color={theme.primary.green} />
                        <AppText style={styles.loadingText}>{t("connect.booking.fetchingSlots")}</AppText>
                    </View>
                ) : slotsError ? (
                    <View style={styles.fullyBookedCard}>
                        <Ionicons name="alert-circle" size={40} color="#DC2626" />
                        <AppText style={styles.fullyBookedTitle}>{t("connect.booking.fetchSlotsError")}</AppText>
                        <Pressable onPress={() => fetchSlots(selectedDay)} style={{ marginTop: 12 }}>
                            <AppText style={{ color: theme.primary.green, fontWeight: "700", fontSize: 14 }}>
                                {t("common.retry")}
                            </AppText>
                        </Pressable>
                    </View>
                ) : isFullyBooked ? (
                    <View style={styles.fullyBookedCard}>
                        <Ionicons name="close-circle" size={40} color="#DC2626" />
                        <AppText style={styles.fullyBookedTitle}>{t("connect.booking.fullyBookedNoMore")}</AppText>
                        <AppText style={styles.fullyBookedSub}>
                            {t("connect.booking.fullyBookedNoMoreSub")}
                        </AppText>
                    </View>
                ) : (
                    <View style={styles.slotsGrid}>
                        {slots.length === 0 ? (
                            <View style={styles.noSlots}>
                                <Ionicons name="time-outline" size={40} color="#D1D5DB" />
                                <AppText style={styles.noSlotsText}>{t("connect.booking.noSlotsAvailable")}</AppText>
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
                        <AppText style={styles.summaryTitle}>{t("connect.booking.appointmentSummary")}</AppText>
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
                    className={`w-full rounded-2xl py-[18px] flex-row items-center justify-center gap-2.5 ${selectedSlot ? "active:opacity-90" : "bg-slate-200"
                        }`}
                    style={{ backgroundColor: selectedSlot ? theme.primary.green : undefined }}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Ionicons
                                name="checkmark-circle"
                                size={22}
                                color={selectedSlot ? theme.text.onPrimary : theme.text.placeholder}
                            />
                            <AppText style={{
                                fontSize: 17,
                                fontWeight: "800",
                                color: selectedSlot ? theme.text.onPrimary : theme.text.placeholder,
                            }}>
                                {t("connect.booking.confirmAppointment")}
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
    screen: { flex: 1, backgroundColor: theme.background.screen },

    header: {
        backgroundColor: theme.primary.green,
        paddingTop: 52,
        paddingBottom: 18,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: { color: theme.text.onPrimary, fontSize: 20, fontWeight: "800" },
    headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },

    scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 160 },
    sectionLabel: { fontSize: 14, fontWeight: "700", color: theme.text.secondary, marginBottom: 12, letterSpacing: 0.2 },

    dateStrip: { marginBottom: 4 },
    dayCard: {
        width: 60, height: 78, borderRadius: 16, backgroundColor: theme.background.input,
        alignItems: "center", justifyContent: "center",
        borderWidth: 1.5, borderColor: theme.border.subtle,
        elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4,
    },
    dayCardSel: { backgroundColor: theme.primary.green, borderColor: theme.primary.green, elevation: 4, shadowOpacity: 0.15 },
    dayName: { fontSize: 10, fontWeight: "600", color: theme.text.placeholder },
    dayNameSel: { color: "rgba(255,255,255,0.8)" },
    dayNum: { fontSize: 22, fontWeight: "900", color: theme.text.secondary, marginVertical: 1 },
    dayNumSel: { color: theme.text.onPrimary },
    dayMon: { fontSize: 10, color: theme.text.placeholder },
    dayMonSel: { color: "rgba(255,255,255,0.7)" },

    slotsLoading: { alignItems: "center", paddingVertical: 40, gap: 12 },
    loadingText: { color: theme.text.placeholder, fontSize: 13 },
    fullyBookedCard: {
        backgroundColor: theme.semantic.errorBackground, borderRadius: 16, padding: 24,
        alignItems: "center", gap: 8, borderWidth: 1, borderColor: theme.semantic.likeSubtle,
    },
    fullyBookedTitle: { fontSize: 16, fontWeight: "800", color: theme.semantic.like },
    fullyBookedSub: { fontSize: 13, color: theme.semantic.errorDark, textAlign: "center" },
    slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    slotChip: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
        backgroundColor: theme.background.input, borderWidth: 1.5, borderColor: theme.border.subtle,
        elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 3,
    },
    slotChipSel: { backgroundColor: theme.primary.green, borderColor: theme.primary.green, elevation: 3, shadowOpacity: 0.14 },
    slotText: { fontSize: 14, fontWeight: "700", color: theme.text.secondary },
    slotTextSel: { color: theme.text.onPrimary },
    noSlots: { alignItems: "center", paddingVertical: 24, width: "100%", gap: 8 },
    noSlotsText: { color: theme.text.placeholder, fontSize: 14 },

    summaryCard: {
        marginTop: 24, backgroundColor: theme.background.input, borderRadius: 16,
        padding: 18, borderWidth: 1, borderColor: theme.border.subtle, gap: 10,
    },
    summaryTitle: { fontSize: 14, fontWeight: "800", color: theme.text.secondary, marginBottom: 4 },
    summaryRow: { flexDirection: "row", alignItems: "center" },
    summaryRowText: { fontSize: 14, color: theme.text.secondary, fontWeight: "500", flex: 1 },

    footer: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: theme.background.input,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32,
        borderTopWidth: 1, borderTopColor: theme.border.subtle,
        elevation: 14, shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12,
        alignItems: "stretch",
    },
    footerHint: { textAlign: "center", color: theme.text.placeholder, fontSize: 12, marginTop: 8 },

    successScreen: {
        flex: 1, backgroundColor: theme.background.successSubtle,
        alignItems: "center", justifyContent: "center", paddingHorizontal: 32,
    },
    successCircle: {
        width: 116, height: 116, borderRadius: 58,
        backgroundColor: "rgba(56,102,65,0.12)",
        alignItems: "center", justifyContent: "center", marginBottom: 28,
    },
    successInner: {
        width: 88, height: 88, borderRadius: 44,
        backgroundColor: theme.primary.green, alignItems: "center", justifyContent: "center",
    },
    successTitle: { fontSize: 28, fontWeight: "900", color: theme.text.secondary, marginBottom: 10 },
    successSub: { fontSize: 15, color: theme.text.muted, textAlign: "center", lineHeight: 22, marginBottom: 24 },
    successCard: {
        backgroundColor: theme.background.input, borderRadius: 20, padding: 20,
        width: "100%", gap: 14, elevation: 3,
        shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8, marginBottom: 20,
    },
    successRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    successRowIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: theme.background.successSubtle, alignItems: "center", justifyContent: "center",
    },
    successRowLabel: { fontSize: 11, color: theme.text.placeholder, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
    successRowValue: { fontSize: 14, color: theme.text.secondary, fontWeight: "700" },
    reminderBox: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: theme.background.card, borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        width: "100%", marginBottom: 28,
    },
    reminderText: { flex: 1, color: theme.text.secondary, fontSize: 13, lineHeight: 18 },
});