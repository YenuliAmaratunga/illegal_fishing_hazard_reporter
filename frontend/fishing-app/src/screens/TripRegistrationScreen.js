import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import {
  View,
  Text,
  TextInput,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { useNavigation } from "@react-navigation/native";


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
    latitude: 7.256, // fallback
    longitude: 79.835,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [heading, setHeading] = useState(0);
  const [loading, setLoading] = useState(false);

//   const styles = StyleSheet.create({
//   headingText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 10,
//   },
//   compass: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 20,
//   },
// });

  // Fetch auth data and current location
  useEffect(() => {
    const init = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem("authData");
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          setFishermanId(parsed.userId);
          setToken(parsed.token);
        }
      } catch (err) {
        console.log("Error reading authData:", err);
      }

      await getCurrentLocation();
    };

    init();
  }, []);

// Safe magnetometer subscription
useEffect(() => {
  let subscription;
  let lastAngle = null; // keep track of last heading

  const startMagnetometer = async () => {
    try {
      const available = await Magnetometer.isAvailableAsync();
      if (!available) return;

      subscription = Magnetometer.addListener((data) => {
        const { x, y } = data;
        if (typeof x === "number" && typeof y === "number") {
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          if (angle < 0) angle += 360;

          // Only update if change > 2°
          if (lastAngle === null || Math.abs(angle - lastAngle) > 2) {
            setHeading(angle);
            lastAngle = angle;
          }
        }
      });

      Magnetometer.setUpdateInterval(300); // slower interval to reduce noise
    } catch (err) {
      console.log("Magnetometer error:", err);
    }
  };

  startMagnetometer();
  return () => subscription && subscription.remove();
}, []);



  // Fetch boats after fishermanId is set
  useEffect(() => {
    const getBoats = async () => {
      if (!fishermanId) return;
      try {
        const response = await axios.get(
          `http://192.168.8.121:8080/api/Boat/viewBoatRegRequestsMade/${fishermanId}`
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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
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

    const selectedBoatData = boats.find((b) => b._id === selectedBoat);
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

      setLoading(true);

      if (!token) {
  Alert.alert("Error", "Token not found. Please log in again.");
  setLoading(false);
  return;
}

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
        "http://192.168.8.121:8080/api/Trip/registerTrip",
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
          
          language: "en", // set your default or fetch from AsyncStorage
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
      Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 15,
        backgroundColor: "#F7F7F7",
        paddingTop: 50
      }}
    >
      {/* ---------- TRIP DETAILS CARD ---------- */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          marginBottom: 20,
          borderWidth: 2,          // <-- add this
           borderColor: "#E5E7EB",
        }}
      >
        <Text style={{fontFamily: "Poppins-Bold", fontWeight: "bold", fontSize: 18, marginBottom: 20 }}>
          Trip Details
        </Text>

        <Text style={{ fontWeight: "500" }}>Select Boat</Text>
        <Picker
          selectedValue={selectedBoat}
          onValueChange={(val) => {
            setSelectedBoat(val);
          }}
        >
          <Picker.Item label="-- Select a Boat --" value="" />
          {boats.map((boat) => (
            <Picker.Item key={boat._id} label={boat.boatName} value={boat._id} />
          ))}
        </Picker>

        <Text style={{ marginTop: 10, fontWeight: "500" }}>
          Number of Fishermen
        </Text>
        <TextInput
          value={numberOfFisherman}
          onChangeText={checkCapacity}
          placeholder="Enter Number of Fishermen"
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 6,
            padding: 8,
            marginTop: 5,
          }}
        />

        {status &&
          members.map((member, index) => (
            <View key={index} style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: "500" }}>
                Fisherman {index + 1} ID
              </Text>
              <TextInput
                value={member}
                onChangeText={(text) => handleMemberChange(text, index)}
                placeholder={`Enter ID for Fisherman ${index + 1}`}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  padding: 8,
                  marginTop: 5,
                }}
              />
            </View>
          ))}

        <TouchableOpacity
          style={{
            backgroundColor: "#6366F1",
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 20,
          }}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            {loading ? "Registering..." : "Register Trip"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------- MAP + COMPASS CARD ---------- */}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          padding: 15,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          marginBottom: 30,
            borderWidth: 2,         
    borderColor: "#E5E7EB",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 15, marginBottom: 10,textAlign : "center" ,color: "#1F2937" }}>
          Current Location
        </Text>

        <MapView
          style={{
            height: 200,
            borderRadius: 8,
            marginBottom: 15,
          }}
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

        {/* COMPASS */}
        <Text style={{ fontWeight: "bold", fontSize: 15, marginBottom: 10 ,textAlign : "center",color: "#1F2937" }}>
          Compass & Heading
        </Text>

        <View
          style={{
            width: 200,
            height: 200,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../assets/arrow.png")}
            style={{
              width: 200,
              height: 200,
              transform: [{ rotate: `${heading}deg` }],
            }}
            resizeMode="contain"
          />
        </View>

        <Text style={{ textAlign: "center", fontWeight: "bold",fontSize : 20 }}>
          {heading.toFixed(0)}° N
        </Text>
      </View>
    </ScrollView>
  );
}
