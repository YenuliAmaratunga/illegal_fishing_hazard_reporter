import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import MapView, { Marker, Polygon } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Example “allowed zone” polygon (swap for real EEZ later)
const EXAMPLE_ALLOWED_ZONE = [
  { latitude: 6.2, longitude: 79.6 },
  { latitude: 6.2, longitude: 80.6 },
  { latitude: 7.2, longitude: 80.6 },
  { latitude: 7.2, longitude: 79.6 },
];

function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude, yi = polygon[i].longitude;
    const xj = polygon[j].latitude, yj = polygon[j].longitude;
    const intersect =
      yi > point.longitude !== yj > point.longitude &&
      point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function ReportHubScreen({ navigation }) {
  const mapRef = useRef(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const [myPos, setMyPos] = useState(null);
  const [outOfZone, setOutOfZone] = useState(false);

  // SOS pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  // Get device location once
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please enable location services.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const coord = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setMyPos(coord);
      setOutOfZone(!isPointInPolygon(coord, EXAMPLE_ALLOWED_ZONE));
    })();
  }, []);

  const recenter = () => {
    if (!myPos || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { ...myPos, latitudeDelta: 0.045, longitudeDelta: 0.045 },
      500
    );
  };

  const handleSOS = () => {
    Alert.alert(
      "Send SOS?",
      "This will alert Marine Police with your live location.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: () => {
            // TODO: call your SOS endpoint
            Alert.alert("SOS sent", "Help is on the way. Stay safe.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: 6 }}>
      {/* Header */}
      <View className="px-4 pb-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[18px] font-extrabold text-blue">Report Center</Text>
            <Text className="text-[12px] text-[#6E8CFB99]">
              SOS • New Report • My Reports
            </Text>
          </View>
          <View className="bg-lightPurple/80 rounded-full px-3 py-1">
            <Text className="text-blue text-[11px] font-semibold">Live</Text>
          </View>
        </View>
      </View>

      {/* Map container with visible rounded border */}
      <View
        className="mx-4 shadow"
        style={{
          width: width - 32,
          height: height * 0.48,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#50589C33",
          overflow: "hidden", // ✅ ensures right border is visible & map respects radius
          backgroundColor: "white",
        }}
      >
        <MapView
          ref={mapRef}
          style={{ width: "100%", height: "100%" }}
          showsUserLocation={false} // we show our own marker instead of blue dot
          initialRegion={{
            latitude: myPos?.latitude || 6.9271,
            longitude: myPos?.longitude || 79.8612,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          onMapReady={recenter}
        >
          {/* Allowed zone */}
          <Polygon
            coordinates={EXAMPLE_ALLOWED_ZONE}
            fillColor="rgba(110,140,251,0.18)"
            strokeColor="#6E8CFB"
            strokeWidth={2}
          />

          {/* Custom current location marker (ferry icon) */}
          {myPos && (
            <Marker coordinate={myPos} title="You are here">
              <View className="items-center">
                <View className="w-9 h-9 rounded-full bg-white items-center justify-center shadow">
                  <MaterialCommunityIcons name="ferry" size={20} color="#3C467B" />
                </View>
                <Text className="text-[10px] mt-1 text-blue">You</Text>
              </View>
            </Marker>
          )}
        </MapView>

        {/* Recenter FAB */}
        <TouchableOpacity
          onPress={recenter}
          className="absolute right-3 top-3 bg-white rounded-full w-11 h-11 items-center justify-center"
          style={{ shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#3C467B" />
        </TouchableOpacity>

        {/* Zone banner */}
        {outOfZone && (
          <View className="absolute left-3 right-3 top-3 bg-red-500/90 rounded-xl px-3 py-2">
            <Text className="text-white text-[12px] font-semibold">
              You’re outside the permitted area. Proceed with caution.
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="px-4 mt-4">
        {/* SOS */}
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <TouchableOpacity
            onPress={handleSOS}
            activeOpacity={0.9}
            className="bg-red-600 rounded-2xl py-4 items-center"
            style={{ shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }}
          >
            <Text className="text-white text-[18px] font-extrabold">🚨 SOS – EMERGENCY</Text>
            <Text className="text-white/80 text-[12px] mt-1">
              Sends your live location to Marine Police
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Secondary buttons */}
        <View className="flex-row mt-12 justify-between">
          <TouchableOpacity
            onPress={() => navigation.navigate("ReportTypePicker")}
            className="flex-1 mr-3 bg-white border border-blueLight rounded-2xl py-4 items-center"
            style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 }}
          >
            <MaterialCommunityIcons name="note-plus" size={20} color="#50589C" />
            <Text className="text-blue font-bold mt-1">New Report</Text>
            <Text className="text-[#6E8CFB99] text-[11px] mt-0.5">Hazard or Violation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("MyReports")}
            className="flex-1 ml-3 bg-white border border-blueLight rounded-2xl py-4 items-center"
            style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 }}
          >
            <MaterialCommunityIcons name="folder-account" size={20} color="#50589C" />
            <Text className="text-blue font-bold mt-1">My Reports</Text>
            <Text className="text-[#6E8CFB99] text-[11px] mt-0.5">View & edit</Text>
          </TouchableOpacity>
        </View>

        <View className="h-6" />
      </View>
    </SafeAreaView>
  );
}
