import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, View, ActivityIndicator, Switch } from "react-native";
import AppText from "../components/atoms/AppText";
import Button from "../components/atoms/Button";
import Card from "../components/atoms/Card";
import { eventsApi, ApiEvent } from "@/services/apiService";
import { useTranslation } from "../i18n";
import { useAuth } from "../contexts/AuthContext";

export const options = {
    headerShown: false,
};

const EventDetails = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { eventId } = useLocalSearchParams<{ eventId: string }>();
    const [event, setEvent] = useState<ApiEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [consentGiven, setConsentGiven] = useState(false);

    // Get user details
    const { user } = useAuth();

    useEffect(() => {
        const fetchEvent = async () => {
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
        };
        fetchEvent();
    }, [eventId]);

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
            if (!user?.mobile_number) {
                Alert.alert(t("common.error"), t("events.mobileRequired"));
                return;
            }
            const fullName = user.name || "Unknown User";
            await eventsApi.register(eventId!, user.mobile_number, fullName);
            Alert.alert(t("events.successTitle"), t("events.successMessage"));
            setShowModal(false);
        } catch (error: any) {
            if (error.status === 400 && error.message?.includes('already registered')) {
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
                        backgroundColor: event.status === "upcoming" ? "#ECFDF5" : event.status === "completed" ? "#F3F4F6" : "#FEF3C7",
                        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
                        marginBottom: 12,
                    }}>
                        <AppText variant="bodySm" style={{
                            color: event.status === "upcoming" ? "#059669" : event.status === "completed" ? "#6B7280" : "#D97706",
                            fontWeight: "700", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5
                        }}>
                            {t(`events.status.${event.status}`) || event.status}
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
                                    {event.start_time} — {event.end_time}
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
                </View>
            </ScrollView>

            {/* ─── Apply Now CTA ─── */}
            {event.status === 'upcoming' && (
                <View style={{
                    backgroundColor: "#FFFFFF",
                    paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 28,
                    borderTopWidth: 1, borderTopColor: "#E5E7EB",
                    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.04, shadowRadius: 8, elevation: 8,
                }}>
                    <Button
                        onPress={handleApplyNow}
                        variant="primary"
                        size="lg"
                        style={{
                            width: "100%",
                            shadowColor: "#386641",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                    >
                        <Ionicons name="paper-plane" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <AppText variant="bodyMd" style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16, letterSpacing: 0.3 }}>
                            {t("events.applyNow")}
                        </AppText>
                    </Button>
                </View>
            )}

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
                                        {user?.mobile_number || "—"}
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
