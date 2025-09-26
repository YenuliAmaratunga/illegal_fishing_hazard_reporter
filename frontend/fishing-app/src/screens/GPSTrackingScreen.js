
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function GPSTrackingScreen() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [boats, setBoats] = useState([]); 

    // Get current location
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);  
        })();
    }, []);

    // SOS Button Handler
    const handleSOS = async () => {
        try {
            Alert.alert(
                "SOS Alert Sent!",
                "Emergency alert sent to Marine Police! Help is on the way.",
                [{ text: "OK" }]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to send SOS alert");
        }
    };

    const sendLocationToBackend = async (coords) => {
        console.log('Sending location to backend:', coords);
    };

    if (!location) {
        return (
            <View className="flex-1 bg-seaGreen justify-center items-center">
                <Text className="text-white text-lg">Getting your location...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-seaGreen">
            <Text className="text-2xl font-bold text-white text-center p-4">
                📍 Live Boat Tracking
            </Text>
            
            {/* Map */}
            <View className="flex-1">
                <MapView
                    style={{ width, height: height * 0.7 }}
                    initialRegion={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    {/* Your current location */}
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title="Your Boat"
                        pinColor="blue"
                    />
                    
                    {/* Other boats */}
                    {boats.map(boat => (
                        <Marker
                            key={boat.id}
                            coordinate={boat.coordinate}
                            title={boat.title}
                            pinColor="green"
                        />
                    ))}
                </MapView>
            </View>

            {/* Location Info */}
            <View className="bg-lightPeach p-4">
                <Text className="text-darkBlue font-semibold">
                    Your Position: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                </Text>
            </View>

            {/* SOS Button */}
            <TouchableOpacity 
                className="bg-red-600 py-4 mx-4 my-4 rounded-2xl items-center"
                onPress={handleSOS}
            >
                <Text className="text-white text-xl font-bold">🚨 SOS EMERGENCY</Text>
            </TouchableOpacity>
        </View>
    );
}

