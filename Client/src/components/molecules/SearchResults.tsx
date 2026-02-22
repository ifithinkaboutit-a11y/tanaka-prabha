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
          marginBottom: 10,
          backgroundColor: pressed ? "#F9FAFB" : "#FFFFFF",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "#F1F5F9",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 4,
          elevation: 1,
          flexDirection: "row",
          alignItems: "flex-start",
        })}
      >
        {/* Type Icon */}
        <View style={{
          width: 42, height: 42, borderRadius: 12,
          backgroundColor: config.bgColor,
          alignItems: "center", justifyContent: "center",
          marginRight: 14, marginTop: 2,
        }}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {/* Title + Category */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <AppText
              variant="bodyMd"
              style={{
                flex: 1, marginRight: 8,
                fontWeight: "700", color: "#111827",
                fontSize: 15, lineHeight: 20,
              }}
              numberOfLines={2}
            >
              {item.title}
            </AppText>
          </View>

          {/* Description */}
          {item.description ? (
            <AppText
              variant="bodySm"
              style={{ color: "#6B7280", fontSize: 13, lineHeight: 18, marginBottom: 8 }}
              numberOfLines={2}
            >
              {item.description}
            </AppText>
          ) : null}

          {/* Type Badge + Category */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{
              backgroundColor: config.bgColor,
              paddingHorizontal: 8, paddingVertical: 3,
              borderRadius: 8,
            }}>
              <AppText variant="caption" style={{ color: config.color, fontWeight: "700", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.3 }}>
                {t(config.labelKey)}
              </AppText>
            </View>
            {item.category && item.category !== "Training" && item.category !== "Event" && (
              <View style={{
                backgroundColor: "#F3F4F6",
                paddingHorizontal: 8, paddingVertical: 3,
                borderRadius: 8,
              }}>
                <AppText variant="caption" style={{ color: "#6B7280", fontWeight: "600", fontSize: 10 }}>
                  {item.category}
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Chevron */}
        <View style={{ justifyContent: "center", marginLeft: 4, marginTop: 8 }}>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
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
