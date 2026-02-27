// src/app/(auth)/admin-login.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
    ActivityIndicator,
    Alert
} from "react-native";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { loginAsAdmin } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) return;

        setLoading(true);
        try {
            const baseUrl = process.env.EXPO_PUBLIC_API_URL || "https://tanak-prabha.onrender.com/api";
            const response = await fetch(`${baseUrl}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                const adminData = {
                    id: data.admin.id,
                    name: data.admin.email, // backend doesn't return name currently
                    role: 'admin',
                    email: data.admin.email
                };
                await loginAsAdmin(data.token, adminData as any);
            } else {
                Alert.alert("Login Failed", data.error || data.message || "Invalid credentials");
            }
        } catch (error) {
            Alert.alert("Error", "Network error. Please try again.");
            console.error("Admin login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={s.root}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={s.card}>
                <View style={s.header}>
                    <Ionicons name="shield-checkmark" size={48} color="#386641" />
                    <AppText variant="h2" style={s.title}>Admin Login</AppText>
                    <Text style={s.subtitle}>Restricted access</Text>
                </View>

                <TextInput
                    style={s.input}
                    placeholder="Email Address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={s.input}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Button
                    variant="primary"
                    onPress={handleLogin}
                    disabled={!email || !password || loading}
                    style={s.btn}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={s.btnText}>Login as Admin</Text>
                    )}
                </Button>
                <Button
                    variant="outline"
                    label="Cancel"
                    onPress={() => router.back()}
                    style={s.btn}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginTop: 16,
        color: "#111827",
    },
    subtitle: {
        color: "#6B7280",
        fontSize: 14,
        marginTop: 8,
    },
    input: {
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        color: "#1F2937",
        backgroundColor: "#F9FAFB",
    },
    btn: {
        paddingVertical: 16,
        marginTop: 8,
    },
    btnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
        textAlign: "center",
    },
});
