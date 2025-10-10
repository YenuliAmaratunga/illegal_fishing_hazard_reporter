import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IdCard, ShieldAlert, CloudSun, Locate, AlertTriangle, Flame } from "lucide-react-native";

const cardData = {
  en: [
    { id: 1, title: "Registration & QR", bg: "bg-darkPurple", icon: IdCard },
    { id: 2, title: "Safety & Risk", bg: "bg-darkPurple", screen: "Risk", icon: ShieldAlert },
    { id: 3, title: "Weather Forecast", bg: "bg-darkPurple", screen: "Weather", icon: CloudSun },
    { id: 4, title: "Live GPS & Tracking", bg: "bg-darkPurple", screen: "GPS", icon: Locate },
    { id: 5, title: "Report Violation", bg: "bg-darkPurple", screen: "ReportViolation", icon: AlertTriangle },
    { id: 6, title: "Report Hazard", bg: "bg-darkPurple", screen: "ReportHazard", icon: Flame },
  ],
  si: [
    { id: 1, title: "ලියාපදිංචි කිරීම & QR", bg: "bg-lightGreen", icon: IdCard },
    { id: 2, title: "ආරක්ෂාව & අවදානම", bg: "bg-lightPeach", icon: ShieldAlert },
    { id: 3, title: "කාලගුණ පූර්ව අනුමාන", bg: "bg-regalBlue", icon: CloudSun },
    { id: 4, title: "GPS & නිරීක්ෂණය", bg: "bg-seaGreen", icon: Locate },
  ],
  ta: [
    { id: 1, title: "பதிவு & QR", bg: "bg-lightGreen", icon: IdCard },
    { id: 2, title: "பாதுகாப்பு & ஆபத்து", bg: "bg-lightPeach", icon: ShieldAlert },
    { id: 3, title: "வானிலை முன்னறிவிப்பு", bg: "bg-regalBlue", icon: CloudSun },
    { id: 4, title: "GPS & கண்காணிப்பு", bg: "bg-seaGreen", icon: Locate },
  ],
};

const labels = {
  en: { register: "Register", login: "Login", dashboard: "Dashboard" },
  si: { register: "ලියාපදිංචි", login: "ලොග් ඉන් වන්න", dashboard: "ඩැෂ්බෝර්ඩ්" },
  ta: { register: "பதிவு", login: "உள்நுழையவும்", dashboard: "டாஷ்போர்டு" },
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [language, setLanguage] = useState("en");

  return (
    <View className="flex-1 bg-white px-4 pt-12">
      {/* Header */}
      <Text className="text-2xl font-bold text-darkBlue mb-4">
        {labels[language].dashboard}
      </Text>

      {/* Auth buttons */}
      <View className="flex-row justify-end space-x-2 mb-6">
        <TouchableOpacity
          onPress={() => navigation.navigate("Register", { language })}
          className="bg-regalBlue px-3 py-1.5 rounded-lg"
        >
          <Text className="text-blue font-semibold text-sm">
            {labels[language].register}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login", { language })}
          className="bg-regalBlue px-3 py-1.5 rounded-lg"
        >
          <Text className="text-blue font-semibold text-sm">
            {labels[language].login}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language selector */}
      <View className="flex-row justify-center mb-8">
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

      {/* Grid of cards */}
      <View className="flex-row flex-wrap justify-between">
        {cardData[language].map((card) => {
          const Icon = card.icon;
          return (
            <TouchableOpacity
              key={card.id}
              className={`w-[48%] h-36 mb-6 rounded-2xl ${card.bg} items-center justify-center border border-gray-200 shadow-md`}
              onPress={() => {
                if (card.screen) {
                  navigation.navigate(card.screen);
                }
              }}
            >
              <Icon size={28} color="white" />
              <Text className="mt-2 text-base font-semibold text-white text-center">
                {card.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
