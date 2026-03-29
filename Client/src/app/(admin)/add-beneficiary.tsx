// src/app/(admin)/add-beneficiary.tsx
import AppText from "@/components/atoms/AppText";
import KeyboardAwareScrollView from "@/components/atoms/KeyboardAwareScrollView";
import Select from "@/components/atoms/Select";
import { useAuth } from "@/contexts/AuthContext";
import { indianStates, getDistrictOptions } from "@/data/indianLocations";
import { genderOptions, cropTypes } from "@/data/content/onboardingOptions";
import { ApiUserProfile } from "@/services/apiService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────
const TOTAL_STEPS = 4;
const STEP_TITLES = [
    "Personal Details",
    "Location",
    "Land Details",
    "Livestock Details",
];
const STEP_SUBTITLES = [
    "Basic information about the farmer",
    "Where does the farmer live?",
    "Land holdings and crops",
    "Livestock owned by the farmer",
];

// ─── Reusable field sub-components ───────────────────────────
const FieldWrapper = ({ children }: { children: React.ReactNode }) => (
    <View style={{ marginBottom: 16 }}>{children}</View>
);

const FieldLabel = ({ text }: { text: string }) => (
    <AppText style={f.label}>{text}</AppText>
);

const FieldError = ({ message }: { message?: string }) =>
    message ? <AppText style={f.error}>{message}</AppText> : null;

const f = StyleSheet.create({
    label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
    error: { fontSize: 12, color: "#EF4444", marginTop: 4 },
});

// ─── Form state types ─────────────────────────────────────────
interface PersonalForm {
    name: string;
    mobile: string;
    age: string;
    gender: string;
    fathersName: string;
    aadhaar: string;
}

interface LocationForm {
    state: string;
    district: string;
    tehsil: string;
    village: string;
}

interface LandForm {
    totalLandArea: string;
    rabiCrop: string;
    kharifCrop: string;
}

interface LivestockForm {
    cow: string;
    buffalo: string;
    goat: string;
    sheep: string;
    pig: string;
    poultry: string;
    others: string;
}

// ─── Step Indicator ───────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
        <View style={si.row}>
            {Array.from({ length: total }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        si.dot,
                        i < current ? si.dotDone : i === current ? si.dotActive : si.dotInactive,
                    ]}
                />
            ))}
        </View>
    );
}

const si = StyleSheet.create({
    row: { flexDirection: "row", gap: 6, alignItems: "center" },
    dot: { height: 4, borderRadius: 2 },
    dotDone: { width: 20, backgroundColor: "rgba(255,255,255,0.6)" },
    dotActive: { width: 28, backgroundColor: "#FFFFFF" },
    dotInactive: { width: 20, backgroundColor: "rgba(255,255,255,0.3)" },
});

// ─── Input style helper ───────────────────────────────────────
function inputStyle(hasError?: boolean) {
    return {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: hasError ? "#EF4444" : "#E5E7EB",
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: "#1F2937",
    };
}

