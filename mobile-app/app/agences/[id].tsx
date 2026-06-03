import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    StatusBar,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    Phone,
    EnvelopeSimple,
    MapPin,
    Globe,
    Star,
    Bus,
    ChatCircle,
    CheckCircle,
    Buildings,
    CalendarBlank,
} from "phosphor-react-native";
import VoyageCard from "@/components/voyage/VoyageCard";
import ChatPanel from "@/components/ui/ChatPanel";
import Badge from "@/components/ui/Badge";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import { useReservationStore } from "@/store/reservationStore";
import colors from "@/constants/colors";
import { formatDate } from "@/utils/format";

// ─── Types ────────────────────────────────────────────────────
interface Agence {
    id: number;
    nom: string;
    villePrincipale: string;
    description: string;
    telephone: string;
    email: string;
    adresse: string;
    siteWeb: string | null;
    noteMoyenne: number;
    nombreAvis: number;
    statut: string;
    dateCreation: string;
}

interface Voyage {
    id: number;
    numeroVoyage: string;
    agenceId: number;
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
    prixPromo: number | null;
    devise: string;
    statut: string;
    noteMoyenne: number;
}

// ─── Données mock ─────────────────────────────────────────────
// TODO: Remplacer par appel API → agencesApi.getById(id)
// et voyagesApi.rechercher({ agenceId: id }) quand le backend
// de ton camarade sera prêt
const AGENCES_MOCK: Record<number, Agence> = {
    1: {
        id: 1,
        nom: "Touristique Express",
        villePrincipale: "Douala",
        description:
            "Leader des transports interurbains au Cameroun depuis 2005. Nous offrons des services de qualité avec des véhicules modernes et confortables. La sécurité et la ponctualité sont nos priorités absolues.",
        telephone: "+237 699 001 001",
        email: "contact@touristique.cm",
        adresse: "Gare Routière de Bonabéri, Douala",
        siteWeb: "https://touristique-express.cm",
        noteMoyenne: 4.8,
        nombreAvis: 342,
        statut: "VALIDE",
        dateCreation: "2005-03-15T00:00:00Z",
    },
    2: {
        id: 2,
        nom: "Express Voyages",
        villePrincipale: "Yaoundé",
        description:
            "Voyages confortables et ponctuels vers toutes les destinations du Cameroun. Notre flotte moderne garantit votre confort tout au long du trajet.",
        telephone: "+237 677 002 002",
        email: "info@expressvoyages.cm",
        adresse: "Gare de Mvan, Yaoundé",
        siteWeb: null,
        noteMoyenne: 4.5,
        nombreAvis: 218,
        statut: "VALIDE",
        dateCreation: "2010-07-20T00:00:00Z",
    },
    3: {
        id: 3,
        nom: "Confort Plus",
        villePrincipale: "Bafoussam",
        description:
            "Spécialiste des voyages VIP et Business dans l'Ouest Cameroun. Profitez d'un service premium à bord de nos véhicules climatisés.",
        telephone: "+237 655 003 003",
        email: "support@confortplus.cm",
        adresse: "Gare Centrale, Bafoussam",
        siteWeb: "https://confort-plus.cm",
        noteMoyenne: 4.7,
        nombreAvis: 156,
        statut: "VALIDE",
        dateCreation: "2012-01-10T00:00:00Z",
    },
    4: {
        id: 4,
        nom: "Rapid Transit",
        villePrincipale: "Garoua",
        description:
            "Transport rapide et fiable dans la région du Nord. Nous desservons les principales villes du septentrion.",
        telephone: "+237 644 004 004",
        email: "rapid@transit.cm",
        adresse: "Gare Principale, Garoua",
        siteWeb: null,
        noteMoyenne: 4.2,
        nombreAvis: 89,
        statut: "VALIDE",
        dateCreation: "2015-05-08T00:00:00Z",
    },
    5: {
        id: 5,
        nom: "Grand Nord Voyages",
        villePrincipale: "Maroua",
        description:
            "Connexion entre le Grand Nord et les grandes villes du Cameroun. Service fiable et abordable.",
        telephone: "+237 633 005 005",
        email: "grandnord@voyages.cm",
        adresse: "Gare Centrale, Maroua",
        siteWeb: null,
        noteMoyenne: 4.0,
        nombreAvis: 67,
        statut: "VALIDE",
        dateCreation: "2018-09-01T00:00:00Z",
    },
    6: {
        id: 6,
        nom: "Horizon Travel",
        villePrincipale: "Douala",
        description:
            "Voyages premium avec des véhicules de dernière génération. L'excellence du voyage interurbain au Cameroun.",
        telephone: "+237 622 006 006",
        email: "horizon@travel.cm",
        adresse: "Terminal Voyageurs, Douala Port",
        siteWeb: "https://horizon-travel.cm",
        noteMoyenne: 4.6,
        nombreAvis: 203,
        statut: "VALIDE",
        dateCreation: "2016-11-30T00:00:00Z",
    },
};

