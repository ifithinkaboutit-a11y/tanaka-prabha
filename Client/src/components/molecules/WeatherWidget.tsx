// src/components/molecules/WeatherWidget.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import AppText from "../atoms/AppText";
import { Skeleton } from "../atoms/Skeleton";
import { DISTRICT_COORDS } from "@/data/districtCoords";

// ── UP centroid fallback ──────────────────────────────────────────────────────
const UP_FALLBACK: [number, number] = [26.8467, 80.9462];

// ── WMO weather code mapping ──────────────────────────────────────────────────
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

/** Map a WMO code to label + icon, falling back to nearest known code. */
export function weatherCodeToInfo(code: number, language: "en" | "hi"): { label: string; icon: keyof typeof Ionicons.glyphMap } {
  const entry = WMO_MAP[code];
  if (entry) {
    return { label: language === "hi" ? entry.labelHi : entry.labelEn, icon: entry.icon };
  }
  // Nearest fallback: find closest key
  const keys = Object.keys(WMO_MAP).map(Number);
  const closest = keys.reduce((prev, curr) =>
    Math.abs(curr - code) < Math.abs(prev - code) ? curr : prev
  );
  const fallback = WMO_MAP[closest];
  return { label: language === "hi" ? fallback.labelHi : fallback.labelEn, icon: fallback.icon };
}

// ── Component ─────────────────────────────────────────────────────────────────

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
        (district && DISTRICT_COORDS[district]) ?? UP_FALLBACK;
      const [lat, lng] = coords;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("non-2xx");
      const json = await res.json();
      setData({
        temperature: json.current.temperature_2m,
        weathercode: json.current.weathercode,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [district]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="bg-white rounded-2xl p-4 mx-4 mb-4 flex-row items-center gap-4"
        style={{ elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 }}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton height={20} width="40%" borderRadius={6} />
          <Skeleton height={14} width="60%" borderRadius={6} />
        </View>
      </View>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <View className="bg-white rounded-2xl p-4 mx-4 mb-4 flex-row items-center justify-between"
        style={{ elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 }}>
        <View className="flex-row items-center gap-3">
          <Ionicons name="cloud-offline-outline" size={28} color="#9CA3AF" />
          <AppText style={{ color: "#6B7280", fontSize: 14 }}>
            {language === "hi" ? "मौसम उपलब्ध नहीं" : "Weather unavailable"}
          </AppText>
        </View>
        <TouchableOpacity onPress={fetchWeather} className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-green-50">
          <Ionicons name="refresh" size={14} color="#16A34A" />
          <AppText style={{ color: "#16A34A", fontSize: 13, fontWeight: "600" }}>
            {language === "hi" ? "पुनः प्रयास" : "Retry"}
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────────
  const { label, icon } = weatherCodeToInfo(data.weathercode, language);
  const tempStr = `${Math.round(data.temperature)}°C`;

  return (
    <View className="bg-white rounded-2xl px-4 py-3 mx-4 mb-4 flex-row items-center gap-4"
      style={{ elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 }}>
      {/* Icon */}
      <View className="items-center justify-center rounded-full bg-blue-50"
        style={{ width: 52, height: 52 }}>
        <Ionicons name={icon} size={28} color="#2563EB" />
      </View>

      {/* Temperature + condition */}
      <View style={{ flex: 1 }}>
        <AppText style={{ fontSize: 22, fontWeight: "700", color: "#1F2937", lineHeight: 28 }}>
          {tempStr}
        </AppText>
        <AppText style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
          {label}
        </AppText>
      </View>

      {/* District label */}
      {district ? (
        <AppText style={{ fontSize: 11, color: "#9CA3AF", maxWidth: 80, textAlign: "right" }} numberOfLines={2}>
          {district}
        </AppText>
      ) : null}
    </View>
  );
}
