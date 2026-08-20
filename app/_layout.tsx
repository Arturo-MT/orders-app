import { Slot } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { FetchProvider } from "@/context/FetchContext";
import { StoreProvider } from "@/context/StoreContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AuthProvider>
                <StoreProvider>
                  <FetchProvider>
                    <ToastProvider>
                      <SafeAreaView style={{ flex: 1 }}>
                        <Slot />
                      </SafeAreaView>
                    </ToastProvider>
                  </FetchProvider>
                </StoreProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
