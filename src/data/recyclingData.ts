import { RecyclingPoint, RecyclingType } from "../types/recycling";

export const RECYCLING_TYPES: RecyclingType[] = [
  {
    id: "plastic",
    name: "Plástico",
    emoji: "♻️",
    color: "#22C55E",
  },
  {
    id: "paper",
    name: "Papel",
    emoji: "📄",
    color: "#3B82F6",
  },
  {
    id: "electronics",
    name: "Electrónicos",
    emoji: "🔌",
    color: "#EF4444",
  },
  {
    id: "glass",
    name: "Vidrio",
    emoji: "🍾",
    color: "#8B5CF6",
  },
  {
    id: "organic",
    name: "Orgánico",
    emoji: "🍃",
    color: "#F59E0B",
  },
];

export const MOCK_RECYCLING_POINTS: RecyclingPoint[] = [
  // Reemplazado por la única ubicación solicitada.
  // Nota: latitude/longitude son placeholders (0,0). Actualizar con coordenadas reales si se dispone.
  {
    id: "r-quito-01",
    name: "Punto de reciclaje - Quito",
    address: "Av. Río Coca E5 255, Quito 170138, Ecuador",
    latitude: -0.16184031732953938,
    longitude: -78.48065618466048,
    acceptedWasteTypes: ["plastic", "paper", "electronics", "glass", "organic"],
  },
];
