import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    StatusBar,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    CreditCard,
    DeviceMobile,
    Lock,
    ShieldCheck,
    Warning,
    Bus,
    MapPin,
    Armchair,
} from "phosphor-react-native";
import { useReservationStore } from "@/store/reservationStore";
import colors from "@/constants/colors";
import { formatPrix, labelMethodePaiement } from "@/utils/format";
import { MethodePaiement } from "@/types/paiement";

// ─── Config méthodes de paiement ─────────────────────────────
interface MethodeConfig {
    key: MethodePaiement;
    labelKey: string;
    couleur: string;
    logo: string;
    needsPhone: boolean;
    placeholder: string;
}

const METHODES: MethodeConfig[] = [
    {
        key: "ORANGE_MONEY",
        labelKey: "paiement.orange_money",
        couleur: "#FF6600",
        logo: "OM",
        needsPhone: true,
        placeholder: "+237 69X XXX XXX",
    },
    {
        key: "MTN_MOMO",
        labelKey: "paiement.mtn_momo",
        couleur: "#FFCC00",
        logo: "MTN",
        needsPhone: true,
        placeholder: "+237 67X XXX XXX",
    },
    {
        key: "CARTE_BANCAIRE",
        labelKey: "paiement.carte_bancaire",
        couleur: "#1877F2",
        logo: "CB",
        needsPhone: false,
        placeholder: "",
    },
    {
        key: "PAYPAL",
        labelKey: "paiement.paypal",
        couleur: "#003087",
        logo: "PP",
        needsPhone: false,
        placeholder: "",
    },
];

