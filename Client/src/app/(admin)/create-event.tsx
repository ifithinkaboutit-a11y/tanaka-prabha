import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    View,
    ActivityIndicator,
    Alert,
    ScrollView,
} from "react-native";
import apiService from "@/services/apiService";

export default function CreateEvent() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [locationName, setLocationName] = useState("");

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        if (!title || !date || !startTime || !locationName) {
            Alert.alert("Missing Fields", "Please fill required fields (Title, Date, Start Time, Location).");
            return;
        }

        setLoading(true);
        try {
            await apiService.events.create({
                title,
                description,
                date,
                start_time: startTime,
                end_time: endTime,
                location_name: locationName,
                status: "upcoming"
            });
            Alert.alert("Success", "Event created successfully.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to create event. Please try again.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={s.root}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={s.scrollContent}>
                <View style={s.card}>
                    <View style={s.header}>
                        <Ionicons name="calendar" size={48} color="#3B82F6" />
                        <AppText variant="h2" style={s.title}>Create Event</AppText>
                    </View>

                    <TextInput
                        style={s.input}
                        placeholder="Event Title *"
                        placeholderTextColor="#9CA3AF"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={[s.input, s.textArea]}
                        placeholder="Description"
                        placeholderTextColor="#9CA3AF"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top"
                    />
                    <TextInput
                        style={s.input}
                        placeholder="Date (YYYY-MM-DD) *"
                        placeholderTextColor="#9CA3AF"
                        value={date}
                        onChangeText={setDate}
                    />
                    <View style={s.row}>
                        <TextInput
                            style={[s.input, { flex: 1, marginRight: 8 }]}
                            placeholder="Start Time (HH:MM AM/PM) *"
                            placeholderTextColor="#9CA3AF"
                            value={startTime}
                            onChangeText={setStartTime}
                        />
                        <TextInput
                            style={[s.input, { flex: 1, marginLeft: 8 }]}
                            placeholder="End Time"
                            placeholderTextColor="#9CA3AF"
                            value={endTime}
                            onChangeText={setEndTime}
                        />
                    </View>
                    <TextInput
                        style={s.input}
                        placeholder="Location Name *"
                        placeholderTextColor="#9CA3AF"
                        value={locationName}
                        onChangeText={setLocationName}
                    />

                    <Button
                        variant="primary"
                        onPress={handleCreate}
                        disabled={loading}
                        style={[s.btn, { backgroundColor: "#3B82F6", borderColor: "#3B82F6" }] as any}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <AppText style={s.btnText}>Create</AppText>}
                    </Button>
                    <Button
                        variant="outline"
                        label="Cancel"
                        onPress={() => router.back()}
                        style={s.btn}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    scrollContent: { padding: 24, flexGrow: 1, justifyContent: "center" },
    card: {
        backgroundColor: "#FFFFFF", borderRadius: 24, padding: 32,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
    },
    header: { alignItems: "center", marginBottom: 32 },
    title: { fontSize: 24, fontWeight: "700", marginTop: 16, color: "#111827" },
    input: {
        borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 12,
        padding: 16, fontSize: 16, marginBottom: 16,
        color: "#1F2937", backgroundColor: "#F9FAFB",
    },
    textArea: { height: 100 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    btn: { paddingVertical: 16, marginTop: 8 },
    btnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16, textAlign: "center" },
});
