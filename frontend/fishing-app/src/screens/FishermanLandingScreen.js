import React from "react";
import { View, Text, TouchableOpacity ,ScrollView} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FishermanLandingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { language, token,name} = route.params;

  const translations = {
    si: {
      quick: "ඉක්මන් ක්‍රියාමාර්ග",
      boat: "බෝට්ටු ලියාපදිංචිය",
      trip: "සංචාර සැලසුම්",
      safe: "ආරක්ෂක අනතුරු ඇඟවීම්",
      com: "සමාජ මධ්‍යස්ථානය",
      gear: "උපකරණ සහ උපාංග",
      license: "බලපත්‍ර සහ අවසර ලිපි",
    },
    en: {
      quick: "Quick Actions",
      boat: "Boat Registration",
      trip: "Trip Planning",
      safe: "Safety Alerts",
      com: "Community Hub",
      gear: "Gear & Tackle",
      license: "License & Permits",
    },
    ta: {
      quick: "விரைவான நடவடிக்கைகள்",
      boat: "படகு பதிவு",
      trip: "பயண திட்டமிடல்",
      safe: "பாதுகாப்பு எச்சரிக்கைகள்",
      com: "சமூக மையம்",
      gear: "உபகரணங்கள் மற்றும் கருவிகள்",
      license: "அனுமதி & உரிமங்கள்",
    },
  };

  return (
    <View className="flex-1 bg-white pt-24">
      {/* Scrollable content */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text className="text-xl font-bold mb-4">{translations[language].quick}</Text>

        <View className="flex-row flex-wrap justify-between">
          {/* Cards */}
          {["boat","trip","safe","com","gear","license"].map((key, index) => (
            <TouchableOpacity key={index} className="w-[48%] bg-white p-6 rounded-2xl mb-4 shadow">
              <View className="items-center">
                <Text className="text-3xl">
                  {key === "boat" ? "⛵" : key === "trip" ? "🗺️" : key === "safe" ? "🛡️" : key === "com" ? "👥" : key === "gear" ? "🧭" : "📄"}
                </Text>
                <Text className="mt-2 text-gray-700 font-medium text-center">{translations[language][key]}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Tabs */}
      <SafeAreaView edges={["bottom"]} className="bg-white">
        <View className="flex-row justify-around items-center h-16 border-t border-gray-300 shadow-lg">
          <TouchableOpacity className="items-center" onPress={() => navigation.navigate("MainTabs")}>
            <Text className="text-2xl">🏠</Text>
            <Text>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center" onPress={() => {}}>
            <Text className="text-2xl">⛵</Text>
            <Text>Fishing</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center" onPress={() => navigation.navigate("Alerts")}>
            <Text className="text-2xl">⚠️</Text>
            <Text>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center" onPress={() => navigation.navigate("Profile", { language, token })}>
            <Text className="text-2xl">👤</Text>
            <Text>Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
