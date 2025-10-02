export type PaymentMethodType = "payphone" | "cuenta_bancaria";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  alias: string;
  email?: string; // Para Mercado Pago
  accountNumber?: string; // Para cuenta bancaria
  bankName?: string; // Para cuenta bancaria
  accountType?: "corriente" | "ahorros"; // Para cuenta bancaria
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentPreferencesData {
  methods: PaymentMethod[];
  defaultMethod?: PaymentMethod;
}

export interface AddPaymentMethodFormData {
  type: PaymentMethodType;
  alias: string;
  email?: string;
  accountNumber?: string;
  bankName?: string;
  accountType?: "corriente" | "ahorros";
}
