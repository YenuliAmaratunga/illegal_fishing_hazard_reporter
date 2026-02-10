import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { useNavigation } from "@react-navigation/native";

const AUTH_BASE =
  "https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/registration-service/v1.0";

export default function TripRegistrationScreen() {
  const navigation = useNavigation();

  const [token, setToken] = useState(null);
  const [fishermanId, setFishermanId] = useState("");
  const [boats, setBoats] = useState([]);
  const [selectedBoat, setSelectedBoat] = useState("");
  const [numberOfFisherman, setNumberOfFisherman] = useState("");
  const [status, setStatus] = useState(false);
  const [members, setMembers] = useState([]);
  const [location, setLocation] = useState({
    latitude: 7.256,
    longitude: 79.835,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [heading, setHeading] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch auth data and current location
  useEffect(() => {
    const init = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem("authData");
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          setFishermanId(parsed.userId);
          setToken(parsed.token);
        } else {
          Alert.alert("Login Error", "Please log in again.");
        }
      } catch (err) {
        console.log("Error reading authData:", err);
      }

      await getCurrentLocation();
    };

    init();
  }, []);

  // Magnetometer subscription
  useEffect(() => {
    let subscription;
    let lastAngle = null;

    const startMagnetometer = () => {
      subscription = Magnetometer.addListener(({ x, y }) => {
        if (typeof x === "number" && typeof y === "number") {
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          if (lastAngle === null || Math.abs(angle - lastAngle) > 2) {
            setHeading(angle);
            lastAngle = angle;
          }
        }
      });
      Magnetometer.setUpdateInterval(300);
    };

    startMagnetometer();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  // Fetch boats after fishermanId is set
  useEffect(() => {
    const getBoats = async () => {
      if (!fishermanId) return;
      try {
        const response = await axios.get(
          `${AUTH_BASE}/api/Boat/viewBoatRegRequestsMade/${fishermanId}`
        );
        setBoats(response.data);
      } catch (error) {
        console.error("Error fetching boats:", error);
      }
    };

    getBoats();
  }, [fishermanId]);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setLocation((prev) => ({
        ...prev,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      }));
    } catch (err) {
      console.log("Error fetching location:", err);
    }
  };

  // Check boat capacity
  const checkCapacity = (text) => {
    setNumberOfFisherman(text);

    const num = parseInt(text);
    if (isNaN(num)) {
      setStatus(false);
      setMembers([]);
      return;
    }

    const selectedBoatData = boats.find(
      (b) => String(b._id) === String(selectedBoat)
    );
    if (!selectedBoatData) {
      setStatus(false);
      setMembers([]);
      return;
    }

    if (num > selectedBoatData.capacity) {
      Alert.alert("Maximum Capacity Has Been Exceeded");
      setStatus(false);
      setMembers([]);
    } else {
      setStatus(true);
      setMembers(Array(num).fill(""));
    }
  };

  const handleMemberChange = (text, index) => {
    const updated = [...members];
    updated[index] = text;
    setMembers(updated);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedBoat) {
        Alert.alert("Please select a boat");
        return;
      }

      if (!numberOfFisherman || members.some((m) => m === "")) {
        Alert.alert("Please fill all member IDs");
        return;
      }

      if (!token) {
        Alert.alert("Error", "Token not found. Please log in again.");
        return;
      }

      setLoading(true);

      const data = {
        boat: selectedBoat,
        numberOfParticipants: parseInt(numberOfFisherman),
        participantIds: members,
        startingLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        heading: heading,
      };

      const response = await axios.post(
        `${AUTH_BASE}/api/Trip/registerTrip`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        Alert.alert("Success", "Trip registered successfully!", [
          {
            text: "OK",
            onPress: () =>
              navigation.replace("Fisherman", {
                language: "en",
                token: token,
                userId: fishermanId,
              }),
          },
        ]);
        setSelectedBoat("");
        setNumberOfFisherman("");
        setMembers([]);
        setStatus(false);
        setHeading(0);
        await getCurrentLocation();
      }
    } catch (error) {
      console.log("Error submitting trip:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 15,
        backgroundColor: "#F7F7F7",
        paddingTop: 50,
      }}
    >
      {/* ---------- TRIP DETAILS CARD ---------- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trip Details</Text>

        <Text style={styles.label}>Select Boat</Text>
        <Picker
          selectedValue={selectedBoat}
          onValueChange={(val) => setSelectedBoat(val)}
        >
          <Picker.Item label="-- Select a Boat --" value="" />
          {boats.map((boat) => (
            <Picker.Item key={boat._id} label={boat.boatName} value={boat._id} />
          ))}
        </Picker>

        <Text style={styles.label}>Number of Fishermen</Text>
        <TextInput
          value={numberOfFisherman}
          onChangeText={checkCapacity}
          placeholder="Enter Number of Fishermen"
          keyboardType="numeric"
          style={styles.input}
        />

        {status &&
          members.map((member, index) => (
            <View key={index} style={{ marginTop: 10 }}>
              <Text style={styles.label}>Fisherman {index + 1} ID</Text>
              <TextInput
                value={member}
                onChangeText={(text) => handleMemberChange(text, index)}
                placeholder={`Enter ID for Fisherman ${index + 1}`}
                style={styles.input}
              />
            </View>
          ))}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
          <Text style={styles.buttonText}>
            {loading ? "Registering..." : "Register Trip"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------- MAP + COMPASS CARD ---------- */}
      <View style={styles.card}>
        <Text style={styles.cardSubtitle}>Current Location</Text>

        <MapView
          style={styles.map}
          region={location}
        >
          <Marker
            coordinate={location}
            draggable
            onDragEnd={(e) =>
              setLocation((prev) => ({
                ...prev,
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
              }))
            }
          />
        </MapView>

        <Text style={styles.cardSubtitle}>Compass & Heading</Text>
        <View style={styles.compassContainer}>
          <Image
            source={require("../assets/arrow.png")}
            style={[styles.compassImage, { transform: [{ rotate: `${heading}deg` }] }]}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headingText}>
          {heading ? `${heading.toFixed(0)}° N` : "No Heading"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  cardSubtitle: { fontWeight: "bold", fontSize: 15, marginBottom: 10, textAlign: "center", color: "#1F2937" },
  label: { fontWeight: "500", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8, marginTop: 5 },
  button: { backgroundColor: "#6366F1", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 20, flexDirection: "row", justifyContent: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  map: { height: 200, borderRadius: 8, marginBottom: 15 },
  compassContainer: { width: 200, height: 200, alignSelf: "center", justifyContent: "center", alignItems: "center" },
  compassImage: { width: 200, height: 200 },
  headingText: { textAlign: "center", fontWeight: "bold", fontSize: 20 },
});
