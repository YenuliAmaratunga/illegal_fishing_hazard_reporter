import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  IdCard,
  ShieldAlert,
  CloudSun,
  Locate
} from "lucide-react-native";

const cardData = {
  en: [
    { id: 1, title: "Registration & QR", bg: "bg-darkPurple", screen: "Fisherman", icon: IdCard },
    { id: 2, title: "Safety & Risk", bg: "bg-darkPurple", screen: "Risk", icon: ShieldAlert },
    { id: 3, title: "Weather Forecast", bg: "bg-darkPurple", screen: "Weather", icon: CloudSun },
    { id: 4, title: "SOS & Reporting", bg: "bg-darkPurple", screen: "GPS", icon: Locate }
  ],
  si: [
    { id: 1, title: "ලියාපදිංචි කිරීම & QR", bg: "bg-lightGreen", screen: "Fisherman", icon: IdCard },
    { id: 2, title: "ආරක්ෂාව & අවදානම", bg: "bg-lightPeach", screen: "Risk", icon: ShieldAlert },
    { id: 3, title: "කාලගුණ පූර්ව අනුමාන", bg: "bg-regalBlue", screen: "Weather", icon: CloudSun },
    { id: 4, title: "GPS & නිරීක්ෂණය", bg: "bg-seaGreen", screen: "GPS", icon: Locate },
  ],
  ta: [
    { id: 1, title: "பதிவு & QR", bg: "bg-lightGreen", screen: "Fisherman", icon: IdCard },
    { id: 2, title: "பாதுகாப்பு & ஆபத்து", bg: "bg-lightPeach", screen: "Risk", icon: ShieldAlert },
    { id: 3, title: "வானிலை முன்னறிவிப்பு", bg: "bg-regalBlue", screen: "Weather", icon: CloudSun },
    { id: 4, title: "GPS & கண்காணிப்பு", bg: "bg-seaGreen", screen: "GPS", icon: Locate },
  ],
};

const labels = {
  en: { dashboard: "Welcome" },
  si: { dashboard: "සාදරයෙන් පිළිගනිමු" },
  ta: { dashboard: "வரவேற்கிறேன்" },
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [language, setLanguage] = useState("en");

  const handleLogout = () => {
    Alert.alert("Logout", "You have been logged out.");
    // navigation.navigate("Login"); // Uncomment if login exists
  };

  return (
    <View className="flex-1 bg-white px-4 pt-16">
      {/* Top bar: Welcome left, Lang + Logout right */}
      <View className="flex-row justify-between items-center mb-6">
        {/* Welcome text */}
        <Text className="text-2xl font-bold text-darkBlue">
          {labels[language].dashboard}
        </Text>

        {/* Language selector + Logout */}
        <View className="flex-row items-center space-x-2">
          {["en", "si", "ta"].map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => setLanguage(lang)}
              className={`px-3 py-2 rounded-md border ${
                language === lang ? "bg-[#000435]" : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  language === lang ? "text-white" : "text-black"
                }`}
              >
                {lang === "en" ? "EN" : lang === "si" ? "සිං" : "த"}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Logout Button in purple */}
          <TouchableOpacity
            onPress={handleLogout}
            className="ml-2 px-4 py-2 bg-darkPurple rounded-lg"
          >
            <Text className="text-white text-sm font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid section with equal spacing */}
      <View className="flex-1 justify-evenly">
        <View className="flex-row flex-wrap justify-between">
          {cardData[language].map((card) => {
            const Icon = card.icon;
            return (
              <TouchableOpacity
                key={card.id}
                className={`w-[48%] h-40 mb-6 rounded-2xl ${card.bg} items-center justify-center border border-gray-200 shadow-md`}
                onPress={() => {
                  if (card.screen) {
                    navigation.navigate(card.screen);
                  }
                }}
              >
                <Icon size={32} color="white" />
                <Text className="mt-3 text-base font-semibold text-white text-center">
                  {card.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}
