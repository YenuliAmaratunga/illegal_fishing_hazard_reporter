import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TripRegistrationScreen() {
  const [fishermanId, setFishermanId] = useState("");
  const [boats, setBoats] = useState([]);
  const [selectedBoat, setSelectedBoat] = useState("");
  const [numberOfFisherman, setNumberOfFisherman] = useState("");
  const [status, setStatus] = useState(false);
  const [members, setMembers] = useState([]); // array of member IDs
  const [currentLocation,setcurrentLocation] = useState('Kalpitiya');// GPS service integration 
  const [locationHeading,setlocationHeding] = useState('Galle');

  useEffect(() => {
    const getAuthData = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem("authData");
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          setFishermanId(parsed.userId);
        }
      } catch (err) {
        console.log("Error reading authData:", err);
      }
    };
    getAuthData();
  }, []);

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

  const checkCapacity = (text) => {
    setNumberOfFisherman(text);

    const selectedBoatData = boats.find((b) => b._id === selectedBoat);
    if (!selectedBoatData) return;

    const num = parseInt(text);
    if (isNaN(num)) {
      setStatus(false);
      return;
    }

    if (num > selectedBoatData.capacity) {
      Alert.alert("Maximum Capacity Has Been Exceeded");
      setStatus(false);
      setMembers([]);
    } else {
      setStatus(true);
      // Initialize empty array for given number of fishermen
      const newMembers = Array(num).fill("");
      setMembers(newMembers);
    }
  };

  const handleMemberChange = (text, index) => {
    const updated = [...members];
    updated[index] = text;
    setMembers(updated);
  };

  return (
    <View>
      <Text>Select the Boat Name:</Text>

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
          <Picker.Item key={boat._id} label={boat.name} value={boat._id} />
        ))}
      </Picker>

      <Text>Enter The Number Of Fishermen:</Text>
      <TextInput
        value={numberOfFisherman}
        onChangeText={checkCapacity}
        placeholder="Enter Number Of Fishermen"
        keyboardType="numeric"
      />

      {status &&
        members.map((member, index) => (
          <View key={index}>
            <Text>Enter Member ID {index + 1}:</Text>
            <TextInput
              value={member}
              onChangeText={(text) => handleMemberChange(text, index)}
              placeholder={`Member ID ${index + 1}`}
            />
          </View>
        ))}

      {status && members.length > 0 && (
        <Text>Members Array: {JSON.stringify(members)}</Text>
      )}


    </View>
  );
}
