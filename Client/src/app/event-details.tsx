// src/app/event-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { Alert, Image, Linking, Modal, Pressable, ScrollView, View, ActivityIndicator, TouchableOpacity } from "react-native";
import AppText from "../components/atoms/AppText";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import { eventsApi, ApiEvent } from "@/services/apiService";
import { useTranslation } from "../i18n";
import { useAuth } from "../contexts/AuthContext";
import { theme } from "@/styles/colors";

import { useLanguageStore } from "../stores/languageStore";

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

    const { currentLanguage } = useLanguageStore();
    const isHindi = currentLanguage === "hi";

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
            <View style={{ flex: 1, backgroundColor: theme.background.screen, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={theme.primary.green} />
                <AppText variant="bodySm" style={{ marginTop: 12, color: theme.text.muted }}>{t("common.loading")}</AppText>
            </View>
        );
    }

    if (!event) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.background.screen, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
                <Ionicons name="calendar-outline" size={64} color={theme.border.card} />
                <AppText variant="h2" style={{ color: theme.text.secondary, marginTop: 16, marginBottom: 8 }}>
                    {t("events.notFound")}
                </AppText>
                <AppText variant="bodySm" style={{ color: theme.text.muted, marginBottom: 24, textAlign: "center" }}>
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
        <View style={{ flex: 1, backgroundColor: theme.background.screen }}>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Navigation Header */}
                <View style={{
                    flexDirection: "row", alignItems: "center",
                    paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16,
                    backgroundColor: theme.background.header,
                    borderBottomWidth: 1, borderBottomColor: theme.background.screen
                }}>
                    <Pressable onPress={() => router.back()} style={{
                        marginRight: 12, padding: 8,
                        backgroundColor: theme.background.screen, borderRadius: 12,
                    }}>
                        <Ionicons name="arrow-back" size={20} color={theme.text.secondary} />
                    </Pressable>
                    <AppText variant="h3" style={{ color: theme.text.primary, flex: 1, fontSize: 18, fontWeight: "700" }} numberOfLines={1}>
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
                    backgroundColor: theme.background.header, marginBottom: 12,
                    borderBottomWidth: 1, borderBottomColor: theme.background.screen
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
                    <AppText variant="h1" style={{ color: theme.text.primary, marginBottom: 16, fontSize: 22, fontWeight: "800", lineHeight: 28 }}>
                        {isHindi && event.title_hi ? event.title_hi : event.title}
                    </AppText>

                    {/* Meta Info */}
                    <View style={{ gap: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{
                                width: 36, height: 36, borderRadius: 10,
                                backgroundColor: theme.background.card, alignItems: "center", justifyContent: "center"
                            }}>
                                <Ionicons name="calendar-outline" size={18} color={theme.secondary.sky} />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <AppText variant="bodySm" style={{ color: theme.text.placeholder, fontSize: 11, fontWeight: "600" }}>
                                    {t("events.date")}
                                </AppText>
                                <AppText variant="bodyMd" style={{ color: theme.text.secondary, fontWeight: "600", fontSize: 14 }}>
                                    {formattedDate}
                                </AppText>
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{
                                width: 36, height: 36, borderRadius: 10,
                                backgroundColor: theme.background.successSubtle, alignItems: "center", justifyContent: "center"
                            }}>
                                <Ionicons name="time-outline" size={18} color="#16A34A" />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <AppText variant="bodySm" style={{ color: theme.text.placeholder, fontSize: 11, fontWeight: "600" }}>
                                    {t("events.time")}
                                </AppText>
                                <AppText variant="bodyMd" style={{ color: theme.text.secondary, fontWeight: "600", fontSize: 14 }}>
                                    {fmtTime(event.start_time)} — {fmtTime(event.end_time)}
                                </AppText>
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={{
                                width: 36, height: 36, borderRadius: 10,
                                backgroundColor: "#FDF2F8", alignItems: "center", justifyContent: "center"
                            }}>
                                <Ionicons name="location-outline" size={18} color={theme.secondary.soil} />
                            </View>
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <AppText variant="bodySm" style={{ color: theme.text.placeholder, fontSize: 11, fontWeight: "600" }}>
                                    {t("events.location")}
                                </AppText>
                                <AppText variant="bodyMd" style={{ color: theme.text.secondary, fontWeight: "600", fontSize: 14 }} numberOfLines={2}>
                                    {event.location_name}{event.location_address ? `, ${event.location_address}` : ""}
                                </AppText>
                                {(event.location_lat && event.location_lng || event.location_address || event.location_name) && (
                                    <Pressable
                                        onPress={() => {
                                            if (event.location_lat && event.location_lng) {
                                                Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${event.location_lat},${event.location_lng}`);
                                            } else {
                                                const query = encodeURIComponent(`${event.location_name || ""}${event.location_address ? `, ${event.location_address}` : ""}`);
                                                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
                                            }
                                        }}
                                        style={({ pressed }) => ({
                                            flexDirection: "row",
                                            alignItems: "center",
                                            marginTop: 12,
                                            backgroundColor: pressed ? theme.primary.green + "10" : "#FFFFFF",
                                            alignSelf: "flex-start",
                                            paddingHorizontal: 16,
                                            paddingVertical: 10,
                                            borderRadius: 12,
                                            borderWidth: 1.5,
                                            borderColor: theme.primary.green + "30",
                                            shadowColor: theme.primary.green,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 8,
                                            elevation: 3,
                                        })}
                                        className="
                                            flex-row items-center mt-3
                                            self-start
                                            px-4 py-2.5
                                            rounded-xl
                                            border-[1.5px]
                                            shadow-md
                                            active:bg-green-100
                                            bg-white
                                        "
                                    >
                                        <Ionicons name="map" size={16} color={theme.primary.green} />
                                        <AppText variant="bodySm" style={{ color: theme.primary.green, fontWeight: "800", fontSize: 13, marginLeft: 8 }}>
                                            {"Open on Maps" || t("events.openOnMaps") || t("events.getDirections")}
                                        </AppText>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Details */}
                <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                    <Card style={{ padding: 18, marginBottom: 12, backgroundColor: theme.background.input, borderRadius: 16 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                            <Ionicons name="document-text-outline" size={18} color={theme.primary.green} />
                            <AppText variant="h3" style={{ color: theme.text.primary, marginLeft: 8, fontSize: 16, fontWeight: "700" }}>
                                {t("events.aboutEvent")}
                            </AppText>
                        </View>
                        <AppText variant="bodyMd" style={{ color: theme.text.subtle, lineHeight: 22, fontSize: 14 }}>
                            {event.description}
                        </AppText>
                    </Card>

                    {(event.instructors?.length > 0) && (
                        <View style={{ marginBottom: 24 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                                <View style={{ width: 30, height: 30, borderRadius: 12, backgroundColor: theme.primary.green, alignItems: "center", justifyContent: "center" }}>
                                    <Ionicons name="people" size={18} color="#FFFFFF" />
                                </View>
                                <AppText variant="h3" style={{ color: theme.text.primary, marginLeft: 8, fontSize: 16, fontWeight: "700" }}>
                                    {t("events.trainerContact") || "Event Trainers"}
                                </AppText>
                            </View>

                            <View style={{ gap: 12 }}>
                                {event.instructors ? (
                                    event.instructors.map((ins, index) => (
                                        <Pressable key={ins.id || index} style={{ padding: 16, backgroundColor: theme.background.input, borderRadius: 20, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.05)" }}
                                            className="active:bg-green-100"
                                            onPress={() => router.push({
                                                pathname: "/connect-detail",
                                                params: { professionalId: ins.id },
                                            } as any)}>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.primary.green + "20", alignItems: "center", justifyContent: "center", overflow: 'hidden' }}>
                                                    {ins.image_url ? (
                                                        <Image source={{ uri: ins.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                                    ) : (
                                                        <Ionicons name="person" size={24} color={theme.primary.green} />
                                                    )}
                                                </View>
                                                <View style={{ flex: 1, marginLeft: 16 }}>
                                                    <AppText variant="bodySm" style={{ color: theme.primary.green, fontWeight: "800", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                                        {ins.role || t("events.trainer") || "Trainer"}
                                                    </AppText>
                                                    <AppText variant="bodyMd" style={{ color: theme.text.primary, fontWeight: "700", fontSize: 16, marginTop: 2 }}>
                                                        {ins.name}
                                                    </AppText>
                                                </View>
                                                {/* {ins.phone && (
                                                    <TouchableOpacity
                                                        onPress={() => Linking.openURL(`tel:${ins.phone}`)}
                                                        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary.green, alignItems: "center", justifyContent: "center" }}
                                                    >
                                                        <Ionicons name="call" size={18} color="#FFFFFF" />
                                                    </TouchableOpacity>
                                                )} */}
                                            </View>
                                        </Pressable>
                                    ))
                                ) : (
                                    <>
                                        {event.master_trainer_name && (
                                            <Card style={{ padding: 16, backgroundColor: theme.background.input, borderRadius: 20, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.05)" }}>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.primary.green + "20", alignItems: "center", justifyContent: "center" }}>
                                                        <Ionicons name="ribbon" size={24} color={theme.primary.green} />
                                                    </View>
                                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                                        <AppText variant="bodySm" style={{ color: theme.primary.green, fontWeight: "800", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                                            {t("events.masterTrainer") || "Lead Mentor"}
                                                        </AppText>
                                                        <AppText variant="bodyMd" style={{ color: theme.text.primary, fontWeight: "700", fontSize: 16, marginTop: 2 }}>
                                                            {event.master_trainer_name}
                                                        </AppText>
                                                    </View>
                                                    {event.master_trainer_phone && (
                                                        <TouchableOpacity
                                                            onPress={() => Linking.openURL(`tel:${event.master_trainer_phone}`)}
                                                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary.green, alignItems: "center", justifyContent: "center" }}
                                                        >
                                                            <Ionicons name="call" size={18} color="#FFFFFF" />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                {(isHindi && event.master_trainer_about_hi || event.master_trainer_about) && (
                                                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" }}>
                                                        <AppText variant="bodySm" style={{ color: theme.text.muted, lineHeight: 18, fontSize: 12 }}>
                                                            {isHindi && event.master_trainer_about_hi ? event.master_trainer_about_hi : event.master_trainer_about}
                                                        </AppText>
                                                    </View>
                                                )}
                                            </Card>
                                        )}

                                        {event.trainer_name && (
                                            <Card style={{ padding: 16, backgroundColor: theme.background.input, borderRadius: 20, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.05)" }}>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.secondary.sky + "20", alignItems: "center", justifyContent: "center" }}>
                                                        <Ionicons name="person" size={24} color={theme.secondary.sky} />
                                                    </View>
                                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                                        <AppText variant="bodySm" style={{ color: theme.secondary.sky, fontWeight: "800", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                                            {t("events.trainer") || "Speaker"}
                                                        </AppText>
                                                        <AppText variant="bodyMd" style={{ color: theme.text.primary, fontWeight: "700", fontSize: 16, marginTop: 2 }}>
                                                            {event.trainer_name}
                                                        </AppText>
                                                    </View>
                                                    {event.trainer_phone && (
                                                        <TouchableOpacity
                                                            onPress={() => Linking.openURL(`tel:${event.trainer_phone}`)}
                                                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.secondary.sky, alignItems: "center", justifyContent: "center" }}
                                                        >
                                                            <Ionicons name="call" size={18} color="#FFFFFF" />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </Card>
                                        )}
                                    </>
                                )}
                            </View>

                            {event.contact_number && (
                                <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                    <AppText variant="bodySm" style={{ color: theme.text.muted, fontWeight: "600" }}>
                                        Need help?
                                    </AppText>
                                    <Pressable onPress={() => Linking.openURL(`tel:${event.contact_number}`)}>
                                        <AppText variant="bodySm" style={{ color: theme.primary.green, fontWeight: "800", textDecorationLine: "underline" }}>
                                            Contact Support
                                        </AppText>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    )}

                    {event.requirements && (
                        <Card style={{ padding: 18, marginBottom: 12, backgroundColor: theme.background.input, borderRadius: 16 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#D97706" />
                                <AppText variant="h3" style={{ color: theme.text.primary, marginLeft: 8, fontSize: 16, fontWeight: "700" }}>
                                    {t("events.requirements")}
                                </AppText>
                            </View>
                            <AppText variant="bodyMd" style={{ color: theme.text.subtle, lineHeight: 22, fontSize: 14 }}>
                                {event.requirements}
                            </AppText>
                        </Card>
                    )}

                    {event.guidelines_and_rules && (
                        <Card style={{ padding: 18, marginBottom: 12, backgroundColor: theme.background.warningSubtle, borderRadius: 16, borderWidth: 1, borderColor: theme.semantic.warningBackground }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                <Ionicons name="warning-outline" size={18} color={theme.semantic.warningText} />
                                <AppText variant="h3" style={{ color: theme.semantic.warningText, marginLeft: 8, fontSize: 16, fontWeight: "700" }}>
                                    {t("events.guidelines")}
                                </AppText>
                            </View>
                            <AppText variant="bodyMd" style={{ color: theme.text.secondary, lineHeight: 22, fontSize: 14 }}>
                                {event.guidelines_and_rules}
                            </AppText>
                        </Card>
                    )}
                </View>
            </ScrollView>

            {/* ─── CTA Bar ─── */}
            <View style={{
                backgroundColor: theme.background.header,
                paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 28,
                borderTopWidth: 1, borderTopColor: theme.border.subtle,
                shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.04, shadowRadius: 8, elevation: 8,
            }}>
                {alreadyRegistered ? (
                    /* Already registered */
                    <View style={{
                        backgroundColor: theme.background.successSubtle, borderRadius: 14,
                        paddingVertical: 16, borderWidth: 1, borderColor: "#86EFAC",
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                            <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                            <AppText variant="bodyMd" style={{ color: "#15803D", fontWeight: "700", marginLeft: 10, fontSize: 16 }}>
                                {t("events.appliedParticipated") || "Applied / Participated"}
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
                                    backgroundColor: pressed ? theme.primary.greenDark : theme.primary.greenDark,
                                    flexDirection: "row", alignItems: "center", justifyContent: "center",
                                    shadowColor: theme.primary.greenDark, shadowOffset: { width: 0, height: 4 },
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
                                backgroundColor: pressed ? "#2D5231" : theme.primary.green,
                                shadowColor: theme.primary.green, shadowOffset: { width: 0, height: 4 },
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
                        backgroundColor: liveStatus === "cancelled" ? theme.semantic.errorBackground : theme.background.screen,
                        borderRadius: 14, paddingVertical: 16,
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                            <Ionicons
                                name={liveStatus === "cancelled" ? "close-circle" : "checkmark-done-circle"}
                                size={22}
                                color={liveStatus === "cancelled" ? theme.semantic.errorLighter : theme.text.placeholder}
                            />
                            <AppText variant="bodyMd" style={{
                                color: liveStatus === "cancelled" ? theme.semantic.error : theme.text.placeholder,
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
                        backgroundColor: theme.background.input,
                        borderTopLeftRadius: 28, borderTopRightRadius: 28,
                        maxHeight: "85%",
                    }}>
                        {/* Modal Header */}
                        <View style={{
                            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                            paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16,
                            borderBottomWidth: 1, borderBottomColor: theme.background.screen,
                        }}>
                            <AppText variant="h2" style={{ fontSize: 20, fontWeight: "800", color: theme.text.primary }}>
                                {t("events.confirmApplication")}
                            </AppText>
                            <Pressable onPress={() => setShowModal(false)} style={{
                                width: 32, height: 32, borderRadius: 16,
                                backgroundColor: theme.background.screen, alignItems: "center", justifyContent: "center"
                            }}>
                                <Ionicons name="close" size={18} color={theme.text.muted} />
                            </Pressable>
                        </View>

                        {/* Modal Body */}
                        <ScrollView style={{ paddingHorizontal: 24, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
                            {/* Applying for */}
                            <View style={{
                                backgroundColor: theme.background.successSubtle, borderRadius: 14, padding: 14,
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
                            <View style={{ backgroundColor: theme.background.neutralSubtle, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: theme.border.subtle }}>
                                <AppText variant="bodySm" style={{ color: theme.text.muted, fontWeight: "600", fontSize: 11, marginBottom: 8 }}>
                                    {t("events.yourDetails")}
                                </AppText>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                    <AppText variant="bodySm" style={{ color: theme.text.placeholder, fontSize: 13 }}>{t("profile.name")}</AppText>
                                    <AppText variant="bodySm" style={{ color: theme.text.secondary, fontWeight: "600", fontSize: 13 }}>
                                        {user?.name || "—"}
                                    </AppText>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <AppText variant="bodySm" style={{ color: theme.text.placeholder, fontSize: 13 }}>{t("profile.mobile")}</AppText>
                                    <AppText variant="bodySm" style={{ color: theme.text.secondary, fontWeight: "600", fontSize: 13 }}>
                                        {user?.mobileNumber || (user as any)?.mobile_number || "—"}
                                    </AppText>
                                </View>
                            </View>

                            {/* Guidelines */}
                            {event.guidelines_and_rules && (
                                <View style={{ marginBottom: 16 }}>
                                    <AppText variant="h3" style={{ color: theme.text.primary, fontSize: 15, fontWeight: "700", marginBottom: 8 }}>
                                        {t("events.guidelinesAndRules")}
                                    </AppText>
                                    <View style={{ backgroundColor: theme.background.warningSubtle, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.semantic.warningBackground }}>
                                        <AppText variant="bodyMd" style={{ color: theme.text.secondary, lineHeight: 22, fontSize: 13 }}>
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
                                    backgroundColor: consentGiven ? theme.background.successSubtle : theme.background.neutralSubtle,
                                    borderRadius: 14, padding: 14, marginBottom: 24,
                                    borderWidth: 1, borderColor: consentGiven ? "#86EFAC" : theme.border.subtle,
                                }}
                            >
                                <View style={{
                                    width: 24, height: 24, borderRadius: 6,
                                    backgroundColor: consentGiven ? "#16A34A" : theme.background.input,
                                    borderWidth: consentGiven ? 0 : 2,
                                    borderColor: theme.border.card,
                                    alignItems: "center", justifyContent: "center",
                                    marginRight: 12,
                                }}>
                                    {consentGiven && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                                </View>
                                <AppText variant="bodySm" style={{ color: theme.text.secondary, flex: 1, fontSize: 13, lineHeight: 18 }}>
                                    {t("events.consentText")}
                                </AppText>
                            </Pressable>
                        </ScrollView>

                        {/* Modal Actions */}
                        <View style={{
                            flexDirection: "row", paddingHorizontal: 24,
                            paddingTop: 12, paddingBottom: 28,
                            borderTopWidth: 1, borderTopColor: theme.background.screen,
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
                                style={{ flex: 1, backgroundColor: consentGiven ? theme.primary.green : theme.text.placeholder }}
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
