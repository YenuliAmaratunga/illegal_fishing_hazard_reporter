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
      const res = await axios.post("http://localhost:8080/api/User/login", {
        phone,
        password,
        role,
      });

      if (res.data.success) {
        Alert.alert("Success", "Login successful");
        console.log(res.data.message);
        
      } else {
        Alert.alert("Error", res.data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View>
      <Text>{translations[language].phoneEntry}</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder={translations[language].phoneEntry}
      />

      <Text>{translations[language].passwordEntry}</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder={translations[language].passwordEntry}
      />

      <TouchableOpacity onPress={handleSubmit}>
        <Text>{translations[language].login}</Text>
      </TouchableOpacity>
    </View>
  );
}
