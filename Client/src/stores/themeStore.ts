import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => Promise<void>;
    loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: "light",
    setTheme: async (theme) => {
        try {
            await AsyncStorage.setItem("app_theme", theme);
            set({ theme });
        } catch (e) {
            console.error("Error saving theme", e);
        }
    },
    loadTheme: async () => {
        try {
            const savedTheme = await AsyncStorage.getItem("app_theme");
            if (savedTheme) {
                set({ theme: savedTheme as ThemeMode });
            }
        } catch (e) {
            console.error("Error loading theme", e);
        }
    },
}));
