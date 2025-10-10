// frontend/src/screens/ReportHazardScreen.js
import React, { useState } from "react";
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
import { uploadToCloudinary } from "../utils/uploadImage";
import { gpsPost } from "../api/client";

export default function ReportHazardScreen() {
  // ---- form state ----
  const [hazardType, setHazardType] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [evidence, setEvidence] = useState([]);      // array of Cloudinary HTTPS URLs
  const [location, setLocation] = useState(null);    // { latitude, longitude }
  const [uploading, setUploading] = useState(false); // camera->cloud upload
  const [submitting, setSubmitting] = useState(false);

  // ---- capture photo, upload to Cloudinary, push URL into evidence[] ----
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
      const httpsUrl = await uploadToCloudinary(result.assets[0].uri); // <-- returns secure_url
      setEvidence((prev) => [...prev, httpsUrl]);
    } catch (e) {
      console.log("Cloudinary upload error:", e?.message);
      Alert.alert("Upload failed", e?.message || "Could not upload image");
    } finally {
      setUploading(false);
    }
  };

  // ---- remove a photo by index ----
  const removePhoto = (indexToRemove) => {
    setEvidence((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // ---- capture current GPS coordinates ----
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert("Permission denied", "Location access is required");
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      Alert.alert("Location", "Current location captured");
    } catch (e) {
      Alert.alert("Error", "Failed to get location");
    }
  };

  // ---- submit to backend (payload matches your schema) ----
  const submitReport = async () => {
    if (!hazardType || !description) {
      return Alert.alert("Error", "Please fill in all required fields");
    }
    if (!location) {
      return Alert.alert("Location needed", "Please capture your current location");
    }

    const payload = {
      reporterId: "BOAT_TEMP_001",
      hazardType,       // 'debris' | 'oil spill' | 'weather' | 'navigation hazard' | 'other'
      description,
      location,         // { latitude, longitude }
      severity,         // 'low' | 'medium' | 'high' | 'critical'
      evidence: {
        imageUrl: evidence, // ✅ now HTTPS URLs from Cloudinary
        videoUrl: [],
      },
    };

    try {
      setSubmitting(true);
      const res = await gpsPost("/api/reports/hazard-reports", payload);
      // If your gateway times out, surface a clearer hint
      if (res?.code === "102504" || res?.message?.includes?.("timeout")) {
        Alert.alert(
          "Network timeout",
          "The gateway timed out talking to the backend.\n\nMake sure your gps-reporting-service is running and the base URL is correct."
        );
        return;
      }

      Alert.alert("Success", "Hazard report submitted!");
      // reset form
      setHazardType("");
      setDescription("");
      setSeverity("medium");
      setEvidence([]);
      setLocation(null);
    } catch (error) {
      console.log("❌ Hazard submit error:", error?.message);
      Alert.alert("Error", "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- options (must match strings your BE accepts) ----
  const HAZARD_OPTIONS = [
    { key: "debris", label: "Debris" },
    { key: "oil spill", label: "Oil Spill" },
    { key: "weather", label: "Weather" },
    { key: "navigation hazard", label: "Navigation" },
    { key: "other", label: "Other" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: 6 }}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text className="text-2xl font-bold text-blue text-center mb-6">⚠️ Report Hazard</Text>

        {/* Hazard Type */}
        <View className="mb-5">
          <Text className="text-blue text-lg font-extrabold mb-2">
            Hazard Type <Text className="text-red-600">*</Text>
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {HAZARD_OPTIONS.map((opt) => {
              const active = hazardType === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  className={`px-4 py-2 rounded-full border ${
                    active ? "bg-blueLight border-blueLight" : "bg-white border-blueLight"
                  }`}
                  onPress={() => setHazardType(opt.key)}
                >
                  <Text className={`font-semibold ${active ? "text-white" : "text-blue"}`}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View className="mb-5">
          <Text className="text-blue text-lg font-extrabold mb-2">
            Description <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            className="bg-white border border-blueLight rounded-2xl p-4 text-blue"
            style={{ minHeight: 120 }}
            placeholder="Describe the hazard and its location..."
            placeholderTextColor="#6E8CFB99"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Severity */}
        <View className="mb-5">
          <Text className="text-blue text-lg font-extrabold mb-2">Severity</Text>
          <View className="flex-row justify-between">
            {["low", "medium", "high", "critical"].map((level) => {
              const active = severity === level;
              return (
                <TouchableOpacity
                  key={level}
                  className={`px-4 py-2 rounded-full border ${
                    active ? "bg-blueLight border-blueLight" : "bg-white border-blueLight"
                  }`}
                  onPress={() => setSeverity(level)}
                >
                  <Text className={`capitalize font-semibold ${active ? "text-white" : "text-blue"}`}>
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Evidence Photos */}
        <View className="mb-5">
          <Text className="text-blue text-lg font-extrabold mb-2">
            Evidence Photos {evidence.length > 0 ? `(${evidence.length})` : ""}
          </Text>

          {evidence.length > 0 && (
            <View className="flex-row flex-wrap mb-3">
              {evidence.map((url, index) => (
                <View key={index} className="relative mr-2 mb-2">
                  <Image source={{ uri: url }} className="w-20 h-20 rounded-lg" />
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
            {uploading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" />
                <Text className="text-blue text-base font-semibold ml-2">Uploading…</Text>
              </View>
            ) : (
              <Text className="text-blue text-lg">
                📷 {evidence.length > 0 ? "Add Another Photo" : "Take Photo Evidence"}
              </Text>
            )}
          </TouchableOpacity>

          {/* ← This is where you asked to show the uploading text */}
          {/* {uploading && <Text className="text-blue mt-2">Uploading photo…</Text>} */}
        </View>

        {/* Location */}
        <View className="mb-6">
          <Text className="text-blue text-lg font-extrabold mb-2">Location</Text>
          <TouchableOpacity
            className="bg-white border border-blueLight rounded-2xl p-4 items-center"
            onPress={getCurrentLocation}
          >
            <Text className="text-blue text-lg">📍 Capture Current Location</Text>
          </TouchableOpacity>
          {location && (
            <Text className="text-blue mt-2">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          className="bg-blue rounded-2xl p-4 items-center shadow"
          onPress={submitReport}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-xl font-bold">
              Submit Report {evidence.length > 0 ? `(${evidence.length} photos)` : ""}
            </Text>
          )}
        </TouchableOpacity>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
