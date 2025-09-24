import React from "react";
import { methodSelectorStyles } from "../styles";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import PayphoneIcon from "../../../components/icons/PayphoneIcon";

interface PaymentMethodSelectorProps {
  selectedMethod: "payphone" | "becoin" | "bank_transfer";
  onMethodChange: (method: "payphone" | "becoin" | "bank_transfer") => void;
  isPayphoneAvailable?: boolean;
  shouldForceBeCoins?: boolean;
  effectiveAmount?: number;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  isPayphoneAvailable = true,
  shouldForceBeCoins = false,
  effectiveAmount = 0,
}) => {
  // Si se debe forzar BeCoins, cambiar automáticamente
  React.useEffect(() => {
    if (shouldForceBeCoins && selectedMethod === "payphone") {
      onMethodChange("becoin");
    }
  }, [shouldForceBeCoins, selectedMethod, onMethodChange]);

  return (
    <div style={methodSelectorStyles.container}>
      <button
        type="button"
        style={{
          ...methodSelectorStyles.methodButton,
          ...(selectedMethod === "payphone"
            ? methodSelectorStyles.methodButtonActive
            : methodSelectorStyles.methodButtonInactive),
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
          borderRight: "1px solid #e8f4fd",
          opacity: isPayphoneAvailable ? 1 : 0.5,
          cursor: isPayphoneAvailable ? "pointer" : "not-allowed",
        }}
        onClick={() => isPayphoneAvailable && onMethodChange("payphone")}
        disabled={!isPayphoneAvailable}
      >
        <div style={methodSelectorStyles.methodIcon}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="6"
              width="20"
              height="12"
              rx="2"
              stroke="#333"
              strokeWidth="1.2"
            />
            <path d="M3 9H21" stroke="#333" strokeWidth="1.2" />
          </svg>
        </div>
        <span style={methodSelectorStyles.methodText}>Tarjeta</span>
        {!isPayphoneAvailable && effectiveAmount < 1 && (
          <div style={{ fontSize: "10px", color: "#ff6b6b", marginTop: "2px" }}>
            Mínimo $1.00
          </div>
        )}
      </button>

      <button
        type="button"
        style={{
          ...methodSelectorStyles.methodButton,
          ...(selectedMethod === "becoin"
            ? methodSelectorStyles.methodButtonActive
            : methodSelectorStyles.methodButtonInactive),
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          borderLeft: "1px solid #e8f4fd",
        }}
        onClick={() => onMethodChange("becoin")}
      >
        <div style={methodSelectorStyles.methodIcon}>
          <BeCoinIcon />
        </div>
        <span style={methodSelectorStyles.methodText}>BeCoins</span>
      </button>

      <button
        type="button"
        style={{
          ...methodSelectorStyles.methodButton,
          ...(selectedMethod === "bank_transfer"
            ? methodSelectorStyles.methodButtonActive
            : methodSelectorStyles.methodButtonInactive),
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          borderLeft: "1px solid #e8f4fd",
        }}
        onClick={() => onMethodChange("bank_transfer")}
      >
        <div style={methodSelectorStyles.methodIcon}>
          {/* Icono de transferencia: dos flechas opuestas, alineadas horizontalmente */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Flecha superior -> derecha */}
            <path
              d="M4 9h14"
              stroke="#6B7280"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M14 5l4 4-4 4"
              stroke="#6B7280"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Flecha inferior -> izquierda */}
            <path
              d="M20 15H6"
              stroke="#6B7280"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M10 11l-4 4 4 4"
              stroke="#6B7280"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span style={methodSelectorStyles.methodText}>Transferencia</span>
      </button>
    </div>
  );
};
