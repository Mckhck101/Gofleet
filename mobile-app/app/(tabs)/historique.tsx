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
    CalendarBlank,
    CheckCircle,
    ClockCounterClockwise,
    MapPin,
    Receipt,
    Star,
    Ticket,
    TrendUp,
    XCircle,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import colors from "@/constants/colors";
import { formatPrix } from "@/utils/format";

const HISTORIQUE = [
    {
        id: "H-001",
        trajet: "Douala -> Yaounde",
        agence: "Touristique Express",
        date: "10 juin 2026",
        heure: "08:00",
        siege: "S12",
        montant: 5000,
        statut: "Termine",
        type: "success",
    },
    {
        id: "H-002",
        trajet: "Yaounde -> Ngaoundere",
        agence: "Camrail Voyage",
        date: "18 mai 2026",
        heure: "18:30",
        siege: "B04",
        montant: 12000,
        statut: "Termine",
        type: "success",
    },
    {
        id: "H-003",
        trajet: "Douala -> Garoua",
        agence: "Gofleet Air",
        date: "03 mai 2026",
        heure: "10:15",
        siege: "A07",
        montant: 85000,
        statut: "Annule",
        type: "danger",
    },
];

const STATS = [
    { label: "Voyages", value: "12", icon: Bus },
    { label: "Depense", value: "142k", icon: Receipt },
    { label: "Trajet favori", value: "DLA", icon: TrendUp },
];

export default function HistoriqueScreen() {
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>
                        {t("navigation.historique")}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        Vos anciens trajets et activite recente
                    </Text>
                </View>
                <View style={styles.headerIcon}>
                    <ClockCounterClockwise size={23} color={colors.white} weight="fill" />
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.summary}>
                    {STATS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <View key={item.label} style={styles.statCard}>
                                <View style={styles.statIcon}>
                                    <Icon size={18} color={colors.primary} weight="fill" />
                                </View>
                                <Text style={styles.statValue}>{item.value}</Text>
                                <Text style={styles.statLabel}>{item.label}</Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Ticket size={19} color={colors.primary} weight="fill" />
                        <Text style={styles.sectionTitle}>Derniers voyages</Text>
                    </View>

                    {HISTORIQUE.map((item) => (
                        <View key={item.id} style={styles.historyCard}>
                            <View style={styles.cardTop}>
                                <View style={styles.routeIcon}>
                                    <Bus size={20} color={colors.primary} weight="fill" />
                                </View>
                                <View style={styles.routeText}>
                                    <Text style={styles.trajet}>{item.trajet}</Text>
                                    <Text style={styles.agence}>{item.agence}</Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        item.type === "success"
                                            ? styles.statusSuccess
                                            : styles.statusDanger,
                                    ]}
                                >
                                    {item.type === "success" ? (
                                        <CheckCircle size={13} color={colors.success} weight="fill" />
                                    ) : (
                                        <XCircle size={13} color={colors.error} weight="fill" />
                                    )}
                                    <Text
                                        style={[
                                            styles.statusText,
                                            item.type === "success"
                                                ? { color: colors.success }
                                                : { color: colors.error },
                                        ]}
                                    >
                                        {item.statut}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailGrid}>
                                <Info icon={<CalendarBlank size={14} color={colors.gray400} weight="fill" />} label="Date" value={item.date} />
                                <Info icon={<ClockCounterClockwise size={14} color={colors.gray400} weight="fill" />} label="Heure" value={item.heure} />
                                <Info icon={<MapPin size={14} color={colors.gray400} weight="fill" />} label="Siege" value={item.siege} />
                                <Info icon={<Receipt size={14} color={colors.gray400} weight="fill" />} label="Montant" value={formatPrix(item.montant)} />
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Star size={19} color={colors.warning} weight="fill" />
                        <Text style={styles.sectionTitle}>Resume statique</Text>
                    </View>
                    <View style={styles.noteCard}>
                        <Text style={styles.noteTitle}>Vous voyagez surtout en journee</Text>
                        <Text style={styles.noteText}>
                            Les trajets du matin semblent les plus pratiques pour vos deplacements.
                            Cette zone est statique pour la V1 et pourra devenir intelligente plus tard.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <View style={styles.infoItem}>
            {icon}
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
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
    summary: {
        flexDirection: "row",
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.gray200,
        alignItems: "center",
        gap: 5,
    },
    statIcon: {
        width: 34,
        height: 34,
        borderRadius: 11,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    statValue: {
        fontSize: 17,
        fontWeight: "900",
        color: colors.gray900,
    },
    statLabel: {
        fontSize: 10,
        color: colors.gray500,
        fontWeight: "700",
        textAlign: "center",
    },
    section: { gap: 12 },
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
    historyCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gray200,
        padding: 14,
        gap: 14,
    },
    cardTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    routeIcon: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    routeText: { flex: 1 },
    trajet: {
        fontSize: 15,
        fontWeight: "800",
        color: colors.gray900,
    },
    agence: {
        fontSize: 12,
        color: colors.gray500,
        marginTop: 2,
        fontWeight: "600",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusSuccess: {
        backgroundColor: colors.successLight,
    },
    statusDanger: {
        backgroundColor: colors.errorLight,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "800",
    },
    detailGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    infoItem: {
        width: "48%",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.gray50,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 9,
    },
    infoLabel: {
        fontSize: 10,
        color: colors.gray400,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    infoValue: {
        fontSize: 12,
        color: colors.gray800,
        fontWeight: "800",
        marginTop: 1,
    },
    noteCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gray200,
        padding: 16,
    },
    noteTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: colors.gray900,
        marginBottom: 6,
    },
    noteText: {
        fontSize: 13,
        color: colors.gray500,
        lineHeight: 20,
    },
});
