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
import { gpsPost } from "../api/client";
import { GPS_BASE } from "../api/config"; // ✅ so we can log the exact URL

export default function ReportViolationScreen() {
  // ---- form state ----
  const [violationType, setViolationType] = useState(""); // choose from chips
  const [description, setDescription]   = useState("");
  const [evidence, setEvidence]         = useState([]);   // image URIs
  const [location, setLocation]         = useState(null); // { latitude, longitude }
  const [submitting, setSubmitting]     = useState(false);

  // quick chips (free text not needed now)
  const VIOLATION_OPTIONS = [
    "Fishing in restricted zone",
    "Illegal/ghost nets",
    "Dynamite fishing",
    "No license / expired",
    "Exceeding catch limits",
    "Other",
  ];

  // 🔎 one-time health check + show the exact endpoint we’ll call
  useEffect(() => {
    const check = async () => {
      try {
        const url = `${GPS_BASE}/health`;
        console.log("[VIOLATION HEALTH URL]", url);
        const res = await fetch(url, { method: "GET" });
        const txt = await res.text();
        console.log("[VIOLATION HEALTH RES]", txt);
      } catch (e) {
        console.log("[VIOLATION HEALTH ERROR]", e?.message);
      }
      console.log(
        "[VIOLATION POST URL]",
        `${GPS_BASE}/api/reports/violation-reports`
      );
    };
    check();
  }, []);

  // camera
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
    if (!result.canceled) setEvidence((prev) => [...prev, result.assets[0].uri]);
  };

  const removePhoto = (indexToRemove) => {
    setEvidence((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // GPS (optional)
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

  // submit
  const submitReport = async () => {
    if (!violationType) return Alert.alert("Violation Type", "Please select a violation");
    if (!description)  return Alert.alert("Description", "Please add a short description");

    try {
      setSubmitting(true);

      const payload = {
        reporterId: "BOAT_TEMP_001",
        boatId:     "BOAT_TEMP_001",
        violationType,
        description,
        location: location || undefined,
        evidence: { imageUrl: evidence, videoUrl: [] }, // arrays ✅ model-ready
      };

      // log payload + URL for quick debugging
      const url = "/api/reports/violation-reports";
      console.log("[POST] ", `${GPS_BASE}${url}`, payload);

      const res = await gpsPost(url, payload); // uses baseURL = GPS_BASE
      console.log("📤 violation submit response:", res);

      // Choreo timeout case: surface more info
      if (res?.code === "102504" || res?.message?.includes("timeout")) {
        Alert.alert(
          "Network timeout",
          "The gateway timed out talking to the backend.\n\nCheck:\n• GPS_BASE points to gps-reporting-service (not police)\n• Path is /api/reports/violation-reports\n• Service is up (health shows OK)"
        );
      } else {
        Alert.alert("Success", "Violation report submitted!");
        setViolationType("");
        setDescription("");
        setEvidence([]);
        setLocation(null);
      }
    } catch (error) {
      console.log("❌ Violation submit error:", error?.message, error?.response?.data);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit report";
      Alert.alert("Error", msg);
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
          🚨 Report Illegal Fishing
        </Text>

        {/* Violation Type */}
        <View className="mt-4">
          <Text className="text-blue text-[17px] font-extrabold tracking-wide mb-2">
            Violation Type <Text className="text-red-600">*</Text>
          </Text>
          <Text className="text-blue mb-3">
            Choose one option that best matches the incident.
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
          <Text className="text-blue mb-3">
            Add details (boat color/marks, gear used, time).
          </Text>
          <TextInput
            className="bg-white border border-blueLight rounded-2xl p-4 text-blue"
            style={{ minHeight: 120 }}
            placeholder="Describe what you witnessed…"
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
          <Text className="text-blue mb-3">Photos help verification.</Text>

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
          >
            <Text className="text-blue text-base font-semibold">
              📷 {evidence.length > 0 ? "Add Another Photo" : "Take Photo Evidence"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location (optional) */}
        <View className="mt-6">
          <Text className="text-blue text-[17px] font-extrabold tracking-wide mb-2">
            Location
          </Text>
          <Text className="text-blue mb-3">Capture where the incident happened.</Text>
          <TouchableOpacity
            className="bg-white border border-blueLight rounded-2xl p-4 items-center"
            onPress={getCurrentLocation}
          >
            <Text className="text-blue text-base font-semibold">📍 Capture Current Location</Text>
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
            className="bg-blue rounded-2xl p-4 items-center shadow opacity-100"
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
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
