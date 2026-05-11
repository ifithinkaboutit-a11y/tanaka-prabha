// // src/app/(admin)/dashboard.tsx
// import AppText from "@/components/atoms/AppText";
// import Button from "@/components/atoms/Button";
// import { useAuth } from "@/contexts/AuthContext";
// import apiService, { DashboardStats } from "@/services/apiService";
// import { offlineQueue } from "@/utils/offlineQueue";
// import { theme } from "@/styles/colors";
// import { Ionicons } from "@expo/vector-icons";
// import { useFocusEffect, useRouter } from "expo-router";
// import React, { useCallback, useEffect, useState } from "react";
// import {
//     ActivityIndicator,
//     RefreshControl,
//     ScrollView,
//     StyleSheet,
//     TouchableOpacity,
//     View,
// } from "react-native";

// // ─── Stat Card ────────────────────────────────────────────────
// function StatCard({ icon, title, value, color }: {
//     icon: string; title: string; value: any; color: string;
// }) {
//     return (
//         <View style={[st.card, { borderLeftColor: color }]}>
//             <View style={[st.iconBox, { backgroundColor: color + "1A" }]}>
//                 <Ionicons name={icon as any} size={22} color={color} />
//             </View>
//             <View>
//                 <AppText style={st.value}>{value}</AppText>
//                 <AppText style={st.title}>{title}</AppText>
//             </View>
//         </View>
//     );
// }

// const st = StyleSheet.create({
//     card: {
//         width: "48%",
//         backgroundColor: theme.background.input,
//         borderRadius: 14,
//         padding: 14,
//         flexDirection: "row",
//         alignItems: "center",
//         gap: 12,
//         borderLeftWidth: 4,
//         shadowColor: "#000",
//         shadowOpacity: 0.05,
//         shadowRadius: 4,
//         elevation: 2,
//     },
//     iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
//     value: { fontSize: 20, fontWeight: "800", color: theme.text.primary },
//     title: { fontSize: 11, color: theme.text.muted, marginTop: 1, fontWeight: "500" },
// });

// // ─── Action Card ──────────────────────────────────────────────
// function ActionCard({ icon, title, description, color, onPress }: {
//     icon: string; title: string; description: string; color: string; onPress: () => void;
// }) {
//     return (
//         <TouchableOpacity style={ac.card} onPress={onPress} activeOpacity={0.8}>
//             <View style={[ac.iconBox, { backgroundColor: color + "15" }]}>
//                 <Ionicons name={icon as any} size={26} color={color} />
//             </View>
//             <View style={ac.text}>
//                 <AppText style={ac.title}>{title}</AppText>
//                 <AppText style={ac.description}>{description}</AppText>
//             </View>
//             <View style={[ac.arrow, { backgroundColor: color + "15" }]}>
//                 <Ionicons name="chevron-forward" size={18} color={color} />
//             </View>
//         </TouchableOpacity>
//     );
// }

// const ac = StyleSheet.create({
//     card: {
//         flexDirection: "row", alignItems: "center", gap: 14,
//         backgroundColor: theme.background.input,
//         borderRadius: 16, padding: 16, marginBottom: 10,
//         shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
//     },
//     iconBox: { width: 50, height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
//     text: { flex: 1 },
//     title: { fontSize: 15, fontWeight: "700", color: theme.text.primary },
//     description: { fontSize: 12, color: theme.text.muted, marginTop: 2 },
//     arrow: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
// });

// // ─── Quick Action Pill ────────────────────────────────────────
// function QuickPill({ icon, label, color, onPress }: {
//     icon: string; label: string; color: string; onPress: () => void;
// }) {
//     return (
//         <TouchableOpacity style={[qp.pill, { backgroundColor: color + "15", borderColor: color + "40" }]} onPress={onPress} activeOpacity={0.7}>
//             <Ionicons name={icon as any} size={16} color={color} />
//             <AppText style={[qp.label, { color }]}>{label}</AppText>
//         </TouchableOpacity>
//     );
// }

// const qp = StyleSheet.create({
//     pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
//     label: { fontSize: 13, fontWeight: "600" },
// });

// ─── Section Header ───────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
    return <AppText style={{ fontSize: 18, fontWeight: "800", color: theme.text.primary, marginBottom: 14 }}>{label}</AppText>;
}

