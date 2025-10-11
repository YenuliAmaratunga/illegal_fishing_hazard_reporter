import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import MapView, { Marker, Polyline, Polygon } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import axios from "axios";
import zones from "../assets/marineZones.json"; // Static Marine Protected Areas (MPAs)

// 🔹 Utility: check if point is inside polygon
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

// 🔹 Utility: check if any part of route crosses a polygon
const doesRouteCrossZone = (route, polygon) => {
  return route.some((p) => isPointInPolygon(p, polygon));
};

export default function RouteHazardMapScreen() {
  const [hazards, setHazards] = useState([]);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [loading, setLoading] = useState(true);
  const pulseRefs = useRef({});

  // 🌍 TEMP: Hardcoded start & end — replace with dynamic user start later
  const start = { lat: 6.906, lon: 79.8763 }; // Near Thimbirigasyaya
  const end = { lat: 6.0, lon: 80.25 }; // Example destination
  const routeCoords = [
    { latitude: start.lat, longitude: start.lon },
    { latitude: end.lat, longitude: end.lon },
  ];

  useEffect(() => {
    const fetchHazards = async () => {
      try {
        // 🔹 Using hardcoded start for now; can replace with Location API later
        const latitude = start.lat;
        const longitude = start.lon;

        // 🔹 Call backend for hazards/weather at start location
        const res = await axios.get(
          `https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/weather-service/v1.0/api/weather/forecast?lat=${latitude}&lon=${longitude}`,
          { timeout: 10000 }
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

          // 🔹 Initialize pulse animation
          hazardList.forEach((h) => {
            pulseRefs.current[h.id] = new Animated.Value(1);
            animatePulse(h.id);
          });

          // 🔹 Filter hazards along route
          const hazardsAlongRoute = hazardList.filter((h) => {
            // For straight route, simple bounding box check
            const minLat = Math.min(start.lat, end.lat);
            const maxLat = Math.max(start.lat, end.lat);
            const minLon = Math.min(start.lon, end.lon);
            const maxLon = Math.max(start.lon, end.lon);
            return (
              h.lat >= minLat &&
              h.lat <= maxLat &&
              h.lon >= minLon &&
              h.lon <= maxLon
            );
          });

          setHazards(hazardsAlongRoute);
        } else {
          console.warn("No forecast data found or malformed response");
          setHazards([]);
        }
      } catch (err) {
        console.error("Error fetching hazards:", err.message);
        setHazards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHazards();
  }, []);

  // 🔄 Animated pulsing effect for hazard markers
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
          Loading hazard data...
        </Animatable.Text>

        <ActivityIndicator
          size="large"
          color="#636CCB"
          style={{ marginTop: 10 }}
        />
      </View>
    );

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
          latitude: (start.lat + end.lat) / 2,
          longitude: (start.lon + end.lon) / 2,
          latitudeDelta: 0.4,
          longitudeDelta: 0.4,
        }}
      >
        {/* 🟢 Start & End markers */}
        <Marker
          coordinate={{ latitude: start.lat, longitude: start.lon }}
          title="Departure"
          description="Start point (replace later)"
          pinColor="blue"
        />
        <Marker
          coordinate={{ latitude: end.lat, longitude: end.lon }}
          title="Destination"
          description="End point (replace later)"
          pinColor="green"
        />

        {/* 🛣️ Route line */}
        <Polyline
          coordinates={routeCoords}
          strokeColor="#007AFF"
          strokeWidth={4}
        />

        {/* 🐢 Marine Protected Zones */}
        {zones.map((zone) => (
          <Polygon
            key={zone.id}
            coordinates={zone.coordinates}
            strokeColor="#3C0D99"
            fillColor="rgba(92, 51, 207, 0.25)"
            strokeWidth={2}
          />
        ))}

        {/* ⚡ Hazard Markers */}
        {hazards.map((h) => {
          const visuals = getHazardVisuals(h.type);
          const scale = pulseRefs.current[h.id] || new Animated.Value(1);
          return (
            <Marker
              key={h.id}
              coordinate={{ latitude: h.lat, longitude: h.lon }}
              title={h.type}
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

      {/* ⚠️ Trip Risk Summary */}
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

      {/* 🧾 Hazard Popup */}
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

      {/* 🧭 Legend */}
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
