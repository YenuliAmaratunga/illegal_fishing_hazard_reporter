import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";

import axios from "axios";
import DateTimePickerModal from "react-native-modal-datetime-picker";



const AUTH_BASE =
  "https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/registration-service/v1.0";

export default function RoleRegisterScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { role, language } = route.params || { role: "fisherman", language: "en" };
  const [dob, setDob] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

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

  const [showPassword, setShowPassword] = useState(false);
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date) => {
  setDob(date);
  hideDatePicker();
};


  const handleChange = (key, value) => setForm({ ...form, [key]: value });

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
      heading: "Join With AquaWatch!",
      description: "Create your account to help protect our oceans.",
      account: "Already Have An Account?",
      login: "Login",
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
      heading: "AquaWatch සමඟ එක්වන්න",
      description: "අපගේ මුහුදු ආරක්ෂා කිරීමට උදව් වීමට ඔබගේ ගිණුම සාදන්න.",
      account: "දැනටමත් ගිණුමක් තිබේද?",
      login: "ඇතුල් වන්න",
      show: "පෙන්වන්න",
      hide: "සඟවන්න",
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
      heading: "AquaWatch உடன் சேருங்கள்",
      description: "எங்கள் கடல்களை பாதுகாக்க உதவ உங்கள் கணக்கை உருவாக்குங்கள்.",
      account: "ஏற்கனவே கணக்கு உள்ளதா?",
      login: "உள்நுழைய",
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

      const res = await axios.post(`${AUTH_BASE}/api/User/registerUser`, payload, {
        timeout: 12000,
      });

      Alert.alert("Success", res.data.message);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Status bar gradient */}


      {/* Heading & description below gradient */}
      <View style={{ marginTop: 20, alignItems: "center" }}>
        <Text style={styles.headingText}>{translations[language].heading}</Text>
        <Text style={styles.descriptionText}>{translations[language].description}</Text>
      </View>

      {/* Common Fields */}
      <TextInput
        style={styles.input}
        placeholder={translations[language].name}
        value={form.name}
        onChangeText={(t) => handleChange("name", t)}
      />
      <TextInput
        style={styles.input}
        placeholder={translations[language].phone}
        value={form.phone}
        onChangeText={(t) => handleChange("phone", t)}
        keyboardType="phone-pad"
      />

      {/* Password */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder={translations[language].password}
          secureTextEntry={!showPassword}
          value={form.password}
          onChangeText={(t) => handleChange("password", t)}
        />
        <TouchableOpacity
          style={styles.showBtn}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.showText}>
            {showPassword ? translations[language].hide : translations[language].show}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Role Specific */}
      {role === "fisherman" && (
        <>
          <TextInput
            style={styles.input}
            placeholder={translations[language].nationalId}
            value={form.nationalId}
            onChangeText={(t) => handleChange("nationalId", t)}
          />
          <TextInput
            style={styles.input}
            placeholder={translations[language].boatName}
            value={form.boatName}
            onChangeText={(t) => handleChange("boatName", t)}
          />
          <TextInput
            style={styles.input}
            placeholder={translations[language].dob}
            value={form.dob}
            onChangeText={(t) => handleChange("dob", t)}
          />
          <TextInput
            style={styles.input}
            placeholder={translations[language].homeAddress}
            value={form.homeAddress}
            onChangeText={(t) => handleChange("homeAddress", t)}
          />
        </>
      )}

      {role === "marine" && (
        <>
          <TextInput
            style={styles.input}
            placeholder={translations[language].badgeNumber}
            value={form.badgeNumber}
            onChangeText={(t) => handleChange("badgeNumber", t)}
          />
          <TextInput
            style={styles.input}
            placeholder={translations[language].unit}
            value={form.unit}
            onChangeText={(t) => handleChange("unit", t)}
          />
          <TextInput
            style={styles.input}
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
            style={styles.input}
            placeholder={translations[language].organization}
            value={form.organization}
            onChangeText={(t) => handleChange("organization", t)}
          />
          <TextInput
            style={styles.input}
            placeholder={translations[language].email}
            value={form.email}
            onChangeText={(t) => handleChange("email", t)}
            keyboardType="email-address"
          />
        </>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>{translations[language].submit}</Text>
      </TouchableOpacity>

      <View style={styles.accountContainer}>
        <Text style={styles.accountText}>{translations[language].account}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>{translations[language].login}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8faff",
    padding: 50,
    paddingBottom: 40,
  },
  headingText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0000ff",
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c7c7d2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 15,
  },
  inputPassword: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c7c7d2",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  showBtn: {
    position: "absolute",
    right: 15,
    top: 12,
  },
  showText: {
    color: "#007bff",
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#0066cc",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 15,
  },
  submitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  accountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  accountText: {
    color: "#999999",
    marginRight: 8,
    fontSize: 14,
  },
  loginText: {
    color: "#0066cc",
    fontSize: 14,
    fontWeight: "bold",
  },
});
