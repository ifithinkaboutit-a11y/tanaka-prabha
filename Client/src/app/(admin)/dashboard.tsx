// src/app/(admin)/dashboard.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import { useAuth } from "@/contexts/AuthContext";
import apiService, { DashboardStats } from "@/services/apiService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ icon, title, value, color }: {
    icon: string; title: string; value: any; color: string;
}) {
    return (
        <View style={[st.card, { borderLeftColor: color }]}>
            <View style={[st.iconBox, { backgroundColor: color + "1A" }]}>
                <Ionicons name={icon as any} size={22} color={color} />
            </View>
            <View>
                <AppText style={st.value}>{value}</AppText>
                <AppText style={st.title}>{title}</AppText>
            </View>
        </View>
    );
}

const st = StyleSheet.create({
    card: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    value: { fontSize: 20, fontWeight: "800", color: "#111827" },
    title: { fontSize: 11, color: "#6B7280", marginTop: 1, fontWeight: "500" },
});

// ─── Action Card ──────────────────────────────────────────────
function ActionCard({ icon, title, description, color, onPress }: {
    icon: string; title: string; description: string; color: string; onPress: () => void;
}) {
    return (
        <TouchableOpacity style={ac.card} onPress={onPress} activeOpacity={0.8}>
            <View style={[ac.iconBox, { backgroundColor: color + "15" }]}>
                <Ionicons name={icon as any} size={26} color={color} />
            </View>
            <View style={ac.text}>
                <AppText style={ac.title}>{title}</AppText>
                <AppText style={ac.description}>{description}</AppText>
            </View>
            <View style={[ac.arrow, { backgroundColor: color + "15" }]}>
                <Ionicons name="chevron-forward" size={18} color={color} />
            </View>
        </TouchableOpacity>
    );
}

const ac = StyleSheet.create({
    card: {
        flexDirection: "row", alignItems: "center", gap: 14,
        backgroundColor: "#fff",
        borderRadius: 16, padding: 16, marginBottom: 10,
        shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    iconBox: { width: 50, height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    text: { flex: 1 },
    title: { fontSize: 15, fontWeight: "700", color: "#111827" },
    description: { fontSize: 12, color: "#6B7280", marginTop: 2 },
    arrow: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
});

// ─── Quick Action Pill ────────────────────────────────────────
function QuickPill({ icon, label, color, onPress }: {
    icon: string; label: string; color: string; onPress: () => void;
}) {
    return (
        <TouchableOpacity style={[qp.pill, { backgroundColor: color + "15", borderColor: color + "40" }]} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name={icon as any} size={16} color={color} />
            <AppText style={[qp.label, { color }]}>{label}</AppText>
        </TouchableOpacity>
    );
}

const qp = StyleSheet.create({
    pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
    label: { fontSize: 13, fontWeight: "600" },
});

// ─── Section Header ───────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
    return <AppText style={sh.label}>{label}</AppText>;
}
const sh = StyleSheet.create({
    label: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 14 },
});

