// src/app/(admin)/mark-attendance.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import apiService, { ApiEvent, UserProfile } from "@/services/apiService";
import { offlineQueue } from "@/utils/offlineQueue";
import { avatar } from "@/utils/cloudinaryUtils";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    ScrollView,
} from "react-native";

// ──────────────────────────────────────────────────────────────
// UserCard  – shown once a valid user is found
// ──────────────────────────────────────────────────────────────
function UserCard({ user, onMarkPresent, marking }: {
    user: UserProfile;
    onMarkPresent: () => void;
    marking: boolean;
}) {
    const initials = user.name
        ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    return (
        <View style={uc.card}>
            {/* Avatar */}
            <View style={uc.avatarRow}>
                {user.photoUrl ? (
                    <Image source={{ uri: avatar(user.photoUrl) }} style={uc.avatar} />
                ) : (
                    <View style={uc.avatarFallback}>
                        <AppText style={uc.avatarInitials}>{initials}</AppText>
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <AppText style={uc.name}>{user.name || "Unknown"}</AppText>
                    <AppText style={uc.mobile}>{user.mobileNumber}</AppText>
                </View>
                <View style={uc.foundBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <AppText style={uc.foundText}>Found</AppText>
                </View>
            </View>

            {/* Details grid */}
            <View style={uc.detailsGrid}>
                {user.village ? <Detail icon="home-outline" label="Village" value={user.village} /> : null}
                {user.block ? <Detail icon="map-outline" label="Block" value={user.block} /> : null}
                {user.district ? <Detail icon="business-outline" label="District" value={user.district} /> : null}
                {user.state ? <Detail icon="flag-outline" label="State" value={user.state} /> : null}
                {user.age ? <Detail icon="person-outline" label="Age" value={`${user.age} yrs`} /> : null}
                {user.gender ? <Detail icon="body-outline" label="Gender" value={user.gender} /> : null}
            </View>

            {/* Mark Present button */}
            <TouchableOpacity style={uc.markBtn} onPress={onMarkPresent} disabled={marking}>
                {marking ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Ionicons name="checkmark-done" size={20} color="#fff" />
                        <AppText style={uc.markBtnText}>Mark as Present</AppText>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

function Detail({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View style={uc.detail}>
            <Ionicons name={icon as any} size={14} color="#6B7280" />
            <View style={{ marginLeft: 6 }}>
                <AppText style={uc.detailLabel}>{label}</AppText>
                <AppText style={uc.detailValue}>{value}</AppText>
            </View>
        </View>
    );
}

const uc = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        borderWidth: 1.5,
        borderColor: "#D1FAE5",
        shadowColor: "#10B981",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
    avatar: { width: 52, height: 52, borderRadius: 26 },
    avatarFallback: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: "#3B82F6",
        justifyContent: "center", alignItems: "center",
    },
    avatarInitials: { color: "#fff", fontSize: 20, fontWeight: "700" },
    name: { fontSize: 17, fontWeight: "700", color: "#111827" },
    mobile: { fontSize: 13, color: "#6B7280", marginTop: 2 },
    foundBadge: {
        flexDirection: "row", alignItems: "center", gap: 4,
        backgroundColor: "#D1FAE5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
    },
    foundText: { fontSize: 12, color: "#059669", fontWeight: "600" },

    detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
    detail: {
        flexDirection: "row", alignItems: "flex-start",
        width: "47%",
        backgroundColor: "#F9FAFB",
        borderRadius: 10, padding: 10,
    },
    detailLabel: { fontSize: 10, color: "#9CA3AF", fontWeight: "600", textTransform: "uppercase" },
    detailValue: { fontSize: 13, color: "#1F2937", fontWeight: "600", marginTop: 1 },

    markBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 8,
        backgroundColor: "#10B981",
        borderRadius: 12, paddingVertical: 14,
    },
    markBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

// ──────────────────────────────────────────────────────────────
// NotFoundCard  – shown when no user exists for the mobile number
// ──────────────────────────────────────────────────────────────
function NotFoundCard({ mobile, onMarkAnyway, marking }: {
    mobile: string;
    onMarkAnyway: () => void;
    marking: boolean;
}) {
    return (
        <View style={nf.card}>
            <Ionicons name="person-remove-outline" size={36} color="#9CA3AF" style={{ marginBottom: 8 }} />
            <AppText style={nf.title}>No Registered User Found</AppText>
            <AppText style={nf.subtitle}>
                No account found for <AppText style={nf.mobile}>{mobile}</AppText>. You can still mark them as present.
            </AppText>
            <TouchableOpacity style={nf.markBtn} onPress={onMarkAnyway} disabled={marking}>
                {marking ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <AppText style={nf.markBtnText}>Mark as Present Anyway</AppText>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const nf = StyleSheet.create({
    card: {
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16, padding: 20, marginTop: 16,
        borderWidth: 1.5, borderColor: "#E5E7EB",
    },
    title: { fontSize: 16, fontWeight: "700", color: "#374151", textAlign: "center" },
    subtitle: { fontSize: 13, color: "#6B7280", textAlign: "center", marginTop: 6, marginBottom: 16, lineHeight: 20 },
    mobile: { fontWeight: "700", color: "#1F2937" },
    markBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        backgroundColor: "#F59E0B", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20,
    },
    markBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

// ──────────────────────────────────────────────────────────────
// Main Screen
// ──────────────────────────────────────────────────────────────
export default function MarkAttendance() {
    const [events, setEvents] = useState<ApiEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);

    const [mobileNumber, setMobileNumber] = useState("");
    const [lookupLoading, setLookupLoading] = useState(false);
    const [foundUser, setFoundUser] = useState<UserProfile | null | "not_found">(null);
    const [marking, setMarking] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const router = useRouter();

    useEffect(() => { loadEvents(); }, []);

    async function loadEvents() {
        const data = await apiService.events.getAll();
        setEvents(data);
        setLoadingEvents(false);
    }

    // debounced user lookup when mobile number reaches 10 digits
    function handleMobileChange(text: string) {
        const cleaned = text.replace(/\D/g, "").slice(0, 10);
        setMobileNumber(cleaned);
        setFoundUser(null);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (cleaned.length < 10) return;

        debounceRef.current = setTimeout(() => lookupUser(cleaned), 500);
    }

    async function lookupUser(mobile: string) {
        setLookupLoading(true);
        try {
            const user = await apiService.user.lookupByMobile(mobile);
            setFoundUser(user ?? "not_found");
        } catch {
            setFoundUser("not_found");
        } finally {
            setLookupLoading(false);
        }
    }

    async function handleMarkPresent() {
        if (!selectedEvent) return;
        setMarking(true);
        try {
            // Resolve the best available name:
            // - Registered user → their real name from the DB lookup
            // - Walk-in (not found) → "Walk-in: {number}" so the report always shows something
            const resolvedName =
                foundUser && foundUser !== "not_found"
                    ? foundUser.name
                    : `Walk-in: ${mobileNumber}`;

            const payload = {
                eventId: selectedEvent.id,
                mobileNumber,
                status: "present",
                name: resolvedName,
            };

            const netState = await NetInfo.fetch();
            if (netState.isConnected === false) {
                await offlineQueue.enqueue("mark-attendance", payload);
                Alert.alert("Saved offline", "No internet connection. Attendance has been saved and will be submitted when you're back online.");
                setMobileNumber("");
                setFoundUser(null);
                return;
            }

            await apiService.events.markAttendance(selectedEvent.id, mobileNumber, "present", resolvedName);
            Alert.alert("✅ Done!", "Attendance marked as Present.", [
                { text: "Mark Another", onPress: () => { setMobileNumber(""); setFoundUser(null); } },
                { text: "Done", onPress: () => setSelectedEvent(null) },
            ]);
        } catch {
            Alert.alert("Error", "Failed to mark attendance. Please try again.");
        } finally {
            setMarking(false);
        }
    }

    // ── Loading ──
    if (loadingEvents) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color="#10B981" />
                <AppText style={{ color: "#6B7280", marginTop: 12 }}>Loading events…</AppText>
            </View>
        );
    }

    // ── Step 1: Pick an event ──
    if (!selectedEvent) {
        return (
            <View style={s.root}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={22} color="#1F2937" />
                    </TouchableOpacity>
                    <View>
                        <AppText style={s.title}>Mark Attendance</AppText>
                        <AppText style={s.subtitle}>Select an event to begin</AppText>
                    </View>
                </View>

                {events.length === 0 ? (
                    <View style={s.emptyState}>
                        <Ionicons name="calendar-outline" size={52} color="#D1D5DB" />
                        <AppText style={s.emptyText}>No events found</AppText>
                    </View>
                ) : (
                    <FlatList
                        data={events}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={s.eventCard} onPress={() => setSelectedEvent(item)}>
                                <View style={s.eventIconBox}>
                                    <Ionicons name="calendar" size={22} color="#3B82F6" />
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
                                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        );
    }

    // ── Step 2: Enter mobile number & mark attendance ──
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "padding"}>
        <ScrollView style={s.root} contentContainerStyle={{ paddingBottom: 48 }}>
            {/* header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => { setSelectedEvent(null); setMobileNumber(""); setFoundUser(null); }} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#1F2937" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <AppText style={s.title}>Mark Attendance</AppText>
                    <AppText style={s.subtitle} numberOfLines={1}>{selectedEvent.title}</AppText>
                </View>
            </View>

            <View style={s.attendanceCard}>
                {/* Event info strip */}
                <View style={s.eventStrip}>
                    <View style={s.stripItem}>
                        <Ionicons name="calendar-outline" size={14} color="#3B82F6" />
                        <AppText style={s.stripText}>{selectedEvent.date}</AppText>
                    </View>
                    {selectedEvent.start_time ? (
                        <View style={s.stripItem}>
                            <Ionicons name="time-outline" size={14} color="#10B981" />
                            <AppText style={s.stripText}>{selectedEvent.start_time}</AppText>
                        </View>
                    ) : null}
                    {selectedEvent.location_name ? (
                        <View style={s.stripItem}>
                            <Ionicons name="location-outline" size={14} color="#F59E0B" />
                            <AppText style={s.stripText}>{selectedEvent.location_name}</AppText>
                        </View>
                    ) : null}
                </View>

                {/* Mobile input */}
                <AppText style={s.inputLabel}>Enter Mobile Number to look up farmer details</AppText>
                <View style={s.mobileInputRow}>
                    <View style={s.mobilePrefix}>
                        <AppText style={s.mobilePrefixText}>+91</AppText>
                    </View>
                    <TextInput
                        style={s.mobileInput}
                        placeholder="10-digit mobile number"
                        placeholderTextColor="#9CA3AF"
                        value={mobileNumber}
                        onChangeText={handleMobileChange}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                    {mobileNumber.length > 0 && (
                        <TouchableOpacity style={s.clearBtn} onPress={() => { setMobileNumber(""); setFoundUser(null); }}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Progress indicator */}
                <View style={s.progressBar}>
                    <View style={[s.progressFill, { width: `${(mobileNumber.length / 10) * 100}%` as any }]} />
                </View>
                <AppText style={s.progressText}>{mobileNumber.length}/10 digits</AppText>

                {/* Lookup result */}
                {lookupLoading && (
                    <View style={s.lookupLoading}>
                        <ActivityIndicator color="#3B82F6" size="small" />
                        <AppText style={s.lookupLoadingText}>Looking up user…</AppText>
                    </View>
                )}

                {!lookupLoading && foundUser !== null && mobileNumber.length === 10 && (
                    foundUser === "not_found" ? (
                        <NotFoundCard
                            mobile={mobileNumber}
                            onMarkAnyway={handleMarkPresent}
                            marking={marking}
                        />
                    ) : (
                        <UserCard
                            user={foundUser}
                            onMarkPresent={handleMarkPresent}
                            marking={marking}
                        />
                    )
                )}
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6" },

    header: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
    },
    backBtn: {
        padding: 8, backgroundColor: "#fff", borderRadius: 12,
        shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    },
    title: { fontSize: 20, fontWeight: "800", color: "#111827" },
    subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },

    // event picker
    eventCard: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10,
        shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    eventIconBox: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center",
    },
    eventTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
    eventMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
    eventDate: { fontSize: 12, color: "#9CA3AF" },
    dot: { width: 3, height: 3, borderRadius: 9, backgroundColor: "#D1D5DB" },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    emptyText: { fontSize: 16, color: "#9CA3AF" },

    // attendance card
    attendanceCard: {
        marginHorizontal: 20,
        backgroundColor: "#fff", borderRadius: 20, padding: 20,
        shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    eventStrip: {
        flexDirection: "row", gap: 12, flexWrap: "wrap",
        paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", marginBottom: 16,
    },
    stripItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    stripText: { fontSize: 13, color: "#374151" },

    inputLabel: { fontSize: 13, color: "#374151", fontWeight: "600", marginBottom: 10 },
    mobileInputRow: {
        flexDirection: "row", alignItems: "center",
        borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 12,
        backgroundColor: "#F9FAFB", overflow: "hidden",
    },
    mobilePrefix: {
        paddingHorizontal: 12, paddingVertical: 14,
        backgroundColor: "#F3F4F6", borderRightWidth: 1, borderRightColor: "#E5E7EB",
    },
    mobilePrefixText: { fontSize: 15, color: "#374151", fontWeight: "600" },
    mobileInput: {
        flex: 1, paddingHorizontal: 12, paddingVertical: 14,
        fontSize: 18, color: "#1F2937", fontWeight: "600", letterSpacing: 1.5,
    },
    clearBtn: { paddingHorizontal: 12 },

    progressBar: {
        height: 3, backgroundColor: "#E5E7EB", borderRadius: 2, marginTop: 8, overflow: "hidden",
    },
    progressFill: { height: "100%", backgroundColor: "#3B82F6", borderRadius: 2 },
    progressText: { fontSize: 11, color: "#9CA3AF", textAlign: "right", marginTop: 4 },

    lookupLoading: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16, justifyContent: "center" },
    lookupLoadingText: { color: "#6B7280", fontSize: 14 },
});
