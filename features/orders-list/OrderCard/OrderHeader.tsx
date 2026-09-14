import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { Theme } from "@/constants/Colors";
import { useElapsedTime } from "@/hooks/utils/useElapsedTime";
import {
  formatOrderDate,
  isCloseableStatus,
  paymentColors,
  paymentLabel,
  statusColors,
  statusLabel,
} from "./orderHelpers";
import { OrderSummary } from "./types";

interface Props {
  order: OrderSummary;
  expanded: boolean;
  onPress: () => void;
  theme: Theme;
}

export function OrderHeader({ order, expanded, onPress, theme }: Props) {
  const displayName = order.customer_name || order.table_name || "Sin nombre";
  const elapsed = useElapsedTime(order.opened_at ?? order.created_at);
  const status = statusColors(order.status, theme);
  const payment = paymentColors(order.payment_status, theme);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.main}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {displayName}
        </Text>
        <View style={styles.subRow}>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            #{order.order_number} · {formatOrderDate(order.created_at)}
          </Text>
          {order.status === "SCHEDULED" && order.scheduled_for ? (
            <View style={styles.scheduledBadge}>
              <Ionicons name="alarm-outline" size={11} color="#7c6af7" />
              <Text style={styles.scheduledText}>
                {new Date(order.scheduled_for).toLocaleTimeString("es", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          ) : isCloseableStatus(order.status) ? (
            <View
              style={[
                styles.elapsedBadge,
                { backgroundColor: theme.borderLight },
              ]}
            >
              <Text
                style={[styles.elapsedText, { color: theme.textSecondary }]}
              >
                {elapsed}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.badgeRow}>
          <View
            style={[styles.badge, { backgroundColor: status.backgroundColor }]}
          >
            <Text style={[styles.badgeText, { color: status.color }]}>
              {statusLabel(order.status)}
            </Text>
          </View>
          <View
            style={[styles.badge, { backgroundColor: payment.backgroundColor }]}
          >
            <Text style={[styles.badgeText, { color: payment.color }]}>
              {paymentLabel(order.payment_status)}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={18}
        color={theme.textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  main: { flex: 1, marginRight: 8 },
  title: { fontSize: 15, fontWeight: "600" },
  subRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  subtitle: { fontSize: 12 },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  elapsedBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  elapsedText: { fontSize: 11, fontWeight: "600" },
  scheduledBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: "#7c6af722",
  },
  scheduledText: { fontSize: 11, fontWeight: "600", color: "#7c6af7" },
});
