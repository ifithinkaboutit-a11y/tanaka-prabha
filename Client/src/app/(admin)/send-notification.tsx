// src/app/(admin)/send-notification.tsx
import AppText from "@/components/atoms/AppText";
import { KeyboardAwareScrollView } from "@/components/atoms/KeyboardAwareScrollView";
import { theme } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const NOTIFICATION_TYPES = [
    { key: "announcement", label: "Announcement", color: "#3B82F6" },
    { key: "info",         label: "Info",         color: "#6366F1" },
    { key: "alert",        label: "Alert",        color: "#F59E0B" },
    { key: "reminder",     label: "Reminder",     color: "#10B981" },
];

const AUDIENCE_OPTIONS = [
    { key: "all",      label: "All Users",   icon: "people",   color: "#3B82F6" },
    { key: "district", label: "By District", icon: "location", color: "#8B5CF6" },
];

export default function SendNotificationScreen() {
    const router = useRouter();

    const [title,    setTitle]    = useState("");
    const [message,  setMessage]  = useState("");
    const [type,     setType]     = useState("announcement");
    const [audience, setAudience] = useState<"all" | "district">("all");
    const [district, setDistrict] = useState("");
    const [sending,  setSending]  = useState(false);
    const [sent,     setSent]     = useState(false);

    useEffect(() => {
        if (sent) router.back();
    }, [sent]);

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
    const canSend = title.trim().length > 0 && !sending;

    return (
        <View style={s.root}>
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={s.header}>
                <Pressable onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#111827" />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <AppText style={s.headerTitle}>Send Notification</AppText>
                    <AppText style={s.headerSub}>Broadcast to app users</AppText>
                </View>
                <View style={[s.typeBadge, { backgroundColor: selectedType.color + "20", borderColor: selectedType.color + "50" }]}>
                    <AppText style={[s.typeBadgeText, { color: selectedType.color }]}>{selectedType.label}</AppText>
                </View>
            </View>

            {/* ── Scrollable body — KeyboardAwareScrollView handles keyboard on both platforms ── */}
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={s.body}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                extraScrollHeight={80}
            >
                {/* Preview Card */}
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

                {/* Title */}
                <View style={s.fieldGroup}>
                    <AppText style={s.fieldLabel}>Title *</AppText>
                    <TextInput
                        style={s.input}
                        placeholder="e.g. New Scheme Launched"
                        placeholderTextColor="#9CA3AF"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={80}
                        returnKeyType="next"
                    />
                    <AppText style={s.charCount}>{title.length}/80</AppText>
                </View>

                {/* Message */}
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

                {/* Type chips */}
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

                {/* Audience */}
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

                    {audience === "district" && (
                        <TextInput
                            style={[s.input, { marginTop: 10 }]}
                            placeholder="Enter district name (e.g. Lucknow)"
                            placeholderTextColor="#9CA3AF"
                            value={district}
                            onChangeText={setDistrict}
                            autoCapitalize="words"
                            returnKeyType="done"
                        />
                    )}
                </View>

                {/* Info banner */}
                <View style={s.infoBanner}>
                    <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
                    <AppText style={s.infoText}>
                        Users will receive this as a push notification on their phone AND in their in-app notification feed.
                    </AppText>
                </View>

                {/* Extra bottom padding so content clears the footer */}
                <View style={{ height: 16 }} />
            </KeyboardAwareScrollView>

            {/* ── Fixed footer send button ── */}
            <View style={s.footer}>
                <TouchableOpacity
                    style={[s.sendBtn, !canSend && s.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!canSend}
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
        </View>
    );
}

const s = StyleSheet.create({
    root: { 
        flex: 1, 
        backgroundColor: theme.background.screen,   
    },

    // header
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: theme.background.input,
        borderBottomWidth: 1,
        borderBottomColor: theme.background.screen,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: theme.background.screen,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    headerTitle: { fontSize: 17, fontWeight: "800", color: theme.text.primary },
    headerSub: { fontSize: 12, color: theme.text.placeholder, marginTop: 1 },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
    },
    typeBadgeText: { fontSize: 11, fontWeight: "600" },

    // body
    body: { padding: 20, paddingBottom: 24 },

    // preview
    previewCard: {
        backgroundColor: theme.background.input,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: theme.background.screen,
    },
    previewIconRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    previewIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    previewApp: { fontSize: 12, fontWeight: "700", color: "#374151", flex: 1 },
    previewTime: { fontSize: 11, color: theme.text.placeholder },
    previewTitle: { fontSize: 14, fontWeight: "700", color: theme.text.primary, marginBottom: 4 },
    previewBody: { fontSize: 13, color: theme.text.muted, lineHeight: 18 },

    // fields
    fieldGroup: { marginBottom: 20 },
    fieldLabel: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 },
    input: {
        backgroundColor: theme.background.input,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border.subtle,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 14,
        color: theme.text.primary,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    inputMulti: { height: 100, paddingTop: 13 },
    charCount: { fontSize: 11, color: theme.text.placeholder, textAlign: "right", marginTop: 4 },

    // type chips
    chipRow: { flexDirection: "row", flexWrap: "wrap" },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: theme.border.subtle,
        backgroundColor: theme.background.input,
        marginRight: 8,
        marginBottom: 8,
    },
    chipText: { fontSize: 13, color: theme.text.muted },

    // audience
    audienceRow: { flexDirection: "row" },
    audienceCard: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: theme.border.subtle,
        backgroundColor: theme.background.input,
        padding: 14,
        alignItems: "center",
        marginRight: 10,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    audienceLabel: { fontSize: 13, color: theme.text.muted, textAlign: "center", marginTop: 6 },
    audienceCheck: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center",
    },

    // info
    infoBanner: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#EFF6FF",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#BFDBFE",
        marginBottom: 4,
    },
    infoText: { flex: 1, fontSize: 12, color: "#1D4ED8", lineHeight: 18, marginLeft: 10 },

    // footer
    footer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 32,
        backgroundColor: theme.background.input,
        borderTopWidth: 1,
        borderTopColor: theme.background.screen,
    },
    sendBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.primary.green,
        borderRadius: 14,
        paddingVertical: 16,
        shadowColor: theme.primary.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sendBtnDisabled: { backgroundColor: theme.text.placeholder, shadowOpacity: 0, elevation: 0 },
    sendBtnText: { fontSize: 16, fontWeight: "700", color: "#fff", marginLeft: 10 },
});
