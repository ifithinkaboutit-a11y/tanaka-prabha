import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

const ACTIVE_COLOR = "#386641";
const INACTIVE_COLOR = "#9E9E9E";

const TabNavigation = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,

        tabBarStyle: {
          height: 75,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 0.5,
          borderTopColor: "#E0E0E0",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={focused ? size + 2 : size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Program"
        options={{
          title: "Programs",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={focused ? size + 2 : size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Schemes"
        options={{
          title: "Schemes",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "pie-chart" : "pie-chart-outline"}
              size={focused ? size + 2 : size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Connect"
        options={{
          title: "Connect",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={focused ? size + 2 : size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? size + 2 : size}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default TabNavigation;
