import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { PaymentMethod, PaymentPreferencesData } from "../types";

// Mock data inicial - esto se reemplazará con llamadas reales a la API
const MOCK_INITIAL_DATA: PaymentPreferencesData = {
  methods: [],
  defaultMethod: undefined,
};

export const usePaymentPreferences = () => {
  const [data, setData] = useState<PaymentPreferencesData>(MOCK_INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // Simular carga inicial de datos
  useEffect(() => {
    loadPaymentPreferences();
  }, []);

  const loadPaymentPreferences = async () => {
    try {
      setIsLoading(true);
      // TODO: Reemplazar con llamada real a la API
      // const response = await api.getPaymentPreferences();
      // setData(response.data);

      // Por ahora usamos datos mock
      setData(MOCK_INITIAL_DATA);
    } catch (error) {
      console.error("Error loading payment preferences:", error);
      Alert.alert("Error", "No se pudieron cargar las preferencias de pago");
    } finally {
      setIsLoading(false);
    }
  };

  const addPaymentMethod = async (
    method: Omit<PaymentMethod, "id" | "createdAt">
  ) => {
    try {
      setIsLoading(true);

      // Generar ID temporal
      const newMethod: PaymentMethod = {
        ...method,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      // Si es el primer método, marcarlo como default
      if (data.methods.length === 0) {
        newMethod.isDefault = true;
      }

      // TODO: Reemplazar con llamada real a la API
      // const response = await api.addPaymentMethod(newMethod);
      // const savedMethod = response.data;

      const updatedMethods = [...data.methods, newMethod];
      const newData: PaymentPreferencesData = {
        methods: updatedMethods,
        defaultMethod: newMethod.isDefault ? newMethod : data.defaultMethod,
      };

      setData(newData);
      Alert.alert("Éxito", "Método de pago agregado correctamente");
    } catch (error) {
      console.error("Error adding payment method:", error);
      Alert.alert("Error", "No se pudo agregar el método de pago");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePaymentMethod = async (methodId: string) => {
    try {
      setIsLoading(true);

      // TODO: Reemplazar con llamada real a la API
      // await api.deletePaymentMethod(methodId);

      const methodToDelete = data.methods.find((m) => m.id === methodId);
      const updatedMethods = data.methods.filter((m) => m.id !== methodId);

      let newDefaultMethod = data.defaultMethod;

      // Si eliminamos el método default, establecer otro como default
      if (methodToDelete?.isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
        newDefaultMethod = updatedMethods[0];
      } else if (methodToDelete?.isDefault) {
        newDefaultMethod = undefined;
      }

      const newData: PaymentPreferencesData = {
        methods: updatedMethods,
        defaultMethod: newDefaultMethod,
      };

      setData(newData);
      Alert.alert("Éxito", "Método de pago eliminado correctamente");
    } catch (error) {
      console.error("Error deleting payment method:", error);
      Alert.alert("Error", "No se pudo eliminar el método de pago");
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    try {
      setIsLoading(true);

      // TODO: Reemplazar con llamada real a la API
      // await api.setDefaultPaymentMethod(methodId);

      const updatedMethods = data.methods.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      }));

      const newDefaultMethod = updatedMethods.find((m) => m.id === methodId);

      const newData: PaymentPreferencesData = {
        methods: updatedMethods,
        defaultMethod: newDefaultMethod,
      };

      setData(newData);
      Alert.alert("Éxito", "Método de pago predeterminado actualizado");
    } catch (error) {
      console.error("Error setting default payment method:", error);
      Alert.alert("Error", "No se pudo establecer el método predeterminado");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    refetch: loadPaymentPreferences,
  };
};
