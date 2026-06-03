import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Animated,
    StatusBar,
    Modal,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    List,
    MagnifyingGlass,
    SlidersHorizontal,
    Bus,
    Buildings,
    MapPin,
    X,
    Check,
    ArrowLeft,
    Robot,
} from "phosphor-react-native";
import AgenceCard from "@/components/agence/AgenceCard";
import VoyageCard from "@/components/voyage/VoyageCard";
import BurgerMenu from "@/components/ui/BurgerMenu";
import ChatPanel from "@/components/ui/ChatPanel";
import FloatingChatButton from "@/components/ui/FloatingChatButton";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import colors from "@/constants/colors";
import { useReservationStore } from "@/store/reservationStore";

// ─── Types filtres ────────────────────────────────────────────
type FiltreType =
    | "agences"
    | "voyages"
    | "par_ville"
    | "par_destination"
    | "par_classe";

interface FiltreOption {
    key: FiltreType;
    labelKey: string;
    icon: React.ReactNode;
}

// ─── Données mock ─────────────────────────────────────────────
const COULEURS = [
    "#1877F2",
    "#F97316",
    "#16A34A",
    "#8B5CF6",
    "#EF4444",
    "#0EA5E9",
];

const AGENCES_MOCK = [
    {
        id: 1,
        nom: "Touristique Express",
        villePrincipale: "Douala",
        noteMoyenne: 4.8,
        nombreAvis: 342,
        telephone: "+237 699 001 001",
        email: "contact@touristique.cm",
        description:
            "Leader des transports interurbains au Cameroun depuis 2005. Confort et sécurité garantis.",
        statut: "VALIDE",
    },
    {
        id: 2,
        nom: "Express Voyages",
        villePrincipale: "Yaoundé",
        noteMoyenne: 4.5,
        nombreAvis: 218,
        telephone: "+237 677 002 002",
        email: "info@expressvoyages.cm",
        description:
            "Voyages confortables et ponctuels vers toutes les destinations du pays.",
        statut: "VALIDE",
    },
    {
        id: 3,
        nom: "Confort Plus",
        villePrincipale: "Bafoussam",
        noteMoyenne: 4.7,
        nombreAvis: 156,
        telephone: "+237 655 003 003",
        email: "support@confortplus.cm",
        description:
            "Spécialiste des voyages VIP et Business dans l'Ouest Cameroun.",
        statut: "VALIDE",
    },
    {
        id: 4,
        nom: "Rapid Transit",
        villePrincipale: "Garoua",
        noteMoyenne: 4.2,
        nombreAvis: 89,
        telephone: "+237 644 004 004",
        email: "rapid@transit.cm",
        description:
            "Transport rapide et fiable dans la région du Nord.",
        statut: "VALIDE",
    },
    {
        id: 5,
        nom: "Grand Nord Voyages",
        villePrincipale: "Maroua",
        noteMoyenne: 4.0,
        nombreAvis: 67,
        telephone: "+237 633 005 005",
        email: "grandnord@voyages.cm",
        description:
            "Connexion entre le Grand Nord et les grandes villes du Cameroun.",
        statut: "VALIDE",
    },
    {
        id: 6,
        nom: "Horizon Travel",
        villePrincipale: "Douala",
        noteMoyenne: 4.6,
        nombreAvis: 203,
        telephone: "+237 622 006 006",
        email: "horizon@travel.cm",
        description:
            "Voyages premium avec des véhicules de dernière génération.",
        statut: "VALIDE",
    },
];

