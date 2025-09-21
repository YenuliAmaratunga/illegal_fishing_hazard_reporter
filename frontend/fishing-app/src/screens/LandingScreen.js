import React from "react";
import { View, Text, Image, StatusBar } from "react-native";


const LandingScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-regalBlue">
      <StatusBar barStyle="light-content" />
      <Image
        source={require("../assets/AppLogo.png")}
        className="w-40 h-40 mb-6"
        resizeMode="contain"
      />
      
    </View>
  );
};

export default LandingScreen;