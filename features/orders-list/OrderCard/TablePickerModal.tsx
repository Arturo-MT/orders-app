import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Theme } from "@/constants/Colors";
import { DiningTable } from "./types";

interface Props {
  visible: boolean;
  tables: DiningTable[] | undefined;
  selectedTableId: string | null;
  theme: Theme;
  onClose: () => void;
  onSelect: (tableId: string) => void;
}

export function TablePickerModal({
  visible,
  tables,
  selectedTableId,
  theme,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.content, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Cambiar mesa
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.list}>
            {tables?.map((table) => {
              const isSelected = table.id === selectedTableId;
              return (
                <TouchableOpacity
                  key={table.id}
                  style={[
                    styles.item,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                    styles.unavailable,
                  ]}
                  onPress={() => onSelect(table.id)}
                >
                  <Ionicons
                    name="restaurant-outline"
                    size={20}
                    color={
                      isSelected ? theme.textOnPrimary : theme.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.itemText,
                      {
                        color: isSelected
                          ? theme.textOnPrimary
                          : theme.textPrimary,
                      },
                    ]}
                  >
                    {table.name}
                  </Text>
                  {isSelected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={theme.textOnPrimary}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  content: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: "bold" },
  list: { padding: 12, gap: 8 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  itemText: { flex: 1, fontSize: 15, fontWeight: "600" },
  occupied: { fontSize: 11, fontStyle: "italic" },
  unavailable: { opacity: 0.5 },
});