const VOYAGES_MOCK = [
    {
        id: 1,
        numeroVoyage: "VY-2026-001",
        agenceId: 1,
        agenceNom: "Touristique Express",
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
    },
    {
        id: 2,
        numeroVoyage: "VY-2026-002",
        agenceId: 1,
        agenceNom: "Touristique Express",
        villeDepart: "Douala",
        gareDepart: "Gare Bonabéri",
        villeArrivee: "Yaoundé",
        gareArrivee: "Gare Centrale",
        dateDepart: "2026-06-10",
        heureDepart: "09:00",
        heureArriveeEstimee: "13:00",
        dureeEstimee: "4h00",
        typeClasse: "CLASSIQUE",
        placesRestantes: 20,
        prixNormal: 3500,
        prixPromo: null,
        devise: "FCFA",
        statut: "OUVERT",
        noteMoyenne: 4.5,
    },
    {
        id: 3,
        numeroVoyage: "VY-2026-003",
        agenceId: 2,
        agenceNom: "Express Voyages",
        villeDepart: "Yaoundé",
        gareDepart: "Gare Mvan",
        villeArrivee: "Bafoussam",
        gareArrivee: "Gare Centrale",
        dateDepart: "2026-06-10",
        heureDepart: "07:30",
        heureArriveeEstimee: "12:30",
        dureeEstimee: "5h00",
        typeClasse: "BUSINESS",
        placesRestantes: 5,
        prixNormal: 7000,
        prixPromo: 6500,
        devise: "FCFA",
        statut: "OUVERT",
        noteMoyenne: 4.6,
    },
    {
        id: 4,
        numeroVoyage: "VY-2026-004",
        agenceId: 3,
        agenceNom: "Confort Plus",
        villeDepart: "Bafoussam",
        gareDepart: "Gare Bafoussam",
        villeArrivee: "Douala",
        gareArrivee: "Gare Bonabéri",
        dateDepart: "2026-06-11",
        heureDepart: "08:00",
        heureArriveeEstimee: "14:00",
        dureeEstimee: "6h00",
        typeClasse: "VIP",
        placesRestantes: 3,
        prixNormal: 8000,
        prixPromo: null,
        devise: "FCFA",
        statut: "OUVERT",
        noteMoyenne: 4.7,
    },
    {
        id: 5,
        numeroVoyage: "VY-2026-005",
        agenceId: 4,
        agenceNom: "Rapid Transit",
        villeDepart: "Garoua",
        gareDepart: "Gare Garoua",
        villeArrivee: "Ngaoundéré",
        gareArrivee: "Gare Ngaoundéré",
        dateDepart: "2026-06-12",
        heureDepart: "06:00",
        heureArriveeEstimee: "09:00",
        dureeEstimee: "3h00",
        typeClasse: "CLASSIQUE",
        placesRestantes: 15,
        prixNormal: 4000,
        prixPromo: null,
        devise: "FCFA",
        statut: "OUVERT",
        noteMoyenne: 4.2,
    },
    {
        id: 6,
        numeroVoyage: "VY-2026-006",
        agenceId: 6,
        agenceNom: "Horizon Travel",
        villeDepart: "Douala",
        gareDepart: "Gare Bonabéri",
        villeArrivee: "Bamenda",
        gareArrivee: "Gare Bamenda",
        dateDepart: "2026-06-10",
        heureDepart: "05:30",
        heureArriveeEstimee: "12:30",
        dureeEstimee: "7h00",
        typeClasse: "PREMIERE_CLASSE",
        placesRestantes: 2,
        prixNormal: 12000,
        prixPromo: 10000,
        devise: "FCFA",
        statut: "OUVERT",
        noteMoyenne: 4.6,
    },
];

