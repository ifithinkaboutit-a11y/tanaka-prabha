// src/app/(auth)/set-password.tsx
// Shown after OTP verify (new signup OR forgot-password reset).
// Reuses all existing auth screen styles (same card/video layout as phone-input & otp-input).
import AppText from "@/components/atoms/AppText";
import AuthVideoBackground from "@/components/molecules/AuthVideoBackground";
import { useTranslation } from "@/i18n";
import { authApi, tokenManager } from "@/services/apiService";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useRef } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const SetPasswordScreen = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const router = useRouter();
    const { t } = useTranslation();
    const { phoneNumber, mode } = useLocalSearchParams<{ phoneNumber: string; mode?: string }>();
    // mode === 'reset' means this is a forgot-password reset (user already logged in via OTP)
    // mode === 'signup' (default) means first-time setup

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 45, useNativeDriver: true }),
        ]).start();
    };

    const handleSetPassword = async () => {
        setError(null);

        if (password.length < 6) {
            const msg = "Password must be at least 6 characters";
            setError(msg);
            shake();
            Alert.alert("Invalid Password", msg);
            return;
        }
        if (password !== confirmPassword) {
            const msg = "Passwords do not match";
            setError(msg);
            shake();
            Alert.alert("Mismatch", msg);
            return;
        }

        if (!phoneNumber) {
            Alert.alert("Error", "Phone number missing. Please restart the flow.");
            return;
        }

        setLoading(true);
        try {
            await authApi.setPassword(phoneNumber, password);
            Alert.alert(
                "✅ Password Set",
                mode === "reset"
                    ? "Your password has been reset. Please log in."
                    : "Your password has been set. Welcome aboard!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            if (mode === "reset") {
                                router.replace("/(auth)/" as any);
                            } else {
                                // First-time signup: continue to onboarding
                                router.replace("/(auth)/personal-details" as any);
                            }
                        },
                    },
                ]
            );
        } catch (e: any) {
            const msg = e.message || "Failed to set password. Please try again.";
            setError(msg);
            shake();
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const isReady = password.length >= 6 && confirmPassword.length >= 6;

    return (
        <KeyboardAvoidingView
            style={s.root}
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            keyboardVerticalOffset={0}
        >
            <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
            <ScrollView
                bounces={false}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {/* Video — same height as otp-input */}
                <View className="h-[52vh]">
                    <AuthVideoBackground />
                </View>

                {/* Card — identical layout to phone-input / otp-input */}
                <View style={s.card}>
                    <AppText variant="h2" style={s.cardLabel}>
                        {mode === "reset" ? "Reset Password" : "Set Password"}
                    </AppText>

                    <Text style={s.videoSubtitle}>
                        {mode === "reset"
                            ? "Create a new password for your account"
                            : "Set a password to log in faster next time"}
                    </Text>

                    {/* Password Field */}
                    <Text style={s.inputLabel}>NEW PASSWORD</Text>
                    <Animated.View style={[s.inputRow, { transform: [{ translateX: shakeAnim }] }, error ? s.inputRowError : null]}>
                        <TextInput
                            style={s.input}
                            value={password}
                            onChangeText={(v) => { setPassword(v); setError(null); }}
                            placeholder="At least 6 characters"
                            placeholderTextColor="#C4C9D4"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            returnKeyType="next"
                        />
                        <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={s.eyeBtn}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Confirm Field */}
                    <Text style={[s.inputLabel, { marginTop: 12 }]}>CONFIRM PASSWORD</Text>
                    <View style={[s.inputRow, error ? s.inputRowError : null]}>
                        <TextInput
                            style={s.input}
                            value={confirmPassword}
                            onChangeText={(v) => { setConfirmPassword(v); setError(null); }}
                            placeholder="Re-enter password"
                            placeholderTextColor="#C4C9D4"
                            secureTextEntry={!showConfirm}
                            autoCapitalize="none"
                            returnKeyType="done"
                            onSubmitEditing={handleSetPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirm((p) => !p)} style={s.eyeBtn}>
                            <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Helper / error — same minHeight as otp-input helperRow */}
                    <View style={s.helperRow}>
                        {error ? (
                            <View style={s.errorRow}>
                                <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                                <Text style={s.errorText}>{error}</Text>
                            </View>
                        ) : (
                            <Text style={s.charCount}>Minimum 6 characters</Text>
                        )}
                    </View>

                    {/* CTA — identical styles to phone-input / otp-input ctaBtn */}
                    <Pressable
                        onPress={handleSetPassword}
                        disabled={!isReady || loading}
                        style={[s.ctaBtn, (!isReady || loading) && s.ctaBtnDisabled]}
                    >
                        {loading ? (
                            <View style={s.loadingRow}>
                                <ActivityIndicator color="white" size="small" />
                                <Text style={[s.ctaText, { marginLeft: 8 }]}>Saving…</Text>
                            </View>
                        ) : (
                            <View style={s.loadingRow}>
                                <Text style={s.ctaText}>{mode === "reset" ? "Reset Password" : "Set Password"}</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
                            </View>
                        )}
                    </Pressable>

                    {/* Security note */}
                    <View style={s.securityRow}>
                        <Ionicons name="lock-closed-outline" size={12} color="#9CA3AF" />
                        <Text style={s.securityText}>Your password is encrypted and stored securely</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SetPasswordScreen;

// ─── Styles — intentionally mirror otp-input.tsx exactly ──────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#fff" },

    card: {
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        marginTop: -32,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: Platform.OS === "ios" ? 48 : 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 16,
    },

    cardLabel: {
        color: "#374151",
        fontSize: 22,
        fontWeight: "900",
        marginBottom: 2,
        letterSpacing: 0.1,
        textTransform: "uppercase",
    },
    videoSubtitle: {
        color: "#6B7280",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    inputLabel: {
        color: "#374151",
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 10,
        letterSpacing: 0.3,
        textTransform: "uppercase",
    },

    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        backgroundColor: "#F9FAFB",
        overflow: "hidden",
    },
    inputRowError: { borderColor: "#EF4444" },
    input: {
        flex: 1,
        height: 58,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#111827",
        fontWeight: "600",
    },
    eyeBtn: {
        paddingHorizontal: 14,
        height: 58,
        alignItems: "center",
        justifyContent: "center",
    },

    helperRow: { minHeight: 22, marginTop: 8, marginBottom: 18 },
    errorRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    errorText: { color: "#EF4444", fontSize: 13, flex: 1 },
    charCount: { color: "#9CA3AF", fontSize: 12 },

    ctaBtn: {
        width: "100%",
        backgroundColor: "#386641",
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
        marginBottom: 18,
        shadowColor: "#386641",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    ctaBtnDisabled: {
        backgroundColor: "#D1D5DB",
        shadowOpacity: 0,
        elevation: 0,
    },
    loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    ctaText: { color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: 0.3 },

    securityRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    },
    securityText: { color: "#9CA3AF", fontSize: 11 },
});
