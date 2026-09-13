import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Theme } from "@/constants/Colors";
import { isCloseableStatus } from "./orderHelpers";
import { OrderStatus, OrderType, PaymentStatus } from "./types";

interface Props {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  type: OrderType;
  pendingAction: "pay" | "close" | "type" | null;
  isUpdatingTable: boolean;
  theme: Theme;
  onToggleType: () => void;
  onTogglePayment: () => void;
  onChangeTable: () => void;
  onClose: () => void;
}

export function OrderActions({
  status,
  paymentStatus,
  type,
  pendingAction,
  isUpdatingTable,
  theme,
  onToggleType,
  onTogglePayment,
  onChangeTable,
  onClose,
}: Props) {
  const isTakeaway = type === "TAKEAWAY";
  const canClose = isCloseableStatus(status);

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        onPress={onToggleType}
        style={[styles.outlineButton, { borderColor: theme.border }]}
        disabled={pendingAction !== null}
      >
        {pendingAction === "type" ? (
          <ActivityIndicator size="small" color={theme.textPrimary} />
        ) : (
          <Ionicons
            name={isTakeaway ? "restaurant-outline" : "bag-handle-outline"}
            size={24}
            color={theme.textPrimary}
          />
        )}
      </TouchableOpacity>
      {canClose ? (
        <TouchableOpacity
          onPress={onTogglePayment}
          style={[
            styles.button,
            {
              backgroundColor:
                paymentStatus === "PAID" ? theme.textSecondary : theme.success,
            },
          ]}
          disabled={pendingAction !== null}
        >
          {pendingAction === "pay" ? (
            <ActivityIndicator size="small" color={theme.textOnPrimary} />
          ) : (
            <Ionicons
              name={
                paymentStatus === "PAID" ? "arrow-undo-outline" : "cash-outline"
              }
              size={26}
              color={theme.textOnPrimary}
            />
          )}
        </TouchableOpacity>
      ) : null}
      {canClose && type === "DINE_IN" ? (
        <TouchableOpacity
          onPress={onChangeTable}
          style={[styles.outlineButton, { borderColor: theme.border }]}
          disabled={isUpdatingTable}
        >
          <Ionicons
            name="restaurant-outline"
            size={26}
            color={theme.textPrimary}
          />
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        onPress={onClose}
        style={[
          styles.button,
          {
            backgroundColor:
              status === "CLOSED"
                ? theme.textSecondary
                : status === "SCHEDULED"
                  ? "#7c6af7"
                  : theme.primary,
          },
        ]}
        disabled={pendingAction !== null}
      >
        {pendingAction === "close" ? (
          <ActivityIndicator size="small" color={theme.textOnPrimary} />
        ) : (
          <Ionicons
            name={
              status === "CLOSED"
                ? "arrow-undo-outline"
                : status === "SCHEDULED"
                  ? "play-outline"
                  : "checkmark-done-outline"
            }
            size={26}
            color={theme.textOnPrimary}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 8,
    justifyContent: "flex-end",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButton: {
    width: 42,
    height: 42,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
