import { apiRequest } from "./api";

// Types para direcciones de usuario
export interface UserAddress {
  id: string;
  user_id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAddressRequest {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface UpdateAddressRequest {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

class AddressService {
  // Obtener todas las direcciones del usuario
  async getUserAddresses(): Promise<UserAddress[]> {
    try {
      const response = await apiRequest("/user-address", {
        method: "GET",
      });

      // El backend puede retornar el array directamente o dentro de varias propiedades
      // Soportamos: response (array), response.addresses, response.data, response.items, response.results
      let addressesRaw: any = [];
      if (Array.isArray(response)) {
        // Algunos backends devuelven [items, meta] -> p.ej. [ [addresses], total ]
        if (Array.isArray(response[0])) {
          addressesRaw = response[0];
        } else {
          addressesRaw = response;
        }
      } else if (Array.isArray((response as any).addresses)) {
        addressesRaw = (response as any).addresses;
      } else if (Array.isArray((response as any).data)) {
        addressesRaw = (response as any).data;
      } else if (Array.isArray((response as any).items)) {
        addressesRaw = (response as any).items;
      } else if (Array.isArray((response as any).results)) {
        addressesRaw = (response as any).results;
      } else if (response && Array.isArray((response as any).data?.items)) {
        addressesRaw = (response as any).data.items;
      } else if (response && Array.isArray((response as any).data?.results)) {
        addressesRaw = (response as any).data.results;
      } else {
        // Fallback: try to pick any array-valued prop
        const anyArrayProp = Object.keys(response || {}).find((k) =>
          Array.isArray((response as any)[k])
        );
        addressesRaw = anyArrayProp ? (response as any)[anyArrayProp] : [];
      }

      // Aplanar cualquier anidamiento accidental y devolver
      const flattened = Array.isArray(addressesRaw)
        ? (addressesRaw as any[]).flat(Infinity)
        : [];

      return (flattened || []).map(this.mapAddressResponse);
    } catch (error) {
      console.error("Error getting user addresses:", error);
      throw error;
    }
  }

  // Crear nueva dirección
  async createAddress(data: CreateAddressRequest): Promise<UserAddress> {
    try {
      const response = await apiRequest("/user-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return this.mapAddressResponse(response);
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  }

  // Actualizar dirección existente
  async updateAddress(
    addressId: string,
    data: UpdateAddressRequest
  ): Promise<UserAddress> {
    try {
      const response = await apiRequest(`/user-address/${addressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return this.mapAddressResponse(response);
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  }

  // Eliminar dirección
  async deleteAddress(addressId: string): Promise<void> {
    try {
      await apiRequest(`/user-address/${addressId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  }

  // Obtener dirección por ID
  async getAddressById(addressId: string): Promise<UserAddress> {
    try {
      const response = await apiRequest(`/user-address/${addressId}`, {
        method: "GET",
      });
      return this.mapAddressResponse(response);
    } catch (error) {
      console.error("Error getting address by ID:", error);
      throw error;
    }
  }

  // Helper para mapear respuesta del backend
  private mapAddressResponse(response: any): UserAddress {
    return {
      id: response.id,
      user_id: response.user_id,
      addressLine1: response.addressLine1 || response.address_line_1,
      addressLine2: response.addressLine2 || response.address_line_2,
      city: response.city,
      state: response.state,
      country: response.country,
      postalCode: response.postalCode || response.postal_code,
      latitude: response.latitude ? parseFloat(response.latitude) : undefined,
      longitude: response.longitude
        ? parseFloat(response.longitude)
        : undefined,
      isDefault: response.isDefault || response.is_default || false,
      created_at: new Date(response.created_at),
      updated_at: new Date(response.updated_at),
    };
  }

  // Validar formato de dirección
  validateAddress(address: Partial<CreateAddressRequest>): string[] {
    const errors: string[] = [];

    if (!address.addressLine1?.trim()) {
      errors.push("La dirección es requerida");
    }

    if (!address.city?.trim()) {
      errors.push("La ciudad es requerida");
    }

    if (!address.country?.trim()) {
      errors.push("El país es requerido");
    }

    if (address.latitude && (address.latitude < -90 || address.latitude > 90)) {
      errors.push("Latitud inválida");
    }

    if (
      address.longitude &&
      (address.longitude < -180 || address.longitude > 180)
    ) {
      errors.push("Longitud inválida");
    }

    return errors;
  }

  // Marcar dirección como predeterminada
  async setDefaultAddress(addressId: string): Promise<UserAddress> {
    try {
      const response = await apiRequest(`/user-address/${addressId}/default`, {
        method: "PUT",
      });
      return this.mapAddressResponse(response);
    } catch (error) {
      console.error("Error setting default address:", error);
      throw error;
    }
  }
}

export const addressService = new AddressService();
