import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";

export default function RoleLoginScreen() {
  const route = useRoute();
  const { language, role } = route.params;

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const translations = {
    si: {
      phoneEntry: "ලියාපදිංචි කර ඇති දුරකථන අංකය ඇතුල් කරන්න",
      passwordEntry: "මුරපදය ඇතුල් කරන්න",
      login: "ඇතුල් වන්න",
    },
    en: {
      phoneEntry: "Enter registered phone number",
      passwordEntry: "Enter password",
      login: "Login",
    },
    ta: {
      phoneEntry: "பதிவு செய்யப்பட்ட தொலைபேசி எண்ணை உள்ளிடவும்",
      passwordEntry: "கடவுச்சொல்லை உள்ளிடவும்",
      login: "உள்நுழை",
    },
  };

  const handleSubmit = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const res = await axios.post("http://192.168.8.121:8080/api/User/login", {
        phone,
        password,
        role,
      });

    console.log("Full response:", res.data);

  const { token, message } = res.data;

  if (token) {
    Alert.alert("Success", message || "Login successful");
    console.log("JWT Token:", token);
  } else {
    Alert.alert("Error", message || "Login failed");
  }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  
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
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder={translations[language].passwordEntry}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-6"
        />

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
