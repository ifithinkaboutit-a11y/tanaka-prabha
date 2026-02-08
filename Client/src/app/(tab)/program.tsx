// src/app/(tab)/Program.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import { ScrollView, View, ActivityIndicator, RefreshControl } from "react-native";
import AppText from "../../components/atoms/AppText";
import ProgramSection from "../../components/molecules/ProgramSection";
import SearchBar from "../../components/molecules/SearchBar";
import { schemesApi, Scheme } from "@/services/apiService";
import { useTranslation } from "../../i18n";

const Program = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const allSchemes = await schemesApi.getAll({ limit: 50 });
      
      // Separate training programs from regular schemes
      const training = allSchemes.filter((s) => s.category === "Training");
      const otherSchemes = allSchemes.filter((s) => s.category !== "Training");
      
      setSchemes(otherSchemes);
      setTrainingPrograms(training);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Filter programs based on search query
  const filteredSchemes = useMemo(() => {
    if (!searchQuery.trim()) return schemes;
    return schemes.filter(
      (program) =>
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (program.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, schemes]);

  const filteredTrainingPrograms = useMemo(() => {
    if (!searchQuery.trim()) return trainingPrograms;
    return trainingPrograms.filter(
      (program) =>
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (program.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, trainingPrograms]);

  const handleProgramPress = (program: any) => {
    router.push({
      pathname: "/program-details",
      params: { programId: program.id },
    });
  };

  const handleViewAllSchemes = () => {
    router.push("/(tab)/schemes" as any);
  };

  const handleViewAllTraining = () => {
    console.log("View all training programs");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#386641" />
        <AppText variant="bodyMd" style={{ color: "#6B7280", marginTop: 12 }}>
          {t("common.loading")}
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#386641"]}
          tintColor="#386641"
        />
      }
    >
      {/* Header */}
      <View
        style={{
          paddingTop: 48,
          paddingBottom: 8,
          paddingHorizontal: 16,
          backgroundColor: "#FFFFFF",
        }}
      >
        <AppText
          variant="h2"
          style={{ fontWeight: "700", color: "#1F2937", fontSize: 28 }}
        >
          {t("programs.title")}
        </AppText>
        <AppText
          variant="bodySm"
          style={{ color: "#6B7280", marginTop: 4, fontSize: 14 }}
        >
          {t("programs.subtitle")}
        </AppText>
      </View>

      {/* Search Bar */}
      <View style={{ paddingBottom: 16, backgroundColor: "#FFFFFF" }}>
        <SearchBar
          placeholder={t("programs.searchPlaceholder")}
          onSearch={setSearchQuery}
        />
      </View>

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

      {/* Bottom Spacing */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

export default Program;
