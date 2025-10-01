import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

interface DeliveryIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const DeliveryIcon: React.FC<DeliveryIconProps> = ({
  width = 32,
  height = 32,
  color = "#0F766E",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      {/* Casa simple */}
      <Path
        d="M3 12l9-9 9 9"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M5 12v7h14v-7"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Puerta */}
      <Path
        d="M9 19v-6h6v6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Caja/paquete en la puerta */}
      <Path
        d="M10 17h4v2h-4v-2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
        fillOpacity="0.3"
      />

      {/* Líneas en la caja */}
      <Path
        d="M10 18h4M12 17v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
