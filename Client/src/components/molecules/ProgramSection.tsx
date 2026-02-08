// src/components/molecules/ProgramSection.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Scheme } from "../../data/interfaces";
import { useTranslation } from "../../i18n";
import AppText from "../atoms/AppText";
import ProgramCard from "../atoms/ProgramCard";

type ProgramSectionProps = {
  title: string;
  programs: Scheme[];
  onViewAll?: () => void;
  onProgramPress?: (program: Scheme) => void;
};

export default function ProgramSection({
  title,
  programs,
  onViewAll,
  onProgramPress,
}: ProgramSectionProps) {
  const { t } = useTranslation();

  if (programs.length === 0) {
    return (
      <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
        <AppText
          variant="h3"
          style={{ fontWeight: "700", color: "#1F2937", fontSize: 20, marginBottom: 12 }}
        >
          {title}
        </AppText>
        <View
          style={{
            backgroundColor: "#F3F4F6",
            borderRadius: 12,
            padding: 24,
            alignItems: "center",
          }}
        >
          <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
          <AppText
            variant="bodyMd"
            style={{ color: "#6B7280", marginTop: 12, textAlign: "center" }}
          >
            {t("programs.noPrograms")}
          </AppText>
        </View>
      </View>
    );
  }

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
            style={{ fontWeight: "700", color: "#1F2937", fontSize: 20 }}
          >
            {title}
          </AppText>
          <View
            style={{
              backgroundColor: "#DBEAFE",
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 2,
              marginLeft: 8,
            }}
          >
            <AppText
              variant="bodySm"
              style={{ color: "#2563EB", fontWeight: "600", fontSize: 12 }}
            >
              {programs.length}
            </AppText>
          </View>
        </View>
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
            style={{ color: "#386641", fontWeight: "600", fontSize: 14 }}
          >
            {t("programs.viewAll")}
          </AppText>
          <Ionicons name="chevron-forward" size={18} color="#386641" style={{ marginLeft: 2 }} />
        </Pressable>
      </View>

      {/* Program Cards - Show up to 2 */}
      <View>
        {programs.slice(0, 2).map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            onPress={() => onProgramPress?.(program)}
          />
        ))}
      </View>
    </View>
  );
}
