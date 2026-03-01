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
import { getProfessionalById } from "../data/content/connectServices";

export default function ProfessionalDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [professional, setProfessional] = useState<Professional | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await professionalsApi.getById(id!);
                if (data) {
                    setProfessional(data as any);
                } else {
                    // Fallback to local static data
                    const local = getProfessionalById(id!);
                    if (local) setProfessional(local as any);
                }
            } catch {
                const local = getProfessionalById(id!);
                if (local) setProfessional(local as any);
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
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
                <ActivityIndicator size="large" color="#386641" />
            </View>
        );
    }

    if (!professional) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
                <Ionicons name="person-outline" size={64} color="#D1D5DB" />
                <AppText variant="bodyMd" style={{ color: "#9CA3AF", marginTop: 12 }}>Professional not found</AppText>
                <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <AppText style={{ color: "#386641", fontWeight: "600" }}>Go back</AppText>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                {/* Hero / Header */}
                <View style={{ backgroundColor: "#386641", paddingTop: 52, paddingBottom: 32, paddingHorizontal: 20, alignItems: "center" }}>
                    <Pressable onPress={() => router.back()} style={{ position: "absolute", top: 52, left: 20 }}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </Pressable>
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: "#fff", backgroundColor: "#E5E7EB" }}
                    />
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: isAvailable ? "#22C55E" : "#EF4444", borderWidth: 2, borderColor: "#fff", marginTop: -10, marginLeft: 68 }} />
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
                </View>

                <View style={{ padding: 20 }}>
                    {/* Availability Badge */}
                    <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>
                        <View style={{
                            flexDirection: "row", alignItems: "center",
                            backgroundColor: isAvailable ? "#DCFCE7" : "#FEE2E2",
                            borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
                        }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isAvailable ? "#16A34A" : "#DC2626", marginRight: 8 }} />
                            <AppText variant="bodySm" style={{ color: isAvailable ? "#16A34A" : "#DC2626", fontWeight: "700" }}>
                                {isAvailable ? "Currently Available" : "Currently Unavailable"}
                            </AppText>
                        </View>
                    </View>

                    {/* Location */}
                    {(professional.district || serviceArea) && (
                        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                                <Ionicons name="location" size={18} color="#386641" />
                                <AppText variant="bodyMd" style={{ fontWeight: "700", color: "#1F2937", marginLeft: 8 }}>Service Area</AppText>
                            </View>
                            {professional.district && (
                                <AppText variant="bodySm" style={{ color: "#374151" }}>District: {professional.district}</AppText>
                            )}
                            {serviceArea?.state && (
                                <AppText variant="bodySm" style={{ color: "#6B7280", marginTop: 2 }}>State: {serviceArea.state}</AppText>
                            )}
                            {serviceArea?.blocks && serviceArea.blocks.length > 0 && (
                                <AppText variant="bodySm" style={{ color: "#9CA3AF", marginTop: 4 }}>
                                    Blocks: {serviceArea.blocks.join(", ")}
                                </AppText>
                            )}
                        </View>
                    )}

                    {/* Specializations */}
                    {specializations.length > 0 && (
                        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                                <Ionicons name="ribbon" size={18} color="#386641" />
                                <AppText variant="bodyMd" style={{ fontWeight: "700", color: "#1F2937", marginLeft: 8 }}>Specializations</AppText>
                            </View>
                            {specializations.map((spec, i) => (
                                <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#386641", marginRight: 10 }} />
                                    <AppText variant="bodySm" style={{ color: "#374151", flex: 1 }}>{spec}</AppText>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Contact Quick Actions */}
                    {phone && (
                        <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
                            <AppText variant="bodyMd" style={{ fontWeight: "700", color: "#1F2937", marginBottom: 12 }}>Quick Contact</AppText>
                            <View style={{ flexDirection: "row", gap: 12 }}>
                                <Pressable
                                    onPress={() => Linking.openURL(`tel:${phone}`)}
                                    style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#DBEAFE", borderRadius: 12, padding: 12 }}
                                >
                                    <Ionicons name="call" size={20} color="#2563EB" />
                                    <AppText variant="bodySm" style={{ color: "#2563EB", fontWeight: "700", marginLeft: 8 }}>Call Now</AppText>
                                </Pressable>
                                {whatsapp && (
                                    <Pressable
                                        onPress={() => Linking.openURL(`https://wa.me/${whatsapp?.replace(/\D/g, "")}`)}
                                        style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#DCFCE7", borderRadius: 12, padding: 12 }}
                                    >
                                        <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
                                        <AppText variant="bodySm" style={{ color: "#16A34A", fontWeight: "700", marginLeft: 8 }}>WhatsApp</AppText>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Fixed Book CTA */}
            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", padding: 20, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
                <Pressable
                    onPress={() => router.push({ pathname: "/book-appointment", params: { professionalId: id, professionalName: professional.name } } as any)}
                    disabled={!isAvailable}
                    style={({ pressed }) => ({
                        backgroundColor: isAvailable ? "#386641" : "#D1D5DB",
                        borderRadius: 16, paddingVertical: 18,
                        flexDirection: "row", alignItems: "center", justifyContent: "center",
                        opacity: pressed ? 0.9 : 1,
                        shadowColor: "#386641",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: isAvailable ? 0.3 : 0,
                        shadowRadius: 12, elevation: isAvailable ? 4 : 0,
                    })}
                >
                    <Ionicons name="calendar" size={22} color="#fff" />
                    <AppText variant="bodyMd" style={{ color: "#fff", fontWeight: "800", marginLeft: 10, fontSize: 17 }}>
                        {isAvailable ? "Book Appointment" : "Not Available"}
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}
