import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import CustomCheckbox from "@/components/CustomCheckbox";
import { Theme } from "@/constants/Colors";
import { OrderItem } from "./types";

interface Props {
  item: OrderItem;
  isPaid: boolean;
  onTogglePaid: () => void;
  theme: Theme;
}

export function OrderItemRow({ item, isPaid, onTogglePaid, theme }: Props) {
  const isReady = item.status === "READY";

  return (
    <Pressable onPress={onTogglePaid} style={styles.row}>
      <View pointerEvents="none">
        <CustomCheckbox value={isPaid} onChange={() => {}} />
      </View>
      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            { color: theme.textPrimary },
            isPaid && styles.paidText,
          ]}
        >
          {item.quantity} × {item.product_name}
        </Text>
        {item.notes ? (
          <Text
            style={[
              styles.notes,
              { color: theme.textSecondary },
              isPaid && styles.paidText,
            ]}
          >
            {item.notes}
          </Text>
        ) : null}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isReady ? `${theme.success}22` : "#e0a02022" },
          ]}
        >
          <Ionicons
            name={isReady ? "checkmark-circle-outline" : "time-outline"}
            size={12}
            color={isReady ? theme.success : "#e0a020"}
          />
          <Text
            style={[
              styles.statusText,
              { color: isReady ? theme.success : "#e0a020" },
            ]}
          >
            {isReady ? "Listo" : "Pendiente"}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.price,
          { color: theme.textPrimary },
          isPaid && styles.paidText,
        ]}
      >
        ${(Number(item.total_price) || 0).toFixed(2)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  info: { flex: 1, marginLeft: 6 },
  name: { fontSize: 14, fontWeight: "500" },
  notes: { fontSize: 12 },
  price: { fontSize: 14, fontWeight: "600", marginLeft: 8 },
  paidText: { textDecorationLine: "line-through", opacity: 0.55 },
  statusBadge: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: { fontSize: 10, fontWeight: "700" },
});
