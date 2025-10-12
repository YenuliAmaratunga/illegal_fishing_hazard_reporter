import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
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

// Compute approximate center of polygon
const getPolygonCenter = (coordinates) => {
  const lats = coordinates.map((c) => c.latitude);
  const lons = coordinates.map((c) => c.longitude);
  const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const lon = (Math.min(...lons) + Math.max(...lons)) / 2;
  return { latitude: lat, longitude: lon };
};

export default function RouteHazardMapScreen() {
  const [token, setToken] = useState(null);
  const [hazards, setHazards] = useState([]);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState([]);
  const mapRef = useRef(null);

  // ---------------- AUTH + FETCH ROUTE ----------------
  useEffect(() => {
    const init = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem("authData");
        if (!storedAuth) {
          Alert.alert("Session expired", "Please log in again.");
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(storedAuth);
        setToken(parsed.token);

        const res = await axios.get(`${TRIP_BASE}/api/Trip/latestTrip`, {
          headers: { Authorization: `Bearer ${parsed.token}` },
        });

        if (!res.data?.trip?.startingLocation) {
          Alert.alert("No trip found", "Please register a trip first.");
          setLoading(false);
          return;
        }

        const trip = res.data.trip;
        const startingLocation = trip.startingLocation;
        const headingDeg = trip.heading ?? 0;
        const distanceKm = 15;

        const computeDestination = (lat, lon, heading, distanceKm) => {
          const R = 6371;
          const brng = (heading * Math.PI) / 180;
          const lat1 = (lat * Math.PI) / 180;
          const lon1 = (lon * Math.PI) / 180;

          const lat2 = Math.asin(
            Math.sin(lat1) * Math.cos(distanceKm / R) +
              Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(brng)
          );
          const lon2 =
            lon1 +
            Math.atan2(
              Math.sin(brng) * Math.sin(distanceKm / R) * Math.cos(lat1),
              Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
            );

          return {
            latitude: (lat2 * 180) / Math.PI,
            longitude: (lon2 * 180) / Math.PI,
          };
        };

        const dest = computeDestination(
          startingLocation.latitude,
          startingLocation.longitude,
          headingDeg,
          distanceKm
        );

        const route = [
          { latitude: startingLocation.latitude, longitude: startingLocation.longitude },
          dest,
        ];

        setRouteCoords(route);
        await fetchHazards(route);

        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.fitToCoordinates(route, {
              edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
              animated: true,
            });
          }
        }, 500);
      } catch (err) {
        console.error("Error initializing route:", err.response?.data || err.message);
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
      const numIntervals = 4;
      const [start, end] = route;

      const intervalPoints = Array.from({ length: numIntervals }, (_, i) => ({
        latitude: start.latitude + ((end.latitude - start.latitude) * (i + 1)) / (numIntervals + 1),
        longitude: start.longitude + ((end.longitude - start.longitude) * (i + 1)) / (numIntervals + 1),
      }));

      const results = await Promise.all(
        intervalPoints.map((point) =>
          axios
            .get(`${WEATHER_BASE}/forecast?lat=${point.latitude}&lon=${point.longitude}`, { timeout: 10000 })
            .then((res) => ({ point, data: res.data }))
            .catch((err) => ({ point, error: err }))
        )
      );

      const allHazards = [];

      results.forEach(({ point, data, error }) => {
        if (error) return;

        if (data?.success && data.data) {
          const forecast = data.data;
          const weather = forecast.weather || {};
          const marine = forecast.marine || {};

          if (weather.windSpeed && weather.windSpeed > 5) {
            allHazards.push({
              id: `wind-${point.latitude.toFixed(4)}-${point.longitude.toFixed(4)}`,
              type: "storm",
              lat: point.latitude,
              lon: point.longitude,
              severity: 5,
              description: `Strong winds (${weather.windSpeed} km/h)`,
            });
          }

          if (marine.current?.wave_height && marine.current.wave_height > 2.5) {
            allHazards.push({
              id: `wave-${point.latitude.toFixed(4)}-${point.longitude.toFixed(4)}`,
              type: "waves",
              lat: point.latitude,
              lon: point.longitude,
              severity: 4,
              description: `High waves (${marine.current.wave_height} m)`,
            });
          }

          if (weather.conditions?.toLowerCase().includes("rain")) {
            allHazards.push({
              id: `rain-${point.latitude.toFixed(4)}-${point.longitude.toFixed(4)}`,
              type: "rain",
              lat: point.latitude,
              lon: point.longitude,
              severity: 3,
              description: "Rainy conditions — visibility reduced.",
            });
          }
        }
      });

      setHazards(allHazards);
    } catch (err) {
      console.error("Error fetching hazards:", err.message);
      setHazards([]);
    }
  };

  // ---------------- RISK ----------------
  const crossesRestrictedZone = zones.some((zone) =>
    doesRouteCrossZone(routeCoords, zone.coordinates)
  );

  const computeRisk = () => {
    const totalSeverity = hazards.reduce((sum, h) => sum + (h.severity || 1), 0);
    if (crossesRestrictedZone && totalSeverity >= 6)
      return { label: "❌ High Risk", color: "text-red-600" };
    if (crossesRestrictedZone || totalSeverity >= 4)
      return { label: "⚠️ Unsafe", color: "text-yellow-500" };
    return { label: "✅ Safe", color: "text-green-600" };
  };

  const risk = computeRisk();

  // ---------------- LOADING ----------------
  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <Animatable.View animation="pulse" iterationCount="infinite" duration={1500}>
          <MaterialCommunityIcons name="map-search-outline" size={70} color="#3C467B" />
        </Animatable.View>
        <Animatable.Text
          animation="fadeIn"
          iterationCount="infinite"
          duration={2000}
          style={{ color: "#3C467B", marginTop: 12, fontWeight: "600", fontSize: 18 }}
        >
          Fetching route & hazard data...
        </Animatable.Text>
        <ActivityIndicator size="large" color="#636CCB" style={{ marginTop: 10 }} />
      </View>
    );

  // ---------------- MAP ----------------
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <MapView
        ref={mapRef}
        style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height }}
        initialRegion={{
          latitude: 6.925,
          longitude: 79.925,
          latitudeDelta: 0.4,
          longitudeDelta: 0.4,
        }}
      >
        {/* Route */}
        {routeCoords.length === 2 && (
          <>
            <Marker coordinate={routeCoords[0]} title="Departure" pinColor="blue" />
            <Marker coordinate={routeCoords[1]} title="Destination" pinColor="green" />
            <Polyline coordinates={routeCoords} strokeColor="#007AFF" strokeWidth={4} />
          </>
        )}

        {/* Marine Zones */}
        {zones.map((zone) => (
          <Polygon
            key={zone.id}
            coordinates={zone.coordinates}
            strokeColor="#3C0D99"
            fillColor="rgba(92, 51, 207, 0.25)"
            strokeWidth={2}
          />
        ))}

        {/* MPA Labels */}
        {zones.map((zone) => {
          const center = getPolygonCenter(zone.coordinates);
          return (
            <Marker
              key={`${zone.id}-label`}
              coordinate={center}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#3C467B",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 1,
                  elevation: 2,
                }}
              >
                <Text style={{ color: "#3C467B", fontSize: 12, fontWeight: "bold" }}>
                  {zone.name}
                </Text>
              </View>
            </Marker>
          );
        })}

        {/* Hazards */}
        {hazards.map((h) => {
          const visuals = getHazardVisuals(h.type);
          return (
            <Marker
              key={h.id}
              coordinate={{ latitude: h.lat, longitude: h.lon }}
              onPress={() => setSelectedHazard(h)}
            >
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "rgba(255,0,0,0.15)",
                  position: "absolute"
                }} />
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 1,
                  elevation: 2,
                }}>
                  <MaterialCommunityIcons name={visuals.icon} size={20} color={visuals.color} />
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Trip Risk Summary */}
      <View style={{
        position: "absolute",
        bottom: 20,
        width: "100%",
        paddingHorizontal: 24,
      }}>
        <View style={{
          backgroundColor: "white",
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: "#D6DBF7",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1,
          elevation: 3,
        }}>
          <Text style={{ color: "#3C467B", fontWeight: "bold", fontSize: 16 }}>Trip Risk Summary</Text>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 4, color: risk.color.includes("red") ? "red" : risk.color.includes("yellow") ? "orange" : "green" }}>
            {risk.label}
          </Text>
        </View>
      </View>

      {/* Hazard Details */}
      {selectedHazard && (
        <View style={{
          position: "absolute",
          bottom: 160,
          width: "100%",
          paddingHorizontal: 20,
        }}>
          <View style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: "#D6DBF7",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 4,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontWeight: "bold", fontSize: 18, color: "#4B5563" }}>
                {selectedHazard.type === "storm"
                  ? "⚡ Storm Zone"
                  : selectedHazard.type === "waves"
                  ? "🌊 High Wave Area"
                  : "🌧️ Rainy Zone"}
              </Text>
              <Text style={{ fontSize: 18, color: "#6B7280" }} onPress={() => setSelectedHazard(null)}>✕</Text>
            </View>
            <Text style={{ color: "#4B5563", marginBottom: 8 }}>{selectedHazard.description}</Text>
            <Text style={{ color: "#374151", fontWeight: "600" }}>Severity: {selectedHazard.severity}/5</Text>
          </View>
        </View>
      )}

      {/* Legend */}
      <View style={{
        position: "absolute",
        top: 56,
        right: 16,
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: 8,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 3,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <View style={{ width: 16, height: 16, backgroundColor: "rgba(92,51,207,0.25)", borderWidth: 1, borderColor: "#3C0D99", marginRight: 4 }} />
          <Text style={{ fontSize: 12 }}>Marine Protected Zone</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 16, height: 16, backgroundColor: "rgba(255,0,0,0.15)", borderWidth: 1, borderColor: "red", marginRight: 4 }} />
          <Text style={{ fontSize: 12 }}>Weather Hazard</Text>
        </View>
      </View>
    </View>
  );
}