// ─── Step 1: Personal Details ─────────────────────────────────
function Step1({
    form,
    setForm,
    errors,
}: {
    form: PersonalForm;
    setForm: (f: PersonalForm) => void;
    errors: Partial<PersonalForm>;
}) {
    const genderOpts = genderOptions.map((g) => ({ value: g.value, label: g.label }));

    return (
        <>
            <FieldWrapper>
                <FieldLabel text="Full Name *" />
                <TextInput
                    style={inputStyle(!!errors.name)}
                    value={form.name}
                    onChangeText={(v) => setForm({ ...form, name: v })}
                    placeholder="Enter full name"
                    placeholderTextColor="#9CA3AF"
                />
                <FieldError message={errors.name} />
            </FieldWrapper>

            <FieldWrapper>
                <FieldLabel text="Mobile Number *" />
                <TextInput
                    style={inputStyle(!!errors.mobile)}
                    value={form.mobile}
                    onChangeText={(v) => setForm({ ...form, mobile: v.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="10-digit mobile number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    maxLength={10}
                />
                <FieldError message={errors.mobile} />
            </FieldWrapper>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                    <FieldLabel text="Age *" />
                    <TextInput
                        style={inputStyle(!!errors.age)}
                        value={form.age}
                        onChangeText={(v) => setForm({ ...form, age: v.replace(/\D/g, "").slice(0, 3) })}
                        placeholder="Age"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        maxLength={3}
                    />
                    <FieldError message={errors.age} />
                </View>
                <View style={{ flex: 1 }}>
                    <FieldLabel text="Gender *" />
                    <Select
                        value={form.gender}
                        onChange={(v) => setForm({ ...form, gender: v })}
                        options={genderOpts}
                        placeholder="Select"
                    />
                    <FieldError message={errors.gender} />
                </View>
            </View>

            <FieldWrapper>
                <FieldLabel text="Father's Name *" />
                <TextInput
                    style={inputStyle(!!errors.fathersName)}
                    value={form.fathersName}
                    onChangeText={(v) => setForm({ ...form, fathersName: v })}
                    placeholder="Enter father's name"
                    placeholderTextColor="#9CA3AF"
                />
                <FieldError message={errors.fathersName} />
            </FieldWrapper>

            <FieldWrapper>
                <FieldLabel text="Aadhaar Number" />
                <TextInput
                    style={inputStyle(!!errors.aadhaar)}
                    value={form.aadhaar}
                    onChangeText={(v) => setForm({ ...form, aadhaar: v.replace(/\D/g, "").slice(0, 12) })}
                    placeholder="12-digit Aadhaar (optional)"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={12}
                />
                <FieldError message={errors.aadhaar} />
            </FieldWrapper>
        </>
    );
}

// ─── Step 2: Location ─────────────────────────────────────────
function Step2({
    form,
    setForm,
    errors,
}: {
    form: LocationForm;
    setForm: (f: LocationForm) => void;
    errors: Partial<LocationForm>;
}) {
    const stateOpts = indianStates.map((s) => ({ value: s.value, label: s.label }));
    const districtOpts = form.state ? getDistrictOptions(form.state) : [];

    return (
        <>
            <FieldWrapper>
                <FieldLabel text="State *" />
                <Select
                    value={form.state}
                    onChange={(v) => setForm({ ...form, state: v, district: "", tehsil: "", village: "" })}
                    options={stateOpts}
                    placeholder="Select state"
                />
                <FieldError message={errors.state} />
            </FieldWrapper>

            <FieldWrapper>
                <FieldLabel text="District *" />
                <Select
                    value={form.district}
                    onChange={(v) => setForm({ ...form, district: v, tehsil: "", village: "" })}
                    options={districtOpts}
                    placeholder={form.state ? "Select district" : "Select state first"}
                    disabled={!form.state}
                />
                <FieldError message={errors.district} />
            </FieldWrapper>

            <FieldWrapper>
                <FieldLabel text="Tehsil" />
                <TextInput
                    style={inputStyle()}
                    value={form.tehsil}
                    onChangeText={(v) => setForm({ ...form, tehsil: v })}
                    placeholder="Enter tehsil (optional)"
                    placeholderTextColor="#9CA3AF"
                />
            </FieldWrapper>

            <FieldWrapper>
                <FieldLabel text="Village" />
                <TextInput
                    style={inputStyle()}
                    value={form.village}
                    onChangeText={(v) => setForm({ ...form, village: v })}
                    placeholder="Enter village (optional)"
                    placeholderTextColor="#9CA3AF"
                />
            </FieldWrapper>
        </>
    );
}

// ─── Step 3: Land Details ─────────────────────────────────────
function Step3({
    form,
    setForm,
}: {
    form: LandForm;
    setForm: (f: LandForm) => void;
}) {
    const cropOpts = cropTypes.map((c) => ({ value: c.value, label: c.label }));

    return (
        <>
            <FieldWrapper>
                <FieldLabel text="Total Land Area (Bigha)" />
                <TextInput
                    style={inputStyle()}
                    value={form.totalLandArea}
                    onChangeText={(v) => setForm({ ...form, totalLandArea: v })}
                    placeholder="e.g. 2.5"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                />
            </FieldWrapper>

            <FieldWrapper>
                <FieldLabel text="Rabi Crop" />
                <Select
                    value={form.rabiCrop}
                    onChange={(v) => setForm({ ...form, rabiCrop: v })}
                    options={cropOpts}
                    placeholder="Select rabi crop (optional)"
                />
            </FieldWrapper>

            <FieldWrapper>
                <FieldLabel text="Kharif Crop" />
                <Select
                    value={form.kharifCrop}
                    onChange={(v) => setForm({ ...form, kharifCrop: v })}
                    options={cropOpts}
                    placeholder="Select kharif crop (optional)"
                />
            </FieldWrapper>
        </>
    );
}

// ─── Step 4: Livestock Details ────────────────────────────────
function Step4({
    form,
    setForm,
}: {
    form: LivestockForm;
    setForm: (f: LivestockForm) => void;
}) {
    const animals: { key: keyof LivestockForm; label: string }[] = [
        { key: "cow", label: "Cow" },
        { key: "buffalo", label: "Buffalo" },
        { key: "goat", label: "Goat" },
        { key: "sheep", label: "Sheep" },
        { key: "pig", label: "Pig" },
        { key: "poultry", label: "Poultry / Hen" },
        { key: "others", label: "Others" },
    ];

    return (
        <>
            <AppText style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
                Enter the count for each animal type (leave blank or 0 if none).
            </AppText>
            {animals.map(({ key, label }) => (
                <FieldWrapper key={key}>
                    <FieldLabel text={label} />
                    <TextInput
                        style={inputStyle()}
                        value={form[key]}
                        onChangeText={(v) => setForm({ ...form, [key]: v.replace(/\D/g, "") })}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                    />
                </FieldWrapper>
            ))}
        </>
    );
}

// ─── Pre-registration Search ──────────────────────────────────
function SearchSection({
    onRegisterNew,
}: {
    onRegisterNew: () => void;
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ApiUserProfile[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState<ApiUserProfile | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setResults([]);
            setSelectedFarmer(null);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const { tokenManager } = await import("@/services/apiService");
                const token = await tokenManager.getToken();
                const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
                const res = await fetch(
                    `${API_BASE_URL}/users?search=${encodeURIComponent(trimmed)}&limit=10`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                );
                const data = await res.json();
                setResults(data?.data?.users ?? data?.users ?? []);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    return (
        <View style={ss.container}>
            <AppText style={ss.heading}>Search Existing Farmers</AppText>
            <AppText style={ss.subheading}>Check if the farmer is already registered before adding</AppText>

            <View style={ss.inputRow}>
                <Ionicons name="search" size={18} color="#6B7280" style={ss.searchIcon} />
                <TextInput
                    style={ss.searchInput}
                    value={query}
                    onChangeText={(v) => {
                        setQuery(v);
                        setSelectedFarmer(null);
                    }}
                    placeholder="Search by name or mobile number"
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
                {searching && <ActivityIndicator size="small" color="#386641" style={{ marginLeft: 8 }} />}
            </View>

            {/* Selected farmer — already registered */}
            {selectedFarmer && (
                <View style={ss.registeredCard}>
                    <View style={ss.registeredIconWrap}>
                        <Ionicons name="checkmark-circle" size={22} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <AppText style={ss.registeredTitle}>Farmer Already Registered</AppText>
                        <AppText style={ss.registeredName}>{selectedFarmer.name}</AppText>
                        <AppText style={ss.registeredMobile}>{selectedFarmer.mobile_number}</AppText>
                        {selectedFarmer.district && (
                            <AppText style={ss.registeredMeta}>{selectedFarmer.district}{selectedFarmer.state ? `, ${selectedFarmer.state}` : ""}</AppText>
                        )}
                    </View>
                    <Pressable onPress={() => { setSelectedFarmer(null); setQuery(""); }} hitSlop={8}>
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </Pressable>
                </View>
            )}

            {/* Search results list */}
            {!selectedFarmer && results.length > 0 && (
                <View style={ss.resultsList}>
                    {results.map((farmer) => (
                        <Pressable
                            key={farmer.id}
                            style={ss.resultItem}
                            onPress={() => {
                                setSelectedFarmer(farmer);
                                setResults([]);
                            }}
                        >
                            <View style={ss.resultAvatar}>
                                <AppText style={ss.resultAvatarText}>
                                    {farmer.name?.charAt(0)?.toUpperCase() ?? "?"}
                                </AppText>
                            </View>
                            <View style={{ flex: 1 }}>
                                <AppText style={ss.resultName}>{farmer.name}</AppText>
                                <AppText style={ss.resultMobile}>{farmer.mobile_number}</AppText>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                        </Pressable>
                    ))}
                </View>
            )}

            {/* No results */}
            {!selectedFarmer && query.trim().length >= 2 && !searching && results.length === 0 && (
                <View style={ss.noResults}>
                    <Ionicons name="person-add-outline" size={20} color="#6B7280" />
                    <AppText style={ss.noResultsText}>No farmer found with this name or mobile</AppText>
                </View>
            )}

            <View style={ss.dividerRow}>
                <View style={ss.dividerLine} />
                <AppText style={ss.dividerText}>OR</AppText>
                <View style={ss.dividerLine} />
            </View>

            <Pressable style={ss.registerNewBtn} onPress={onRegisterNew}>
                <Ionicons name="person-add" size={18} color="#FFFFFF" />
                <AppText style={ss.registerNewText}>Register New Farmer</AppText>
            </Pressable>
        </View>
    );
}

const ss = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        margin: 16,
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    heading: { fontSize: 15, fontWeight: "700", color: "#1F2937", marginBottom: 2 },
    subheading: { fontSize: 12, color: "#6B7280", marginBottom: 12 },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 2,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#1F2937",
        paddingVertical: 12,
    },
    resultsList: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        overflow: "hidden",
    },
    resultItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
        backgroundColor: "#FFFFFF",
    },
    resultAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#D1FAE5",
        justifyContent: "center",
        alignItems: "center",
    },
    resultAvatarText: { fontSize: 15, fontWeight: "700", color: "#065F46" },
    resultName: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
    resultMobile: { fontSize: 12, color: "#6B7280", marginTop: 1 },
    registeredCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        marginTop: 10,
        backgroundColor: "#ECFDF5",
        borderWidth: 1,
        borderColor: "#6EE7B7",
        borderRadius: 12,
        padding: 12,
    },
    registeredIconWrap: { marginTop: 2 },
    registeredTitle: { fontSize: 12, fontWeight: "700", color: "#059669", marginBottom: 2 },
    registeredName: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
    registeredMobile: { fontSize: 13, color: "#374151", marginTop: 1 },
    registeredMeta: { fontSize: 12, color: "#6B7280", marginTop: 1 },
    noResults: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 10,
        paddingVertical: 10,
    },
    noResultsText: { fontSize: 13, color: "#6B7280" },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginVertical: 14,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
    dividerText: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },
    registerNewBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#386641",
        borderRadius: 12,
        paddingVertical: 13,
    },
    registerNewText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});