const VOYAGES_PAR_AGENCE: Record<number, Voyage[]> = {
    1: [
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
            id: 7,
            numeroVoyage: "VY-2026-007",
            agenceId: 1,
            agenceNom: "Touristique Express",
            villeDepart: "Douala",
            gareDepart: "Gare Bonabéri",
            villeArrivee: "Bamenda",
            gareArrivee: "Gare Bamenda",
            dateDepart: "2026-06-11",
            heureDepart: "05:00",
            heureArriveeEstimee: "12:00",
            dureeEstimee: "7h00",
            typeClasse: "BUSINESS",
            placesRestantes: 6,
            prixNormal: 9000,
            prixPromo: 8000,
            devise: "FCFA",
            statut: "OUVERT",
            noteMoyenne: 4.7,
        },
    ],
    2: [
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
            id: 8,
            numeroVoyage: "VY-2026-008",
            agenceId: 2,
            agenceNom: "Express Voyages",
            villeDepart: "Yaoundé",
            gareDepart: "Gare Mvan",
            villeArrivee: "Douala",
            gareArrivee: "Gare Bonabéri",
            dateDepart: "2026-06-12",
            heureDepart: "08:00",
            heureArriveeEstimee: "12:00",
            dureeEstimee: "4h00",
            typeClasse: "CLASSIQUE",
            placesRestantes: 18,
            prixNormal: 3500,
            prixPromo: null,
            devise: "FCFA",
            statut: "OUVERT",
            noteMoyenne: 4.3,
        },
    ],
    3: [
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
    ],
    4: [
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
    ],
    5: [],
    6: [
        {
            id: 6,
            numeroVoyage: "VY-2026-006",
            agenceId: 6,
            agenceNom: "Horizon Travel",
            villeDepart: "Douala",
            gareDepart: "Terminal Voyageurs",
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
    ],
};

const COULEURS = [
    "#1877F2",
    "#F97316",
    "#16A34A",
    "#8B5CF6",
    "#EF4444",
    "#0EA5E9",
];

