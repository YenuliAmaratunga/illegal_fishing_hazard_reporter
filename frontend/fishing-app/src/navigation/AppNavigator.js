import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Import your screens
import LandingScreen from '../screens/LandingScreen';
import HomeScreen from '../screens/HomeScreen.js'; 

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Dashboard" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
