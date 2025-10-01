import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

interface WeightIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const WeightIcon: React.FC<WeightIconProps> = ({
  width = 32,
  height = 32,
  color = "#059669",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      {/* Balanza/peso */}
      <Rect x="4" y="18" width="16" height="2" rx="1" fill={color} />
      <Path
        d="M12 3v13M8 8l4-4 4 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Platos de la balanza */}
      <Path
        d="M6 14c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V12H6v2z"
        fill={color}
        opacity={0.7}
      />
      <Path
        d="M12 14c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V12h-6v2z"
        fill={color}
        opacity={0.7}
      />
      {/* Texto kg */}
      <Path
        d="M7 13h1M8 13v1M15 13h1M16 13v1"
        stroke="white"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
