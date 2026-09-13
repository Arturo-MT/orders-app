export type OrderType = "DINE_IN" | "TAKEAWAY";

export type OrderStatus =
  | "OPEN"
  | "PREPARING"
  | "DISPATCHED"
  | "CLOSED"
  | "SCHEDULED";

export type PaymentStatus = "PAID" | "PENDING" | null;
export type ItemStatus = "PENDING" | "READY";

export interface OrderSummary {
  id: string;
  order_number: string;
  type: OrderType;
  status: OrderStatus;
  payment_status: PaymentStatus;
  customer_name: string | null;
  table_name: string | null;
  table_id: string | null;
  created_at: string;
  opened_at?: string | null;
  prepared_at?: string | null;
  dispatched_at?: string | null;
  scheduled_for?: string | null;
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  notes?: string | null;
  total_price: number;
  status: ItemStatus;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[];
}

export interface DiningTable {
  id: string;
  name: string;
  is_occupied: boolean;
}
