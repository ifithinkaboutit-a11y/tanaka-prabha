import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { ApiEvent } from "@/services/apiService";
import AppText from "../atoms/AppText";
import EventCard from "../atoms/EventCard";

type EventSectionProps = {
    title: string;
    events: ApiEvent[];
    onViewAll?: () => void;
    onEventPress?: (event: ApiEvent) => void;
};

export default function EventSection({
    title,
    events,
    onViewAll,
    onEventPress,
}: EventSectionProps) {

    if (events.length === 0) return null;

    return (
        <View style={{ marginBottom: 24, paddingHorizontal: 16, backgroundColor: "#FFFFFF" }}>
            {/* Section Header */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <AppText
                        variant="h3"
                        style={{ fontWeight: "700", color: "#111827", fontSize: 20, letterSpacing: -0.2 }}
                    >
                        {title}
                    </AppText>
                    <View
                        style={{
                            backgroundColor: "#E0E7FF",
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            marginLeft: 10,
                        }}
                    >
                        <AppText
                            variant="bodySm"
                            style={{ color: "#4F46E5", fontWeight: "700", fontSize: 12 }}
                        >
                            {events.length}
                        </AppText>
                    </View>
                </View>
                {onViewAll && (
                    <Pressable
                        onPress={onViewAll}
                        style={({ pressed }) => ({
                            flexDirection: "row",
                            alignItems: "center",
                            opacity: pressed ? 0.7 : 1,
                        })}
                    >
                        <AppText
                            variant="bodySm"
                            style={{ color: "#16A34A", fontWeight: "600", fontSize: 14 }}
                        >
                            View All
                        </AppText>
                        <Ionicons name="chevron-forward" size={16} color="#16A34A" style={{ marginLeft: 2 }} />
                    </Pressable>
                )}
            </View>

            {/* Program Cards */}
            <View>
                {events.slice(0, 3).map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onPress={() => onEventPress?.(event)}
                    />
                ))}
            </View>
        </View>
    );
}
