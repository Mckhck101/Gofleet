import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Bus,
    CrownSimple,
    Fire,
    Heart,
    MapPin,
    Medal,
    Seat,
    Sparkle,
    Star,
    TrendUp,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import colors from "@/constants/colors";
import { formatPrix } from "@/utils/format";

const TOP_DESTINATIONS = [
    {
        rang: 1,
        trajet: "Douala -> Yaounde",
        agence: "Touristique Express",
        prix: 4500,
        note: 4.8,
        raison: "Le trajet le plus reserve cette semaine",
        couleur: "#1877F2",
    },
    {
        rang: 2,
        trajet: "Yaounde -> Bafoussam",
        agence: "Express Voyages",
        prix: 6000,
        note: 4.6,
        raison: "Tres apprecie pour les departs matinaux",
        couleur: "#16A34A",
    },
    {
        rang: 3,
        trajet: "Douala -> Bafoussam",
        agence: "Confort Plus",
        prix: 7000,
        note: 4.5,
        raison: "Bon compromis confort et prix",
        couleur: "#F97316",
    },
];

const COUPS_DE_COEUR = [
    {
        titre: "Depart tot, arrivee tranquille",
        trajet: "Douala -> Yaounde",
        detail: "Ideal pour arriver avant midi et garder la journee devant soi.",
        icon: TrendUp,
    },
    {
        titre: "Confort VIP",
        trajet: "Yaounde -> Bafoussam",
        detail: "Places plus calmes, meilleur espace, pratique pour les longs trajets.",
        icon: Seat,
    },
    {
        titre: "Bon plan week-end",
        trajet: "Douala -> Bafoussam",
        detail: "Souvent choisi par les voyageurs qui partent vendredi soir.",
        icon: Sparkle,
    },
];

