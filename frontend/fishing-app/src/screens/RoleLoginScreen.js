import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const AUTH_BASE =
  "https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/registration-service/v1.0";


export default function RoleLoginScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { language, role } = route.params;


  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // added toggle

  const translations = {
    si: {
      phoneEntry: "ලියාපදිංචි කර ඇති දුරකථන අංකය ඇතුල් කරන්න",
      passwordEntry: "මුරපදය ඇතුල් කරන්න",
      login: "ඇතුල් වන්න",
      show: "පෙන්වන්න",
      hide: "මැවිය යුතුය",
    },
    en: {
      phoneEntry: "Enter registered phone number",
      passwordEntry: "Enter password",
      login: "Login",
      show: "Show",
      hide: "Hide",
    },
    ta: {
      phoneEntry: "பதிவு செய்யப்பட்ட தொலைபேசி எண்ணை உள்ளிடவும்",
      passwordEntry: "கடவுச்சொல்லை உள்ளிடவும்",
      login: "உள்நுழை",
      show: "காண்பி",
      hide: "மறை",
    },
  };

  const handleSubmit = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(`${AUTH_BASE}/api/User/login`, {
        phone,
        password,
        role,
      },{ timeout: 25000 });

      const { token, message, userName ,userId} = res.data;

      if (token) {
        Alert.alert("Success", message || "Login successful");
        await AsyncStorage.setItem(
          "authData",
          JSON.stringify({ token, language, userName,userId })
        );

        if (role === "fisherman") {
          navigation.navigate("MainTabs"); 
        }if (role === "marine") {
          navigation.reset({ index: 0, routes: [{ name: "PoliceDashboard" }] });
        } 
      } else {
        Alert.alert("Error", message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  // { language, token,userId }

  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <View className="w-11/12 bg-white p-6 rounded-2xl shadow-lg">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          {translations[language].phoneEntry}
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder={translations[language].phoneEntry}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />

        <Text className="text-lg font-semibold mb-2 text-gray-700">
          {translations[language].passwordEntry}
        </Text>
        {/* Password field with toggle */}
        <View className="relative mb-6">
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder={translations[language].passwordEntry}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3"
          >
            <Text className="text-blue-600 font-semibold">
              {showPassword ? translations[language].hide : translations[language].show}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-blue-600 py-3 rounded-xl"
        >
          <Text className="text-white text-center font-bold text-lg">
            {translations[language].login}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
