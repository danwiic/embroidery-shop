export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_VERIFIED"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export type Role = "ADMIN" | "CUSTOMER";
