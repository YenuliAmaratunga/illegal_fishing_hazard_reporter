import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Card data
const cardData = {
  en: [
    { id: 1, title: "🐟 Registration & QR", bg: "bg-lightGreen" },
    { id: 2, title: "⚠️ Safety & Risk", bg: "bg-lightPeach" },
    { id: 3, title: "🌦️ Weather Forecast", bg: "bg-regalBlue" },
    { id: 4, title: "📍 GPS & Tracking", bg: "bg-seaGreen" },
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

// Prompt text in three languages
const languagePrompt = {
  en: "Please select your preferred language",
  si: "කරුණාකර ඔබ කැමති භාෂාව තෝරන්න",
  ta: "தயவுசெய்து உங்கள் விருப்பமான மொழியை தேர்ந்தெடுக்கவும்",
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [language, setLanguage] = useState(null); // ask user first
  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadAuthData = async () => {
      const authData = await AsyncStorage.getItem("authData");
      if (authData) {
        const { token, language, userName } = JSON.parse(authData);
        setToken(token);
        setLanguage(language);
        setUsername(userName);
      }
    };
    loadAuthData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authData");
    setUsername(null);
    setToken(null);
  };

  // Language selection screen
  if (!language) {
    return (
      <ImageBackground
        source={require("../assets/Bg01.png")}
        className="flex-1 items-center justify-center px-4"
        resizeMode="cover"
      >
        <Text className="text-2xl font-bold text-darkBlue mb-6 text-center">
          {languagePrompt.en}{"\n"}
          {languagePrompt.si}{"\n"}
          {languagePrompt.ta}
        </Text>

        <View className="flex-row space-x-4 mt-6">
          {["en", "si", "ta"].map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => setLanguage(lang)}
              className="px-6 py-3 bg-regalBlue rounded-full shadow-lg"
            >
              <Text className="text-white font-semibold text-lg">{lang.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ImageBackground>
    );
  }

  // Main dashboard
  return (
    <ImageBackground
      source={require("../assets/Bg01.png")}
      className="flex-1 px-4 pt-12"
      resizeMode="cover"
    >
      {/* Header */}
      <Text className="text-2xl font-bold text-darkBlue mb-6">{labels[language].dashboard}</Text>

      {/* Login/Register Buttons */}
      {/* Login/Register Buttons */}
<View className="flex-row justify-center mb-6 space-x-4">
  {username ? (
    <>
      <View className="bg-regalBlue rounded-full shadow-md px-4 py-2">
        <Text className="text-white font-semibold text-lg">{username}</Text>
      </View>
      
      <TouchableOpacity
        onPress={async () => {
          try {
            await AsyncStorage.removeItem("authData"); // remove stored login info
            setUsername(null);
            setToken(null);
          } catch (error) {
            console.error("Logout error:", error);
          }
        }}
        style={{
          backgroundColor: "#f56565", // red-500
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 9999,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
          Logout
        </Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      <TouchableOpacity
        onPress={() => navigation.navigate("Register", { language })}
        style={{
          backgroundColor: "#48bb78", // green-500
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 9999,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
          {labels[language].register}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Login", { language })}
        style={{
          backgroundColor: "#4299e1", // blue-500
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 9999,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
          {labels[language].login}
        </Text>
      </TouchableOpacity>
    </>
  )}
</View>


      {/* Grid of Cards */}
      <View className="flex-row flex-wrap justify-between">
        {cardData[language].map((card) => (
          <TouchableOpacity
            key={card.id}
            className={`w-[48%] h-32 mb-4 rounded-2xl ${card.bg} items-center justify-center`}
          >
            <Text className="text-lg font-semibold text-white text-center">{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ImageBackground>
  );
}
