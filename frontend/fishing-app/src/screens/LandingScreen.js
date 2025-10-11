import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function LandingScreen({ navigation }) {
  const [language, setLanguage] = useState("en");

  const labels = {
    en: { register: "Register", login: "Login" },
    si: { register: "ලියාපදිංචි", login: "ලොග් ඉන් වන්න" },
    ta: { register: "பதிவு", login: "உள்நுழையவும்" },
  };

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#D8D8FF" }}>
      {/* App Logo */}
      <Image
        source={require("../assets/AppLogo.png")}
        className="w-42 h-40 mb-8"
        resizeMode="contain"
      />

      {/* Get Started Button */}
      <TouchableOpacity
        className="px-8 py-3 rounded-lg mb-4"
        style={{ backgroundColor: "#000435" }}
        onPress={() => navigation.replace("MainTabs")}
      >
        <Text className="font-poppins text-white text-lg font-semibold">Get Started</Text>
      </TouchableOpacity>

      {/* Register & Login Buttons */}
      <View className="flex-row space-x-4 mb-6">
        <TouchableOpacity
          onPress={() => navigation.navigate("Register", { language })}
          className="bg-regalBlue px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold text-sm">
            {labels[language].register}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login", { language })}
          className="bg-regalBlue px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold text-sm">
            {labels[language].login}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language selector */}
      <View className="flex-row justify-center">
        {["en", "si", "ta"].map((lang, idx) => (
          <TouchableOpacity
            key={lang}
            onPress={() => setLanguage(lang)}
            className={`px-4 py-2 border ${
              idx === 0 ? "rounded-l-lg" : idx === 2 ? "rounded-r-lg" : ""
            } ${language === lang ? "bg-regalBlue" : "bg-white"}`}
          >
            <Text className={language === lang ? "text-white" : "text-black"}>
              {lang.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
