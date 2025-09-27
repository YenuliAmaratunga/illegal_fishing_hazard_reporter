import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
} from "react-native";
import axios from "axios";
import { baseURL } from "../config/api";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";


export default function WeatherForecastScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecastType, setForecastType] = useState("Hourly");

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
          `${baseURL}/api/weather/forecast?lat=${latitude}&lon=${longitude}`
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

  if (loading)
    return (
      <ImageBackground
        source={require("../assets/Bg02.png")}
        className="flex-1 justify-center items-center"
        resizeMode="cover"
      >
        <ActivityIndicator size="large" color="#B4D7D8" />
      </ImageBackground>
    );

  if (!weather)
    return (
      <ImageBackground
        source={require("../assets/Bg02.png")}
        className="flex-1 justify-center items-center"
        resizeMode="cover"
      >
        <Text className="text-white text-lg">Unable to load weather data.</Text>
      </ImageBackground>
    );

  const { weather: currentWeather, tides, marine } = weather;
  const locationName = currentWeather?.location ?? "Unknown";

  // --- Helper to color code values ---
  const getWaveColor = (h) => {
    if (!h) return "text-lightPeach";
    if (h > 3) return "text-red-500"; // dangerous
    if (h > 1.5) return "text-yellow-600"; // caution
    return "text-green-400"; // safe
  };

  const getWindColor = (w) => {
    if (!w) return "text-lightPeach";
    if (w > 40) return "text-red-500";
    if (w > 20) return "text-yellow-400";
    return "text-green-400";
  };

const Row = ({ icon, label, value, colorClass }) => (
  <View className="flex-row justify-between items-center mt-3">
    <View className="flex-row items-center">
      <MaterialCommunityIcons name={icon} size={22} color="#285260" />
      <Text className="text-darkBlue text-lg ml-2">{label}</Text>
    </View>
    <Text className={`text-lg font-bold ${colorClass ?? "text-darkBlue"}`}>
      {value}
    </Text>
  </View>
);

  // --- Forecast renderers ---
  const renderHourly = () => {
    if (!marine?.hourly?.wave_height) return <Text>No hourly data</Text>;
    const hoursToShow = marine.hourly.wave_height.slice(0, 7);

    return hoursToShow.map((wave, idx) => (
      <View
        key={idx}
        className="bg-lightPeach m-3 p-4 rounded-2xl shadow-md"
        style={{ elevation: 3 }}
      >
        <Text className="text-darkBlue text-base font-bold mb-2">
          Hour {idx + 1}
        </Text>
        <Row
          label="🌊 Waves"
          value={`${wave ?? "--"} m`}
          colorClass={getWaveColor(wave)}
        />
        <Row
          label="💨 Current"
          value={`${marine.hourly.ocean_current_velocity[idx] ?? "--"} m/s`}
        />
        <Row
          label="🌬️ Direction"
          value={`${marine.hourly.wave_direction[idx] ?? "--"}°`}
        />
      </View>
    ));
  };

  const renderDaily = () => {
    if (!marine?.daily?.wave_height_max) return <Text>No daily data</Text>;
    return marine.daily.wave_height_max.map((waveMax, idx) => (
      <View
        key={idx}
        className="bg-lightPeach m-3 p-4 rounded-2xl shadow-md"
        style={{ elevation: 3 }}
      >
        <Text className="text-darkBlue text-base font-bold mb-2">
          Day {idx + 1}
        </Text>
        <Row
          label="🌊 Max Waves"
          value={`${waveMax} m`}
          colorClass={getWaveColor(waveMax)}
        />
        <Row
          label="💨 Wind Dir"
          value={`${marine.daily.wind_wave_direction_dominant[idx] ?? "--"}°`}
        />
        <Row
          label="🌬️ Wind Wave"
          value={`${marine.daily.wind_wave_height_max[idx] ?? "--"} m`}
        />
      </View>
    ));
  };

  // --- Warning banner ---
  const showWarning =
    currentWeather?.windSpeed > 30 || marine?.current?.wave_height > 2.5;

  return (
    <ImageBackground
      source={require("../assets/Bg02.png")}
      className="flex-1 px-4 pt-12"
      resizeMode="cover"
    >
      <ScrollView>
        <Text className="text-2xl font-bold text-darkBlue text-center mb-2">
          🌦️ Forecast for {locationName}
        </Text>
        {showWarning && (
          <View className="bg-red-500 rounded-xl p-3 mb-4">
            <Text className="text-white text-center font-bold text-lg">
              ⚠️ Dangerous conditions ahead! Sail with caution
            </Text>
          </View>
        )}

        {/* Current Weather Card */}
        <View
          className="bg-lightPeach rounded-2xl p-5 mb-6 shadow-lg"
          style={{ elevation: 4 }}
        >
          <Text className="text-darkBlue text-lg font-bold mb-3 text-center">
            Current Conditions
          </Text>
          <Row
            label="🌡️ Temp"
            value={`${currentWeather?.temperature ?? "--"} °C`}
          />
          <Row
            label="🌬️ Wind"
            value={`${currentWeather?.windSpeed ?? "--"} km/h`}
            colorClass={getWindColor(currentWeather?.windSpeed)}
          />
          <Row
            label="☁️ Sky"
            value={currentWeather?.conditions ?? "--"}
          />
          <Row
            label="🌊 Waves"
            value={`${marine?.current?.wave_height ?? "--"} m`}
            colorClass={getWaveColor(marine?.current?.wave_height)}
          />
        </View>

        {/* Forecast Switch */}
        <View className="flex-row justify-center mb-6 bg-beige rounded-full">
          {["Hourly", "Daily"].map((type) => (
            <TouchableOpacity
              key={type}
              className={`px-6 py-2 rounded-full m-1 ${
                forecastType === type ? "bg-darkBlue" : "bg-lightGreen"
              }`}
              onPress={() => setForecastType(type)}
            >
              <Text
                className={`font-bold ${
                  forecastType === type ? "text-white" : "text-darkBlue"
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Forecast Content */}
        {forecastType === "Hourly" ? renderHourly() : renderDaily()}
      </ScrollView>
    </ImageBackground>
  );
}
