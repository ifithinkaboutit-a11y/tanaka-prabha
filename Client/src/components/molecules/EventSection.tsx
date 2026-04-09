// src/components/molecules/EventSection.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { ApiEvent } from "@/services/apiService";
import AppText from "../atoms/AppText";
import EventCard from "../atoms/EventCard";
import { useTranslation } from "../../i18n";
import { theme } from "@/styles/colors";


type EventSectionProps = {
    title: string;
    events: ApiEvent[];
    onViewAll?: () => void;
    onEventPress?: (event: ApiEvent) => void;
    onParticipate?: (event: ApiEvent) => void;
};

export default function EventSection({
    title,
    events,
    onViewAll,
    onEventPress,
    onParticipate,
}: EventSectionProps) {

    const { t } = useTranslation();
    if (events.length === 0) return null;

    return (
        <View style={{ marginBottom: 24, paddingHorizontal: 16, backgroundColor: theme.background.input }}>
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
                        style={{ fontWeight: "700", color: theme.text.primary, fontSize: 20, letterSpacing: -0.2 }}
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
                                className="flex flex-row items-center justify-center"
                              >
                                <AppText
                                  variant="bodySm"
                                  style={{ color: "#16A34A", fontWeight: "600", fontSize: 14 }}
                                >
                                  {t("schemesPage.viewAll")}
                                </AppText>
                                <Ionicons name="chevron-forward" size={16} color="#16A34A" style={{ marginLeft: 2 }} />
                              </Pressable>
                )}
            </View>

            {/* Event Cards */}
            <View>
                {events.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onPress={() => onEventPress?.(event)}
                        onParticipate={onParticipate}
                    />
                ))}
            </View>
        </View>
    );
}
