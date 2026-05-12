// src/components/atoms/EventCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, View, Linking } from "react-native";
import { ApiEvent } from "@/services/apiService";
import { theme } from "../../styles/colors";
import AppText from "./AppText";
import { EventCountdown } from "../molecules/EventCountdown";

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
        badgeBg: theme.semantic.successBackground, badgeText: theme.semantic.successText, badgeLabel: "Upcoming",
        btnBg: theme.primary.green, btnText: theme.text.onPrimary, btnLabel: "Participate Now",
        btnIcon: "paper-plane-outline", disabled: false,
    },
    ongoing: {
        badgeBg: theme.semantic.warningBackground, badgeText: theme.semantic.warningText, badgeLabel: "Ongoing",
        btnBg: theme.semantic.ongoingAction, btnText: theme.text.onPrimary, btnLabel: "Join Now",
        btnIcon: "flash-outline", disabled: false,
    },
    completed: {
        badgeBg: theme.background.neutralSubtle, badgeText: theme.text.muted, badgeLabel: "Completed",
        btnBg: theme.border.subtle, btnText: theme.text.placeholder, btnLabel: "Event Completed",
        btnIcon: "checkmark-done-circle-outline", disabled: true,
    },
    cancelled: {
        badgeBg: theme.semantic.errorBackground, badgeText: theme.semantic.errorLight, badgeLabel: "Cancelled",
        btnBg: theme.semantic.errorBackground, btnText: theme.semantic.errorLighter, btnLabel: "Event Cancelled",
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

    // Location for map integration
    const eventLocation = (event as any).latitude && (event as any).longitude
        ? { latitude: (event as any).latitude, longitude: (event as any).longitude, address: event.location_name }
        : undefined;

    const openMaps = async () => {
        if (!eventLocation) return;
        const { latitude, longitude, address } = eventLocation;
        const url = address
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
            : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        await Linking.openURL(url).catch(() => {});
    };

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
                        source={{ uri: event.hero_image_url || `https://via.placeholder.com/400x180/${theme.primary.green.replace("#", "")}/FFFFFF?text=Event` }}
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
                            color={isBookmarked ? theme.primary.green : theme.text.secondary}
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
                            <Ionicons name="location-outline" size={14} color={theme.semantic.success} />
                            <AppText style={styles.metaText} numberOfLines={1}>
                                {event.location_name}
                            </AppText>
                        </View>
                    ) : null}

                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={14} color={theme.semantic.success} />
                        <AppText style={styles.metaText}>{formattedDate}</AppText>
                        {event.start_time ? (
                            <>
                                <Ionicons name="time-outline" size={14} color={theme.semantic.success} style={{ marginLeft: 10 }} />
                                <AppText style={styles.metaText}>
                                    {fmtTime(event.start_time)} — {fmtTime(event.end_time)}
                                </AppText>
                            </>
                        ) : null}
                    </View>

                    {/* ── Countdown Timer (for upcoming events) ── */}
                    {liveStatus === 'upcoming' && event.date && (
                        <View style={styles.countdownRow}>
                            <EventCountdown
                                eventDate={event.date}
                                eventLocation={eventLocation}
                            />
                        </View>
                    )}

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
                                    backgroundColor: pressed ? theme.primary.greenDark : sc.btnBg,
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
        backgroundColor: theme.background.input,
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
        backgroundColor: theme.background.input,
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
        color: theme.text.primary,
        fontWeight: "800",
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: -0.2,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    metaText: {
        marginLeft: 5,
        color: theme.text.subtle,
        fontSize: 12,
        fontWeight: "500",
    },
    countdownRow: {
        marginTop: 12,
        marginBottom: 4,
    },
    ctaRow: {
        flexDirection: "row",
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