// // ─── Main Dashboard ───────────────────────────────────────────
// export default function AdminDashboard() {
//     const { signOut } = useAuth();
//     const router = useRouter();
//     const [stats, setStats] = useState<DashboardStats | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [refreshing, setRefreshing] = useState(false);
//     const [pendingCount, setPendingCount] = useState(0);

//     useFocusEffect(
//         useCallback(() => {
//             offlineQueue.getCount().then(setPendingCount);
//         }, [])
//     );

//     async function fetchStats() {
//         try {
//             const data = await apiService.analytics.getDashboardStats();
//             setStats(data);
//         } catch (e) {
//             console.error("Failed to fetch dashboard stats", e);
//         } finally {
//             setLoading(false);
//             setRefreshing(false);
//         }
//     }

//     useEffect(() => { fetchStats(); }, []);

//     function onRefresh() { setRefreshing(true); fetchStats(); }

//     const goTo = (path: string) => router.push(path as any);

//     return (
//         <ScrollView
//             style={s.root}
//             contentContainerStyle={s.content}
//             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.secondary.sky} />}
//             showsVerticalScrollIndicator={false}
//         >
//             {/* ── Hero Header ── */}
//             <View style={s.heroHeader}>
//                 <View>
//                     <AppText style={s.greeting}>Welcome back 👋</AppText>
//                     <AppText style={s.heroTitle}>Admin Panel</AppText>
//                     <AppText style={s.heroSubtitle}>Platform Overview & Management</AppText>
//                 </View>
//                 <TouchableOpacity style={s.logoutBtn} onPress={signOut}>
//                     <Ionicons name="log-out-outline" size={20} color="#EF4444" />
//                 </TouchableOpacity>
//             </View>

//             {/* ── Offline Pending Badge ── */}
//             {pendingCount > 0 && (
//                 <View style={s.pendingBanner}>
//                     <Ionicons name="cloud-upload-outline" size={18} color="#92400E" />
//                     <AppText style={s.pendingText}>{pendingCount} pending offline submission{pendingCount > 1 ? "s" : ""}</AppText>
//                 </View>
//             )}

//             {/* ── Quick Actions Row ── */}
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillRow} contentContainerStyle={s.pillContent}>
//                 <QuickPill icon="add" label="New Event" color="#3B82F6" onPress={() => goTo("/(admin)/create-event")} />
//                 <QuickPill icon="checkmark-done" label="Attendance" color="#10B981" onPress={() => goTo("/(admin)/mark-attendance")} />
//                 <QuickPill icon="list" label="View Records" color="#8B5CF6" onPress={() => goTo("/(admin)/view-attendance")} />
//                 <QuickPill icon="newspaper" label="CMS" color="#F59E0B" onPress={() => goTo("/(admin)/content-management")} />
//                 <QuickPill icon="notifications" label="Notify" color="#EF4444" onPress={() => goTo("/(admin)/send-notification")} />
//                 <QuickPill icon="people" label="Farmers" color="#0EA5E9" onPress={() => goTo("/(admin)/beneficiaries")} />
//             </ScrollView>

//             {/* ── Stats Grid ── */}
//             <SectionHeader label="Platform Stats" />
// {loading ? (
//     <View style={s.loadingBox}>
//         <ActivityIndicator size="large" color="#3B82F6" />
//         <AppText style={s.loadingText}>Loading stats…</AppText>
//     </View>
// ) : (
//     <View style={s.statsGrid}>
//         <StatCard title="Farmers" value={stats?.totalFarmers ?? 0} icon="people" color="#3B82F6" />
//         <StatCard title="Land Coverage" value={`${stats?.totalLandCoverage?.toFixed(1) ?? 0}A`} icon="leaf" color="#10B981" />
//         <StatCard title="Livestock" value={stats?.livestockCount ?? 0} icon="paw" color="#F59E0B" />
//         <StatCard title="Active Schemes" value={stats?.activeSchemes ?? 0} icon="document-text" color="#8B5CF6" />
//         <StatCard title="Professionals" value={stats?.availableProfessionals ?? 0} icon="medkit" color="#EC4899" />
//     </View>
// )}

//             <View style={s.divider} />