// ─── Écran principal ──────────────────────────────────────────
export default function AgenceDetailScreen() {
    const { id }    = useLocalSearchParams<{ id: string }>();
    const router    = useRouter();
    const { t }     = useTranslation();
    const { setVoyage } = useReservationStore();

    const [chatVisible, setChatVisible] = useState(false);
    const [loading, setLoading]         = useState(true);

    // Animations
    const headerY   = useRef(new Animated.Value(-30)).current;
    const headerOp  = useRef(new Animated.Value(0)).current;
    const contentY  = useRef(new Animated.Value(40)).current;
    const contentOp = useRef(new Animated.Value(0)).current;

    // TODO: Remplacer par →
    // const { data: agence, isLoading } = useQuery({
    //     queryKey: ['agence', id],
    //     queryFn: () => agencesApi.getById(Number(id)),
    // });
    // const { data: voyages } = useQuery({
    //     queryKey: ['voyages-agence', id],
    //     queryFn: () => voyagesApi.rechercher({ agenceId: Number(id) }),
    // });
    const agenceId = Number(id);
    const agence   = AGENCES_MOCK[agenceId];
    const voyages  = VOYAGES_PAR_AGENCE[agenceId] ?? [];

    useEffect(() => {
        // Simulation chargement API
        setTimeout(() => {
            setLoading(false);
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
        }, 800);
    }, []);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <Loader
                    fullScreen
                    message="Chargement de l'agence..."
                />
            </View>
        );
    }

    if (!agence) {
        return (
            <View style={styles.loaderContainer}>
                <EmptyState
                    icon="business"
                    title="Agence introuvable"
                    description="Cette agence n'existe pas"
                    actionLabel="Retour"
                    onAction={() => router.back()}
                />
            </View>
        );
    }

    const initiales = agence.nom
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    const couleurAgence =
        COULEURS[agenceId % COULEURS.length];

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={couleurAgence}
            />

            {/* ── Header ── */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        backgroundColor: couleurAgence,
                        transform: [{ translateY: headerY }],
                        opacity: headerOp,
                    },
                ]}
            >
                <SafeAreaView edges={["top"]}>
                    {/* Bouton retour */}
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

                        <Text
                            style={styles.headerTitre}
                            numberOfLines={1}
                        >
                            {agence.nom}
                        </Text>

                        {/* Bouton assistant agence */}
                        <TouchableOpacity
                            onPress={() => setChatVisible(true)}
                            style={styles.chatBtn}
                            activeOpacity={0.8}
                        >
                            <ChatCircle
                                size={20}
                                color={colors.white}
                                weight="fill"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Infos résumé header */}
                    <View style={styles.headerResume}>
                        {/* Logo agence */}
                        <View
                            style={[
                                styles.logoCircle,
                                {
                                    backgroundColor:
                                        "rgba(255,255,255,0.2)",
                                },
                            ]}
                        >
                            <Text style={styles.logoText}>
                                {initiales}
                            </Text>
                        </View>

                        <View style={styles.headerInfos}>
                            {/* Note */}
                            <View style={styles.noteRow}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        color={
                                            i <=
                                            Math.round(
                                                agence.noteMoyenne
                                            )
                                                ? "#FFD700"
                                                : "rgba(255,255,255,0.3)"
                                        }
                                        weight="fill"
                                    />
                                ))}
                                <Text style={styles.noteValue}>
                                    {agence.noteMoyenne.toFixed(1)}
                                </Text>
                                <Text style={styles.avisCount}>
                                    ({agence.nombreAvis} avis)
                                </Text>
                            </View>

                            {/* Ville */}
                            <View style={styles.villeRow}>
                                <MapPin
                                    size={12}
                                    color="rgba(255,255,255,0.8)"
                                    weight="fill"
                                />
                                <Text style={styles.villeText}>
                                    {agence.villePrincipale}
                                </Text>
                                {agence.statut === "VALIDE" ? (
                                    <View
                                        style={
                                            styles.verifieBadge
                                        }
                                    >
                                        <CheckCircle
                                            size={11}
                                            color={colors.success}
                                            weight="fill"
                                        />
                                        <Text
                                            style={
                                                styles.verifieText
                                            }
                                        >
                                            {t("agence.statut_valide")}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </Animated.View>

            {/* ── Contenu ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={{
                        opacity: contentOp,
                        transform: [{ translateY: contentY }],
                    }}
                >
                    {/* ── Carte infos agence ── */}
                    <View style={styles.infoCard}>
                        <Text style={styles.cardTitle}>
                            À propos
                        </Text>
                        <Text style={styles.description}>
                            {agence.description}
                        </Text>

                        <View style={styles.separator} />

                        {/* Contacts */}
                        <Text style={styles.cardSubtitle}>
                            Contacts
                        </Text>

                        <TouchableOpacity
                            style={styles.contactRow}
                            onPress={() =>
                                Linking.openURL(
                                    `tel:${agence.telephone}`
                                )
                            }
                            activeOpacity={0.75}
                        >
                            <View
                                style={[
                                    styles.contactIcon,
                                    {
                                        backgroundColor:
                                            couleurAgence + "15",
                                    },
                                ]}
                            >
                                <Phone
                                    size={16}
                                    color={couleurAgence}
                                    weight="fill"
                                />
                            </View>
                            <View style={styles.contactTexts}>
                                <Text style={styles.contactLabel}>
                                    Téléphone
                                </Text>
                                <Text
                                    style={[
                                        styles.contactValue,
                                        { color: couleurAgence },
                                    ]}
                                >
                                    {agence.telephone}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.contactRow}
                            onPress={() =>
                                Linking.openURL(
                                    `mailto:${agence.email}`
                                )
                            }
                            activeOpacity={0.75}
                        >
                            <View
                                style={[
                                    styles.contactIcon,
                                    {
                                        backgroundColor:
                                            couleurAgence + "15",
                                    },
                                ]}
                            >
                                <EnvelopeSimple
                                    size={16}
                                    color={couleurAgence}
                                    weight="fill"
                                />
                            </View>
                            <View style={styles.contactTexts}>
                                <Text style={styles.contactLabel}>
                                    Email
                                </Text>
                                <Text
                                    style={[
                                        styles.contactValue,
                                        { color: couleurAgence },
                                    ]}
                                >
                                    {agence.email}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.contactRow}>
                            <View
                                style={[
                                    styles.contactIcon,
                                    {
                                        backgroundColor:
                                            couleurAgence + "15",
                                    },
                                ]}
                            >
                                <MapPin
                                    size={16}
                                    color={couleurAgence}
                                    weight="fill"
                                />
                            </View>
                            <View style={styles.contactTexts}>
                                <Text style={styles.contactLabel}>
                                    Adresse
                                </Text>
                                <Text style={styles.contactValue}>
                                    {agence.adresse}
                                </Text>
                            </View>
                        </View>

                        {agence.siteWeb ? (
                            <TouchableOpacity
                                style={styles.contactRow}
                                onPress={() =>
                                    Linking.openURL(
                                        agence.siteWeb!
                                    )
                                }
                                activeOpacity={0.75}
                            >
                                <View
                                    style={[
                                        styles.contactIcon,
                                        {
                                            backgroundColor:
                                                couleurAgence +
                                                "15",
                                        },
                                    ]}
                                >
                                    <Globe
                                        size={16}
                                        color={couleurAgence}
                                        weight="fill"
                                    />
                                </View>
                                <View style={styles.contactTexts}>
                                    <Text
                                        style={styles.contactLabel}
                                    >
                                        Site web
                                    </Text>
                                    <Text
                                        style={[
                                            styles.contactValue,
                                            {
                                                color: couleurAgence,
                                            },
                                        ]}
                                    >
                                        {agence.siteWeb}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ) : null}

                        <View style={styles.separator} />

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View
                                style={[
                                    styles.statItem,
                                    {
                                        backgroundColor:
                                            couleurAgence + "10",
                                    },
                                ]}
                            >
                                <Star
                                    size={18}
                                    color={colors.warning}
                                    weight="fill"
                                />
                                <Text
                                    style={[
                                        styles.statValue,
                                        { color: couleurAgence },
                                    ]}
                                >
                                    {agence.noteMoyenne.toFixed(1)}
                                </Text>
                                <Text style={styles.statLabel}>
                                    Note
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.statItem,
                                    {
                                        backgroundColor:
                                            couleurAgence + "10",
                                    },
                                ]}
                            >
                                <ChatCircle
                                    size={18}
                                    color={couleurAgence}
                                    weight="fill"
                                />
                                <Text
                                    style={[
                                        styles.statValue,
                                        { color: couleurAgence },
                                    ]}
                                >
                                    {agence.nombreAvis}
                                </Text>
                                <Text style={styles.statLabel}>
                                    Avis
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.statItem,
                                    {
                                        backgroundColor:
                                            couleurAgence + "10",
                                    },
                                ]}
                            >
                                <Bus
                                    size={18}
                                    color={couleurAgence}
                                    weight="fill"
                                />
                                <Text
                                    style={[
                                        styles.statValue,
                                        { color: couleurAgence },
                                    ]}
                                >
                                    {voyages.length}
                                </Text>
                                <Text style={styles.statLabel}>
                                    Voyages
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* ── Bouton assistant ── */}
                    <TouchableOpacity
                        onPress={() => setChatVisible(true)}
                        style={[
                            styles.assistantBtn,
                            { backgroundColor: couleurAgence },
                        ]}
                        activeOpacity={0.85}
                    >
                        <ChatCircle
                            size={20}
                            color={colors.white}
                            weight="fill"
                        />
                        <Text style={styles.assistantBtnText}>
                            Contacter l'assistant {agence.nom}
                        </Text>
                    </TouchableOpacity>

                    {/* ── Voyages de l'agence ── */}
                    <View style={styles.voyagesSection}>
                        <View style={styles.voyagesSectionHeader}>
                            <View style={styles.voyagesTitleRow}>
                                <Bus
                                    size={18}
                                    color={couleurAgence}
                                    weight="fill"
                                />
                                <Text style={styles.voyagesSectionTitle}>
                                    {t(
                                        "reservation.voyages_disponibles"
                                    )}
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.voyagesCount,
                                    {
                                        backgroundColor:
                                            couleurAgence + "15",
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.voyagesCountText,
                                        { color: couleurAgence },
                                    ]}
                                >
                                    {voyages.length}
                                </Text>
                            </View>
                        </View>

                        {voyages.length === 0 ? (
                            <EmptyState
                                icon="bus"
                                title="Aucun voyage disponible"
                                description="Cette agence n'a pas de voyage pour le moment"
                            />
                        ) : (
                            voyages.map((voyage, i) => (
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
                </Animated.View>
            </ScrollView>

            {/* ── Chat assistant agence ── */}
            <ChatPanel
                visible={chatVisible}
                onClose={() => setChatVisible(false)}
                agenceNom={agence.nom}
                agenceId={agenceId}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loaderContainer: {
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
        paddingBottom: 16,
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
        flex: 1,
        textAlign: "center",
        marginHorizontal: 8,
    },
    chatBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },

    // ─── Résumé header ────────────────────────────
    headerResume: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        gap: 14,
    },
    logoCircle: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.35)",
    },
    logoText: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.white,
    },
    headerInfos: { gap: 6 },
    noteRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    noteValue: {
        fontSize: 14,
        fontWeight: "800",
        color: colors.white,
        marginLeft: 4,
    },
    avisCount: {
        fontSize: 12,
        color: "rgba(255,255,255,0.75)",
    },
    villeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    villeText: {
        fontSize: 13,
        color: "rgba(255,255,255,0.85)",
        fontWeight: "500",
    },
    verifieBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "rgba(22,163,74,0.25)",
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 4,
    },
    verifieText: {
        fontSize: 10,
        color: colors.white,
        fontWeight: "600",
    },

    // ─── Scroll ───────────────────────────────────
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 40 },

    // ─── Carte infos ──────────────────────────────
    infoCard: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        padding: 18,
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
        gap: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.gray900,
    },
    cardSubtitle: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.gray500,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    description: {
        fontSize: 13,
        color: colors.gray600,
        lineHeight: 20,
    },
    separator: {
        height: 1,
        backgroundColor: colors.gray100,
    },

    // ─── Contacts ────────────────────────────────
    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 4,
    },
    contactIcon: {
        width: 38,
        height: 38,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
    },
    contactTexts: { gap: 1 },
    contactLabel: {
        fontSize: 11,
        color: colors.gray400,
        fontWeight: "500",
    },
    contactValue: {
        fontSize: 13,
        color: colors.gray800,
        fontWeight: "600",
    },

    // ─── Stats ───────────────────────────────────
    statsRow: {
        flexDirection: "row",
        gap: 10,
    },
    statItem: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        gap: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "800",
    },
    statLabel: {
        fontSize: 11,
        color: colors.gray400,
        fontWeight: "500",
    },

    // ─── Bouton assistant ─────────────────────────
    assistantBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginHorizontal: 16,
        marginTop: 14,
        paddingVertical: 14,
        borderRadius: 14,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    assistantBtnText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.white,
    },

    // ─── Section voyages ──────────────────────────
    voyagesSection: {
        paddingHorizontal: 16,
        paddingTop: 22,
    },
    voyagesSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    voyagesTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    voyagesSectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.gray800,
    },
    voyagesCount: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    voyagesCountText: {
        fontSize: 13,
        fontWeight: "700",
    },
});
