// src/components/CircularTimer.tsx
import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;
  stroke?: number;
  period?: number;       // 30 por defecto
  remaining: number;     // 0..period
};

export default function CircularTimer({
  size = 56,
  stroke = 6,
  period = 30,
  remaining,
}: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / period; // 1..0
  const dashOffset = circumference * (1 - progress);

  // Azul (>20s), Amarillo (10–20s), Rojo (<10s)
  const color =
    remaining > 20 ? "#3B82F6" : remaining > 10 ? "#F59E0B" : "#EF4444";

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {/* bg */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth={stroke}
          fill="none"
        />
        {/* progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ position: "absolute", color: "#9CA3AF", fontWeight: "700" }}>
        {remaining}s
      </Text>
    </View>
  );
}
