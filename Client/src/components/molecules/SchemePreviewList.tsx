// src/components/molecules/SchemePreviewList.tsx
import React from "react";
import { View } from "react-native";
import AppText from "../atoms/AppText";
import SchemePreviewCard from "../atoms/SchemePreviewCard";
import { Ionicons } from "@expo/vector-icons";

type Scheme = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  onPress?: () => void;
};

type SchemePreviewListProps = {
  schemes?: Scheme[];
};

export default function SchemePreviewList({
  schemes,
}: SchemePreviewListProps) {
  // No schemes from API — show empty state instead of static fallback
  if (!schemes || schemes.length === 0) {
    return (
      <View style={{ alignItems: "center", paddingVertical: 24, gap: 8 }}>
        <Ionicons name="folder-open-outline" size={40} color="#D1D5DB" />
        <AppText variant="bodySm" style={{ color: "#9CA3AF", textAlign: "center" }}>
          No schemes available right now
        </AppText>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 16 }}>
      {schemes.map((scheme) => (
        <SchemePreviewCard
          key={scheme.id}
          title={scheme.title}
          description={scheme.description}
          category={scheme.category}
          imageUrl={scheme.imageUrl}
          onPress={
            scheme.onPress ||
            (() => console.log(`Navigate to scheme: ${scheme.id}`))
          }
        />
      ))}
    </View>
  );
}
