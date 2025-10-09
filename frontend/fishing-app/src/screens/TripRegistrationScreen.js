import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function TripRegistrationScreen() {
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
        Alert.alert("Success", "Trip registered successfully!");
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
    <ScrollView contentContainerStyle={{ padding: 15 }}>
      <Text style={{ fontWeight: "bold" }}>Select the Boat Name:</Text>
      <Picker
        selectedValue={selectedBoat}
        onValueChange={(val) => {
          setSelectedBoat(val);
          setStatus(false);
          setMembers([]);
        }}
      >
        <Picker.Item label="-- Select a Boat --" value="" />
        {boats.map((boat) => (
          <Picker.Item key={boat._id} label={boat.boatName} value={boat._id} />
        ))}
      </Picker>

      <Text style={{ marginTop: 10, fontWeight: "bold" }}>
        Enter The Number Of Fishermen:
      </Text>
      <TextInput
        value={numberOfFisherman}
        onChangeText={checkCapacity}
        placeholder="Enter Number Of Fishermen"
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
            <Text>Enter Member ID {index + 1}:</Text>
            <TextInput
              value={member}
              onChangeText={(text) => handleMemberChange(text, index)}
              placeholder={`Member ID ${index + 1}`}
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

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Select Location:</Text>
      <MapView
        style={{ height: 300, marginTop: 10 }}
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

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Select Heading Direction:</Text>
      <Picker selectedValue={heading} onValueChange={(val) => setHeading(val)}>
        <Picker.Item label="North (0°)" value={0} />
        <Picker.Item label="Northeast (45°)" value={45} />
        <Picker.Item label="East (90°)" value={90} />
        <Picker.Item label="Southeast (135°)" value={135} />
        <Picker.Item label="South (180°)" value={180} />
        <Picker.Item label="Southwest (225°)" value={225} />
        <Picker.Item label="West (270°)" value={270} />
        <Picker.Item label="Northwest (315°)" value={315} />
      </Picker>
      <Text>Current Heading: {heading.toFixed(0)}°</Text>

      <TouchableOpacity
        style={{
          backgroundColor: "#007bff",
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
          marginTop: 25,
          flexDirection: "row",
          justifyContent: "center",
        }}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {loading ? "Submitting..." : "Request Trip"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
