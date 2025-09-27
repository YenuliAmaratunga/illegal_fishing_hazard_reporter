import React from "react";
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

  return (
    <ImageBackground
      source={require("../assets/Bg01.png")}
      className="flex-1 px-4 pt-12"
      resizeMode="cover"
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-darkBlue">Dashboard</Text>
        <Text className="text-xl">🔔</Text>
      </View>

      {/* Grid of Cards */}
      <View className="flex-row flex-wrap justify-between">
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            className={`w-[48%] h-32 mb-4 rounded-2xl ${card.bg} items-center justify-center`}
            onPress={() => card.screen && navigation.navigate(card.screen)} 
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
