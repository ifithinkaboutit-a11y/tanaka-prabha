// src/components/atoms/Skeleton.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

interface SkeletonProps {
    width?: number | `${number}%`;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

/** Base pulsing skeleton block */
export function Skeleton({ width, height = 16, borderRadius = 8, style }: SkeletonProps) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[{ width: width ?? "100%", height, borderRadius, backgroundColor: "#E5E7EB", opacity }, style]}
        />
    );
}

// ─────────────────────────────────────────────────────────────
// Connect screens
// ─────────────────────────────────────────────────────────────

/** 2-column professional card skeleton (connect-listing) */
export function ProfessionalCardSkeleton() {
    return (
        <View style={styles.card}>
            <Skeleton height={96} borderRadius={12} style={{ marginBottom: 10 }} />
            <Skeleton height={14} width="70%" borderRadius={6} style={{ alignSelf: "center", marginBottom: 6 }} />
            <Skeleton height={22} width="55%" borderRadius={10} style={{ alignSelf: "center", marginBottom: 8 }} />
            <Skeleton height={12} width="45%" borderRadius={6} style={{ alignSelf: "center", marginBottom: 10 }} />
            <View style={{ flexDirection: "row", gap: 8 }}>
                <Skeleton height={34} borderRadius={12} style={{ flex: 1 }} />
                <Skeleton height={34} borderRadius={12} style={{ flex: 1 }} />
            </View>
        </View>
    );
}

