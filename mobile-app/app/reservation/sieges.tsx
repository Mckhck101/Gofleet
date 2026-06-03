import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    StatusBar,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    Bus,
    Armchair,
    CheckCircle,
    ArrowRight,
    Info,
} from "phosphor-react-native";
import { useReservationStore } from "@/store/reservationStore";
import { useSiegesVoyage } from "@/hooks/useVoyages";
import AnimatedTrajet from "@/components/voyage/AnimatedTrajet";
import colors from "@/constants/colors";
import { formatPrix, labelTypeClasse } from "@/utils/format";

const { width: W } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────
type StatutSiege = "DISPONIBLE" | "RESERVE" | "OCCUPE" | "SELECTIONNE";

interface Siege {
    id: number;
    numeroSiege: string;
    statut: StatutSiege;
    rangee: number;
    colonne: number;
}

// ─── Génération du plan des sièges ────────────────────────────
// TODO: Remplacer par → voyagesApi.getSieges(voyageId)
function genererSieges(capacite: number): Siege[] {
    const sieges: Siege[] = [];
    const lettres = ["A", "B", "C", "D"];
    const nbRangees = Math.ceil(capacite / 4);

    // Quelques sièges déjà réservés (simulation)
    const reserves = [2, 5, 8, 11, 15, 18, 22, 25];
    const occupes  = [3, 7, 12, 16, 20];

    let id = 1;
    for (let rangee = 1; rangee <= nbRangees; rangee++) {
        for (let col = 0; col < 4; col++) {
            if (id > capacite) break;
            const numero = `${lettres[col]}${rangee}`;
            let statut: StatutSiege = "DISPONIBLE";
            if (reserves.includes(id)) statut = "RESERVE";
            if (occupes.includes(id))  statut = "OCCUPE";
            sieges.push({
                id,
                numeroSiege: numero,
                statut,
                rangee,
                colonne: col,
            });
            id++;
        }
    }
    return sieges;
}

