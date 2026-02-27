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
      <View className="flex-1 items-center justify-center bg-slate-50">
        <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
          <Ionicons name="person" size={28} color="#386641" />
        </View>
        <AppText variant="bodySm" className="text-gray-500">
          {t("connect.loading")}
        </AppText>
      </View>
    );
  }

  if (!professional) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-5">
        <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-4">
          <Ionicons name="alert-circle" size={40} color="#DC2626" />
        </View>
        <AppText variant="bodyMd" className="text-gray-500 text-center">
          {t("connect.professionalNotFound")}
        </AppText>
        <Pressable
          onPress={() => router.back()}
          className="mt-5 bg-[#386641] px-6 py-3 rounded-xl active:opacity-90"
        >
          <AppText variant="bodySm" className="text-white font-semibold">
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
        Alert.alert(t("connect.error"), t("connect.cannotMakeCall"));
      });
    } else {
      Alert.alert(t("connect.error"), t("connect.noPhoneNumber"));
    }
  };

  const handleChat = () => {
    setShowConnectModal(false);
    if (professional.phone) {
      const phoneNumber = professional.phone.replace(/\D/g, "");
      const formattedNumber = phoneNumber.startsWith("91")
        ? phoneNumber
        : `91${phoneNumber}`;
      Linking.openURL(`whatsapp://send?phone=${formattedNumber}`).catch(() => {
        Linking.openURL(`https://wa.me/${formattedNumber}`).catch(() => {
          Alert.alert(t("connect.error"), t("connect.cannotOpenWhatsApp"));
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
      fetchProfessional();
    } catch (error) {
      Alert.alert(
        t("connect.booking.error"),
        t("connect.booking.errorMessage")
      );
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-5 pt-12 pb-4 bg-[#386641]">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3 active:opacity-70"
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <AppText
          variant="h3"
          className="flex-1 font-bold text-white text-[18px]"
          numberOfLines={1}
        >
          {t("connect.expertProfile")}
        </AppText>
      </View>

      <ScrollView
        className="flex-1"
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
          className="mx-5 mt-5 bg-white rounded-[24px] p-6 items-center shadow-lg border border-gray-100"
          style={{ elevation: 4 }}
        >
          <View className="mb-4 relative">
            <Image
              source={{ uri: professional.imageUrl || 'https://via.placeholder.com/150' }}
              className={`w-28 h-[140px] rounded-2xl border-4 ${professional.isAvailable ? 'border-green-600' : 'border-gray-300'}`}
              resizeMode="cover"
            />
            <View
              className={`absolute -bottom-2.5 left-1/2 -ml-[45px] px-3 py-1 rounded-xl flex-row items-center ${professional.isAvailable ? "bg-green-600" : "bg-gray-400"
                }`}
            >
              <View className="w-2 h-2 rounded-full bg-white mr-1.5" />
              <AppText variant="bodySm" className="text-white font-semibold text-[11px]">
                {professional.isAvailable ? t("connect.available") : t("connect.busy")}
              </AppText>
            </View>
          </View>

          <AppText variant="h2" className="font-extrabold text-gray-800 text-center mt-2 text-[22px]">
            {professional.name}
          </AppText>

          <View className="bg-green-100 px-4 py-1.5 rounded-2xl mt-2">
            <AppText variant="bodySm" className="text-green-800 font-semibold text-[13px]">
              {professional.role}
            </AppText>
          </View>

          {professional.department && (
            <AppText variant="bodySm" className="text-gray-500 mt-2 text-center">
              {professional.department}
            </AppText>
          )}

          <View className="flex-row items-center mt-2">
            <Ionicons name="location" size={16} color="#9CA3AF" />
            <AppText variant="bodySm" className="text-gray-400 ml-1">
              {professional.district}
            </AppText>
          </View>
        </View>

        {/* Quick Connect Buttons */}
        <View className="flex-row mx-5 mt-4 gap-x-3">
          <Pressable
            onPress={handleCall}
            className="flex-1 flex-row items-center justify-center bg-[#2563EB] py-3.5 rounded-2xl shadow-sm active:bg-blue-700"
            style={{ elevation: 4 }}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
            <AppText variant="bodySm" className="text-white font-bold ml-2 text-[14px]">
              {t("connect.options.call")}
            </AppText>
          </Pressable>
          <Pressable
            onPress={handleChat}
            className="flex-1 flex-row items-center justify-center bg-[#10B981] py-3.5 rounded-2xl shadow-sm active:bg-emerald-600"
            style={{ elevation: 4 }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <AppText variant="bodySm" className="text-white font-bold ml-2 text-[14px]">
              {t("connect.options.chat")}
            </AppText>
          </Pressable>
        </View>

        {/* Service Area Section */}
        <View
          className="mx-5 mt-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          style={{ elevation: 3 }}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center mr-3">
              <Ionicons name="location" size={20} color="#2563EB" />
            </View>
            <AppText variant="h3" className="font-bold text-gray-800 text-[16px]">
              {t("connect.serviceArea")}
            </AppText>
          </View>

          <View className="gap-y-3">
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-[#386641] mr-3" />
              <AppText variant="bodySm" className="text-gray-500">
                <AppText className="font-semibold text-gray-700">{t("connect.district")}:</AppText>{" "}
                {professional.serviceArea?.district || professional.district || 'N/A'}
              </AppText>
            </View>

            <View className="flex-row items-start">
              <View className="w-1.5 h-1.5 rounded-full bg-[#386641] mr-3 mt-1.5" />
              <AppText variant="bodySm" className="text-gray-500 flex-1">
                <AppText className="font-semibold text-gray-700">{t("connect.blocksCovered")}:</AppText>{" "}
                {professional.serviceArea?.blocks?.join(", ") || 'N/A'}
              </AppText>
            </View>

            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-[#386641] mr-3" />
              <AppText variant="bodySm" className="text-gray-500">
                <AppText className="font-semibold text-gray-700">{t("connect.state")}:</AppText>{" "}
                {professional.serviceArea?.state || 'N/A'}
              </AppText>
            </View>
          </View>
        </View>

        {/* Specialization Section */}
        {professional.specializations && professional.specializations.length > 0 && (
          <View
            className="mx-5 mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            style={{ elevation: 3 }}
          >
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-xl bg-amber-100 items-center justify-center mr-3">
                <Ionicons name="star" size={20} color="#D97706" />
              </View>
              <AppText variant="h3" className="font-bold text-gray-800 text-[16px]">
                {t("connect.specialization")}
              </AppText>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {professional.specializations.map((spec, index) => (
                <View key={index} className="bg-gray-100 px-3 py-2 rounded-xl">
                  <AppText variant="bodySm" className="text-gray-700 font-medium text-[13px]">
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
            className="mx-5 mt-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            style={{ elevation: 3 }}
          >
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center mr-3">
                <Ionicons name="call" size={20} color="#16A34A" />
              </View>
              <AppText variant="h3" className="font-bold text-gray-800 text-[16px]">
                {t("connect.contactInfo")}
              </AppText>
            </View>

            <Pressable
              onPress={handleCall}
              className="flex-row items-center bg-gray-50 p-3 h-14 rounded-xl active:bg-gray-100"
            >
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <AppText variant="bodyMd" className="text-gray-700 ml-3 font-medium">
                {professional.phone}
              </AppText>
              <View className="flex-1" />
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>
          </View>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Bottom Action Button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-6 bg-white border-t border-gray-200"
        style={{ elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8 }}
      >
        <Pressable
          onPress={handleBookAppointment}
          className="bg-[#386641] py-4 rounded-full flex-row items-center justify-center active:bg-[#2F5233]"
        >
          <Ionicons name="calendar" size={22} color="#FFFFFF" />
          <AppText variant="bodyMd" className="text-white font-bold ml-2.5 text-[16px]">
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
          className="flex-1 bg-black/50"
          onPress={() => setShowConnectModal(false)}
        >
          <View className="flex-1" />
          <View className="bg-white rounded-t-[28px] px-6 pt-6 pb-10">
            {/* Handle Bar */}
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-5" />

            <AppText variant="h3" className="font-bold text-gray-800 mb-5 text-[18px]">
              {t("connect.howToConnect")}
            </AppText>

            {/* Call Option */}
            <Pressable
              onPress={handleCall}
              className="flex-row items-center bg-blue-50 p-4 rounded-2xl mb-3 active:bg-blue-100"
            >
              <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center mr-3">
                <Ionicons name="call" size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <AppText variant="bodyMd" className="font-bold text-gray-800 text-[15px]">
                  {t("connect.callThem")}
                </AppText>
                <AppText variant="bodySm" className="text-gray-500 mt-0.5">
                  {t("connect.callDescription")}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Chat Option */}
            <Pressable
              onPress={handleChat}
              className="flex-row items-center bg-emerald-50 p-4 rounded-2xl mb-3 active:bg-emerald-100"
            >
              <View className="w-12 h-12 rounded-full bg-emerald-500 items-center justify-center mr-3">
                <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <AppText variant="bodyMd" className="font-bold text-gray-800 text-[15px]">
                  {t("connect.chatWithThem")}
                </AppText>
                <AppText variant="bodySm" className="text-gray-500 mt-0.5">
                  {t("connect.chatDescription")}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {/* Book Appointment Option */}
            <Pressable
              onPress={handleBookAppointment}
              className="flex-row items-center bg-amber-50 p-4 rounded-2xl mb-3 active:bg-amber-100"
            >
              <View className="w-12 h-12 rounded-full bg-amber-500 items-center justify-center mr-3">
                <Ionicons name="calendar" size={24} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <AppText variant="bodyMd" className="font-bold text-gray-800 text-[15px]">
                  {t("connect.bookAppointment")}
                </AppText>
                <AppText variant="bodySm" className="text-gray-500 mt-0.5">
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
