// src/app/book-appointment.tsx
// Date + Time picker → Confirm booking
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    View,
} from "react-native";
import AppText from "../components/atoms/AppText";
import { appointmentsApi } from "../services/apiService";

// Build next 14 days from today
function generateDays() {
    const days: { label: string; value: string; dayName: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const value = d.toISOString().split("T")[0]; // YYYY-MM-DD
        const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
        const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        days.push({ value, label, dayName });
    }
    return days;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: "#D97706", bg: "#FEF3C7", label: "Pending" },
    scheduled: { color: "#2563EB", bg: "#DBEAFE", label: "Scheduled" },
    completed: { color: "#16A34A", bg: "#DCFCE7", label: "Completed" },
    cancelled: { color: "#DC2626", bg: "#FEE2E2", label: "Cancelled" },
    missed: { color: "#6B7280", bg: "#F3F4F6", label: "Missed" },
};

export default function BookAppointment() {
    const { professionalId, professionalName } = useLocalSearchParams<{
        professionalId: string;
        professionalName: string;
    }>();
    const router = useRouter();

    const [days] = useState(generateDays());
    const [selectedDay, setSelectedDay] = useState<string>(days[0].value);
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isFullyBooked, setIsFullyBooked] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const fetchSlots = useCallback(async (date: string) => {
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
            setSlots(["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM"]);
        } finally {
            setLoadingSlots(false);
        }
    }, [professionalId]);


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

    if (success) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", padding: 32 }}>
                <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                    <Ionicons name="checkmark-circle" size={56} color="#16A34A" />
                </View>
                <AppText variant="h2" style={{ fontWeight: "800", color: "#1F2937", textAlign: "center", fontSize: 26, marginBottom: 8 }}>
                    Appointment Booked!
                </AppText>
                <AppText variant="bodyMd" style={{ color: "#6B7280", textAlign: "center", lineHeight: 22 }}>
                    Your appointment with {professionalName} has been successfully scheduled for{" "}
                    {new Date(selectedDay).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                    {" "}at {selectedSlot}.
                </AppText>
                <View style={{ backgroundColor: "#DBEAFE", borderRadius: 12, padding: 16, marginTop: 20, width: "100%" }}>
                    <AppText variant="bodySm" style={{ color: "#1E40AF", textAlign: "center" }}>
                        🔔 You'll receive a reminder notification at the time of your appointment.
                    </AppText>
                </View>
                <Pressable
                    onPress={() => router.replace("/(tab)/connect" as any)}
                    style={{ marginTop: 32, backgroundColor: "#386641", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40 }}
                >
                    <AppText variant="bodyMd" style={{ color: "#fff", fontWeight: "700" }}>Back to Connect</AppText>
                </Pressable>
                <Pressable
                    onPress={() => router.push("/my-schedule" as any)}
                    style={{ marginTop: 12 }}
                >
                    <AppText variant="bodySm" style={{ color: "#386641", fontWeight: "600" }}>View My Schedule →</AppText>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
            {/* Header */}
            <View style={{ backgroundColor: "#386641", paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 }}>
                <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <AppText variant="h3" style={{ color: "#fff", fontWeight: "800", fontSize: 22 }}>Book Appointment</AppText>
                <AppText variant="bodySm" style={{ color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                    With {professionalName}
                </AppText>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
                {/* Date Picker */}
                <AppText variant="bodyMd" style={{ fontWeight: "700", color: "#1F2937", marginBottom: 12 }}>
                    Select Date
                </AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                    {days.map((day) => {
                        const isSelected = day.value === selectedDay;
                        return (
                            <Pressable
                                key={day.value}
                                onPress={() => setSelectedDay(day.value)}
                                style={{
                                    width: 64,
                                    height: 80,
                                    borderRadius: 16,
                                    backgroundColor: isSelected ? "#386641" : "#fff",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 10,
                                    shadowColor: "#000",
                                    shadowOpacity: isSelected ? 0.15 : 0.04,
                                    shadowRadius: 6,
                                    elevation: isSelected ? 3 : 1,
                                    borderWidth: isSelected ? 0 : 1,
                                    borderColor: "#E5E7EB",
                                }}
                            >
                                <AppText variant="bodySm" style={{ color: isSelected ? "rgba(255,255,255,0.8)" : "#9CA3AF", fontSize: 11, fontWeight: "600" }}>
                                    {day.dayName}
                                </AppText>
                                <AppText variant="bodyMd" style={{ color: isSelected ? "#fff" : "#1F2937", fontWeight: "800", fontSize: 20, marginTop: 2 }}>
                                    {day.label.split(" ")[0]}
                                </AppText>
                                <AppText variant="bodySm" style={{ color: isSelected ? "rgba(255,255,255,0.8)" : "#9CA3AF", fontSize: 10 }}>
                                    {day.label.split(" ")[1]}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Time Slots */}
                <AppText variant="bodyMd" style={{ fontWeight: "700", color: "#1F2937", marginBottom: 12 }}>
                    Select Time Slot
                </AppText>

                {loadingSlots ? (
                    <View style={{ alignItems: "center", paddingVertical: 32 }}>
                        <ActivityIndicator size="large" color="#386641" />
                    </View>
                ) : isFullyBooked ? (
                    <View style={{ backgroundColor: "#FEE2E2", borderRadius: 16, padding: 20, alignItems: "center" }}>
                        <Ionicons name="calendar-outline" size={36} color="#DC2626" />
                        <AppText variant="bodyMd" style={{ color: "#DC2626", fontWeight: "700", marginTop: 8 }}>
                            Fully Booked
                        </AppText>
                        <AppText variant="bodySm" style={{ color: "#7F1D1D", textAlign: "center", marginTop: 4 }}>
                            No more slots available for this day. Please select another date.
                        </AppText>
                    </View>
                ) : (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                        {slots.map((slot) => {
                            const isSelected = slot === selectedSlot;
                            return (
                                <Pressable
                                    key={slot}
                                    onPress={() => setSelectedSlot(slot)}
                                    style={{
                                        paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12,
                                        backgroundColor: isSelected ? "#386641" : "#fff",
                                        borderWidth: isSelected ? 0 : 1.5,
                                        borderColor: isSelected ? "transparent" : "#E5E7EB",
                                        shadowColor: "#000", shadowOpacity: isSelected ? 0.12 : 0.03, shadowRadius: 4, elevation: isSelected ? 2 : 0,
                                    }}
                                >
                                    <AppText variant="bodySm" style={{ color: isSelected ? "#fff" : "#374151", fontWeight: "700" }}>
                                        {slot}
                                    </AppText>
                                </Pressable>
                            );
                        })}
                        {slots.length === 0 && !isFullyBooked && (
                            <View style={{ width: "100%", alignItems: "center", paddingVertical: 24 }}>
                                <Ionicons name="time-outline" size={40} color="#D1D5DB" />
                                <AppText variant="bodySm" style={{ color: "#9CA3AF", marginTop: 8 }}>No slots available</AppText>
                            </View>
                        )}
                    </View>
                )}

                {/* Summary Card (when both selected) */}
                {selectedSlot && (
                    <View style={{ backgroundColor: "#EFF6FF", borderRadius: 16, padding: 16, marginTop: 24, borderWidth: 1, borderColor: "#BFDBFE" }}>
                        <AppText variant="bodyMd" style={{ fontWeight: "700", color: "#1E40AF", marginBottom: 8 }}>
                            Appointment Summary
                        </AppText>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                            <Ionicons name="person" size={15} color="#2563EB" />
                            <AppText variant="bodySm" style={{ color: "#1E40AF", marginLeft: 8 }}>{professionalName}</AppText>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                            <Ionicons name="calendar" size={15} color="#2563EB" />
                            <AppText variant="bodySm" style={{ color: "#1E40AF", marginLeft: 8 }}>
                                {new Date(selectedDay).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </AppText>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Ionicons name="time" size={15} color="#2563EB" />
                            <AppText variant="bodySm" style={{ color: "#1E40AF", marginLeft: 8 }}>{selectedSlot}</AppText>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Confirm Button */}
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", padding: 20, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
                <Pressable
                    onPress={handleBook}
                    disabled={!selectedSlot || submitting}
                    style={({ pressed }) => ({
                        backgroundColor: selectedSlot ? "#386641" : "#E5E7EB",
                        borderRadius: 16, paddingVertical: 18,
                        flexDirection: "row", alignItems: "center", justifyContent: "center",
                        opacity: pressed ? 0.9 : 1,
                    })}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={22} color={selectedSlot ? "#fff" : "#9CA3AF"} />
                            <AppText variant="bodyMd" style={{ color: selectedSlot ? "#fff" : "#9CA3AF", fontWeight: "800", marginLeft: 10, fontSize: 17 }}>
                                Confirm Appointment
                            </AppText>
                        </>
                    )}
                </Pressable>
            </View>
        </View>
    );
}
