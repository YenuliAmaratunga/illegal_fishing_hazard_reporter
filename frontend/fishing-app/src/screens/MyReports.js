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

const reporterIdFallback = "BOAT_TEMP_001";

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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "resolved":
        return "bg-green-100 border-green-200";
      case "rejected":
      case "closed":
        return "bg-red-100 border-red-200";
      case "in progress":
        return "bg-yellow-100 border-yellow-200";
      default:
        return "bg-blue-100 border-blue-200";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "resolved":
        return "text-green-800";
      case "rejected":
      case "closed":
        return "text-red-800";
      case "in progress":
        return "text-yellow-800";
      default:
        return "text-blue-800";
    }
  };

  const getTypeIcon = (isViolation) => {
    return isViolation ? "🚨" : "⚠️";
  };

  const renderItem = ({ item }) => {
    const isViolation = item.kind === "violation" || item.violationType;
    const title = isViolation
      ? item.violationType || "Violation"
      : item.hazardType || "Hazard";
    const thumb = item?.evidence?.imageUrl?.[0];
    const when = item.timestamp
      ? dayjs(item.timestamp).format("MMM DD, YYYY • HH:mm")
      : "—";
    const status = item.status || "pending";
    const description = item.description || "No description provided";

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className="bg-white rounded-3xl p-5 mb-4 mx-4 border border-lightPurple shadow-sm"
        style={{
          shadowColor: "#636CCB",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
        onPress={() => {
          if (isViolation) {
            nav.navigate("ReportViolation", { mode: "edit", report: item });
          } else {
            nav.navigate("ReportHazard", { mode: "edit", report: item });
          }
        }}
      >
        {/* Header with Type and Status */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-2">{getTypeIcon(isViolation)}</Text>
            <View>
              <Text className="text-darkBlue font-heading font-bold text-lg capitalize">
                {isViolation ? "Violation Report" : "Hazard Report"}
              </Text>
              <Text className="text-secondaryText text-sm font-sans mt-1">
                {when}
              </Text>
            </View>
          </View>
          <View className={`px-3 py-1.5 rounded-full border ${getStatusColor(status)}`}>
            <Text className={`text-xs font-bold uppercase tracking-wide ${getStatusTextColor(status)}`}>
              {status}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-row">
          <View className="flex-1 pr-4">
            <Text className="text-darkBlue font-heading font-semibold text-base mb-2">
              {title}
            </Text>
            <Text 
              className="text-secondaryText text-sm font-sans leading-5"
              numberOfLines={2}
            >
              {description}
            </Text>
          </View>
          
          {/* Image Thumbnail */}
          {thumb ? (
            <Image 
              source={{ uri: thumb }} 
              className="w-20 h-20 rounded-2xl" 
            />
          ) : (
            <View className="w-20 h-20 rounded-2xl bg-lightPurple items-center justify-center">
              <Text className="text-accentText text-2xl">📷</Text>
              <Text className="text-accentText text-xs mt-1 text-center">No image</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-lightPurple">
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${
              status === 'pending' ? 'bg-yellow-500' : 
              status === 'approved' ? 'bg-green-500' : 
              status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
            }`} />
            <Text className="text-secondaryText text-xs font-sans">
              Last updated
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-accentText text-sm font-sans font-medium mr-1">
              View Details
            </Text>
            <Text className="text-accentText text-lg">→</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 bg-gradient-to-b from-white to-lightPurple/20">
        <Text className="text-3xl font-heading font-bold text-darkBlue mb-2">
          My Reports
        </Text>
        <Text className="text-secondaryText text-base font-sans">
          Manage and track your submissions
        </Text>
        
        {/* Stats Bar */}
        <View className="flex-row justify-between items-center mt-6 bg-white rounded-2xl p-4 border border-lightPurple shadow-sm">
          <View className="items-center">
            <Text className="text-darkBlue font-heading font-bold text-xl">
              {items.length}
            </Text>
            <Text className="text-secondaryText text-xs font-sans mt-1">
              Total Reports
            </Text>
          </View>
          <View className="h-8 w-px bg-lightPurple" />
          <View className="items-center">
            <Text className="text-darkBlue font-heading font-bold text-xl">
              {items.filter(item => item.status === 'pending').length}
            </Text>
            <Text className="text-secondaryText text-xs font-sans mt-1">
              Pending
            </Text>
          </View>
          <View className="h-8 w-px bg-lightPurple" />
          <View className="items-center">
            <Text className="text-darkBlue font-heading font-bold text-xl">
              {items.filter(item => item.status === 'approved').length}
            </Text>
            <Text className="text-secondaryText text-xs font-sans mt-1">
              Approved
            </Text>
          </View>
        </View>
      </View>

      {/* Reports List */}
      <FlatList
        data={items}
        keyExtractor={(it) => it._id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 24,
        }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchReports}
            colors={["#636CCB"]}
            tintColor="#636CCB"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-6 mt-16">
            <View className="bg-lightPurple rounded-3xl p-8 items-center">
              <Text className="text-6xl mb-4">📋</Text>
              <Text className="text-darkBlue font-heading font-bold text-xl text-center mb-2">
                No Reports Yet
              </Text>
              <Text className="text-secondaryText text-base font-sans text-center leading-6">
                You haven't submitted any reports.{'\n'}
                Start by reporting a hazard or violation.
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}