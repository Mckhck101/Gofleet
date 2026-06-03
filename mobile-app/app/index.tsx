import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/authStore";
import colors from "@/constants/colors";

export default function Index() {
    const { estConnecte, chargement } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!chargement) {
            if (estConnecte) {
                router.replace("/(tabs)");
            } else {
                router.replace("/(auth)/connexion");
            }
        }
    }, [chargement, estConnecte]);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.primary,
            }}
        >
            <ActivityIndicator size="large" color={colors.white} />
        </View>
    );
}

