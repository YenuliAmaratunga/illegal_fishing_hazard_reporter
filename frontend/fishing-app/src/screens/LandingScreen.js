import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function LandingScreen({ navigation }) {
  const [language, setLanguage] = useState("en");

  const labels = {
    en: { register: "Register", login: "Login" },
    si: { register: "ලියාපදිංචි", login: "ලොග් ඉන් වන්න" },
    ta: { register: "பதிவு", login: "உள்நுழையவும்" },
  };

  // Ensure fallback if language key is missing
  const currentLabels = labels[language] || labels.en;

  // Gradient Button component
  const GradientButton = ({ text, colors, onPress }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
        flex: 1,
      }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: 16,
          alignItems: "center",
          borderRadius: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {text ?? ""}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#EEF0FF", "#D8D8FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* App Logo */}
          <Image
            source={require("../assets/CircularAppLogo.png")}
            style={{ width: 192, height: 192, marginBottom: 64 }}
            resizeMode="contain"
          />

          {/* Register & Login Buttons */}
          <View style={{ width: "100%", marginBottom: 24 }}>
            <GradientButton
              text={currentLabels.register}
              colors={["#50589C", "#6E8CFB"]}
              onPress={() => navigation.navigate("Register", { language })}
            />
            <View style={{ height: 32 }} /> {/* spacing between buttons */}
            <GradientButton
              text={currentLabels.login}
              colors={["#6E8CFB", "#BABCFF"]}
              onPress={() => navigation.navigate("Login", { language })}
            />
          </View>

          {/* Language Selector */}
          <View style={{ flexDirection: "row", marginTop: 48 }}>
            {["en", "si", "ta"].map((lang, idx) => (
              <TouchableOpacity
                key={lang}
                onPress={() => setLanguage(lang)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  backgroundColor: language === lang ? "#000435" : "#fff",
                  borderTopLeftRadius: idx === 0 ? 8 : 0,
                  borderBottomLeftRadius: idx === 0 ? 8 : 0,
                  borderTopRightRadius: idx === 2 ? 8 : 0,
                  borderBottomRightRadius: idx === 2 ? 8 : 0,
                  marginLeft: idx !== 0 ? -1 : 0,
                }}
              >
                <Text
                  style={{
                    color: language === lang ? "#fff" : "#000",
                    fontWeight: "600",
                  }}
                >
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
