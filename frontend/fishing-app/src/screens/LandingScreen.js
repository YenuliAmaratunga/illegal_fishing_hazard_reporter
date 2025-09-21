import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

export default function LandingScreen({ navigation }) {
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#004675" }}>
      {/* App Logo */}
      <Image
        source={require("../assets/AppLogo.png")}
        className="w-42 h-40 mb-8"
        resizeMode="contain"
      />

     
      {/* Get Started Button */}
      <TouchableOpacity
        className="px-8 py-3 rounded-lg"
        style={{ backgroundColor: "#B4D7D8" }} // lightGreen from theme
        onPress={() => navigation.replace("MainTabs")}
      >
        <Text className="font-poppins text-darkBlue text-lg font-semibold">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
