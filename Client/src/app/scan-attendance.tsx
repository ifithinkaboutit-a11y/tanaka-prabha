// src/app/scan-attendance.tsx
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import React, { useState, useRef } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import AppText from "../components/atoms/AppText";
import { ApiError, eventsApi } from "@/services/apiService";

export const options = {
    headerShown: false,
};

type ScreenState =
    | "scanning"
    | "loading"
    | "success"
    | "error_expired"
    | "error_already"
    | "error_generic";

const ScanAttendance = () => {
    const router = useRouter();
    const { eventId: paramEventId } = useLocalSearchParams<{ eventId?: string }>();

    const [permission, requestPermission] = useCameraPermissions();
    const [screenState, setScreenState] = useState<ScreenState>("scanning");
    const [eventName, setEventName] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const processingRef = useRef(false);

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (processingRef.current || screenState !== "scanning") return;
        processingRef.current = true;

        try {
            // Parse the deep-link URL
            const parsed = Linking.parse(data);
            // Accept both tanakprabha://attendance and any URL with the right path
            const isAttendanceLink =
                (parsed.scheme === "tanakprabha" && parsed.path === "attendance") ||
                data.startsWith("tanakprabha://attendance");

            if (!isAttendanceLink) {
                processingRef.current = false;
                return;
            }

            const queryParams = parsed.queryParams as Record<string, string> | null;
            const eventId = queryParams?.eventId ?? paramEventId ?? "";
            const token = queryParams?.token ?? "";

            if (!eventId || !token) {
                setErrorMessage("Invalid QR code. Missing event ID or token.");
                setScreenState("error_generic");
                return;
            }

            setScreenState("loading");

            // Fetch event name for success screen
            const eventData = await eventsApi.getById(eventId);
            const name = eventData?.title ?? "Event";

            // Submit attendance
            await eventsApi.submitAttendance(eventId, token);

            setEventName(name);
            setScreenState("success");
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 401) {
                    setScreenState("error_expired");
                } else if (err.status === 409) {
                    setScreenState("error_already");
                } else {
                    setErrorMessage(err.message || "Something went wrong. Please try again.");
                    setScreenState("error_generic");
                }
            } else {
                setErrorMessage("Something went wrong. Please try again.");
                setScreenState("error_generic");
            }
        }
    };

    const handleRetry = () => {
        processingRef.current = false;
        setScreenState("scanning");
        setErrorMessage("");
    };

    // ── Permission not yet determined ──────────────────────────────────────────
    if (!permission) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#386641" />
            </View>
        );
    }

    // ── Permission denied ──────────────────────────────────────────────────────
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color="#374151" />
                    </Pressable>
                    <AppText variant="h3" style={styles.headerTitle}>
                        Scan to Attend
                    </AppText>
                </View>

                <View style={styles.centered}>
                    <View style={styles.permissionBox}>
                        <Ionicons name="camera-outline" size={56} color="#9CA3AF" />
                        <AppText variant="h3" style={styles.permissionTitle}>
                            Camera Access Required
                        </AppText>
                        <AppText variant="bodyMd" style={styles.permissionBody}>
                            Camera access is required to scan the attendance QR code. Please
                            allow camera access in your device settings.
                        </AppText>
                        <Pressable
                            onPress={() => {
                                if (permission.canAskAgain) {
                                    requestPermission();
                                } else {
                                    Linking.openSettings();
                                }
                            }}
                            style={styles.settingsBtn}
                        >
                            <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
                            <AppText variant="bodyMd" style={styles.settingsBtnText}>
                                {permission.canAskAgain ? "Allow Camera" : "Open Settings"}
                            </AppText>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    // ── Loading ────────────────────────────────────────────────────────────────
    if (screenState === "loading") {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#386641" />
                <AppText variant="bodyMd" style={styles.loadingText}>
                    Recording attendance…
                </AppText>
            </View>
        );
    }

    // ── Success ────────────────────────────────────────────────────────────────
    if (screenState === "success") {
        return (
            <View style={styles.container}>
                <View style={styles.centered}>
                    <View style={styles.successBox}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark-circle" size={72} color="#16A34A" />
                        </View>
                        <AppText variant="h2" style={styles.successTitle}>
                            Attendance Recorded!
                        </AppText>
                        <AppText variant="bodyMd" style={styles.successEventName}>
                            {eventName}
                        </AppText>
                        <AppText variant="bodySm" style={styles.successBody}>
                            Your attendance has been successfully recorded for this event.
                        </AppText>
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.doneBtn}
                        >
                            <AppText variant="bodyMd" style={styles.doneBtnText}>
                                Done
                            </AppText>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    // ── Error: expired token (401) ─────────────────────────────────────────────
    if (screenState === "error_expired") {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color="#374151" />
                    </Pressable>
                    <AppText variant="h3" style={styles.headerTitle}>
                        Scan to Attend
                    </AppText>
                </View>
                <View style={styles.centered}>
                    <View style={styles.errorBox}>
                        <Ionicons name="time-outline" size={56} color="#D97706" />
                        <AppText variant="h3" style={styles.errorTitle}>
                            QR Code Expired
                        </AppText>
                        <AppText variant="bodyMd" style={styles.errorBody}>
                            This QR code has expired. Please ask the organiser for a new one.
                        </AppText>
                        <Pressable onPress={handleRetry} style={styles.retryBtn}>
                            <AppText variant="bodyMd" style={styles.retryBtnText}>
                                Try Again
                            </AppText>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    // ── Error: already attended (409) ──────────────────────────────────────────
    if (screenState === "error_already") {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color="#374151" />
                    </Pressable>
                    <AppText variant="h3" style={styles.headerTitle}>
                        Scan to Attend
                    </AppText>
                </View>
                <View style={styles.centered}>
                    <View style={styles.alreadyBox}>
                        <Ionicons name="checkmark-done-circle-outline" size={56} color="#386641" />
                        <AppText variant="h3" style={styles.alreadyTitle}>
                            Already Recorded
                        </AppText>
                        <AppText variant="bodyMd" style={styles.errorBody}>
                            Your attendance has already been recorded.
                        </AppText>
                        <Pressable onPress={() => router.back()} style={styles.doneBtn}>
                            <AppText variant="bodyMd" style={styles.doneBtnText}>
                                Done
                            </AppText>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    // ── Error: generic ─────────────────────────────────────────────────────────
    if (screenState === "error_generic") {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={20} color="#374151" />
                    </Pressable>
                    <AppText variant="h3" style={styles.headerTitle}>
                        Scan to Attend
                    </AppText>
                </View>
                <View style={styles.centered}>
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
                        <AppText variant="h3" style={styles.errorTitle}>
                            Something Went Wrong
                        </AppText>
                        <AppText variant="bodyMd" style={styles.errorBody}>
                            {errorMessage}
                        </AppText>
                        <Pressable onPress={handleRetry} style={styles.retryBtn}>
                            <AppText variant="bodyMd" style={styles.retryBtnText}>
                                Try Again
                            </AppText>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    // ── Scanning ───────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#374151" />
                </Pressable>
                <AppText variant="h3" style={styles.headerTitle}>
                    Scan to Attend
                </AppText>
            </View>

            {/* Camera */}
            <View style={styles.cameraContainer}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                    onBarcodeScanned={handleBarCodeScanned}
                />

                {/* Overlay with cutout hint */}
                <View style={styles.overlay}>
                    <View style={styles.scanFrame} />
                </View>

                <View style={styles.scanHintContainer}>
                    <AppText variant="bodyMd" style={styles.scanHint}>
                        Point your camera at the event QR code
                    </AppText>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    backBtn: {
        marginRight: 12,
        padding: 8,
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
    },
    headerTitle: {
        color: "#111827",
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
    },
    // Camera
    cameraContainer: {
        flex: 1,
        position: "relative",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
    },
    scanFrame: {
        width: 240,
        height: 240,
        borderWidth: 3,
        borderColor: "#386641",
        borderRadius: 16,
        backgroundColor: "transparent",
    },
    scanHintContainer: {
        position: "absolute",
        bottom: 48,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    scanHint: {
        color: "#FFFFFF",
        backgroundColor: "rgba(0,0,0,0.55)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        fontSize: 14,
        fontWeight: "600",
        overflow: "hidden",
    },
    // Permission
    permissionBox: {
        alignItems: "center",
        paddingHorizontal: 8,
    },
    permissionTitle: {
        color: "#111827",
        fontWeight: "700",
        fontSize: 18,
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    permissionBody: {
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    settingsBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#386641",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
    },
    settingsBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 15,
    },
    // Loading
    loadingText: {
        color: "#6B7280",
        marginTop: 12,
    },
    // Success
    successBox: {
        alignItems: "center",
        paddingHorizontal: 8,
    },
    successIcon: {
        marginBottom: 16,
    },
    successTitle: {
        color: "#111827",
        fontWeight: "800",
        fontSize: 22,
        marginBottom: 8,
        textAlign: "center",
    },
    successEventName: {
        color: "#386641",
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    successBody: {
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 28,
    },
    doneBtn: {
        backgroundColor: "#386641",
        paddingHorizontal: 48,
        paddingVertical: 14,
        borderRadius: 14,
    },
    doneBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
    },
    // Error
    errorBox: {
        alignItems: "center",
        paddingHorizontal: 8,
    },
    errorTitle: {
        color: "#111827",
        fontWeight: "700",
        fontSize: 18,
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    errorBody: {
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    retryBtn: {
        backgroundColor: "#386641",
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 14,
    },
    retryBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 15,
    },
    // Already attended
    alreadyBox: {
        alignItems: "center",
        paddingHorizontal: 8,
    },
    alreadyTitle: {
        color: "#111827",
        fontWeight: "700",
        fontSize: 18,
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
});

export default ScanAttendance;
