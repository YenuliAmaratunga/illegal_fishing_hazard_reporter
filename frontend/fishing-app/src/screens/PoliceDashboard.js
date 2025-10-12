import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Image,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AlertTriangle, MapPin, Check, Compass, LogOut } from "lucide-react-native";

import {
  getLatestBoats,         
  getActiveAlerts,        
  getViolationReports,    
  getHazardReports,
  verifyViolation as apiVerifyViolation,
  resolveHazard as apiResolveHazard,
} from "../api/client";

const fmtCoord = (n) => (typeof n === "number" ? n.toFixed(4) : "—");

function SectionTitle({ children }) {
  return <Text className="text-blue font-bold text-lg px-4 mt-2 mb-2">{children}</Text>;
}

export default function PoliceDashboard() {
  const navigation = useNavigation();

  const [tab, setTab] = useState("sos");

  const mapRef = useRef(null);     
  const [boats, setBoats] = useState([]);             
  const [loadingBoats, setLoadingBoats] = useState(false);
  const [focusedBoat, setFocusedBoat] = useState(null);   

  const [alerts, setAlerts] = useState([]);         
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const [loadingReports, setLoadingReports] = useState(false);
  const [violations, setViolations] = useState([]);
  const [hazards, setHazards] = useState([]);

  const [reportType, setReportType] = useState("all");   
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [refreshing, setRefreshing] = useState(false);     

  const sosList = useMemo(() => {

    return alerts.map(a => ({
      id: a._id,
      boatId: a.boatId || "UNKNOWN",
      lat: a.location?.latitude,
      lng: a.location?.longitude,
      status: a.status || "active",
      when: a.timestamp,
    })).filter(a => typeof a.lat === "number" && typeof a.lng === "number");
  }, [alerts]);


  const filteredViolations = useMemo(() => {
    if (reportType !== "all" && reportType !== "violation") return [];
    return violations.filter((r) =>
      statusFilter === "all" ? true : (r.status || "").toLowerCase() === statusFilter
    );
  }, [violations, reportType, statusFilter]);

  const filteredHazards = useMemo(() => {
    if (reportType !== "all" && reportType !== "hazard") return [];
    return hazards.filter((r) =>
      statusFilter === "all" ? true : (r.status || "").toLowerCase() === statusFilter
    );
  }, [hazards, reportType, statusFilter]);

  // ---- load boats for the map (from GPS service)
  const loadBoats = useCallback(async () => {
    setLoadingBoats(true);
    try {
      const res = await getLatestBoats();
      const raw = res?.data || res || [];
      // normalize output whether it's {_id, latestLocation:{...}} or flat
      const normalized = raw
        .map((row) => {
          const source = row.latestLocation || row.latest || row;
          return {
            boatId: row._id || row.boatId || source?.boatId,
            name: row.name || row.boatName || `Boat ${row._id || row.boatId || "?"}`,
            lat: source?.latitude ?? row.latitude,
            lng: source?.longitude ?? row.longitude,
            status: (source?.status ?? row.status) || "active",
          };
        })
        .filter((b) => typeof b.lat === "number" && typeof b.lng === "number");

      setBoats(normalized);

      // if user is on MAP tab, fit the visible markers automatically
      if (mapRef.current && normalized.length && tab === "map") {
        mapRef.current.fitToCoordinates(
          normalized.map((b) => ({ latitude: b.lat, longitude: b.lng })),
          { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true }
        );
      }
    } catch (e) {
      console.log("loadBoats error:", e.message);
    } finally {
      setLoadingBoats(false);
    }
  }, [tab]);

  // ---- load active alerts (Marine Police service)
  const loadAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await getActiveAlerts();         // may be {success:true, data:[...]} or raw array
      const list =
        Array.isArray(res) ? res :
        Array.isArray(res?.data) ? res.data :
        Array.isArray(res?.data?.data) ? res.data.data : [];
      // keep only 'active' (API should already filter, but be safe)
      const active = list.filter(a => (a.status || "").toLowerCase() === "active");
      setAlerts(active);
    } catch (e) {
      console.log("loadAlerts error:", e.message);
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  // initial & interval fetchers
  useEffect(() => {
    loadAlerts();             // alerts power the SOS tab
    loadBoats();              // boats power the map tab
    const iv = setInterval(() => {
      loadAlerts();
      loadBoats();
    }, 60_000);
    return () => clearInterval(iv);
  }, [loadAlerts, loadBoats]);

  // fetch reports when user goes to the Reports tab
  useEffect(() => {
    if (tab === "reports") {
      (async () => {
        setLoadingReports(true);
        try {
          const [v, h] = await Promise.all([getViolationReports(), getHazardReports()]);
          setViolations(Array.isArray(v?.data) ? v.data : Array.isArray(v) ? v : []);
          setHazards(Array.isArray(h?.data) ? h.data : Array.isArray(h) ? h : []);
        } catch (e) {
          console.log("loadReports error:", e.message);
        } finally {
          setLoadingReports(false);
        }
      })();
    }
  }, [tab]);

  // pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadAlerts(), loadBoats()]);
      if (tab === "reports") {
        const [v, h] = await Promise.all([getViolationReports(), getHazardReports()]);
        setViolations(Array.isArray(v?.data) ? v.data : Array.isArray(v) ? v : []);
        setHazards(Array.isArray(h?.data) ? h.data : Array.isArray(h) ? h : []);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // report actions (unchanged)
  const onVerifyViolation = async (id) => {
    try {
      await apiVerifyViolation(id);
      if (tab === "reports") {
        const v = await getViolationReports();
        setViolations(Array.isArray(v?.data) ? v.data : Array.isArray(v) ? v : []);
      }
    } catch {
      Alert.alert("Error", "Failed to verify violation");
    }
  };

  const onResolveHazard = async (id) => {
    try {
      await apiResolveHazard(id);
      if (tab === "reports") {
        const h = await getHazardReports();
        setHazards(Array.isArray(h?.data) ? h.data : Array.isArray(h) ? h : []);
      }
    } catch {
      Alert.alert("Error", "Failed to resolve hazard");
    }
  };

  // logout clears local auth and returns to Login
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("auth");
    } catch {}
    navigation.reset({ index: 0, routes: [{ name: "Login", params: { language: "en" } }] });
  };

  // tiny components
  function TabButton({ value, label }) {
    const active = tab === value;
    return (
      <TouchableOpacity
        onPress={() => setTab(value)}
        className={`px-4 py-2 rounded-full mr-2 border ${active ? "bg-blueLight border-blueLight" : "border-blueLight"}`}
      >
        <Text className={`${active ? "text-white" : "text-blue"} font-semibold`}>{label}</Text>
      </TouchableOpacity>
    );
  }

  function FilterChip({ value, current, onChange, label }) {
    const active = current === value;
    return (
      <TouchableOpacity
        onPress={() => onChange(value)}
        className={`px-3 py-1.5 rounded-full mr-2 border ${active ? "bg-blueLight border-blueLight" : "border-blueLight"}`}
      >
        <Text className={`${active ? "text-white" : "text-blue"} text-xs font-semibold`}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-blue">Marine Police</Text>
          <Text className="text-secondaryText">SOS • Boats • Reports</Text>
        </View>
        <TouchableOpacity className="flex-row items-center bg-lightPurple px-3 py-2 rounded-xl" onPress={handleLogout}>
          <LogOut size={16} color="#3C467B" />
          <Text className="ml-2 text-blue font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row mt-1 px-4">
        <TabButton value="sos" label="SOS" />
        <TabButton value="map" label="Map" />
        <TabButton value="reports" label="Reports" />
      </View>

      {/* SOS tab → now shows Active Alerts from Marine Police */}
      {tab === "sos" && (
        <View className="flex-1">
          <View className="mx-4 mt-3 mb-3 bg-red-600 rounded-2xl px-4 py-3 shadow">
            <View className="flex-row items-center">
              <AlertTriangle color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Active SOS: {loadingAlerts ? "…" : sosList.length}
              </Text>
            </View>
            <Text className="text-white/90 mt-1">Tap a case to zoom on map and view details.</Text>
          </View>

          {loadingAlerts ? (
            <ActivityIndicator style={{ marginTop: 16 }} />
          ) : (
            <FlatList
              data={sosList}
              keyExtractor={(a) => a.id}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={
                <View className="items-center mt-10">
                  <Text className="text-secondaryText">No active SOS</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="bg-white border border-lightPurple rounded-2xl p-4 mx-4 mb-3"
                  onPress={() => {
                    setTab("map");
                    setTimeout(() => {
                      if (mapRef.current && typeof item.lat === "number" && typeof item.lng === "number") {
                        mapRef.current.animateToRegion(
                          { latitude: item.lat, longitude: item.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 },
                          500
                        );
                      }
                      // Show a simple focus sheet using the same field names as boats
                      setFocusedBoat({
                        name: `Boat ${item.boatId}`,
                        lat: item.lat,
                        lng: item.lng,
                        status: "sos",
                      });
                    }, 250);
                  }}
                >
                  <View className="flex-row items-center">
                    <AlertTriangle color="#E53935" />
                    <Text className="ml-2 text-blue font-bold">
                      {item.boatId} — SOS
                    </Text>
                  </View>
                  <Text className="text-secondaryText mt-1">
                    {fmtCoord(item.lat)}, {fmtCoord(item.lng)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {/* MAP tab (unchanged) – shows boats; we also let SOS list jump here */}
      {tab === "map" && (
        <View className="flex-1 mx-4 mb-4 mt-3 rounded-2xl overflow-hidden border border-lightPurple">
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            showsCompass
            rotateEnabled
            pitchEnabled
            showsUserLocation={false}
            initialRegion={{
              latitude: 7.8731,
              longitude: 80.7718,
              latitudeDelta: 6,
              longitudeDelta: 6,
            }}
          >
            {boats.map((b) => {
              const isSOS = (b.status || "").toLowerCase() === "sos";
              return (
                <Marker
                  key={`${b.boatId}-${b.lat}-${b.lng}`}
                  coordinate={{ latitude: b.lat, longitude: b.lng }}
                  pinColor={isSOS ? "#E53935" : "#50589C"}
                  onPress={() => setFocusedBoat(b)}
                >
                  {isSOS && (
                    <View className="bg-red-600 px-2 py-0.5 rounded-full -mt-6">
                      <Text className="text-white text-[10px]">SOS</Text>
                    </View>
                  )}
                  <Callout onPress={() => setFocusedBoat(b)}>
                    <View style={{ maxWidth: 220 }}>
                      <Text style={{ fontWeight: "700", color: "#3C467B", marginBottom: 4 }}>
                        {b.name}
                      </Text>
                      <Text style={{ color: "#3C467B" }}>
                        {fmtCoord(b.lat)}, {fmtCoord(b.lng)}
                      </Text>
                      {isSOS && (
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                          <AlertTriangle size={14} color="#E53935" />
                          <Text style={{ color: "#E53935", marginLeft: 6, fontWeight: "600" }}>
                            Active SOS
                          </Text>
                        </View>
                      )}
                      <Text style={{ color: "#6E8CFB", marginTop: 6 }}>Tap to open</Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>

          <TouchableOpacity
            className="absolute right-3 bottom-3 bg-white/95 rounded-full px-3 py-2 border border-lightPurple"
            onPress={() => {
              if (!boats.length || !mapRef.current) return;
              mapRef.current.fitToCoordinates(
                boats.map((b) => ({ latitude: b.lat, longitude: b.lng })),
                { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true }
              );
            }}
          >
            <View className="flex-row items-center">
              <Compass size={16} color="#3C467B" />
              <Text className="ml-2 text-blue font-semibold">Fit all</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* REPORTS tab (unchanged UI; powered by verify/resolve handlers above) */}
      {tab === "reports" && (
        <View className="flex-1">
          {/* filters */}
          <View className="px-4 mt-3">
            <View className="flex-row items-center mb-2">
              <Text className="text-blue mr-2">Type:</Text>
              <FilterChip value="all" current={reportType} onChange={setReportType} label="All" />
              <FilterChip value="violation" current={reportType} onChange={setReportType} label="Violations" />
              <FilterChip value="hazard" current={reportType} onChange={setReportType} label="Hazards" />
            </View>
            <View className="flex-row items-center">
              <Text className="text-blue mr-2">Status:</Text>
              <FilterChip value="all" current={statusFilter} onChange={setStatusFilter} label="All" />
              <FilterChip value="pending" current={statusFilter} onChange={setStatusFilter} label="Pending" />
              <FilterChip value="verified" current={statusFilter} onChange={setStatusFilter} label="Verified" />
              <FilterChip value="resolved" current={statusFilter} onChange={setStatusFilter} label="Resolved" />
            </View>
          </View>

          {loadingReports ? (
            <ActivityIndicator style={{ marginTop: 16 }} />
          ) : (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 24 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              <SectionTitle>Violation Reports</SectionTitle>
              {filteredViolations.length === 0 ? (
                <Text className="text-secondaryText px-4 mb-4">None</Text>
              ) : (
                filteredViolations.map((r) => (
                  <View key={r._id} className="bg-white border border-lightPurple rounded-2xl p-4 mx-4 mb-3">
                    <Text className="text-blue font-bold">{r.violationType || "Violation"}</Text>
                    <Text className="text-secondaryText mt-1">{r.description}</Text>

                    {!!r?.evidence?.imageUrl?.length && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                        {r.evidence.imageUrl.map((u, i) => (
                          <Image key={i} source={{ uri: u }} className="w-24 h-24 rounded-xl mr-2" />
                        ))}
                      </ScrollView>
                    )}

                    <View className="flex-row mt-3 space-x-3 items-center">
                      <View className="px-2 py-1 rounded-full bg-[#EEF0FF]">
                        <Text className="text-blue text-xs font-semibold capitalize">{r.status || "pending"}</Text>
                      </View>

                      {(r.status || "").toLowerCase() !== "verified" && (
                        <TouchableOpacity className="px-3 py-2 bg-green-600 rounded-xl" onPress={() => onVerifyViolation(r._id)}>
                          <View className="flex-row items-center">
                            <Check size={16} color="white" />
                            <Text className="text-white ml-2">Verify</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}

              <SectionTitle>Hazard Reports</SectionTitle>
              {filteredHazards.length === 0 ? (
                <Text className="text-secondaryText px-4">None</Text>
              ) : (
                filteredHazards.map((r) => (
                  <View key={r._id} className="bg-white border border-lightPurple rounded-2xl p-4 mx-4 mb-3">
                    <Text className="text-blue font-bold">{r.hazardType || "Hazard"}</Text>
                    <Text className="text-secondaryText mt-1">{r.description}</Text>

                    {!!r?.evidence?.imageUrl?.length && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                        {r.evidence.imageUrl.map((u, i) => (
                          <Image key={i} source={{ uri: u }} className="w-24 h-24 rounded-xl mr-2" />
                        ))}
                      </ScrollView>
                    )}

                    <View className="flex-row mt-3 items-center">
                      <View className="px-2 py-1 rounded-full bg-[#EEF0FF] mr-2">
                        <Text className="text-blue text-xs font-semibold capitalize">{r.status || "pending"}</Text>
                      </View>

                      {(r.status || "").toLowerCase() !== "resolved" && (
                        <TouchableOpacity className="px-3 py-2 bg-blue rounded-xl" onPress={() => onResolveHazard(r._id)}>
                          <Text className="text-white font-semibold">Mark Resolved</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Boat detail modal (used for both boats and focused alert we mapped to boat-shape) */}
      <Modal transparent animationType="slide" visible={!!focusedBoat} onRequestClose={() => setFocusedBoat(null)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl p-4">
            {focusedBoat && (
              <>
                <Text className="text-blue font-bold text-xl">{focusedBoat.name || "Selected Boat"}</Text>
                <Text className="text-secondaryText mt-1">
                  {fmtCoord(focusedBoat.lat)}, {fmtCoord(focusedBoat.lng)} •{" "}
                  {(focusedBoat.status || "active").toUpperCase()}
                </Text>
                <View className="flex-row mt-3 space-x-3">
                  <View className="px-3 py-2 bg-lightPurple rounded-xl">
                    <View className="flex-row items-center">
                      <MapPin size={16} color="#3C467B" />
                      <Text className="text-blue ml-2">Copy coords</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity className="mt-4 bg-blue rounded-2xl py-3 items-center" onPress={() => setFocusedBoat(null)}>
                  <Text className="text-white font-bold">Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
