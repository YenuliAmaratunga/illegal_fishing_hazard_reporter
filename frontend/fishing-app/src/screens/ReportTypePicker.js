import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  ScrollView,
} from "react-native";
import { AlertTriangle, Waves, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function ReportTypePicker() {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (type) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === type ? null : type);
  };

  const Card = ({ icon: Icon, title, subtitle, onPress, colors }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
      }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: 20,
          paddingHorizontal: 22,
          borderRadius: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View className="flex-row items-center">
          <View
            className="w-12 h-12 rounded-full bg-white/90 items-center justify-center"
            style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3 }}
          >
            <Icon size={26} color={colors[0]} />
          </View>
          <View className="ml-4">
            <Text className="text-white font-extrabold text-lg">{title}</Text>
            {subtitle && (
              <Text className="text-white/90 text-sm mt-1">{subtitle}</Text>
            )}
          </View>
        </View>
        <ChevronRight size={24} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#EEF0FF", "#FFFFFF"]}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      />

      <ScrollView
        className="flex-1 px-6 pt-10"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-8">
          <Text className="text-[24px] font-extrabold text-blue text-center mb-1">
            New Report
          </Text>
          <Text className="text-blue opacity-60 text-[14px] text-center">
            Select what you’d like to report
          </Text>
        </View>

        <View className="space-y-8">
          <Card
            icon={AlertTriangle}
            title="Report Violation"
            subtitle="Illegal fishing or restricted zone"
            colors={["#50589C", "#6E8CFB"]}
            onPress={() => navigation.navigate("ReportViolation")}
          />
          <View style={{ marginBottom: 32 }} />
          <Card
            icon={Waves}
            title="Report Hazard"
            subtitle="Debris, oil spill, or navigation issue"
            colors={["#6E8CFB", "#BABCFF"]}
            onPress={() => navigation.navigate("ReportHazard")}
          />
        </View>

        <View className="mt-12 items-center">
          <Text className="text-blue opacity-60 text-sm text-center">
            Attach evidence and your location on the next page.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
