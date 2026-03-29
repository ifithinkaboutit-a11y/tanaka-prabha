// src/components/molecules/WeatherWidget.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import AppText from "../atoms/AppText";
import { Skeleton } from "../atoms/Skeleton";
import { DISTRICT_COORDS } from "@/data/districtCoords";

const UP_FALLBACK: [number, number] = [26.8467, 80.9462];

interface WeatherInfo {
  labelEn: string;
  labelHi: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const WMO_MAP: Record<number, WeatherInfo> = {
  0:  { labelEn: "Clear Sky",          labelHi: "साफ आसमान",       icon: "sunny" },
  1:  { labelEn: "Mainly Clear",       labelHi: "अधिकतर साफ",      icon: "sunny-outline" },
  2:  { labelEn: "Partly Cloudy",      labelHi: "आंशिक बादल",      icon: "partly-sunny" },
  3:  { labelEn: "Overcast",           labelHi: "घने बादल",        icon: "cloud" },
  45: { labelEn: "Foggy",              labelHi: "कोहरा",           icon: "cloud-outline" },
  48: { labelEn: "Icy Fog",            labelHi: "बर्फीला कोहरा",   icon: "cloud-outline" },
  51: { labelEn: "Light Drizzle",      labelHi: "हल्की बूंदाबांदी", icon: "rainy-outline" },
  53: { labelEn: "Drizzle",            labelHi: "बूंदाबांदी",      icon: "rainy-outline" },
  55: { labelEn: "Heavy Drizzle",      labelHi: "तेज बूंदाबांदी",  icon: "rainy" },
  61: { labelEn: "Light Rain",         labelHi: "हल्की बारिश",     icon: "rainy-outline" },
  63: { labelEn: "Rain",               labelHi: "बारिश",           icon: "rainy" },
  65: { labelEn: "Heavy Rain",         labelHi: "तेज बारिश",       icon: "rainy" },
  71: { labelEn: "Light Snow",         labelHi: "हल्की बर्फ",      icon: "snow-outline" },
  73: { labelEn: "Snow",               labelHi: "बर्फबारी",        icon: "snow" },
  75: { labelEn: "Heavy Snow",         labelHi: "तेज बर्फबारी",    icon: "snow" },
  77: { labelEn: "Snow Grains",        labelHi: "बर्फ के कण",      icon: "snow-outline" },
  80: { labelEn: "Light Showers",      labelHi: "हल्की फुहार",     icon: "rainy-outline" },
  81: { labelEn: "Showers",            labelHi: "बौछार",           icon: "rainy" },
  82: { labelEn: "Heavy Showers",      labelHi: "तेज बौछार",       icon: "rainy" },
  85: { labelEn: "Snow Showers",       labelHi: "बर्फ की बौछार",   icon: "snow-outline" },
  86: { labelEn: "Heavy Snow Showers", labelHi: "तेज बर्फ बौछार",  icon: "snow" },
  95: { labelEn: "Thunderstorm",       labelHi: "आंधी-तूफान",      icon: "thunderstorm" },
  96: { labelEn: "Thunderstorm + Hail",labelHi: "ओलावृष्टि",       icon: "thunderstorm" },
  99: { labelEn: "Thunderstorm + Hail",labelHi: "ओलावृष्टि",       icon: "thunderstorm" },
};

export function weatherCodeToInfo(
  code: number,
  language: "en" | "hi"
): { label: string; icon: keyof typeof Ionicons.glyphMap } {
  const entry = WMO_MAP[code];
  if (entry) return { label: language === "hi" ? entry.labelHi : entry.labelEn, icon: entry.icon };
  const keys = Object.keys(WMO_MAP).map(Number);
  const closest = keys.reduce((prev, curr) =>
    Math.abs(curr - code) < Math.abs(prev - code) ? curr : prev
  );
  const fallback = WMO_MAP[closest];
  return { label: language === "hi" ? fallback.labelHi : fallback.labelEn, icon: fallback.icon };
}

// ── Adaptive theme based on temperature + time of day ────────────────────────
interface WeatherTheme {
  bg: string;
  iconBg: string;
  iconColor: string;
  tempColor: string;
  labelColor: string;
  accentColor: string;
  shadowColor: string;
}

function getWeatherTheme(temp: number, weathercode: number): WeatherTheme {
  const hour = new Date().getHours();
  const isEvening = hour >= 17 && hour < 20;
  const isNight = hour >= 20 || hour < 6;
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weathercode);
  const isSnowy = [71, 73, 75, 77, 85, 86].includes(weathercode);
  const isCloudy = [3, 45, 48].includes(weathercode);

