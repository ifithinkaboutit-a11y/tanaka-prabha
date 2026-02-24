// src/app/(admin)/dashboard.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, View, Alert } from "react-native";

export default function AdminDashboard() {
    const { signOut } = useAuth();

    const handleCreateEvent = () => Alert.alert("Admin Action", "Navigate to Create Events screen.");
    const handleMarkAttendance = () => Alert.alert("Admin Action", "Navigate to Mark Attendance screen.");
    const handleViewAttendance = () => Alert.alert("Admin Action", "Navigate to View Attendance Records.");

    return (
        <ScrollView style={s.root} contentContainerStyle={s.content}>
            <View style={s.header}>
                <AppText variant="h1" style={s.title}>Admin Panel</AppText>
                <AppText variant="bodySm" style={s.subtitle}>
                    Manage events and attendance.
                </AppText>
            </View>

            <View style={s.actionsContainer}>
                <ActionCard
                    icon="add-circle"
                    title="Create Events"
                    color="#3B82F6"
                    onPress={handleCreateEvent}
                />
                <ActionCard
                    icon="checkmark-done-circle"
                    title="Mark Attendance"
                    color="#10B981"
                    onPress={handleMarkAttendance}
                />
                <ActionCard
                    icon="list-circle"
                    title="View Attendance Records"
                    color="#8B5CF6"
                    onPress={handleViewAttendance}
                />
            </View>

            <Button
                label="Log Out Admin"
                variant="outline"
                onPress={signOut}
                style={{ marginTop: 40 }}
            />
        </ScrollView>
    );
}

function ActionCard({ icon, title, color, onPress }: any) {
    return (
        <View style={s.card}>
            <View style={[s.iconBox, { backgroundColor: color + "1A" }]}>
                <Ionicons name={icon} size={32} color={color} />
            </View>
            <View style={s.cardText}>
                <AppText variant="h3" style={{ fontSize: 18, color: "#1F2937" }}>
                    {title}
                </AppText>
            </View>
            <Button label="Go" variant="primary" onPress={onPress} style={{ width: 80, backgroundColor: color, borderColor: color }} />
        </View>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    content: {
        padding: 24,
        paddingTop: 80,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 8,
    },
    subtitle: {
        color: "#6B7280",
        fontSize: 16,
    },
    actionsContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    cardText: {
        flex: 1,
    },
});
