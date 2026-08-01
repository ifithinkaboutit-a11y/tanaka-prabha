// src/app/(admin)/view-attendance.tsx
import AppText from "@/components/atoms/AppText";
import apiService, { ApiEvent } from "@/services/apiService";
import { theme } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

export default function ViewAttendance() {
    const [events, setEvents] = useState<ApiEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const router = useRouter();

    useEffect(() => { fetchEvents(); }, []);

    async function fetchEvents() {
        const data = await apiService.events.getAll();
        setEvents(data);
        setLoadingEvents(false);
    }

    async function handleEventSelect(event: ApiEvent) {
        setSelectedEvent(event);
        setLoadingAttendees(true);
        try {
            const data = await apiService.events.getAttendees(event.id);
            setAttendees(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAttendees(false);
        }
    }

    // —— loading ——
    if (loadingEvents) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <AppText style={s.loadingText}>Loading events…</AppText>
            </View>
        );
    }

    // —— Step 1: pick event ——
    if (!selectedEvent) {
        return (
            <View style={s.root}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={theme.text.secondary} />
                    </TouchableOpacity>
                    <View>
                        <AppText style={s.title}>Attendance Records</AppText>
                        <AppText style={s.subtitle}>Select an event to view records</AppText>
                    </View>
                </View>

                {events.length === 0 ? (
                    <View style={s.empty}>
                        <Ionicons name="calendar-outline" size={52} color="#D1D5DB" />
                        <AppText style={s.emptyText}>No events found</AppText>
                    </View>
                ) : (
                    <FlatList
                        data={events}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={s.eventCard} onPress={() => handleEventSelect(item)}>
                                <View style={s.eventIcon}>
                                    <Ionicons name="calendar" size={22} color="#8B5CF6" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <AppText style={s.eventTitle}>{item.title}</AppText>
                                    <View style={s.eventMeta}>
                                        <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                                        <AppText style={s.eventDate}>{item.date}</AppText>
                                        {item.location_name ? (
                                            <>
                                                <View style={s.dot} />
                                                <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                                                <AppText style={s.eventDate}>{item.location_name}</AppText>
                                            </>
                                        ) : null}
                                    </View>
                                </View>
                                <View style={s.statusBadge}>
                                    <AppText style={s.statusText}>{item.status}</AppText>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        );
    }

    // DB status values: 'attended' = marked present, 'registered' = not yet attended
    // Walk-in = no user_id (unregistered), Pre-registered = has user_id
    const present = attendees.filter(a => a.status === "attended");
    const absent = attendees.filter(a => a.status !== "attended");
    const walkIns = attendees.filter(a => !a.user_id);
    const preRegistered = attendees.filter(a => !!a.user_id);

    const handleResendInvite = (item: any) => {
        if (!selectedEvent || !item.mobile_number) return;
        const mobile = item.mobile_number;
        const name = item.name || "";
        const appName = "Tanak Prabha";
        const inviteMessage = `Hello${name ? ` ${name}` : ""}! 👋\n\nYou attended an event on the ${appName} platform. Join now to access schemes, events, and more!\n\nDownload: https://tanakprabha.in/download`;
        const formattedNumber = mobile.startsWith("91") ? mobile : `91${mobile}`;
        const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(inviteMessage)}`;

        // Fire-and-forget: tell the backend we're resending
        apiService.events.resendInvite(selectedEvent.id, mobile).catch(() => {});

        Linking.canOpenURL(whatsappUrl).then((supported) => {
            if (supported) {
                Linking.openURL(whatsappUrl);
            } else {
                Linking.openURL(`sms:${mobile}?body=${encodeURIComponent(inviteMessage)}`);
            }
        }).catch(() => {
            Alert.alert("Error", "Could not open WhatsApp or SMS.");
        });
    };

    const renderAttendeeCard = (item: any, index: number, isWalkIn: boolean) => {
        const isPresent = item.status === "attended";
        const name = item.name || "";
        const mobile = item.mobile_number || "N/A";
        const displayName = name || mobile;
        const initials = name
            ? name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
            : mobile.slice(-2);
        const hasConverted = item.converted;

        return (
            <Pressable
                key={item.id || index}
                style={[s.attendeeCard, isWalkIn && s.walkInCard]}
                onPress={() =>
                    item.user_id
                        ? router.push({
                            pathname: "/(admin)/beneficiary-detail",
                            params: { id: item.user_id },
                        } as any)
                        : null
                }
            >
                <View style={[s.initials, { backgroundColor: isWalkIn ? "#FEF3C7" : isPresent ? "#D1FAE5" : "#FEF3C7" }]}>
                    <AppText style={[s.initialsText, { color: isWalkIn ? "#D97706" : isPresent ? "#059669" : "#D97706" }]}>{initials}</AppText>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <AppText style={s.attendeeName}>{displayName}</AppText>
                        {isWalkIn && (
                            <View style={s.walkInBadge}>
                                <Ionicons name="walk-outline" size={10} color="#FFFFFF" />
                                <AppText style={s.walkInBadgeText}>Walk-in</AppText>
                            </View>
                        )}
                        {isWalkIn && hasConverted && (
                            <View style={s.convertedBadge}>
                                <Ionicons name="checkmark-done" size={10} color="#FFFFFF" />
                                <AppText style={s.convertedBadgeText}>Registered</AppText>
                            </View>
                        )}
                    </View>
                    <View style={s.mobileMeta}>
                        <Ionicons name="call-outline" size={12} color="#9CA3AF" />
                        <AppText style={s.attendeeMobile}>{mobile}</AppText>
                    </View>
                    {/* Resend Link button for unconverted walk-ins */}
                    {isWalkIn && !hasConverted && mobile !== "N/A" && (
                        <TouchableOpacity
                            style={s.resendBtn}
                            onPress={(e) => { e.stopPropagation(); handleResendInvite(item); }}
                        >
                            <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                            <AppText style={s.resendBtnText}>Resend Invite</AppText>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={[s.badge, {
                        backgroundColor: isPresent ? "#D1FAE5" : "#FEF3C7",
                    }]}>
                        <Ionicons
                            name={isPresent ? "checkmark-circle" : "time-outline"}
                            size={14}
                            color={isPresent ? "#059669" : "#D97706"}
                        />
                        <AppText style={[s.badgeText, { color: isPresent ? "#059669" : "#D97706" }]}>
                            {isPresent ? "Attended" : "Registered"}
                        </AppText>
                    </View>
                    {item.user_id && (
                        <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
                    )}
                </View>
            </Pressable>
        );
    };

    return (
        <View style={s.root}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => { setSelectedEvent(null); setAttendees([]); }} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={theme.text.secondary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <AppText style={s.title}>Attendance Records</AppText>
                    <AppText style={s.subtitle} numberOfLines={1}>{selectedEvent.title}</AppText>
                </View>
            </View>

            {loadingAttendees ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                    {/* Stats */}
                    <View style={s.statsRow}>
                        <View style={[s.statBox, { borderColor: "#10B981", backgroundColor: "#ECFDF5" }]}>
                            <AppText style={[s.statNum, { color: "#059669" }]}>{present.length}</AppText>
                            <AppText style={[s.statLabel, { color: "#059669" }]}>Attended</AppText>
                        </View>
                        <View style={[s.statBox, { borderColor: "#F59E0B", backgroundColor: "#FFFBEB" }]}>
                            <AppText style={[s.statNum, { color: "#D97706" }]}>{absent.length}</AppText>
                            <AppText style={[s.statLabel, { color: "#D97706" }]}>Pending</AppText>
                        </View>
                        <View style={[s.statBox, { borderColor: "#8B5CF6", backgroundColor: "#F5F3FF" }]}>
                            <AppText style={[s.statNum, { color: "#7C3AED" }]}>{attendees.length}</AppText>
                            <AppText style={[s.statLabel, { color: "#7C3AED" }]}>Total</AppText>
                        </View>
                    </View>

                    {attendees.length === 0 ? (
                        <View style={s.empty}>
                            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                            <AppText style={s.emptyText}>No attendance records yet</AppText>
                        </View>
                    ) : (
                        <>
                            {/* Pre-registered Section */}
                            {preRegistered.length > 0 && (
                                <>
                                    <View style={s.sectionHeader}>
                                        <Ionicons name="person-outline" size={14} color="#6B7280" />
                                        <AppText style={s.sectionTitle}>Pre-registered ({preRegistered.length})</AppText>
                                    </View>
                                    {preRegistered.map((item, index) => renderAttendeeCard(item, index, false))}
                                </>
                            )}

                            {/* Walk-in Section */}
                            {walkIns.length > 0 && (
                                <>
                                    <View style={[s.sectionHeader, { marginTop: preRegistered.length > 0 ? 16 : 0 }]}>
                                        <Ionicons name="walk-outline" size={14} color="#D97706" />
                                        <AppText style={[s.sectionTitle, { color: "#D97706" }]}>Walk-in Attendees ({walkIns.length})</AppText>
                                    </View>
                                    {walkIns.map((item, index) => renderAttendeeCard(item, index, true))}
                                </>
                            )}
                        </>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background.screen },
    center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    loadingText: { color: theme.text.muted, fontSize: 14 },

    header: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
    },
    backBtn: {
        padding: 8, backgroundColor: theme.background.input, borderRadius: 12,
        shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    },
    title: { fontSize: 20, fontWeight: "800", color: theme.text.primary },
    subtitle: { fontSize: 13, color: theme.text.muted, marginTop: 2 },

    // event list
    eventCard: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: theme.background.input, borderRadius: 14, padding: 14, marginBottom: 10,
        shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    eventIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#F5F3FF", justifyContent: "center", alignItems: "center" },
    eventTitle: { fontSize: 15, fontWeight: "700", color: theme.text.primary },
    eventMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
    eventDate: { fontSize: 12, color: theme.text.placeholder },
    dot: { width: 3, height: 3, borderRadius: 9, backgroundColor: theme.border.card },
    statusBadge: { backgroundColor: "#F5F3FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    statusText: { fontSize: 11, color: "#7C3AED", fontWeight: "600", textTransform: "capitalize" },

    empty: { alignItems: "center", paddingVertical: 40, gap: 12 },
    emptyText: { color: theme.text.placeholder, fontSize: 15 },

    // stats
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    statBox: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1.5 },
    statNum: { fontSize: 24, fontWeight: "800" },
    statLabel: { fontSize: 12, fontWeight: "600", marginTop: 2 },

    // attendee cards
    attendeeCard: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: theme.background.input, borderRadius: 14, padding: 14, marginBottom: 8,
        shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    initials: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
    initialsText: { fontWeight: "700", fontSize: 16 },
    attendeeName: { fontSize: 14, fontWeight: "700", color: theme.text.primary },
    mobileMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
    attendeeMobile: { fontSize: 12, color: theme.text.placeholder },
    badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    badgeText: { fontSize: 12, fontWeight: "600" },

    // walk-in segregation
    walkInCard: {
        borderLeftWidth: 3,
        borderLeftColor: "#F59E0B",
        backgroundColor: "#FFFBEB",
    },
    walkInBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        backgroundColor: "#F59E0B",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    walkInBadgeText: { fontSize: 9, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.5 },
    convertedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        backgroundColor: "#059669",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    convertedBadgeText: { fontSize: 9, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.5 },
    resendBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: "#ECFDF5",
        borderWidth: 1,
        borderColor: "#A7F3D0",
        alignSelf: "flex-start",
    },
    resendBtnText: { fontSize: 11, fontWeight: "600", color: "#059669" },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
        marginTop: 4,
    },
    sectionTitle: { fontSize: 13, fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 },
});
