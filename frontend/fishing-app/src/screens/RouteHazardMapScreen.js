import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline, Polygon } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import zones from "../assets/marineZones.json";

const WEATHER_BASE =
  "https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/weather-service/v1.0/api/weather";
const TRIP_BASE =
  "https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/registration-service/v1.0";

// ---------- Utility functions ----------
const isPointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude,
      yi = polygon[i].longitude;
    const xj = polygon[j].latitude,
      yj = polygon[j].longitude;

    const intersect =
      yi > point.longitude !== yj > point.longitude &&
      point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const doesRouteCrossZone = (route, polygon) =>
  route.some((p) => isPointInPolygon(p, polygon));

export default function RouteHazardMapScreen() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [hazards, setHazards] = useState([]);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState([]);
  const pulseRefs = useRef({});

  // ---------------- AUTH + FETCH ROUTE ----------------
  useEffect(() => {
    const init = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem("authData");
        if (!storedAuth) {
          Alert.alert("Session expired", "Please log in again.");
          return;
        }

        const parsed = JSON.parse(storedAuth);
        setToken(parsed.token);
        setUserId(parsed.userId);

        // 🔹 Fetch user's latest trip from backend
        const res = await axios.get(`${TRIP_BASE}/${parsed.userId}`, {
          headers: { Authorization: `Bearer ${parsed.token}` },
        });

        if (!res.data || !res.data.startingLocation) {
          Alert.alert("No trip found", "Please register a trip first.");
          setLoading(false);
          return;
        }

        const { startingLocation, destination } = res.data;
        const route = [
          {
            latitude: startingLocation.latitude,
            longitude: startingLocation.longitude,
          },
          {
            latitude: destination?.latitude || startingLocation.latitude + 0.5,
            longitude:
              destination?.longitude || startingLocation.longitude + 0.5,
          },
        ];
        setRouteCoords(route);

        // Once route is known, fetch hazards
        await fetchHazards(route);
      } catch (err) {
        console.error("Error initializing route:", err.message);
        Alert.alert("Error", "Unable to load route data.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ---------------- FETCH HAZARD DATA ----------------
  const fetchHazards = async (route) => {
    try {
      const { latitude, longitude } = route[0];
      const res = await axios.get(
        `${WEATHER_BASE}/forecast?lat=${latitude}&lon=${longitude}`,
        { timeout: 10000 } // ✅ no Authorization header here
      );

      if (res.data.success && res.data.data) {
        const forecast = res.data.data;
        const weather = forecast.weather || {};
        const marine = forecast.marine || {};
        const hazardList = [];

        // ⚡ Storm hazard
        if (weather.windSpeed && weather.windSpeed > 2) {
          hazardList.push({
            id: "hazard-wind",
            type: "storm",
            lat: latitude,
            lon: longitude,
            severity: 5,
            description: `Strong winds (${weather.windSpeed} km/h)`,
          });
        }

        // 🌊 Waves hazard
        if (marine.current?.wave_height && marine.current.wave_height > 2.5) {
          hazardList.push({
            id: "hazard-wave",
            type: "waves",
            lat: latitude,
            lon: longitude,
            severity: 4,
            description: `High waves (${marine.current.wave_height} m)`,
          });
        }

        // 🌧 Rain hazard
        if (
          weather.conditions &&
          weather.conditions.toLowerCase().includes("rain")
        ) {
          hazardList.push({
            id: "hazard-rain",
            type: "rain",
            lat: latitude,
            lon: longitude,
            severity: 3,
            description: "Rainy conditions — visibility reduced.",
          });
        }

        // Start animations
        hazardList.forEach((h) => {
          pulseRefs.current[h.id] = new Animated.Value(1);
          animatePulse(h.id);
        });

        // Filter hazards along route
        const minLat = Math.min(route[0].latitude, route[1].latitude);
        const maxLat = Math.max(route[0].latitude, route[1].latitude);
        const minLon = Math.min(route[0].longitude, route[1].longitude);
        const maxLon = Math.max(route[0].longitude, route[1].longitude);

        const hazardsAlongRoute = hazardList.filter(
          (h) =>
            h.lat >= minLat &&
            h.lat <= maxLat &&
            h.lon >= minLon &&
            h.lon <= maxLon
        );

        setHazards(hazardsAlongRoute);
      }
    } catch (err) {
      console.error("Error fetching hazards:", err.message);
      setHazards([]);
    }
  };

  // ---------------- ANIMATION ----------------
  const animatePulse = (id) => {
    const anim = pulseRefs.current[id];
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1.4,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const crossesRestrictedZone = zones.some((zone) =>
    doesRouteCrossZone(routeCoords, zone.coordinates)
  );

  const computeRisk = () => {
    const totalSeverity = hazards.reduce(
      (sum, h) => sum + (h.severity || 1),
      0
    );
    if (crossesRestrictedZone && totalSeverity >= 6)
      return { label: "❌ High Risk", color: "text-red-600" };
    if (crossesRestrictedZone || totalSeverity >= 4)
      return { label: "⚠️ Unsafe", color: "text-yellow-500" };
    return { label: "✅ Safe", color: "text-green-600" };
  };
  const risk = computeRisk();

  // ---------------- LOADING STATE ----------------
  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={1500}
        >
          <MaterialCommunityIcons
            name="map-search-outline"
            size={70}
            color="#3C467B"
          />
        </Animatable.View>

        <Animatable.Text
          animation="fadeIn"
          iterationCount="infinite"
          duration={2000}
          className="text-blue mt-3 font-semibold text-lg"
        >
          Fetching route & hazard data...
        </Animatable.Text>

        <ActivityIndicator
          size="large"
          color="#636CCB"
          style={{ marginTop: 10 }}
        />
      </View>
    );

  // ---------------- MAP UI ----------------
  const getHazardVisuals = (type) => {
    switch (type) {
      case "storm":
        return { icon: "weather-lightning", color: "orange" };
      case "waves":
        return { icon: "waves", color: "red" };
      case "rain":
        return { icon: "weather-pouring", color: "#3B82F6" };
      default:
        return { icon: "alert", color: "gray" };
    }
  };

  return (
    <View className="flex-1 bg-white">
      <MapView
        style={{
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
        }}
        initialRegion={{
          latitude: (routeCoords[0]?.latitude + routeCoords[1]?.latitude) / 2,
          longitude:
            (routeCoords[0]?.longitude + routeCoords[1]?.longitude) / 2,
          latitudeDelta: 0.4,
          longitudeDelta: 0.4,
        }}
      >
        {/* Route markers */}
        <Marker coordinate={routeCoords[0]} title="Departure" pinColor="blue" />
        <Marker
          coordinate={routeCoords[1]}
          title="Destination"
          pinColor="green"
        />

        <Polyline
          coordinates={routeCoords}
          strokeColor="#007AFF"
          strokeWidth={4}
        />

        {/* Protected zones */}
        {zones.map((zone) => (
          <Polygon
            key={zone.id}
            coordinates={zone.coordinates}
            strokeColor="#3C0D99"
            fillColor="rgba(92, 51, 207, 0.25)"
            strokeWidth={2}
          />
        ))}

        {/* Hazards */}
        {hazards.map((h) => {
          const visuals = getHazardVisuals(h.type);
          const scale = pulseRefs.current[h.id] || new Animated.Value(1);
          return (
            <Marker
              key={h.id}
              coordinate={{ latitude: h.lat, longitude: h.lon }}
              onPress={() => setSelectedHazard(h)}
            >
              <Animated.View
                className="items-center justify-center"
                style={{ transform: [{ scale }] }}
              >
                <View className="w-8 h-8 rounded-full bg-red-200 opacity-25 absolute" />
                <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow">
                  <MaterialCommunityIcons
                    name={visuals.icon}
                    size={20}
                    color={visuals.color}
                  />
                </View>
              </Animated.View>
            </Marker>
          );
        })}
      </MapView>

      {/* Trip risk summary */}
      <View className="absolute bottom-32 w-full px-6">
        <View className="bg-white rounded-2xl shadow-md p-4 border border-blue-100 items-center">
          <Text className="text-blue-700 font-bold text-base">
            Trip Risk Summary
          </Text>
          <Text className={`text-2xl font-bold mt-1 ${risk.color}`}>
            {risk.label}
          </Text>
        </View>
      </View>

      {/* Hazard popup */}
      {selectedHazard && (
        <View className="absolute bottom-52 w-full px-5">
          <View className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-bold text-lg text-gray-800">
                {selectedHazard.type === "storm"
                  ? "⚡ Storm Zone"
                  : selectedHazard.type === "waves"
                    ? "🌊 High Wave Area"
                    : "🌧️ Rainy Zone"}
              </Text>
              <Text
                className="text-gray-500 text-lg"
                onPress={() => setSelectedHazard(null)}
              >
                ✕
              </Text>
            </View>
            <Text className="text-gray-700 mb-3">
              {selectedHazard.description}
            </Text>
            <Text className="text-gray-600 font-semibold">
              Severity: {selectedHazard.severity}/5
            </Text>
          </View>
        </View>
      )}

      {/* Legend */}
      <View className="absolute top-14 right-4 bg-white/80 p-2 rounded-lg shadow">
        <View className="flex-row items-center mb-1">
          <View className="w-4 h-4 bg-[#5C33CF]/40 border border-[#3C0D99] mr-2" />
          <Text className="text-xs">Marine Protected Zone</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-red-200 border border-red-500 mr-2" />
          <Text className="text-xs">Weather Hazard</Text>
        </View>
      </View>
    </View>
  );
}
