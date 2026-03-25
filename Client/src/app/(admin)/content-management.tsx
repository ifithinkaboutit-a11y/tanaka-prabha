// src/app/(admin)/content-management.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import apiService, { Banner, Scheme } from "@/services/apiService";
import { cdn } from "@/utils/cloudinaryUtils";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ─── types ───────────────────────────────────────────────────
type TabKey = "banners" | "schemes" | "professionals";

const TABS: { key: TabKey; label: string; icon: string; color: string }[] = [
    { key: "banners", label: "Banners", icon: "images-outline", color: "#F59E0B" },
    { key: "schemes", label: "Schemes", icon: "document-text-outline", color: "#EC4899" },
    { key: "professionals", label: "Experts", icon: "people-circle-outline", color: "#6366F1" },
];

// ─── helpers ─────────────────────────────────────────────────
async function pickAndUploadImage(uploadFn: (uri: string) => Promise<string>): Promise<string | null> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow access to photo library.");
        return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    return await uploadFn(result.assets[0].uri);
}

// ─── ImageUploadRow ───────────────────────────────────────────
function ImageUploadRow({
    label,
    url,
    uploading,
    onPick,
}: {
    label: string;
    url?: string | null;
    uploading: boolean;
    onPick: () => void;
}) {
    return (
        <View style={ir.wrapper}>
            <AppText style={ir.label}>{label}</AppText>
            <View style={ir.row}>
                {url ? (
                    <Image source={{ uri: url }} style={ir.thumb} resizeMode="cover" />
                ) : (
                    <View style={ir.placeholder}>
                        <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                    </View>
                )}
                <TouchableOpacity style={ir.btn} onPress={onPick} disabled={uploading}>
                    {uploading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Ionicons name={url ? "refresh" : "cloud-upload-outline"} size={16} color="#fff" />
                            <AppText style={ir.btnText}>{url ? "Change" : "Upload"}</AppText>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const ir = StyleSheet.create({
    wrapper: { marginBottom: 12 },
    label: { fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 6 },
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    thumb: { width: 72, height: 48, borderRadius: 8, backgroundColor: "#E5E7EB" },
    placeholder: {
        width: 72, height: 48, borderRadius: 8,
        backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center",
        borderWidth: 1, borderColor: "#E5E7EB",
    },
    btn: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: "#3B82F6", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
    },
    btnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});

// ─── Input helper ─────────────────────────────────────────────
function Field({ label, value, onChangeText, multiline, placeholder }: {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    multiline?: boolean;
    placeholder?: string;
}) {
    return (
        <View style={fi.wrapper}>
            <AppText style={fi.label}>{label}</AppText>
            <TextInput
                style={[fi.input, multiline && fi.area]}
                placeholder={placeholder ?? label}
                placeholderTextColor="#9CA3AF"
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                textAlignVertical={multiline ? "top" : undefined}
            />
        </View>
    );
}
const fi = StyleSheet.create({
    wrapper: { marginBottom: 12 },
    label: { fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 5 },
    input: {
        borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 10,
        padding: 12, fontSize: 14, color: "#1F2937", backgroundColor: "#F9FAFB",
    },
    area: { height: 80 },
});

// ─── Banners Tab ──────────────────────────────────────────────
function BannersTab() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Banner | null>(null);

    // form
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [titleHi, setTitleHi] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        try {
            const data = await apiService.banners.getAll();
            setBanners(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function pickImage() {
        setUploadingImage(true);
        try {
            const url = await pickAndUploadImage(uri => apiService.upload.uploadEventImage(uri));
            if (url) setImageUrl(url);
        } catch {
            Alert.alert("Error", "Image upload failed.");
        } finally {
            setUploadingImage(false);
        }
    }

    function reset() {
        setTitle(""); setSubtitle(""); setTitleHi(""); setImageUrl(null);
        setEditingItem(null);
    }

    function openCreate() {
        reset();
        setShowModal(true);
    }

    function openEdit(item: Banner) {
        setEditingItem(item);
        setTitle(item.title ?? "");
        setSubtitle(item.subtitle ?? "");
        setTitleHi((item as any).titleHi ?? "");
        setImageUrl(item.imageUrl ?? null);
        setShowModal(true);
    }

    function confirmDelete(item: Banner) {
        Alert.alert("Delete Banner", `Delete "${item.title}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        const token = await apiService.tokenManager.getToken();
                        const API_BASE = process.env.EXPO_PUBLIC_API_URL;
                        const res = await fetch(`${API_BASE}/banners/${item.id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!res.ok) throw new Error("Failed");
                        load();
                    } catch {
                        Alert.alert("Error", "Could not delete banner.");
                    }
                },
            },
        ]);
    }

    async function handleSave() {
        if (!title || !imageUrl) {
            Alert.alert("Required", "Title and image are required.");
            return;
        }
        setSaving(true);
        try {
            const token = await apiService.tokenManager.getToken();
            const API_BASE = process.env.EXPO_PUBLIC_API_URL;
            const method = editingItem ? "PUT" : "POST";
            const url = editingItem ? `${API_BASE}/banners/${editingItem.id}` : `${API_BASE}/banners`;
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title, subtitle, title_hi: titleHi, image_url: imageUrl }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed");
            Alert.alert("✅ Success", editingItem ? "Banner updated!" : "Banner created!");
            reset();
            setShowModal(false);
            load();
        } catch (e: any) {
            Alert.alert("Error", e.message || "Could not save banner.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={cms.addBtn} onPress={openCreate}>
                <Ionicons name="add-circle" size={18} color="#fff" />
                <AppText style={cms.addBtnText}>Add New Banner</AppText>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator color="#F59E0B" style={{ marginTop: 32 }} />
            ) : banners.length === 0 ? (
                <View style={cms.empty}>
                    <Ionicons name="images-outline" size={48} color="#D1D5DB" />
                    <AppText style={cms.emptyText}>No banners yet</AppText>
                </View>
            ) : (
                <FlatList
                    data={banners}
                    keyExtractor={b => b.id}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <View style={cms.itemCard}>
                            {item.imageUrl ? (
                                <Image source={{ uri: cdn(item.imageUrl) }} style={cms.itemThumb} resizeMode="cover" />
                            ) : (
                                <View style={[cms.itemThumb, cms.thumbPlaceholder]}>
                                    <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                                </View>
                            )}
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <AppText style={cms.itemTitle}>{item.title}</AppText>
                                {item.subtitle ? <AppText style={cms.itemSub}>{item.subtitle}</AppText> : null}
                            </View>
                            <View style={[cms.statusDot, { backgroundColor: item.isActive ? "#10B981" : "#EF4444" }]} />
                            <TouchableOpacity style={cms.actionBtn} onPress={() => openEdit(item)}>
                                <Ionicons name="pencil" size={16} color="#3B82F6" />
                            </TouchableOpacity>
                            <TouchableOpacity style={cms.actionBtn} onPress={() => confirmDelete(item)}>
                                <Ionicons name="trash" size={16} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            {/* Create / Edit Modal */}
            <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => { setShowModal(false); reset(); }}>
                <Pressable style={cms.overlay} onPress={() => { setShowModal(false); reset(); }}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: "100%" }}>
                        <Pressable style={cms.sheet} onPress={e => e.stopPropagation()}>
                            <View style={cms.sheetHandle} />
                            <AppText style={cms.sheetTitle}>{editingItem ? "Edit Banner" : "Add Banner"}</AppText>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <ImageUploadRow label="Banner Image *" url={imageUrl} uploading={uploadingImage} onPick={pickImage} />
                                <Field label="Title (English) *" value={title} onChangeText={setTitle} />
                                <Field label="Title (Hindi)" value={titleHi} onChangeText={setTitleHi} />
                                <Field label="Subtitle" value={subtitle} onChangeText={setSubtitle} />
                                <Button variant="primary" disabled={saving} onPress={handleSave}
                                    style={{ backgroundColor: "#F59E0B", borderColor: "#F59E0B", marginTop: 8 } as any}>
                                    {saving ? <ActivityIndicator color="#fff" /> : <AppText style={cms.saveBtnText}>{editingItem ? "Update Banner" : "Save Banner"}</AppText>}
                                </Button>
                                <Button variant="outline" label="Cancel" onPress={() => { setShowModal(false); reset(); }} style={{ marginTop: 8 }} />
                            </ScrollView>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </View>
    );
}

