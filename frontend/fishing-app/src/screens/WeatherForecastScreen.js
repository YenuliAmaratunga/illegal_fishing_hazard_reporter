import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import axios from "axios";

export default function WeatherForecastScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecastType, setForecastType] = useState("Hourly"); // Hourly | Daily | Route

  // Replace with your coordinates or get dynamically via Expo Location
  const lat = 6.9271; // Example: Colombo
  const lon = 79.8612;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/weather/forecast?lat=${lat}&lon=${lon}`);
        if (res.data.success) {
          setWeather(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching weather data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-regalBlue">
        <ActivityIndicator size="large" color="#B4D7D8" />
      </View>
    );
  }

  if (!weather) {
    return (
      <View className="flex-1 justify-center items-center bg-regalBlue">
        <Text className="text-white text-lg">Unable to load weather data.</Text>
      </View>
    );
  }

const temp = weather.openWeather?.temperature || "--";
const windSpeed = weather.openWeather?.windSpeed || "--";
const conditions = weather.openWeather?.conditions || "--";

const waveHeight = weather.stormGlass?.waveHeight || "--";
const tideList = weather.tides?.tides || [];
const nextTide =
  tideList.length > 0 ? `${tideList[0].type} (${tideList[0].height}m)` : "--";


  return (
    <ScrollView className="flex-1 bg-regalBlue px-4 pt-12">
      <Text className="text-2xl font-bold text-lightPeach mb-6 text-center">
        🌦️ Weather Forecast - Current Location
      </Text>

      {/* Current Weather */}
      <View className="bg-darkBlue rounded-2xl p-4 mb-4">
        <Text className="text-lightPeach text-lg">🌡️ Temp: {temp}°C</Text>
        <Text className="text-lightPeach text-lg">
          🌬️ Wind: {windSpeed} km/h
        </Text>
        <Text className="text-lightPeach text-lg">
          ☁️ Conditions: {conditions}
        </Text>
        <Text className="text-lightPeach text-lg">
          🌊 Wave Height: {waveHeight}m
        </Text>
        <Text className="text-lightPeach text-lg">🌊 Tide: {nextTide}</Text>
      </View>

      {/* Alert Box */}
      <View className="bg-maroon rounded-2xl p-4 mb-4">
        <Text className="text-lightPeach font-semibold">⚠️ ALERT: {alert}</Text>
      </View>

      {/* Forecast Tabs */}
      <View className="flex-row justify-around mb-6">
        {["Hourly", "Daily", "Route"].map((type) => (
          <TouchableOpacity
            key={type}
            className={`px-4 py-2 rounded-full ${
              forecastType === type ? "bg-lightGreen" : "bg-beige"
            }`}
            onPress={() => setForecastType(type)}
          >
            <Text className="text-darkBlue font-semibold">{type} Forecast</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Placeholder for Forecast Content */}
      <View className="bg-seaGreen rounded-2xl p-4 h-64 justify-center items-center">
        <Text className="text-lightPeach text-lg">
          {forecastType} forecast data will appear here.
        </Text>
      </View>
    </ScrollView>
  );
}
