import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Home, Cloud, AlertTriangle, Locate } from "lucide-react-native";
import WeatherStack from "./weatherStack";


// Screens
import LandingScreen from "../screens/LandingScreen";
import HomeScreen from "../screens/HomeScreen";
import WeatherForecastScreen from "../screens/WeatherForecastScreen";
import RiskScreen from "../screens/RiskScreen";
import ProfileScreen from "../screens/ProfileScreen";
import GPSTrackingScreen from "../screens/GPSTrackingScreen";
import ReportViolationScreen from "../screens/ReportViolationScreen";
import ReportHazardScreen from "../screens/ReportHazardScreen";
import RegisterScreen from "../screens/RegisterScreen";
import RoleRegisterScreen from "../screens/RoleRegisterScreen";
import LoginScreen from "../screens/LoginScreen";
import RoleLoginScreen from "../screens/RoleLoginScreen";
import RouteHazardMapScreen from "../screens/RouteHazardMapScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#50589C", 
        tabBarInactiveTintColor: "#949494", 
        tabBarStyle: { backgroundColor: "#ffffff" }, 
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Home") return <Home color={color} size={size} />;
          if (route.name === "Weather") return <Cloud color={color} size={size} />;
          if (route.name === "Risk") return <AlertTriangle color={color} size={size} />;
          if (route.name === "GPS") return <Locate color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Weather" component={WeatherStack} />
      <Tab.Screen name="Risk" component={RiskScreen} />
      <Tab.Screen name="GPS" component={GPSTrackingScreen} />
  
    </Tab.Navigator>
  );
}

// Stack Navigator (Landing → Main Tabs)
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name = "RoleRegister" component={RoleRegisterScreen}/>
        <Stack.Screen name = "Login" component = {LoginScreen}/>
        <Stack.Screen name = "RoleLogin" component={RoleLoginScreen}/>
        <Stack.Screen name="WeatherForecastScreen" component={WeatherForecastScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ReportViolation" component={ReportViolationScreen} />
        <Stack.Screen name="ReportHazard" component={ReportHazardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