//             {/* ── Event Management ── */}
//             <SectionHeader label="Event Management" />
//             <ActionCard
//                 icon="add-circle"
//                 title="Create New Event"
//                 description="Schedule a new event with date, time & cover image"
//                 color="#3B82F6"
//                 onPress={() => goTo("/(admin)/create-event")}
//             />
//             <ActionCard
//                 icon="checkmark-done-circle"
//                 title="Mark Attendance"
//                 description="Look up farmers by mobile & mark them present"
//                 color="#10B981"
//                 onPress={() => goTo("/(admin)/mark-attendance")}
//             />
//             <ActionCard
//                 icon="list-circle"
//                 title="View Attendance Records"
//                 description="Browse attendance logs per event"
//                 color="#8B5CF6"
//                 onPress={() => goTo("/(admin)/view-attendance")}
//             />

//             <View style={s.divider} />

//             {/* ── Content Management ── */}
//             <SectionHeader label="Content Management (CMS)" />
//             <ActionCard
//                 icon="images-outline"
//                 title="Manage Banners"
//                 description="Add, edit or remove home screen banners"
//                 color="#F59E0B"
//                 onPress={() => goTo("/(admin)/content-management")}
//             />
//             <ActionCard
//                 icon="document-text-outline"
//                 title="Manage Schemes"
//                 description="Create and update government scheme listings"
//                 color="#EC4899"
//                 onPress={() => goTo("/(admin)/content-management")}
//             />
//             <ActionCard
//                 icon="people-circle-outline"
//                 title="Manage Professionals"
//                 description="Add or update expert profiles"
//                 color="#6366F1"
//                 onPress={() => goTo("/(admin)/content-management")}
//             />
//             <View style={s.divider} />

//             {/* ── Notifications ── */}
//             <SectionHeader label="Notifications" />
//             <ActionCard
//                 icon="notifications"
//                 title="Send Push Notification"
//                 description="Broadcast announcements to all users or by district"
//                 color="#EF4444"
//                 onPress={() => goTo("/(admin)/send-notification")}
//             />

//             <View style={s.divider} />

//             {/* ── Farmers ── */}
//             <SectionHeader label="Farmers & Verification" />
//             <ActionCard
//                 icon="shield-checkmark"
//                 title="Verify Farmers"
//                 description="Review and approve pending farmer registrations"
//                 color="#10B981"
//                 onPress={() => goTo("/(admin)/beneficiaries")}
//             />
//             <ActionCard
//                 icon="people"
//                 title="Search Directory"
//                 description="Browse and search all registered farmers"
//                 color="#0EA5E9"
//                 onPress={() => goTo("/(admin)/beneficiaries")}
//             />
//             <ActionCard
//                 icon="person-add"
//                 title="Manual Registration"
//                 description="Register a new farmer on behalf of the community"
//                 color="#8B5CF6"
//                 onPress={() => goTo("/(admin)/add-beneficiary")}
//             />
//         </ScrollView>
//     );
// }

// const s = StyleSheet.create({
//     root: { flex: 1, backgroundColor: theme.background.screen },
//     content: { paddingBottom: 48 },

//     // hero
//     heroHeader: {
//         flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
//         paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
//         backgroundColor: theme.background.input,
//         borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
//         shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8, elevation: 4,
//         marginBottom: 16,
//     },
//     greeting: { fontSize: 13, color: theme.text.muted, fontWeight: "500" },
//     heroTitle: { fontSize: 28, fontWeight: "900", color: theme.text.primary, marginTop: 2 },
//     heroSubtitle: { fontSize: 14, color: theme.text.placeholder, marginTop: 2 },
//     logoutBtn: {
//         width: 40, height: 40, borderRadius: 12,
//         backgroundColor: theme.semantic.errorBackground,
//         justifyContent: "center", alignItems: "center",
//     },

//     // pills
//     pillRow: { marginBottom: 20 },
//     pillContent: { paddingHorizontal: 20, gap: 8 },

//     // stats
//     statsGrid: {
//         flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between",
//         gap: 10, paddingHorizontal: 20, marginBottom: 8,
//     },
//     loadingBox: { alignItems: "center", paddingVertical: 32, gap: 10 },
//     loadingText: { color: theme.text.placeholder, fontSize: 14 },

//     divider: { height: 1, backgroundColor: theme.border.subtle, marginVertical: 20, marginHorizontal: 20 },

