import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WeatherForecastScreen from "../screens/WeatherForecastScreen";
import RouteHazardMapScreen from "../screens/RouteHazardMapScreen";

const Stack = createNativeStackNavigator();

export default function WeatherStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WeatherForecast" component={WeatherForecastScreen} />
      <Stack.Screen name="RouteHazardMap" component={RouteHazardMapScreen} />
    </Stack.Navigator>
  );
}