// ─── Schemes Tab ──────────────────────────────────────────────
function SchemesTab() {
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Scheme | null>(null);

    // form
    const [schTitle, setSchTitle] = useState("");
    const [schTitleHi, setSchTitleHi] = useState("");
    const [schDesc, setSchDesc] = useState("");
    const [schDescHi, setSchDescHi] = useState("");
    const [schCategory, setSchCategory] = useState("");
    const [schEligibility, setSchEligibility] = useState("");
    const [schImageUrl, setSchImageUrl] = useState<string | null>(null);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        try {
            const data = await apiService.schemes.getAll({ limit: 50 });
            setSchemes(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function pickImage() {
        setUploadingImg(true);
        try {
            const url = await pickAndUploadImage(uri => apiService.upload.uploadEventImage(uri));
            if (url) setSchImageUrl(url);
        } catch {
            Alert.alert("Error", "Image upload failed.");
        } finally {
            setUploadingImg(false);
        }
    }

    function reset() {
        setSchTitle(""); setSchTitleHi(""); setSchDesc(""); setSchDescHi("");
        setSchCategory(""); setSchEligibility(""); setSchImageUrl(null);
        setEditingItem(null);
    }

    function openCreate() {
        reset();
        setShowModal(true);
    }

    function openEdit(item: Scheme) {
        setEditingItem(item);
        setSchTitle(item.title ?? "");
        setSchTitleHi((item as any).titleHi ?? "");
        setSchDesc((item as any).description ?? "");
        setSchDescHi((item as any).descriptionHi ?? "");
        setSchCategory(item.category ?? "");
        setSchEligibility((item as any).eligibility ?? "");
        setSchImageUrl(item.imageUrl ?? null);
        setShowModal(true);
    }

    function confirmDelete(item: Scheme) {
        Alert.alert("Delete Scheme", `Delete "${item.title}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        const token = await apiService.tokenManager.getToken();
                        const API_BASE = process.env.EXPO_PUBLIC_API_URL;
                        const res = await fetch(`${API_BASE}/schemes/${item.id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!res.ok) throw new Error("Failed");
                        load();
                    } catch {
                        Alert.alert("Error", "Could not delete scheme.");
                    }
                },
            },
        ]);
    }

    async function handleSave() {
        if (!schTitle || !schCategory) {
            Alert.alert("Required", "Title and category are required.");
            return;
        }
        setSaving(true);
        try {
            const token = await apiService.tokenManager.getToken();
            const API_BASE = process.env.EXPO_PUBLIC_API_URL;
            const method = editingItem ? "PUT" : "POST";
            const url = editingItem ? `${API_BASE}/schemes/${editingItem.id}` : `${API_BASE}/schemes`;
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    title: schTitle, title_hi: schTitleHi,
                    description: schDesc, description_hi: schDescHi,
                    category: schCategory, eligibility: schEligibility,
                    image_url: schImageUrl,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed");
            Alert.alert("✅ Success", editingItem ? "Scheme updated!" : "Scheme created!");
            reset(); setShowModal(false); load();
        } catch (e: any) {
            Alert.alert("Error", e.message || "Could not save scheme.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={[cms.addBtn, { backgroundColor: "#EC4899" }]} onPress={openCreate}>
                <Ionicons name="add-circle" size={18} color="#fff" />
                <AppText style={cms.addBtnText}>Add New Scheme</AppText>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator color="#EC4899" style={{ marginTop: 32 }} />
            ) : schemes.length === 0 ? (
                <View style={cms.empty}>
                    <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                    <AppText style={cms.emptyText}>No schemes yet</AppText>
                </View>
            ) : (
                <FlatList
                    data={schemes}
                    keyExtractor={s => s.id}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <View style={cms.itemCard}>
                            {item.imageUrl ? (
                                <Image source={{ uri: cdn(item.imageUrl) }} style={cms.itemThumb} resizeMode="cover" />
                            ) : (
                                <View style={[cms.itemThumb, cms.thumbPlaceholder]}>
                                    <Ionicons name="document-text-outline" size={24} color="#9CA3AF" />
                                </View>
                            )}
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <AppText style={cms.itemTitle}>{item.title}</AppText>
                                <View style={cms.categoryBadge}>
                                    <AppText style={cms.categoryText}>{item.category}</AppText>
                                </View>
                            </View>
                            <View style={[cms.statusDot, { backgroundColor: item.isActive ? "#10B981" : "#EF4444" }]} />
                            <TouchableOpacity style={cms.actionBtn} onPress={() => openEdit(item)}>
                                <Ionicons name="pencil" size={16} color="#3B82F6" />
                            </TouchableOpacity>
                            <TouchableOpacity style={cms.actionBtn} onPress={() => confirmDelete(item)}>
                                <Ionicons name="trash" size={16} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => { setShowModal(false); reset(); }}>
                <Pressable style={cms.overlay} onPress={() => { setShowModal(false); reset(); }}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: "100%" }}>
                        <Pressable style={cms.sheet} onPress={e => e.stopPropagation()}>
                            <View style={cms.sheetHandle} />
                            <AppText style={cms.sheetTitle}>{editingItem ? "Edit Scheme" : "Add Scheme"}</AppText>
                            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
                                <ImageUploadRow label="Scheme Image" url={schImageUrl} uploading={uploadingImg} onPick={pickImage} />
                                <Field label="Title (English) *" value={schTitle} onChangeText={setSchTitle} />
                                <Field label="Title (Hindi)" value={schTitleHi} onChangeText={setSchTitleHi} />
                                <Field label="Category *" value={schCategory} onChangeText={setSchCategory} placeholder="e.g. Agriculture, Finance" />
                                <Field label="Description" value={schDesc} onChangeText={setSchDesc} multiline />
                                <Field label="Description (Hindi)" value={schDescHi} onChangeText={setSchDescHi} multiline />
                                <Field label="Eligibility" value={schEligibility} onChangeText={setSchEligibility} multiline />
                                <Button variant="primary" disabled={saving} onPress={handleSave}
                                    style={{ backgroundColor: "#EC4899", borderColor: "#EC4899", marginTop: 8 } as any}>
                                    {saving ? <ActivityIndicator color="#fff" /> : <AppText style={cms.saveBtnText}>{editingItem ? "Update Scheme" : "Save Scheme"}</AppText>}
                                </Button>
                                <Button variant="outline" label="Cancel" onPress={() => { setShowModal(false); reset(); }} style={{ marginTop: 8 }} />
                            </ScrollView>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </View>
    );
}

