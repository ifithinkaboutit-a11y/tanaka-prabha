// src/components/molecules/ProgramSection.tsx
import { TouchableOpacity, View } from "react-native";
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

  return (
    <View className="mb-6 px-4 bg-white">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-4">
        <AppText variant="h3" className="font-bold text-neutral-textDark">
          {title}
        </AppText>
        <TouchableOpacity onPress={onViewAll}>
          <AppText variant="bodySm" className="text-primary-forest font-medium">
            {t("programs.viewAll")}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Program Cards */}
      <View>
        {programs.slice(0, 1).map((program) => (
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
