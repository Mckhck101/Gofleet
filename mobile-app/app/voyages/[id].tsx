import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Bus,
    CalendarBlank,
    Clock,
    MapPin,
    Seat,
    Star,
} from "phosphor-react-native";
import colors from "@/constants/colors";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import { useVoyageDetail } from "@/hooks/useVoyages";
import { useReservationStore } from "@/store/reservationStore";
import { formatDate, formatHeure, formatPrix, labelTypeClasse } from "@/utils/format";

export default function DetailVoyageScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const voyageId = Number(id);
    const { data: voyage, isLoading, isError, refetch } = useVoyageDetail(voyageId);
    const { setVoyage } = useReservationStore();

    function reserver() {
        if (!voyage || voyage.statut !== "OUVERT") return;
        setVoyage(voyage);
        router.push("/reservation/sieges" as any);
    }

    if (isLoading) {
        return <Loader fullScreen message="Chargement du voyage..." />;
    }

    if (isError || !voyage) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <EmptyState
                    icon="warning-outline"
                    title="Voyage introuvable"
                    description="Impossible de charger le detail du voyage."
                    actionLabel="Reessayer"
                    onAction={() => refetch()}
                />
            </SafeAreaView>
        );
    }

    const prix = voyage.prixPromo ?? voyage.prixNormal;

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                    <ArrowLeft size={22} color={colors.white} weight="bold" />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={styles.title}>{`${voyage.villeDepart} -> ${voyage.villeArrivee}`}</Text>
                    <Text style={styles.subtitle}>{voyage.numeroVoyage}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.hero}>
                    <View style={styles.agenceRow}>
                        <View style={styles.busIcon}>
                            <Bus size={24} color={colors.primary} weight="fill" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.agence}>{voyage.agence?.nom ?? "Agence"}</Text>
                            <Text style={styles.classe}>{labelTypeClasse(voyage.typeClasse)}</Text>
                        </View>
                        <View style={styles.note}>
                            <Star size={14} color={colors.warning} weight="fill" />
                            <Text style={styles.noteText}>{(voyage.noteMoyenne ?? 0).toFixed(1)}</Text>
                        </View>
                    </View>

                    <View style={styles.route}>
                        <View style={styles.cityBlock}>
                            <Text style={styles.time}>{formatHeure(voyage.heureDepart)}</Text>
                            <Text style={styles.city}>{voyage.villeDepart}</Text>
                            <Text style={styles.station}>{voyage.gareDepart}</Text>
                        </View>
                        <View style={styles.lineBlock}>
                            <View style={styles.line} />
                            <Bus size={20} color={colors.primary} weight="fill" />
                            <View style={styles.line} />
                            <Text style={styles.duration}>{voyage.dureeEstimee}</Text>
                        </View>
                        <View style={styles.cityBlock}>
                            <Text style={styles.time}>{formatHeure(voyage.heureArriveeEstimee)}</Text>
                            <Text style={styles.city}>{voyage.villeArrivee}</Text>
                            <Text style={styles.station}>{voyage.gareArrivee}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoGrid}>
                    <Info icon={<CalendarBlank size={18} color={colors.primary} weight="fill" />} label="Date" value={formatDate(voyage.dateDepart)} />
                    <Info icon={<Clock size={18} color={colors.primary} weight="fill" />} label="Depart" value={formatHeure(voyage.heureDepart)} />
                    <Info icon={<Seat size={18} color={colors.primary} weight="fill" />} label="Places" value={`${voyage.placesRestantes} disponibles`} />
                    <Info icon={<MapPin size={18} color={colors.primary} weight="fill" />} label="Prix" value={formatPrix(prix, voyage.devise)} />
                </View>

                {voyage.description ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.sectionText}>{voyage.description}</Text>
                    </View>
                ) : null}

                {voyage.bagage ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Bagages</Text>
                        <Text style={styles.sectionText}>{voyage.bagage}</Text>
                    </View>
                ) : null}
            </ScrollView>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.priceLabel}>Total</Text>
                    <Text style={styles.price}>{formatPrix(prix, voyage.devise)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.reserveBtn, voyage.statut !== "OUVERT" && styles.reserveBtnDisabled]}
                    onPress={reserver}
                    disabled={voyage.statut !== "OUVERT"}
                >
                    <Text style={styles.reserveText}>
                        {voyage.statut === "OUVERT" ? "Reserver" : "Indisponible"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <View style={styles.infoItem}>
            <View style={styles.infoIcon}>{icon}</View>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: { flex: 1 },
    title: { fontSize: 18, fontWeight: "800", color: colors.white },
    subtitle: { fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 2 },
    content: { padding: 16, paddingBottom: 120 },
    hero: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    agenceRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 22 },
    busIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    agence: { fontSize: 16, fontWeight: "800", color: colors.gray900 },
    classe: { fontSize: 12, color: colors.gray500, marginTop: 2 },
    note: { flexDirection: "row", alignItems: "center", gap: 4 },
    noteText: { fontSize: 13, fontWeight: "800", color: colors.warning },
    route: { flexDirection: "row", alignItems: "center", gap: 10 },
    cityBlock: { flex: 1, alignItems: "center" },
    time: { fontSize: 22, fontWeight: "900", color: colors.gray900 },
    city: { fontSize: 14, fontWeight: "800", color: colors.gray800, marginTop: 4 },
    station: { fontSize: 11, color: colors.gray500, marginTop: 3, textAlign: "center" },
    lineBlock: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5 },
    line: { flex: 1, height: 2, backgroundColor: colors.gray200 },
    duration: {
        position: "absolute",
        bottom: -20,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 11,
        color: colors.gray500,
        fontWeight: "700",
    },
    infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
    infoItem: {
        width: "48%",
        backgroundColor: colors.white,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    infoIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    infoLabel: { fontSize: 11, color: colors.gray400, fontWeight: "700", textTransform: "uppercase" },
    infoValue: { fontSize: 14, color: colors.gray800, fontWeight: "800", marginTop: 4 },
    section: {
        backgroundColor: colors.white,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.gray200,
        marginTop: 16,
    },
    sectionTitle: { fontSize: 15, fontWeight: "800", color: colors.gray800, marginBottom: 6 },
    sectionText: { fontSize: 14, color: colors.gray600, lineHeight: 21 },
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
    },
    priceLabel: { fontSize: 12, color: colors.gray500, fontWeight: "700" },
    price: { fontSize: 18, color: colors.primary, fontWeight: "900", marginTop: 2 },
    reserveBtn: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: "center",
    },
    reserveBtnDisabled: { backgroundColor: colors.gray300 },
    reserveText: { color: colors.white, fontSize: 15, fontWeight: "800" },
});
