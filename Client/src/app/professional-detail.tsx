// src/app/professional-detail.tsx
// Professional detail page with full profile + Book Appointment CTA
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    Pressable,
    ScrollView,
    View,
} from "react-native";
import AppText from "../components/atoms/AppText";
import { Professional, professionalsApi } from "../services/apiService";
import { theme } from "../styles/colors";
import { useTranslation } from "../i18n";

export default function ProfessionalDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t } = useTranslation();
    const [professional, setProfessional] = useState<Professional | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await professionalsApi.getById(id!);
                setProfessional(data as any ?? null);
            } catch (err) {
                console.error("Failed to load professional:", err);
                setProfessional(null);
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    const phone = (professional as any)?.phone || (professional as any)?.phone_number;
    const whatsapp = (professional as any)?.whatsapp_number || phone;
    const imageUrl = (professional as any)?.imageUrl || (professional as any)?.image_url
        || `https://api.dicebear.com/7.x/avataaars/png?seed=${id}`;
    const specializations = professional?.specializations || [];
    const serviceArea = (professional as any)?.serviceArea || (professional as any)?.service_area;
    const isAvailable = (professional as any)?.isAvailable ?? (professional as any)?.is_available ?? true;

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.background.screen }}>
                <ActivityIndicator size="large" color={theme.primary.green} />
            </View>
        );
    }

    if (!professional) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.background.screen }}>
                <Ionicons name="person-outline" size={64} color={theme.border.card} />
                <AppText variant="bodyMd" style={{ color: theme.text.placeholder, marginTop: 12 }}>Professional not found</AppText>
                <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <AppText style={{ color: theme.primary.green, fontWeight: "600" }}>Go back</AppText>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.screen }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                {/* Hero / Header */}
                <View style={{ backgroundColor: theme.primary.green, paddingTop: 52, paddingBottom: 32, paddingHorizontal: 20, alignItems: "center" }}>
                    <Pressable onPress={() => router.back()} style={{ position: "absolute", top: 52, left: 20, padding: 8 }}>
                        <Ionicons name="arrow-back" size={24} color={theme.text.onPrimary} />
                    </Pressable>
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: theme.text.onPrimary, backgroundColor: theme.background.card }}
                    />
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: isAvailable ? theme.semantic.success : theme.semantic.error, borderWidth: 2, borderColor: theme.text.onPrimary, marginTop: -10, marginLeft: 68 }} />
                    <AppText variant="h2" style={{ color: "#fff", fontWeight: "800", fontSize: 24, marginTop: 12, textAlign: "center" }}>
                        {professional.name}
                    </AppText>
                    <AppText variant="bodySm" style={{ color: "rgba(255,255,255,0.9)", marginTop: 4, textAlign: "center" }}>
                        {professional.role}
                    </AppText>
                    <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 }}>
                        <AppText variant="bodySm" style={{ color: "#fff", fontWeight: "600" }}>
                            {(professional as any).department}
                        </AppText>
                    </View>

                    {/* Top Side Email Action */}
                    <Pressable
                        onPress={() => {
                            const email = professional.email || t("connect.booking.supportEmail");
                            const subject = `Inquiry for ${professional.name}`;
                            Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`);
                        }}
                        style={({ pressed }) => ({
                            marginTop: 16,
                            backgroundColor: theme.semantic.warning,
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 20,
                            flexDirection: "row",
                            alignItems: "center",
                            opacity: pressed ? 0.9 : 1,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        })}
                    >
                        <Ionicons name="mail" size={18} color={theme.text.primary} />
                        <AppText style={{ color: theme.text.primary, fontWeight: "700", marginLeft: 8, fontSize: 13 }}>
                            {t("connect.professional.emailExpert")}
                        </AppText>
                    </Pressable>
                </View>

                {/* Progressive disclosure toggle */}
                <Pressable
                    onPress={() => setShowMore(prev => !prev)}
                    style={{ alignItems: "center", paddingVertical: 12 }}
                >
                    <AppText variant="bodySm" style={{ color: theme.primary.green, fontWeight: "700" }}>
                        {showMore ? t("connect.professional.seeLess") + " ↑" : t("connect.professional.seeMore") + " ↓"}
                    </AppText>
                </Pressable>

                <View style={{ padding: 20 }}>
                    {showMore && (
                        <>
                            {/* Availability Badge */}
                            <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>
                                <View style={{
                                    flexDirection: "row", alignItems: "center",
                                    backgroundColor: isAvailable ? theme.semantic.successLight : theme.semantic.errorLight,
                                    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
                                }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isAvailable ? theme.semantic.success : theme.semantic.error, marginRight: 8 }} />
                                    <AppText variant="bodySm" style={{ color: isAvailable ? theme.semantic.success : theme.semantic.error, fontWeight: "700" }}>
                                        {isAvailable ? t("connect.professional.currentlyAvailable") : t("connect.professional.currentlyUnavailable")}
                                    </AppText>
                                </View>
                            </View>

                            {/* Location */}
                            {(professional.district || serviceArea) && (
                                <View style={{ backgroundColor: theme.background.input, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                                        <Ionicons name="location" size={18} color={theme.primary.green} />
                                        <AppText variant="bodyMd" style={{ fontWeight: "700", color: theme.text.secondary, marginLeft: 8 }}>{t("connect.professional.serviceArea")}</AppText>
                                    </View>
                                    {professional.district && (
                                        <AppText variant="bodySm" style={{ color: theme.text.secondary }}>{t("connect.professional.district")}: {professional.district}</AppText>
                                    )}
                                    {serviceArea?.state && (
                                        <AppText variant="bodySm" style={{ color: theme.text.muted, marginTop: 2 }}>{t("connect.professional.state")}: {serviceArea.state}</AppText>
                                    )}
                                    {serviceArea?.blocks && serviceArea.blocks.length > 0 && (
                                        <AppText variant="bodySm" style={{ color: theme.text.placeholder, marginTop: 4 }}>
                                            {t("connect.professional.blocks")}: {serviceArea.blocks.join(", ")}
                                        </AppText>
                                    )}
                                </View>
                            )}

                            {/* Specializations */}
                            {specializations.length > 0 && (
                                <View style={{ backgroundColor: theme.background.input, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                                        <Ionicons name="ribbon" size={18} color={theme.primary.green} />
                                        <AppText variant="bodyMd" style={{ fontWeight: "700", color: theme.text.secondary, marginLeft: 8 }}>{t("connect.professional.specializations")}</AppText>
                                    </View>
                                    {specializations.map((spec, i) => (
                                        <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.primary.green, marginRight: 10 }} />
                                            <AppText variant="bodySm" style={{ color: theme.text.secondary, flex: 1 }}>{spec}</AppText>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </>
                    )}

                    {/* Contact Quick Actions */}
                    {phone && (
                        <View style={{ backgroundColor: theme.background.input, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
                            <AppText variant="bodyMd" style={{ fontWeight: "700", color: theme.text.secondary, marginBottom: 12 }}>{t("connect.professional.quickContact")}</AppText>
                            <View style={{ flexDirection: "row", gap: 12 }}>
                                <Pressable
                                    onPress={() => Linking.openURL(`tel:${phone}`)}
                                    style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#DBEAFE", borderRadius: 12, padding: 12 }}
                                >
                                    <Ionicons name="call" size={20} color={theme.semantic.info} />
                                    <AppText variant="bodySm" style={{ color: theme.semantic.info, fontWeight: "700", marginLeft: 8 }}>{t("connect.professional.callNow")}</AppText>
                                </Pressable>
                                {whatsapp && (
                                    <Pressable
                                        onPress={() => Linking.openURL(`https://wa.me/${whatsapp?.replace(/\D/g, "")}`)}
                                        style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#DCFCE7", borderRadius: 12, padding: 12 }}
                                    >
                                        <Ionicons name="logo-whatsapp" size={20} color={theme.primary.green} />
                                        <AppText variant="bodySm" style={{ color: theme.primary.green, fontWeight: "700", marginLeft: 8 }}>{t("connect.professional.whatsapp")}</AppText>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Fixed Book CTA */}
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: theme.background.input, padding: 20, borderTopWidth: 1, borderTopColor: theme.border.subtle }}>
                <Pressable
                    onPress={() => {
                        router.push({
                            pathname: "/book-appointment",
                            params: { id: professional.id }
                        } as any);
                    }}
                    style={({ pressed }) => ({
                        backgroundColor: theme.primary.green,
                        borderRadius: 16, paddingVertical: 18,
                        flexDirection: "row", alignItems: "center", justifyContent: "center",
                        opacity: pressed ? 0.9 : 1,
                        shadowColor: theme.primary.green,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12, elevation: 4,
                    })}
                >
                    <Ionicons name="calendar" size={20} color={theme.text.onPrimary} />
                    <AppText variant="bodyMd" style={{ color: theme.text.onPrimary, fontWeight: "800", marginLeft: 10, fontSize: 17 }}>
                        {t("connect.professional.bookAppointment")}
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}
