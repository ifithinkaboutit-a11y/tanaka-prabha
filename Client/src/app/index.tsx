import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { useLanguageStore } from "@/stores/languageStore";

export default function Index() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const { hasLaunched } = useLanguageStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#386641" />
      </View>
    );
  }

  if (isAdmin) {
    return <Redirect href="/(admin)/dashboard" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tab)" />;
  }

  if (!hasLaunched) {
    return <Redirect href="/(auth)/language-selection" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
