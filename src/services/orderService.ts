import { apiRequest } from "./api";
import { Order, OrderStatus, CreateOrderRequest } from "../types/Order";

// Types adicionales para el servicio de órdenes
export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface OrderDeliveryConfirmation {
  order_id: string;
  delivery_confirmed_at: Date;
  delivery_notes?: string;
}

export interface OrderReceptionConfirmation {
  order_id: string;
  received_confirmed_at: Date;
  customer_rating?: number;
  customer_feedback?: string;
}

class OrderService {
  // Crear orden desde carrito
  async createOrderFromCart(cartId: string): Promise<Order> {
    try {
      // Validar que el cartId sea un string válido
      if (!cartId || typeof cartId !== "string" || cartId.trim() === "") {
        throw new Error(`Invalid cart_id: ${cartId}`);
      }

      // Usar query parameter según la documentación de la API
      const response = await apiRequest(
        `/orders/cart?cart_id=${encodeURIComponent(cartId.trim())}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      // Diagnostic: show raw response from backend for debugging delivery address
      try {
        console.log(
          "[OrderService] Raw createOrderFromCart response:",
          response
        );
      } catch (e) {}

      // Try to map the initial response immediately so we can log/return it if GET fails
      let mappedInitial: any = null;
      try {
        mappedInitial = this.mapOrderResponse(response);
        try {
          console.log(
            "[OrderService] Mapped initial response (before GET):",
            mappedInitial
          );
        } catch (e) {}
      } catch (mapErr) {
        try {
          console.warn(
            "[OrderService] Could not map initial response (before GET):",
            mapErr
          );
        } catch (e) {}
        mappedInitial = null;
      }

      // Si la respuesta no incluye la dirección de entrega, intentar obtener la orden completa
      if (
        response &&
        !response.delivery_address &&
        !response.deliveryAddress &&
        response.id
      ) {
        try {
          const full = await apiRequest(`/orders/${response.id}`, {
            method: "GET",
          });
          try {
            console.log(
              "[OrderService] Raw GET /orders/:id response after create:",
              full
            );
          } catch (e) {}
          return this.mapOrderResponse(full);
        } catch (e) {
          // Log details from the GET failure if available
          console.warn(
            "⚠️ OrderService: could not fetch full order after creation, returning initial response",
            e
          );
          try {
            // if the thrown error has a body/status, print it
            console.warn(
              "[OrderService] GET /orders/:id error details:",
              (e as any)?.body || (e as any)?.message || e
            );
          } catch (ee) {}
          // If we have the mapped initial response, return it and mark that GET failed
          if (mappedInitial) {
            try {
              (mappedInitial as any).__get_failed = true;
            } catch {}
            try {
              console.log(
                "[OrderService] Returning mapped initial response due to GET failure:",
                mappedInitial
              );
            } catch (ee) {}
            return mappedInitial;
          }
        }
      }

      // If we reach here, either GET was unnecessary or it failed and we couldn't map;
      // prefer mappedInitial if available, otherwise map now (this may throw).
      if (mappedInitial) return mappedInitial;
      const mapped = this.mapOrderResponse(response);
      try {
        console.log(
          "[OrderService] Mapped order from createOrderFromCart:",
          mapped
        );
      } catch (e) {}
      return mapped;
    } catch (error) {
      console.error("❌ OrderService: Error creating order from cart:", error);

      // Log more details about the error
      if (error instanceof Error && "status" in error) {
        console.error("❌ OrderService: HTTP Status:", (error as any).status);
        console.error("❌ OrderService: Error body:", (error as any).body);
      }

      throw error;
    }
  }

  // Crear orden directa (sin carrito)
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      // Debug logs removed

      const response = await apiRequest("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      // Diagnostic: raw response when creating order directly
      try {
        console.log("[OrderService] Raw createOrder response:", response);
      } catch (e) {}

      // Try to map initial response immediately for diagnostics and fallback
      let mappedInitialDirect: any = null;
      try {
        mappedInitialDirect = this.mapOrderResponse(response);
        try {
          console.log(
            "[OrderService] Mapped initial createOrder response:",
            mappedInitialDirect
          );
        } catch (e) {}
      } catch (mapErr) {
        try {
          console.warn(
            "[OrderService] Could not map initial createOrder response:",
            mapErr
          );
        } catch (e) {}
        mappedInitialDirect = null;
      }

      if (
        response &&
        !response.delivery_address &&
        !response.deliveryAddress &&
        response.id
      ) {
        try {
          const full = await apiRequest(`/orders/${response.id}`, {
            method: "GET",
          });
          try {
            console.log(
              "[OrderService] Raw GET /orders/:id response after create (direct):",
              full
            );
          } catch (e) {}
          return this.mapOrderResponse(full);
        } catch (e) {
          console.warn("⚠️ OrderService: GET after createOrder failed:", e);
          try {
            console.warn(
              "[OrderService] GET /orders/:id error details:",
              (e as any)?.body || (e as any)?.message || e
            );
          } catch (ee) {}
          if (mappedInitialDirect) {
            try {
              (mappedInitialDirect as any).__get_failed = true;
            } catch {}
            try {
              console.log(
                "[OrderService] Returning mapped initial createOrder response due to GET failure:",
                mappedInitialDirect
              );
            } catch (ee) {}
            return mappedInitialDirect;
          }
        }
      }

      const mapped = this.mapOrderResponse(response);
      try {
        console.log("[OrderService] Mapped order from createOrder:", mapped);
      } catch (e) {}
      return mapped;
    } catch (error) {
      console.error("❌ OrderService: Error creating order:", error);

      // Log more details about the error
      if (error instanceof Error && "status" in error) {
        console.error("❌ OrderService: HTTP Status:", (error as any).status);
        console.error("❌ OrderService: Error body:", (error as any).body);
      }

      throw error;
    }
  }

  // Obtener órdenes del usuario
  async getUserOrders(query: OrderQuery = {}): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams();
      if (query.page) params.append("page", String(query.page));
      if (query.limit) params.append("limit", String(query.limit));
      if (query.status) params.append("status", query.status);
      if (query.date_from) params.append("date_from", query.date_from);
      if (query.date_to) params.append("date_to", query.date_to);

      const url = `/orders/user?${params.toString()}`;
      const response = await apiRequest(url, {
        method: "GET",
      });

      // Determinar qué contiene las órdenes
      let ordersArray = response.orders || response;

      // Manejar el caso donde el backend devuelve [array_de_ordenes, total]
      if (Array.isArray(ordersArray) && ordersArray.length >= 2) {
        const firstElement = ordersArray[0];
        const secondElement = ordersArray[1];

        // Si el primer elemento es un array de órdenes y el segundo es un número (total)
        if (Array.isArray(firstElement) && typeof secondElement === "number") {
          ordersArray = firstElement; // Usar solo el array de órdenes
        }
      }

      // Filtrar y mapear solo elementos válidos
      const validOrders = Array.isArray(ordersArray)
        ? ordersArray.filter((item, index) => {
            const isValid = item && typeof item === "object" && item.id;
            return isValid;
          })
        : [];

      return {
        orders: validOrders.map(this.mapOrderResponse.bind(this)),
        total:
          response.total ||
          (typeof response[1] === "number"
            ? response[1]
            : validOrders.length) ||
          0,
        page: response.page || query.page || 1,
        limit: response.limit || query.limit || 10,
      };
    } catch (error) {
      console.error("Error getting user orders:", error);
      throw error;
    }
  }

  // Obtener órdenes pendientes (para admin)
  async getPendingOrders(query: OrderQuery = {}): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams();
      if (query.page) params.append("page", String(query.page));
      if (query.limit) params.append("limit", String(query.limit));

      const url = `/orders/pending?${params.toString()}`;
      const response = await apiRequest(url, {
        method: "GET",
      });

      return {
        orders: (response.orders || response).map(this.mapOrderResponse),
        total: response.total || response.length || 0,
        page: response.page || query.page || 1,
        limit: response.limit || query.limit || 10,
      };
    } catch (error) {
      console.error("Error getting pending orders:", error);
      throw error;
    }
  }

  // Obtener orden por ID
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await apiRequest(`/orders/${orderId}`, {
        method: "GET",
      });
      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("Error getting order by ID:", error);
      throw error;
    }
  }

  // Confirmar entrega (delivery)
  async confirmDelivery(orderId: string, notes?: string): Promise<Order> {
    try {
      const url = `/orders/delivered?order_id=${orderId}`;
      const body = notes ? JSON.stringify({ notes }) : undefined;

      const response = await apiRequest(url, {
        method: "PUT",
        headers: body ? { "Content-Type": "application/json" } : {},
        body,
      });
      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("Error confirming delivery:", error);
      throw error;
    }
  }

  // Confirmar recepción (cliente)
  async confirmReception(
    orderId: string,
    rating?: number,
    feedback?: string
  ): Promise<Order> {
    try {
      const url = `/orders/received?order_id=${orderId}`;
      const body: any = {};

      if (rating !== undefined) body.rating = rating;
      if (feedback) body.feedback = feedback;

      const response = await apiRequest(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });
      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("Error confirming reception:", error);
      throw error;
    }
  }

  // Actualizar estado de orden
  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<Order> {
    try {
      const response = await apiRequest(`/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  // Cancelar orden
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await apiRequest(`/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: reason ? JSON.stringify({ reason }) : undefined,
      });
      return this.mapOrderResponse(response);
    } catch (error) {
      console.error("Error canceling order:", error);
      throw error;
    }
  }

  // Helper para mapear respuesta del backend
  private mapOrderResponse(response: any): Order {
    // Validar que la respuesta sea un objeto válido
    if (!response || typeof response !== "object") {
      throw new Error(
        `Invalid order data: expected object, got ${typeof response}`
      );
    }

    // Validar que tenga al menos un ID
    if (!response.id) {
      throw new Error("Order data missing required ID field");
    }

    // Helper function para parsear fechas de forma segura
    const parseDate = (dateValue: any, fieldName: string): Date => {
      if (!dateValue) {
        return new Date();
      }
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return new Date();
      }
      return date;
    };

    const parseOptionalDate = (
      dateValue: any,
      fieldName: string
    ): Date | undefined => {
      if (!dateValue) {
        return undefined;
      }
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return undefined;
      }
      return date;
    };

    // Mapear el status correctamente desde el objeto anidado
    let orderStatus: OrderStatus = "pending";
    if (response.status?.code) {
      const statusCode = response.status.code.toLowerCase();
      switch (statusCode) {
        case "pending":
          orderStatus = "pending";
          break;
        case "confirmed":
          orderStatus = "confirmed";
          break;
        case "preparing":
          orderStatus = "preparing";
          break;
        case "ready":
          orderStatus = "ready";
          break;
        case "shipped":
          orderStatus = "shipped";
          break;
        case "delivered":
          orderStatus = "delivered";
          break;
        case "cancelled":
          orderStatus = "cancelled";
          break;
        case "refunded":
          orderStatus = "refunded";
          break;
        default:
          orderStatus = "pending";
      }
    }

    const mappedOrder = {
      id: response.id,
      userId: response.user_id || response.userId || "",
      items: Array.isArray(response.items)
        ? response.items.map((it: any) => {
            if (!it || typeof it !== "object") return it;
            const id = it.id || it.item_id || `${response.id}-${Math.random()}`;
            const productId = it.product_id || it.productId || it.product || "";
            const name = it.name || it.title || it.product_name || "";
            const price = parseFloat(
              (it.price !== undefined && it.price !== null
                ? it.price
                : it.unit_price) || 0
            );
            // Support becoin unit/total naming variants from backend
            const priceBecoin =
              it.unit_becoin ||
              it.unitBecoin ||
              it.unit_becoins ||
              it.price_becoin ||
              it.priceBecoin ||
              it.price_becoins ||
              it.total_becoin ||
              it.totalBecoin ||
              undefined;
            const priceBecoinNum =
              priceBecoin !== undefined && priceBecoin !== null
                ? parseFloat(priceBecoin)
                : undefined;
            const quantity = parseInt(it.quantity || it.qty || 1, 10) || 1;
            const image = it.image || it.image_url || it.imageUrl || undefined;
            const subtotal = parseFloat(
              it.subtotal ||
                it.total ||
                it.total_price ||
                it.totalPrice ||
                price * quantity ||
                0
            );

            const mappedItem: any = {
              id,
              productId,
              product_id: it.product_id || undefined,
              name,
              price: isNaN(price) ? 0 : price,
              quantity,
              image,
              subtotal: isNaN(subtotal) ? 0 : subtotal,
            };

            if (priceBecoinNum !== undefined && !isNaN(priceBecoinNum)) {
              mappedItem.priceBecoin = priceBecoinNum;
            }

            return mappedItem;
          })
        : [],
      subtotal: parseFloat(response.subtotal || response.total_amount || 0),
      discount: parseFloat(response.discount || 0),
      deliveryFee: parseFloat(
        response.delivery_fee || response.deliveryFee || 0
      ),
      total: parseFloat(response.total || response.total_amount || 0),
      deliveryType: response.delivery_type || response.deliveryType || "home",
      // Normalize address returned as `address` or `delivery_address` to our DeliveryAddress
      deliveryAddress: (() => {
        const da =
          response.delivery_address ||
          response.deliveryAddress ||
          response.address ||
          response.addresses;
        if (!da || typeof da !== "object") return undefined;

        const street =
          da.street || da.addressLine1 || da.address_line_1 || da.address || "";
        const additionalInfo =
          da.additionalInfo ||
          da.addressLine2 ||
          da.address_line_2 ||
          da.addressLine2 ||
          da.address_line2 ||
          "";
        const city = da.city || da.town || da.suburb || "";
        const state = da.state || da.province || "";
        const zipCode =
          da.zipCode ||
          da.postalCode ||
          da.postal_code ||
          da.zip ||
          da.postal ||
          "";
        const country = da.country || "";
        const latitude =
          da.latitude !== undefined
            ? isNaN(Number(da.latitude))
              ? undefined
              : Number(da.latitude)
            : undefined;
        const longitude =
          da.longitude !== undefined
            ? isNaN(Number(da.longitude))
              ? undefined
              : Number(da.longitude)
            : undefined;
        const phone =
          da.phone || da.phone_number || da.phoneNumber || undefined;

        return {
          street,
          city,
          state,
          zipCode,
          country,
          additionalInfo,
          latitude,
          longitude,
          phone,
        };
      })(),
      groupId: response.group_id || response.groupId,
      status: orderStatus,
      createdAt: parseDate(
        response.created_at || response.createdAt,
        "createdAt"
      ),
      updatedAt: parseDate(
        response.updated_at || response.updatedAt,
        "updatedAt"
      ),
      estimatedDelivery: parseOptionalDate(
        response.estimated_delivery || response.estimatedDelivery,
        "estimatedDelivery"
      ),
      deliveredAt: parseOptionalDate(
        response.delivered_at || response.deliveredAt,
        "deliveredAt"
      ),
      notes: response.notes || "",
      trackingNumber: response.tracking_number || response.trackingNumber,
      paymentMethod:
        response.payment_method || response.paymentMethod || "becoins",
      paymentStatus:
        response.payment_status || response.paymentStatus || "pending",
      // Map becoins used: check several possible fields (be careful: backend uses different names)
      becoinsUsed:
        response.becoins_used ||
        response.becoinsUsed ||
        (response.total_becoin ? parseFloat(response.total_becoin) : undefined),
    };

    // Si los items están vacíos pero tenemos total_items, crear items placeholder
    if (mappedOrder.items.length === 0 && response.total_items > 0) {
      mappedOrder.items = Array.from(
        { length: response.total_items },
        (_, index) => ({
          id: `${response.id}-item-${index + 1}`,
          productId: `unknown-product-${index + 1}`,
          name: `Producto ${index + 1}`,
          price: parseFloat(response.total_amount || 0) / response.total_items,
          quantity: 1,
          subtotal:
            parseFloat(response.total_amount || 0) / response.total_items,
        })
      );
    }

    return mappedOrder;
  }
}

export const orderService = new OrderService();
