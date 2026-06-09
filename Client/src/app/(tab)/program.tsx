// src/app/(tab)/Program.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  ScrollView, View, ActivityIndicator, RefreshControl,
  Modal, Pressable, Alert, Animated, TouchableOpacity,
  StyleSheet, StatusBar,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function buildDateKey(ev: ApiEvent) {
  return new Date(`${ev.date?.split("T")[0]}T${ev.start_time || "00:00:00"}`).getTime();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// LiveBadge — static indicator, no animation (PRODUCT.md: no micro-animations)
function LiveBadge() {
  return (
    <View style={s.liveBadge}>
      <View style={s.liveDot} />
      <AppText style={s.liveText}>LIVE</AppText>
    </View>
  );
}

/** Summary stat strip shown in the header */
function StatPill({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={[s.statPill, { backgroundColor: color + "18" }]}>
      <Ionicons name={icon as any} size={12} color={color} />
      <AppText style={[s.statLabel, { color }]}>{label}</AppText>
    </View>
  );
}

/** Row in the modal user-details card */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.detailRow}>
      <AppText style={s.detailLabel}>{label}</AppText>
      <AppText style={s.detailValue}>{value}</AppText>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const Program = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguageStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Participate modal
  const [participateEvent, setParticipateEvent] = useState<ApiEvent | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [registering, setRegistering] = useState(false);
  const modalAnim = useRef(new Animated.Value(0)).current;

  // ── Data ────────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const allEvents = await eventsApi.getAll();
      setEvents(allEvents);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    })();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // ── Derived data ────────────────────────────────────────────────────────────

  const allFiltered = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (ev) =>
        ev.title.toLowerCase().includes(q) ||
        (ev.description || "").toLowerCase().includes(q) ||
        ev.location_name.toLowerCase().includes(q),
    );
  }, [searchQuery, events]);

  const upcomingEvents = useMemo(() =>
    allFiltered
      .filter((ev) => { const s = computeEventStatus(ev); return s === "upcoming" || s === "ongoing"; })
      .sort((a, b) => buildDateKey(a) - buildDateKey(b)),
    [allFiltered]);

  const pastEvents = useMemo(() =>
    allFiltered
      .filter((ev) => { const s = computeEventStatus(ev); return s === "completed" || s === "cancelled"; })
      .sort((a, b) => buildDateKey(b) - buildDateKey(a)),
    [allFiltered]);

  const ongoingCount = useMemo(
    () => events.filter((e) => computeEventStatus(e) === "ongoing").length,
    [events],
  );

  const localise = useCallback((ev: ApiEvent) => ({
    ...ev,
    title: currentLanguage === "hi" && ev.title_hi ? ev.title_hi : ev.title,
    description: currentLanguage === "hi" && ev.description_hi ? ev.description_hi : ev.description,
  }), [currentLanguage]);

  const displayUpcoming = useMemo(() => [
    ...upcomingEvents.filter((e) => computeEventStatus(e) === "ongoing"),
    ...upcomingEvents.filter((e) => computeEventStatus(e) === "upcoming"),
  ].slice(0, 4).map(localise), [upcomingEvents, localise]);

  const displayPast = useMemo(() =>
    pastEvents.slice(0, 3).map(localise),
    [pastEvents, localise]);

  // ── Modal helpers ────────────────────────────────────────────────────────────

  const openModal = (ev: ApiEvent) => {
    setParticipateEvent(ev);
    setConsentGiven(false);
    modalAnim.setValue(0);
    Animated.spring(modalAnim, {
      toValue: 1, damping: 20, stiffness: 200, useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0, duration: 180, useNativeDriver: true,
    }).start(() => setParticipateEvent(null));
  };

  const handleConfirmParticipation = async () => {
    if (!consentGiven) {
      Alert.alert(t("events.consentRequired"), t("events.consentRequiredMessage"));
      return;
    }
    if (!participateEvent || !user?.mobileNumber) {
      Alert.alert(t("common.error"), t("events.mobileRequired"));
      return;
    }
    try {
      setRegistering(true);
      await eventsApi.register(participateEvent.id, user.mobileNumber, user.name || "Unknown");
      closeModal();
      Alert.alert(t("events.successTitle"), t("events.successMessage"));
    } catch (error: any) {
      if (error.status === 400 && error.message?.includes("already registered")) {
        closeModal();
        Alert.alert(t("events.alreadyRegisteredTitle"), t("events.alreadyRegisteredMessage"));
      } else {
        Alert.alert(t("common.error"), t("events.registrationFailed"));
      }
    } finally {
      setRegistering(false);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={s.screen}>
        <StatusBar barStyle="dark-content" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={s.skeletonHeader} />
          <View style={{ paddingTop: 8 }}>
            {[0, 1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const modalTranslateY = modalAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });

  return (
    <>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={s.screen}
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
        {/* ── Sticky Header ── */}
        <View style={s.header}>
          {/* Title + stats row */}
          <View style={s.headerTop}>
            <View style={{ flex: 1 }}>
              <AppText style={s.screenTitle}>{t("programs.title")}</AppText>
              <AppText style={s.screenSubtitle}>{t("programs.subtitle")}</AppText>
            </View>
            <View style={s.statRow}>
              {ongoingCount > 0 && <LiveBadge />}
              <StatPill
                icon="calendar-outline"
                label={`${upcomingEvents.length} ${t("programs.upcomingEvents")}`}
                color={theme.primary.green}
              />
            </View>
          </View>

          {/* Search */}
          <View style={s.searchWrap}>
            <SearchBar
              placeholder={t("programs.searchPlaceholder")}
              onSearch={setSearchQuery}
            />
          </View>
        </View>

        {/* ── Empty state ── */}
        {allFiltered.length === 0 && searchQuery.trim() !== "" && (
          <View style={s.emptyState}>
            <Ionicons name="search-outline" size={40} color={theme.text.placeholder} />
            <AppText style={s.emptyTitle}>{t("search.noResults")}</AppText>
            <AppText style={s.emptySubtitle}>{t("search.noResultsHint")}</AppText>
            <TouchableOpacity onPress={() => setSearchQuery("")} style={s.clearBtn}>
              <AppText style={s.clearBtnText}>{t("filterSort.clearFilters")}</AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Upcoming Events ── */}
        {displayUpcoming.length > 0 && (
          <EventSection
            title={t("programs.upcomingEvents") || "Upcoming Events"}
            events={displayUpcoming}
            onEventPress={(ev) => router.push({ pathname: "/event-details" as any, params: { eventId: ev.id } })}
            onParticipate={openModal}
          />
        )}

        {/* ── Past Events ── */}
        {displayPast.length > 0 && (
          <EventSection
            title={t("programs.pastEvents") || "Past Events"}
            events={displayPast}
            onEventPress={(ev) => router.push({ pathname: "/event-details" as any, params: { eventId: ev.id } })}
            onViewAll={pastEvents.length > 3 ? () => router.push("/all-events" as any) : undefined}
          />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Participate Modal ── */}
      <Modal
        visible={!!participateEvent}
        transparent
        animationType="none"           // we drive the animation ourselves
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <Pressable style={s.backdrop} onPress={closeModal}>
          {/* Stop propagation so taps inside don't close */}
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[s.sheet, { transform: [{ translateY: modalTranslateY }] }]}
            >
              {/* Drag handle */}
              <View style={s.dragHandle} />

              {/* Header */}
              <View style={s.modalHeader}>
                <View>
                  <AppText style={s.modalTitle}>
                    {t("events.confirmApplication") || "Confirm Participation"}
                  </AppText>
                  <AppText style={s.modalSubtitle}>
                    {t("events.yourDetails")}
                  </AppText>
                </View>
                <Pressable
                  onPress={closeModal}
                  style={s.closeBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Ionicons name="close" size={16} color={theme.text.muted} />
                </Pressable>
              </View>

              <ScrollView
                style={s.modalBody}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Event name card */}
                <View style={s.eventCard}>
                  <View style={s.eventCardIcon}>
                    <Ionicons name="calendar" size={16} color={theme.primary.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText style={s.eventCardLabel}>
                      {t("events.applyingFor") || "Applying for"}
                    </AppText>
                    <AppText style={s.eventCardTitle} numberOfLines={2}>
                      {participateEvent?.title}
                    </AppText>
                  </View>
                </View>

                {/* User details */}
                <View style={s.userCard}>
                  <AppText style={s.userCardHeading}>
                    {t("events.yourDetails") || "Your Details"}
                  </AppText>
                  <View style={s.divider} />
                  <DetailRow
                    label={t("profile.name") || "Name"}
                    value={user?.name || "—"}
                  />
                  <DetailRow
                    label={t("profile.mobile") || "Mobile"}
                    value={user?.mobileNumber || "—"}
                  />
                </View>

                {/* Consent toggle */}
                <Pressable
                  onPress={() => setConsentGiven((v) => !v)}
                  style={[s.consentRow, consentGiven && s.consentRowActive]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: consentGiven }}
                >
                  <View style={[s.checkbox, consentGiven && s.checkboxActive]}>
                    {consentGiven && (
                      <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                    )}
                  </View>
                  <AppText style={[s.consentText, consentGiven && s.consentTextActive]}>
                    {t("events.consentText") ||
                      "I agree to participate in this event and confirm the details above are correct."}
                  </AppText>
                </Pressable>

                <View style={{ height: 8 }} />
              </ScrollView>

              {/* Actions */}
              <View style={s.modalActions}>
                <Pressable
                  onPress={closeModal}
                  style={s.cancelBtn}
                  accessibilityRole="button"
                >
                  <AppText style={s.cancelBtnText}>
                    {t("common.cancel") || "Cancel"}
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={handleConfirmParticipation}
                  disabled={registering || !consentGiven}
                  style={[s.confirmBtn, (!consentGiven || registering) && s.confirmBtnDisabled]}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: registering || !consentGiven }}
                >
                  {registering
                    ? <ActivityIndicator size="small" color="#FFFFFF" />
                    : <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  }
                  <AppText style={s.confirmBtnText}>
                    {registering
                      ? (t("events.submitting") || "Submitting…")
                      : (t("events.confirmApply") || "Confirm")}
                  </AppText>
                </Pressable>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default Program;

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background.screen,
  },

  // ── Skeleton ──
  skeletonHeader: {
    height: 160,
    backgroundColor: theme.background.header,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },

  // ── Header ──
  header: {
    backgroundColor: theme.background.header,
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.text.primary,
    letterSpacing: -0.5,
    lineHeight: 33,
  },
  screenSubtitle: {
    fontSize: 13,
    color: theme.text.muted,
    marginTop: 3,
    fontWeight: "500",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 4,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#EF4444",
    letterSpacing: 0.5,
  },
  searchWrap: {
    marginTop: 2,
    paddingHorizontal: 4,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.text.subtle,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.text.muted,
    textAlign: "center",
    lineHeight: 19,
  },
  clearBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.primary.green + "18",
  },
  clearBtnText: {
    color: theme.primary.green,
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Modal ──
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: theme.background.input,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border.subtle,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border.subtle,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: theme.text.primary,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    color: theme.text.muted,
    marginTop: 2,
    fontWeight: "500",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.background.neutralSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  // Event card in modal
  eventCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: theme.primary.green + "0E",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.primary.green + "30",
  },
  eventCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.primary.green + "20",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  eventCardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.primary.green,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  eventCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.text.primary,
    lineHeight: 20,
  },

  // User details card
  userCard: {
    backgroundColor: theme.background.neutralSubtle,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border.subtle,
  },
  userCardHeading: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.text.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.border.subtle,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: theme.text.muted,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    color: theme.text.primary,
    fontWeight: "700",
  },

  // Consent
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.background.neutralSubtle,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    gap: 12,
  },
  consentRowActive: {
    backgroundColor: theme.primary.green + "0E",
    borderColor: theme.primary.green + "50",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.border.subtle,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: theme.primary.green,
    borderColor: theme.primary.green,
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: theme.text.subtle,
    lineHeight: 19,
  },
  consentTextActive: {
    color: theme.text.primary,
  },

  // Modal actions
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.border.subtle,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.border.card,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    color: theme.text.subtle,
    fontWeight: "600",
    fontSize: 14,
  },
  confirmBtn: {
    flex: 1.6,
    borderRadius: 14,
    paddingVertical: 15,
    backgroundColor: theme.primary.green,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
    shadowColor: theme.primary.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: theme.text.placeholder,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});