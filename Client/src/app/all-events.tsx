// src/app/all-events.tsx — Full list of past events
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import AppText from "../components/atoms/AppText";
import EventCard from "../components/atoms/EventCard";
import { eventsApi, ApiEvent } from "@/services/apiService";
import { useLanguageStore } from "../stores/languageStore";
import { useTranslation } from "../i18n";
import { theme } from "@/styles/colors";
import { colors } from "@/styles/colors";

export const unstable_settings = { headerShown: false };

function computeStatus(ev: ApiEvent) {
  if (ev.status === "cancelled") return "cancelled";
  if (!ev.date) return ev.status || "upcoming";
  const d = ev.date.split("T")[0];
  const start = new Date(`${d}T${ev.start_time || "00:00:00"}`);
  const end = new Date(`${d}T${ev.end_time || "23:59:59"}`);
  const now = new Date();
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "completed";
}

export default function AllEvents() {
  const router = useRouter();
  const { currentLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const all = await eventsApi.getAll();
      const past = all
        .filter((e) => { const s = computeStatus(e); return s === "completed" || s === "cancelled"; })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(past);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const localise = (ev: ApiEvent) => ({
    ...ev,
    title: currentLanguage === "hi" && ev.title_hi ? ev.title_hi : ev.title,
    description: currentLanguage === "hi" && ev.description_hi ? ev.description_hi : ev.description,
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.background.screen }}>
      {/* Header */}
      <View style={{ backgroundColor: theme.background.header, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.background.screen, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.background.screen, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={20} color={theme.text.secondary} onPress={() => router.back()} />
        </View>
        <View>
          <AppText style={{ fontSize: 20, fontWeight: "800", color: theme.text.primary }}>{t("schemesPage.pastEvents")}</AppText>
          {!loading && <AppText style={{ fontSize: 12, color: theme.text.muted }}>{events.length} {t("events.events")}</AppText>}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.primary.green} />
        </View>
      ) : events.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Ionicons name="calendar-outline" size={56} color={theme.border.card} />
          <AppText style={{ fontSize: 16, color: theme.text.muted, marginTop: 12, textAlign: "center" }}>{t("events.noPastEvents")}</AppText>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary.green]} tintColor={theme.primary.green} />}
        >
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={localise(ev)}
              onPress={() => router.push({ pathname: "/event-details" as any, params: { eventId: ev.id } })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