export default function FavorisScreen() {
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>
                        {t("navigation.favoris")}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        Inspirations et coups de coeur voyageurs
                    </Text>
                </View>
                <View style={styles.headerIcon}>
                    <Heart size={22} color={colors.white} weight="fill" />
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.featuredBand}>
                    <View style={styles.featuredIcon}>
                        <Fire size={26} color={colors.secondary} weight="fill" />
                    </View>
                    <View style={styles.featuredText}>
                        <Text style={styles.eyebrow}>Coup de coeur des utilisateurs</Text>
                        <Text style={styles.featuredTitle}>
                            {`Douala -> Yaounde reste le trajet favori du moment`}
                        </Text>
                        <Text style={styles.featuredSubtitle}>
                            Depart frequent, prix accessible, agences bien notees.
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <CrownSimple size={19} color={colors.warning} weight="fill" />
                            <Text style={styles.sectionTitle}>Top du moment</Text>
                        </View>
                        <Text style={styles.sectionHint}>Selection statique</Text>
                    </View>

                    {TOP_DESTINATIONS.map((item) => (
                        <View key={item.rang} style={styles.topItem}>
                            <View style={[styles.rankBadge, { backgroundColor: item.couleur }]}>
                                {item.rang === 1 ? (
                                    <Medal size={18} color={colors.white} weight="fill" />
                                ) : (
                                    <Text style={styles.rankText}>{item.rang}</Text>
                                )}
                            </View>
                            <View style={styles.topBody}>
                                <View style={styles.topLine}>
                                    <Text style={styles.trajet}>{item.trajet}</Text>
                                    <View style={styles.notePill}>
                                        <Star size={12} color={colors.warning} weight="fill" />
                                        <Text style={styles.noteText}>{item.note.toFixed(1)}</Text>
                                    </View>
                                </View>
                                <View style={styles.metaRow}>
                                    <Bus size={13} color={colors.gray400} weight="fill" />
                                    <Text style={styles.metaText}>{item.agence}</Text>
                                    <Text style={styles.dot}>.</Text>
                                    <Text style={styles.priceText}>des {formatPrix(item.prix)}</Text>
                                </View>
                                <Text style={styles.reason}>{item.raison}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Heart size={19} color={colors.primary} weight="fill" />
                            <Text style={styles.sectionTitle}>Vos coups de coeur</Text>
                        </View>
                    </View>

                    <View style={styles.emptyFavorites}>
                        <View style={styles.emptyIcon}>
                            <Heart size={34} color={colors.primary} weight="fill" />
                        </View>
                        <Text style={styles.emptyTitle}>Pas encore de favoris</Text>
                        <Text style={styles.emptyText}>
                            Les voyages que vous aimerez apparaitront ici quand la sauvegarde des favoris sera active.
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Sparkle size={19} color={colors.secondary} weight="fill" />
                            <Text style={styles.sectionTitle}>Idees a surveiller</Text>
                        </View>
                    </View>

                    <View style={styles.suggestionGrid}>
                        {COUPS_DE_COEUR.map((item) => {
                            const Icon = item.icon;
                            return (
                                <View key={item.titre} style={styles.suggestion}>
                                    <View style={styles.suggestionIcon}>
                                        <Icon size={20} color={colors.primary} weight="fill" />
                                    </View>
                                    <Text style={styles.suggestionTitle}>{item.titre}</Text>
                                    <View style={styles.suggestionRoute}>
                                        <MapPin size={12} color={colors.gray400} weight="fill" />
                                        <Text style={styles.suggestionTrajet}>{item.trajet}</Text>
                                    </View>
                                    <Text style={styles.suggestionText}>{item.detail}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.white,
    },
    headerSubtitle: {
        fontSize: 12,
        color: "rgba(255,255,255,0.78)",
        marginTop: 3,
        fontWeight: "500",
    },
    headerIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    scroll: { flex: 1 },
    content: {
        padding: 16,
        paddingBottom: 120,
        gap: 18,
    },
    featuredBand: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gray200,
        padding: 16,
        flexDirection: "row",
        gap: 14,
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    featuredIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: "#FFF7ED",
        alignItems: "center",
        justifyContent: "center",
    },
    featuredText: { flex: 1 },
    eyebrow: {
        fontSize: 11,
        color: colors.secondary,
        fontWeight: "800",
        textTransform: "uppercase",
        marginBottom: 4,
    },
    featuredTitle: {
        fontSize: 17,
        color: colors.gray900,
        fontWeight: "900",
        lineHeight: 22,
    },
    featuredSubtitle: {
        fontSize: 13,
        color: colors.gray500,
        lineHeight: 19,
        marginTop: 6,
    },
    section: { gap: 12 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.gray800,
    },
    sectionHint: {
        fontSize: 11,
        color: colors.gray400,
        fontWeight: "700",
    },
    topItem: {
        backgroundColor: colors.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.gray200,
        padding: 12,
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    rankBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    rankText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: "900",
    },
    topBody: { flex: 1, gap: 5 },
    topLine: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    trajet: {
        flex: 1,
        fontSize: 15,
        color: colors.gray900,
        fontWeight: "800",
    },
    notePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    noteText: {
        fontSize: 12,
        color: colors.warning,
        fontWeight: "800",
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    metaText: {
        fontSize: 12,
        color: colors.gray500,
        fontWeight: "600",
    },
    dot: {
        fontSize: 13,
        color: colors.gray400,
        fontWeight: "900",
    },
    priceText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: "800",
    },
    reason: {
        fontSize: 12,
        color: colors.gray400,
        lineHeight: 17,
    },
    emptyFavorites: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gray200,
        padding: 24,
        alignItems: "center",
        gap: 10,
    },
    emptyIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: colors.gray800,
    },
    emptyText: {
        fontSize: 13,
        color: colors.gray500,
        textAlign: "center",
        lineHeight: 20,
    },
    suggestionGrid: { gap: 10 },
    suggestion: {
        backgroundColor: colors.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.gray200,
        padding: 14,
        gap: 7,
    },
    suggestionIcon: {
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    suggestionTitle: {
        fontSize: 15,
        color: colors.gray900,
        fontWeight: "800",
    },
    suggestionRoute: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    suggestionTrajet: {
        fontSize: 12,
        color: colors.gray500,
        fontWeight: "700",
    },
    suggestionText: {
        fontSize: 12,
        color: colors.gray500,
        lineHeight: 18,
    },
});
