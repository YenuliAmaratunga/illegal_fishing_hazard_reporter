import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { language } = route.params || { language: "en" };

  const translations = {
    en: {
      ngo: "Register your NGO",
      fisherman: "Register as Fisherman",
      police: "Register as Marine Police Officer",
      choose: "Choose Registration Type",
    },
    si: {
      ngo: "ඔබගේ එන්.ජී.ඕ ලියාපදිංචි කරන්න",
      fisherman: "මත්ස්‍යකර්මාන්තකරු ලෙස ලියාපදිංචි වන්න",
      police: "මුහුදු පොලිස් නිලධාරියෙකු ලෙස ලියාපදිංචි වන්න",
      choose: "ලියාපදිංචි වීමේ වර්ගය තෝරන්න",
    },
    ta: {
      ngo: "உங்கள் என்.ஜி.ஓ-வை பதிவு செய்யவும்",
      fisherman: "மீனவராக பதிவு செய்யவும்",
      police: "கடல் காவல் அதிகாரியாக பதிவு செய்யவும்",
      choose: "பதிவு வகையைத் தேர்ந்தெடுக்கவும்",
    },
  };

  const goToForm = (role) => {
    navigation.navigate("RoleRegister", { role, language });
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      <Text className="text-2xl font-bold text-center mb-8 text-gray-800">
        {translations[language].choose}
      </Text>

      <TouchableOpacity
        onPress={() => goToForm("ngo")}
        className="bg-green-500 rounded-2xl w-full py-8 mb-6 justify-center items-center"
      >
        <Text className="text-xl font-semibold text-white text-center">
          {translations[language].ngo}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => goToForm("fisherman")}
        className="bg-blue rounded-2xl w-full py-8 mb-6 justify-center items-center"
      >
        <Text className="text-xl font-semibold text-white text-center">
          {translations[language].fisherman}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => goToForm("marine")}
        className="bg-red-500 rounded-2xl w-full py-8 mb-6 justify-center items-center"
      >
        <Text className="text-xl font-semibold text-white text-center">
          {translations[language].police}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
