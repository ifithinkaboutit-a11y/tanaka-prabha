import BannerSlideshow from "@/components/molecules/Banner";
import GreetingHeader from "@/components/molecules/GreetingHeader";
import QuickActionGrid from "@/components/molecules/QuickActionGrid";
import SchemePreviewList from "@/components/molecules/SchemePreviewList";
import SearchBar from "@/components/molecules/SearchBar";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const Home = () => {
  const router = useRouter();
  const banners = [
    {
      title: "Welcome to Tanak Prabha",
      subtitle: "Discover amazing features",
      imageUrl:
        "https://via.placeholder.com/400x144/386641/FFFFFF?text=Banner+1",
      url: "https://example.com/welcome",
    },
    {
      title: "New Programs Available",
      subtitle: "Explore our latest offerings",
      imageUrl:
        "https://via.placeholder.com/400x144/6A8F74/FFFFFF?text=Banner+2",
      url: "https://example.com/programs",
    },
    {
      title: "Connect with Experts",
      subtitle: "Get personalized assistance",
      imageUrl:
        "https://via.placeholder.com/400x144/7F5539/FFFFFF?text=Banner+3",
      url: "https://example.com/connect",
    },
  ];
  const quickActions = [
    {
      title: "Update your profile",
      icon: "person-outline" as const,
      onPress: () => router.push("/profile"),
    },
    {
      title: "Ongoing Events",
      icon: "calendar-outline" as const,
      onPress: () => console.log("Navigate to events"),
    },
    {
      title: "Government Schemes",
      icon: "document-text-outline" as const,
      onPress: () => console.log("Navigate to schemes"),
    },
    {
      title: "Book an Appointment",
      icon: "call-outline" as const,
      onPress: () => console.log("Navigate to connect/appointments"),
    },
  ];
  const schemes = [
    {
      id: "1",
      title: "Pradhan Mantri Jan Dhan Yojana",
      description:
        "Financial inclusion program providing banking services to unbanked citizens",
      category: "Financial Inclusion",
      imageUrl: "https://via.placeholder.com/64x64/386641/FFFFFF?text=PMJDY",
      onPress: () => console.log("Navigate to PMJDY details"),
    },
    {
      id: "2",
      title: "Ayushman Bharat Yojana",
      description:
        "Health insurance scheme providing coverage up to ₹5 lakhs per family",
      category: "Healthcare",
      imageUrl: "https://via.placeholder.com/64x64/4CAF50/FFFFFF?text=ABY",
      onPress: () => console.log("Navigate to Ayushman Bharat details"),
    },
    {
      id: "3",
      title: "Pradhan Mantri Awas Yojana",
      description: "Housing scheme for affordable homes for all by 2022",
      category: "Housing",
      imageUrl: "https://via.placeholder.com/64x64/FF9800/FFFFFF?text=PMAY",
      onPress: () => console.log("Navigate to PMAY details"),
    },
    {
      id: "4",
      title: "Swachh Bharat Mission",
      description: "Clean India campaign for sanitation and waste management",
      category: "Sanitation",
      imageUrl: "https://via.placeholder.com/64x64/9C27B0/FFFFFF?text=SBM",
      onPress: () => console.log("Navigate to Swachh Bharat details"),
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-[#F6F6F6]"
      showsVerticalScrollIndicator={false}
    >
      <GreetingHeader
        name="John Doe"
        onNotificationPress={() => console.log("Notifications pressed")}
        onAvatarPress={() => router.push("/profile")}
      />
      <SearchBar />
      <View className="px-4 py-2">
        <BannerSlideshow banners={banners} />
      </View>
      <View className="px-8 pb-8">
        <Text className="text-left text-black text-3xl font-bold">
          Quick Access
        </Text>
        <QuickActionGrid actions={quickActions} />
      </View>
      <View className="px-8 pb-8">
        <Text className="text-left text-black text-3xl font-bold mb-4">
          Popular Schemes
        </Text>
        <SchemePreviewList schemes={schemes} />
      </View>
    </ScrollView>
  );
};

export default Home;
