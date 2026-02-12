// frontend/src/screens/ReportViolationScreen.js
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRoute, useNavigation } from "@react-navigation/native";

import { gpsPost, gpsPut } from "../api/client";
import { GPS_BASE } from "../api/config";
import { uploadToCloudinary } from "../utils/uploadImage";

export default function ReportViolationScreen() {
  // create vs edit
  const route = useRoute();
  const navigation = useNavigation();
  const mode = route.params?.mode || "create";
  const existing = route.params?.report || null;

  // form state
  const [violationType, setViolationType] = useState(existing?.violationType || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [evidence, setEvidence] = useState(existing?.evidence?.imageUrl || []); // array of URLs
  const [location, setLocation] = useState(existing?.location || null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const VIOLATION_OPTIONS = [
    "Fishing in restricted zone",
    "Illegal/ghost nets",
    "Dynamite fishing",
    "No license / expired",
    "Exceeding catch limits",
    "Other",
  ];

  // (Optional) quick log to confirm endpoint
  useEffect(() => {
    console.log("[POST URL]", `${GPS_BASE}/api/reports/violation-reports`);
    if (mode === "edit") {
      console.log("[PUT URL]", `${GPS_BASE}/api/reports/violation-reports/${existing?._id}`);
    }
  }, [mode, existing]);

  // Camera → upload → add URL
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert("Permission required", "Need camera permission to take photos");
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      aspect: [4, 3],
    });
    if (result.canceled) return;

    try {
      setUploading(true);
      // ⬇️ Upload to Cloudinary; returns an https URL
      const url = await uploadToCloudinary(result.assets[0].uri);
      setEvidence((prev) => [...prev, url]);
    } catch (e) {
      console.log("Upload error:", e?.message);
      Alert.alert("Upload failed", e?.message || "Could not upload image");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (indexToRemove) => {
    setEvidence((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert("Permission denied", "Location access is required");
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      Alert.alert("Location", "Current location captured");
    } catch {
      Alert.alert("Error", "Failed to get location");
    }
  };

  const submitReport = async () => {
    if (!violationType) return Alert.alert("Violation Type", "Please select a violation");
    if (!description) return Alert.alert("Description", "Please add a short description");

    const payload = {
      reporterId: "BOAT_TEMP_001",
      boatId: "BOAT_TEMP_001",
      violationType,
      description,
      location: location || undefined,
      evidence: { imageUrl: evidence, videoUrl: [] },
    };

    try {
      setSubmitting(true);

      if (mode === "edit" && existing?._id) {
        // ✅ EDIT
        const res = await gpsPut(`/api/reports/violation-reports/${existing._id}`, payload);
        if (res?.error || res?.message?.toLowerCase?.().includes("error")) {
          throw new Error(res?.message || "Update failed");
        }
        Alert.alert("Updated", "Violation report updated");
        navigation.goBack();
      } else {
        // ✅ CREATE
        const res = await gpsPost(`/api/reports/violation-reports`, payload);
        if (res?.code === "102504" || res?.message?.includes?.("timeout")) {
          Alert.alert(
            "Network timeout",
            "The gateway timed out talking to the backend.\n\nCheck base URL and service status."
          );
          return;
        }
        Alert.alert("Success", "Violation report submitted!");
        // reset
        setViolationType("");
        setDescription("");
        setEvidence([]);
        setLocation(null);
      }
    } catch (error) {
      console.log("Violation submit error:", error?.message);
      Alert.alert("Error", error?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: 6 }}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text className="text-xl font-extrabold text-blue text-center mb-4">
          {mode === "edit" ? "Edit Violation" : "🚨 Report Illegal Fishing"}
        </Text>

        {/* Violation Type */}
        <View className="mt-4">
          <Text className="text-blue text-[17px] font-extrabold tracking-wide mb-2">
            Violation Type <Text className="text-red-600">*</Text>
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-1">
            {VIOLATION_OPTIONS.map((label) => {
              const active = violationType === label;
              return (
                <TouchableOpacity
                  key={label}
                  className={`px-4 py-2 rounded-full border ${
                    active ? "bg-blueLight border-blueLight" : "bg-white border-blueLight"
                  }`}
                  onPress={() => setViolationType(label)}
                >
                  <Text className={`font-semibold ${active ? "text-white" : "text-blue"}`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View className="mt-6">
          <Text className="text-blue text-[17px] font-extrabold tracking-wide mb-2">
            Description <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            className="bg-white border border-blueLight rounded-2xl p-4 text-blue"
            style={{ minHeight: 120 }}
            placeholder="Describe what you witnessed (boat marks, gear, behavior, time)…"
            placeholderTextColor="#6E8CFB99"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Evidence Photos */}
        <View className="mt-6">
          <Text className="text-blue text-[17px] font-extrabold tracking-wide mb-2">
            Evidence Photos {evidence.length > 0 ? `(${evidence.length})` : ""}
          </Text>

          {evidence.length > 0 && (
            <View className="flex-row flex-wrap mb-3">
              {evidence.map((uri, index) => (
                <View key={index} className="relative mr-2 mb-2">
                  <Image source={{ uri }} className="w-20 h-20 rounded-lg" />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 items-center justify-center"
                    onPress={() => removePhoto(index)}
                  >
                    <Text className="text-white font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            className="bg-white border border-blueLight rounded-2xl p-4 items-center"
            onPress={takePhoto}
            disabled={uploading}
          >
            <Text className="text-blue text-base font-semibold">
              📷 {uploading ? "Uploading…" : evidence.length > 0 ? "Add another photo" : "Take photo evidence"}
            </Text>
          </TouchableOpacity>

          {/* ✅ Your “uploading” indicator lives right here */}
          {uploading && <Text className="text-blue mt-2">Uploading photo…</Text>}
        </View>

        {/* Location */}
        <View className="mt-6">
          <Text className="text-blue text-[17px] font-extrabold tracking-wide mb-2">Location</Text>
          <TouchableOpacity
            className="bg-white border border-blueLight rounded-2xl p-4 items-center"
            onPress={getCurrentLocation}
          >
            <Text className="text-blue text-base font-semibold">📍 Capture current location</Text>
          </TouchableOpacity>
          {location && (
            <Text className="text-blue mt-2">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Submit */}
        <View className="mt-8">
          <TouchableOpacity
            className="bg-blue rounded-2xl p-4 items-center shadow"
            onPress={submitReport}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-xl font-bold">
                {mode === "edit" ? "Save Changes" : "Submit Report"}
                {mode !== "edit" && evidence.length > 0 ? ` (${evidence.length} photos)` : ""}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
