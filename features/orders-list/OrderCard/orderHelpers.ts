import { Theme } from "@/constants/Colors";
import { OrderStatus, PaymentStatus } from "./types";

export const isCloseableStatus = (status: OrderStatus) =>
  status === "OPEN" || status === "PREPARING" || status === "DISPATCHED";

export const statusLabel = (status: OrderStatus) => {
  const labels: Record<OrderStatus, string> = {
    OPEN: "Abierta",
    PREPARING: "Preparando",
    DISPATCHED: "Despachada",
    CLOSED: "Cerrada",
    SCHEDULED: "Programada",
  };

  return labels[status];
};

export const paymentLabel = (status: PaymentStatus) =>
  status === "PAID" ? "Pagado" : "Pendiente";

export const statusColors = (status: OrderStatus, theme: Theme) => {
  if (status === "OPEN")
    return { backgroundColor: "#e0a02022", color: "#e0a020" };
  if (status === "PREPARING")
    return { backgroundColor: "#5b8def22", color: "#5b8def" };
  if (status === "DISPATCHED")
    return { backgroundColor: `${theme.success}22`, color: theme.success };
  if (status === "SCHEDULED")
    return { backgroundColor: "#7c6af722", color: "#7c6af7" };
  return { backgroundColor: theme.borderLight, color: theme.textMuted };
};

export const paymentColors = (status: PaymentStatus, theme: Theme) =>
  status === "PAID"
    ? { backgroundColor: `${theme.success}22`, color: theme.success }
    : { backgroundColor: "#e0a02022", color: "#e0a020" };

export const formatOrderDate = (dateString: string) => {
  const date = new Date(dateString);
  const isToday = date.toDateString() === new Date().toDateString();

  return isToday
    ? date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("es", { day: "2-digit", month: "short" });
};
