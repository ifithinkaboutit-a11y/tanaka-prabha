// src/app/(admin)/dashboard.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Alert, ActivityIndicator, RefreshControl } from "react-native";
import apiService, { DashboardStats } from "@/services/apiService";

export default function AdminDashboard() {
    const { signOut } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await apiService.analytics.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const router = useRouter();

    const handleCreateEvent = () => router.push("/(admin)/create-event" as any);
    const handleMarkAttendance = () => router.push("/(admin)/mark-attendance" as any);
    const handleViewAttendance = () => router.push("/(admin)/view-attendance" as any);

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={s.header}>
                <AppText variant="h1" style={s.title}>Admin Panel</AppText>
                <AppText variant="bodySm" style={s.subtitle}>
                    Platform Overview
                </AppText>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 40 }} />
            ) : (
                <View style={s.statsGrid}>
                    <StatCard
                        title="Total Farmers"
                        value={stats?.totalFarmers ?? 0}
                        icon="people"
                        color="#3B82F6"
                    />
                    <StatCard
                        title="Land Coverage"
                        value={`${stats?.totalLandCoverage?.toFixed(1) ?? 0} A`}
                        icon="leaf"
                        color="#10B981"
                    />
                    <StatCard
                        title="Livestock"
                        value={stats?.livestockCount ?? 0}
                        icon="paw"
                        color="#F59E0B"
                    />
                    <StatCard
                        title="Active Schemes"
                        value={stats?.activeSchemes ?? 0}
                        icon="document-text"
                        color="#8B5CF6"
                    />
                    <StatCard
                        title="Professionals"
                        value={stats?.availableProfessionals ?? 0}
                        icon="medkit"
                        color="#EC4899"
                    />
                </View>
            )}

            <View style={s.divider} />

            <AppText variant="h2" style={s.sectionTitle}>Dashboard Utilities</AppText>

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

function StatCard({ icon, title, value, color }: any) {
    return (
        <View style={s.statCard}>
            <View style={[s.statIconBox, { backgroundColor: color + "1A" }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={s.statTextContainer}>
                <AppText variant="h2" style={s.statValue}>{value}</AppText>
                <AppText variant="bodySm" style={s.statTitle}>{title}</AppText>
            </View>
        </View>
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
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 4,
    },
    subtitle: {
        color: "#6B7280",
        fontSize: 16,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "space-between",
        marginBottom: 8,
    },
    statCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        width: "48%",
        flexDirection: "column",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    statIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    statTextContainer: {
        gap: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
    statTitle: {
        fontSize: 12,
        color: "#6B7280",
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 16,
    },
    actionsContainer: {
        gap: 12,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    cardText: {
        flex: 1,
    },
});
