// src/app/(admin)/send-notification.tsx
import AppText from "@/components/atoms/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

// Notification type options
const NOTIFICATION_TYPES = [
    { key: "announcement", label: "Announcement", color: "#3B82F6" },
    { key: "info", label: "Info", color: "#6366F1" },
    { key: "alert", label: "Alert", color: "#F59E0B" },
    { key: "reminder", label: "Reminder", color: "#10B981" },
];

// Common audience targets
const AUDIENCE_OPTIONS = [
    { key: "all", label: "All Users", icon: "people", color: "#3B82F6" },
    { key: "district", label: "By District", icon: "location", color: "#8B5CF6" },
];

export default function SendNotificationScreen() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("announcement");
    const [audience, setAudience] = useState<"all" | "district">("all");
    const [district, setDistrict] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (sent) {
            router.back();
        }
    }, [sent]);

    // ── Send handler ──────────────────────────────────────────────────────────
    const handleSend = async () => {
        if (!title.trim()) {
            Alert.alert("Missing Title", "Please enter a notification title.");
            return;
        }
        if (audience === "district" && !district.trim()) {
            Alert.alert("Missing District", "Please enter a district name.");
            return;
        }

        Alert.alert(
            "Confirm Send",
            `Send "${title}" to ${audience === "all" ? "all users" : `users in ${district}`}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Send Now 🚀", style: "default", onPress: doSend },
            ]
        );
    };

    const doSend = async () => {
        setSending(true);
        try {
            const { tokenManager } = await import("@/services/apiService");
            const authToken = await tokenManager.getToken();

            const body: Record<string, string> = { title: title.trim(), type };
            if (message.trim()) body.message = message.trim();
            if (audience === "district" && district.trim()) body.district = district.trim();

            const res = await fetch(`${API_BASE}/notifications/broadcast`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (res.ok) {
                const { db_count = 0, push_count = 0 } = data.data ?? {};
                Alert.alert(
                    "✅ Sent Successfully",
                    `Notification delivered to ${db_count} users.\n${push_count} device(s) will receive a push notification.`,
                    [{ text: "Done", onPress: () => setSent(true) }]
                );
                // Reset form
                setTitle("");
                setMessage("");
                setDistrict("");
            } else {
                Alert.alert("Failed", data.message || "Could not send notification.");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Network error. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const selectedType = NOTIFICATION_TYPES.find(t => t.key === type)!;

    return (
        <View style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <Pressable onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#111827" />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <AppText style={s.headerTitle}>Send Notification</AppText>
                    <AppText style={s.headerSub}>Broadcast to app users</AppText>
                </View>
                {/* Live preview badge */}
                <View style={[s.typeBadge, { backgroundColor: selectedType.color + "20", borderColor: selectedType.color + "50" }]}>
                    <AppText style={[s.typeBadgeText, { color: selectedType.color }]}>{selectedType.label}</AppText>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                {/* ── Preview Card ── */}
                <View style={s.previewCard}>
                    <View style={s.previewIconRow}>
                        <View style={[s.previewIcon, { backgroundColor: selectedType.color + "20" }]}>
                            <Ionicons name="notifications" size={20} color={selectedType.color} />
                        </View>
                        <AppText style={s.previewApp}>Tanak Prabha</AppText>
                        <AppText style={s.previewTime}>now</AppText>
                    </View>
                    <AppText style={s.previewTitle}>{title || "Notification Title"}</AppText>
                    {message ? <AppText style={s.previewBody} numberOfLines={2}>{message}</AppText> : null}
                </View>

                {/* ── Title ── */}
                <View style={s.fieldGroup}>
                    <AppText style={s.fieldLabel}>Title *</AppText>
                    <TextInput
                        style={s.input}
                        placeholder="e.g. New Scheme Launched"
                        placeholderTextColor="#9CA3AF"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={80}
                    />
                    <AppText style={s.charCount}>{title.length}/80</AppText>
                </View>

                {/* ── Message ── */}
                <View style={s.fieldGroup}>
                    <AppText style={s.fieldLabel}>Message (optional)</AppText>
                    <TextInput
                        style={[s.input, s.inputMulti]}
                        placeholder="Add more details about the notification..."
                        placeholderTextColor="#9CA3AF"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        numberOfLines={4}
                        maxLength={250}
                        textAlignVertical="top"
                    />
                    <AppText style={s.charCount}>{message.length}/250</AppText>
                </View>

                {/* ── Type ── */}
                <View style={s.fieldGroup}>
                    <AppText style={s.fieldLabel}>Notification Type</AppText>
                    <View style={s.chipRow}>
                        {NOTIFICATION_TYPES.map(t => (
                            <Pressable
                                key={t.key}
                                style={[s.chip, type === t.key && { backgroundColor: t.color + "20", borderColor: t.color }]}
                                onPress={() => setType(t.key)}
                            >
                                <AppText style={[s.chipText, type === t.key && { color: t.color, fontWeight: "700" }]}>
                                    {t.label}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* ── Audience ── */}
                <View style={s.fieldGroup}>
                    <AppText style={s.fieldLabel}>Target Audience</AppText>
                    <View style={s.audienceRow}>
                        {AUDIENCE_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[s.audienceCard, audience === opt.key && { borderColor: opt.color, backgroundColor: opt.color + "0D" }]}
                                onPress={() => setAudience(opt.key as any)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name={opt.icon as any} size={22} color={audience === opt.key ? opt.color : "#9CA3AF"} />
                                <AppText style={[s.audienceLabel, audience === opt.key && { color: opt.color, fontWeight: "700" }]}>
                                    {opt.label}
                                </AppText>
                                {audience === opt.key && (
                                    <View style={[s.audienceCheck, { backgroundColor: opt.color }]}>
                                        <Ionicons name="checkmark" size={12} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* District input appears only when "By District" is selected */}
                    {audience === "district" && (
                        <TextInput
                            style={[s.input, { marginTop: 10 }]}
                            placeholder="Enter district name (e.g. Lucknow)"
                            placeholderTextColor="#9CA3AF"
                            value={district}
                            onChangeText={setDistrict}
                            autoCapitalize="words"
                        />
                    )}
                </View>

                {/* ── Info Banner ── */}
                <View style={s.infoBanner}>
                    <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
                    <AppText style={s.infoText}>
                        Users will receive this as a push notification on their phone AND in their in-app notification feed.
                    </AppText>
                </View>

            </ScrollView>

            {/* ── Send Button ── */}
            <View style={s.footer}>
                <TouchableOpacity
                    style={[s.sendBtn, (!title.trim() || sending) && s.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!title.trim() || sending}
                    activeOpacity={0.85}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="send" size={20} color="#fff" />
                    )}
                    <AppText style={s.sendBtnText}>
                        {sending ? "Sending…" : "Send Notification"}
                    </AppText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },

    // header
    header: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
        shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 3,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 11,
        backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center",
    },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
    headerSub: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },
    typeBadge: {
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1,
    },
    typeBadgeText: { fontSize: 11, fontWeight: "600" },

    body: { padding: 20, gap: 20, paddingBottom: 40 },

    // preview
    previewCard: {
        backgroundColor: "#fff", borderRadius: 16, padding: 16,
        shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
        borderWidth: 1, borderColor: "#F3F4F6",
    },
    previewIconRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    previewIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
    previewApp: { fontSize: 12, fontWeight: "700", color: "#374151", flex: 1 },
    previewTime: { fontSize: 11, color: "#9CA3AF" },
    previewTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 4 },
    previewBody: { fontSize: 13, color: "#6B7280", lineHeight: 18 },

    // fields
    fieldGroup: { gap: 6 },
    fieldLabel: { fontSize: 13, fontWeight: "700", color: "#374151" },
    input: {
        backgroundColor: "#fff", borderRadius: 12,
        borderWidth: 1, borderColor: "#E5E7EB",
        paddingHorizontal: 14, paddingVertical: 13,
        fontSize: 14, color: "#111827",
        shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    inputMulti: { height: 100, paddingTop: 13 },
    charCount: { fontSize: 11, color: "#9CA3AF", textAlign: "right" },

    // type chips
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#fff",
    },
    chipText: { fontSize: 13, color: "#6B7280" },

    // audience
    audienceRow: { flexDirection: "row", gap: 10 },
    audienceCard: {
        flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: "#E5E7EB",
        backgroundColor: "#fff", padding: 14, alignItems: "center", gap: 6,
        shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    audienceLabel: { fontSize: 13, color: "#6B7280", textAlign: "center" },
    audienceCheck: {
        position: "absolute", top: 8, right: 8,
        width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center",
    },

    // info
    infoBanner: {
        flexDirection: "row", gap: 10, alignItems: "flex-start",
        backgroundColor: "#EFF6FF", borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: "#BFDBFE",
    },
    infoText: { flex: 1, fontSize: 12, color: "#1D4ED8", lineHeight: 18 },

    // footer
    footer: {
        padding: 16, paddingBottom: 32,
        backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F3F4F6",
    },
    sendBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 10, backgroundColor: "#386641", borderRadius: 14,
        paddingVertical: 16,
        shadowColor: "#386641", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    sendBtnDisabled: { backgroundColor: "#9CA3AF", shadowOpacity: 0 },
    sendBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
