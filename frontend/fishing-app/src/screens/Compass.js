import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { Magnetometer } from "expo-sensors";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function Compass() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    const subscription = Magnetometer.addListener((data) => {
      const { x, y } = data;
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setHeading(angle);
    });

    Magnetometer.setUpdateInterval(100); // faster updates

    return () => subscription.remove();
  }, []);

  return (
    <LinearGradient
      colors={["#1F2937", "#3B82F6"]} // dark to blue gradient
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.headingText}>{heading.toFixed(0)}° N</Text>

        <View style={styles.compassWrapper}>
          {/* Glow circle behind arrow */}
          <View style={styles.glowCircle} />

          {/* Compass arrow */}
          <Image
            source={require("../assets/arrow.png")}
            style={[styles.compassImage, { transform: [{ rotate: `${360 - heading}deg` }] }]}
            resizeMode="contain"
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  headingText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827  ",
    marginBottom: 20,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  compassWrapper: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  glowCircle: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: width * 0.35,
    backgroundColor: "#3B82F6",
    opacity: 0.1,
  },
  compassImage: {
    width: "100%",
    height: "100%",
  },
});
