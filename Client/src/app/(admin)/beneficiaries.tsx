// src/app/(admin)/beneficiaries.tsx
import AppText from "@/components/atoms/AppText";
import apiService, { ApiUserProfile } from "@/services/apiService";
import { filterFarmers } from "@/utils/filterFarmers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Pure filtering logic (exported for testing) ─────────────
export { filterFarmers } from "@/utils/filterFarmers";

// ─── Farmer Row ───────────────────────────────────────────────
function FarmerRow({ farmer, onPress }: { farmer: ApiUserProfile; onPress: () => void }) {
    const initials = farmer.name
        ? farmer.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    return (
        <TouchableOpacity style={fr.card} onPress={onPress} activeOpacity={0.75}>
            {/* Avatar */}
            <View style={fr.avatar}>
                <AppText style={fr.avatarText}>{initials}</AppText>
            </View>

            {/* Info */}
            <View style={fr.info}>
                <AppText style={fr.name}>{farmer.name || "—"}</AppText>
                <View style={fr.metaRow}>
                    {farmer.village ? (
                        <View style={fr.metaItem}>
                            <Ionicons name="home-outline" size={11} color="#9CA3AF" />
                            <AppText style={fr.metaText}>{farmer.village}</AppText>
                        </View>
                    ) : null}
                    {farmer.district ? (
                        <View style={fr.metaItem}>
                            <Ionicons name="business-outline" size={11} color="#9CA3AF" />
                            <AppText style={fr.metaText}>{farmer.district}</AppText>
                        </View>
                    ) : null}
                </View>
                <View style={fr.metaItem}>
                    <Ionicons name="call-outline" size={11} color="#9CA3AF" />
                    <AppText style={fr.metaText}>{farmer.mobile_number}</AppText>
                </View>
            </View>

            {/* Badge + chevron */}
            <View style={fr.right}>
                <View style={[fr.badge, farmer.is_verified ? fr.badgeVerified : fr.badgePending]}>
                    <AppText style={[fr.badgeText, farmer.is_verified ? fr.badgeTextVerified : fr.badgeTextPending]}>
                        {farmer.is_verified ? "Verified" : "Pending"}
                    </AppText>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" style={{ marginTop: 6 }} />
            </View>
        </TouchableOpacity>
    );
}

const fr = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    info: { flex: 1, gap: 3 },
    name: { fontSize: 15, fontWeight: "700", color: "#111827" },
    metaRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { fontSize: 12, color: "#6B7280" },
    right: { alignItems: "flex-end" },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    badgeVerified: { backgroundColor: "#D1FAE5" },
    badgePending: { backgroundColor: "#FEF3C7" },
    badgeText: { fontSize: 11, fontWeight: "600" },
    badgeTextVerified: { color: "#059669" },
    badgeTextPending: { color: "#D97706" },
});

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
    return (
        <View style={es.container}>
            <Ionicons name="search-outline" size={52} color="#D1D5DB" />
            <AppText style={es.title}>
                {query ? "No farmers match your search" : "No farmers found"}
            </AppText>
            {query ? (
                <AppText style={es.subtitle}>Try a different name or mobile number</AppText>
            ) : null}
        </View>
    );
}

const es = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
    title: { fontSize: 16, fontWeight: "700", color: "#374151", textAlign: "center" },
    subtitle: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
});

// ─── Main Screen ──────────────────────────────────────────────
export default function Beneficiaries() {
    const router = useRouter();
    const [farmers, setFarmers] = useState<ApiUserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [query, setQuery] = useState("");

    const fetchFarmers = useCallback(async () => {
        try {
            const users = await apiService.user.getAll({ limit: 100, offset: 0 });
            setFarmers(users);
        } catch (e) {
            console.error("Failed to fetch farmers", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchFarmers(); }, [fetchFarmers]);

    function onRefresh() {
        setRefreshing(true);
        fetchFarmers();
    }

    const filtered = filterFarmers(farmers, query);

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <AppText style={s.loadingText}>Loading farmers…</AppText>
            </View>
        );
    }

    return (
        <View style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#1F2937" />
                </TouchableOpacity>
                <View style={s.headerTitle}>
                    <AppText style={s.title}>Beneficiaries</AppText>
                    <AppText style={s.subtitle}>{farmers.length} registered farmers</AppText>
                </View>
                <TouchableOpacity
                    style={s.addBtn}
                    onPress={() => router.push("/(admin)/add-beneficiary" as any)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="person-add" size={18} color="#fff" />
                    <AppText style={s.addBtnText}>Add</AppText>
                </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View style={s.searchRow}>
                <Ionicons name="search-outline" size={18} color="#9CA3AF" style={s.searchIcon} />
                <TextInput
                    style={s.searchInput}
                    placeholder="Search by name or mobile number"
                    placeholderTextColor="#9CA3AF"
                    value={query}
                    onChangeText={setQuery}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
                {query.length > 0 ? (
                    <TouchableOpacity onPress={() => setQuery("")} style={s.clearBtn}>
                        <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* List */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                contentContainerStyle={s.listContent}
                renderItem={({ item }) => (
                    <FarmerRow
                        farmer={item}
                        onPress={() =>
                            router.push({
                                pathname: "/(admin)/beneficiary-detail",
                                params: { id: item.id },
                            } as any)
                        }
                    />
                )}
                ListEmptyComponent={<EmptyState query={query} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#3B82F6"
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6", gap: 12 },
    loadingText: { color: "#9CA3AF", fontSize: 14 },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 12,
    },
    backBtn: {
        padding: 8,
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
    },
    headerTitle: { flex: 1 },
    title: { fontSize: 20, fontWeight: "800", color: "#111827" },
    subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#10B981",
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 12,
    },
    addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 14,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        paddingVertical: 13,
        fontSize: 15,
        color: "#1F2937",
    },
    clearBtn: { paddingLeft: 8 },

    listContent: { paddingHorizontal: 16, paddingBottom: 32 },
});
