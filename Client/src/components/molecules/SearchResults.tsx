// src/components/molecules/SearchResults.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import { useTranslation } from "../../i18n";
import AppText from "../atoms/AppText";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "scheme" | "training" | "event" | "quickAction";
  item: any;
  relevanceScore: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  onResultPress?: (result: SearchResult) => void;
}

const typeConfig: Record<string, {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  labelKey: string;
}> = {
  scheme: { icon: "document-text-outline", color: "#2563EB", bgColor: "#EFF6FF", labelKey: "search.scheme" },
  training: { icon: "school-outline", color: "#7C3AED", bgColor: "#F5F3FF", labelKey: "search.trainingProgram" },
  event: { icon: "calendar-outline", color: "#059669", bgColor: "#ECFDF5", labelKey: "events.title" },
  quickAction: { icon: "flash-outline", color: "#D97706", bgColor: "#FFFBEB", labelKey: "search.quickAction" },
};

export default function SearchResults({
  results,
  onResultPress,
}: SearchResultsProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleResultPress = (result: SearchResult) => {
    if (onResultPress) {
      onResultPress(result);
      return;
    }

    switch (result.type) {
      case "scheme":
        router.push(`/scheme-details?schemeId=${result.id}` as any);
        break;
      case "training":
        router.push(`/program-details?programId=${result.id}` as any);
        break;
      case "event":
        router.push(`/event-details?eventId=${result.id}` as any);
        break;
      case "quickAction":
        if (result.item?.route) {
          router.push(result.item.route as any);
        }
        break;
    }
  };

  const renderResult = ({ item, index }: { item: SearchResult; index: number }) => {
    const config = typeConfig[item.type] || typeConfig.scheme;

    return (
      <Pressable
        onPress={() => handleResultPress(item)}
        style={({ pressed }) => ({
          marginHorizontal: 16,
          marginBottom: 16,
          backgroundColor: pressed ? "#F9FAFB" : "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 3,
          flexDirection: "column",
        })}
        className="p-4 m-2 border rounded-xl border-[#F1F5F9] shadow-[0_4px_10px_0_rgba(0,0,0,0.06)]"
      >
        {/* Header: Icon + Type Badge */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          {/* Large Icon */}
          <View style={{
            width: 48, height: 48, borderRadius: 14,
            backgroundColor: config.bgColor,
            alignItems: "center", justifyContent: "center",
            marginRight: 14,
          }}>
            <Ionicons name={config.icon} size={24} color={config.color} />
          </View>

          <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <View style={{
              backgroundColor: config.bgColor,
              paddingHorizontal: 10, paddingVertical: 5,
              borderRadius: 8,
            }}>
              <AppText variant="caption" style={{ color: config.color, fontWeight: "700", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {t(config.labelKey)}
              </AppText>
            </View>
            {item.category && item.category !== "Training" && item.category !== "Event" && (
              <View style={{
                backgroundColor: "#F3F4F6",
                paddingHorizontal: 10, paddingVertical: 5,
                borderRadius: 8,
              }}>
                <AppText variant="caption" style={{ color: "#4B5563", fontWeight: "600", fontSize: 11 }}>
                  {item.category}
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={{ marginBottom: 16 }}>
          <AppText
            variant="h3"
            style={{
              fontWeight: "700", color: "#111827",
              fontSize: 18, lineHeight: 26, marginBottom: 8,
            }}
            numberOfLines={2}
          >
            {item.title}
          </AppText>

          {item.description ? (
            <AppText
              variant="bodyMd"
              style={{ color: "#6B7280", fontSize: 14, lineHeight: 22 }}
              numberOfLines={3}
            >
              {item.description}
            </AppText>
          ) : null}
        </View>

        {/* Footer / CTA */}
        <View style={{
          flexDirection: "row", justifyContent: "flex-end", alignItems: "center",
          borderTopWidth: 1, borderTopColor: "#F3F4F6",
          paddingTop: 14,
        }}>
          <AppText variant="bodySm" style={{ color: config.color, fontWeight: "600", fontSize: 13, marginRight: 6 }}>
            {t("common.viewDetails") || "View Details"}
          </AppText>
          <Ionicons name="arrow-forward" size={16} color={config.color} />
        </View>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      renderItem={renderResult}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 12 }}
      keyboardShouldPersistTaps="handled"
    />
  );
}
