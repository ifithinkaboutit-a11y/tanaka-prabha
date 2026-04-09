// src/app/(tab)/Program.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  ScrollView, View, ActivityIndicator, RefreshControl,
  Modal, Pressable, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../../components/atoms/AppText";
import EventSection from "../../components/molecules/EventSection";
import SearchBar from "../../components/molecules/SearchBar";
import { eventsApi, ApiEvent } from "@/services/apiService";
import { EventCardSkeleton } from "@/components/atoms/Skeleton";
import { useTranslation } from "../../i18n";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguageStore } from "../../stores/languageStore";
import { theme } from "@/styles/colors";

// Compute live status based on current date/time (same logic as EventCard)
function computeEventStatus(event: ApiEvent): "upcoming" | "ongoing" | "completed" | "cancelled" {
  if (event.status === "cancelled") return "cancelled";
  if (!event.date) return (event.status as any) || "upcoming";
  const dateStr = event.date.split("T")[0];
  const start = new Date(`${dateStr}T${event.start_time || "00:00:00"}`);
  const end = new Date(`${dateStr}T${event.end_time || "23:59:59"}`);
  const now = new Date();
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "completed";
}

const Program = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguageStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Participate Modal state ─────────────────────────────────────────────
  const [participateEvent, setParticipateEvent] = useState<ApiEvent | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [registering, setRegistering] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const allEvents = await eventsApi.getAll();
      setEvents(allEvents);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // All filtered events (search applied)
  const allFilteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    return events.filter(
      (ev) =>
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, events]);

  // Upcoming events: upcoming + ongoing, sorted by date ascending (soonest first)
  const upcomingEvents = useMemo(() => {
    return allFilteredEvents
      .filter((ev) => {
        const s = computeEventStatus(ev);
        return s === "upcoming" || s === "ongoing";
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date?.split("T")[0]}T${a.start_time || "00:00:00"}`).getTime();
        const dateB = new Date(`${b.date?.split("T")[0]}T${b.start_time || "00:00:00"}`).getTime();
        return dateA - dateB;
      });
  }, [allFilteredEvents]);

  // Past events: completed or cancelled, sorted by date descending (most recent first)
  const pastEvents = useMemo(() => {
    return allFilteredEvents
      .filter((ev) => {
        const s = computeEventStatus(ev);
        return s === "completed" || s === "cancelled";
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date?.split("T")[0]}T${a.start_time || "00:00:00"}`).getTime();
        const dateB = new Date(`${b.date?.split("T")[0]}T${b.start_time || "00:00:00"}`).getTime();
        return dateB - dateA;
      });
  }, [allFilteredEvents]);

  const handleEventPress = (ev: ApiEvent) => {
    router.push({ pathname: "/event-details" as any, params: { eventId: ev.id } });
  };

  // ── Open participate modal from listing card ────────────────────────────
  const handleParticipate = (ev: ApiEvent) => {
    setParticipateEvent(ev);
    setConsentGiven(false);
  };

  const handleConfirmParticipation = async () => {
    if (!consentGiven) {
      Alert.alert(t("events.consentRequired"), t("events.consentRequiredMessage"));
      return;
    }
    if (!participateEvent) return;
    if (!user?.mobileNumber) {
      Alert.alert(t("common.error"), t("events.mobileRequired"));
      return;
    }
    try {
      setRegistering(true);
      await eventsApi.register(participateEvent.id, user.mobileNumber, user.name || "Unknown");
      setParticipateEvent(null);
      Alert.alert(t("events.successTitle"), t("events.successMessage"));
    } catch (error: any) {
      if (error.status === 400 && error.message?.includes("already registered")) {
        setParticipateEvent(null);
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
      <ScrollView style={{ flex: 1, backgroundColor: theme.background.screen }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 24 }}>
          {[0, 1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
        </View>
      </ScrollView>
    );
  }

  // Localise event title/description based on language
  const localise = (ev: ApiEvent) => ({
    ...ev,
    title: currentLanguage === "hi" && ev.title_hi ? ev.title_hi : ev.title,
    description: currentLanguage === "hi" && ev.description_hi ? ev.description_hi : ev.description,
  });

  // Priority: ongoing first, then upcoming — cap at 4
  const displayUpcoming = [
    ...upcomingEvents.filter((e) => computeEventStatus(e) === "ongoing"),
    ...upcomingEvents.filter((e) => computeEventStatus(e) === "upcoming"),
  ].slice(0, 4).map(localise);

  // Past: show 3, rest go to all-events screen
  const displayPast = pastEvents.slice(0, 3).map(localise);

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background.screen }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary.green]}
            tintColor={theme.primary.green}
          />
        }
      >
        {/* Elevated Header */}
        <View style={{
          backgroundColor: theme.background.header,
          paddingBottom: 16,
          borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
          shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04, shadowRadius: 12, elevation: 4,
          marginBottom: 20,
        }}>
          <View style={{ paddingTop: 48, paddingBottom: 8, paddingHorizontal: 20 }}>
            <AppText variant="h2" style={{ fontWeight: "700", color: theme.text.primary, fontSize: 26, letterSpacing: -0.3 }}>
              {t("programs.title")}
            </AppText>
            <AppText variant="bodySm" style={{ color: theme.text.muted, marginTop: 4, fontSize: 13, fontWeight: "500" }}>
              {t("programs.subtitle")}
            </AppText>
          </View>
          <View style={{ marginTop: 4 }}>
            <SearchBar placeholder={t("programs.searchPlaceholder")} onSearch={setSearchQuery} />
          </View>
        </View>

        {/* Upcoming Events Section */}
        <EventSection
          title={t("programs.upcomingEvents") || "Upcoming Events"}
          events={displayUpcoming}
          onEventPress={handleEventPress}
          onParticipate={handleParticipate}
        />

        {/* Past Events Section — capped at 3 with View All */}
        <EventSection
          title={t("programs.pastEvents") || "Past Events"}
          events={displayPast}
          onEventPress={handleEventPress}
          onViewAll={pastEvents.length > 3 ? () => router.push("/all-events" as any) : undefined}
        />

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Quick Participate Modal ── */}
      <Modal
        visible={!!participateEvent}
        transparent
        animationType="slide"
        onRequestClose={() => setParticipateEvent(null)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{
            backgroundColor: theme.background.input,
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            maxHeight: "75%",
          }}>
            {/* Modal Header */}
            <View style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16,
              borderBottomWidth: 1, borderBottomColor: theme.background.neutralSubtle,
            }}>
              <AppText variant="h2" style={{ fontSize: 20, fontWeight: "800", color: theme.text.primary }}>
                {t("events.confirmApplication") || "Confirm Participation"}
              </AppText>
              <Pressable
                onPress={() => setParticipateEvent(null)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.background.neutralSubtle, alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name="close" size={18} color={theme.text.muted} />
              </Pressable>
            </View>

            {/* Modal Body */}
            <ScrollView style={{ paddingHorizontal: 24, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
              {/* Event name */}
              <View style={{
                backgroundColor: "#F0FDF4", borderRadius: 14, padding: 14,
                marginBottom: 16, borderWidth: 1, borderColor: "#BBF7D0",
              }}>
                <AppText variant="bodySm" style={{ color: "#16A34A", fontWeight: "600", fontSize: 11, marginBottom: 4 }}>
                  {t("events.applyingFor") || "Applying for"}
                </AppText>
                <AppText variant="bodyMd" style={{ color: "#166534", fontWeight: "700", fontSize: 15 }}>
                  {participateEvent?.title}
                </AppText>
              </View>

              {/* User info */}
              <View style={{
                backgroundColor: theme.background.neutralSubtle, borderRadius: 14, padding: 14,
                marginBottom: 16, borderWidth: 1, borderColor: theme.border.subtle,
              }}>
                <AppText variant="bodySm" style={{ color: theme.text.muted, fontWeight: "600", fontSize: 11, marginBottom: 8 }}>
                  {t("events.yourDetails") || "Your Details"}
                </AppText>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <AppText variant="bodySm" style={{ color: theme.text.placeholder, fontSize: 13 }}>{t("profile.name") || "Name"}</AppText>
                  <AppText variant="bodySm" style={{ color: theme.text.subtle, fontWeight: "600", fontSize: 13 }}>{user?.name || "—"}</AppText>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <AppText variant="bodySm" style={{ color: theme.text.placeholder, fontSize: 13 }}>{t("profile.mobile") || "Mobile"}</AppText>
                  <AppText variant="bodySm" style={{ color: theme.text.subtle, fontWeight: "600", fontSize: 13 }}>{user?.mobileNumber || "—"}</AppText>
                </View>
              </View>

              {/* Consent */}
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
                  borderWidth: consentGiven ? 0 : 2, borderColor: "#D1D5DB",
                  alignItems: "center", justifyContent: "center", marginRight: 12,
                }}>
                  {consentGiven && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <AppText variant="bodySm" style={{ color: "#374151", flex: 1, fontSize: 13, lineHeight: 18 }}>
                  {t("events.consentText") || "I agree to participate in this event and confirm the details above are correct."}
                </AppText>
              </Pressable>
            </ScrollView>

            {/* Modal Actions */}
            <View style={{
              flexDirection: "row", paddingHorizontal: 24,
              paddingTop: 12, paddingBottom: 28,
              borderTopWidth: 1, borderTopColor: theme.background.neutralSubtle, gap: 12,
            }}>
              <Pressable
                onPress={() => setParticipateEvent(null)}
                style={{ flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: theme.border.card, paddingVertical: 14, alignItems: "center" }}
              >
                <AppText variant="bodyMd" style={{ color: theme.text.subtle, fontWeight: "600" }}>
                  {t("common.cancel") || "Cancel"}
                </AppText>
              </Pressable>
              <Pressable
                onPress={handleConfirmParticipation}
                disabled={registering || !consentGiven}
                style={{
                  flex: 1, borderRadius: 12, paddingVertical: 14,
                  backgroundColor: consentGiven ? theme.primary.green : theme.text.placeholder,
                  alignItems: "center", flexDirection: "row", justifyContent: "center",
                }}
              >
                {registering && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />}
                <AppText variant="bodyMd" style={{ color: "#FFFFFF", fontWeight: "700" }}>
                  {registering ? (t("events.submitting") || "Submitting…") : (t("events.confirmApply") || "Confirm")}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Program;
