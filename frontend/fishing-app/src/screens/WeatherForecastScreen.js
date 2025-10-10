import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import axios from "axios";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function WeatherForecastScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecastType, setForecastType] = useState("Hourly");
  const [showTips, setShowTips] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Location permission denied");
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const res = await axios.get(
          `https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/weather-service/v1.0/api/weather/forecast?lat=${latitude}&lon=${longitude}`
        );
        if (res.data.success) setWeather(res.data.data);
      } catch (err) {
        console.error("Error fetching weather data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  //TO DO ADD LOADING ICON HERE
  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3C467B" />
      </View>
    );

  if (!weather)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-blue text-lg">Unable to load weather data.</Text>
      </View>
    );

  const { weather: currentWeather, marine } = weather;
  const locationName = currentWeather?.location ?? "Unknown";

  // --- Helpers ---
  const getWaveColor = (h) => {
    if (!h) return "text-white";
    if (h > 3) return "text-red-500";
    if (h > 1.5) return "text-yellow-500";
    return "text-darkBlue";
  };

  const getWindColor = (w) => {
    if (!w) return "text-white";
    if (w > 40) return "text-red-500";
    if (w > 20) return "text-yellow-400";
    return "text-blue-500";
  };

  // --- Row component ---
  const Row = ({ icon, label, value, colorClass, labelColor, iconColor }) => (
    <View className="flex-row justify-between items-center mt-3">
      <View className="flex-row items-center">
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={iconColor ?? "#fff"}
        />
        <Text
          className={`${labelColor ?? "text-white"} text-base font-bold ml-2`}
        >
          {label}
        </Text>
      </View>
      <Text className={`text-base font-semibold ${colorClass ?? "text-white"}`}>
        {value}
      </Text>
    </View>
  );

  // --- Forecast renderers ---
  const renderHourly = () => {
    if (!marine?.hourly?.wave_height) return <Text>No hourly data</Text>;
    const hoursToShow = marine.hourly.wave_height.slice(0, 7);
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {hoursToShow.map((wave, idx) => (
          <View
            key={idx}
            className="bg-darkPurple w-50 m-2 p-4 rounded-2xl shadow-md"
            style={{ elevation: 3 }}
          >
            <Text className="text-white text-base font-bold mb-2">
              Hour {idx + 1}
            </Text>
            <Row
              icon="waves"
              label="Waves :"
              value={`${wave ?? "--"} m`}
              colorClass={getWaveColor(wave)}
            />
            <Row
              icon="navigation-variant"
              label="Current : "
              value={`${marine.hourly.ocean_current_velocity[idx] ?? "--"} m/s`}
            />
            <Row
              icon="compass"
              label="Direction :"
              value={`${marine.hourly.wave_direction[idx] ?? "--"}°`}
            />
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderDaily = () => {
    if (!marine?.daily?.wave_height_max) return <Text>No daily data</Text>;
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {marine.daily.wave_height_max.map((waveMax, idx) => (
          <View
            key={idx}
            className="bg-darkPurple w-50 m-2 p-4 rounded-2xl shadow-md"
            style={{ elevation: 3 }}
          >
            <Text className="text-white text-base font-bold mb-2">
              Day {idx + 1}
            </Text>
            <Row
              icon="waves"
              label="Waves:"
              value={`${waveMax} m`}
              colorClass={getWaveColor(waveMax)}
            />
            <Row
              icon="compass"
              label="Direction:"
              value={`${
                marine.daily.wind_wave_direction_dominant[idx] ?? "--"
              }°`}
            />
            <Row
              icon="weather-windy"
              label="Wind Wave:"
              value={`${marine.daily.wind_wave_height_max[idx] ?? "--"} m`}
            />
          </View>
        ))}
      </ScrollView>
    );
  };

  // --- Dynamic Quick Tips ---
  const generateTips = () => {
    const tips = [];

    if (currentWeather?.windSpeed > 30) {
      tips.push({
        icon: "weather-windy",
        text: "Strong winds detected! Avoid sailing in high winds above 30 km/h.",
      });
    } else if (currentWeather?.windSpeed > 15) {
      tips.push({
        icon: "weather-windy",
        text: "Moderate winds — use smaller sails and stay close to shore.",
      });
    } else {
      tips.push({
        icon: "weather-windy",
        text: "Winds are calm — good conditions for short trips.",
      });
    }

    if (marine?.current?.wave_height > 2.5) {
      tips.push({
        icon: "waves",
        text: "High waves (over 2.5m)! Avoid departure until calmer seas.",
      });
    } else if (marine?.current?.wave_height > 1.5) {
      tips.push({
        icon: "waves",
        text: "Moderate waves — proceed with caution.",
      });
    } else {
      tips.push({
        icon: "waves",
        text: "Wave conditions are calm and safe.",
      });
    }

    if (currentWeather?.conditions?.toLowerCase().includes("rain")) {
      tips.push({
        icon: "weather-pouring",
        text: "Rainy conditions expected — ensure proper visibility gear.",
      });
    }

    tips.push({
      icon: "map-marker-alert",
      text: "Always log your route and check local alerts before departure.",
    });

    return tips;
  };

  const quickTips = generateTips();

  const toggleTips = () => {
    LayoutAnimation.easeInEaseOut();
    setShowTips(!showTips);
  };

  return (
    <View className="flex-1 bg-white px-4 pt-12">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-bold text-blue text-center mb-4">
          Forecast for {locationName}, Sri Lanka
        </Text>

        {/* ⚠️ Warning */}
        {(currentWeather?.windSpeed > 30 ||
          marine?.current?.wave_height > 2.5) && (
          <View className="bg-red-500 rounded-xl p-3 mb-4">
            <Text className="text-white text-center font-bold text-lg">
              ⚠️ Dangerous conditions ahead! Sail with caution
            </Text>
          </View>
        )}

        {/* Current Conditions */}
        <View
          className="bg-lightPurple rounded-2xl p-5 mb-6 shadow-lg"
          style={{ elevation: 4 }}
        >
          <Text className="text-blue-400 text-lg font-bold mb-3 text-center">
            Current Conditions
          </Text>
          <Row
            icon="thermometer"
            label="Temperature"
            value={`${currentWeather?.temperature ?? "--"} °C`}
            labelColor="text-blue-400"
            iconColor="#60A5FA"
            colorClass="text-blue-400"
          />
          <Row
            icon="weather-windy"
            label="Wind Speed"
            value={`${currentWeather?.windSpeed ?? "--"} km/h`}
            colorClass={getWindColor(currentWeather?.windSpeed)}
            labelColor="text-blue-400"
            iconColor="#60A5FA"
          />
          <Row
            icon="weather-cloudy"
            label="Sky"
            value={currentWeather?.conditions ?? "--"}
            labelColor="text-blue-400"
            iconColor="#60A5FA"
            colorClass="text-blue-400"
          />
          <Row
            icon="waves"
            label="Wave Height"
            value={`${marine?.current?.wave_height ?? "--"} m`}
            colorClass={getWaveColor(marine?.current?.wave_height)}
            labelColor="text-blue-400"
            iconColor="#60A5FA"
          />
        </View>

        {/* Forecast Switch */}
        <View className="flex-row justify-center mb-6 rounded-full">
          {["Hourly", "Daily"].map((type) => (
            <TouchableOpacity
              key={type}
              className={`px-6 py-2 rounded-full m-1 ${
                forecastType === type
                  ? "bg-blueLight"
                  : "bg-white border border-blueLight"
              }`}
              onPress={() => setForecastType(type)}
            >
              <Text
                className={`font-bold ${
                  forecastType === type ? "text-white" : "text-blue"
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Forecast Cards */}
        {forecastType === "Hourly" ? renderHourly() : renderDaily()}

        {/* Quick Tips */}
        <View className="bg-blueLight rounded-2xl mt-8 mb-6 shadow-md">
          <TouchableOpacity
            onPress={toggleTips}
            className="flex-row justify-between items-center px-5 py-4"
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={22}
                color="#fff"
              />
              <Text className="text-white text-lg font-bold ml-2">
                {showTips ? "Hide Quick Tips" : "Show Quick Tips"}
              </Text>
            </View>
            <Text className="text-white text-lg">
              {showTips ? "▼" : "▲"}
            </Text>
          </TouchableOpacity>

          {showTips && (
            <View className="px-6 pb-4">
              {quickTips.map((tip, idx) => (
                <View key={idx} className="flex-row items-center mb-2">
                  <MaterialCommunityIcons
                    name={tip.icon}
                    size={20}
                    color="#fff"
                  />
                  <Text className="text-white ml-3">{tip.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("RouteHazardMap")}
          className="flex-row items-center justify-center border border-blueLight bg-accentPurple py-3 rounded-xl mb-12 mt-4 shadow-lg mx-10"
          style={{ elevation: 4 }}
        >
          <MaterialCommunityIcons
            name="map-search-outline"
            size={22}
            color="#3C467B"
          />
          <Text className="text-blue text-center font-bold text-lg ml-2">
            View Route Hazard Map
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
