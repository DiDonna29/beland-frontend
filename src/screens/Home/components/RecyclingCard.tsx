import React from "react";
import { View, Text } from "react-native";
import { Card } from "../../../components/ui/Card";
import { RecycleIcon, WaterIcon } from "../../../components/icons";
import { colors } from "../../../styles/colors";
import { recyclingCardStyles } from "../styles";

interface RecyclingCardProps {
  bottlesRecycled: number; // Usado para calcular kg reciclados
}

export const RecyclingCard: React.FC<RecyclingCardProps> = ({
  bottlesRecycled,
}) => {
  const kgRecycled = bottlesRecycled * 0.025; // Conversión estimada de botellas a kg

  return (
    <Card
      style={recyclingCardStyles.recyclingCard}
      backgroundColor={colors.belandGreenLight}
    >
      <View style={recyclingCardStyles.recyclingContent}>
        <View style={recyclingCardStyles.recyclingLeft}>
          <View style={recyclingCardStyles.iconContainer}>
            <RecycleIcon width={48} height={64} color="#059669" />
          </View>
          <View>
            <Text style={recyclingCardStyles.recyclingTitle}>Reciclaste</Text>
            <View style={recyclingCardStyles.recyclingStats}>
              {bottlesRecycled > 0 ? (
                <>
                  <Text style={recyclingCardStyles.recyclingNumber}>
                    {kgRecycled.toFixed(1)}
                  </Text>
                  <Text style={recyclingCardStyles.recyclingLabel}>kg</Text>
                </>
              ) : (
                <Text
                  style={[
                    recyclingCardStyles.recyclingLabel,
                    { width: "100%", flexShrink: 1 },
                  ]}
                >
                  Aún no has reciclado. {"\n"}¡Comienza a reciclar y verás tu
                  progreso aquí!
                </Text>
              )}
            </View>
          </View>
        </View>
        <View style={recyclingCardStyles.treesIconContainer}>
          <WaterIcon width={80} height={64} color="#3B82F6" />
        </View>
      </View>
    </Card>
  );
};
