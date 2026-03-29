// src/app/(auth)/location-picker.tsx
//
// Modes (controlled by search params):
//   fromProfile=true        → profile update, navigates back on confirm
//   purpose=profile         → fills address fields via setProfileAddressOverride
//   purpose=event-location  → picks a single lat/lng for event creation
//   (default)               → onboarding home-location flow

import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { userApi } from "../../services/apiService";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Dimensions,
    Keyboard,
    Linking,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import MapView, { Circle, PROVIDER_GOOGLE } from "react-native-maps";
import AppText from "../../components/atoms/AppText";
import { useOnboardingStore } from "../../stores/onboardingStore";
import {
    googleReverseGeocode,
    parseGoogleAddress,
    fetchPlacePredictions,
    fetchPlaceLatLng,
    formatAccuracyLabel,
    type PlacePrediction,
} from "../../utils/locationUtils";

export const unstable_settings = { headerShown: false };

// ─── Constants ────────────────────────────────────────────────────────────────

const INDIA_FALLBACK = { lat: 20.5937, lng: 78.9629 };
const GPS_ACQUISITION_TIMEOUT_MS = 10_000;
const GPS_ACCURACY_THRESHOLD_M = 100;
const SEARCH_DEBOUNCE_MS = 350;
const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

type GpsStatus = "loading" | "acquired" | "no-fix" | "denied";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LocationPickerScreen() {
    const router = useRouter();
    const { fromProfile, purpose } = useLocalSearchParams<{
        fromProfile?: string;
        purpose?: string;
    }>();
    const isProfileMode = fromProfile === "true" || !!purpose;

    const {
        locationData,
        setLocationData,
        personalDetails,
        updatePersonalDetails,
        setProfileAddressOverride,
        setEventLocationPick,
        setBeneficiaryLocationPick,
    } = useOnboardingStore();

    // ── GPS / map state ────────────────────────────────────────────────────────
    const [gpsStatus, setGpsStatus] = useState<GpsStatus>("loading");
    const [initialPos, setInitialPos] = useState<{ lat: number; lng: number } | null>(null);
    const [gpsAccuracy, setGpsAccuracy] = useState(50);
    const [accuracyCircleVisible, setAccuracyCircleVisible] = useState(false);
    const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null);

    // ── Address display state ──────────────────────────────────────────────────
    const [address, setAddress] = useState("");
    const [geocodeLoading, setGeocodeLoading] = useState(false);
    const [geocodeError, setGeocodeError] = useState(false);

    // ── My-location button state ───────────────────────────────────────────────
    const [myLocationLoading, setMyLocationLoading] = useState(false);
    const [myLocationError, setMyLocationError] = useState<string | null>(null);

    // ── Search state ───────────────────────────────────────────────────────────
    const [searchText, setSearchText] = useState("");
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [searchSelectError, setSearchSelectError] = useState(false);

    // ── Save state ─────────────────────────────────────────────────────────────
    const [saving, setSaving] = useState(false);

    // ── Pre-populate address override from profile when purpose === "profile" ──
    useEffect(() => {
        if (purpose !== "profile") return;
        userApi.getProfile().then((res) => {
            if (!isMountedRef.current) return;
            const profile = res.data?.user;
            if (!profile) return;
            const initial: Record<string, string> = {};
            if (profile.state)    initial.state    = profile.state;
            if (profile.district) initial.district = profile.district;
            if (Object.keys(initial).length > 0) {
                setProfileAddressOverride(initial);
            }
        }).catch(() => { /* silently ignore — pre-population is best-effort */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [purpose]);

    // ── Refs ───────────────────────────────────────────────────────────────────
    const mapRef = useRef<MapView>(null);
    const geocodeRequestId = useRef(0);
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const myLocationErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (myLocationErrorTimer.current) clearTimeout(myLocationErrorTimer.current);
            if (searchDebounce.current) clearTimeout(searchDebounce.current);
        };
    }, []);

    // ── Back-navigation guard ──────────────────────────────────────────────────
    useEffect(() => {
        if (isProfileMode || locationData === null) return;
        const onBack = () => {
            Alert.alert(
                "Change location?",
                "Going back will clear your confirmed pin.",
                [
                    { text: "Stay here", style: "cancel" },
                    {
                        text: "Go back",
                        style: "destructive",
                        onPress: () => { setLocationData(null); router.back(); },
                    },
                ]
            );
            return true;
        };
        const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
        return () => sub.remove();
    }, [isProfileMode, locationData, setLocationData, router]);

    // ── Reverse geocode ────────────────────────────────────────────────────────
    const geocodeCoords = useCallback(async (lat: number, lng: number) => {
        const requestId = ++geocodeRequestId.current;
        setGeocodeLoading(true);
        setGeocodeError(false);
        try {
            const result = await googleReverseGeocode(lat, lng);
            if (requestId !== geocodeRequestId.current) return;
            setAddress(result);
        } catch {
            if (requestId === geocodeRequestId.current) {
                setGeocodeError(true);
                setAddress("");
            }
        } finally {
            if (requestId === geocodeRequestId.current) setGeocodeLoading(false);
        }
    }, []);

    // ── GPS acquisition on mount ───────────────────────────────────────────────
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (!isMountedRef.current) return;

                if (status !== "granted") {
                    setGpsStatus("denied");
                    setInitialPos(INDIA_FALLBACK);
                    return;
                }

                try {
                    const positionPromise = Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    const timeoutPromise = new Promise<never>((_, reject) => {
                        timeoutId = setTimeout(
                            () => reject(new Error("gps_timeout")),
                            GPS_ACQUISITION_TIMEOUT_MS
                        );
                    });
                    const loc = await Promise.race<Location.LocationObject>([positionPromise, timeoutPromise]);
                    if (timeoutId) clearTimeout(timeoutId);
                    if (!isMountedRef.current) return;

                    const { latitude, longitude, accuracy } = loc.coords;
                    const accuracyVal = accuracy ?? 50;
                    setGpsAccuracy(accuracyVal);
                    setInitialPos({ lat: latitude, lng: longitude });
                    setPinCoords({ lat: latitude, lng: longitude });
                    setAccuracyCircleVisible(true);
                    setGpsStatus("acquired");
                    geocodeCoords(latitude, longitude);
                } catch {
                    if (timeoutId) clearTimeout(timeoutId);
                    if (!isMountedRef.current) return;
                    setGpsStatus("no-fix");
                    setInitialPos(INDIA_FALLBACK);
                }
            } catch {
                if (timeoutId) clearTimeout(timeoutId);
                if (!isMountedRef.current) return;
                setGpsStatus("denied");
                setInitialPos(INDIA_FALLBACK);
            }
        })();

        return () => { if (timeoutId) clearTimeout(timeoutId); };
    }, [geocodeCoords]);

    // ── Fly map to coords ──────────────────────────────────────────────────────
    const flyTo = useCallback((lat: number, lng: number, zoom = 15) => {
        const delta = (0.01 / zoom) * 15;
        mapRef.current?.animateToRegion(
            { latitude: lat, longitude: lng, latitudeDelta: delta, longitudeDelta: delta },
            800
        );
    }, []);

    // ── GPS re-acquisition ─────────────────────────────────────────────────────
    const reacquireGPS = useCallback(async (): Promise<boolean> => {
        try {
            const positionPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("gps_timeout")), GPS_ACQUISITION_TIMEOUT_MS)
            );
            const loc = await Promise.race<Location.LocationObject>([positionPromise, timeoutPromise]);
            const { latitude, longitude, accuracy } = loc.coords;
            const accuracyVal = accuracy ?? 50;
            setGpsAccuracy(accuracyVal);
            setPinCoords({ lat: latitude, lng: longitude });
            flyTo(latitude, longitude, 15);
            setAccuracyCircleVisible(true);
            setGpsStatus("acquired");
            geocodeCoords(latitude, longitude);
            return true;
        } catch {
            return false;
        }
    }, [flyTo, geocodeCoords]);

    // ── My-location button ─────────────────────────────────────────────────────
    const handleMyLocation = useCallback(async () => {
        if (myLocationErrorTimer.current) clearTimeout(myLocationErrorTimer.current);
        setMyLocationError(null);

        if (gpsStatus === "no-fix") {
            setMyLocationLoading(true);
            const ok = await reacquireGPS();
            if (!isMountedRef.current) return;
            setMyLocationLoading(false);
            if (!ok) {
                setMyLocationError("Could not get GPS location. Try moving to an open area.");
                myLocationErrorTimer.current = setTimeout(() => {
                    if (isMountedRef.current) setMyLocationError(null);
                }, 4000);
            }
        } else if (initialPos) {
            flyTo(initialPos.lat, initialPos.lng, 15);
        }
    }, [gpsStatus, initialPos, flyTo, reacquireGPS]);

    // ── Search ─────────────────────────────────────────────────────────────────
    const handleSearchChange = useCallback((text: string) => {
        setSearchText(text);
        setSearchSelectError(false);
        if (searchDebounce.current) clearTimeout(searchDebounce.current);

        if (text.trim().length < 2) {
            setShowResults(false);
            setPredictions([]);
            return;
        }

        searchDebounce.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const results = await fetchPlacePredictions(text, MAPS_KEY);
                if (!isMountedRef.current) return;
                setPredictions(results);
                setShowResults(true);
            } catch {
                if (!isMountedRef.current) return;
                setPredictions([]);
                setShowResults(false);
            } finally {
                if (isMountedRef.current) setSearchLoading(false);
            }
        }, SEARCH_DEBOUNCE_MS);
    }, []);

    const handleSearchSelect = useCallback(async (p: PlacePrediction) => {
        setShowResults(false);
        setSearchText(p.primaryName);
        setSearchSelectError(false);
        Keyboard.dismiss();

        try {
            const { lat, lng } = await fetchPlaceLatLng(p.placeId, MAPS_KEY);
            if (!isMountedRef.current) return;
            flyTo(lat, lng, 14);
            setPinCoords({ lat, lng });
            geocodeCoords(lat, lng);
        } catch {
            if (isMountedRef.current) setSearchSelectError(true);
        }
    }, [flyTo, geocodeCoords]);

    // ── Confirm ────────────────────────────────────────────────────────────────
    const handleConfirm = useCallback(async () => {
        if (!pinCoords) return;

        if (gpsStatus === "acquired" && gpsAccuracy > GPS_ACCURACY_THRESHOLD_M) {
            Alert.alert(
                "Low GPS Accuracy",
                `Your GPS accuracy is ±${Math.round(gpsAccuracy)}m. For best results, move to an open area and try again.`,
                [
                    { text: "Try Again", style: "cancel", onPress: reacquireGPS },
                    { text: "Confirm Anyway", onPress: doConfirm },
                ]
            );
            return;
        }
        doConfirm();
    }, [pinCoords, gpsStatus, gpsAccuracy, reacquireGPS]);

    const doConfirm = useCallback(async () => {
        if (!pinCoords) return;
        setSaving(true);

        const newLocInfo = {
            lat: pinCoords.lat,
            lng: pinCoords.lng,
            address: address || "Unknown location",
            accuracy: gpsAccuracy,
            setAt: new Date().toISOString(),
            method: "gps" as const,
        };

        try {
            if (isProfileMode) {
                if (purpose === "event-location") {
                    setEventLocationPick({ lat: pinCoords.lat, lng: pinCoords.lng });
                    router.back();
                    return;
                }

                if (purpose === "beneficiary") {
                    setBeneficiaryLocationPick({
                        lat: pinCoords.lat,
                        lng: pinCoords.lng,
                        address: address || "Unknown location",
                    });
                    router.back();
                    return;
                }

                if (purpose === "profile") {
                    let parsed;
                    try { parsed = await parseGoogleAddress(pinCoords.lat, pinCoords.lng); } catch { parsed = null; }
                    const override: Record<string, string> = {};
                    if (parsed?.state)      override.state      = parsed.state;
                    if (parsed?.district)   override.district   = parsed.district;
                    if (parsed?.tehsil)     override.tehsil     = parsed.tehsil;
                    if (parsed?.block)      override.block      = parsed.block;
                    if (parsed?.village)    override.village    = parsed.village;
                    if (parsed?.pinCode)    override.pinCode    = parsed.pinCode;
                    if (parsed?.postOffice) override.postOffice = parsed.postOffice;
                    setProfileAddressOverride(override);
                    router.back();
                    return;
                }

                // Generic profile location update
                await userApi.updateProfile({ location: newLocInfo });
                if (router.canGoBack()) router.back();
                else router.push("/(tab)/profile" as any);
                return;
            }

            // Onboarding flow
            setLocationData(newLocInfo);

            let parsed;
            try {
                parsed = await parseGoogleAddress(pinCoords.lat, pinCoords.lng, {
                    state:      personalDetails.state,
                    district:   personalDetails.district,
                    tehsil:     personalDetails.tehsil,
                    block:      personalDetails.block,
                    village:    personalDetails.village,
                    pinCode:    personalDetails.pinCode,
                    postOffice: personalDetails.postOffice,
                });
            } catch { parsed = null; }
            const updates: Record<string, string> = {};
            if (parsed?.state)      updates.state      = parsed.state;
            if (parsed?.district)   updates.district   = parsed.district;
            if (parsed?.tehsil)     updates.tehsil     = parsed.tehsil;
            if (parsed?.block)      updates.block      = parsed.block;
            if (parsed?.village)    updates.village    = parsed.village;
            if (parsed?.pinCode)    updates.pinCode    = parsed.pinCode;
            if (parsed?.postOffice) updates.postOffice = parsed.postOffice;
            if (Object.keys(updates).length > 0) updatePersonalDetails(updates);

            router.push("/(auth)/land-details" as any);
        } catch (error) {
            console.error("doConfirm failed:", error);
            Alert.alert("Error", "Failed to save location. Please try again.");
        } finally {
            if (isMountedRef.current) setSaving(false);
        }
    }, [
        pinCoords, address, gpsAccuracy, isProfileMode, purpose,
        personalDetails, setLocationData, setProfileAddressOverride,
        setEventLocationPick, setBeneficiaryLocationPick, updatePersonalDetails, router,
    ]);

    // ── Skip ───────────────────────────────────────────────────────────────────
    const handleSkip = useCallback(() => {
        if (isProfileMode) {
            if (router.canGoBack()) router.back();
            else router.push("/(tab)/profile" as any);
            return;
        }
        setLocationData({
            lat: 0, lng: 0, address: "", accuracy: 0,
            setAt: new Date().toISOString(), method: "skipped" as const,
        });
        router.push("/(auth)/land-details" as any);
    }, [isProfileMode, setLocationData, router]);

    // ── Permission denied screen ───────────────────────────────────────────────
    if (gpsStatus === "denied") {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.topProgress}>
                    <View style={[styles.topProgressFill, { width: "50%" }]} />
                </View>
                <View style={styles.deniedContainer}>
                    <View style={styles.deniedIconBg}>
                        <Ionicons name="location-outline" size={40} color="#F59E0B" />
                    </View>
                    <AppText variant="h3" style={styles.deniedTitle}>Location Access Needed</AppText>
                    <AppText variant="bodySm" style={styles.deniedBody}>
                        To place your home on the map, Tanak Prabha needs location permission.
                        Your location is only used to build the farming heatmap.
                    </AppText>
                    <Pressable style={styles.settingsBtn} onPress={() => Linking.openSettings()}>
                        <Ionicons name="settings-outline" size={18} color="#fff" />
                        <AppText variant="bodyMd" style={styles.settingsBtnText}>Enable in Settings</AppText>
                    </Pressable>
                    {isProfileMode && (
                        <Pressable style={styles.skipLinkBtn} onPress={handleSkip}>
                            <AppText variant="bodySm" style={styles.skipLinkText}>Skip for now</AppText>
                        </Pressable>
                    )}
                </View>
            </View>
        );
    }

    // ── Loading screen ─────────────────────────────────────────────────────────
    if (initialPos === null) {
        return (
            <View style={[styles.root, styles.centred]}>
                <StatusBar barStyle="dark-content" />
                <Ionicons name="locate-outline" size={44} color="#386641" />
                <AppText variant="bodyMd" style={styles.loadingText}>Finding your location…</AppText>
            </View>
        );
    }

    // ── Full-screen map ────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                    latitude: initialPos.lat,
                    longitude: initialPos.lng,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                onRegionChangeComplete={({ latitude, longitude }) => {
                    setPinCoords({ lat: latitude, lng: longitude });
                    geocodeCoords(latitude, longitude);
                    setAccuracyCircleVisible(false);
                }}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
            >
                {accuracyCircleVisible && pinCoords && (
                    <Circle
                        center={{ latitude: pinCoords.lat, longitude: pinCoords.lng }}
                        radius={gpsAccuracy}
                        strokeColor="#386641"
                        fillColor="rgba(56,102,65,0.12)"
                        strokeWidth={1.5}
                    />
                )}
            </MapView>

            {/* Centre crosshair pin */}
            <View style={styles.centrePin} pointerEvents="none">
                <View style={styles.pinHead} />
                <View style={styles.pinStem} />
                <View style={styles.pinDot} />
            </View>

            {/* ── Top overlay: progress bar + search ──────────────────────── */}
            <View style={styles.topOverlay} pointerEvents="box-none">
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: "50%" }]} />
                </View>

                <View style={styles.searchCard} pointerEvents="auto">
                    <Ionicons name="search-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search village, city, district…"
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={handleSearchChange}
                        returnKeyType="search"
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    {searchLoading && (
                        <ActivityIndicator size="small" color="#386641" style={{ marginLeft: 4 }} />
                    )}
                    {searchText.length > 0 && !searchLoading && (
                        <Pressable
                            onPress={() => {
                                setSearchText("");
                                setShowResults(false);
                                setPredictions([]);
                                setSearchSelectError(false);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </Pressable>
                    )}
                </View>

                {searchSelectError && (
                    <View style={styles.searchErrorBanner} pointerEvents="none">
                        <Ionicons name="warning-outline" size={13} color="#92400E" />
                        <AppText variant="bodySm" style={styles.searchErrorText}>
                            Couldn't load location — drag the map to place your pin manually
                        </AppText>
                    </View>
                )}

                {(showResults || searchLoading) && searchText.length >= 2 && (
                    <View style={styles.resultsCard} pointerEvents="auto">
                        {searchLoading && predictions.length === 0 ? (
                            <View style={[styles.resultRow, { justifyContent: "center" }]}>
                                <ActivityIndicator size="small" color="#386641" />
                                <AppText variant="bodySm" style={[styles.noResultsText, { marginLeft: 8 }]}>
                                    Searching…
                                </AppText>
                            </View>
                        ) : predictions.length === 0 ? (
                            <View style={styles.resultRow}>
                                <AppText variant="bodySm" style={styles.noResultsText}>No results found</AppText>
                            </View>
                        ) : (
                            predictions.map((p, idx) => (
                                <Pressable
                                    key={p.placeId}
                                    style={[
                                        styles.resultRow,
                                        idx < predictions.length - 1 && styles.resultRowBorder,
                                    ]}
                                    onPress={() => handleSearchSelect(p)}
                                >
                                    <Ionicons name="location-outline" size={16} color="#386641" style={{ marginRight: 10 }} />
                                    <View style={{ flex: 1 }}>
                                        <AppText variant="bodySm" style={styles.resultPrimaryText} numberOfLines={1}>
                                            {p.primaryName}
                                        </AppText>
                                        {p.subtitle ? (
                                            <AppText variant="bodySm" style={styles.resultSubtitleText} numberOfLines={1}>
                                                {p.subtitle}
                                            </AppText>
                                        ) : null}
                                    </View>
                                </Pressable>
                            ))
                        )}
                    </View>
                )}
            </View>

            {/* GPS no-fix banner */}
            {gpsStatus === "no-fix" && (
                <View style={styles.fallbackBanner} pointerEvents="none">
                    <Ionicons name="warning-outline" size={14} color="#92400E" />
                    <AppText variant="bodySm" style={styles.fallbackText}>
                        GPS unavailable — search or drag the map to your location
                    </AppText>
                </View>
            )}

            {/* My-location button */}
            <Pressable
                style={styles.myLocationBtn}
                onPress={handleMyLocation}
                disabled={myLocationLoading}
                accessibilityLabel="My location"
                accessibilityRole="button"
            >
                {myLocationLoading
                    ? <ActivityIndicator size="small" color="#386641" />
                    : <Ionicons name="locate" size={22} color="#386641" />
                }
            </Pressable>
            {myLocationError && (
                <View style={styles.myLocationErrorBanner} pointerEvents="none">
                    <Ionicons name="warning-outline" size={13} color="#92400E" />
                    <AppText variant="bodySm" style={styles.myLocationErrorText}>
                        {myLocationError}
                    </AppText>
                </View>
            )}

            {/* ── Bottom sheet ──────────────────────────────────────────────── */}
            <View style={styles.bottomSheet}>
                <View style={styles.sheetHandle} />

                <AppText variant="bodySm" style={styles.sheetLabel}>YOUR HOME LOCATION</AppText>

                {geocodeLoading ? (
                    <AppText variant="bodySm" style={styles.sheetHint}>Resolving address…</AppText>
                ) : geocodeError ? (
                    <View style={styles.geocodeErrorRow}>
                        <Ionicons name="wifi-outline" size={14} color="#EF4444" />
                        <AppText variant="bodySm" style={styles.geocodeErrorText}>
                            Address unavailable — you can still confirm your pin
                        </AppText>
                    </View>
                ) : (
                    <AppText variant="bodyMd" style={styles.sheetAddress} numberOfLines={2}>
                        {address || "Drag the map to place your pin"}
                    </AppText>
                )}

                {accuracyCircleVisible && (
                    <AppText variant="bodySm" style={styles.accuracyLabel}>
                        {formatAccuracyLabel(gpsAccuracy)}
                    </AppText>
                )}

                <View style={styles.nudgeRow}>
                    <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
                    <AppText variant="bodySm" style={styles.nudgeText}>
                        Sharing your location helps us show accurate farming data for your region
                    </AppText>
                </View>

                <Pressable
                    style={[styles.confirmBtn, (!pinCoords || saving) && styles.confirmBtnDisabled]}
                    onPress={handleConfirm}
                    disabled={!pinCoords || saving}
                    accessibilityLabel="Confirm location"
                    accessibilityRole="button"
                >
                    <AppText variant="bodyMd" style={styles.confirmBtnText}>
                        {saving ? "Saving…" : "Confirm Location"}
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFC" },
    centred: { justifyContent: "center", alignItems: "center", gap: 16 },
    loadingText: { color: "#6B7280" },

    centrePin: {
        position: "absolute", top: "50%", left: "50%",
        transform: [{ translateX: -13 }, { translateY: -42 }],
        alignItems: "center", zIndex: 10,
    },
    pinHead: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#386641", borderWidth: 3, borderColor: "#fff" },
    pinStem: { width: 3, height: 16, backgroundColor: "#386641", marginTop: -2 },
    pinDot: { width: 10, height: 5, borderRadius: 5, backgroundColor: "rgba(0,0,0,0.18)", marginTop: 2 },

    topOverlay: {
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 56,
        paddingHorizontal: 16,
    },
    progressTrack: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.5)", marginBottom: 12 },
    progressFill: { height: "100%", borderRadius: 2, backgroundColor: "#FBBF24" },

    searchCard: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === "ios" ? 14 : 10,
        shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12,
        elevation: 6, marginBottom: 6,
    },
    searchInput: { flex: 1, fontSize: 15, color: "#111827", padding: 0 },

    searchErrorBanner: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "#FEF3C7", borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4,
    },
    searchErrorText: { flex: 1, color: "#92400E", fontSize: 12 },

    resultsCard: {
        backgroundColor: "#fff", borderRadius: 16, overflow: "hidden",
        shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    },
    resultRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
    resultRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    resultPrimaryText: { color: "#374151", fontWeight: "600", lineHeight: 20 },
    resultSubtitleText: { color: "#6B7280", fontSize: 12, lineHeight: 18, marginTop: 1 },
    noResultsText: { color: "#9CA3AF", fontStyle: "italic" },

    fallbackBanner: {
        position: "absolute",
        top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 80 : 130,
        alignSelf: "center",
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "#FEF3C7", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        zIndex: 10, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
    },
    fallbackText: { color: "#92400E", fontSize: 12 },

    myLocationBtn: {
        position: "absolute", bottom: 230, right: 16,
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
        shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, elevation: 4, zIndex: 10,
    },
    myLocationErrorBanner: {
        position: "absolute", bottom: 286, right: 16,
        flexDirection: "row", alignItems: "center", gap: 5,
        backgroundColor: "#FEF3C7", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
        maxWidth: SCREEN_WIDTH - 32,
        shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, zIndex: 10,
    },
    myLocationErrorText: { color: "#92400E", fontSize: 12, flexShrink: 1 },

    bottomSheet: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingHorizontal: 24, paddingTop: 12,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, elevation: 12, zIndex: 15,
    },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 14 },
    sheetLabel: { fontSize: 10, letterSpacing: 1.2, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 6 },
    sheetHint: { color: "#9CA3AF", fontStyle: "italic", marginBottom: 12 },
    sheetAddress: { color: "#111827", fontWeight: "600", lineHeight: 22, marginBottom: 12 },
    geocodeErrorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
    geocodeErrorText: { color: "#EF4444", flex: 1 },
    accuracyLabel: { color: "#386641", fontSize: 12, marginBottom: 8 },

    nudgeRow: {
        flexDirection: "row", alignItems: "flex-start", gap: 6,
        backgroundColor: "#F0FDF4", borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
    },
    nudgeText: { color: "#374151", flex: 1, lineHeight: 18 },

    confirmBtn: { backgroundColor: "#386641", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
    confirmBtnDisabled: { backgroundColor: "#D1D5DB" },
    confirmBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    skipBtn: { alignItems: "center", paddingVertical: 4 },
    skipText: { color: "#9CA3AF" },

    topProgress: {
        height: 4, backgroundColor: "rgba(0,0,0,0.08)",
        marginTop: Platform.OS === "ios" ? 56 : (StatusBar.currentHeight ?? 0) + 8,
        marginHorizontal: 20, borderRadius: 2,
    },
    topProgressFill: { height: "100%", borderRadius: 2, backgroundColor: "#FBBF24" },
    deniedContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
    deniedIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center", marginBottom: 8 },
    deniedTitle: { fontWeight: "700", color: "#1F2937", textAlign: "center" },
    deniedBody: { color: "#6B7280", textAlign: "center", lineHeight: 20 },
    settingsBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#386641", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
    settingsBtnText: { color: "#fff", fontWeight: "700" },
    skipLinkBtn: { marginTop: 12 },
    skipLinkText: { color: "#9CA3AF", textDecorationLine: "underline" },
});