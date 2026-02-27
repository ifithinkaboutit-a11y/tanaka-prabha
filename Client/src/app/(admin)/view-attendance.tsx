import AppText from "@/components/atoms/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import apiService, { ApiEvent } from "@/services/apiService";

export default function ViewAttendance() {
    const [events, setEvents] = useState<ApiEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const data = await apiService.events.getAll();
        setEvents(data);
        setLoadingEvents(false);
    };

    const handleEventSelect = async (event: ApiEvent) => {
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
    };

    if (loadingEvents) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    if (!selectedEvent) {
        return (
            <View style={s.root}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <AppText variant="h2" style={s.title}>View Attendance</AppText>
                </View>
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={s.list}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={s.eventCard} onPress={() => handleEventSelect(item)}>
                            <AppText variant="h3">{item.title}</AppText>
                            <AppText variant="bodySm" style={s.eventDate}>{item.date}</AppText>
                        </TouchableOpacity>
                    )}
                />
            </View>
        );
    }

    return (
        <View style={s.root}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => setSelectedEvent(null)} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <AppText variant="h2" style={s.title}>Attendance Records</AppText>
            </View>
            <View style={s.content}>
                <AppText variant="h3" style={{ marginBottom: 12 }}>{selectedEvent.title}</AppText>

                {loadingAttendees ? (
                    <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 20 }} />
                ) : attendees.length === 0 ? (
                    <AppText style={{ textAlign: "center", marginTop: 20, color: "#6B7280" }}>No attendees found.</AppText>
                ) : (
                    <FlatList
                        data={attendees}
                        keyExtractor={(item, index) => item.id || String(index)}
                        contentContainerStyle={s.list}
                        renderItem={({ item }) => (
                            <View style={s.attendeeCard}>
                                <View>
                                    <AppText variant="bodySm" style={{ fontWeight: "600" }}>{item.user?.name || item.name || "Unknown"}</AppText>
                                    <AppText variant="bodySm" style={{ color: "#6B7280" }}>{item.user?.mobile_number || item.mobile_number || "N/A"}</AppText>
                                </View>
                                <View style={[s.badge, { backgroundColor: item.status === 'present' ? "#D1FAE5" : "#FEE2E2" }]}>
                                    <AppText style={{ color: item.status === 'present' ? "#059669" : "#DC2626", fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
                                        {item.status || "Registered"}
                                    </AppText>
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6", padding: 24, paddingTop: 60 },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6" },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
    backBtn: { padding: 8, marginRight: 8 },
    title: { fontSize: 24, fontWeight: "700", color: "#111827" },
    list: { paddingBottom: 20 },
    eventCard: {
        backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 12,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
    },
    eventDate: { color: "#6B7280", marginTop: 4 },
    content: { flex: 1 },
    attendeeCard: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 8,
    },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
});