/** Full detail screen skeleton (connect-detail) */
export function ProfessionalDetailSkeleton() {
    return (
        <View style={{ padding: 20 }}>
            <View style={styles.detailCard}>
                <Skeleton width={112} height={140} borderRadius={16} style={{ alignSelf: "center", marginBottom: 14 }} />
                <Skeleton height={22} width="60%" borderRadius={8} style={{ alignSelf: "center", marginBottom: 8 }} />
                <Skeleton height={26} width="45%" borderRadius={14} style={{ alignSelf: "center", marginBottom: 8 }} />
                <Skeleton height={14} width="40%" borderRadius={6} style={{ alignSelf: "center", marginBottom: 4 }} />
                <Skeleton height={14} width="30%" borderRadius={6} style={{ alignSelf: "center" }} />
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginVertical: 16 }}>
                <Skeleton height={50} borderRadius={16} style={{ flex: 1 }} />
                <Skeleton height={50} borderRadius={16} style={{ flex: 1 }} />
            </View>
            {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.detailCard, { marginBottom: 12 }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                        <Skeleton width={40} height={40} borderRadius={12} style={{ marginRight: 12 }} />
                        <Skeleton height={16} width="40%" borderRadius={6} />
                    </View>
                    <Skeleton height={12} width="85%" borderRadius={6} style={{ marginBottom: 8 }} />
                    <Skeleton height={12} width="65%" borderRadius={6} style={{ marginBottom: 8 }} />
                    <Skeleton height={12} width="75%" borderRadius={6} />
                </View>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// Home screen
// ─────────────────────────────────────────────────────────────

export function HomeScreenSkeleton() {
    return (
        <View style={{ padding: 16 }}>
            {/* Banner */}
            <Skeleton height={180} borderRadius={20} style={{ marginBottom: 24 }} />
            {/* Section title */}
            <Skeleton height={20} width="45%" borderRadius={6} style={{ marginBottom: 14 }} />
            {/* Quick action grid 2x2 */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <Skeleton height={100} width="47%" borderRadius={16} />
                <Skeleton height={100} width="47%" borderRadius={16} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }}>
                <Skeleton height={100} width="47%" borderRadius={16} />
                <Skeleton height={100} width="47%" borderRadius={16} />
            </View>
            {/* Schemes section title */}
            <Skeleton height={20} width="55%" borderRadius={6} style={{ marginBottom: 14 }} />
            {/* Scheme cards */}
            {[0, 1, 2].map((i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                    <Skeleton height={130} borderRadius={16} style={{ marginBottom: 8 }} />
                    <Skeleton height={14} width="70%" borderRadius={6} style={{ marginBottom: 6 }} />
                    <Skeleton height={12} width="45%" borderRadius={6} />
                </View>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// Programs / Events screen
// ─────────────────────────────────────────────────────────────

export function EventCardSkeleton() {
    return (
        <View style={[styles.detailCard, { marginHorizontal: 16, marginBottom: 14 }]}>
            <Skeleton height={160} borderRadius={12} style={{ marginBottom: 12 }} />
            <Skeleton height={18} width="75%" borderRadius={6} style={{ marginBottom: 8 }} />
            <Skeleton height={13} width="50%" borderRadius={6} style={{ marginBottom: 6 }} />
            <Skeleton height={13} width="60%" borderRadius={6} style={{ marginBottom: 12 }} />
            <Skeleton height={42} borderRadius={12} />
        </View>
    );
}

export function ProgramCardSkeleton() {
    return (
        <View style={[styles.detailCard, { marginHorizontal: 16, marginBottom: 12 }]}>
            <View style={{ flexDirection: "row", gap: 12 }}>
                <Skeleton width={80} height={80} borderRadius={12} />
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <Skeleton height={16} width="80%" borderRadius={6} style={{ marginBottom: 8 }} />
                    <Skeleton height={13} width="55%" borderRadius={6} style={{ marginBottom: 6 }} />
                    <Skeleton height={13} width="40%" borderRadius={6} />
                </View>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// Schemes screen
// ─────────────────────────────────────────────────────────────

export function SchemeCardSkeleton() {
    return (
        <View style={{ marginBottom: 16 }}>
            <Skeleton height={140} borderRadius={20} style={{ marginBottom: 10 }} />
            <Skeleton height={16} width="75%" borderRadius={6} style={{ marginBottom: 6 }} />
            <Skeleton height={13} width="40%" borderRadius={6} />
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// Detail pages (scheme-details, program-details, event-details)
// ─────────────────────────────────────────────────────────────

export function DetailPageSkeleton() {
    return (
        <View>
            {/* Hero image */}
            <Skeleton height={208} borderRadius={0} />
            <View style={{ padding: 20 }}>
                {/* Title */}
                <Skeleton height={28} width="85%" borderRadius={8} style={{ marginBottom: 10 }} />
                <Skeleton height={28} width="65%" borderRadius={8} style={{ marginBottom: 16 }} />
                {/* Description */}
                <Skeleton height={14} borderRadius={6} style={{ marginBottom: 8 }} />
                <Skeleton height={14} borderRadius={6} style={{ marginBottom: 8 }} />
                <Skeleton height={14} width="70%" borderRadius={6} style={{ marginBottom: 24 }} />
                {/* Tab bar */}
                <Skeleton height={46} borderRadius={12} style={{ marginBottom: 24 }} />
                {/* Content lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                    <Skeleton
                        key={i}
                        height={14}
                        width={i % 3 === 2 ? "60%" : "100%"}
                        borderRadius={6}
                        style={{ marginBottom: 10 }}
                    />
                ))}
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// Notifications screen
// ─────────────────────────────────────────────────────────────

export function NotificationItemSkeleton() {
    return (
        <View style={{ flexDirection: "row", backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1 }}>
            <Skeleton width={48} height={48} borderRadius={24} style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
                <Skeleton height={15} width="70%" borderRadius={6} style={{ marginBottom: 8 }} />
                <Skeleton height={12} width="90%" borderRadius={6} style={{ marginBottom: 6 }} />
                <Skeleton height={12} width="55%" borderRadius={6} style={{ marginBottom: 6 }} />
                <Skeleton height={11} width="30%" borderRadius={6} />
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// My Schedule screen
// ─────────────────────────────────────────────────────────────

export function AppointmentCardSkeleton() {
    return (
        <View style={{ backgroundColor: "#fff", borderRadius: 18, padding: 18, marginBottom: 14, elevation: 2 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                    <Skeleton height={18} width="65%" borderRadius={6} style={{ marginBottom: 6 }} />
                    <Skeleton height={13} width="45%" borderRadius={6} />
                </View>
                <Skeleton height={28} width={80} borderRadius={20} />
            </View>
            <View style={{ flexDirection: "row", gap: 16, marginBottom: 14 }}>
                <Skeleton height={14} width={120} borderRadius={6} />
                <Skeleton height={14} width={80} borderRadius={6} />
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
                <Skeleton height={44} borderRadius={12} style={{ flex: 1 }} />
                <Skeleton height={44} borderRadius={12} style={{ flex: 1 }} />
                <Skeleton height={44} width={48} borderRadius={12} />
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// Profile screen
// ─────────────────────────────────────────────────────────────

export function ProfileScreenSkeleton() {
    return (
        <View style={{ padding: 20 }}>
            {/* Avatar + name */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
                <Skeleton width={100} height={100} borderRadius={50} style={{ marginBottom: 14 }} />
                <Skeleton height={22} width="50%" borderRadius={8} style={{ marginBottom: 8 }} />
                <Skeleton height={14} width="35%" borderRadius={6} />
            </View>
            {/* Info rows */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={{ marginBottom: 16 }}>
                    <Skeleton height={12} width="30%" borderRadius={4} style={{ marginBottom: 6 }} />
                    <Skeleton height={44} borderRadius={12} />
                </View>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// Category / search listing screen
// ─────────────────────────────────────────────────────────────

export function ListItemSkeleton() {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 }}>
            <Skeleton width={64} height={64} borderRadius={12} style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
                <Skeleton height={16} width="70%" borderRadius={6} style={{ marginBottom: 8 }} />
                <Skeleton height={13} width="50%" borderRadius={6} style={{ marginBottom: 6 }} />
                <Skeleton height={13} width="40%" borderRadius={6} />
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        width: "48%",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    detailCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        marginBottom: 16,
    },
});
