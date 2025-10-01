// import { apiRequest } from "./api";

import Constants from "expo-constants";

const API_URL =
  (Constants.expoConfig?.extra?.apiUrl as string) || "http://localhost:8081"; // Asegúrate de que esta URL apunte a tu backend

export const fetchCurrentUser = async (token: string) => {
  try {
    const response = await fetch(`${API_URL}users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Manejar errores de la respuesta HTTP
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data; // Esto debería ser el objeto UserDto
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error);
    return null;
  }
};
