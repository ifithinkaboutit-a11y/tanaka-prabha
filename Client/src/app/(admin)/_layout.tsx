// src/app/(admin)/_layout.tsx
import { Stack } from "expo-router";

export default function AdminLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="create-event" />
            <Stack.Screen name="mark-attendance" />
            <Stack.Screen name="view-attendance" />
            <Stack.Screen name="content-management" />
            <Stack.Screen name="send-notification" />
        </Stack>

    );
}
