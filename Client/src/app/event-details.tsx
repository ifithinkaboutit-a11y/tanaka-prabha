// src/app/event-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { Alert, Image, Linking, Modal, Pressable, ScrollView, View, ActivityIndicator } from "react-native";
import AppText from "../components/atoms/AppText";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import { eventsApi, ApiEvent } from "@/services/apiService";
import { useTranslation } from "../i18n";
import { useAuth } from "../contexts/AuthContext";

export const options = {
    headerShown: false,
};

// ─── Status helper ─────────────────────────────────────────────────────────
const computeStatus = (event: ApiEvent): string => {
    const now = new Date();
    const eventDate = event.date ? new Date(event.date) : null;
    if (!eventDate) return event.status || "upcoming";

    const startStr = `${event.date.split("T")[0]}T${event.start_time || "00:00:00"}`;
    const endStr = `${event.date.split("T")[0]}T${event.end_time || "23:59:59"}`;
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "completed";
};

// ─── Time formatter (strips seconds) ───────────────────────────────────────
const fmtTime = (t?: string) => (t ? t.substring(0, 5) : "");

const EventDetails = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { eventId } = useLocalSearchParams<{ eventId: string }>();
    const [event, setEvent] = useState<ApiEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [consentGiven, setConsentGiven] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);

    const { user } = useAuth();

    const fetchEvent = useCallback(async () => {
        if (!eventId) return;
        try {
            setLoading(true);
            const data = await eventsApi.getById(eventId);
            setEvent(data);
        } catch (error) {
            console.error("Error fetching event:", error);
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => { fetchEvent(); }, [fetchEvent]);

    const handleApplyNow = () => {
        setConsentGiven(false);
        setShowModal(true);
    };

    const handleConfirmApplication = async () => {
        if (!consentGiven) {
            Alert.alert(t("events.consentRequired"), t("events.consentRequiredMessage"));
            return;
        }
        try {
            setRegistering(true);
            // The User object from the backend may carry mobile_number (snake_case)
            // or mobileNumber (camelCase) depending on which path populated it.
            const rawMobile = user?.mobileNumber || (user as any)?.mobile_number;
            if (!rawMobile) {
                Alert.alert(t("common.error"), t("events.mobileRequired"));
                return;
            }
            // Strip country code prefix (+91 or 91) so we always store a clean 10-digit number.
            // This prevents a mismatch with the mark-attendance flow which also uses 10 digits.
            const mobile = rawMobile.replace(/^\+91/, "").replace(/^91/, "").replace(/\D/g, "").slice(-10);
            const fullName = user?.name || "Unknown User";
            await eventsApi.register(eventId!, mobile, fullName);
            setAlreadyRegistered(true);
            setShowModal(false);
            Alert.alert(t("events.successTitle"), t("events.successMessage"));
        } catch (error: any) {
            if (error.status === 400 && error.message?.includes('already registered')) {
                setAlreadyRegistered(true);
                setShowModal(false);
                Alert.alert(t("events.alreadyRegisteredTitle"), t("events.alreadyRegisteredMessage"));
            } else {
                Alert.alert(t("common.error"), t("events.registrationFailed"));
            }
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color="#386641" />
                <AppText variant="bodySm" style={{ marginTop: 12, color: "#6B7280" }}>{t("common.loading")}</AppText>
            </View>
        );
    }

    if (!event) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
                <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
                <AppText variant="h2" style={{ color: "#374151", marginTop: 16, marginBottom: 8 }}>
                    {t("events.notFound")}
                </AppText>
                <AppText variant="bodySm" style={{ color: "#6B7280", marginBottom: 24, textAlign: "center" }}>
                    {t("events.notFoundMessage")}
                </AppText>
                <Button label={t("common.goBack") || "Go Back"} onPress={() => router.back()} />
            </View>
        );
    }

    // Compute live status
    const liveStatus = computeStatus(event);
    const isActionable = liveStatus === "upcoming" || liveStatus === "ongoing";
    const isDisabled = liveStatus === "completed" || liveStatus === "cancelled";

    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        upcoming: { bg: "#ECFDF5", text: "#059669", label: t("events.status.upcoming") || "Upcoming" },
        ongoing: { bg: "#FEF3C7", text: "#D97706", label: t("events.status.ongoing") || "Ongoing" },
        completed: { bg: "#F3F4F6", text: "#6B7280", label: t("events.status.completed") || "Completed" },
        cancelled: { bg: "#FEF2F2", text: "#EF4444", label: t("events.status.cancelled") || "Cancelled" },
    };
    const sc = statusConfig[liveStatus] || statusConfig.upcoming;

    const eventDate = event.date ? new Date(event.date) : null;
    const formattedDate = eventDate ? eventDate.toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    }) : "";

    return (
        <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Navigation Header */}
                <View style={{
                    flexDirection: "row", alignItems: "center",
                    paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16,
                    backgroundColor: "#FFFFFF",
                    borderBottomWidth: 1, borderBottomColor: "#F3F4F6"
                }}>
                    <Pressable onPress={() => router.back()} style={{
                        marginRight: 12, padding: 8,
                        backgroundColor: "#F3F4F6", borderRadius: 12,
                    }}>
                        <Ionicons name="arrow-back" size={20} color="#374151" />
                    </Pressable>
                    <AppText variant="h3" style={{ color: "#111827", flex: 1, fontSize: 18, fontWeight: "700" }} numberOfLines={1}>
                        {t("events.eventDetails")}
                    </AppText>
                </View>

                {/* Hero Image */}
                {event.hero_image_url && (
                    <Image
                        source={{ uri: event.hero_image_url }}
                        style={{ width: "100%", height: 220 }}
                        resizeMode="cover"
                    />
                )}

                {/* Event Header Card */}
                <View style={{
                    paddingHorizontal: 16, paddingVertical: 20,
                    backgroundColor: "#FFFFFF", marginBottom: 12,
                    borderBottomWidth: 1, borderBottomColor: "#F3F4F6"
                }}>
                    {/* Status Badge */}
                    <View style={{
                        alignSelf: "flex-start",
                        backgroundColor: sc.bg,
                        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
                        marginBottom: 12,
                    }}>
                        <AppText variant="bodySm" style={{
                            color: sc.text,
                            fontWeight: "700", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5
                        }}>
                            {sc.label}
                        </AppText>
                    </View>

                    {/* Title */}
                    <AppText variant="h1" style={{ color: "#111827", marginBottom: 16, fontSize: 22, fontWeight: "800", lineHeight: 28 }}>
                        {event.title}
                    </AppText>

                    {/* Meta Info */}
                    <View style={{ gap: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{
                                width: 36, height: 36, borderRadius: 10,
                                backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center"
                            }}>
                                <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <AppText variant="bodySm" style={{ color: "#9CA3AF", fontSize: 11, fontWeight: "600" }}>
                                    {t("events.date")}
                                </AppText>
                                <AppText variant="bodyMd" style={{ color: "#374151", fontWeight: "600", fontSize: 14 }}>
                                    {formattedDate}
                                </AppText>
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{
                                width: 36, height: 36, borderRadius: 10,
                                backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center"
                            }}>
                                <Ionicons name="time-outline" size={18} color="#16A34A" />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <AppText variant="bodySm" style={{ color: "#9CA3AF", fontSize: 11, fontWeight: "600" }}>
                                    {t("events.time")}
                                </AppText>
                                <AppText variant="bodyMd" style={{ color: "#374151", fontWeight: "600", fontSize: 14 }}>
                                    {fmtTime(event.start_time)} — {fmtTime(event.end_time)}
                                </AppText>
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{
                                width: 36, height: 36, borderRadius: 10,
                                backgroundColor: "#FDF2F8", alignItems: "center", justifyContent: "center"
                            }}>
                                <Ionicons name="location-outline" size={18} color="#DB2777" />
                            </View>
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <AppText variant="bodySm" style={{ color: "#9CA3AF", fontSize: 11, fontWeight: "600" }}>
                                    {t("events.location")}
                                </AppText>
                                <AppText variant="bodyMd" style={{ color: "#374151", fontWeight: "600", fontSize: 14 }} numberOfLines={2}>
                                    {event.location_name}{event.location_address ? `, ${event.location_address}` : ""}
                                </AppText>
                                {event.location_lat && event.location_lng && (
                                    <Pressable
                                        onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${event.location_lat},${event.location_lng}`)}
                                        style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}
                                    >
                                        <Ionicons name="navigate-outline" size={14} color="#16A34A" />
                                        <AppText variant="bodySm" style={{ color: "#16A34A", fontWeight: "600", fontSize: 13, marginLeft: 4 }}>
                                            {t("events.getDirections") || "Get Directions"}
                                        </AppText>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Details */}
                <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                    <Card style={{ padding: 18, marginBottom: 12, backgroundColor: "#FFFFFF", borderRadius: 16 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                            <Ionicons name="document-text-outline" size={18} color="#386641" />
                            <AppText variant="h3" style={{ color: "#111827", marginLeft: 8, fontSize: 16, fontWeight: "700" }}>
                                {t("events.aboutEvent")}
                            </AppText>
                        </View>
                        <AppText variant="bodyMd" style={{ color: "#4B5563", lineHeight: 22, fontSize: 14 }}>
                            {event.description}
                        </AppText>
                    </Card>

                    {event.requirements && (
                        <Card style={{ padding: 18, marginBottom: 12, backgroundColor: "#FFFFFF", borderRadius: 16 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#D97706" />
                                <AppText variant="h3" style={{ color: "#111827", marginLeft: 8, fontSize: 16, fontWeight: "700" }}>
                                    {t("events.requirements")}
                                </AppText>
                            </View>
                            <AppText variant="bodyMd" style={{ color: "#4B5563", lineHeight: 22, fontSize: 14 }}>
                                {event.requirements}
                            </AppText>
                        </Card>
                    )}

                    {event.guidelines_and_rules && (
                        <Card style={{ padding: 18, marginBottom: 12, backgroundColor: "#FFFBEB", borderRadius: 16, borderWidth: 1, borderColor: "#FDE68A" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                <Ionicons name="warning-outline" size={18} color="#B45309" />
                                <AppText variant="h3" style={{ color: "#92400E", marginLeft: 8, fontSize: 16, fontWeight: "700" }}>
                                    {t("events.guidelines")}
                                </AppText>
                            </View>
                            <AppText variant="bodyMd" style={{ color: "#78350F", lineHeight: 22, fontSize: 14 }}>
                                {event.guidelines_and_rules}
                            </AppText>
                        </Card>
                    )}

                    {(event.master_trainer_name || event.master_trainer_phone || event.trainer_name || event.trainer_phone || event.contact_number) && (
                        <Card style={{ padding: 18, marginBottom: 12, backgroundColor: "#FFFFFF", borderRadius: 16 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                                <Ionicons name="people-outline" size={18} color="#386641" />
                                <AppText variant="h3" style={{ color: "#111827", marginLeft: 8, fontSize: 16, fontWeight: "700" }}>
                                    {t("events.trainerAndContact") || "Trainer & Contact"}
                                </AppText>
                            </View>

                            {(event.master_trainer_name || event.master_trainer_phone) && (
                                <View style={{ marginBottom: 10 }}>
                                    <AppText variant="bodySm" style={{ color: "#9CA3AF", fontSize: 11, fontWeight: "600", marginBottom: 4 }}>
                                        {t("events.masterTrainer") || "Master Trainer"}
                                    </AppText>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                        {event.master_trainer_name && (
                                            <AppText variant="bodyMd" style={{ color: "#374151", fontWeight: "600", fontSize: 14, flex: 1 }}>
                                                {event.master_trainer_name}
                                            </AppText>
                                        )}
                                        {event.master_trainer_phone && (
                                            <Pressable
                                                onPress={() => Linking.openURL(`tel:${event.master_trainer_phone}`)}
                                                style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}
                                            >
                                                <Ionicons name="call-outline" size={16} color="#386641" />
                                                <AppText variant="bodySm" style={{ color: "#386641", fontWeight: "600", fontSize: 13, marginLeft: 4 }}>
                                                    {event.master_trainer_phone}
                                                </AppText>
                                            </Pressable>
                                        )}
                                    </View>
                                </View>
                            )}

                            {(event.trainer_name || event.trainer_phone) && (
                                <View style={{ marginBottom: 10 }}>
                                    <AppText variant="bodySm" style={{ color: "#9CA3AF", fontSize: 11, fontWeight: "600", marginBottom: 4 }}>
                                        {t("events.trainer") || "Trainer"}
                                    </AppText>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                        {event.trainer_name && (
                                            <AppText variant="bodyMd" style={{ color: "#374151", fontWeight: "600", fontSize: 14, flex: 1 }}>
                                                {event.trainer_name}
                                            </AppText>
                                        )}
                                        {event.trainer_phone && (
                                            <Pressable
                                                onPress={() => Linking.openURL(`tel:${event.trainer_phone}`)}
                                                style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}
                                            >
                                                <Ionicons name="call-outline" size={16} color="#386641" />
                                                <AppText variant="bodySm" style={{ color: "#386641", fontWeight: "600", fontSize: 13, marginLeft: 4 }}>
                                                    {event.trainer_phone}
                                                </AppText>
                                            </Pressable>
                                        )}
                                    </View>
                                </View>
                            )}

                            {event.contact_number && (
                                <View>
                                    <AppText variant="bodySm" style={{ color: "#9CA3AF", fontSize: 11, fontWeight: "600", marginBottom: 4 }}>
                                        {t("events.contactNumber") || "Contact"}
                                    </AppText>
                                    <Pressable
                                        onPress={() => Linking.openURL(`tel:${event.contact_number}`)}
                                        style={{ flexDirection: "row", alignItems: "center" }}
                                    >
                                        <Ionicons name="call-outline" size={16} color="#386641" />
                                        <AppText variant="bodySm" style={{ color: "#386641", fontWeight: "600", fontSize: 13, marginLeft: 4 }}>
                                            {event.contact_number}
                                        </AppText>
                                    </Pressable>
                                </View>
                            )}
                        </Card>
                    )}
                </View>
            </ScrollView>

            {/* ─── CTA Bar ─── */}
            <View style={{
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 28,
                borderTopWidth: 1, borderTopColor: "#E5E7EB",
                shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.04, shadowRadius: 8, elevation: 8,
            }}>
                {alreadyRegistered ? (
                    /* Already registered */
                    <View style={{
                        backgroundColor: "#F0FDF4", borderRadius: 14,
                        paddingVertical: 16, borderWidth: 1, borderColor: "#86EFAC",
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                            <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                            <AppText variant="bodyMd" style={{ color: "#15803D", fontWeight: "700", marginLeft: 10, fontSize: 16 }}>
                                {t("events.alreadyRegisteredTitle") || "Registered ✓"}
                            </AppText>
                        </View>
                    </View>
                ) : isActionable ? (
                    /* Active — Participate Now + Scan to Attend (ongoing only) */
                    <View style={{ gap: 10 }}>
                        {liveStatus === "ongoing" && (
                            <Pressable
                                onPress={() => router.push(`/scan-attendance?eventId=${eventId}`)}
                                style={({ pressed }) => ({
                                    borderRadius: 14, paddingVertical: 14,
                                    backgroundColor: pressed ? "#1E3A2F" : "#14532D",
                                    flexDirection: "row", alignItems: "center", justifyContent: "center",
                                    shadowColor: "#14532D", shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
                                })}
                            >
                                <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
                                <AppText variant="bodyMd" style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16, letterSpacing: 0.3, marginLeft: 10 }}>
                                    {t("events.scanToAttend") || "Scan to Attend"}
                                </AppText>
                            </Pressable>
                        )}
                        <Pressable
                            onPress={handleApplyNow}
                            style={({ pressed }) => ({
                                borderRadius: 14, paddingVertical: 16,
                                backgroundColor: pressed ? "#2D5231" : "#386641",
                                shadowColor: "#386641", shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
                            })}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
                                <AppText variant="bodyMd" style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16, letterSpacing: 0.3, marginLeft: 10 }}>
                                    {liveStatus === "ongoing" ? (t("events.joinNow") || "Join Now") : (t("events.participateNow") || "Participate Now")}
                                </AppText>
                            </View>
                        </Pressable>
                    </View>
                ) : (
                    /* Disabled — completed / cancelled */
                    <View style={{
                        backgroundColor: liveStatus === "cancelled" ? "#FEF2F2" : "#F3F4F6",
                        borderRadius: 14, paddingVertical: 16,
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                            <Ionicons
                                name={liveStatus === "cancelled" ? "close-circle" : "checkmark-done-circle"}
                                size={22}
                                color={liveStatus === "cancelled" ? "#F87171" : "#9CA3AF"}
                            />
                            <AppText variant="bodyMd" style={{
                                color: liveStatus === "cancelled" ? "#EF4444" : "#9CA3AF",
                                fontWeight: "700", fontSize: 16, marginLeft: 10,
                            }}>
                                {liveStatus === "cancelled"
                                    ? (t("events.status.cancelled") || "Event Cancelled")
                                    : (t("events.status.completed") || "Event Completed")}
                            </AppText>
                        </View>
                    </View>
                )}
            </View>

            {/* ─── Application Consent Modal ─── */}
            <Modal visible={showModal} transparent animationType="slide">
                <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View style={{
                        backgroundColor: "#FFFFFF",
                        borderTopLeftRadius: 28, borderTopRightRadius: 28,
                        maxHeight: "85%",
                    }}>
                        {/* Modal Header */}
                        <View style={{
                            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                            paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16,
                            borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
                        }}>
                            <AppText variant="h2" style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>
                                {t("events.confirmApplication")}
                            </AppText>
                            <Pressable onPress={() => setShowModal(false)} style={{
                                width: 32, height: 32, borderRadius: 16,
                                backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center"
                            }}>
                                <Ionicons name="close" size={18} color="#6B7280" />
                            </Pressable>
                        </View>

                        {/* Modal Body */}
                        <ScrollView style={{ paddingHorizontal: 24, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
                            {/* Applying for */}
                            <View style={{
                                backgroundColor: "#F0FDF4", borderRadius: 14, padding: 14,
                                marginBottom: 16, borderWidth: 1, borderColor: "#BBF7D0"
                            }}>
                                <AppText variant="bodySm" style={{ color: "#16A34A", fontWeight: "600", fontSize: 11, marginBottom: 4 }}>
                                    {t("events.applyingFor")}
                                </AppText>
                                <AppText variant="bodyMd" style={{ color: "#166534", fontWeight: "700", fontSize: 15 }}>
                                    {event.title}
                                </AppText>
                            </View>

                            {/* Applicant info */}
                            <View style={{ backgroundColor: "#F9FAFB", borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#E5E7EB" }}>
                                <AppText variant="bodySm" style={{ color: "#6B7280", fontWeight: "600", fontSize: 11, marginBottom: 8 }}>
                                    {t("events.yourDetails")}
                                </AppText>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                    <AppText variant="bodySm" style={{ color: "#9CA3AF", fontSize: 13 }}>{t("profile.name")}</AppText>
                                    <AppText variant="bodySm" style={{ color: "#374151", fontWeight: "600", fontSize: 13 }}>
                                        {user?.name || "—"}
                                    </AppText>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <AppText variant="bodySm" style={{ color: "#9CA3AF", fontSize: 13 }}>{t("profile.mobile")}</AppText>
                                    <AppText variant="bodySm" style={{ color: "#374151", fontWeight: "600", fontSize: 13 }}>
                                        {user?.mobileNumber || (user as any)?.mobile_number || "—"}
                                    </AppText>
                                </View>
                            </View>

                            {/* Guidelines */}
                            {event.guidelines_and_rules && (
                                <View style={{ marginBottom: 16 }}>
                                    <AppText variant="h3" style={{ color: "#111827", fontSize: 15, fontWeight: "700", marginBottom: 8 }}>
                                        {t("events.guidelinesAndRules")}
                                    </AppText>
                                    <View style={{ backgroundColor: "#FFFBEB", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#FDE68A" }}>
                                        <AppText variant="bodyMd" style={{ color: "#78350F", lineHeight: 22, fontSize: 13 }}>
                                            {event.guidelines_and_rules}
                                        </AppText>
                                    </View>
                                </View>
                            )}

                            {/* Consent Toggle */}
                            <Pressable
                                onPress={() => setConsentGiven(!consentGiven)}
                                style={{
                                    flexDirection: "row", alignItems: "center",
                                    backgroundColor: consentGiven ? "#F0FDF4" : "#F9FAFB",
                                    borderRadius: 14, padding: 14, marginBottom: 24,
                                    borderWidth: 1, borderColor: consentGiven ? "#86EFAC" : "#E5E7EB",
                                }}
                            >
                                <View style={{
                                    width: 24, height: 24, borderRadius: 6,
                                    backgroundColor: consentGiven ? "#16A34A" : "#FFFFFF",
                                    borderWidth: consentGiven ? 0 : 2,
                                    borderColor: "#D1D5DB",
                                    alignItems: "center", justifyContent: "center",
                                    marginRight: 12,
                                }}>
                                    {consentGiven && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                                </View>
                                <AppText variant="bodySm" style={{ color: "#374151", flex: 1, fontSize: 13, lineHeight: 18 }}>
                                    {t("events.consentText")}
                                </AppText>
                            </Pressable>
                        </ScrollView>

                        {/* Modal Actions */}
                        <View style={{
                            flexDirection: "row", paddingHorizontal: 24,
                            paddingTop: 12, paddingBottom: 28,
                            borderTopWidth: 1, borderTopColor: "#F3F4F6",
                            gap: 12,
                        }}>
                            <Button
                                onPress={() => setShowModal(false)}
                                variant="outline"
                                label={t("common.cancel") || "Cancel"}
                                style={{ flex: 1 }}
                            />
                            <Button
                                onPress={handleConfirmApplication}
                                variant="primary"
                                disabled={registering || !consentGiven}
                                style={{ flex: 1, backgroundColor: consentGiven ? "#386641" : "#9CA3AF" }}
                            >
                                {registering && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />}
                                <AppText variant="bodyMd" style={{ color: "#FFFFFF", fontWeight: "700" }}>
                                    {registering ? t("events.submitting") : t("events.confirmApply")}
                                </AppText>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default EventDetails;
