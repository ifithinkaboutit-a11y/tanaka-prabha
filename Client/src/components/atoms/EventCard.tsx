import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, View } from "react-native";
import { ApiEvent } from "@/services/apiService";
import AppText from "./AppText";

type EventCardProps = {
    event: ApiEvent;
    onPress: () => void;
};

export default function EventCard({ event, onPress }: EventCardProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                marginBottom: 16,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "#F1F5F9",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 2,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
        >
            <View style={{ flexDirection: "row" }}>
                {/* Event Hero Image */}
                {event.hero_image_url ? (
                    <Image
                        source={{ uri: event.hero_image_url }}
                        style={{ width: 110, height: "100%", backgroundColor: "#F3F4F6" }}
                        resizeMode="cover"
                    />
                ) : (
                    <View
                        style={{
                            width: 110,
                            height: "100%",
                            backgroundColor: "#EFF6FF",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name="calendar-outline" size={32} color="#3B82F6" />
                    </View>
                )}

                {/* Content */}
                <View style={{ flex: 1, padding: 16 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <View
                            style={{
                                backgroundColor: "#E0E7FF",
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 6,
                                alignSelf: "flex-start",
                            }}
                        >
                            <AppText
                                variant="bodySm"
                                style={{ color: "#4338CA", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}
                            >
                                {event.status}
                            </AppText>
                        </View>
                    </View>

                    <AppText
                        variant="h3"
                        style={{ fontWeight: "700", color: "#111827", fontSize: 16, marginBottom: 8, letterSpacing: -0.2 }}
                        numberOfLines={2}
                    >
                        {event.title}
                    </AppText>

                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <AppText variant="bodySm" style={{ color: "#6B7280", marginLeft: 4, fontSize: 13 }}>
                            {new Date(event.date).toLocaleDateString()} at {event.start_time}
                        </AppText>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name="location-outline" size={14} color="#6B7280" />
                        <AppText variant="bodySm" style={{ color: "#6B7280", marginLeft: 4, fontSize: 13 }} numberOfLines={1}>
                            {event.location_name}
                        </AppText>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}