//     // offline pending banner
//     pendingBanner: {
//         flexDirection: "row", alignItems: "center", gap: 8,
//         backgroundColor: theme.background.warningSubtle,
//         borderRadius: 10, marginHorizontal: 20, marginBottom: 12,
//         paddingHorizontal: 14, paddingVertical: 10,
//         borderWidth: 1, borderColor: theme.semantic.warningBackground,
//     },
//     pendingText: { fontSize: 13, fontWeight: "600", color: theme.semantic.warningText, flex: 1 },
// });

// src/app/(admin)/dashboard.tsx

import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import { useAuth } from "@/contexts/AuthContext";
import apiService, { DashboardStats } from "@/services/apiService";
import { offlineQueue } from "@/utils/offlineQueue";
import { theme } from "@/styles/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Hero Header ─────────────────────────────────────────────
function Hero({ pendingCount, stats, onLogout }: any) {
    return (
        <View style={hero.container}>
            <View>
                <AppText style={hero.title}>Dashboard</AppText>
                <AppText style={hero.subtitle}>
                    {stats?.totalFarmers ?? 0} farmers onboarded
                </AppText>
            </View>

            <View style={hero.right}>
                {pendingCount > 0 && (
                    <View style={hero.badge}>
                        <AppText style={hero.badgeText}>
                            {pendingCount} Pending
                        </AppText>
                    </View>
                )}

                <TouchableOpacity onPress={onLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Stat Card (Horizontal) ──────────────────────────────────
// function StatCard({ icon, value, label, color }: any) {
//     return (
//         <View style={[stat.card, { backgroundColor: color + "12" }]}>
//             <Ionicons name={icon} size={20} color={color} />
//             <AppText style={stat.value}>{value}</AppText>
//             <AppText style={stat.label}>{label}</AppText>
//         </View>
//     );
// }
function StatCard({ icon, title, value, color, onPress }: {
    icon: string; title: string; value: any; color: string; onPress?: () => void;
}) {
    return (
        <TouchableOpacity 
            style={[st.card, { borderLeftColor: color }]} 
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
        >
            <View style={[st.iconBox, { backgroundColor: color + "1A" }]}>
                <Ionicons name={icon as any} size={22} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <AppText style={st.value}>{value}</AppText>
                <AppText style={st.title}>{title}</AppText>
            </View>
            {onPress && (
                <Ionicons name="chevron-forward" size={16} color={theme.text.placeholder} style={{ opacity: 0.5 }} />
            )}
        </TouchableOpacity>
    );
}


const st = StyleSheet.create({
    card: {
        width: "48%",
        backgroundColor: theme.background.input,
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
    value: { fontSize: 20, fontWeight: "800", color: theme.text.primary },
    title: { fontSize: 11, color: theme.text.muted, marginTop: 1, fontWeight: "500" },
});

// ─── Primary Action Card ─────────────────────────────────────
function PrimaryAction({ icon, title, desc, color, onPress }: any) {
    return (
        <TouchableOpacity
            style={[primary.card, { backgroundColor: color }]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Ionicons name={icon} size={24} color="#fff" />
            <View style={{ flex: 1 }}>
                <AppText style={primary.title}>{title}</AppText>
                <AppText style={primary.desc}>{desc}</AppText>
            </View>
        </TouchableOpacity>
    );
}

// ─── Mini Action (Grid) ──────────────────────────────────────
function MiniAction({ icon, label, color, onPress }: any) {
    return (
        <TouchableOpacity style={mini.card} onPress={onPress} activeOpacity={0.8}>
            <View style={[mini.icon, { backgroundColor: color + "20" }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <AppText style={mini.label}>{label}</AppText>
        </TouchableOpacity>
    );
}

// ─── Urgent Banner ───────────────────────────────────────────
function Urgent({ pendingCount }: any) {
    if (!pendingCount) return null;

    return (
        <View style={urgent.container}>
            <Ionicons name="alert-circle" size={20} color="#F59E0B" />
            <AppText style={urgent.text}>
                {pendingCount} pending offline sync
            </AppText>
        </View>
    );
}

// ─── Main Screen ─────────────────────────────────────────────
export default function AdminDashboard() {
    const { signOut } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const [livestockVisible, setLivestockVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            offlineQueue.getCount().then(setPendingCount);
        }, [])
    );

    async function fetchStats() {
        try {
            const data = await apiService.analytics.getDashboardStats();
            setStats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        fetchStats();
    }, []);

    function onRefresh() {
        setRefreshing(true);
        fetchStats();
    }

    const goTo = (path: string) => router.push(path as any);

    return (
        <ScrollView
            style={s.root}
            contentContainerStyle={s.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
        >
            <Hero pendingCount={pendingCount} stats={stats} onLogout={signOut} />

            <Urgent pendingCount={pendingCount} />

            {/* ── Primary Actions ── */}
            <View style={s.section}>
                <PrimaryAction
                    icon="add-circle"
                    title="Create Event"
                    desc="Quick setup"
                    color="#3B82F6"
                    onPress={() => goTo("/(admin)/create-event")}
                />
                <PrimaryAction
                    icon="checkmark-done"
                    title="Mark Attendance"
                    desc="Scan or search"
                    color="#10B981"
                    onPress={() => goTo("/(admin)/mark-attendance")}
                />
            </View>

            {/* ── Stats Horizontal ── */}
            {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.statsRow}>
                {loading ? (
                    <ActivityIndicator size="small" />
                ) : (
                    <>
                        <StatCard icon="people" value={stats?.totalFarmers ?? 0} label="Farmers" color="#3B82F6" />
                        <StatCard icon="leaf" value={`${stats?.totalLandCoverage?.toFixed(1) ?? 0}`} label="Land" color="#10B981" />
                        <StatCard icon="paw" value={stats?.livestockCount ?? 0} label="Livestock" color="#F59E0B" />
                        <StatCard icon="document-text" value={stats?.activeSchemes ?? 0} label="Schemes" color="#8B5CF6" />
                    </>
                )}
            </ScrollView> */}
            {loading ? (
                <ActivityIndicator size="small" />
            ) : (
                <View style={s.statsGrid}>
                    <StatCard
                        title="Farmers"
                        value={stats?.totalFarmers ?? 0}
                        icon="people"
                        color="#3B82F6"
                        onPress={() => router.push("/(admin)/beneficiaries")}
                    />
                    <StatCard
                        title="Land Coverage"
                        value={`${stats?.totalLandCoverage?.toFixed(1) ?? 0}B`}
                        icon="leaf"
                        color="#10B981"
                        onPress={() => router.push("/(admin)/beneficiaries")}
                    />
                    <StatCard
                        title="Livestock"
                        value={stats?.livestockCount ?? 0}
                        icon="paw"
                        color="#F59E0B"
                        onPress={() => setLivestockVisible(true)}
                    />
                    <StatCard
                        title="Active Schemes"
                        value={stats?.activeSchemes?? 0}
                        icon="document-text"
                        color="#8B5CF6"
                        onPress={() => router.push("/(admin)/content-management")}
                    />
                </View>
            )}

            {/* Livestock Breakdown Modal */}
            <Modal
                visible={livestockVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setLivestockVisible(false)}
            >
                <Pressable style={s.modalOverlay} onPress={() => setLivestockVisible(false)}>
                    <Pressable style={s.modalSheet} onPress={e => e.stopPropagation()}>
                        <View style={s.modalHandle} />
                        <View style={s.modalHeader}>
                            <Ionicons name="paw" size={24} color="#F59E0B" />
                            <AppText style={s.modalTitle}>Livestock Summary</AppText>
                        </View>
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={s.breakdownGrid}>
                                {[
                                    { label: 'Cows', key: 'cow', icon: 'cow', color: '#6366F1' },
                                    { label: 'Buffaloes', key: 'buffalo', icon: 'water-outline', color: '#8B5CF6', isIon: true },
                                    { label: 'Goats', key: 'goat', icon: 'goat', color: '#F59E0B' },
                                    { label: 'Sheep', key: 'sheep', icon: 'sheep', color: '#10B981' },
                                    { label: 'Poultry', key: 'poultry', icon: 'bird', color: '#EC4899' },
                                    { label: 'Pigs', key: 'pig', icon: 'pig-variant', color: '#EF4444' },
                                    { label: 'Horses', key: 'horse', icon: 'horse-variant', color: '#3B82F6' },
                                    { label: 'Others', key: 'other', icon: 'dots-horizontal', color: '#6B7280' },
                                ].map((item) => (
                                    <View key={item.key} style={s.breakdownItem}>
                                        <View style={[s.doodleBox, { backgroundColor: item.color + '15' }]}>
                                            {item.isIon ? (
                                                <Ionicons name={item.icon as any} size={24} color={item.color} />
                                            ) : (
                                                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
                                            )}
                                        </View>
                                        <View>
                                            <AppText style={s.breakdownValue}>
                                                {(stats?.livestockBreakdown as any)?.[item.key] ?? 0}
                                            </AppText>
                                            <AppText style={s.breakdownLabel}>{item.label}</AppText>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View style={s.totalRow}>
                                <AppText style={s.totalLabel}>Grand Total</AppText>
                                <AppText style={s.totalValue}>{stats?.livestockCount ?? 0}</AppText>
                            </View>

                            <Button 
                                variant="outline" 
                                label="Close" 
                                onPress={() => setLivestockVisible(false)} 
                                style={{ marginTop: 20 }}
                            />
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>


            {/* ── Modules ── */}
            <View style={s.section}>
                <AppText style={s.sectionTitle}>Management</AppText>

                <View style={s.grid}>
                    <MiniAction icon="list" label="Old Attendance Records" color="#8B5CF6" onPress={() => goTo("/(admin)/view-attendance")} />
                    <MiniAction icon="notifications" label="Notify" color="#EF4444" onPress={() => goTo("/(admin)/send-notification")} />
                    <MiniAction icon="people" label="Farmers" color="#0EA5E9" onPress={() => goTo("/(admin)/beneficiaries")} />
                    <MiniAction icon="images" label="CMS" color="#F59E0B" onPress={() => goTo("/(admin)/content-management")} />
                </View>
            </View>

            <View style={{ height: 40 }} />

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
        </ScrollView>
    );
}

// ─── Styles ──────────────────────────────────────────────────

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background.screen },
    content: { paddingBottom: 20 },

    section: { paddingHorizontal: 20, marginTop: 20 },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
        color: theme.text.primary,
    },

    statsRow: { paddingHorizontal: 20, marginTop: 16 },

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 8,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.text.primary,
    },
    breakdownGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    breakdownItem: {
        width: '47%',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    breakdownIcon: {
        fontSize: 24,
    },
    breakdownValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.text.primary,
    },
    breakdownLabel: {
        fontSize: 11,
        color: theme.text.placeholder,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    doodleBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#F3F4F6",
        borderRadius: 16,
        marginBottom: 10,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: theme.text.primary,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: "900",
        color: "#F59E0B",
    },
});

// ─── Hero Styles ─────────────────────────────────────────────
const hero = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    title: { fontSize: 26, fontWeight: "900" },
    subtitle: { fontSize: 13, color: theme.text.muted, marginTop: 4 },
    right: { position: "absolute", right: 20, top: 60, flexDirection: "row", gap: 10 },
    badge: {
        backgroundColor: "#FEF3C7",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: { fontSize: 11, fontWeight: "700", color: "#92400E" },
});

// ─── Stat Styles ─────────────────────────────────────────────
const stat = StyleSheet.create({
    card: {
        width: 120,
        borderRadius: 16,
        padding: 14,
        marginRight: 10,
    },
    value: { fontSize: 20, fontWeight: "800", marginTop: 6 },
    label: { fontSize: 11, marginTop: 2, color: theme.text.muted },
});

// ─── Primary Actions ─────────────────────────────────────────
const primary = StyleSheet.create({
    card: {
        flexDirection: "row",
        gap: 12,
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
    },
    title: { color: "#fff", fontWeight: "800", fontSize: 15 },
    desc: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
});

// ─── Mini Actions ────────────────────────────────────────────
const mini = StyleSheet.create({
    card: {
        width: "47%",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
    },
    icon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    label: { fontSize: 13, fontWeight: "600" },
});

// ─── Urgent Banner ───────────────────────────────────────────
const urgent = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginHorizontal: 20,
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#FEF3C7",
    },
    statsGrid: {
        flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between",
        gap: 10, paddingHorizontal: 20, marginBottom: 8,
    },
    text: { fontSize: 13, fontWeight: "600", color: "#92400E" },
});