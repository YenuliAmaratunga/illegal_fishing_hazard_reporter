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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { gpsPost } from "../api/client";

export default function ReportHazardScreen() {
  const [hazardType, setHazardType] = useState(""); 
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium"); 
  const [evidence, setEvidence] = useState([]); // array of image URIs
  const [location, setLocation] = useState(null); // { latitude, longitude }

  // ---- take photo -> push into evidence[] ----
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert(
        "Permission required",
        "Need camera permission to take photos"
      );
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      setEvidence((prev) => [...prev, result.assets[0].uri]);
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

  // ---- submit to backend (payload matches Mongoose schema) ----
  const submitReport = async () => {
    if (!hazardType || !description) {
      return Alert.alert("Error", "Please fill in all required fields");
    }
    if (!location) {
      return Alert.alert(
        "Location needed",
        "Please capture your current location"
      );
    }
    try {
      const payload = {
        reporterId: "BOAT_TEMP_001",
        hazardType, // enum: 'debris' | 'oil spill' | 'weather' | 'navigation hazard' | 'other'
        description,
        location, // { latitude, longitude }
        severity, // enum
        evidence: {
          imageUrl: evidence, // ✅ arrays per your schema
          videoUrl: [],
        },
      };
      const res = await gpsPost("/api/reports/hazard-reports", payload);
      console.log("📤 hazard submit:", res);
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
    }
  };

  // ---- enum-safe hazard choices (MUST match strings in your model) ----
  const HAZARD_OPTIONS = [
    { key: "debris", label: "Debris" },
    { key: "oil spill", label: "Oil Spill" },
    { key: "weather", label: "Weather" },
    { key: "navigation hazard", label: "Navigation" },
    { key: "other", label: "Other" },
  ];

  return (
    <SafeAreaView
    className="flex-1 bg-white"
    style={{ paddingTop: 6 }}  // tweak this number (try 6–10)
  >
    <ScrollView
      className="flex-1 px-4"
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >

        {/* Title */}
        <Text className="text-2xl font-bold text-blue text-center mb-6">
          ⚠️ Report Hazard
        </Text>

        {/* Hazard Type (enum-safe buttons) */}
        <View className="mb-4">
          <Text className="text-blue text-lg mb-2">Hazard Type *</Text>
          <View className="flex-row flex-wrap gap-2">
            {HAZARD_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                className={`px-4 py-2 rounded-full border ${
                  hazardType === opt.key
                    ? "bg-blueLight border-blueLight"
                    : "bg-white border-blueLight"
                }`}
                onPress={() => setHazardType(opt.key)}
              >
                <Text
                  className={`font-semibold ${
                    hazardType === opt.key ? "text-white" : "text-blue"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-blue text-lg mb-2">Description *</Text>
          <TextInput
            className="bg-white border border-blueLight rounded-2xl p-4 text-blue h-32"
            placeholder="Describe the hazard and its location..."
            placeholderTextColor="#6E8CFB99"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Severity */}
        <View className="mb-4">
          <Text className="text-blue text-lg mb-2">Severity</Text>
          <View className="flex-row justify-between">
            {["low", "medium", "high", "critical"].map((level) => (
              <TouchableOpacity
                key={level}
                className={`px-4 py-2 rounded-full border ${
                  severity === level
                    ? "bg-blueLight border-blueLight"
                    : "bg-white border-blueLight"
                }`}
                onPress={() => setSeverity(level)}
              >
                <Text
                  className={`capitalize font-semibold ${
                    severity === level ? "text-white" : "text-blue"
                  }`}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Evidence Photos */}
        <View className="mb-4">
          <Text className="text-blue text-lg mb-2">
            Evidence Photos {evidence.length > 0 ? `(${evidence.length})` : ""}
          </Text>

          {/* Thumbnails */}
          {evidence.length > 0 && (
            <View className="flex-row flex-wrap mb-4">
              {evidence.map((uri, index) => (
                <View key={index} className="relative mr-2 mb-2">
                  <Image source={{ uri }} className="w-20 h-20 rounded-lg" />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                    onPress={() => removePhoto(index)}
                  >
                    <Text className="text-white font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Take Photo */}
          <TouchableOpacity
            className="bg-white border border-blueLight rounded-2xl p-4 items-center"
            onPress={takePhoto}
          >
            <Text className="text-blue text-lg">
              📷{" "}
              {evidence.length > 0
                ? "Add Another Photo"
                : "Take Photo Evidence"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View className="mb-6">
          <Text className="text-blue text-lg mb-2">Location</Text>
          <TouchableOpacity
            className="bg-white border border-blueLight rounded-2xl p-4 items-center"
            onPress={getCurrentLocation}
          >
            <Text className="text-blue text-lg">
              📍 Capture Current Location
            </Text>
          </TouchableOpacity>
          {location && (
            <Text className="text-blue mt-2">
              Location: {location.latitude.toFixed(4)},{" "}
              {location.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          className="bg-blue rounded-2xl p-4 items-center shadow"
          onPress={submitReport}
        >
          <Text className="text-white text-xl font-bold">
            Submit Report{" "}
            {evidence.length > 0 ? `(${evidence.length} photos)` : ""}
          </Text>
        </TouchableOpacity>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
