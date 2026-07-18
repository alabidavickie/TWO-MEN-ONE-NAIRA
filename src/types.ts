export type PaymentStatus = "pending" | "success" | "failed" | "underpaid";

export interface Registration {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  // amount/currency are null until the Bachs webhook confirms the payment.
  amount?: number | null;
  currency?: string | null;
  quantity?: number;
  paymentStatus: PaymentStatus;
  // Our order reference (also the Bachs Idempotency-Key). Stored as `reference`
  // server-side; the status callable returns it as `paymentReference`.
  reference?: string;
  checkoutId?: string | null;
  chargeId?: string | null;
  paymentMethod: string;
  createdAt: string;
  confirmedAt?: string;
}

// Shape returned by the getCheckoutStatus callable.
export interface CheckoutStatus {
  status: PaymentStatus | "unknown";
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  quantity?: number;
  amount?: number | null;
  currency?: string | null;
  paymentReference?: string;
  paymentMethod?: string;
}
