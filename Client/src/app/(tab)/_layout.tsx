import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "../../i18n";
import { theme } from "@/styles/colors";

const ACTIVE_COLOR = theme.primary.green;
const INACTIVE_COLOR = theme.text.light;

// Push token registration lives in AuthContext (on login and on each authenticated
// app open) — see setupPushNotifications. No duplicate registration here.
const TabNavigation = () => {
  const { t } = useTranslation();

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
          title: t("tabs.home"),
          tabBarAccessibilityLabel: t("tabs.home"),
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
        name="program"
        options={{
          title: t("tabs.programs"),
          tabBarAccessibilityLabel: t("tabs.programs"),
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
        name="schemes"
        options={{
          title: t("tabs.schemes"),
          tabBarAccessibilityLabel: t("tabs.schemes"),
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
        name="connect"
        options={{
          title: t("tabs.connect"),
          tabBarAccessibilityLabel: t("tabs.connect"),
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
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarAccessibilityLabel: t("tabs.profile"),
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
