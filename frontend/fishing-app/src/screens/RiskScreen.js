import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

const safetyChecklist = {
  MAX_BOAT_AGE_YEARS: 15,
  MIN_FUEL_AMOUNT_LITERS: 20,
  MIN_FUEL_EFFICIENCY: 2.0, // km per liter
  MIN_LIFE_JACKETS_PER_CREW: 1,
  CRITICAL_ENGINE_STATUSES: ["Needs Maintenance", "Critical"],
  RADIO_COMM_REQUIRED: true,
  WEATHER_CHECK_REQUIRED: true,
  MIN_FUEL_BUFFER_PERCENTAGE: 0.15,
};

export default function RiskScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 white px-4 pt-12">
      <Text className="text-2xl font-bold text-black mb-6 text-center">
        Safety Checklist Before Fishing Trip
      </Text>

      <View className="bg-darkPurple rounded-2xl p-4 mb-4">
        <Text className="text-white mb-2">
          Please ensure the following safety conditions are met before heading out:
        </Text>

        <View className="mb-3">
          <Text className="text-white font-semibold">
            • Maximum Boat Age:{" "}
            <Text className="font-normal">
              {safetyChecklist.MAX_BOAT_AGE_YEARS} years
            </Text>
          </Text>
          <Text className="text-white text-sm italic">
            Older boats may not be safe or compliant.
          </Text>
        </View>

        <View className="mb-3">
          <Text className="text-white font-semibold">
            • Minimum Fuel Amount:{" "}
            <Text className="font-normal">
              {safetyChecklist.MIN_FUEL_AMOUNT_LITERS} liters
            </Text>
          </Text>
          <Text className="text-white text-sm italic">
            Ensure sufficient fuel for the trip.
          </Text>
        </View>

        <View className="mb-3">
          <Text className="text-white font-semibold">
            • Minimum Fuel Efficiency:{" "}
            <Text className="font-normal">
              {safetyChecklist.MIN_FUEL_EFFICIENCY} km/l
            </Text>
          </Text>
          <Text className="text-white text-sm italic">
            Check your boat's fuel consumption rate.
          </Text>
        </View>

        <View className="mb-3">
          <Text className="text-white font-semibold">
            • Life Jackets Per Crew Member:{" "}
            <Text className="font-normal">
              {safetyChecklist.MIN_LIFE_JACKETS_PER_CREW}
            </Text>
          </Text>
          <Text className="text-white text-sm italic">
            Everyone must have a life jacket.
          </Text>
        </View>

        <View className="mb-3">
          <Text className="text-white font-semibold">
            • Engine Status Check:
          </Text>
          <Text className="text-white text-sm italic ml-4">
            Avoid engines with statuses:{" "}
            {safetyChecklist.CRITICAL_ENGINE_STATUSES.join(", ")}.
          </Text>
        </View>

        <View className="mb-3">
          <Text className="text-white font-semibold">
            • Radio Communication Required:{" "}
            <Text className="font-normal">
              {safetyChecklist.RADIO_COMM_REQUIRED ? "Yes" : "No"}
            </Text>
          </Text>
        </View>

        <View className="mb-3">
          <Text className="text-white font-semibold">
            • Weather Check Required:{" "}
            <Text className="font-normal">
              {safetyChecklist.WEATHER_CHECK_REQUIRED ? "Yes" : "No"}
            </Text>
          </Text>
        </View>

        <View className="mb-3">
          <Text className="text-white font-semibold">
            • Minimum Fuel Buffer Percentage:{" "}
            <Text className="font-normal">
              {(safetyChecklist.MIN_FUEL_BUFFER_PERCENTAGE * 100).toFixed(0)}%
            </Text>
          </Text>
          <Text className="text-white text-sm italic">
            Extra fuel to cover unexpected conditions.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
