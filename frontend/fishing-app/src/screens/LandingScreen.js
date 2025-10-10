import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

export default function LandingScreen({ navigation }) {
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
        className="px-8 py-3 rounded-lg"
        style={{ backgroundColor: "#000435" }} 
        onPress={() => navigation.replace("MainTabs")}
      >
        <Text className="font-poppins text-white text-lg font-semibold">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
