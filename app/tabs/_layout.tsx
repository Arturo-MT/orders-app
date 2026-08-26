import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useUserQuery } from "@/hooks/api/users";
import { useTheme } from "@/context/ThemeContext";

export default function TabLayout() {
  const { isSuperAdmin } = useAuth();
  const { data } = useUserQuery();
  const { theme } = useTheme();
  const role = data?.[0]?.role;

  const canSeeAdmin = isSuperAdmin || role === "admin";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.textPrimary,
        tabBarInactiveTintColor: theme.textMuted,

        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.borderLight,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="pos"
        options={{
          title: "Nueva Orden",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders-list"
        options={{
          title: "Ordenes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="summary"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: "Administrar",
          href: canSeeAdmin ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Configuración",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
