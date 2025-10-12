import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
const AUTH_BASE =
  "https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/registration-service/v1.0";

export default function RegisterBoatScreen() {
  const navigation = useNavigation();
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [boatName, setBoatName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [boatType, setBoatType] = useState("");
  const [length, setLength] = useState("");
  const [capacity, setCapacity] = useState("");
  const [engineType, setEngineType] = useState("");
  const [homePort, setHomePort] = useState("");
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [images, setImages] = useState([]);
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem("authData");
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          setToken(parsed.token);
          setUserId(parsed.userId);
        }
      } catch (err) {
        console.log("Error reading authData", err);
      }
    };
    loadAuthData();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const pickLicense = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setLicense(result.assets[0].uri);
    }
  };

  const removeImage = (uri) => setImages((prev) => prev.filter((img) => img !== uri));

  const handleSubmit = async () => {
    try {
      if (!token || !userId) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("fishermanId", userId);
      formData.append("boatName", boatName);
      formData.append("registrationNumber", registrationNumber);
      formData.append("boatType", boatType);
      formData.append("length", length);
      formData.append("capacity", capacity);
      formData.append("engineType", engineType);
      formData.append("homePort", homePort);
      formData.append("insuranceNumber", insuranceNumber);

      if (license) {
        formData.append("license", {
          uri: license,
          name: "license.jpg",
          type: "image/jpeg",
        });
      }

      images.forEach((imgUri, index) => {
        formData.append("images", {
          uri: imgUri,
          name: `boat-${index}.jpg`,
          type: "image/jpeg",
        });
      });

      await axios.post(`${AUTH_BASE}/api/Boat/registerBoat`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("✅ Success", "Boat registered successfully!", [
        {
          text: "OK",
          onPress: () =>
            navigation.replace("MainTabs"),
        },
      ]);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to register boat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.headerTitle}>🚤 Register Your Boat</Text>

          {/* Card 1 */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Boat Name"
              value={boatName}
              onChangeText={setBoatName}
            />
            <Picker selectedValue={boatType} onValueChange={setBoatType} style={styles.picker}>
              <Picker.Item label="Select Boat Type" value="" />
              <Picker.Item label="Trawler" value="Trawler" />
              <Picker.Item label="Longliner" value="Longliner" />
              <Picker.Item label="Gillnetter" value="Gillnetter" />
            </Picker>
            <Picker selectedValue={engineType} onValueChange={setEngineType} style={styles.picker}>
              <Picker.Item label="Select Engine Type" value="" />
              <Picker.Item label="Diesel" value="Diesel" />
              <Picker.Item label="Petrol" value="Petrol" />
              <Picker.Item label="Outboard" value="Outboard" />
            </Picker>
            <Picker selectedValue={homePort} onValueChange={setHomePort} style={styles.picker}>
              <Picker.Item label="Select Home Port" value="" />
              <Picker.Item label="Colombo" value="Colombo" />
              <Picker.Item label="Galle" value="Galle" />
              <Picker.Item label="Trincomalee" value="Trincomalee" />
            </Picker>
          </View>

          {/* Card 2 */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Registration & Specs</Text>
            <TextInput
              style={styles.input}
              placeholder="Registration Number"
              value={registrationNumber}
              onChangeText={setRegistrationNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Length (ft)"
              value={length}
              onChangeText={setLength}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Capacity (persons)"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Insurance Policy Number"
              value={insuranceNumber}
              onChangeText={setInsuranceNumber}
            />
          </View>

          {/* Card 3 */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Images</Text>

            <View style={styles.buttonRow}>
              <Pressable style={styles.uploadBtn} onPress={pickImage}>
                <Text style={styles.uploadText}>📁 From Gallery</Text>
              </Pressable>
              <Pressable style={styles.uploadBtn} onPress={takePhoto}>
                <Text style={styles.uploadText}>📷 Take Photo</Text>
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {images.map((uri, i) => (
                <View key={i} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <Pressable style={styles.removeBtn} onPress={() => removeImage(uri)}>
                    <Text style={{ color: "white" }}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>License Image</Text>
            <Pressable style={styles.uploadBtn} onPress={pickLicense}>
              <Text style={styles.uploadText}>📄 Upload License</Text>
            </Pressable>
             {license ? (
  <View style={[styles.imageWrapper, { marginTop: 10 }]}>
    <Image source={{ uri: license }} style={[styles.image, { width: 300, height: 160 }]} />
    <Pressable
      style={[styles.removeBtn, { top: -4, right: -4 }]}
      onPress={() => setLicense(null)}
    >
      <Text style={{ color: "white", fontWeight: "700" }}>✕</Text>
    </Pressable>
  </View>
) : null}
          </View>

          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8} style={{ marginTop: 20 }}>
            <LinearGradient colors={["#2563EB", "#1E3A8A"]} style={styles.submitBtn}>
              <Text style={styles.submitText}>Register Boat</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading && (
        <Modal transparent animationType="fade">
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Submitting...</Text>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 15,
    color: "#111827",
  },
  picker: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    marginBottom: 10,
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: "#E0E7FF",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  uploadText: {
    color: "#1E3A8A",
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  imageWrapper: { position: "relative", marginRight: 10 },
  image: { width: 120, height: 120, borderRadius: 10 },
  removeBtn: {
    position: "absolute",
    top: -1,
    right: -1,
    backgroundColor: "#EF4444",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 15,
  },
  submitText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { color: "#fff", marginTop: 10, fontSize: 16 },
});
