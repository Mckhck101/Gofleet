import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import colors from "@/constants/colors";

export default function FavorisScreen() {
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {t("navigation.favoris")}
                </Text>
            </View>
            <View style={styles.content}>
                <View style={styles.iconWrapper}>
                    <Heart
                        size={48}
                        color={colors.primary}
                        weight="fill"
                    />
                </View>
                <Text style={styles.title}>
                    {t("navigation.favoris")}
                </Text>
                <Text style={styles.subtitle}>
                    En cours de développement...
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.white,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 40,
    },
    iconWrapper: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: colors.primaryLight,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.gray800,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: colors.gray400,
        textAlign: "center",
    },
});