// ─── Composant siège individuel ───────────────────────────────
function SiegeItem({
    siege,
    selectionne,
    onPress,
    couleur,
}: {
    siege: Siege;
    selectionne: boolean;
    onPress: () => void;
    couleur: string;
}) {
    const scale = useRef(new Animated.Value(1)).current;

    function handlePress() {
        if (siege.statut !== "DISPONIBLE") return;
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.85,
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
        onPress();
    }

    function getBgColor(): string {
        if (selectionne)              return couleur;
        if (siege.statut === "RESERVE") return colors.gray200;
        if (siege.statut === "OCCUPE")  return colors.gray300;
        return colors.white;
    }

    function getBorderColor(): string {
        if (selectionne)              return couleur;
        if (siege.statut === "RESERVE") return colors.gray300;
        if (siege.statut === "OCCUPE")  return colors.gray400;
        return colors.gray200;
    }

    function getTextColor(): string {
        if (selectionne)              return colors.white;
        if (siege.statut === "RESERVE") return colors.gray400;
        if (siege.statut === "OCCUPE")  return colors.gray500;
        return colors.gray700;
    }

    const disabled =
        siege.statut === "RESERVE" ||
        siege.statut === "OCCUPE";

    return (
        <Animated.View
            style={{ transform: [{ scale }] }}
        >
            <TouchableOpacity
                onPress={handlePress}
                disabled={disabled}
                activeOpacity={0.8}
                style={[
                    styles.siege,
                    {
                        backgroundColor: getBgColor(),
                        borderColor: getBorderColor(),
                    },
                    selectionne && {
                        shadowColor: couleur,
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.4,
                        shadowRadius: 6,
                        elevation: 5,
                    },
                ]}
            >
                {selectionne ? (
                    <CheckCircle
                        size={14}
                        color={colors.white}
                        weight="fill"
                    />
                ) : (
                    <Armchair
                        size={14}
                        color={getTextColor()}
                        weight={
                            siege.statut === "DISPONIBLE"
                                ? "regular"
                                : "fill"
                        }
                    />
                )}
                <Text
                    style={[
                        styles.siegeNum,
                        { color: getTextColor() },
                    ]}
                >
                    {siege.numeroSiege}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Écran principal ──────────────────────────────────────────
export default function SiegesScreen() {
    const router  = useRouter();
    const { t }   = useTranslation();
    const {
        voyageSelectionne,
        siegeSelectionne,
        setSiege,
    } = useReservationStore();

    const [siegeIdSelectionne, setSiegeIdSelectionne] =
        useState<number | null>(
            siegeSelectionne?.id ?? null
        );

    // Animations
    const headerY  = useRef(new Animated.Value(-30)).current;
    const headerOp = useRef(new Animated.Value(0)).current;
    const planY    = useRef(new Animated.Value(50)).current;
    const planOp   = useRef(new Animated.Value(0)).current;
    const btnScale = useRef(new Animated.Value(0)).current;

    // Données mock voyage
    // TODO: utiliser voyageSelectionne depuis le store
    const voyage = voyageSelectionne ?? {
        id: 1,
        numeroVoyage: "VY-2026-001",
        agence: {
            nom: "Touristique Express",
            noteMoyenne: 4.8,
        } as any,
        villeDepart: "Douala",
        gareDepart: "Gare Bonabéri",
        villeArrivee: "Yaoundé",
        gareArrivee: "Gare Centrale",
        dateDepart: "2026-06-10",
        heureDepart: "06:00",
        heureArriveeEstimee: "10:00",
        dureeEstimee: "4h00",
        typeClasse: "VIP",
        placesRestantes: 8,
        prixNormal: 5000,
        prixPromo: 4500,
        devise: "FCFA",
        statut: "OUVERT",
        noteMoyenne: 4.8,
        vehicule: {
            capacite: 32,
            marque: "Mercedes-Benz",
            immatriculation: "LT-1234-A",
        } as any,
        bagage: "23kg max",
        description: null,
    };

    const capacite =
        (voyage as any).vehicule?.capacite ?? 32;
    const { data: siegesApi } = useSiegesVoyage(voyage.id);
    const sourceSieges =
        siegesApi && siegesApi.length > 0
            ? siegesApi
            : genererSieges(capacite);
    const sieges = sourceSieges.map((siege, index) => ({
        ...siege,
        rangee: Math.floor(index / 4) + 1,
        colonne: index % 4,
    })) as Siege[];
    const couleur  = colors.primary;

    const nbDisponibles = sieges.filter(
        (s) => s.statut === "DISPONIBLE"
    ).length;

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
            Animated.spring(planY, {
                toValue: 0,
                tension: 55,
                friction: 9,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.timing(planOp, {
                toValue: 1,
                duration: 400,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Apparition bouton continuer
    useEffect(() => {
        if (siegeIdSelectionne) {
            Animated.spring(btnScale, {
                toValue: 1,
                tension: 80,
                friction: 7,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(btnScale, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [siegeIdSelectionne]);

    function handleSelectSiege(siege: Siege) {
        if (siegeIdSelectionne === siege.id) {
            setSiegeIdSelectionne(null);
        } else {
            setSiegeIdSelectionne(siege.id);
            setSiege({
                id: siege.id,
                numeroSiege: siege.numeroSiege,
                statut: siege.statut as any,
            });
        }
    }

    function handleContinuer() {
        if (!siegeIdSelectionne) return;
        router.push("/reservation/infos" as any);
    }

    // Grouper par rangées
    const rangees = Array.from(
        new Set(sieges.map((s) => s.rangee))
    );

    const siegeChoisi = sieges.find(
        (s) => s.id === siegeIdSelectionne
    );

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={couleur}
            />

            {/* ── Header ── */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        backgroundColor: couleur,
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
                            {t("siege.plan")}
                        </Text>
                        <View style={styles.etapeBadge}>
                            <Text style={styles.etapeText}>
                                {t("reservation.etape")} 2/8
                            </Text>
                        </View>
                    </View>

                    {/* Résumé voyage */}
                    <View style={styles.voyageResume}>
                        <AnimatedTrajet
                            villeDepart={voyage.villeDepart}
                            villeArrivee={voyage.villeArrivee}
                            heureDepart={voyage.heureDepart}
                            heureArrivee={
                                voyage.heureArriveeEstimee
                            }
                            duree={voyage.dureeEstimee}
                            couleur="rgba(255,255,255,0.9)"
                        />
                        <View style={styles.voyageInfoRow}>
                            <Text style={styles.voyageInfoText}>
                                {voyage.dateDepart}
                            </Text>
                            <Text style={styles.voyageInfoText}>
                                {labelTypeClasse(voyage.typeClasse)}
                            </Text>
                            <Text style={styles.voyageInfoText}>
                                {formatPrix(
                                    voyage.prixPromo ??
                                        voyage.prixNormal,
                                    voyage.devise
                                )}
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
                        opacity: planOp,
                        transform: [{ translateY: planY }],
                    }}
                >
                    {/* ── Légende ── */}
                    <View style={styles.legendeCard}>
                        <Text style={styles.legendeTitre}>
                            Légende
                        </Text>
                        <View style={styles.legendeRow}>
                            {[
                                {
                                    couleur: colors.white,
                                    border: colors.gray200,
                                    label: t("siege.disponible"),
                                },
                                {
                                    couleur: couleur,
                                    border: couleur,
                                    label: t("siege.selectionne"),
                                },
                                {
                                    couleur: colors.gray200,
                                    border: colors.gray300,
                                    label: t("siege.reserve"),
                                },
                                {
                                    couleur: colors.gray300,
                                    border: colors.gray400,
                                    label: t("siege.occupe"),
                                },
                            ].map((item, i) => (
                                <View
                                    key={i}
                                    style={styles.legendeItem}
                                >
                                    <View
                                        style={[
                                            styles.legendeBox,
                                            {
                                                backgroundColor:
                                                    item.couleur,
                                                borderColor:
                                                    item.border,
                                            },
                                        ]}
                                    />
                                    <Text
                                        style={styles.legendeLabel}
                                    >
                                        {item.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.placesInfo}>
                            <Info
                                size={13}
                                color={couleur}
                            />
                            <Text style={styles.placesInfoText}>
                                {nbDisponibles} place(s) disponible(s)
                            </Text>
                        </View>
                    </View>

                    {/* ── Plan du bus ── */}
                    <View style={styles.planCard}>
                        {/* Avant du bus */}
                        <View style={styles.busAvant}>
                            <View style={styles.busAvantInner}>
                                <Bus
                                    size={22}
                                    color={colors.gray500}
                                    weight="fill"
                                />
                                <Text style={styles.busAvantText}>
                                    Chauffeur
                                </Text>
                            </View>
                        </View>

                        {/* Colonnes labels */}
                        <View style={styles.colonnesLabels}>
                            <View style={styles.colonneLabel}>
                                <Text style={styles.colonneLabelText}>
                                    A
                                </Text>
                            </View>
                            <View style={styles.colonneLabel}>
                                <Text style={styles.colonneLabelText}>
                                    B
                                </Text>
                            </View>
                            <View style={styles.colonneSeparator} />
                            <View style={styles.colonneLabel}>
                                <Text style={styles.colonneLabelText}>
                                    C
                                </Text>
                            </View>
                            <View style={styles.colonneLabel}>
                                <Text style={styles.colonneLabelText}>
                                    D
                                </Text>
                            </View>
                        </View>

                        {/* Rangées de sièges */}
                        {rangees.map((rangee) => {
                            const siegesRangee = sieges.filter(
                                (s) => s.rangee === rangee
                            );
                            const gauche = siegesRangee.filter(
                                (s) => s.colonne < 2
                            );
                            const droite = siegesRangee.filter(
                                (s) => s.colonne >= 2
                            );

                            return (
                                <View
                                    key={rangee}
                                    style={styles.rangee}
                                >
                                    {/* Numéro rangée */}
                                    <Text
                                        style={styles.rangeeNum}
                                    >
                                        {rangee}
                                    </Text>

                                    {/* Sièges gauche */}
                                    <View style={styles.siegesGroupe}>
                                        {gauche.map((siege) => (
                                            <SiegeItem
                                                key={siege.id}
                                                siege={siege}
                                                selectionne={
                                                    siege.id ===
                                                    siegeIdSelectionne
                                                }
                                                onPress={() =>
                                                    handleSelectSiege(
                                                        siege
                                                    )
                                                }
                                                couleur={couleur}
                                            />
                                        ))}
                                    </View>

                                    {/* Couloir */}
                                    <View style={styles.couloir} />

                                    {/* Sièges droite */}
                                    <View style={styles.siegesGroupe}>
                                        {droite.map((siege) => (
                                            <SiegeItem
                                                key={siege.id}
                                                siege={siege}
                                                selectionne={
                                                    siege.id ===
                                                    siegeIdSelectionne
                                                }
                                                onPress={() =>
                                                    handleSelectSiege(
                                                        siege
                                                    )
                                                }
                                                couleur={couleur}
                                            />
                                        ))}
                                    </View>
                                </View>
                            );
                        })}

                        {/* Arrière du bus */}
                        <View style={styles.busArriere}>
                            <Text style={styles.busArriereText}>
                                Arrière
                            </Text>
                        </View>
                    </View>

                    {/* ── Siège sélectionné ── */}
                    {siegeChoisi ? (
                        <View
                            style={[
                                styles.siegeChoisiCard,
                                {
                                    borderColor: couleur,
                                    backgroundColor:
                                        couleur + "0D",
                                },
                            ]}
                        >
                            <CheckCircle
                                size={20}
                                color={couleur}
                                weight="fill"
                            />
                            <View style={styles.siegeChoisiInfos}>
                                <Text
                                    style={styles.siegeChoisiLabel}
                                >
                                    {t("siege.selectionne")}
                                </Text>
                                <Text
                                    style={[
                                        styles.siegeChoisiNum,
                                        { color: couleur },
                                    ]}
                                >
                                    {t("siege.siege_numero", {
                                        numero:
                                            siegeChoisi.numeroSiege,
                                    })}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.siegeChoisiPrix,
                                    { color: couleur },
                                ]}
                            >
                                {formatPrix(
                                    voyage.prixPromo ??
                                        voyage.prixNormal,
                                    voyage.devise
                                )}
                            </Text>
                        </View>
                    ) : null}
                </Animated.View>
            </ScrollView>

            {/* ── Bouton continuer ── */}
            <Animated.View
                style={[
                    styles.continuerContainer,
                    {
                        transform: [{ scale: btnScale }],
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={handleContinuer}
                    style={[
                        styles.continuerBtn,
                        { backgroundColor: couleur },
                    ]}
                    activeOpacity={0.85}
                >
                    <Text style={styles.continuerText}>
                        {t("common.continuer")} —{" "}
                        {siegeChoisi?.numeroSiege}
                    </Text>
                    <ArrowRight
                        size={18}
                        color={colors.white}
                        weight="bold"
                    />
                </TouchableOpacity>
            </Animated.View>
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
        paddingBottom: 20,
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

    // ─── Résumé voyage ────────────────────────────
    voyageResume: {
        paddingHorizontal: 20,
        gap: 8,
    },
    voyageInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    voyageInfoText: {
        fontSize: 12,
        color: "rgba(255,255,255,0.8)",
        fontWeight: "500",
    },

    // ─── Scroll ───────────────────────────────────
    scroll: { flex: 1 },
    scrollContent: {
        paddingBottom: 100,
        paddingTop: 16,
    },

    // ─── Légende ─────────────────────────────────
    legendeCard: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        gap: 10,
    },
    legendeTitre: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.gray700,
    },
    legendeRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    legendeItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendeBox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1.5,
    },
    legendeLabel: {
        fontSize: 11,
        color: colors.gray600,
        fontWeight: "500",
    },
    placesInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    placesInfoText: {
        fontSize: 12,
        color: colors.gray500,
        fontWeight: "500",
    },

    // ─── Plan ────────────────────────────────────
    planCard: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
        alignItems: "center",
        gap: 6,
    },

    // Avant bus
    busAvant: {
        width: "80%",
        backgroundColor: colors.gray100,
        borderRadius: 12,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingVertical: 10,
        alignItems: "center",
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    busAvantInner: {
        alignItems: "center",
        gap: 3,
    },
    busAvantText: {
        fontSize: 10,
        color: colors.gray400,
        fontWeight: "600",
    },

    // Labels colonnes
    colonnesLabels: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
        paddingLeft: 28,
    },
    colonneLabel: {
        width: 44,
        alignItems: "center",
    },
    colonneLabelText: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.gray400,
    },
    colonneSeparator: { width: 20 },

    // Rangée
    rangee: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        width: "100%",
    },
    rangeeNum: {
        width: 22,
        fontSize: 10,
        fontWeight: "700",
        color: colors.gray300,
        textAlign: "right",
    },
    siegesGroupe: {
        flexDirection: "row",
        gap: 6,
    },
    couloir: {
        width: 20,
    },

    // Siège
    siege: {
        width: 44,
        height: 44,
        borderRadius: 10,
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    siegeNum: {
        fontSize: 9,
        fontWeight: "700",
    },

    // Arrière bus
    busArriere: {
        width: "80%",
        backgroundColor: colors.gray100,
        borderRadius: 12,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        paddingVertical: 8,
        alignItems: "center",
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    busArriereText: {
        fontSize: 10,
        color: colors.gray400,
        fontWeight: "600",
    },

    // ─── Siège choisi ─────────────────────────────
    siegeChoisiCard: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1.5,
        gap: 12,
        marginBottom: 8,
    },
    siegeChoisiInfos: { flex: 1 },
    siegeChoisiLabel: {
        fontSize: 11,
        color: colors.gray400,
        fontWeight: "500",
    },
    siegeChoisiNum: {
        fontSize: 15,
        fontWeight: "800",
    },
    siegeChoisiPrix: {
        fontSize: 14,
        fontWeight: "800",
    },

    // ─── Bouton continuer ─────────────────────────
    continuerContainer: {
        position: "absolute",
        bottom: 24,
        left: 16,
        right: 16,
    },
    continuerBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 15,
        borderRadius: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
    continuerText: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.white,
    },
});
