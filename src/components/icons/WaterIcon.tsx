import React from "react";
import Svg, { Path } from "react-native-svg";

interface WaterIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const WaterIcon: React.FC<WaterIconProps> = ({
  width = 32,
  height = 32,
  color = "#3B82F6",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      {/* Gota de agua simple */}
      <Path
        d="M12 2c-3 0-8 6-8 10a8 8 0 1 0 16 0c0-4-5-10-8-10z"
        fill={color}
      />
      {/* Reflejo/brillo en la gota */}
      <Path
        d="M10 8c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"
        fill="white"
        opacity={0.4}
      />
    </Svg>
  );
};
