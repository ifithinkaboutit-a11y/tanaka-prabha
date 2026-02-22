import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Pressable,
  View,
  Linking,
  Alert,
  RefreshControl,
} from "react-native";
import AppText from "../components/atoms/AppText";
import Button from "../components/atoms/Button";
import BookingModal from "../components/molecules/BookingModal";
import { professionalsApi, Professional, appointmentsApi } from "@/services/apiService";
import { useTranslation } from "../i18n";

const ConnectDetailScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { professionalId } = useLocalSearchParams<{ professionalId: string }>();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [bookedSlots, setBookedSlots] = useState<{ date: string; time: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfessional = useCallback(async () => {
    if (!professionalId) return;

    try {
      const data = await professionalsApi.getById(professionalId);
      setProfessional(data);
      // Fetch booked slots for this professional
      // In a real app, this would come from the API
      // For now, we simulate some booked slots
      const appointments = await appointmentsApi.getByProfessional(professionalId);
      setBookedSlots(appointments.map((a: any) => ({ date: a.date, time: a.time })));
    } catch (error) {
      console.error("Error fetching professional:", error);
    }
  }, [professionalId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProfessional();
      setLoading(false);
    };
    loadData();
  }, [fetchProfessional]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfessional();
    setRefreshing(false);
  }, [fetchProfessional]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#DCFCE7",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person" size={28} color="#386641" />
        </View>
        <AppText variant="bodySm" style={{ color: "#6B7280", marginTop: 12 }}>
          {t("connect.loading")}
        </AppText>
      </View>
    );
  }

  if (!professional) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC", padding: 20 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#FEF2F2",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons name="alert-circle" size={40} color="#DC2626" />
        </View>
        <AppText variant="bodyMd" style={{ color: "#6B7280", textAlign: "center" }}>
          {t("connect.professionalNotFound")}
        </AppText>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            marginTop: 20,
            backgroundColor: "#386641",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 20,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <AppText variant="bodySm" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            {t("common.goBack")}
          </AppText>
        </Pressable>
      </View>
    );
  }

  const handleConnect = () => {
    setShowConnectModal(true);
  };

  const handleCall = () => {
    setShowConnectModal(false);
    if (professional.phone) {
      const phoneNumber = professional.phone.replace(/\D/g, "");
      Linking.openURL(`tel:${phoneNumber}`).catch(() => {
        Alert.alert(
          t("connect.error"),
          t("connect.cannotMakeCall")
        );
      });
    } else {
      Alert.alert(t("connect.error"), t("connect.noPhoneNumber"));
    }
  };

  const handleChat = () => {
    setShowConnectModal(false);
    if (professional.phone) {
      const phoneNumber = professional.phone.replace(/\D/g, "");
      // Add country code if not present (assuming India - 91)
      const formattedNumber = phoneNumber.startsWith("91")
        ? phoneNumber
        : `91${phoneNumber}`;
      Linking.openURL(`whatsapp://send?phone=${formattedNumber}`).catch(() => {
        // If WhatsApp app is not installed, try web version
        Linking.openURL(`https://wa.me/${formattedNumber}`).catch(() => {
          Alert.alert(
            t("connect.error"),
            t("connect.cannotOpenWhatsApp")
          );
        });
      });
    } else {
      Alert.alert(t("connect.error"), t("connect.noPhoneNumber"));
    }
  };

  const handleBookAppointment = () => {
    setShowConnectModal(false);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (date: Date, time: string) => {
    try {
      // Create booking via API
      await appointmentsApi.create({
        professionalId: professional.id,
        date: date.toISOString().split("T")[0],
        time,
      });

      setShowBookingModal(false);
      Alert.alert(
        t("connect.booking.success"),
        t("connect.booking.successMessage", {
          date: date.toLocaleDateString(),
          time,
          name: professional.name,
        }),
        [{ text: t("common.ok") }]
      );
      // Refresh to get updated slots
      fetchProfessional();
    } catch (error) {
      Alert.alert(
        t("connect.booking.error"),
        t("connect.booking.errorMessage")
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 48,
          paddingBottom: 16,
          backgroundColor: "#386641",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <AppText
          variant="h3"
          style={{ flex: 1, fontWeight: "700", color: "#FFFFFF", fontSize: 18 }}
          numberOfLines={1}
        >
          {t("connect.expertProfile")}
        </AppText>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#386641"]}
            tintColor="#386641"
          />
        }
      >
        {/* Profile Card */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 20,
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            padding: 24,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          {/* Profile Image with Status */}
          <View style={{ position: "relative", marginBottom: 16 }}>
            <Image
              source={{ uri: professional.imageUrl || 'https://via.placeholder.com/150' }}
              style={{
                width: 120,
                height: 140,
                borderRadius: 20,
                borderWidth: 4,
                borderColor: professional.isAvailable ? "#16A34A" : "#D1D5DB",
              }}
              resizeMode="cover"
            />
            {/* Availability Badge */}
            <View
              style={{
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: [{ translateX: -40 }],
                backgroundColor: professional.isAvailable ? "#16A34A" : "#9CA3AF",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#FFFFFF",
                  marginRight: 6,
                }}
              />
              <AppText
                variant="bodySm"
                style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 11 }}
              >
                {professional.isAvailable ? t("connect.available") : t("connect.busy")}
              </AppText>
            </View>
          </View>

          {/* Name */}
          <AppText
            variant="h2"
            style={{
              fontWeight: "800",
              color: "#1F2937",
              textAlign: "center",
              marginTop: 8,
              fontSize: 22,
            }}
          >
            {professional.name}
          </AppText>

          {/* Role Badge */}
          <View
            style={{
              backgroundColor: "#DCFCE7",
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 16,
              marginTop: 8,
            }}
          >
            <AppText
              variant="bodySm"
              style={{ color: "#166534", fontWeight: "600", fontSize: 13 }}
            >
              {professional.role}
            </AppText>
          </View>

          {/* Department */}
          {professional.department && (
            <AppText
              variant="bodySm"
              style={{ color: "#6B7280", marginTop: 8, textAlign: "center" }}
            >
              {professional.department}
            </AppText>
          )}

          {/* Location */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
            <Ionicons name="location" size={16} color="#9CA3AF" />
            <AppText
              variant="bodySm"
              style={{ color: "#9CA3AF", marginLeft: 4 }}
            >
              {professional.district}
            </AppText>
          </View>
        </View>

        {/* Quick Connect Buttons */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 20,
            marginTop: 16,
            gap: 12,
          }}
        >
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed ? "#1D4ED8" : "#2563EB",
              paddingVertical: 14,
              borderRadius: 16,
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            })}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
            <AppText
              variant="bodySm"
              style={{ color: "#FFFFFF", fontWeight: "700", marginLeft: 8, fontSize: 14 }}
            >
              {t("connect.options.call")}
            </AppText>
          </Pressable>
          <Pressable
            onPress={handleChat}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed ? "#059669" : "#10B981",
              paddingVertical: 14,
              borderRadius: 16,
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            })}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <AppText
              variant="bodySm"
              style={{ color: "#FFFFFF", fontWeight: "700", marginLeft: 8, fontSize: 14 }}
            >
              {t("connect.options.chat")}
            </AppText>
          </Pressable>
        </View>

        {/* Service Area Section */}
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 20,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#DBEAFE",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="location" size={20} color="#2563EB" />
            </View>
            <AppText
              variant="h3"
              style={{ fontWeight: "700", color: "#1F2937", fontSize: 16 }}
            >
              {t("connect.serviceArea")}
            </AppText>
          </View>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#386641", marginRight: 12 }} />
              <AppText variant="bodySm" style={{ color: "#6B7280" }}>
                <AppText style={{ fontWeight: "600", color: "#374151" }}>{t("connect.district")}:</AppText>{" "}
                {professional.serviceArea?.district || professional.district || 'N/A'}
              </AppText>
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#386641", marginRight: 12, marginTop: 6 }} />
              <AppText variant="bodySm" style={{ color: "#6B7280", flex: 1 }}>
                <AppText style={{ fontWeight: "600", color: "#374151" }}>{t("connect.blocksCovered")}:</AppText>{" "}
                {professional.serviceArea?.blocks?.join(", ") || 'N/A'}
              </AppText>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#386641", marginRight: 12 }} />
              <AppText variant="bodySm" style={{ color: "#6B7280" }}>
                <AppText style={{ fontWeight: "600", color: "#374151" }}>{t("connect.state")}:</AppText>{" "}
                {professional.serviceArea?.state || 'N/A'}
              </AppText>
            </View>
          </View>
        </View>

        {/* Specialization Section */}
        {professional.specializations && professional.specializations.length > 0 && (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#FEF3C7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="star" size={20} color="#D97706" />
              </View>
              <AppText
                variant="h3"
                style={{ fontWeight: "700", color: "#1F2937", fontSize: 16 }}
              >
                {t("connect.specialization")}
              </AppText>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {professional.specializations.map((spec, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: "#F3F4F6",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 12,
                  }}
                >
                  <AppText
                    variant="bodySm"
                    style={{ color: "#374151", fontWeight: "500", fontSize: 13 }}
                  >
                    {spec}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact Info */}
        {professional.phone && (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#DCFCE7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="call" size={20} color="#16A34A" />
              </View>
              <AppText
                variant="h3"
                style={{ fontWeight: "700", color: "#1F2937", fontSize: 16 }}
              >
                {t("connect.contactInfo")}
              </AppText>
            </View>

            <Pressable
              onPress={handleCall}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: pressed ? "#F3F4F6" : "#F9FAFB",
                padding: 14,
                borderRadius: 12,
              })}
            >
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <AppText
                variant="bodyMd"
                style={{ color: "#374151", marginLeft: 12, fontWeight: "500" }}
              >
                {professional.phone}
              </AppText>
              <View style={{ flex: 1 }} />
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Pressable
          onPress={handleBookAppointment}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#2F5233" : "#386641",
            paddingVertical: 16,
            borderRadius: 25,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#386641",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          })}
        >
          <Ionicons name="calendar" size={22} color="#FFFFFF" />
          <AppText
            variant="bodyMd"
            style={{ color: "#FFFFFF", fontWeight: "700", marginLeft: 10, fontSize: 16 }}
          >
            {t("connect.bookAppointment")}
          </AppText>
        </Pressable>
      </View>

      {/* Connect Options Modal */}
      <Modal
        visible={showConnectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConnectModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setShowConnectModal(false)}
        >
          <View style={{ flex: 1 }} />
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 36,
            }}
          >
            {/* Handle Bar */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#D1D5DB",
                borderRadius: 2,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            <AppText
              variant="h3"
              style={{ fontWeight: "700", color: "#1F2937", marginBottom: 20, fontSize: 18 }}
            >
              {t("connect.howToConnect")}
            </AppText>

            {/* Call Option */}
            <Pressable
              onPress={handleCall}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: pressed ? "#DBEAFE" : "#EFF6FF",
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
              })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#2563EB",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Ionicons name="call" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <AppText
                  variant="bodyMd"
                  style={{ fontWeight: "700", color: "#1F2937", fontSize: 15 }}
                >
                  {t("connect.callThem")}
                </AppText>
                <AppText
                  variant="bodySm"
                  style={{ color: "#6B7280", marginTop: 2 }}
                >
                  {t("connect.callDescription")}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Chat Option */}
            <Pressable
              onPress={handleChat}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: pressed ? "#D1FAE5" : "#ECFDF5",
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
              })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#10B981",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <AppText
                  variant="bodyMd"
                  style={{ fontWeight: "700", color: "#1F2937", fontSize: 15 }}
                >
                  {t("connect.chatWithThem")}
                </AppText>
                <AppText
                  variant="bodySm"
                  style={{ color: "#6B7280", marginTop: 2 }}
                >
                  {t("connect.chatDescription")}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Book Appointment Option */}
            <Pressable
              onPress={handleBookAppointment}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: pressed ? "#FEF3C7" : "#FFFBEB",
                padding: 16,
                borderRadius: 16,
              })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#F59E0B",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Ionicons name="calendar" size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <AppText
                  variant="bodyMd"
                  style={{ fontWeight: "700", color: "#1F2937", fontSize: 15 }}
                >
                  {t("connect.bookAppointment")}
                </AppText>
                <AppText
                  variant="bodySm"
                  style={{ color: "#6B7280", marginTop: 2 }}
                >
                  {t("connect.bookDescription")}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Booking Modal */}
      <BookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleConfirmBooking}
        professionalName={professional.name}
        bookedSlots={bookedSlots}
        maxAppointmentsPerDay={3}
      />
    </View>
  );
};

export default ConnectDetailScreen;
