import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function LandingScreen({ navigation }) {
 
  const[token,setToken] = useState("");
  const[userName, setUserName] = useState("");
  const[language,setLanguage] = useState("");

useEffect(() => {
    const loadAuth = async () => {
      const authData = await AsyncStorage.getItem("authData");
      console.log(authData);
      if (authData) {
        const { token,language,name} = JSON.parse(authData);
        setToken(token);
        setLanguage(language);
        setUserName(name);
      
      }
    };
    loadAuth();
  }, []);



  const handleGetStarted = async () => {
  if (token) {
    navigation.replace("Fisherman", { language, token ,userName});
  } else {
    navigation.replace("MainTabs"); // or "Home", depending on what you want
  }
};

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
        onPress={handleGetStarted}
      >
        <Text className="font-poppins text-darkBlue text-lg font-semibold">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
