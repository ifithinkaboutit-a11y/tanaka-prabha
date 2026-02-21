import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, View, ActivityIndicator } from "react-native";
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

    const handleParticipate = () => {
        setShowModal(true);
    };

    const handleConfirmParticipation = async () => {
        try {
            setRegistering(true);
            if (!user?.mobile_number) {
                Alert.alert("Error", "You must have a mobile number to participate.");
                return;
            }
            const fullName = user.name || "Unknown User";
            await eventsApi.register(eventId!, user.mobile_number, fullName);
            Alert.alert("Success", "You are successfully registered for the event!");
            setShowModal(false);
        } catch (error: any) {
            if (error.status === 400 && error.message?.includes('already registered')) {
                Alert.alert("Info", "You are already registered for this event.");
            } else {
                Alert.alert("Error", "Could not register for the event. Please try again later.");
            }
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F6F6F6", alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color="#386641" />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={{ flex: 1, backgroundColor: "#F6F6F6", alignItems: "center", justifyContent: "center" }}>
                <AppText variant="h2" style={{ color: "#212121", marginBottom: 16 }}>
                    Event Not Found
                </AppText>
                <Button label="Go Back" onPress={() => router.back()} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Navigation Header */}
                <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, backgroundColor: "#FFFFFF" }}>
                    <Pressable onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
                        <Ionicons name="arrow-back" size={24} color="#386641" />
                    </Pressable>
                    <AppText
                        variant="h2"
                        style={{ color: "#212121", flex: 1 }}
                        numberOfLines={1}
                    >
                        {event.title}
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

                {/* Event Info */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 24, backgroundColor: "#FFFFFF", marginBottom: 16 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <View style={{ backgroundColor: "#E0E7FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 }}>
                            <AppText variant="bodySm" style={{ color: "#4338CA", fontWeight: "700", textTransform: "uppercase" }}>{event.status}</AppText>
                        </View>
                    </View>
                    <AppText variant="h1" style={{ color: "#111827", marginBottom: 16, fontSize: 24, fontWeight: "800" }}>
                        {event.title}
                    </AppText>

                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        <Ionicons name="calendar-outline" size={20} color="#4B5563" />
                        <AppText variant="bodyMd" style={{ color: "#4B5563", marginLeft: 8, fontWeight: "500" }}>{new Date(event.date).toLocaleDateString()}</AppText>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        <Ionicons name="time-outline" size={20} color="#4B5563" />
                        <AppText variant="bodyMd" style={{ color: "#4B5563", marginLeft: 8, fontWeight: "500" }}>{event.start_time} - {event.end_time}</AppText>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name="location-outline" size={20} color="#4B5563" />
                        <AppText variant="bodyMd" style={{ color: "#4B5563", marginLeft: 8, fontWeight: "500" }}>{event.location_name} {event.location_address && `(${event.location_address})`}</AppText>
                    </View>
                </View>

                {/* Details section */}
                <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                    <Card style={{ padding: 16, marginBottom: 16, backgroundColor: "#FFFFFF" }}>
                        <AppText variant="h3" style={{ color: "#111827", marginBottom: 8, fontSize: 18, fontWeight: "700" }}>Details</AppText>
                        <AppText variant="bodyMd" style={{ color: "#4B5563", lineHeight: 24 }}>{event.description}</AppText>
                    </Card>

                    {event.requirements && (
                        <Card style={{ padding: 16, marginBottom: 16, backgroundColor: "#FFFFFF" }}>
                            <AppText variant="h3" style={{ color: "#111827", marginBottom: 8, fontSize: 18, fontWeight: "700" }}>Requirements</AppText>
                            <AppText variant="bodyMd" style={{ color: "#4B5563", lineHeight: 24 }}>{event.requirements}</AppText>
                        </Card>
                    )}
                </View>
            </ScrollView>

            {/* Action Area */}
            {event.status === 'upcoming' && (
                <View
                    style={{
                        backgroundColor: "#FFFFFF",
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        paddingBottom: 24,
                        borderTopWidth: 1,
                        borderTopColor: "#E5E7EB",
                    }}
                >
                    <Button
                        label="Participate"
                        variant="primary"
                        size="lg"
                        onPress={handleParticipate}
                        style={{ width: "100%", backgroundColor: "#386641" }}
                    />
                </View>
            )}

            {/* Rules Modal */}
            <Modal visible={showModal} transparent animationType="slide">
                <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View style={{ backgroundColor: "#FFFFFF", padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "80%" }}>
                        <AppText variant="h2" style={{ marginBottom: 16 }}>Guidelines & Rules</AppText>
                        <ScrollView style={{ marginBottom: 24 }}>
                            <AppText variant="bodyMd" style={{ color: "#4B5563", lineHeight: 22 }}>
                                {event.guidelines_and_rules || "There are no specific guidelines for this event."}
                            </AppText>
                        </ScrollView>

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Button
                                label="Cancel"
                                variant="outline"
                                onPress={() => setShowModal(false)}
                                style={{ flex: 1, marginRight: 8 }}
                            />
                            <Button
                                label={registering ? "Confirming..." : "I Agree"}
                                variant="primary"
                                onPress={handleConfirmParticipation}
                                disabled={registering}
                                style={{ flex: 1, marginLeft: 8, backgroundColor: "#386641" }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default EventDetails;
