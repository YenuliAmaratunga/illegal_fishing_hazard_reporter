import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";

export default function RoleRegisterScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { role, language } = route.params || { role: "fisherman", language: "en" };

  // Common form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    nationalId: "",
    boatName: "",
    dob: "",
    homeAddress: "",
    badgeNumber: "",
    unit: "",
    email: "",
    organization: "",
  });

  const [showPassword, setShowPassword] = useState(false); // password toggle

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  // Translations
  const translations = {
    en: {
      name: "Full Name",
      phone: "Phone Number",
      password: "Password",
      nationalId: "National ID",
      boatName: "Boat Name",
      dob: "Date of Birth (YYYY-MM-DD)",
      homeAddress: "Home Address",
      badgeNumber: "Badge Number",
      unit: "Unit",
      email: "Email",
      organization: "Organization Name",
      submit: "Submit",
      heading: `${role.toUpperCase()} Registration`,
      show: "Show",
      hide: "Hide",
    },
    si: {
      name: "සම්පූර්ණ නම",
      phone: "දුරකථන අංකය",
      password: "මුරපදය",
      nationalId: "ජාතික හැඳුනුම්පත",
      boatName: "නාවු නම",
      dob: "උපන් දිනය (YYYY-MM-DD)",
      homeAddress: "ගෘහස්ථ ලිපිනය",
      badgeNumber: "තහවුරු අංකය",
      unit: "අංශය",
      email: "ඊමේල්",
      organization: "ආයතන නාමය",
      submit: "යොමු කරන්න",
      heading: `${role.toUpperCase()} ලියාපදිංචිය`,
      show: "පෙන්වන්න",
      hide: "මැවිය යුතුය",
    },
    ta: {
      name: "முழு பெயர்",
      phone: "தொலைபேசி எண்",
      password: "கடவுச்சொல்",
      nationalId: "தேசிய அடையாள அட்டை",
      boatName: "படகு பெயர்",
      dob: "பிறந்த தேதி (YYYY-MM-DD)",
      homeAddress: "வீட்டு முகவரி",
      badgeNumber: "அடையாள எண்",
      unit: "அலகு",
      email: "மின்னஞ்சல்",
      organization: "அமைப்பின் பெயர்",
      submit: "சமர்ப்பிக்கவும்",
      heading: `${role.toUpperCase()} பதிவு`,
      show: "காண்பி",
      hide: "மறை",
    },
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name,
        role,
        phone: form.phone,
        password: form.password,
        language:
          language === "si" ? "Sinhala" : language === "ta" ? "Tamil" : "English",
      };

      if (role === "fisherman") {
        Object.assign(payload, {
          nationalId: form.nationalId,
          boatName: form.boatName,
          dob: form.dob,
          homeAddress: form.homeAddress,
        });
      }
      if (role === "marine") {
        Object.assign(payload, {
          badgeNumber: form.badgeNumber,
          unit: form.unit,
          email: form.email,
        });
      }
      if (role === "ngo") {
        Object.assign(payload, {
          organization: form.organization,
          email: form.email,
        });
      }

      const res = await axios.post("http://192.168.8.121:8080/api/User/registerUser", payload);

      Alert.alert("Success", res.data.message);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-center mb-6">
        {translations[language].heading}
      </Text>

      {/* Common Fields */}
      <TextInput
        className="border p-3 rounded mb-4"
        placeholder={translations[language].name}
        value={form.name}
        onChangeText={(t) => handleChange("name", t)}
        keyboardType="default"
      />
      <TextInput
        className="border p-3 rounded mb-4"
        placeholder={translations[language].phone}
        value={form.phone}
        onChangeText={(t) => handleChange("phone", t)}
        keyboardType="phone-pad"
      />

      {/* Password with toggle */}
      <View className="mb-4 relative">
        <TextInput
          className="border p-3 rounded"
          placeholder={translations[language].password}
          value={form.password}
          onChangeText={(t) => handleChange("password", t)}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          className="absolute right-3 top-3"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text className="text-blue-600 font-semibold">
            {showPassword ? translations[language].hide : translations[language].show}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Role-Specific Fields */}
      {role === "fisherman" && (
        <>
          <TextInput
            className="border p-3 rounded mb-4"
            placeholder={translations[language].nationalId}
            value={form.nationalId}
            onChangeText={(t) => handleChange("nationalId", t)}
          />
          <TextInput
            className="border p-3 rounded mb-4"
            placeholder={translations[language].boatName}
            value={form.boatName}
            onChangeText={(t) => handleChange("boatName", t)}
          />
          <TextInput
            className="border p-3 rounded mb-4"
            placeholder={translations[language].dob}
            value={form.dob}
            onChangeText={(t) => handleChange("dob", t)}
          />
          <TextInput
            className="border p-3 rounded mb-4"
            placeholder={translations[language].homeAddress}
            value={form.homeAddress}
            onChangeText={(t) => handleChange("homeAddress", t)}
          />
        </>
      )}

      {role === "marine" && (
        <>
          <TextInput
            className="border p-3 rounded mb-4"
            placeholder={translations[language].badgeNumber}
            value={form.badgeNumber}
            onChangeText={(t) => handleChange("badgeNumber", t)}
          />
          <TextInput
            className="border p-3 rounded mb-4"
            placeholder={translations[language].unit}
            value={form.unit}
            onChangeText={(t) => handleChange("unit", t)}
          />
          <TextInput
            className="border p-3 rounded mb-4"
            placeholder={translations[language].email}
            value={form.email}
            onChangeText={(t) => handleChange("email", t)}
            keyboardType="email-address"
          />
        </>
      )}

      {role === "ngo" && (
        <>
          <TextInput
            className="border p-3 rounded mb-4"
            placeholder={translations[language].organization}
            value={form.organization}
            onChangeText={(t) => handleChange("organization", t)}
          />
          <TextInput
            className="border p-3 rounded mb-4"
            placeholder={translations[language].email}
            value={form.email}
            onChangeText={(t) => handleChange("email", t)}
            keyboardType="email-address"
          />
        </>
      )}

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-blue-600 p-4 rounded-xl mt-6 items-center"
      >
        <Text className="text-white text-lg font-bold">
          {translations[language].submit}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
