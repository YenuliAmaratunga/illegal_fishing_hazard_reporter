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
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  updateBoatLocation,
  sendSOS as apiSendSOS,
} from "../api/client";

const { width, height } = Dimensions.get("window");

export default function GPSTrackingScreen({ navigation }) {
  const mapRef = useRef(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const [boatId, setBoatId] = useState(null); // nationalId stored as boatId in BE
  const [myPos, setMyPos] = useState(null); // { latitude, longitude }
  //const [sosActive, setSosActive] = useState(false);
  const [sending, setSending] = useState(false);

  // read auth once to get boatId (nationalId)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("auth");
        const auth = JSON.parse(raw || "{}");
        const id =
          auth?.user?.nationalId || auth?.boatId || auth?.userId || "BOAT_123"; // final fallback
        setBoatId(id);
        console.log("[gps] boatId:", id);
      } catch (e) {
        console.log("[gps] failed to load auth:", e?.message);
      }
    })();
  }, []);

  // SOS pulse animation
  useEffect(() => {
    const loop = Animated.loop(
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
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // get location once; send initial update if we already know boatId
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

      if (boatId) {
        try {
          console.log("[gps] initial update →", coord);
          await updateBoatLocation(boatId, coord.latitude, coord.longitude);
        } catch (e) {
          console.log("[gps] initial update failed:", e?.message);
        }
      }
    })();
  }, [boatId]);

  // push location every 60s (single request at a time)
  useEffect(() => {
    if (!boatId) return;
    let busy = false;
    const iv = setInterval(async () => {
      try {
        if (busy) return;
        busy = true;
        const pos = await Location.getCurrentPositionAsync({});
        const coord = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setMyPos(coord);
        console.log("[gps] tick update →", coord);
        await updateBoatLocation(boatId, coord.latitude, coord.longitude);
      } catch (e) {
        console.log("[gps] tick update failed:", e?.message);
      } finally {
        busy = false;
      }
    }, 60000);
    return () => clearInterval(iv);
  }, [boatId]);

  const recenter = () => {
    if (!myPos || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { ...myPos, latitudeDelta: 0.045, longitudeDelta: 0.045 },
      450
    );
  };

  const confirmSendSOS = () => {
    if (!boatId || !myPos) {
      Alert.alert("Missing data", "Boat ID or location not ready yet.");
      return;
    }
    Alert.alert(
      "Confirm SOS",
      "This will immediately alert Marine Police and share your live location.\n\n" +
        "⚠️ Use ONLY for real emergencies. False SOS can get you in trouble.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send SOS", style: "destructive", onPress: doSendSOS },
      ]
    );
  };

  const doSendSOS = async () => {
    if (sending) return;
    setSending(true);
    try {
      console.log("[gps] SOS →", { boatId, ...myPos });
      await apiSendSOS(boatId, myPos.latitude, myPos.longitude);
      Alert.alert("SOS sent", "Marine Police have been notified. Stay safe.");
    } catch (e) {
      console.log("[gps] SOS error:", e?.message);
      Alert.alert("Error", "Failed to send SOS.");
    } finally {
      setSending(false);
    }
  };

  if (!myPos) {
    return (
      <View className="flex-1 bg-seaGreen justify-center items-center">
        <Text className="text-white text-lg">Getting your location…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: 6 }}>
      {/* Header */}
      <View className="px-4 pb-2 items-center">
        <Text className="text-[20px] font-extrabold text-blue text-center">   
          Report Center
        </Text>
        <Text className="text-[12px] text-[#6E8CFB99] text-center mt-0.5">
          SOS • New Report • My Reports
        </Text>
          
        <View className="bg-lightPurple/80 rounded-full px-3 py-1 mt-2">
          <Text className="text-blue text-[11px] font-semibold">Live</Text>
        </View>
      </View>

      {/* Map */}
      <View
        className="mx-4 shadow"
        style={{
          width: width - 32,
          height: height * 0.48,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#50589C33",
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        <MapView
          ref={mapRef}
          style={{ width: "100%", height: "100%" }}
          showsUserLocation={false} // no blue dot
          showsCompass // keep the compass
          initialRegion={{
            latitude: myPos.latitude,
            longitude: myPos.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          onMapReady={recenter}
        >
          {/* Custom boat marker */}
          <Marker coordinate={myPos} title="Your Boat">
            <View className="items-center">
              <View className="w-9 h-9 rounded-full bg-white items-center justify-center shadow">
                <MaterialCommunityIcons
                  name="ferry"
                  size={20}
                  color="#3C467B"
                />
              </View>
              <Text className="text-[10px] mt-1 text-blue">You</Text>
            </View>
          </Marker>
        </MapView>

        {/* Recenter*/}
        <TouchableOpacity
          onPress={recenter}
          className="absolute right-3 bottom-3 bg-white rounded-full w-12 h-12 items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4,
          }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={22}
            color="#3C467B"
          />
        </TouchableOpacity>
      </View>

      {/* Coords */}
      <View className="px-4 mt-2">
        <Text className="text-darkBlue font-semibold">
          Your Position: {myPos.latitude.toFixed(6)},{" "}
          {myPos.longitude.toFixed(6)}
        </Text>
      </View>

      {/* SOS + Cancel */}
      <View className="px-4 mt-3">
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <TouchableOpacity
            onPress={confirmSendSOS}
            disabled={sending}
            activeOpacity={0.9}
            className="bg-red-600 rounded-2xl py-4 items-center"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text className="text-white text-[18px] font-extrabold">
              🚨 SOS – EMERGENCY
            </Text>
            <Text className="text-white/80 text-[12px] mt-1">
              Sends your live location to Marine Police
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </View>

      {/* Secondary actions */}
      <View className="px-4 mt-8">
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={() => navigation.navigate("ReportTypePicker")}
            className="flex-1 mr-3 bg-white border border-blueLight rounded-2xl py-4 items-center"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <MaterialCommunityIcons
              name="note-plus"
              size={20}
              color="#50589C"
            />
            <Text className="text-blue font-bold mt-1">New Report</Text>
            <Text className="text-[#6E8CFB99] text-[11px] mt-0.5">
              Hazard or Violation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("MyReports")}
            className="flex-1 ml-3 bg-white border border-blueLight rounded-2xl py-4 items-center"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <MaterialCommunityIcons
              name="folder-account"
              size={20}
              color="#50589C"
            />
            <Text className="text-blue font-bold mt-1">My Reports</Text>
            <Text className="text-[#6E8CFB99] text-[11px] mt-0.5">
              View & edit
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-6" />
      </View>
    </SafeAreaView>
  );
}
