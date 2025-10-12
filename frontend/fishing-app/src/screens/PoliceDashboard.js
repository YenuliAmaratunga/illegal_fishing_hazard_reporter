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

      {/* Enhanced Tabs */}
      <View className="flex-row mt-3 px-6 bg-white border-b border-lightPurple pb-2">
        <TabButton value="sos" label="🚨 SOS Alerts" />
        <TabButton value="map" label="🗺️ Live Map" />
        <TabButton value="reports" label="📋 Reports" />
      </View>

      {/* Enhanced SOS tab */}
      {tab === "sos" && (
        <View className="flex-1">
          {/* Fixed SOS Alert Banner - Properly red and visible */}
          <View className="mx-6 mt-4 mb-4 bg-red-600 rounded-2xl px-5 py-4 shadow-lg">
            <View className="flex-row items-center">
              <View className="bg-white/20 rounded-full p-2 mr-3">
                <AlertTriangle color="white" size={22} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-heading font-bold text-xl">
                  Active SOS Alerts: {loadingAlerts ? "..." : sosList.length}
                </Text>
                <Text className="text-white/90 text-sm font-sans mt-1">
                  Emergency situations requiring immediate attention
                </Text>
              </View>
            </View>
          </View>

          {loadingAlerts ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#DC2626" />
              <Text className="text-darkBlue font-sans mt-4">Loading emergency alerts...</Text>
            </View>
          ) : (
            <FlatList
              data={sosList}
              keyExtractor={(a) => a.id}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
              ListEmptyComponent={
                <View className="items-center mt-16">
                  <View className="bg-green-50 rounded-3xl p-8 items-center border border-green-200">
                    <Text className="text-4xl mb-4">✅</Text>
                    <Text className="text-darkBlue font-heading font-bold text-xl mb-2">All Clear!</Text>
                    <Text className="text-secondaryText text-center font-sans">
                      No active emergency alerts at this time
                    </Text>
                  </View>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="bg-white rounded-3xl p-5 mb-4 border-2 border-red-200 shadow-xl"
                  style={{
                    shadowColor: "#DC2626",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                  }}
                  onPress={() => {
                    setTab("map");
                    setTimeout(() => {
                      if (mapRef.current && typeof item.lat === "number" && typeof item.lng === "number") {
                        mapRef.current.animateToRegion(
                          { latitude: item.lat, longitude: item.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 },
                          500
                        );
                      }
                      setFocusedBoat({
                        name: `Boat ${item.boatId}`,
                        lat: item.lat,
                        lng: item.lng,
                        status: "sos",
                      });
                    }, 250);
                  }}
                >
                  <View className="flex-row items-center mb-3">
                    <View className="bg-red-100 rounded-full p-3 mr-4">
                      <AlertTriangle color="#DC2626" size={24} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-darkBlue font-heading font-bold text-xl">
                        Boat {item.boatId}
                      </Text>
                      <Text className="text-red-600 font-sans font-semibold text-lg">EMERGENCY SOS</Text>
                    </View>
                  </View>
                  <Text className="text-secondaryText font-sans text-base mb-3">
                    📍 {fmtCoord(item.lat)}, {fmtCoord(item.lng)}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View className="bg-red-600 rounded-full px-4 py-2">
                      <Text className="text-white text-sm font-sans font-bold">HIGH PRIORITY</Text>
                    </View>
                    <Text className="text-accentText font-sans font-semibold">View on Map →</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {/* Enhanced MAP tab */}
      {tab === "map" && (
        <View className="flex-1 mx-6 mb-6 mt-4 rounded-3xl overflow-hidden border-2 border-lightPurple shadow-2xl"
          style={{
            shadowColor: "#636CCB",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
          }}
        >
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
                  pinColor={isSOS ? "#DC2626" : "#50589C"}
                  onPress={() => setFocusedBoat(b)}
                >
                  {isSOS && (
                    <View className="bg-red-600 px-3 py-1 rounded-full -mt-8 border-2 border-white shadow-lg">
                      <Text className="text-white text-xs font-sans font-bold">🚨 SOS</Text>
                    </View>
                  )}
                  <Callout onPress={() => setFocusedBoat(b)}>
                    <View style={{ maxWidth: 240, padding: 12 }}>
                      <Text style={{ fontWeight: "700", color: "#3C467B", marginBottom: 4, fontSize: 16 }}>
                        {b.name}
                      </Text>
                      <Text style={{ color: "#3C467B", fontSize: 14 }}>
                        {fmtCoord(b.lat)}, {fmtCoord(b.lng)}
                      </Text>
                      {isSOS && (
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                          <AlertTriangle size={16} color="#DC2626" />
                          <Text style={{ color: "#DC2626", marginLeft: 6, fontWeight: "600", fontSize: 14 }}>
                            Active Emergency
                          </Text>
                        </View>
                      )}
                      <Text style={{ color: "#6E8CFB", marginTop: 8, fontSize: 14 }}>Tap for details →</Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>

          <TouchableOpacity
            className="absolute right-4 bottom-4 bg-white/95 rounded-2xl px-4 py-3 border border-lightPurple shadow-xl"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
            }}
            onPress={() => {
              if (!boats.length || !mapRef.current) return;
              mapRef.current.fitToCoordinates(
                boats.map((b) => ({ latitude: b.lat, longitude: b.lng })),
                { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true }
              );
            }}
          >
            <View className="flex-row items-center">
              <Compass size={20} color="#3C467B" />
              <Text className="ml-2 text-blue font-sans font-semibold">Fit All Boats</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Enhanced REPORTS tab */}
      {tab === "reports" && (
        <View className="flex-1">
          {/* Enhanced Filters */}
          <View className="px-6 pt-6 pb-4 bg-white border-b border-lightPurple">
            <View className="mb-4">
              <Text className="text-darkBlue font-heading font-bold text-lg mb-3">📊 Report Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                <FilterChip value="all" current={reportType} onChange={setReportType} label="📋 All Reports" />
                <FilterChip value="violation" current={reportType} onChange={setReportType} label="⚖️ Violations" />
                <FilterChip value="hazard" current={reportType} onChange={setReportType} label="⚠️ Hazards" />
              </ScrollView>
            </View>
            <View>
              <Text className="text-darkBlue font-heading font-bold text-lg mb-3">🎯 Status Filter</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                <FilterChip value="all" current={statusFilter} onChange={setStatusFilter} label="All Status" />
                <FilterChip value="pending" current={statusFilter} onChange={setStatusFilter} label="⏳ Pending" />
                <FilterChip value="verified" current={statusFilter} onChange={setStatusFilter} label="✅ Verified" />
                <FilterChip value="resolved" current={statusFilter} onChange={setStatusFilter} label="✅ Resolved" />
              </ScrollView>
            </View>
          </View>

          {loadingReports ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#50589C" />
              <Text className="text-darkBlue font-sans mt-4">Loading reports...</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 24 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              showsVerticalScrollIndicator={false}
            >
              <View className="px-6 pt-6">
                {/* Violation Reports Section */}
                <View className="mb-8">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-darkBlue font-heading font-bold text-2xl">⚖️ Violation Reports</Text>
                    <View className="bg-blueLight rounded-full px-3 py-1">
                      <Text className="text-white text-sm font-sans font-semibold">
                        {filteredViolations.length} reports
                      </Text>
                    </View>
                  </View>
                  
                  {filteredViolations.length === 0 ? (
                    <View className="bg-lightPurple/30 rounded-3xl p-8 items-center border border-lightPurple">
                      <Text className="text-4xl mb-4">📝</Text>
                      <Text className="text-darkBlue font-heading font-bold text-xl mb-2">No Violation Reports</Text>
                      <Text className="text-secondaryText font-sans text-center">
                        No violation reports match your current filters
                      </Text>
                    </View>
                  ) : (
                    filteredViolations.map((r) => (
                      <View key={r._id} className="bg-white rounded-3xl p-6 mb-4 border border-lightPurple shadow-xl"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 6 },
                          shadowOpacity: 0.1,
                          shadowRadius: 12,
                        }}
                      >
                        <View className="flex-row justify-between items-start mb-3">
                          <Text className="text-darkBlue font-heading font-bold text-xl flex-1 mr-4">
                            {r.violationType || "Violation Report"}
                          </Text>
                          <View className={`px-3 py-2 rounded-full ${
                            (r.status || "").toLowerCase() === 'verified' ? 'bg-green-100 border border-green-200' : 
                            (r.status || "").toLowerCase() === 'resolved' ? 'bg-blue-100 border border-blue-200' : 
                            'bg-yellow-100 border border-yellow-200'
                          }`}>
                            <Text className={`text-xs font-sans font-semibold capitalize ${
                              (r.status || "").toLowerCase() === 'verified' ? 'text-green-800' : 
                              (r.status || "").toLowerCase() === 'resolved' ? 'text-blue-800' : 
                              'text-yellow-800'
                            }`}>
                              {r.status || "pending"}
                            </Text>
                          </View>
                        </View>
                        
                        <Text className="text-secondaryText font-sans text-base leading-6 mb-4">
                          {r.description}
                        </Text>

                        {!!r?.evidence?.imageUrl?.length && (
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                            {r.evidence.imageUrl.map((u, i) => (
                              <Image key={i} source={{ uri: u }} className="w-28 h-28 rounded-2xl mr-3 border border-lightPurple" />
                            ))}
                          </ScrollView>
                        )}

                        <View className="flex-row justify-between items-center pt-4 border-t border-lightPurple">
                          <View className="flex-row items-center">
                            <Text className="text-accentText text-sm font-sans">
                              Reported by: {r.reporterId || "Anonymous"}
                            </Text>
                          </View>
                          
                          {(r.status || "").toLowerCase() !== "verified" && (
                            <TouchableOpacity 
                              className="bg-green-600 rounded-2xl px-5 py-3 shadow-lg"
                              onPress={() => onVerifyViolation(r._id)}
                              style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                              }}
                            >
                              <View className="flex-row items-center">
                                <Check size={18} color="white" />
                                <Text className="text-white font-sans font-semibold ml-2">Verify Report</Text>
                              </View>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>

                {/* Hazard Reports Section */}
                <View className="mb-8">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-darkBlue font-heading font-bold text-2xl">⚠️ Hazard Reports</Text>
                    <View className="bg-orange-500 rounded-full px-3 py-1">
                      <Text className="text-white text-sm font-sans font-semibold">
                        {filteredHazards.length} reports
                      </Text>
                    </View>
                  </View>
                  
                  {filteredHazards.length === 0 ? (
                    <View className="bg-lightPurple/30 rounded-3xl p-8 items-center border border-lightPurple">
                      <Text className="text-4xl mb-4">🌊</Text>
                      <Text className="text-darkBlue font-heading font-bold text-xl mb-2">No Hazard Reports</Text>
                      <Text className="text-secondaryText font-sans text-center">
                        No hazard reports match your current filters
                      </Text>
                    </View>
                  ) : (
                    filteredHazards.map((r) => (
                      <View key={r._id} className="bg-white rounded-3xl p-6 mb-4 border border-lightPurple shadow-xl"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 6 },
                          shadowOpacity: 0.1,
                          shadowRadius: 12,
                        }}
                      >
                        <View className="flex-row justify-between items-start mb-3">
                          <Text className="text-darkBlue font-heading font-bold text-xl flex-1 mr-4">
                            {r.hazardType || "Hazard Report"}
                          </Text>
                          <View className={`px-3 py-2 rounded-full ${
                            (r.status || "").toLowerCase() === 'resolved' ? 'bg-blue-100 border border-blue-200' : 
                            'bg-yellow-100 border border-yellow-200'
                          }`}>
                            <Text className={`text-xs font-sans font-semibold capitalize ${
                              (r.status || "").toLowerCase() === 'resolved' ? 'text-blue-800' : 'text-yellow-800'
                            }`}>
                              {r.status || "pending"}
                            </Text>
                          </View>
                        </View>
                        
                        <Text className="text-secondaryText font-sans text-base leading-6 mb-4">
                          {r.description}
                        </Text>

                        {!!r?.evidence?.imageUrl?.length && (
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                            {r.evidence.imageUrl.map((u, i) => (
                              <Image key={i} source={{ uri: u }} className="w-28 h-28 rounded-2xl mr-3 border border-lightPurple" />
                            ))}
                          </ScrollView>
                        )}

                        <View className="flex-row justify-between items-center pt-4 border-t border-lightPurple">
                          <View className="flex-row items-center">
                            <Text className="text-accentText text-sm font-sans">
                              Severity: <Text className="font-semibold capitalize">{r.severity || "medium"}</Text>
                            </Text>
                          </View>
                          
                          {(r.status || "").toLowerCase() !== "resolved" && (
                            <TouchableOpacity 
                              className="bg-blue rounded-2xl px-5 py-3 shadow-lg"
                              onPress={() => onResolveHazard(r._id)}
                              style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                              }}
                            >
                              <Text className="text-white font-sans font-semibold">Mark Resolved</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* Enhanced Boat detail modal */}
      <Modal transparent animationType="slide" visible={!!focusedBoat} onRequestClose={() => setFocusedBoat(null)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-3xl p-6 mx-2 mb-2 shadow-3xl border border-lightPurple"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
          >
            {focusedBoat && (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-darkBlue font-heading font-bold text-2xl">{focusedBoat.name || "Selected Boat"}</Text>
                  {(focusedBoat.status || "").toLowerCase() === "sos" && (
                    <View className="bg-red-600 rounded-full px-3 py-1">
                      <Text className="text-white text-sm font-sans font-bold">🚨 EMERGENCY</Text>
                    </View>
                  )}
                </View>
                <Text className="text-secondaryText font-sans text-base mb-6">
                  📍 {fmtCoord(focusedBoat.lat)}, {fmtCoord(focusedBoat.lng)}
                </Text>
                <View className="flex-row space-x-3 mb-6">
                  <TouchableOpacity className="bg-lightPurple rounded-2xl px-4 py-3 flex-1">
                    <View className="flex-row items-center justify-center">
                      <MapPin size={18} color="#3C467B" />
                      <Text className="text-blue font-sans font-semibold ml-2">Copy Coordinates</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-blueLight rounded-2xl px-4 py-3 flex-1">
                    <View className="flex-row items-center justify-center">
                      <Compass size={18} color="white" />
                      <Text className="text-white font-sans font-semibold ml-2">Navigate To</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  className="bg-blue rounded-2xl py-4 items-center shadow-xl"
                  onPress={() => setFocusedBoat(null)}
                  style={{
                    shadowColor: "#636CCB",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                  }}
                >
                  <Text className="text-white font-heading font-bold text-lg">Close Details</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
