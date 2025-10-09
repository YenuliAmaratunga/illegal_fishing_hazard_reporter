import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import axios from "axios";
import { GPS_BASE } from "../api/config";

export default function MyReports() {
  const [loading, setLoading] = useState(true);
  const [items, setItems]   = useState([]);

  // TEMP reporterId: match what you used in forms
  const reporterId = "BOAT_TEMP_001";

  useEffect(() => {
    const load = async () => {
      try {
        const [viol, haz] = await Promise.all([
          axios.get(`${GPS_BASE}/api/reports/violation-reports`, { timeout: 15000 }),
          axios.get(`${GPS_BASE}/api/reports/hazard-reports`,    { timeout: 15000 }),
        ]);

        // filter by reporterId client-side (until backend supports ?reporterId=)
        const vMine = Array.isArray(viol.data?.data) ? viol.data.data.filter(r => r.reporterId === reporterId) : [];
        const hMine = Array.isArray(haz.data?.data)  ? haz.data.data.filter(r => r.reporterId === reporterId)  : [];

        // normalize to one list with type tag
        const combined = [
          ...vMine.map(r => ({ type: "violation", id: r._id, title: r.violationType, status: r.status, when: r.timestamp })),
          ...hMine.map(r => ({ type: "hazard",    id: r._id, title: r.hazardType,    status: r.status, when: r.timestamp })),
        ].sort((a,b) => new Date(b.when) - new Date(a.when));

        setItems(combined);
      } catch (e) {
        console.log("MyReports load error:", e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator />
        <Text className="text-blue mt-2">Loading your reports…</Text>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-blue text-center">No reports yet.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity className="bg-white border border-blueLight rounded-2xl px-4 py-3 mb-3">
      <Text className="text-blue font-extrabold">
        {item.type === "violation" ? "Violation" : "Hazard"} • {item.title}
      </Text>
      <Text className="text-blue mt-1">Status: {item.status}</Text>
      <Text className="text-blue mt-1">
        {new Date(item.when).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white px-5 pt-6">
      <Text className="text-2xl font-extrabold text-blue text-center mb-8">My Reports</Text>
      <FlatList
        data={items}
        keyExtractor={(it) => `${it.type}:${it.id}`}
        renderItem={renderItem}
      />
    </View>
  );
}