// ─── Main Screen ──────────────────────────────────────────────
export default function AddBeneficiary() {
    const router = useRouter();
    const { user } = useAuth();
    const adminId = user?.id;

    const [showForm, setShowForm] = useState(false);
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [conflictError, setConflictError] = useState(false);

    const [personal, setPersonal] = useState<PersonalForm>({
        name: "", mobile: "", age: "", gender: "", fathersName: "", aadhaar: "",
    });
    const [personalErrors, setPersonalErrors] = useState<Partial<PersonalForm>>({});

    const [location, setLocation] = useState<LocationForm>({
        state: "", district: "", tehsil: "", village: "",
    });
    const [locationErrors, setLocationErrors] = useState<Partial<LocationForm>>({});

    const [land, setLand] = useState<LandForm>({
        totalLandArea: "", rabiCrop: "", kharifCrop: "",
    });

    const [livestock, setLivestock] = useState<LivestockForm>({
        cow: "", buffalo: "", goat: "", sheep: "", pig: "", poultry: "", others: "",
    });

    // ── Validation ────────────────────────────────────────────
    function validateStep1(): boolean {
        const errs: Partial<PersonalForm> = {};
        if (!personal.name.trim()) errs.name = "Name is required";
        if (!/^\d{10}$/.test(personal.mobile)) errs.mobile = "Enter a valid 10-digit mobile number";
        const ageNum = parseInt(personal.age);
        if (!personal.age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
            errs.age = "Enter a valid age (1–120)";
        }
        if (!personal.gender) errs.gender = "Gender is required";
        if (!personal.fathersName.trim()) errs.fathersName = "Father's name is required";
        if (personal.aadhaar && !/^\d{12}$/.test(personal.aadhaar)) {
            errs.aadhaar = "Aadhaar must be 12 digits";
        }
        setPersonalErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function validateStep2(): boolean {
        const errs: Partial<LocationForm> = {};
        if (!location.state) errs.state = "State is required";
        if (!location.district) errs.district = "District is required";
        setLocationErrors(errs);
        return Object.keys(errs).length === 0;
    }

    // ── Navigation ────────────────────────────────────────────
    function handleNext() {
        if (step === 0 && !validateStep1()) return;
        if (step === 1 && !validateStep2()) return;
        setStep((s) => s + 1);
    }

    function handleBack() {
        if (step === 0) {
            setShowForm(false);
        } else {
            setStep((s) => s - 1);
        }
    }

    // ── Submit ────────────────────────────────────────────────
    async function handleSubmit() {
        if (!validateStep2()) { setStep(1); return; }

        setSubmitting(true);
        setConflictError(false);

        try {
            const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
            const { tokenManager } = await import("@/services/apiService");
            const token = await tokenManager.getToken();

            const payload: Record<string, any> = {
                name: personal.name.trim(),
                mobile_number: personal.mobile,
                age: parseInt(personal.age),
                gender: personal.gender,
                fathers_name: personal.fathersName.trim(),
                state: location.state,
                district: location.district,
                registered_by: adminId,
            };

            if (personal.aadhaar) payload.aadhaar_number = personal.aadhaar;
            if (location.tehsil) payload.tehsil = location.tehsil;
            if (location.village) payload.village = location.village;

            const landArea = parseFloat(land.totalLandArea);
            if (!isNaN(landArea) && landArea > 0) {
                payload.land_details = {
                    total_land_area: landArea,
                    rabi_crop: land.rabiCrop || undefined,
                    kharif_crop: land.kharifCrop || undefined,
                };
            }

            const hasLivestock = Object.values(livestock).some((v) => parseInt(v) > 0);
            if (hasLivestock) {
                payload.livestock_details = {
                    cow: parseInt(livestock.cow) || 0,
                    buffalo: parseInt(livestock.buffalo) || 0,
                    goat: parseInt(livestock.goat) || 0,
                    sheep: parseInt(livestock.sheep) || 0,
                    pig: parseInt(livestock.pig) || 0,
                    poultry: parseInt(livestock.poultry) || 0,
                    others: parseInt(livestock.others) || 0,
                };
            }

            const response = await fetch(`${API_BASE_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 409) {
                setConflictError(true);
                return;
            }

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            Alert.alert(
                "Farmer Registered",
                `${personal.name} has been successfully registered.`,
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            Alert.alert("Registration Failed", message);
        } finally {
            setSubmitting(false);
        }
    }

    // ── Render ────────────────────────────────────────────────
    return (
        <View style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <View style={s.headerTop}>
                    <Pressable
                        onPress={() => (showForm ? handleBack() : router.back())}
                        style={s.backBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        {showForm ? (
                            <>
                                <AppText style={s.stepLabel}>Step {step + 1} of {TOTAL_STEPS}</AppText>
                                <AppText style={s.stepTitle}>{STEP_TITLES[step]}</AppText>
                                <AppText style={s.stepSubtitle}>{STEP_SUBTITLES[step]}</AppText>
                            </>
                        ) : (
                            <>
                                <AppText style={s.stepTitle}>Add Beneficiary</AppText>
                                <AppText style={s.stepSubtitle}>Search or register a new farmer</AppText>
                            </>
                        )}
                    </View>
                </View>
                {showForm && (
                    <>
                        <View style={s.progressTrack}>
                            <View style={[s.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
                        </View>
                        <StepIndicator current={step} total={TOTAL_STEPS} />
                    </>
                )}
            </View>

            {/* Search section (pre-form) */}
            {!showForm && (
                <KeyboardAwareScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <SearchSection onRegisterNew={() => setShowForm(true)} />
                </KeyboardAwareScrollView>
            )}

            {/* Form content */}
            {showForm && (
                <>
                    {/* 409 conflict banner */}
                    {conflictError && (
                        <View style={s.conflictBanner}>
                            <Ionicons name="warning" size={18} color="#92400E" />
                            <AppText style={s.conflictText}>
                                Farmer already registered with this mobile number.
                            </AppText>
                        </View>
                    )}

                    <KeyboardAwareScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={s.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {step === 0 && (
                            <Step1 form={personal} setForm={setPersonal} errors={personalErrors} />
                        )}
                        {step === 1 && (
                            <Step2 form={location} setForm={setLocation} errors={locationErrors} />
                        )}
                        {step === 2 && (
                            <Step3 form={land} setForm={setLand} />
                        )}
                        {step === 3 && (
                            <Step4 form={livestock} setForm={setLivestock} />
                        )}
                    </KeyboardAwareScrollView>

                    {/* Bottom buttons */}
                    <View style={s.footer}>
                        {step > 0 && (
                            <Pressable style={s.backFooterBtn} onPress={handleBack}>
                                <Ionicons name="chevron-back" size={18} color="#6B7280" />
                                <AppText style={s.backFooterText}>Back</AppText>
                            </Pressable>
                        )}

                        {step < TOTAL_STEPS - 1 ? (
                            <Pressable style={[s.nextBtn, step === 0 ? { flex: 1 } : {}]} onPress={handleNext}>
                                <AppText style={s.nextBtnText}>Next</AppText>
                                <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                            </Pressable>
                        ) : (
                            <Pressable
                                style={[s.submitBtn, submitting && { opacity: 0.7 }]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                                        <AppText style={s.nextBtnText}>Register Farmer</AppText>
                                    </>
                                )}
                            </Pressable>
                        )}
                    </View>
                </>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },

    header: {
        backgroundColor: "#386641",
        paddingTop: 56,
        paddingBottom: 20,
        paddingHorizontal: 20,
        gap: 12,
    },
    headerTop: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
    backBtn: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center", alignItems: "center",
        marginTop: 2,
    },
    stepLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
    stepTitle: { fontSize: 22, fontWeight: "900", color: "#FFFFFF", marginTop: 2 },
    stepSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
    progressTrack: {
        height: 4, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 2, overflow: "hidden",
    },
    progressFill: { height: 4, backgroundColor: "#FFFFFF", borderRadius: 2 },

    conflictBanner: {
        flexDirection: "row", alignItems: "center", gap: 10,
        backgroundColor: "#FEF3C7",
        borderLeftWidth: 4, borderLeftColor: "#F59E0B",
        paddingHorizontal: 16, paddingVertical: 12,
        marginHorizontal: 16, marginTop: 12,
        borderRadius: 10,
    },
    conflictText: { flex: 1, fontSize: 13, color: "#92400E", fontWeight: "600" },

    scrollContent: { padding: 20, paddingBottom: 40 },

    footer: {
        flexDirection: "row", gap: 10,
        padding: 16, backgroundColor: "#FFFFFF",
        borderTopWidth: 1, borderTopColor: "#E5E7EB",
    },
    backFooterBtn: {
        flexDirection: "row", alignItems: "center", gap: 4,
        paddingHorizontal: 16, paddingVertical: 14,
        borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
    },
    backFooterText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
    nextBtn: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
        backgroundColor: "#386641", borderRadius: 12, paddingVertical: 14,
    },
    submitBtn: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        backgroundColor: "#386641", borderRadius: 12, paddingVertical: 14,
    },
    nextBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