// ─── Professionals Tab ────────────────────────────────────────
function ProfessionalsTab() {
    const [profs, setProfs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const [pName, setPName] = useState("");
    const [pRole, setPRole] = useState("");
    const [pDept, setPDept] = useState("");
    const [pCategory, setPCategory] = useState("");
    const [pPhone, setPPhone] = useState("");
    const [pDistrict, setPDistrict] = useState("");
    const [pImageUrl, setPImageUrl] = useState<string | null>(null);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        try {
            const data = await apiService.professionals.getAll({ limit: 50 });
            setProfs(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function pickImage() {
        setUploadingImg(true);
        try {
            const url = await pickAndUploadImage(uri => apiService.upload.uploadProfessionalPhoto(uri));
            if (url) setPImageUrl(url);
        } catch { Alert.alert("Error", "Image upload failed."); }
        finally { setUploadingImg(false); }
    }

    function reset() {
        setPName(""); setPRole(""); setPDept(""); setPCategory("");
        setPPhone(""); setPDistrict(""); setPImageUrl(null);
        setEditingItem(null);
    }

    function openCreate() {
        reset();
        setShowModal(true);
    }

    function openEdit(item: any) {
        setEditingItem(item);
        setPName(item.name ?? "");
        setPRole(item.role ?? "");
        setPDept(item.department ?? "");
        setPCategory(item.category ?? "");
        setPPhone(item.phoneNumber ?? item.phone_number ?? "");
        setPDistrict(item.district ?? "");
        setPImageUrl(item.imageUrl ?? null);
        setShowModal(true);
    }

    function confirmDelete(item: any) {
        Alert.alert("Delete Professional", `Delete "${item.name}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        const token = await apiService.tokenManager.getToken();
                        const API_BASE = process.env.EXPO_PUBLIC_API_URL;
                        const res = await fetch(`${API_BASE}/professionals/${item.id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!res.ok) throw new Error("Failed");
                        load();
                    } catch {
                        Alert.alert("Error", "Could not delete professional.");
                    }
                },
            },
        ]);
    }

    async function handleSave() {
        if (!pName || !pRole || !pCategory) {
            Alert.alert("Required", "Name, role and category are required.");
            return;
        }
        setSaving(true);
        try {
            const token = await apiService.tokenManager.getToken();
            const API_BASE = process.env.EXPO_PUBLIC_API_URL;
            const method = editingItem ? "PUT" : "POST";
            const url = editingItem ? `${API_BASE}/professionals/${editingItem.id}` : `${API_BASE}/professionals`;
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: pName, role: pRole, department: pDept, category: pCategory, phone_number: pPhone, district: pDistrict, image_url: pImageUrl, is_available: true }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed");
            Alert.alert("✅ Success", editingItem ? "Professional updated!" : "Professional added!");
            reset(); setShowModal(false); load();
        } catch (e: any) { Alert.alert("Error", e.message || "Could not save professional."); }
        finally { setSaving(false); }
    }

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={[cms.addBtn, { backgroundColor: "#6366F1" }]} onPress={openCreate}>
                <Ionicons name="person-add" size={18} color="#fff" />
                <AppText style={cms.addBtnText}>Add Professional</AppText>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator color="#6366F1" style={{ marginTop: 32 }} />
            ) : profs.length === 0 ? (
                <View style={cms.empty}>
                    <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                    <AppText style={cms.emptyText}>No professionals yet</AppText>
                </View>
            ) : (
                <FlatList
                    data={profs}
                    keyExtractor={p => p.id}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <View style={cms.itemCard}>
                            {item.imageUrl ? (
                                <Image source={{ uri: cdn(item.imageUrl) }} style={[cms.itemThumb, { borderRadius: 30 }]} resizeMode="cover" />
                            ) : (
                                <View style={[cms.itemThumb, cms.thumbPlaceholder, { borderRadius: 30 }]}>
                                    <AppText style={{ color: "#9CA3AF", fontWeight: "700" }}>{item.name?.[0]}</AppText>
                                </View>
                            )}
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <AppText style={cms.itemTitle}>{item.name}</AppText>
                                <AppText style={cms.itemSub}>{item.role} {item.department ? `· ${item.department}` : ""}</AppText>
                            </View>
                            <View style={[cms.statusDot, { backgroundColor: item.isAvailable ? "#10B981" : "#9CA3AF" }]} />
                            <TouchableOpacity style={cms.actionBtn} onPress={() => openEdit(item)}>
                                <Ionicons name="pencil" size={16} color="#3B82F6" />
                            </TouchableOpacity>
                            <TouchableOpacity style={cms.actionBtn} onPress={() => confirmDelete(item)}>
                                <Ionicons name="trash" size={16} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => { setShowModal(false); reset(); }}>
                <Pressable style={cms.overlay} onPress={() => { setShowModal(false); reset(); }}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: "100%" }}>
                        <Pressable style={cms.sheet} onPress={e => e.stopPropagation()}>
                            <View style={cms.sheetHandle} />
                            <AppText style={cms.sheetTitle}>{editingItem ? "Edit Professional" : "Add Professional"}</AppText>
                            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
                                <ImageUploadRow label="Profile Photo" url={pImageUrl} uploading={uploadingImg} onPick={pickImage} />
                                <Field label="Full Name *" value={pName} onChangeText={setPName} />
                                <Field label="Role *" value={pRole} onChangeText={setPRole} placeholder="e.g. Doctor, Veterinarian" />
                                <Field label="Category *" value={pCategory} onChangeText={setPCategory} placeholder="e.g. Medical, Agriculture" />
                                <Field label="Department" value={pDept} onChangeText={setPDept} />
                                <Field label="Phone Number" value={pPhone} onChangeText={setPPhone} />
                                <Field label="District" value={pDistrict} onChangeText={setPDistrict} />
                                <Button variant="primary" disabled={saving} onPress={handleSave}
                                    style={{ backgroundColor: "#6366F1", borderColor: "#6366F1", marginTop: 8 } as any}>
                                    {saving ? <ActivityIndicator color="#fff" /> : <AppText style={cms.saveBtnText}>{editingItem ? "Update Professional" : "Save Professional"}</AppText>}
                                </Button>
                                <Button variant="outline" label="Cancel" onPress={() => { setShowModal(false); reset(); }} style={{ marginTop: 8 }} />
                            </ScrollView>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </View>
    );
}

