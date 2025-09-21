// WeatherScreen.js
import React from "react";
import { View, Text } from "react-native";

export default function WeatherForecastScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-offWhite">
      <Text className="text-lg font-bold">🌦️ Weather Forecast</Text>
    </View>
  );
}