// ─── Composant principal ──────────────────────────────────────
export default function ReservationsScreen() {
    const { t }    = useTranslation();
    const router   = useRouter();
    const { setVoyage } = useReservationStore();

    const [menuVisible, setMenuVisible]   = useState(false);
    const [chatVisible, setChatVisible]   = useState(false);
    const [filtreVisible, setFiltreVisible] = useState(false);
    const [searchText, setSearchText]     = useState("");
    const [filtreActif, setFiltreActif]   = useState<FiltreType>("agences");

    // Animations
    const headerY  = useRef(new Animated.Value(-40)).current;
    const headerOp = useRef(new Animated.Value(0)).current;

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
        ]).start();
    }, []);

    // ─── Options filtres ──────────────────────────
    const filtresOptions: FiltreOption[] = [
        {
            key: "agences",
            labelKey: "reservation.toutes_agences",
            icon: (
                <Buildings
                    size={16}
                    color={colors.primary}
                    weight="fill"
                />
            ),
        },
        {
            key: "voyages",
            labelKey: "reservation.tous_voyages",
            icon: (
                <Bus
                    size={16}
                    color={colors.primary}
                    weight="fill"
                />
            ),
        },
        {
            key: "par_destination",
            labelKey: "reservation.par_destination",
            icon: (
                <MapPin
                    size={16}
                    color={colors.primary}
                    weight="fill"
                />
            ),
        },
        {
            key: "par_ville",
            labelKey: "reservation.par_ville",
            icon: (
                <MapPin
                    size={16}
                    color={colors.secondary}
                    weight="fill"
                />
            ),
        },
    ];

    // ─── Filtrage des données ─────────────────────
    const agencesFiltrees = AGENCES_MOCK.filter((a) => {
        if (!searchText.trim()) return true;
        const q = searchText.toLowerCase();
        return (
            a.nom.toLowerCase().includes(q) ||
            a.villePrincipale.toLowerCase().includes(q)
        );
    });

    const voyagesFiltres = VOYAGES_MOCK.filter((v) => {
        if (!searchText.trim()) return true;
        const q = searchText.toLowerCase();

        if (filtreActif === "par_destination") {
            return v.villeArrivee.toLowerCase().includes(q);
        }
        if (filtreActif === "par_ville") {
            return v.villeDepart.toLowerCase().includes(q);
        }
        // voyages — recherche générale
        return (
            v.villeDepart.toLowerCase().includes(q) ||
            v.villeArrivee.toLowerCase().includes(q) ||
            v.agenceNom.toLowerCase().includes(q) ||
            v.numeroVoyage.toLowerCase().includes(q)
        );
    });

    const showAgences =
        filtreActif === "agences" && !searchText.trim();
    const showVoyages =
        filtreActif !== "agences" || searchText.trim().length > 0;

    // ─── Placeholder barre recherche ─────────────
    function getPlaceholder(): string {
        if (filtreActif === "par_destination")
            return "Ex: Yaoundé, Bafoussam...";
        if (filtreActif === "par_ville")
            return "Ex: Douala, Garoua...";
        if (filtreActif === "voyages")
            return "Rechercher un voyage...";
        return t("reservation.rechercher_agence");
    }

    // ─── Label filtre actif ───────────────────────
    function getLabelFiltreActif(): string {
        const opt = filtresOptions.find(
            (f) => f.key === filtreActif
        );
        return opt ? t(opt.labelKey) : "";
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
                    {/* Top row */}
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            onPress={() => setMenuVisible(true)}
                            style={styles.iconBtn}
                            activeOpacity={0.8}
                        >
                            <List
                                size={22}
                                color={colors.white}
                                weight="bold"
                            />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>
                            {t("navigation.reservations")}
                        </Text>

                        <TouchableOpacity
                            onPress={() => setChatVisible(true)}
                            style={styles.iconBtn}
                            activeOpacity={0.8}
                        >
                            <Robot
                                size={20}
                                color={colors.white}
                                weight="fill"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Barre recherche + filtre */}
                    <View style={styles.searchRow}>
                        {/* Input */}
                        <View style={styles.searchInput}>
                            <MagnifyingGlass
                                size={16}
                                color={colors.gray400}
                            />
                            <TextInput
                                style={styles.searchText}
                                placeholder={getPlaceholder()}
                                placeholderTextColor={colors.gray400}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            {searchText.length > 0 ? (
                                <TouchableOpacity
                                    onPress={() => setSearchText("")}
                                    activeOpacity={0.7}
                                >
                                    <X
                                        size={16}
                                        color={colors.gray400}
                                    />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {/* Bouton filtre */}
                        <TouchableOpacity
                            onPress={() => setFiltreVisible(true)}
                            style={styles.filtreBtn}
                            activeOpacity={0.85}
                        >
                            <SlidersHorizontal
                                size={18}
                                color={colors.white}
                                weight="bold"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Filtre actif chip */}
                    <View style={styles.filtreActifRow}>
                        <View style={styles.filtreActifChip}>
                            <Text style={styles.filtreActifText}>
                                {getLabelFiltreActif()}
                            </Text>
                        </View>
                        {searchText.trim() ? (
                            <Text style={styles.resultatsText}>
                                {filtreActif === "agences"
                                    ? agencesFiltrees.length
                                    : voyagesFiltres.length}{" "}
                                résultat(s)
                            </Text>
                        ) : null}
                    </View>
                </SafeAreaView>
            </Animated.View>

            {/* ── Contenu ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Agences */}
                {showAgences ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t("reservation.agences_disponibles")}
                        </Text>
                        {agencesFiltrees.length === 0 ? (
                            <EmptyState
                                icon="buildings"
                                title={t(
                                    "reservation.aucune_agence"
                                )}
                            />
                        ) : (
                            agencesFiltrees.map((agence, i) => (
                                <AgenceCard
                                    key={agence.id}
                                    {...agence}
                                    couleur={
                                        COULEURS[
                                            i % COULEURS.length
                                        ]
                                    }
                                    onVoirVoyages={() =>
                                        router.push(
                                            `/agences/${agence.id}` as any
                                        )
                                    }
                                />
                            ))
                        )}
                    </View>
                ) : null}

                {/* Voyages */}
                {showVoyages && filtreActif !== "agences" ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {t("reservation.voyages_disponibles")}
                        </Text>
                        {voyagesFiltres.length === 0 ? (
                            <EmptyState
                                icon="bus"
                                title="Aucun voyage trouvé"
                                description="Essayez une autre destination"
                            />
                        ) : (
                            voyagesFiltres.map((voyage, i) => (
                                <VoyageCard
                                    key={voyage.id}
                                    {...voyage}
                                    couleur={
                                        COULEURS[
                                            i % COULEURS.length
                                        ]
                                    }
                                    onDetails={() =>
                                        router.push(
                                            `/voyages/${voyage.id}` as any
                                        )
                                    }
                                    onReserver={() => {
                                        router.push(
                                            "/reservation/sieges" as any
                                        );
                                    }}
                                />
                            ))
                        )}
                    </View>
                ) : null}

                {/* Voyages si recherche active dans mode agences */}
                {filtreActif === "agences" &&
                searchText.trim().length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Agences trouvées
                        </Text>
                        {agencesFiltrees.length === 0 ? (
                            <EmptyState
                                icon="buildings"
                                title={t(
                                    "reservation.aucune_agence"
                                )}
                            />
                        ) : (
                            agencesFiltrees.map((agence, i) => (
                                <AgenceCard
                                    key={agence.id}
                                    {...agence}
                                    couleur={
                                        COULEURS[
                                            i % COULEURS.length
                                        ]
                                    }
                                    onVoirVoyages={() =>
                                        router.push(
                                            `/agences/${agence.id}` as any
                                        )
                                    }
                                />
                            ))
                        )}
                    </View>
                ) : null}
            </ScrollView>

            {/* ── Bouton chat ── */}
            <FloatingChatButton
                onPress={() => setChatVisible(true)}
                bottomOffset={90}
            />

            {/* ── Modal filtre ── */}
            <Modal
                visible={filtreVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setFiltreVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={() => setFiltreVisible(false)}
                        activeOpacity={1}
                    />
                    <View style={styles.modalPanel}>
                        {/* Handle */}
                        <View style={styles.modalHandle} />

                        <Text style={styles.modalTitle}>
                            {t("reservation.filtrer_par")}
                        </Text>

                        {filtresOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[
                                    styles.filtreItem,
                                    filtreActif === opt.key &&
                                        styles.filtreItemActive,
                                ]}
                                onPress={() => {
                                    setFiltreActif(opt.key);
                                    setSearchText("");
                                    setFiltreVisible(false);
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={styles.filtreItemIcon}>
                                    {opt.icon}
                                </View>
                                <Text
                                    style={[
                                        styles.filtreItemText,
                                        filtreActif === opt.key &&
                                            styles.filtreItemTextActive,
                                    ]}
                                >
                                    {t(opt.labelKey)}
                                </Text>
                                {filtreActif === opt.key ? (
                                    <Check
                                        size={16}
                                        color={colors.primary}
                                        weight="bold"
                                    />
                                ) : null}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* ── Menus ── */}
            <BurgerMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
            />
            <ChatPanel
                visible={chatVisible}
                onClose={() => setChatVisible(false)}
            />
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
        paddingBottom: 16,
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
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.white,
        letterSpacing: 0.3,
    },

    // ─── Barre recherche ─────────────────────────
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    searchText: {
        flex: 1,
        fontSize: 14,
        color: colors.gray900,
    },
    filtreBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.22)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },

    // ─── Filtre actif ─────────────────────────────
    filtreActifRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    filtreActifChip: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    filtreActifText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.white,
    },
    resultatsText: {
        fontSize: 12,
        color: "rgba(255,255,255,0.8)",
        fontWeight: "500",
    },

    // ─── Scroll ───────────────────────────────────
    scroll: { flex: 1 },
    scrollContent: {
        paddingBottom: 120,
        paddingTop: 8,
    },

    // ─── Sections ─────────────────────────────────
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.gray800,
        marginBottom: 14,
    },

    // ─── Modal filtre ─────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    modalPanel: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 12,
        gap: 6,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.gray200,
        alignSelf: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: colors.gray900,
        marginBottom: 12,
    },
    filtreItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: colors.gray50,
        marginBottom: 8,
    },
    filtreItemActive: {
        backgroundColor: colors.primaryLight,
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    filtreItemIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
    },
    filtreItemText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: colors.gray700,
    },
    filtreItemTextActive: {
        color: colors.primary,
    },
});