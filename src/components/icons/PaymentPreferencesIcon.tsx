import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

interface PaymentPreferencesIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const PaymentPreferencesIcon: React.FC<PaymentPreferencesIconProps> = ({
  width = 24,
  height = 24,
  color = "#333",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      {/* Tarjeta de credito */}
      <Path
        d="M2 5C2 3.89543 2.89543 3 4 3H20C21.1046 3 22 3.89543 22 5V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V5Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Banda magnética */}
      <Path d="M2 7H22" stroke={color} strokeWidth="2" />
      {/* Chip */}
      <Path d="M5 10H7V12H5V10Z" fill={color} />
      {/* Números de tarjeta representados por líneas */}
      <Path
        d="M5 15H11"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M13 15H15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Ícono de más para agregar */}
      <Circle
        cx="19"
        cy="7"
        r="3"
        fill="#FF6B35"
        stroke="#fff"
        strokeWidth="1"
      />
      <Path
        d="M18 7H20M19 6V8"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};