// ─── Composant carte méthode ──────────────────────────────────
function MethodeCard({
    methode,
    selectionnee,
    onSelect,
}: {
    methode: MethodeConfig;
    selectionnee: boolean;
    onSelect: () => void;
}) {
    const { t } = useTranslation();
    const scale = useRef(new Animated.Value(1)).current;

    function handlePress() {
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.96,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                tension: 200,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();
        onSelect();
    }

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                onPress={handlePress}
                style={[
                    styles.methodeCard,
                    selectionnee && {
                        borderColor: methode.couleur,
                        backgroundColor: methode.couleur + "08",
                        shadowColor: methode.couleur,
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 4,
                    },
                ]}
                activeOpacity={0.85}
            >
                {/* Logo */}
                <View
                    style={[
                        styles.methodeLogo,
                        { backgroundColor: methode.couleur + "18" },
                    ]}
                >
                    <Text
                        style={[
                            styles.methodeLogoText,
                            { color: methode.couleur },
                        ]}
                    >
                        {methode.logo}
                    </Text>
                </View>

                {/* Label */}
                <Text
                    style={[
                        styles.methodeLabel,
                        selectionnee && {
                            color: methode.couleur,
                        },
                    ]}
                >
                    {t(methode.labelKey)}
                </Text>

                {/* Check */}
                {selectionnee ? (
                    <CheckCircle
                        size={20}
                        color={methode.couleur}
                        weight="fill"
                    />
                ) : (
                    <View style={styles.methodeRadio} />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Écran principal ──────────────────────────────────────────
export default function PaiementScreen() {
    const router = useRouter();
    const { t }  = useTranslation();
    const {
        voyageSelectionne,
        siegeSelectionne,
        infosVoyageur,
        methodePaiement,
        setMethodePaiement,
        setPaiementId,
        setReservationId,
    } = useReservationStore();

    const [methodeSelectionnee, setMethodeSelectionnee] =
        useState<MethodePaiement | null>(
            methodePaiement ?? "ORANGE_MONEY"
        );
    const [numeroPaiement, setNumeroPaiement] = useState("");
    const [erreurNumero, setErreurNumero]     = useState("");
    const [loading, setLoading]               = useState(false);

    // Animations
    const headerY   = useRef(new Animated.Value(-30)).current;
    const headerOp  = useRef(new Animated.Value(0)).current;
    const contentY  = useRef(new Animated.Value(40)).current;
    const contentOp = useRef(new Animated.Value(0)).current;
    const btnPulse  = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(headerY, {
                toValue: 0,
                tension: 60,
                friction: 9,
                useNativeDriver: true,
            }),
            Animated.timing(headerOp, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(contentY, {
                toValue: 0,
                tension: 55,
                friction: 9,
                delay: 150,
                useNativeDriver: true,
            }),
            Animated.timing(contentOp, {
                toValue: 1,
                duration: 400,
                delay: 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Pulse bouton payer
    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(btnPulse, {
                    toValue: 1.02,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(btnPulse, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    // Données voyage
    const voyage = voyageSelectionne ?? ({
        villeDepart: "Douala",
        villeArrivee: "Yaoundé",
        heureDepart: "06:00",
        heureArriveeEstimee: "10:00",
        dureeEstimee: "4h00",
        dateDepart: "2026-06-10",
        typeClasse: "VIP",
        prixNormal: 5000,
        prixPromo: 4500,
        devise: "FCFA",
        agence: { nom: "Touristique Express" } as any,
    } as any);

    const siege  = siegeSelectionne ?? { numeroSiege: "A3" };
    const prix   = (voyage as any).prixPromo ??
                   (voyage as any).prixNormal;
    const devise = (voyage as any).devise ?? "FCFA";

    const methodeConfig = METHODES.find(
        (m) => m.key === methodeSelectionnee
    );
    const needsPhone = methodeConfig?.needsPhone ?? false;

    function valider(): boolean {
        if (!methodeSelectionnee) return false;
        if (needsPhone && !numeroPaiement.trim()) {
            setErreurNumero(t("common.obligatoire"));
            return false;
        }
        setErreurNumero("");
        return true;
    }

    // TODO: Remplacer par →
    // const { mutate: initierPaiement } = useInitierPaiement();
    // initierPaiement({ reservationId, methode, numeroPaiement })
    async function handlePayer() {
        if (!valider()) return;
        setLoading(true);

        // Simulation appel API
        // En production :
        // 1. creerReservation(infosVoyageur) → reservationId
        // 2. initierPaiement({ reservationId, methode, numero })
        // 3. confirmerPaiement({ referenceTransaction, statut })
        setTimeout(() => {
            setLoading(false);
            setMethodePaiement(methodeSelectionnee!);
            setReservationId(12345);
            setPaiementId(67890);
            router.push("/reservation/confirmation" as any);
        }, 2500);
    }

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={colors.primary}
            />

            {/* ── Header ── */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        transform: [{ translateY: headerY }],
                        opacity: headerOp,
                    },
                ]}
            >
                <SafeAreaView edges={["top"]}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backBtn}
                            activeOpacity={0.8}
                        >
                            <ArrowLeft
                                size={20}
                                color={colors.white}
                                weight="bold"
                            />
                        </TouchableOpacity>
                        <Text style={styles.headerTitre}>
                            {t("paiement.titre")}
                        </Text>
                        <View style={styles.etapeBadge}>
                            <Text style={styles.etapeText}>
                                {t("reservation.etape")} 7/8
                            </Text>
                        </View>
                    </View>

                    {/* Résumé commande */}
                    <View style={styles.resumeCard}>
                        <View style={styles.resumeRow}>
                            <View style={styles.resumeItem}>
                                <Bus
                                    size={14}
                                    color="rgba(255,255,255,0.7)"
                                    weight="fill"
                                />
                                <Text style={styles.resumeLabel}>
                                    {(voyage as any).agence?.nom ??
                                        "Agence"}
                                </Text>
                            </View>
                            <View style={styles.resumeItem}>
                                <MapPin
                                    size={14}
                                    color="rgba(255,255,255,0.7)"
                                    weight="fill"
                                />
                                <Text style={styles.resumeLabel}>
                                    {(voyage as any).villeDepart}{" "}
                                    →{" "}
                                    {(voyage as any).villeArrivee}
                                </Text>
                            </View>
                            <View style={styles.resumeItem}>
                                <Armchair
                                    size={14}
                                    color="rgba(255,255,255,0.7)"
                                    weight="fill"
                                />
                                <Text style={styles.resumeLabel}>
                                    Siège {siege.numeroSiege}
                                </Text>
                            </View>
                        </View>

                        {/* Prix total */}
                        <View style={styles.prixTotalRow}>
                            <Text style={styles.prixTotalLabel}>
                                {t("paiement.montant_a_payer")}
                            </Text>
                            <Text style={styles.prixTotalValue}>
                                {formatPrix(prix, devise)}
                            </Text>
                        </View>
                    </View>
                </SafeAreaView>
            </Animated.View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={{
                        opacity: contentOp,
                        transform: [{ translateY: contentY }],
                        gap: 16,
                    }}
                >
                    {/* ── Choix méthode ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitre}>
                            {t("paiement.choisir_methode")}
                        </Text>
                        {METHODES.map((m) => (
                            <MethodeCard
                                key={m.key}
                                methode={m}
                                selectionnee={
                                    methodeSelectionnee === m.key
                                }
                                onSelect={() => {
                                    setMethodeSelectionnee(m.key);
                                    setErreurNumero("");
                                    setNumeroPaiement("");
                                }}
                            />
                        ))}
                    </View>

                    {/* ── Numéro Mobile Money ── */}
                    {needsPhone ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitre}>
                                {t("paiement.numero_paiement")}
                            </Text>

                            <View
                                style={[
                                    styles.phoneInput,
                                    erreurNumero
                                        ? styles.phoneInputError
                                        : null,
                                    numeroPaiement
                                        ? {
                                              borderColor:
                                                  methodeConfig?.couleur,
                                          }
                                        : null,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.phonePrefix,
                                        {
                                            backgroundColor:
                                                methodeConfig?.couleur +
                                                "18",
                                        },
                                    ]}
                                >
                                    <DeviceMobile
                                        size={18}
                                        color={
                                            methodeConfig?.couleur
                                        }
                                        weight="fill"
                                    />
                                </View>
                                <TextInput
                                    style={styles.phoneTextInput}
                                    value={numeroPaiement}
                                    onChangeText={(v) => {
                                        setNumeroPaiement(v);
                                        setErreurNumero("");
                                    }}
                                    placeholder={
                                        methodeConfig?.placeholder
                                    }
                                    placeholderTextColor={
                                        colors.gray400
                                    }
                                    keyboardType="phone-pad"
                                />
                            </View>

                            {erreurNumero ? (
                                <View style={styles.erreurRow}>
                                    <Warning
                                        size={12}
                                        color={colors.error}
                                    />
                                    <Text style={styles.erreurText}>
                                        {erreurNumero}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Instructions */}
                            <View
                                style={[
                                    styles.instructionsBox,
                                    {
                                        backgroundColor:
                                            methodeConfig?.couleur +
                                            "0D",
                                        borderColor:
                                            methodeConfig?.couleur +
                                            "30",
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.instructionsTitre,
                                        {
                                            color:
                                                methodeConfig?.couleur,
                                        },
                                    ]}
                                >
                                    {t("paiement.instructions")}
                                </Text>
                                <Text
                                    style={styles.instructionsTexte}
                                >
                                    {methodeSelectionnee ===
                                    "ORANGE_MONEY"
                                        ? "Vous recevrez un message de confirmation Orange Money. Validez le paiement avec votre code PIN."
                                        : "Vous recevrez une notification MTN MoMo. Approuvez le paiement dans votre application."}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    {/* ── Récap paiement ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitre}>
                            {t("reservation.recap")}
                        </Text>

                        {[
                            {
                                label: "Voyage",
                                value: `${(voyage as any).villeDepart} → ${(voyage as any).villeArrivee}`,
                            },
                            {
                                label: "Date",
                                value:
                                    (voyage as any).dateDepart,
                            },
                            {
                                label: "Heure",
                                value:
                                    (voyage as any).heureDepart,
                            },
                            {
                                label: "Siège",
                                value: siege.numeroSiege,
                            },
                            {
                                label: "Voyageur",
                                value:
                                    (infosVoyageur as any)
                                        ?.nomComplet ?? "—",
                            },
                            {
                                label: "Méthode",
                                value: methodeSelectionnee
                                    ? labelMethodePaiement(
                                          methodeSelectionnee
                                      )
                                    : "—",
                            },
                        ].map((item, i) => (
                            <View
                                key={i}
                                style={styles.recapRow}
                            >
                                <Text style={styles.recapLabel}>
                                    {item.label}
                                </Text>
                                <Text style={styles.recapValue}>
                                    {item.value}
                                </Text>
                            </View>
                        ))}

                        <View style={styles.recapSeparator} />

                        <View style={styles.recapTotalRow}>
                            <Text style={styles.recapTotalLabel}>
                                Total
                            </Text>
                            <Text style={styles.recapTotalValue}>
                                {formatPrix(prix, devise)}
                            </Text>
                        </View>
                    </View>

                    {/* ── Sécurité ── */}
                    <View style={styles.securiteRow}>
                        <ShieldCheck
                            size={16}
                            color={colors.success}
                            weight="fill"
                        />
                        <Text style={styles.securiteText}>
                            Paiement sécurisé — Vos données sont
                            protégées
                        </Text>
                        <Lock
                            size={14}
                            color={colors.success}
                            weight="fill"
                        />
                    </View>
                </Animated.View>
            </ScrollView>

            {/* ── Bouton payer ── */}
            <View style={styles.btnContainer}>
                <Animated.View
                    style={{
                        transform: [{ scale: btnPulse }],
                    }}
                >
                    <TouchableOpacity
                        onPress={handlePayer}
                        style={[
                            styles.payerBtn,
                            {
                                backgroundColor:
                                    methodeConfig?.couleur ??
                                    colors.primary,
                            },
                            loading && styles.payerBtnLoading,
                        ]}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        {loading ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator
                                    size="small"
                                    color={colors.white}
                                />
                                <Text style={styles.payerBtnText}>
                                    Traitement en cours...
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.payerBtnContent}>
                                <Lock
                                    size={18}
                                    color={colors.white}
                                    weight="fill"
                                />
                                <Text style={styles.payerBtnText}>
                                    {t("paiement.initier")} —{" "}
                                    {formatPrix(prix, devise)}
                                </Text>
                                <ArrowRight
                                    size={18}
                                    color={colors.white}
                                    weight="bold"
                                />
                            </View>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // ─── Header ──────────────────────────────────
    header: {
        backgroundColor: colors.primary,
        paddingBottom: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 14,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitre: {
        fontSize: 17,
        fontWeight: "800",
        color: colors.white,
    },
    etapeBadge: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    etapeText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.white,
    },

    // ─── Résumé header ────────────────────────────
    resumeCard: {
        marginHorizontal: 18,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 14,
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    resumeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
    },
    resumeItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    resumeLabel: {
        fontSize: 12,
        color: "rgba(255,255,255,0.85)",
        fontWeight: "500",
    },
    prixTotalRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.2)",
    },
    prixTotalLabel: {
        fontSize: 13,
        color: "rgba(255,255,255,0.8)",
        fontWeight: "600",
    },
    prixTotalValue: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.white,
    },

    // ─── Scroll ───────────────────────────────────
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 110,
    },

    // ─── Section ──────────────────────────────────
    section: {
        backgroundColor: colors.white,
        borderRadius: 18,
        padding: 16,
        gap: 10,
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitre: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.gray700,
        marginBottom: 4,
    },

    // ─── Méthode ─────────────────────────────────
    methodeCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        backgroundColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    methodeLogo: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    methodeLogoText: {
        fontSize: 13,
        fontWeight: "800",
    },
    methodeLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: colors.gray700,
    },
    methodeRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.gray300,
    },

    // ─── Téléphone ────────────────────────────────
    phoneInput: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        overflow: "hidden",
        minHeight: 52,
    },
    phoneInputError: {
        borderColor: colors.error,
        backgroundColor: colors.errorLight,
    },
    phonePrefix: {
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRightWidth: 1,
        borderRightColor: colors.gray100,
    },
    phoneTextInput: {
        flex: 1,
        fontSize: 15,
        color: colors.gray900,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    erreurRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    erreurText: {
        fontSize: 11,
        color: colors.error,
        fontWeight: "500",
    },

    // ─── Instructions ─────────────────────────────
    instructionsBox: {
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        gap: 6,
    },
    instructionsTitre: {
        fontSize: 12,
        fontWeight: "700",
    },
    instructionsTexte: {
        fontSize: 12,
        color: colors.gray500,
        lineHeight: 18,
    },

    // ─── Récap ────────────────────────────────────
    recapRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },
    recapLabel: {
        fontSize: 12,
        color: colors.gray500,
        fontWeight: "500",
    },
    recapValue: {
        fontSize: 13,
        color: colors.gray800,
        fontWeight: "600",
    },
    recapSeparator: {
        height: 1,
        backgroundColor: colors.gray100,
        marginVertical: 4,
    },
    recapTotalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    recapTotalLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.gray800,
    },
    recapTotalValue: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.primary,
    },

    // ─── Sécurité ─────────────────────────────────
    securiteRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 8,
    },
    securiteText: {
        fontSize: 12,
        color: colors.gray400,
        fontWeight: "500",
    },

    // ─── Bouton payer ─────────────────────────────
    btnContainer: {
        position: "absolute",
        bottom: 24,
        left: 16,
        right: 16,
    },
    payerBtn: {
        borderRadius: 16,
        paddingVertical: 16,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    payerBtnLoading: {
        opacity: 0.8,
    },
    payerBtnContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    payerBtnText: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.white,
        letterSpacing: 0.3,
    },
});