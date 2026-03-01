// src/components/atoms/EventCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { ApiEvent } from "@/services/apiService";
import AppText from "./AppText";

type EventCardProps = {
    event: ApiEvent;
    onPress: () => void;
    onParticipate?: (event: ApiEvent) => void;
};

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
    badgeBg: string; badgeText: string; badgeLabel: string;
    btnBg: string; btnText: string; btnLabel: string;
    btnIcon: string; disabled: boolean;
}> = {
    upcoming: {
        badgeBg: "#DCFCE7", badgeText: "#15803D", badgeLabel: "Upcoming",
        btnBg: "#386641", btnText: "#FFFFFF", btnLabel: "Participate Now",
        btnIcon: "paper-plane-outline", disabled: false,
    },
    ongoing: {
        badgeBg: "#FEF3C7", badgeText: "#B45309", badgeLabel: "Ongoing",
        btnBg: "#D97706", btnText: "#FFFFFF", btnLabel: "Join Now",
        btnIcon: "flash-outline", disabled: false,
    },
    completed: {
        badgeBg: "#F3F4F6", badgeText: "#6B7280", badgeLabel: "Completed",
        btnBg: "#E5E7EB", btnText: "#9CA3AF", btnLabel: "Event Completed",
        btnIcon: "checkmark-done-circle-outline", disabled: true,
    },
    cancelled: {
        badgeBg: "#FEF2F2", badgeText: "#EF4444", badgeLabel: "Cancelled",
        btnBg: "#FEF2F2", btnText: "#F87171", btnLabel: "Event Cancelled",
        btnIcon: "close-circle-outline", disabled: true,
    },
};

function computeStatus(event: ApiEvent): string {
    const now = new Date();
    if (!event.date) return event.status || "upcoming";
    const dateStr = event.date.split("T")[0];
    const start = new Date(`${dateStr}T${event.start_time || "00:00:00"}`);
    const end = new Date(`${dateStr}T${event.end_time || "23:59:59"}`);
    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "completed";
}

const fmtTime = (t?: string) => (t ? t.substring(0, 5) : "");

export default function EventCard({ event, onPress, onParticipate }: EventCardProps) {
    const [isPressed, setIsPressed] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const liveStatus = computeStatus(event);
    const sc = STATUS_CONFIG[liveStatus] ?? STATUS_CONFIG.upcoming;

    const formattedDate = event.date
        ? new Date(event.date).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
        })
        : "";

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
        >
            <View style={[styles.card, { transform: [{ scale: isPressed ? 0.98 : 1 }] }]}>

                {/* ── Hero Image ── */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: event.hero_image_url || "https://via.placeholder.com/400x180/386641/FFFFFF?text=Event" }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    {/* Status Badge — row of text only, no icon */}
                    <View style={[styles.badge, { backgroundColor: sc.badgeBg }]}>
                        <AppText style={[styles.badgeText, { color: sc.badgeText }]}>
                            {sc.badgeLabel.toUpperCase()}
                        </AppText>
                    </View>
                    {/* Bookmark */}
                    <Pressable
                        onPress={(e) => { e.stopPropagation(); setIsBookmarked(!isBookmarked); }}
                        style={styles.bookmarkBtn}
                    >
                        <Ionicons
                            name={isBookmarked ? "bookmark" : "bookmark-outline"}
                            size={18}
                            color={isBookmarked ? "#386641" : "#1F2937"}
                        />
                    </Pressable>
                </View>

                {/* ── Content ── */}
                <View style={styles.content}>
                    <AppText
                        variant="bodyMd"
                        style={styles.title}
                        numberOfLines={2}
                    >
                        {event.title}
                    </AppText>

                    {/* ── Meta rows — each row: icon + text side by side ── */}
                    {event.location_name ? (
                        <View style={styles.metaRow}>
                            <Ionicons name="location-outline" size={14} color="#16A34A" />
                            <AppText style={styles.metaText} numberOfLines={1}>
                                {event.location_name}
                            </AppText>
                        </View>
                    ) : null}

                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={14} color="#16A34A" />
                        <AppText style={styles.metaText}>{formattedDate}</AppText>
                        {event.start_time ? (
                            <>
                                <Ionicons name="time-outline" size={14} color="#16A34A" style={{ marginLeft: 10 }} />
                                <AppText style={styles.metaText}>
                                    {fmtTime(event.start_time)} — {fmtTime(event.end_time)}
                                </AppText>
                            </>
                        ) : null}
                    </View>

                    {/* ── CTA Button ── */}
                    {sc.disabled ? (
                        /* Disabled state — plain View so no press feedback issues */
                        <View style={[styles.ctaRow, { backgroundColor: sc.btnBg }]}>
                            <Ionicons name={sc.btnIcon as any} size={16} color={sc.btnText} />
                            <AppText style={[styles.ctaText, { color: sc.btnText, marginLeft: 8 }]}>
                                {sc.btnLabel}
                            </AppText>
                        </View>
                    ) : (
                        /* Active state — Pressable */
                        <Pressable
                            onPress={(e) => {
                                e.stopPropagation();
                                onParticipate ? onParticipate(event) : onPress();
                            }}
                        >
                            {({ pressed }) => (
                                <View style={[styles.ctaRow, {
                                    backgroundColor: pressed ? "#2D5231" : sc.btnBg,
                                }]}>
                                    <Ionicons name={sc.btnIcon as any} size={16} color={sc.btnText} />
                                    <AppText style={[styles.ctaText, { color: sc.btnText, marginLeft: 8 }]}>
                                        {sc.btnLabel}
                                    </AppText>
                                </View>
                            )}
                        </Pressable>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    imageContainer: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: 160,
    },
    badge: {
        position: "absolute",
        top: 12,
        left: 12,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    badgeText: {
        fontWeight: "700",
        fontSize: 10,
        letterSpacing: 0.6,
    },
    bookmarkBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    content: {
        padding: 14,
    },
    title: {
        marginBottom: 8,
        color: "#111827",
        fontWeight: "800",
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: -0.2,
    },
    metaRow: {
        flexDirection: "row",   // ← explicit: icon + text horizontal
        alignItems: "center",
        marginBottom: 6,
    },
    metaText: {
        marginLeft: 5,
        color: "#4B5563",
        fontSize: 12,
        fontWeight: "500",
    },
    ctaRow: {
        flexDirection: "row",   // ← explicit: icon + label horizontal
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        paddingVertical: 11,
        marginTop: 6,
    },
    ctaText: {
        fontWeight: "700",
        fontSize: 13,
        letterSpacing: 0.2,
    },
});
