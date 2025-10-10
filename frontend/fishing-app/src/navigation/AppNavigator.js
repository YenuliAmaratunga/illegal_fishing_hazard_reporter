import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Home, Cloud, AlertTriangle, User } from "lucide-react-native";

// Screens
import LandingScreen from "../screens/LandingScreen";
import HomeScreen from "../screens/HomeScreen";
import WeatherForecastScreen from "../screens/WeatherForecastScreen";
import RiskScreen from "../screens/RiskScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RegisterScreen from "../screens/RegisterScreen";
import RoleRegisterScreen from "../screens/RoleRegisterScreen";
import LoginScreen from "../screens/LoginScreen";
import RoleLoginScreen from "../screens/RoleLoginScreen";
import FishermanLandingScreen from "../screens/FishermanLandingScreen";
import RegisterBoatScreen from "../screens/RegisterBoatScreen";
import TripRegistrationScreen from "../screens/TripRegistrationScreen";
import Compass from "../screens/Compass";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#004675", // regalBlue
        tabBarInactiveTintColor: "#548C92", // seaGreen
        tabBarStyle: { backgroundColor: "#E0D7CF" }, // lightPeach
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Home") return <Home color={color} size={size} />;
          if (route.name === "Weather") return <Cloud color={color} size={size} />;
          if (route.name === "Risk") return <AlertTriangle color={color} size={size} />;
          if (route.name === "Profile") return <User color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Weather" component={WeatherForecastScreen} />
      <Tab.Screen name="Risk" component={RiskScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
  
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
        <Stack.Screen name = "Fisherman" component={FishermanLandingScreen}/>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name = "RegisterBoat" component={RegisterBoatScreen}/>
        <Stack.Screen name = "RegisterTrip" component={TripRegistrationScreen}/>
        <Stack.Screen name="Compass" component={Compass}/>
       
      </Stack.Navigator>
    </NavigationContainer>
  );
}
