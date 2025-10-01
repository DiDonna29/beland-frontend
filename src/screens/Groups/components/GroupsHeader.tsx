import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { containerStyles, buttonStyles } from "../styles";
import { UserMenu } from "../../../components/ui/UserMenu";

interface GroupsHeaderProps {
  onCreateGroup: () => void;
}

export const GroupsHeader: React.FC<GroupsHeaderProps> = ({
  onCreateGroup,
}) => {
  return (
    <View style={containerStyles.titleContainer}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={containerStyles.sectionTitle}>Mis Grupos</Text>
          <Text style={containerStyles.subtitle}>
            Gestiona tus compras grupales
          </Text>
        </View>
        <UserMenu />
      </View>

      <TouchableOpacity
        style={buttonStyles.createButton}
        activeOpacity={0.8}
        onPress={onCreateGroup}
      >
        <Text style={buttonStyles.createButtonText}>+ Crear Nuevo Grupo</Text>
      </TouchableOpacity>
    </View>
  );
};
