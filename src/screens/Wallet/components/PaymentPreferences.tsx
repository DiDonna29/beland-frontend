import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { Plus, CreditCard, Building2, MoreVertical } from "lucide-react-native";
import { PaymentMethod, PaymentMethodType } from "../types";
import { AddPaymentMethodModal } from "./AddPaymentMethodModal";
import PayphoneIcon from "src/components/icons/PayphoneIcon";

interface PaymentPreferencesProps {
  methods: PaymentMethod[];
  onAddMethod: (method: Omit<PaymentMethod, "id" | "createdAt">) => void;
  onDeleteMethod: (methodId: string) => void;
  onSetDefault: (methodId: string) => void;
}

export const PaymentPreferences: React.FC<PaymentPreferencesProps> = ({
  methods,
  onAddMethod,
  onDeleteMethod,
  onSetDefault,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMethodMenu, setActiveMethodMenu] = useState<string | null>(null);

  const handleAddMethod = (formData: any) => {
    const newMethod: Omit<PaymentMethod, "id" | "createdAt"> = {
      type: formData.type,
      alias: formData.alias,
      email: formData.email,
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      accountType: formData.accountType,
      isDefault: methods.length === 0, // Primer método es default
    };

    onAddMethod(newMethod);
  };

  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case "payphone":
        return (
          <View style={styles.methodIconMP}>
            <PayphoneIcon />
          </View>
        );
      case "cuenta_bancaria":
        return <Building2 size={20} color="#333" />;
      default:
        return <CreditCard size={20} color="#333" />;
    }
  };

  const getMethodTitle = (method: PaymentMethod) => {
    switch (method.type) {
      case "payphone":
        return "Payphone";
      case "cuenta_bancaria":
        return method.bankName || "Cuenta Bancaria";
      default:
        return "Método de pago";
    }
  };

  const getMethodSubtitle = (method: PaymentMethod) => {
    switch (method.type) {
      case "payphone":
        return method.email;
      case "cuenta_bancaria":
        return `${method.accountType?.toUpperCase()} - ${method.accountNumber}`;
      default:
        return method.alias;
    }
  };

  const handleMethodOptions = (method: PaymentMethod) => {
    setActiveMethodMenu(method.id);
  };

  const closeMethodMenu = () => {
    setActiveMethodMenu(null);
  };

  const handleSetDefault = (methodId: string) => {
    onSetDefault(methodId);
    closeMethodMenu();
  };

  const handleDeleteMethod = (methodId: string) => {
    Alert.alert(
      "Eliminar método de pago",
      "¿Estás seguro de que quieres eliminar este método de pago?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            onDeleteMethod(methodId);
            closeMethodMenu();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Preferencias de pago</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {methods.length === 0 ? (
        <View style={styles.emptyState}>
          <CreditCard size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No tienes métodos de pago</Text>
          <Text style={styles.emptySubtitle}>
            Agrega tu primera cuenta para recibir pagos
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={16} color="#fff" />
            <Text style={styles.emptyButtonText}>Agregar método</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.methodsList}>
          {methods.map((method, index) => (
            <View
              key={method.id}
              style={[
                styles.methodCard,
                index % 2 === 1 && styles.methodCardRight,
              ]}
            >
              {/* Header con badge y botón de opciones */}
              <View style={styles.cardHeader}>
                <View style={styles.leftSpacer} />
                <View style={styles.rightSection}>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>
                        Predeterminado
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.optionsButton}
                    onPress={() => handleMethodOptions(method)}
                  >
                    <MoreVertical size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.methodContent}>
                <View style={styles.methodIcon}>
                  {getMethodIcon(method.type)}
                </View>
                <View style={styles.methodInfo}>
                  <View style={styles.methodHeader}>
                    <Text style={styles.methodTitle} numberOfLines={1}>
                      {getMethodTitle(method)}
                    </Text>
                  </View>
                  <Text style={styles.methodSubtitle} numberOfLines={1}>
                    {getMethodSubtitle(method)}
                  </Text>
                  <Text style={styles.methodAlias} numberOfLines={1}>
                    {method.alias}
                  </Text>
                </View>
              </View>

              {/* Menu de opciones */}
              {activeMethodMenu === method.id && (
                <Modal
                  transparent
                  visible={true}
                  onRequestClose={closeMethodMenu}
                  animationType="fade"
                >
                  <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={closeMethodMenu}
                  >
                    <View style={styles.menuContainer}>
                      {!method.isDefault && (
                        <TouchableOpacity
                          style={styles.menuOption}
                          onPress={() => handleSetDefault(method.id)}
                        >
                          <Text style={styles.menuOptionText}>
                            Establecer como predeterminado
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.menuOption, styles.menuOptionDanger]}
                        onPress={() => handleDeleteMethod(method.id)}
                      >
                        <Text
                          style={[
                            styles.menuOptionText,
                            styles.menuOptionTextDanger,
                          ]}
                        >
                          Eliminar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
            </View>
          ))}
        </View>
      )}

      <AddPaymentMethodModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMethod}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF5F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B35",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  methodsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  methodCard: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    width: "48%", // Para que quepan 2 lado a lado
    minHeight: 120,
  },
  methodCardRight: {
    marginLeft: 0, // Sin margen adicional ya que flexWrap maneja el espaciado
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    minHeight: 24,
    marginBottom: 8,
  },
  leftSpacer: {
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  methodContent: {
    flexDirection: "column", // Cambiado a column para layout vertical
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  methodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignSelf: "center",
  },
  methodIconMP: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  methodIconText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  methodInfo: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  methodHeader: {
    justifyContent: "center",
    marginBottom: 4,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  defaultBadge: {
    backgroundColor: "#7FB069",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  defaultBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  methodSubtitle: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
    textAlign: "center",
  },
  methodAlias: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
  },
  optionsButton: {
    padding: 4,
  },
  // Estilos para el menú de opciones
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuOptionDanger: {
    borderBottomWidth: 0,
  },
  menuOptionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  menuOptionTextDanger: {
    color: "#FF3B30",
  },
});
