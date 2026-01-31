// src/app/(tab)/Program.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import AppText from "../../components/atoms/AppText";
import ProgramSection from "../../components/molecules/ProgramSection";
import SearchBar from "../../components/molecules/SearchBar";
import { schemes, trainingPrograms } from "../../data/content";
import { useTranslation } from "../../i18n";

const Program = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter programs based on search query
  const filteredSchemes = useMemo(() => {
    if (!searchQuery.trim()) return schemes;
    return schemes.filter(
      (program) =>
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const filteredTrainingPrograms = useMemo(() => {
    if (!searchQuery.trim()) return trainingPrograms;
    return trainingPrograms.filter(
      (program) =>
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const handleProgramPress = (program: any) => {
    router.push({
      pathname: "/program-details",
      params: { programId: program.id },
    });
  };

  const handleViewAllSchemes = () => {
    // Navigate to full schemes list - placeholder for future implementation
    alert("Full schemes list coming soon!");
  };

  const handleViewAllTraining = () => {
    // Navigate to full training programs list - placeholder for future implementation
    alert("Full training programs list coming soon!");
  };

  return (
    <ScrollView className="flex-1 bg-neutral-surface">
      {/* Header */}
      <View className="pt-12 pb-4 px-8 bg-white">
        <AppText variant="h1" className="text-neutral-textDark">
          {t("programs.title")}
        </AppText>
      </View>
      {/* Search Bar */}
      <View className="py-4">
        <SearchBar
          placeholder={t("programs.searchPlaceholder")}
          onSearch={setSearchQuery}
        />
      </View>
      <View className="px-4">
        {/* Government Schemes Section */}
        <ProgramSection
          title={t("programs.governmentSchemes")}
          programs={filteredSchemes}
          onViewAll={handleViewAllSchemes}
          onProgramPress={handleProgramPress}
        />

        {/* Training Programs Section */}
        <ProgramSection
          title={t("programs.trainingPrograms")}
          programs={filteredTrainingPrograms}
          onViewAll={handleViewAllTraining}
          onProgramPress={handleProgramPress}
        />
      </View>
    </ScrollView>
  );
};

export default Program;
