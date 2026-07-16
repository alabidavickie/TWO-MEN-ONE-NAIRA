export interface Registration {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  amount: number;
  quantity?: number;
  currency: string;
  paymentStatus: "pending" | "success" | "failed";
  paymentReference: string;
  paymentMethod: string;
  createdAt: string;
}

export type PaymentMethod = "bank" | "card" | "crypto";

export interface TestTransaction {
  reference: string;
  amount: number;
  currency: string;
  status: "pending" | "success";
}
