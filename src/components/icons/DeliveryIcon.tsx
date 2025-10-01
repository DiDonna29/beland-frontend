import React from "react";
import Svg, { Path, Rect, Circle } from "react-native-svg";

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
      {/* Cabina del camión */}
      <Rect
        x="2"
        y="7"
        width="6"
        height="6"
        rx="1"
        stroke={color}
        strokeWidth="2"
        fill={color}
        fillOpacity="0.2"
      />

      {/* Caja de carga */}
      <Rect
        x="8"
        y="5"
        width="12"
        height="8"
        rx="1"
        stroke={color}
        strokeWidth="2"
        fill={color}
        fillOpacity="0.1"
      />

      {/* Parabrisas */}
      <Rect
        x="3"
        y="8"
        width="4"
        height="3"
        rx="0.5"
        fill="#ffffff"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Rueda delantera */}
      <Circle
        cx="5"
        cy="15"
        r="2"
        fill="#ffffff"
        stroke={color}
        strokeWidth="2"
      />

      {/* Rueda trasera */}
      <Circle
        cx="17"
        cy="15"
        r="2"
        fill="#ffffff"
        stroke={color}
        strokeWidth="2"
      />

      {/* Centro de ruedas */}
      <Circle cx="5" cy="15" r="0.7" fill={color} />
      <Circle cx="17" cy="15" r="0.7" fill={color} />

      {/* Puerta de carga */}
      <Path
        d="M19 6v6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Manija de puerta */}
      <Circle cx="18" cy="9" r="0.8" fill={color} />
    </Svg>
  );
};