  if (isSnowy) {
    return { bg: "#E0F2FE", iconBg: "#BAE6FD", iconColor: "#0369A1", tempColor: "#0C4A6E", labelColor: "#0284C7", accentColor: "#38BDF8", shadowColor: "#7DD3FC" };
  }
  if (isRainy) {
    return { bg: "#EFF6FF", iconBg: "#BFDBFE", iconColor: "#1D4ED8", tempColor: "#1E3A5F", labelColor: "#2563EB", accentColor: "#60A5FA", shadowColor: "#93C5FD" };
  }
  if (isNight) {
    return { bg: "#1E1B4B", iconBg: "#3730A3", iconColor: "#A5B4FC", tempColor: "#E0E7FF", labelColor: "#C7D2FE", accentColor: "#818CF8", shadowColor: "#4338CA" };
  }
  if (isEvening) {
    return { bg: "#FFF7ED", iconBg: "#FED7AA", iconColor: "#EA580C", tempColor: "#7C2D12", labelColor: "#C2410C", accentColor: "#F97316", shadowColor: "#FDBA74" };
  }
  if (temp >= 35) {
    return { bg: "#FFFBEB", iconBg: "#FDE68A", iconColor: "#D97706", tempColor: "#78350F", labelColor: "#B45309", accentColor: "#F59E0B", shadowColor: "#FCD34D" };
  }
  if (temp >= 25) {
    return { bg: "#FEFCE8", iconBg: "#FEF08A", iconColor: "#CA8A04", tempColor: "#713F12", labelColor: "#A16207", accentColor: "#EAB308", shadowColor: "#FDE047" };
  }
  if (isCloudy) {
    return { bg: "#F8FAFC", iconBg: "#E2E8F0", iconColor: "#475569", tempColor: "#1E293B", labelColor: "#475569", accentColor: "#94A3B8", shadowColor: "#CBD5E1" };
  }
  // Pleasant / cool — green
  return { bg: "#F0FDF4", iconBg: "#BBF7D0", iconColor: "#16A34A", tempColor: "#14532D", labelColor: "#15803D", accentColor: "#22C55E", shadowColor: "#86EFAC" };
}

interface WeatherWidgetProps {
  district?: string;
  language: "en" | "hi";
}

interface WeatherData {
  temperature: number;
  weathercode: number;
}

export default function WeatherWidget({ district, language }: WeatherWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<WeatherData | null>(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const coords: [number, number] =
        (district ? DISTRICT_COORDS[district] : undefined) ?? UP_FALLBACK;
      const [lat, lng] = coords;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("non-2xx");
      const json = await res.json();
      setData({ temperature: json.current.temperature_2m, weathercode: json.current.weathercode });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [district]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  if (loading) {
    return (
      <View style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 20, backgroundColor: "#F8FAFC", padding: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Skeleton width={60} height={60} borderRadius={18} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton height={24} width="35%" borderRadius={6} />
          <Skeleton height={13} width="55%" borderRadius={6} />
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 20, backgroundColor: "#F8FAFC", padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons name="cloud-offline-outline" size={28} color="#9CA3AF" />
          <AppText style={{ color: "#6B7280", fontSize: 14 }}>
            {language === "hi" ? "मौसम उपलब्ध नहीं" : "Weather unavailable"}
          </AppText>
        </View>
        <TouchableOpacity onPress={fetchWeather} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#F0FDF4" }}>
          <Ionicons name="refresh" size={14} color="#16A34A" />
          <AppText style={{ color: "#16A34A", fontSize: 13, fontWeight: "600" }}>
            {language === "hi" ? "पुनः प्रयास" : "Retry"}
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const { label, icon } = weatherCodeToInfo(data.weathercode, language);
  const theme = getWeatherTheme(data.temperature, data.weathercode);
  const tempStr = `${Math.round(data.temperature)}°C`;
  const hour = new Date().getHours();
  const timeLabel = hour < 12
    ? (language === "hi" ? "सुबह" : "Morning")
    : hour < 17
      ? (language === "hi" ? "दोपहर" : "Afternoon")
      : hour < 20
        ? (language === "hi" ? "शाम" : "Evening")
        : (language === "hi" ? "रात" : "Night");

  return (
    <View style={{
      marginHorizontal: 16, marginBottom: 16, borderRadius: 20,
      backgroundColor: theme.bg,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35, shadowRadius: 14, elevation: 5,
      overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <View style={{ position: "absolute", top: -18, right: -18, width: 90, height: 90, borderRadius: 45, backgroundColor: theme.iconBg, opacity: 0.45 }} />
      <View style={{ position: "absolute", bottom: -24, left: -8, width: 70, height: 70, borderRadius: 35, backgroundColor: theme.iconBg, opacity: 0.25 }} />

      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, gap: 14 }}>
        {/* Icon circle */}
        <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: theme.iconBg, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={icon} size={32} color={theme.iconColor} />
        </View>

        {/* Temp + condition */}
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 28, fontWeight: "800", color: theme.tempColor, lineHeight: 32, letterSpacing: -0.5 }}>
            {tempStr}
          </AppText>
          <AppText style={{ fontSize: 13, color: theme.labelColor, fontWeight: "600", marginTop: 2 }}>
            {label}
          </AppText>
        </View>

        {/* District + time + refresh */}
        <View style={{ alignItems: "flex-end", gap: 5 }}>
          {district ? (
            <View style={{ backgroundColor: theme.iconBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <AppText style={{ fontSize: 11, color: theme.iconColor, fontWeight: "700" }} numberOfLines={1}>
                {district}
              </AppText>
            </View>
          ) : null}
          <AppText style={{ fontSize: 11, color: theme.accentColor, fontWeight: "500" }}>
            {timeLabel}
          </AppText>
          <TouchableOpacity onPress={fetchWeather} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="refresh-outline" size={16} color={theme.accentColor} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
