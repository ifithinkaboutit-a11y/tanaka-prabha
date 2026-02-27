import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    Alert,
    TextInput
} from "react-native";
import apiService, { ApiEvent } from "@/services/apiService";

export default function MarkAttendance() {
    const [events, setEvents] = useState<ApiEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
    const [mobileNumber, setMobileNumber] = useState("");
    const [marking, setMarking] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const data = await apiService.events.getAll();
        setEvents(data);
        setLoadingEvents(false);
    };

    const handleMarkAttendance = async () => {
        if (!selectedEvent) return;
        if (!mobileNumber || mobileNumber.length < 10) {
            Alert.alert("Invalid input", "Please enter a valid mobile number.");
            return;
        }

        setMarking(true);
        try {
            await apiService.events.markAttendance(selectedEvent.id, mobileNumber, "present");
            Alert.alert("Success", "Attendance marked as Present.");
            setMobileNumber("");
        } catch (error) {
            Alert.alert("Error", "Failed to mark attendance.");
        } finally {
            setMarking(false);
        }
    };

    if (loadingEvents) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color="#10B981" />
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
                    <AppText variant="h2" style={s.title}>Select Event</AppText>
                </View>
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={s.list}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={s.eventCard} onPress={() => setSelectedEvent(item)}>
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
                <AppText variant="h2" style={s.title}>Mark Attendance</AppText>
            </View>
            <View style={s.content}>
                <AppText variant="h3" style={{ marginBottom: 20 }}>{selectedEvent.title}</AppText>

                <TextInput
                    style={s.input}
                    placeholder="Enter Mobile Number"
                    placeholderTextColor="#9CA3AF"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                />

                <Button
                    variant="primary"
                    onPress={handleMarkAttendance}
                    disabled={marking || !mobileNumber}
                    style={[s.btn, { backgroundColor: "#10B981", borderColor: "#10B981" }] as any}
                >
                    {marking ? <ActivityIndicator color="white" /> : <AppText style={s.btnText}>Mark Present</AppText>}
                </Button>
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
    input: {
        borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 12,
        padding: 16, fontSize: 16, marginBottom: 16,
        color: "#1F2937", backgroundColor: "#FFFFFF",
    },
    btn: { paddingVertical: 16, marginTop: 8 },
    btnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16, textAlign: "center" },
});