// ─── Main Dashboard ───────────────────────────────────────────
export default function AdminDashboard() {
    const { signOut } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    async function fetchStats() {
        try {
            const data = await apiService.analytics.getDashboardStats();
            setStats(data);
        } catch (e) {
            console.error("Failed to fetch dashboard stats", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => { fetchStats(); }, []);

    function onRefresh() { setRefreshing(true); fetchStats(); }

    const goTo = (path: string) => router.push(path as any);

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Hero Header ── */}
            <View style={s.heroHeader}>
                <View>
                    <AppText style={s.greeting}>Welcome back 👋</AppText>
                    <AppText style={s.heroTitle}>Admin Panel</AppText>
                    <AppText style={s.heroSubtitle}>Platform Overview & Management</AppText>
                </View>
                <TouchableOpacity style={s.logoutBtn} onPress={signOut}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            {/* ── Quick Actions Row ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillRow} contentContainerStyle={s.pillContent}>
                <QuickPill icon="add" label="New Event" color="#3B82F6" onPress={() => goTo("/(admin)/create-event")} />
                <QuickPill icon="checkmark-done" label="Attendance" color="#10B981" onPress={() => goTo("/(admin)/mark-attendance")} />
                <QuickPill icon="list" label="View Records" color="#8B5CF6" onPress={() => goTo("/(admin)/view-attendance")} />
                <QuickPill icon="newspaper" label="CMS" color="#F59E0B" onPress={() => goTo("/(admin)/content-management")} />
                <QuickPill icon="notifications" label="Notify" color="#EF4444" onPress={() => goTo("/(admin)/send-notification")} />
                <QuickPill icon="people" label="Beneficiaries" color="#0EA5E9" onPress={() => goTo("/(admin)/beneficiaries")} />
            </ScrollView>

            {/* ── Stats Grid ── */}
            <SectionHeader label="Platform Stats" />
            {loading ? (
                <View style={s.loadingBox}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <AppText style={s.loadingText}>Loading stats…</AppText>
                </View>
            ) : (
                <View style={s.statsGrid}>
                    <StatCard title="Farmers" value={stats?.totalFarmers ?? 0} icon="people" color="#3B82F6" />
                    <StatCard title="Land Coverage" value={`${stats?.totalLandCoverage?.toFixed(1) ?? 0}A`} icon="leaf" color="#10B981" />
                    <StatCard title="Livestock" value={stats?.livestockCount ?? 0} icon="paw" color="#F59E0B" />
                    <StatCard title="Active Schemes" value={stats?.activeSchemes ?? 0} icon="document-text" color="#8B5CF6" />
                    <StatCard title="Professionals" value={stats?.availableProfessionals ?? 0} icon="medkit" color="#EC4899" />
                </View>
            )}

            <View style={s.divider} />

            {/* ── Event Management ── */}
            <SectionHeader label="Event Management" />
            <ActionCard
                icon="add-circle"
                title="Create New Event"
                description="Schedule a new event with date, time & cover image"
                color="#3B82F6"
                onPress={() => goTo("/(admin)/create-event")}
            />
            <ActionCard
                icon="checkmark-done-circle"
                title="Mark Attendance"
                description="Look up farmers by mobile & mark them present"
                color="#10B981"
                onPress={() => goTo("/(admin)/mark-attendance")}
            />
            <ActionCard
                icon="list-circle"
                title="View Attendance Records"
                description="Browse attendance logs per event"
                color="#8B5CF6"
                onPress={() => goTo("/(admin)/view-attendance")}
            />

            <View style={s.divider} />

            {/* ── Content Management ── */}
            <SectionHeader label="Content Management (CMS)" />
            <ActionCard
                icon="images-outline"
                title="Manage Banners"
                description="Add, edit or remove home screen banners"
                color="#F59E0B"
                onPress={() => goTo("/(admin)/content-management")}
            />
            <ActionCard
                icon="document-text-outline"
                title="Manage Schemes"
                description="Create and update government scheme listings"
                color="#EC4899"
                onPress={() => goTo("/(admin)/content-management")}
            />
            <ActionCard
                icon="people-circle-outline"
                title="Manage Professionals"
                description="Add or update expert profiles"
                color="#6366F1"
                onPress={() => goTo("/(admin)/content-management")}
            />
            <View style={s.divider} />

            {/* ── Notifications ── */}
            <SectionHeader label="Notifications" />
            <ActionCard
                icon="notifications"
                title="Send Push Notification"
                description="Broadcast announcements to all users or by district"
                color="#EF4444"
                onPress={() => goTo("/(admin)/send-notification")}
            />

            <View style={s.divider} />

            {/* ── Beneficiaries ── */}
            <SectionHeader label="Beneficiaries" />
            <ActionCard
                icon="people"
                title="View Beneficiaries"
                description="Browse and search all registered farmers"
                color="#0EA5E9"
                onPress={() => goTo("/(admin)/beneficiaries")}
            />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    content: { paddingBottom: 48 },

    // hero
    heroHeader: {
        flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
        backgroundColor: "#fff",
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8, elevation: 4,
        marginBottom: 16,
    },
    greeting: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
    heroTitle: { fontSize: 28, fontWeight: "900", color: "#111827", marginTop: 2 },
    heroSubtitle: { fontSize: 14, color: "#9CA3AF", marginTop: 2 },
    logoutBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: "#FEF2F2",
        justifyContent: "center", alignItems: "center",
    },

    // pills
    pillRow: { marginBottom: 20 },
    pillContent: { paddingHorizontal: 20, gap: 8 },

    // stats
    statsGrid: {
        flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between",
        gap: 10, paddingHorizontal: 20, marginBottom: 8,
    },
    loadingBox: { alignItems: "center", paddingVertical: 32, gap: 10 },
    loadingText: { color: "#9CA3AF", fontSize: 14 },

    divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 20, marginHorizontal: 20 },
});
