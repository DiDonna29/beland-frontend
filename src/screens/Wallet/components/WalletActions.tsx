import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WalletAction } from "../types";
import { actionsStyles } from "../styles";
import { useCustomAlert } from "../../../hooks/useCustomAlert";
import { CustomAlert } from "../../../components/ui/CustomAlert";

interface WalletActionsProps {
  actions: WalletAction[];
}

export const WalletActions: React.FC<WalletActionsProps> = ({ actions }) => {
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();

  const handlePress = (action: WalletAction) => {
    if (action.onPress) {
      action.onPress();
    }
  };

  return (
    <>
      <View style={actionsStyles.actionsContainer}>
        {actions.map((action) => {
          const IconComponent = action.icon as
            | React.ComponentType<any>
            | undefined;

          if (!IconComponent) {
            console.warn(
              `WalletActions: icon for action "${action.id}" is undefined`
            );
          }

          return (
            <TouchableOpacity
              key={action.id}
              style={actionsStyles.actionButton}
              onPress={() => handlePress(action)}
            >
              <View
                style={[
                  actionsStyles.actionIcon,
                  { backgroundColor: action.backgroundColor || "#FFFFFF" },
                ]}
              >
                {IconComponent ? (
                  <IconComponent
                    width={24}
                    height={action.id === "exchange" ? 18 : 22}
                  />
                ) : (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: "#EEE",
                      borderRadius: 6,
                    }}
                  />
                )}
              </View>
              <Text style={actionsStyles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </>
  );
};
