import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import axios from "axios";

import { getMyReports } from "../api/client";

const reporterIdFallback = "BOAT_TEMP_001"; // will be replaced by login user if available

export default function MyReports() {
  const nav = useNavigation();
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setRefreshing(true);

      const reporterId = reporterIdFallback;

      const data = await getMyReports(reporterId);
      setItems(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      console.log("MyReports load error:", e?.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const renderItem = ({ item }) => {
    const isViolation = item.kind === "violation" || item.violationType;
    const title = isViolation
      ? item.violationType || "Violation"
      : item.hazardType || "Hazard";
    const thumb = item?.evidence?.imageUrl?.[0];
    const when = item.timestamp
      ? dayjs(item.timestamp).format("YYYY-MM-DD HH:mm")
      : "—";
    const status = item.status || "pending";

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        className="bg-white rounded-2xl px-4 py-4 mb-3 border border-[#D8D8FF]"
        onPress={() => {
          if (isViolation) {
            nav.navigate("ReportViolation", { mode: "edit", report: item });
          } else {
            nav.navigate("ReportHazard", { mode: "edit", report: item });
          }
        }}
      >
        <View className="flex-row">
          <View className="flex-1 pr-3">
            <Text className="text-blue font-bold text-base">
              {isViolation ? "Violation" : "Hazard"}
            </Text>
            <Text className="text-blue opacity-80 mt-1">{title}</Text>
            <Text className="text-blue opacity-60 mt-1 text-xs">{when}</Text>
            <View className="mt-2 bg-[#EEF0FF] px-2 py-1 rounded-full self-start">
              <Text className="text-blue text-xs font-semibold capitalize">
                {status}
              </Text>
            </View>
          </View>
          {thumb ? (
            <Image source={{ uri: thumb }} className="w-20 h-20 rounded-xl" />
          ) : (
            <View className="w-20 h-20 rounded-xl bg-[#EEF0FF] items-center justify-center">
              <Text className="text-blue text-xs">No image</Text>
            </View>
          )}
        </View>
        <Text className="text-blue text-right mt-2">Tap to edit →</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-extrabold text-blue">My Reports</Text>
        <Text className="text-blue opacity-60 mt-1">
          View and edit your submissions
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it._id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
          paddingTop: 8,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchReports} />
        }
        ListEmptyComponent={
          <View className="px-6 mt-10">
            <Text className="text-blue opacity-70 text-center">
              You haven’t submitted any reports yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
