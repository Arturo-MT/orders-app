import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";
import { useOrderQuery, useUpdateOrder } from "@/hooks/api/orders";
import { useTablesQuery, useUpdateTable } from "@/hooks/api/tables";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import {
  clearOrderState,
  getOrderState,
  setOrderExpanded,
  setOrderPaidItem,
} from "../orderStates";
import { OrderActions } from "./OrderActions";
import { OrderHeader } from "./OrderHeader";
import { OrderItemRow } from "./OrderItemRow";
import { TablePickerModal } from "./TablePickerModal";
import { isCloseableStatus } from "./orderHelpers";
import { OrderDetail, OrderSummary } from "./types";

interface Props {
  order: OrderSummary;
  onRemove?: (orderId: string) => void;
}

export default function OrderCard({ order, onRemove }: Props) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const savedState = getOrderState(order.id);
  const [expanded, setExpanded] = useState(savedState.expanded);
  const [paidItems, setPaidItems] = useState(savedState.paidItems);
  const [tablePickerVisible, setTablePickerVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "pay" | "close" | "type" | null
  >(null);
  const updateOrder = useUpdateOrder();
  const updateTable = useUpdateTable();
  const { data: tables } = useTablesQuery();
  const { data, isLoading } = useOrderQuery({
    orderId: order.id,
    enabled: expanded,
  });
  const orderData = data as OrderDetail | undefined;

  useEffect(() => setOrderExpanded(order.id, expanded), [expanded, order.id]);

  const togglePaidItem = (itemId: string) => {
    const nextValue = !paidItems[itemId];
    setPaidItems((current) => ({ ...current, [itemId]: nextValue }));
    setOrderPaidItem(order.id, itemId, nextValue);
  };

  const mutateOrder = async (
    patch: Parameters<typeof updateOrder.mutateAsync>[0]["patch"],
    successMessage: string
  ) => {
    await updateOrder.mutateAsync({ orderId: order.id, patch });
    showToast(successMessage, "success");
  };

  const changeTable = async (tableId: string) => {
    setTablePickerVisible(false);
    if (tableId === order.table_id) return;
    try {
      await updateOrder.mutateAsync({
        orderId: order.id,
        patch: { table_id: tableId },
      });
      if (order.table_id)
        await updateTable.mutateAsync({
          id: order.table_id,
          isOccupied: false,
        });
      await updateTable.mutateAsync({ id: tableId, isOccupied: true });
      showToast("Mesa actualizada", "success");
    } catch {
      showToast("Error al cambiar la mesa", "error");
    }
  };

  const toggleType = async () => {
    if (pendingAction) return;
    setPendingAction("type");
    try {
      const type = order.type === "TAKEAWAY" ? "DINE_IN" : "TAKEAWAY";
      await mutateOrder(
        { type },
        type === "TAKEAWAY"
          ? "Orden cambiada a para llevar"
          : "Orden cambiada a en mesa"
      );
    } catch {
      showToast("Error al cambiar el tipo de orden", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const togglePayment = async () => {
    if (pendingAction || !orderData) return;
    setPendingAction("pay");
    try {
      const isPaid = orderData.payment_status === "PAID";
      await mutateOrder(
        { payment_status: isPaid ? "PENDING" : "PAID" },
        isPaid ? "Pago deshecho" : "Orden marcada como pagada"
      );
    } catch {
      showToast("Error al actualizar el pago", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const closeOrChangeStatus = async () => {
    if (pendingAction || !orderData) return;
    setPendingAction("close");
    try {
      if (orderData.status === "CLOSED") {
        const status = order.dispatched_at
          ? "DISPATCHED"
          : order.prepared_at
            ? "PREPARING"
            : "OPEN";
        await mutateOrder(
          { status, payment_status: "PENDING", closed_at: null },
          "Orden reabierta"
        );
        if (order.table_id)
          await updateTable.mutateAsync({
            id: order.table_id,
            isOccupied: true,
          });
      } else if (orderData.status === "SCHEDULED") {
        await mutateOrder(
          { status: "OPEN", scheduled_for: null },
          "Orden abierta"
        );
        if (order.table_id)
          await updateTable.mutateAsync({
            id: order.table_id,
            isOccupied: true,
          });
        onRemove?.(order.id);
      } else {
        await mutateOrder(
          {
            status: "CLOSED",
            payment_status: "PAID",
            closed_at: new Date().toISOString(),
          },
          "Orden cerrada"
        );
        if (order.table_id)
          await updateTable.mutateAsync({
            id: order.table_id,
            isOccupied: false,
          });
        clearOrderState(order.id);
        onRemove?.(order.id);
      }
    } catch {
      showToast("No se pudo actualizar la orden", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const paidTotal =
    orderData?.items.reduce(
      (sum, item) =>
        sum + (paidItems[item.id] ? Number(item.total_price) || 0 : 0),
      0
    ) ?? 0;
  const total =
    orderData?.items.reduce(
      (sum, item) => sum + (Number(item.total_price) || 0),
      0
    ) ?? 0;
  const isTakeaway = order.type === "TAKEAWAY";

  const card = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderLeftColor: isTakeaway ? "#e0a020" : theme.success,
        },
      ]}
    >
      <OrderHeader
        order={order}
        expanded={expanded}
        onPress={() => setExpanded((value) => !value)}
        theme={theme}
      />
      {expanded ? (
        <View style={styles.details}>
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.textPrimary} />
          ) : orderData ? (
            <>
              {orderData.items.map((item) => (
                <OrderItemRow
                  key={item.id}
                  item={item}
                  isPaid={!!paidItems[item.id]}
                  onTogglePaid={() => togglePaidItem(item.id)}
                  theme={theme}
                />
              ))}
              <View style={styles.totals}>
                <Animated.Text
                  style={[styles.totalText, { color: theme.textSecondary }]}
                >
                  Pagado: ${paidTotal.toFixed(2)}
                </Animated.Text>
                <Animated.Text
                  style={[styles.totalText, { color: theme.textSecondary }]}
                >
                  Pendiente: ${(total - paidTotal).toFixed(2)}
                </Animated.Text>
              </View>
              <OrderActions
                status={orderData.status}
                paymentStatus={orderData.payment_status}
                type={order.type}
                pendingAction={pendingAction}
                isUpdatingTable={updateTable.isPending}
                theme={theme}
                onToggleType={toggleType}
                onTogglePayment={togglePayment}
                onChangeTable={() => setTablePickerVisible(true)}
                onClose={closeOrChangeStatus}
              />
            </>
          ) : null}
        </View>
      ) : null}
      <TablePickerModal
        visible={tablePickerVisible}
        tables={tables}
        selectedTableId={order.table_id}
        theme={theme}
        onClose={() => setTablePickerVisible(false)}
        onSelect={changeTable}
      />
    </View>
  );

  if (!isCloseableStatus(order.status)) return card;

  return <View style={styles.card}>{card}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 8, marginBottom: 8, borderLeftWidth: 3 },
  details: { padding: 12 },
  totals: { alignItems: "flex-end" },
  totalText: { fontSize: 14 },
});
