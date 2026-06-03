import "@/api/mock"
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/store/authStore";
import "@/i18n";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10,   // 10 minutes
        },
        mutations: {
            retry: 0,
        },
    },
});

export default function RootLayout() {
    const { chargerDepuisStorage } = useAuthStore();

    useEffect(() => {
        chargerDepuisStorage();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <StatusBar style="auto" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="agences/[id]" />   
                        <Stack.Screen name="ticket/[id]" />
                        <Stack.Screen name="voyages/[id]" />
                        <Stack.Screen name="voyages/resultats" />
                        <Stack.Screen name="reservation/sieges" />
                        <Stack.Screen name="reservation/infos" />
                        <Stack.Screen name="reservation/paiement" />
                        <Stack.Screen name="reservation/confirmation" />
                        <Stack.Screen name="reservations/[id]" />
                        <Stack.Screen name="bienvenue" />

                    </Stack>
                </QueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

