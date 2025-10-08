import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Image,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  ActivityIndicator
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterBoatScreen() {
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
  const [safetyEquipment, setSafetyEquipment] = useState([]);
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

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow media access.");
      }
    })();
  }, []);

  const toggleEquipment = (item) => {
    if (safetyEquipment.includes(item)) {
      setSafetyEquipment(safetyEquipment.filter((eq) => eq !== item));
    } else {
      setSafetyEquipment([...safetyEquipment, item]);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const pickLicense = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setLicense(result.assets[0].uri);
    }
  };

  const MyCheckbox = ({ label, checked, onPress }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center my-2"
    >
      <View
        className={`w-5 h-5 border mr-3 rounded 
        ${checked ? "bg-blue-700 border-blue-700" : "bg-white border-gray-400"}`}
      />
      <Text className="text-base text-gray-700">{label}</Text>
    </Pressable>
  );

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
      formData.append("safetyEquipment", JSON.stringify(safetyEquipment));

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

      const response = await axios.post(
        "http://192.168.8.121:8080/api/Boat/registerBoat",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", response.data.message);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to register boat");
    }finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="p-5">
          <Text className="text-lg font-semibold text-gray-800">Enter Boat Name</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mt-2 bg-white"
            value={boatName}
            onChangeText={setBoatName}
            placeholder="Boat Name"
          />

          <Text className="text-lg font-semibold text-gray-800 mt-4">Registration Number</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mt-2 bg-white"
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            placeholder="Registration Number"
          />

          <Text className="text-lg font-semibold text-gray-800 mt-4">Boat Type</Text>
          <Picker
            selectedValue={boatType}
            onValueChange={(val) => setBoatType(val)}
            className="bg-white border border-gray-300 rounded-md"
          >
            <Picker.Item label="-- Select Boat Type --" value="" enabled={false} />
            <Picker.Item label="Trawlers" value="Trawlers" />
            <Picker.Item label="Tuna Longliners" value="TunaLongliners" />
            <Picker.Item label="Gillnetters" value="Gillnetters" />
            <Picker.Item label="Deep-Sea Longliners" value="DeepSeaLongliners" />
          </Picker>

          <Text className="text-lg font-semibold text-gray-800 mt-4">Length</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mt-2 bg-white"
            value={length}
            onChangeText={setLength}
            placeholder="Length"
          />

          <Text className="text-lg font-semibold text-gray-800 mt-4">Capacity</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mt-2 bg-white"
            value={capacity}
            onChangeText={setCapacity}
            placeholder="Capacity"
          />

          <Text className="text-lg font-semibold text-gray-800 mt-4">Engine Type</Text>
          <Picker
            selectedValue={engineType}
            onValueChange={(val) => setEngineType(val)}
            className="bg-white border border-gray-300 rounded-md"
          >
            <Picker.Item label="-- Select Engine Type --" value="" enabled={false} />
            <Picker.Item label="Diesel Engine" value="Diesel" />
            <Picker.Item label="Petrol Engine" value="Petrol" />
            <Picker.Item label="Outboard Motor" value="Outboard" />
            <Picker.Item label="Inboard Engine" value="Inboard" />
            <Picker.Item label="Hybrid/Electric Engine" value="Hybrid" />
          </Picker>

          <Text className="text-lg font-semibold text-gray-800 mt-4">Home Port</Text>
          <Picker
            selectedValue={homePort}
            onValueChange={(val) => setHomePort(val)}
            className="bg-white border border-gray-300 rounded-md"
          >
            <Picker.Item label="-- Select Home Port --" value="" enabled={false} />
            <Picker.Item label="Colombo" value="Colombo" />
            <Picker.Item label="Negombo" value="Negombo" />
            <Picker.Item label="Galle" value="Galle" />
            <Picker.Item label="Matara (Dondra)" value="Matara" />
            <Picker.Item label="Mirissa" value="Mirissa" />
            <Picker.Item label="Trincomalee" value="Trincomalee" />
          </Picker>

          <Text className="text-lg font-semibold text-gray-800 mt-4">Insurance Number</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-3 mt-2 bg-white"
            value={insuranceNumber}
            onChangeText={setInsuranceNumber}
            placeholder="Insurance Number"
          />

          <Text className="text-lg font-semibold text-gray-800 mt-4">Safety Equipment</Text>
          {["Life Jackets", "Life Buoys", "Fire Extinguishers", "First Aid Kit", "Flares", "VHF Radio"].map((item) => (
            <MyCheckbox
              key={item}
              label={item}
              checked={safetyEquipment.includes(item)}
              onPress={() => toggleEquipment(item)}
            />
          ))}

          <Text className="text-lg font-semibold text-gray-800 mt-4">Boat Images</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={pickImage}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Choose from Gallery</Text>
            </Pressable>
            <Pressable
              onPress={takePhoto}
              className="bg-green-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Take a Photo</Text>
            </Pressable>
          </View>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} className="w-48 h-48 rounded-lg mt-3" />
          ))}

          <Text className="text-lg font-semibold text-gray-800 mt-4">License Image</Text>
          <Pressable
            onPress={pickLicense}
            className="bg-purple-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Choose License</Text>
          </Pressable>
          {license && <Image source={{ uri: license }} className="w-48 h-48 rounded-lg mt-3" />}

          <View className="my-8">
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-blue-700 py-3 rounded-xl shadow-lg"
            >
              <Text className="text-center text-white font-semibold text-lg">Register Boat</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {loading && (
        <Modal transparent={true} animationType="fade">
          <View className="flex-1 bg-black/50 justify-center items-center">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="text-white mt-4 text-lg">Submitting...</Text>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