// ─── Main CMS Screen ──────────────────────────────────────────
export default function ContentManagement() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabKey>("banners");

    return (
        <View style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#1F2937" />
                </TouchableOpacity>
                <View>
                    <AppText style={s.title}>Content Management</AppText>
                    <AppText style={s.subtitle}>Banners · Schemes · Professionals</AppText>
                </View>
            </View>

            {/* Tabs */}
            <View style={s.tabRow}>
                {TABS.map(tab => {
                    const active = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[s.tab, active && { borderBottomColor: tab.color, borderBottomWidth: 3 }]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Ionicons name={tab.icon as any} size={18} color={active ? tab.color : "#9CA3AF"} />
                            <AppText style={[s.tabLabel, { color: active ? tab.color : "#9CA3AF" }]}>{tab.label}</AppText>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Tab Content */}
            <View style={s.content}>
                {activeTab === "banners" && <BannersTab />}
                {activeTab === "schemes" && <SchemesTab />}
                {activeTab === "professionals" && <ProfessionalsTab />}
            </View>
        </View>
    );
}

// ─── shared CMS styles ────────────────────────────────────────
const cms = StyleSheet.create({
    addBtn: {
        flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center",
        backgroundColor: "#F59E0B", borderRadius: 12,
        paddingVertical: 13, marginBottom: 14,
    },
    addBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    empty: { alignItems: "center", paddingVertical: 40, gap: 12 },
    emptyText: { color: "#9CA3AF", fontSize: 15 },

    itemCard: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 14, padding: 12, marginBottom: 8,
        shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    itemThumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: "#E5E7EB" },
    thumbPlaceholder: { justifyContent: "center", alignItems: "center" },
    itemTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
    itemSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
    categoryBadge: { backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginTop: 4 },
    categoryText: { fontSize: 11, color: "#3B82F6", fontWeight: "600" },
    actionBtn: { padding: 8, marginLeft: 4 },

    // modal
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 32,
    },
    sheetHandle: { width: 44, height: 4, backgroundColor: "#E5E7EB", borderRadius: 4, alignSelf: "center", marginBottom: 16 },
    sheetTitle: { fontSize: 20, fontWeight: "800", color: "#111827", textAlign: "center", marginBottom: 16 },
    saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16, textAlign: "center" },
});

// ─── page styles ──────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    header: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
    },
    backBtn: {
        padding: 8, backgroundColor: "#F3F4F6", borderRadius: 12,
    },
    title: { fontSize: 20, fontWeight: "800", color: "#111827" },
    subtitle: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },

    tabRow: {
        flexDirection: "row", backgroundColor: "#fff",
        borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
    },
    tab: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 6, paddingVertical: 12,
        borderBottomWidth: 3, borderBottomColor: "transparent",
    },
    tabLabel: { fontSize: 13, fontWeight: "600" },

    content: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
});
