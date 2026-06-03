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
    Phone,
    EnvelopeSimple,
    ArrowRight,
    CheckCircle,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import colors from "@/constants/colors";

interface AgenceCardProps {
    id: number;
    nom: string;
    villePrincipale: string;
    noteMoyenne: number;
    nombreAvis: number;
    telephone?: string;
    email?: string;
    description?: string;
    statut?: string;
    couleur?: string;
    onVoirVoyages: () => void;
}

export default function AgenceCard({
    id,
    nom,
    villePrincipale,
    noteMoyenne,
    nombreAvis,
    telephone,
    email,
    description,
    statut,
    couleur = colors.primary,
    onVoirVoyages,
}: AgenceCardProps) {
    const { t } = useTranslation();

    const initiales = nom
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    const estVerifie = statut === "VALIDE";

    return (
        <View style={styles.card}>
            {/* ── Bande colorée ── */}
            <View
                style={[
                    styles.band,
                    { backgroundColor: couleur },
                ]}
            />

            <View style={styles.body}>

                {/* ── Header : logo + nom + badge ── */}
                <View style={styles.headerRow}>
                    {/* Logo / Avatar */}
                    <View
                        style={[
                            styles.logoCircle,
                            { backgroundColor: couleur + "18" },
                        ]}
                    >
                        <Text
                            style={[
                                styles.logoText,
                                { color: couleur },
                            ]}
                        >
                            {initiales}
                        </Text>
                    </View>

                    {/* Nom + ville */}
                    <View style={styles.nomBlock}>
                        <View style={styles.nomRow}>
                            <Text
                                style={styles.nomText}
                                numberOfLines={1}
                            >
                                {nom}
                            </Text>
                            {estVerifie ? (
                                <CheckCircle
                                    size={15}
                                    color={colors.success}
                                    weight="fill"
                                />
                            ) : null}
                        </View>
                        <View style={styles.villeRow}>
                            <MapPin
                                size={11}
                                color={colors.gray400}
                                weight="fill"
                            />
                            <Text style={styles.villeText}>
                                {villePrincipale}
                            </Text>
                        </View>
                    </View>

                    {/* Note */}
                    <View style={styles.noteBlock}>
                        <View
                            style={[
                                styles.noteCircle,
                                { backgroundColor: couleur + "15" },
                            ]}
                        >
                            <Star
                                size={12}
                                color={colors.warning}
                                weight="fill"
                            />
                            <Text
                                style={[
                                    styles.noteText,
                                    { color: couleur },
                                ]}
                            >
                                {noteMoyenne.toFixed(1)}
                            </Text>
                        </View>
                        <Text style={styles.avisText}>
                            {nombreAvis} avis
                        </Text>
                    </View>
                </View>

                {/* ── Description ── */}
                {description ? (
                    <Text
                        style={styles.description}
                        numberOfLines={2}
                    >
                        {description}
                    </Text>
                ) : null}

                {/* ── Contacts ── */}
                <View style={styles.contactsRow}>
                    {telephone ? (
                        <View style={styles.contactItem}>
                            <Phone
                                size={11}
                                color={colors.gray400}
                                weight="fill"
                            />
                            <Text style={styles.contactText}>
                                {telephone}
                            </Text>
                        </View>
                    ) : null}
                    {email ? (
                        <View style={styles.contactItem}>
                            <EnvelopeSimple
                                size={11}
                                color={colors.gray400}
                                weight="fill"
                            />
                            <Text
                                style={styles.contactText}
                                numberOfLines={1}
                            >
                                {email}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* ── Séparateur ── */}
                <View style={styles.separator} />

                {/* ── Footer : stats + bouton ── */}
                <View style={styles.footerRow}>
                    {/* Stats voyages */}
                    <View style={styles.statsRow}>
                        <View
                            style={[
                                styles.statBadge,
                                {
                                    backgroundColor:
                                        couleur + "12",
                                },
                            ]}
                        >
                            <Bus
                                size={11}
                                color={couleur}
                                weight="fill"
                            />
                            <Text
                                style={[
                                    styles.statText,
                                    { color: couleur },
                                ]}
                            >
                                Voyages disponibles
                            </Text>
                        </View>
                    </View>

                    {/* Bouton voir voyages */}
                    <TouchableOpacity
                        onPress={onVoirVoyages}
                        style={[
                            styles.voirBtn,
                            { backgroundColor: couleur },
                        ]}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.voirBtnText}>
                            {t("reservation.voir_voyages")}
                        </Text>
                        <ArrowRight
                            size={13}
                            color={colors.white}
                            weight="bold"
                        />
                    </TouchableOpacity>
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
        alignItems: "center",
        gap: 10,
    },
    logoCircle: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    logoText: {
        fontSize: 16,
        fontWeight: "800",
    },
    nomBlock: {
        flex: 1,
        gap: 3,
    },
    nomRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    nomText: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.gray900,
        flex: 1,
    },
    villeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    villeText: {
        fontSize: 11,
        color: colors.gray400,
        fontWeight: "500",
    },
    noteBlock: {
        alignItems: "center",
        gap: 3,
    },
    noteCircle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    noteText: {
        fontSize: 12,
        fontWeight: "800",
    },
    avisText: {
        fontSize: 9,
        color: colors.gray400,
        fontWeight: "500",
    },

    // ─── Description ─────────────────────────────
    description: {
        fontSize: 12,
        color: colors.gray500,
        lineHeight: 17,
    },

    // ─── Contacts ────────────────────────────────
    contactsRow: {
        flexDirection: "row",
        gap: 14,
        flexWrap: "wrap",
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    contactText: {
        fontSize: 11,
        color: colors.gray500,
        fontWeight: "500",
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
    },
    statsRow: {
        flexDirection: "row",
        gap: 6,
    },
    statBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statText: {
        fontSize: 10,
        fontWeight: "600",
    },
    voirBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 3,
    },
    voirBtnText: {
        fontSize: 12,
        fontWeight: "700",
        color: colors.white,
    },
});