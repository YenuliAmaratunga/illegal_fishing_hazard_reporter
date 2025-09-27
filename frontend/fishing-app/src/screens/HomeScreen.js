import React, { useState } from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";

const cards = [
  { id: 1, title: "🐟 Registration & QR", bg: "bg-lightGreen" },
  { id: 2, title: "⚠️ Safety Checklist", bg: "bg-lightPeach", screen: "Risk" },
  { id: 3, title: "🌦️ Weather Forecast", bg: "bg-regalBlue" },
  { id: 4, title: "📍 Live GPS Tracking", bg: "bg-seaGreen", screen: "GPSTracking" },
  { id: 5, title: "🚨 Report Violation", bg: "bg-darkBlue", screen: "ReportViolation" }, 
  { id: 6, title: "⚠️ Report Hazard", bg: "bg-beige", screen: "ReportHazard" }, 
];

export default function HomeScreen() {
  const navigation = useNavigation();
// Card data in multiple languages
const cardData = {
  en: [
    { id: 1, title: "🐟 Registration & QR", bg: "bg-lightGreen" },
    { id: 2, title: "⚠️ Safety & Risk", bg: "bg-lightPeach", screen: "Risk" },
    { id: 3, title: "🌦️ Weather Forecast", bg: "bg-regalBlue", screen: "Weather" },
    { id: 4, title: "📍 GPS & Tracking", bg: "bg-seaGreen"},
  ],
  si: [
    { id: 1, title: "🐟 ලියාපදිංචි කිරීම & QR", bg: "bg-lightGreen" },
    { id: 2, title: "⚠️ ආරක්ෂාව & අවදානම", bg: "bg-lightPeach" },
    { id: 3, title: "🌦️ කාලගුණ පූර්ව අනුමාන", bg: "bg-regalBlue" },
    { id: 4, title: "📍 GPS & නිරීක්ෂණය", bg: "bg-seaGreen" },
  ],
  ta: [
    { id: 1, title: "🐟 பதிவு & QR", bg: "bg-lightGreen" },
    { id: 2, title: "⚠️ பாதுகாப்பு & ஆபத்து", bg: "bg-lightPeach" },
    { id: 3, title: "🌦️ வானிலை முன்னறிவிப்பு", bg: "bg-regalBlue" },
    { id: 4, title: "📍 GPS & கண்காணிப்பு", bg: "bg-seaGreen" },
  ],
};

const labels = {
  en: { register: "Register", login: "Login", dashboard: "Dashboard" },
  si: { register: "ලියාපදිංචි", login: "ලොග් ඉන් වන්න", dashboard: "ඩැෂ්බෝර්ඩ්" },
  ta: { register: "பதிவு", login: "உள்நுழையவும்", dashboard: "டாஷ்போர்டு" },
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [language, setLanguage] = useState("en"); // default English

  return (
    <ImageBackground
      source={require("../assets/Bg01.png")}
      className="flex-1 px-4 pt-12"
      resizeMode="cover"
    >
      {/* Header */}

      <Text className="text-2xl font-bold text-darkBlue">
        {labels[language].dashboard}
      </Text>
      <View className="flex-row justify-end space-x-2 mb-6">
        <TouchableOpacity
          onPress={() => navigation.navigate("Register", { language })}
          className="bg-regalBlue px-3 py-1.5 rounded-lg"
        >
          <Text className="text-white font-semibold text-sm">
            {labels[language].register}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login", { language })}
          className="bg-regalBlue px-3 py-1.5 rounded-lg"
        >
          <Text className="text-white font-semibold text-sm">
            {labels[language].login}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Selector */}
      <View className="flex-row justify-center mb-4">
        <TouchableOpacity
          onPress={() => setLanguage("en")}
          className={`px-4 py-2 rounded-l-lg border ${
            language === "en" ? "bg-regalBlue" : "bg-white"
          }`}
        >
          <Text className={language === "en" ? "text-white" : "text-black"}>
            EN
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage("si")}
          className={`px-4 py-2 border ${
            language === "si" ? "bg-regalBlue" : "bg-white"
          }`}
        >
          <Text className={language === "si" ? "text-white" : "text-black"}>
            SI
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage("ta")}
          className={`px-4 py-2 rounded-r-lg border ${
            language === "ta" ? "bg-regalBlue" : "bg-white"
          }`}
        >
          <Text className={language === "ta" ? "text-white" : "text-black"}>
            TA
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid of Cards */}
      <View className="flex-row flex-wrap justify-between">
        {cardData[language].map((card) => (
          <TouchableOpacity
            key={card.id}
            className={`w-[48%] h-32 mb-4 rounded-2xl ${card.bg} items-center justify-center`}
            onPress={() => {
              if (card.screen) {
                navigation.navigate(card.screen);
              }
            }}
          >
            <Text className="text-lg font-semibold text-white text-center">
              {card.title}
            </Text>
          </TouchableOpacity>
        ))}

      </View>
    </ImageBackground>
  );
}
