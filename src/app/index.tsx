import '@/styles/global.css'
import React from "react";
import { Text, View } from "react-native";

const Index = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind v5!
      </Text>
    </View>
  );
};

export default Index;
