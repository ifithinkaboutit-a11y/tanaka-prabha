// src/components/molecules/ProgramSection.tsx
import { View } from "react-native";
import { Scheme } from "../../data/interfaces";
import { useTranslation } from "../../i18n";
import AppText from "../atoms/AppText";
import Button from "../atoms/Button";
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
    <View className="mb-6 px-4">
      {/* Section Header */}
      <View className="flex-row items-center justify-center m-4 p-4">
        <AppText variant="h2" className="text-neutral-textDark">
          {title}
        </AppText>
        <Button
          label={t("programs.viewAll")}
          variant="outline"
          size="sm"
          onPress={onViewAll}
          className="text-primary"
        />
      </View>

      {/* Program Cards */}
      <View className="px-4">
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
