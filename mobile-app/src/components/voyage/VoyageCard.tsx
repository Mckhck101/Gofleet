import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import {
    Star,
    Bus,
    MapPin,
    CaretRight,
    Tag,
    Seat,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import AnimatedTrajet from "./AnimatedTrajet";
import Badge from "@/components/ui/Badge";
import colors from "@/constants/colors";
import { formatPrix, labelTypeClasse } from "@/utils/format";

interface VoyageCardProps {
    id: number;
    numeroVoyage: string;
    agenceNom: string;
    villeDepart: string;
    gareDepart: string;
    villeArrivee: string;
    gareArrivee: string;
    dateDepart: string;
    heureDepart: string;
    heureArriveeEstimee: string;
    dureeEstimee: string;
    typeClasse: string;
    placesRestantes: number;
    prixNormal: number;
    prixPromo?: number | null;
    devise: string;
    statut: string;
    noteMoyenne: number;
    couleur?: string;
    onReserver: () => void;
    onDetails: () => void;
}

export default function VoyageCard({
    id,
    numeroVoyage,
    agenceNom,
    villeDepart,
    gareDepart,
    villeArrivee,
    gareArrivee,
    dateDepart,
    heureDepart,
    heureArriveeEstimee,
    dureeEstimee,
    typeClasse,
    placesRestantes,
    prixNormal,
    prixPromo,
    devise,
    statut,
    noteMoyenne,
    couleur = colors.primary,
    onReserver,
    onDetails,
}: VoyageCardProps) {
    const { t } = useTranslation();

    function getStatutVariant(): "success" | "error" | "warning" | "gray" {
        if (statut === "OUVERT")  return "success";
        if (statut === "COMPLET") return "error";
        if (statut === "ANNULE")  return "error";
        return "gray";
    }

    function getStatutLabel(): string {
        if (statut === "OUVERT")  return t("voyage.statut_ouvert");
        if (statut === "COMPLET") return t("voyage.statut_complet");
        if (statut === "ANNULE")  return t("voyage.statut_annule");
        return t("voyage.statut_termine");
    }

    const prixAffiche = prixPromo ?? prixNormal;
    const aPromo      = prixPromo !== null && prixPromo !== undefined;

    return (
        <View style={styles.card}>
            {/* ── Bande colorée gauche ── */}
            <View
                style={[
                    styles.band,
                    { backgroundColor: couleur },
                ]}
            />

            <View style={styles.body}>

                {/* ── Header : agence + statut + note ── */}
                <View style={styles.headerRow}>
                    <View style={styles.agenceRow}>
                        <View
                            style={[
                                styles.agenceIcon,
                                {
                                    backgroundColor:
                                        couleur + "18",
                                },
                            ]}
                        >
                            <Bus
                                size={13}
                                color={couleur}
                                weight="fill"
                            />
                        </View>
                        <View>
                            <Text
                                style={[
                                    styles.agenceNom,
                                    { color: couleur },
                                ]}
                                numberOfLines={1}
                            >
                                {agenceNom}
                            </Text>
                            <Text style={styles.numeroVoyage}>
                                {numeroVoyage}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerRight}>
                        <View style={styles.noteRow}>
                            <Star
                                size={11}
                                color={colors.warning}
                                weight="fill"
                            />
                            <Text style={styles.noteText}>
                                {noteMoyenne.toFixed(1)}
                            </Text>
                        </View>
                        <Badge
                            label={getStatutLabel()}
                            variant={getStatutVariant()}
                            size="sm"
                            dot
                        />
                    </View>
                </View>

                {/* ── Trajet animé ── */}
                <View style={styles.trajetWrapper}>
                    <AnimatedTrajet
                        villeDepart={villeDepart}
                        villeArrivee={villeArrivee}
                        heureDepart={heureDepart}
                        heureArrivee={heureArriveeEstimee}
                        duree={dureeEstimee}
                        couleur={couleur}
                    />
                </View>

                {/* ── Gares ── */}
                <View style={styles.garesRow}>
                    <View style={styles.gareItem}>
                        <MapPin
                            size={11}
                            color={colors.gray400}
                        />
                        <Text
                            style={styles.gareText}
                            numberOfLines={1}
                        >
                            {gareDepart}
                        </Text>
                    </View>
                    <View style={styles.gareItem}>
                        <MapPin
                            size={11}
                            color={colors.gray400}
                        />
                        <Text
                            style={styles.gareText}
                            numberOfLines={1}
                        >
                            {gareArrivee}
                        </Text>
                    </View>
                </View>

                {/* ── Séparateur ── */}
                <View style={styles.separator} />

                {/* ── Footer : prix + places + classe + boutons ── */}
                <View style={styles.footerRow}>

                    {/* Prix */}
                    <View style={styles.prixBlock}>
                        {aPromo ? (
                            <Text style={styles.prixBarre}>
                                {formatPrix(prixNormal, devise)}
                            </Text>
                        ) : null}
                        <Text
                            style={[
                                styles.prix,
                                { color: couleur },
                            ]}
                        >
                            {formatPrix(prixAffiche, devise)}
                        </Text>
                        {aPromo ? (
                            <View style={styles.promoBadge}>
                                <Tag
                                    size={9}
                                    color={colors.success}
                                    weight="fill"
                                />
                                <Text style={styles.promoText}>
                                    Promo
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Places + Classe */}
                    <View style={styles.infoBlock}>
                        <View style={styles.placesRow}>
                            <Seat
                                size={11}
                                color={
                                    placesRestantes <= 5
                                        ? colors.error
                                        : colors.success
                                }
                            />
                            <Text
                                style={[
                                    styles.placesText,
                                    {
                                        color:
                                            placesRestantes <= 5
                                                ? colors.error
                                                : colors.gray500,
                                    },
                                ]}
                            >
                                {placesRestantes} place(s)
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.classeBadge,
                                {
                                    backgroundColor:
                                        couleur + "15",
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.classeText,
                                    { color: couleur },
                                ]}
                            >
                                {labelTypeClasse(typeClasse)}
                            </Text>
                        </View>
                    </View>

                    {/* Boutons */}
                    <View style={styles.btnsCol}>
                        <TouchableOpacity
                            onPress={onDetails}
                            style={styles.detailsBtn}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.detailsBtnText}>
                                {t("reservation.plus_details")}
                            </Text>
                            <CaretRight
                                size={11}
                                color={colors.primary}
                                weight="bold"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onReserver}
                            style={[
                                styles.reserverBtn,
                                {
                                    backgroundColor:
                                        statut !== "OUVERT"
                                            ? colors.gray300
                                            : couleur,
                                },
                            ]}
                            activeOpacity={0.85}
                            disabled={statut !== "OUVERT"}
                        >
                            <Text style={styles.reserverBtnText}>
                                {t("reservation.reserver")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: colors.white,
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },

    // ─── Bande ───────────────────────────────────
    band: { width: 5 },

    // ─── Corps ───────────────────────────────────
    body: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 8,
    },

    // ─── Header ──────────────────────────────────
    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    agenceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    agenceIcon: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    agenceNom: {
        fontSize: 13,
        fontWeight: "700",
    },
    numeroVoyage: {
        fontSize: 10,
        color: colors.gray400,
        marginTop: 1,
    },
    headerRight: {
        alignItems: "flex-end",
        gap: 4,
    },
    noteRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    noteText: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.warning,
    },

    // ─── Trajet ──────────────────────────────────
    trajetWrapper: {
        marginVertical: 4,
    },

    // ─── Gares ───────────────────────────────────
    garesRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    gareItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        flex: 1,
    },
    gareText: {
        fontSize: 10,
        color: colors.gray400,
        flex: 1,
    },

    // ─── Séparateur ──────────────────────────────
    separator: {
        height: 1,
        backgroundColor: colors.gray100,
    },

    // ─── Footer ──────────────────────────────────
    footerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },

    // Prix
    prixBlock: {
        gap: 2,
        minWidth: 80,
    },
    prixBarre: {
        fontSize: 10,
        color: colors.gray400,
        textDecorationLine: "line-through",
    },
    prix: {
        fontSize: 15,
        fontWeight: "800",
    },
    promoBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    promoText: {
        fontSize: 10,
        color: colors.success,
        fontWeight: "600",
    },

    // Places + Classe
    infoBlock: {
        gap: 5,
        alignItems: "center",
    },
    placesRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    placesText: {
        fontSize: 10,
        fontWeight: "500",
    },
    classeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    classeText: {
        fontSize: 10,
        fontWeight: "700",
    },

    // Boutons
    btnsCol: {
        gap: 6,
        alignItems: "flex-end",
    },
    detailsBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
    detailsBtnText: {
        fontSize: 10,
        fontWeight: "600",
        color: colors.primary,
    },
    reserverBtn: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    reserverBtnText: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.white,
    },
});