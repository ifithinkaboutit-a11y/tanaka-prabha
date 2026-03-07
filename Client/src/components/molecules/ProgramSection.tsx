// src/components/molecules/ProgramSection.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Scheme } from "@/services/apiService";
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
            style={{ fontWeight: "700", color: "#111827", fontSize: 20, letterSpacing: -0.2 }}
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
              {programs.length}
            </AppText>
          </View>
        </View>
        <Pressable
          onPress={onViewAll}
          style={({ pressed }) => ({
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: 4,
            alignItems: "center",
            opacity: pressed ? 0.7 : 1,
          })}
          className="flex flex-row items-center justify-center"
        >
          <AppText
            variant="bodySm"
            style={{ color: "#16A34A", fontWeight: "600", fontSize: 14 }}
            className="flex flex-row items-center justify-center"

          >
            {t("programs.viewAll")}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color="#16A34A" style={{ marginLeft: 2 }} />
        </Pressable>
      </View>

      {/* Program Cards */}
      <View>
        {programs.map((program) => (
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
