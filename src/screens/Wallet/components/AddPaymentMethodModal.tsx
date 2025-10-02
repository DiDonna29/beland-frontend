import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { X, ChevronDown } from "lucide-react-native";
import { AddPaymentMethodFormData, PaymentMethodType } from "../types";
import PayphoneIcon from "src/components/icons/PayphoneIcon";

interface AddPaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: AddPaymentMethodFormData) => void;
}

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [selectedType, setSelectedType] = useState<PaymentMethodType | null>(
    null
  );
  const [formData, setFormData] = useState<AddPaymentMethodFormData>({
    type: "payphone",
    alias: "",
    email: "",
    accountNumber: "",
    bankName: "",
    accountType: "corriente",
  });

  const resetForm = () => {
    setSelectedType(null);
    setFormData({
      type: "payphone",
      alias: "",
      email: "",
      accountNumber: "",
      bankName: "",
      accountType: "corriente",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectType = (type: PaymentMethodType) => {
    setSelectedType(type);
    setFormData({ ...formData, type });
  };

  const handleAdd = () => {
    // Validaciones básicas
    if (!formData.alias.trim()) {
      Alert.alert("Error", "El alias es obligatorio");
      return;
    }

    if (formData.type === "payphone" && !formData.email?.trim()) {
      Alert.alert("Error", "El email es obligatorio para Mercado Pago");
      return;
    }

    if (formData.type === "cuenta_bancaria") {
      if (!formData.accountNumber?.trim()) {
        Alert.alert("Error", "El número de cuenta es obligatorio");
        return;
      }
      if (!formData.bankName?.trim()) {
        Alert.alert("Error", "El nombre del banco es obligatorio");
        return;
      }
    }

    onAdd(formData);
    handleClose();
  };

  const renderTypeSelection = () => (
    <View style={styles.typeSelection}>
      <Text style={styles.sectionTitle}>Tipo de cuenta</Text>

      <TouchableOpacity
        style={[
          styles.typeOption,
          selectedType === "payphone" && styles.typeOptionSelected,
        ]}
        onPress={() => handleSelectType("payphone")}
      >
        <View style={styles.typeOptionContent}>
          <View style={styles.typeIcon}>
            <PayphoneIcon />
          </View>
          <Text style={styles.typeOptionText}>Cuenta de Payphone</Text>
        </View>
        <View
          style={[
            styles.radioButton,
            selectedType === "payphone" && styles.radioButtonSelected,
          ]}
        >
          {selectedType === "payphone" && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeOption,
          selectedType === "cuenta_bancaria" && styles.typeOptionSelected,
        ]}
        onPress={() => handleSelectType("cuenta_bancaria")}
      >
        <View style={styles.typeOptionContent}>
          <View style={styles.typeIcon}>
            <Text style={styles.typeIconText}>🏦</Text>
          </View>
          <Text style={styles.typeOptionText}>Cuenta Bancaria</Text>
        </View>
        <View
          style={[
            styles.radioButton,
            selectedType === "cuenta_bancaria" && styles.radioButtonSelected,
          ]}
        >
          {selectedType === "cuenta_bancaria" && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderForm = () => {
    if (!selectedType) return null;

    return (
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>
          {selectedType === "payphone" ? "Payphone" : "Cuenta Bancaria"}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ingresa tu alias o e-mail</Text>
          <TextInput
            style={styles.input}
            placeholder={
              selectedType === "payphone"
                ? "sofia.rayo.blanco"
                : "Mi cuenta principal"
            }
            value={
              selectedType === "payphone" ? formData.email : formData.alias
            }
            onChangeText={(text) => {
              if (selectedType === "payphone") {
                setFormData({ ...formData, email: text, alias: text });
              } else {
                setFormData({ ...formData, alias: text });
              }
            }}
            autoCapitalize="none"
            keyboardType={
              selectedType === "payphone" ? "email-address" : "default"
            }
          />
        </View>

        {selectedType === "cuenta_bancaria" && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número de cuenta</Text>
              <TextInput
                style={styles.input}
                placeholder="1234567890"
                value={formData.accountNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, accountNumber: text })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Banco</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del banco"
                value={formData.bankName}
                onChangeText={(text) =>
                  setFormData({ ...formData, bankName: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo de cuenta</Text>
              <View style={styles.selectContainer}>
                <TouchableOpacity
                  style={[
                    styles.selectOption,
                    formData.accountType === "corriente" &&
                      styles.selectOptionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, accountType: "corriente" })
                  }
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      formData.accountType === "corriente" &&
                        styles.selectOptionTextSelected,
                    ]}
                  >
                    Corriente
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectOption,
                    formData.accountType === "ahorros" &&
                      styles.selectOptionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, accountType: "ahorros" })
                  }
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      formData.accountType === "ahorros" &&
                        styles.selectOptionTextSelected,
                    ]}
                  >
                    Ahorros
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Añadir método de pago</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {renderTypeSelection()}
            {renderForm()}
          </ScrollView>

          {selectedType && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>Añadir</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  typeSelection: {
    marginBottom: 24,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 12,
  },
  typeOptionSelected: {
    borderColor: "#FF6B35",
    backgroundColor: "#FFF5F2",
  },
  typeOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  typeIconText: {
    fontSize: 14,
    fontWeight: "600",
  },
  typeOptionText: {
    fontSize: 16,
    color: "#333",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#FF6B35",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B35",
  },
  form: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  selectContainer: {
    flexDirection: "row",
    gap: 12,
  },
  selectOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    alignItems: "center",
  },
  selectOptionSelected: {
    borderColor: "#FF6B35",
    backgroundColor: "#FFF5F2",
  },
  selectOptionText: {
    fontSize: 14,
    color: "#666",
  },
  selectOptionTextSelected: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addButton: {
    backgroundColor: "#7FB069",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
