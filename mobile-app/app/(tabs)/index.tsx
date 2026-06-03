import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
    TextInput,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    List,
    MagnifyingGlass,
    MapPin,
    ArrowRight,
    Bus,
    Star,
    Clock,
    ArrowsLeftRight,
    Robot,
    Sparkle,
    TrendUp,
    CalendarBlank,
    CaretRight,
} from "phosphor-react-native";
import { useAuthStore } from "@/store/authStore";
import { useSearchStore } from "@/store/searchStore";
import BurgerMenu from "@/components/ui/BurgerMenu";
import ChatPanel from "@/components/ui/ChatPanel";
import FloatingChatButton from "@/components/ui/FloatingChatButton";
import VoiceReservation from "@/components/ui/VoiceReservation";
import colors from "@/constants/colors";
import { formatPrix, formatDate } from "@/utils/format";

const { width: W } = Dimensions.get("window");

// ─── Données mock (remplacées par API plus tard) ──────────────
const VILLES_POPULAIRES = [
    "Douala",
    "Yaoundé",
    "Bafoussam",
    "Bamenda",
    "Garoua",
    "Maroua",
    "Ngaoundéré",
    "Ebolowa",
];

const VOYAGES_MOCK = [
    {
        id: 1,
        agence: "Touristique Express",
        villeDepart: "Douala",
        villeArrivee: "Yaoundé",
        heureDepart: "06:00",
        duree: "4h00",
        prix: 5000,
        prixPromo: 4500,
        classe: "VIP",
        note: 4.8,
        placesRestantes: 8,
        couleur: "#1877F2",
    },
    {
        id: 2,
        agence: "Express Voyages",
        villeDepart: "Yaoundé",
        villeArrivee: "Bafoussam",
        heureDepart: "08:30",
        duree: "5h00",
        prix: 6000,
        prixPromo: null,
        classe: "CLASSIQUE",
        note: 4.3,
        placesRestantes: 15,
        couleur: "#F97316",
    },
    {
        id: 3,
        agence: "Confort Plus",
        villeDepart: "Douala",
        villeArrivee: "Bafoussam",
        heureDepart: "10:00",
        duree: "6h00",
        prix: 7500,
        prixPromo: 7000,
        classe: "BUSINESS",
        note: 4.6,
        placesRestantes: 3,
        couleur: "#16A34A",
    },
];

const AGENCES_MOCK = [
    {
        id: 1,
        nom: "Touristique Express",
        ville: "Douala",
        note: 4.8,
        nbAvis: 342,
        couleur: "#1877F2",
    },
    {
        id: 2,
        nom: "Express Voyages",
        ville: "Yaoundé",
        note: 4.5,
        nbAvis: 218,
        couleur: "#F97316",
    },
    {
        id: 3,
        nom: "Confort Plus",
        ville: "Bafoussam",
        note: 4.7,
        nbAvis: 156,
        couleur: "#16A34A",
    },
    {
        id: 4,
        nom: "Rapid Transit",
        ville: "Garoua",
        note: 4.2,
        nbAvis: 89,
        couleur: "#8B5CF6",
    },
];

const PROMOS_MOCK = [
    {
        id: 1,
        titre: "Spécial Week-end",
        description: "-20% sur tous les trajets Douala ↔ Yaoundé",
        couleurDeg: ["#1877F2", "#0EA5E9"],
        expire: "30 juin 2026",
    },
    {
        id: 2,
        titre: "Fête Nationale",
        description: "-15% pour le 20 mai sur Bafoussam",
        couleurDeg: ["#F97316", "#EF4444"],
        expire: "20 mai 2026",
    },
];

export default function AccueilScreen() {
    const { t }              = useTranslation();
    const router             = useRouter();
    const { utilisateur }    = useAuthStore();
    const {
        villeDepart,
        villeArrivee,
        dateDepart,
        setVilleDepart,
        setVilleArrivee,
        setDateDepart,
    } = useSearchStore();

    const [menuVisible, setMenuVisible]   = useState(false);
    const [chatVisible, setChatVisible]   = useState(false);
    const [voiceVisible, setVoiceVisible] = useState(false);
    const [refreshing, setRefreshing]     = useState(false);

    // Animations
    const headerY   = useRef(new Animated.Value(-60)).current;
    const headerOp  = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.92)).current;
    const scrollY   = useRef(new Animated.Value(0)).current;

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
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(cardScale, {
                toValue: 1,
                tension: 55,
                friction: 8,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    function handleRecherche() {
        if (!villeDepart || !villeArrivee) return;
        router.push("/voyages/resultats" as any);
    }

    function swapVilles() {
        const tmp = villeDepart;
        setVilleDepart(villeArrivee);
        setVilleArrivee(tmp);
    }

    function onRefresh() {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }

    const headerBg = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: ["transparent", colors.primary],
        extrapolate: "clamp",
    });

    const prenom = utilisateur?.prenom ?? "Voyageur";
    const heure  = new Date().getHours();
    const salut  =
        heure < 12
            ? "Bonjour"
            : heure < 18
            ? "Bon après-midi"
            : "Bonsoir";

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={colors.primary}
                translucent={false}
            />

            {/* ── Header fixe ── */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        transform: [{ translateY: headerY }],
                        opacity: headerOp,
                    },
                ]}
            >
                {/* Dégradé décoratif */}
                <View style={styles.headerGradient} />

                <SafeAreaView edges={["top"]}>
                    <View style={styles.headerTop}>
                        {/* Burger */}
                        <TouchableOpacity
                            onPress={() => setMenuVisible(true)}
                            style={styles.burgerBtn}
                            activeOpacity={0.8}
                        >
                            <List
                                size={25}
                                color={colors.white}
                                weight="bold"
                            />
                        </TouchableOpacity>

                        {/* Logo + Titre */}
                        <View style={styles.headerCenter}>
                            <Bus
                                size={20}
                                color={colors.white}
                                weight="fill"
                            />
                            <Text style={styles.headerTitle}>
                                {t("common.appName")}
                            </Text>
                        </View>

                        {/* Bouton vocal */}
                        <TouchableOpacity
                            onPress={() => setVoiceVisible(true)}
                            style={styles.voiceBtn}
                            activeOpacity={0.8}
                        >
                            <Robot
                                size={20}
                                color={colors.white}
                                weight="fill"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Salutation */}
                    <View style={styles.greetingRow}>
                        <View>
                            <Text style={styles.greetingText}>
                                {salut}, {prenom} !
                            </Text>
                            <Text style={styles.greetingSubtext}>
                                Où voulez-vous aller aujourd'hui ?
                            </Text>
                        </View>
                        <View style={styles.notifDot} />
                    </View>
                </SafeAreaView>
            </Animated.View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* ── Carte de recherche ── */}
                <Animated.View
                    style={[
                        styles.searchCard,
                        { transform: [{ scale: cardScale }] },
                    ]}
                >
                    <Text style={styles.searchCardTitle}>
                        Trouver un voyage
                    </Text>

                    {/* Départ */}
                    <View style={styles.inputGroup}>
                        <View style={styles.inputIcon}>
                            <MapPin
                                size={16}
                                color={colors.primary}
                                weight="fill"
                            />
                        </View>
                        <TextInput
                            style={styles.searchInput}
                            placeholder={t("voyage.ville_depart")}
                            placeholderTextColor={colors.gray400}
                            value={villeDepart}
                            onChangeText={setVilleDepart}
                        />
                    </View>

                    {/* Swap */}
                    <TouchableOpacity
                        onPress={swapVilles}
                        style={styles.swapBtn}
                        activeOpacity={0.8}
                    >
                        <ArrowsLeftRight
                            size={16}
                            color={colors.primary}
                            weight="bold"
                        />
                    </TouchableOpacity>

                    {/* Arrivée */}
                    <View style={styles.inputGroup}>
                        <View style={styles.inputIcon}>
                            <MapPin
                                size={16}
                                color={colors.secondary}
                                weight="fill"
                            />
                        </View>
                        <TextInput
                            style={styles.searchInput}
                            placeholder={t("voyage.ville_arrivee")}
                            placeholderTextColor={colors.gray400}
                            value={villeArrivee}
                            onChangeText={setVilleArrivee}
                        />
                    </View>

                    {/* Date */}
                    <View style={styles.inputGroup}>
                        <View style={styles.inputIcon}>
                            <CalendarBlank
                                size={16}
                                color={colors.gray500}
                                weight="fill"
                            />
                        </View>
                        <TextInput
                            style={styles.searchInput}
                            placeholder={t("voyage.date_depart")}
                            placeholderTextColor={colors.gray400}
                            value={dateDepart}
                            onChangeText={setDateDepart}
                        />
                    </View>

                    {/* Bouton recherche */}
                    <TouchableOpacity
                        onPress={handleRecherche}
                        style={[
                            styles.searchBtn,
                            (!villeDepart || !villeArrivee) &&
                                styles.searchBtnDisabled,
                        ]}
                        activeOpacity={0.85}
                        disabled={!villeDepart || !villeArrivee}
                    >
                        <MagnifyingGlass
                            size={18}
                            color={colors.white}
                            weight="bold"
                        />
                        <Text style={styles.searchBtnText}>
                            {t("voyage.rechercher")}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Villes populaires ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Destinations populaires
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                    >
                        {VILLES_POPULAIRES.map((ville, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.chip}
                                onPress={() => setVilleArrivee(ville)}
                                activeOpacity={0.75}
                            >
                                <MapPin
                                    size={13}
                                    color={colors.primary}
                                    weight="fill"
                                />
                                <Text style={styles.chipText}>
                                    {ville}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ── Promos ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Sparkle
                                size={18}
                                color={colors.secondary}
                                weight="fill"
                            />
                            <Text style={styles.sectionTitle}>
                                Offres spéciales
                            </Text>
                        </View>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.promoRow}
                    >
                        {PROMOS_MOCK.map((promo) => (
                            <TouchableOpacity
                                key={promo.id}
                                style={[
                                    styles.promoCard,
                                    {
                                        backgroundColor:
                                            promo.couleurDeg[0],
                                    },
                                ]}
                                activeOpacity={0.88}
                            >
                                <View style={styles.promoContent}>
                                    <Text style={styles.promoTitre}>
                                        {promo.titre}
                                    </Text>
                                    <Text style={styles.promoDesc}>
                                        {promo.description}
                                    </Text>
                                    <View style={styles.promoFooter}>
                                        <Clock
                                            size={12}
                                            color="rgba(255,255,255,0.8)"
                                        />
                                        <Text style={styles.promoExpire}>
                                            Expire le {promo.expire}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.promoCircle} />
                                <View style={styles.promoCircle2} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ── Voyages du jour ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <TrendUp
                                size={18}
                                color={colors.primary}
                                weight="fill"
                            />
                            <Text style={styles.sectionTitle}>
                                Voyages du jour
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() =>
                                router.push(
                                    "/voyages/resultats" as any
                                )
                            }
                        >
                            <Text style={styles.voirTout}>
                                Voir tout
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {VOYAGES_MOCK.map((voyage, i) => (
                        <TouchableOpacity
                            key={voyage.id}
                            style={styles.voyageCard}
                            onPress={() =>
                                router.push(
                                    `/voyages/${voyage.id}` as any
                                )
                            }
                            activeOpacity={0.88}
                        >
                            {/* Bande colorée */}
                            <View
                                style={[
                                    styles.voyageBand,
                                    {
                                        backgroundColor:
                                            voyage.couleur,
                                    },
                                ]}
                            />

                            <View style={styles.voyageBody}>
                                {/* Agence + Note */}
                                <View style={styles.voyageTop}>
                                    <View style={styles.agenceBadge}>
                                        <Bus
                                            size={12}
                                            color={voyage.couleur}
                                            weight="fill"
                                        />
                                        <Text
                                            style={[
                                                styles.agenceNom,
                                                {
                                                    color:
                                                        voyage.couleur,
                                                },
                                            ]}
                                        >
                                            {voyage.agence}
                                        </Text>
                                    </View>
                                    <View style={styles.noteRow}>
                                        <Star
                                            size={12}
                                            color={colors.warning}
                                            weight="fill"
                                        />
                                        <Text style={styles.noteText}>
                                            {voyage.note}
                                        </Text>
                                    </View>
                                </View>

                                {/* Trajet */}
                                <View style={styles.trajetRow}>
                                    <View style={styles.trajetVille}>
                                        <Text style={styles.heureText}>
                                            {voyage.heureDepart}
                                        </Text>
                                        <Text style={styles.villeText}>
                                            {voyage.villeDepart}
                                        </Text>
                                    </View>

                                    <View style={styles.trajetMiddle}>
                                        <View style={styles.trajetLine} />
                                        <View
                                            style={[
                                                styles.busIcon,
                                                {
                                                    backgroundColor:
                                                        voyage.couleur +
                                                        "20",
                                                },
                                            ]}
                                        >
                                            <Bus
                                                size={14}
                                                color={voyage.couleur}
                                                weight="fill"
                                            />
                                        </View>
                                        <Text style={styles.dureeText}>
                                            {voyage.duree}
                                        </Text>
                                        <View style={styles.trajetLine} />
                                    </View>

                                    <View style={styles.trajetVille}>
                                        <Text style={styles.heureText}>
                                            —
                                        </Text>
                                        <Text style={styles.villeText}>
                                            {voyage.villeArrivee}
                                        </Text>
                                    </View>
                                </View>

                                {/* Prix + Places */}
                                <View style={styles.voyageBottom}>
                                    <View>
                                        {voyage.prixPromo ? (
                                            <View style={styles.prixRow}>
                                                <Text
                                                    style={
                                                        styles.prixBarre
                                                    }
                                                >
                                                    {formatPrix(
                                                        voyage.prix
                                                    )}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.prixPromo,
                                                        {
                                                            color:
                                                                voyage.couleur,
                                                        },
                                                    ]}
                                                >
                                                    {formatPrix(
                                                        voyage.prixPromo
                                                    )}
                                                </Text>
                                            </View>
                                        ) : (
                                            <Text
                                                style={[
                                                    styles.prix,
                                                    {
                                                        color:
                                                            voyage.couleur,
                                                    },
                                                ]}
                                            >
                                                {formatPrix(voyage.prix)}
                                            </Text>
                                        )}
                                        <Text style={styles.places}>
                                            {voyage.placesRestantes}{" "}
                                            place(s) restante(s)
                                        </Text>
                                    </View>

                                    <View style={styles.voyageBtns}>
                                        <View
                                            style={[
                                                styles.classeBadge,
                                                {
                                                    backgroundColor:
                                                        voyage.couleur +
                                                        "15",
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.classeText,
                                                    {
                                                        color:
                                                            voyage.couleur,
                                                    },
                                                ]}
                                            >
                                                {voyage.classe}
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                styles.arrowBtn,
                                                {
                                                    backgroundColor:
                                                        voyage.couleur,
                                                },
                                            ]}
                                        >
                                            <CaretRight
                                                size={14}
                                                color={colors.white}
                                                weight="bold"
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Agences populaires ── */}
                <View style={[styles.section, styles.lastSection]}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Star
                                size={18}
                                color={colors.warning}
                                weight="fill"
                            />
                            <Text style={styles.sectionTitle}>
                                Agences populaires
                            </Text>
                        </View>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.agencesRow}
                    >
                        {AGENCES_MOCK.map((agence) => (
                            <TouchableOpacity
                                key={agence.id}
                                style={styles.agenceCard}
                                onPress={() =>
                                    router.push(
                                        `/agences/${agence.id}` as any
                                    )
                                }
                                activeOpacity={0.85}
                            >
                                <View
                                    style={[
                                        styles.agenceAvatar,
                                        {
                                            backgroundColor:
                                                agence.couleur + "20",
                                        },
                                    ]}
                                >
                                    <Bus
                                        size={24}
                                        color={agence.couleur}
                                        weight="fill"
                                    />
                                </View>
                                <Text
                                    style={styles.agenceCardNom}
                                    numberOfLines={1}
                                >
                                    {agence.nom}
                                </Text>
                                <Text style={styles.agenceCardVille}>
                                    {agence.ville}
                                </Text>
                                <View style={styles.agenceCardNote}>
                                    <Star
                                        size={12}
                                        color={colors.warning}
                                        weight="fill"
                                    />
                                    <Text
                                        style={styles.agenceCardNoteText}
                                    >
                                        {agence.note} ({agence.nbAvis})
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* ── Bouton chat flottant ── */}
            <FloatingChatButton
                onPress={() => setChatVisible(true)}
                bottomOffset={90}
            />

            {/* ── Modals ── */}
            <BurgerMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
            />
            <ChatPanel
                visible={chatVisible}
                onClose={() => setChatVisible(false)}
            />
            <VoiceReservation
                visible={voiceVisible}
                onClose={() => setVoiceVisible(false)}
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────
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
    headerGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: colors.primaryDark,
        opacity: 0.3,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 4,
    },
    burgerBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: colors.white,
        letterSpacing: 0.5,
    },
    voiceBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        justifyContent: "center",
        alignItems: "center",
    },
    greetingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingTop: 14,
    },
    greetingText: {
        fontSize: 22,
        fontWeight: "800",
        color: colors.white,
    },
    greetingSubtext: {
        fontSize: 13,
        color: "rgba(255,255,255,0.75)",
        marginTop: 2,
    },
    notifDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.secondary,
        borderWidth: 2,
        borderColor: colors.white,
    },

    // ─── Scroll ───────────────────────────────────
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 120 },

    // ─── Carte recherche ─────────────────────────
    searchCard: {
        marginHorizontal: 16,
        marginTop: -8,
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 18,
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
        gap: 10,
    },
    searchCardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.gray800,
        marginBottom: 4,
    },
    inputGroup: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.gray50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray200,
        minHeight: 46,
        paddingHorizontal: 12,
        gap: 10,
    },
    inputIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: colors.gray900,
        paddingVertical: 10,
    },
    swapBtn: {
        alignSelf: "center",
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.primaryLight,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.primary + "30",
    },
    searchBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingVertical: 13,
        marginTop: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    searchBtnDisabled: {
        backgroundColor: colors.gray300,
        shadowOpacity: 0,
        elevation: 0,
    },
    searchBtnText: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.white,
    },

    // ─── Sections ─────────────────────────────────
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    lastSection: { marginBottom: 16 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.gray800,
        marginBottom: 14,
    },
    voirTout: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.primary,
    },

    // ─── Chips villes ─────────────────────────────
    chipsRow: {
        gap: 8,
        paddingRight: 16,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: colors.white,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.gray200,
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.gray700,
    },

    // ─── Promos ───────────────────────────────────
    promoRow: { gap: 12, paddingRight: 16 },
    promoCard: {
        width: W * 0.72,
        borderRadius: 18,
        padding: 18,
        overflow: "hidden",
        position: "relative",
    },
    promoContent: { gap: 6, zIndex: 2 },
    promoTitre: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.white,
    },
    promoDesc: {
        fontSize: 13,
        color: "rgba(255,255,255,0.88)",
        lineHeight: 18,
    },
    promoFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: 6,
    },
    promoExpire: {
        fontSize: 11,
        color: "rgba(255,255,255,0.75)",
    },
    promoCircle: {
        position: "absolute",
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.1)",
        right: -20,
        top: -20,
    },
    promoCircle2: {
        position: "absolute",
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "rgba(255,255,255,0.08)",
        right: 30,
        bottom: -15,
    },

    // ─── Voyages ──────────────────────────────────
    voyageCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: "row",
        overflow: "hidden",
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    voyageBand: { width: 5 },
    voyageBody: { flex: 1, padding: 14, gap: 10 },
    voyageTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    agenceBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    agenceNom: {
        fontSize: 12,
        fontWeight: "700",
    },
    noteRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    noteText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.warning,
    },
    trajetRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    trajetVille: { alignItems: "center", minWidth: 65 },
    heureText: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.gray900,
    },
    villeText: {
        fontSize: 12,
        color: colors.gray500,
        marginTop: 2,
    },
    trajetMiddle: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    trajetLine: {
        flex: 1,
        height: 1.5,
        backgroundColor: colors.gray200,
    },
    busIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    dureeText: {
        fontSize: 10,
        color: colors.gray400,
        position: "absolute",
        bottom: -14,
        alignSelf: "center",
        width: "100%",
        textAlign: "center",
    },
    voyageBottom: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 6,
    },
    prixRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    prix: {
        fontSize: 15,
        fontWeight: "800",
    },
    prixBarre: {
        fontSize: 12,
        color: colors.gray400,
        textDecorationLine: "line-through",
    },
    prixPromo: {
        fontSize: 15,
        fontWeight: "800",
    },
    places: {
        fontSize: 11,
        color: colors.gray400,
        marginTop: 2,
    },
    voyageBtns: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    classeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    classeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    arrowBtn: {
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },

    // ─── Agences ──────────────────────────────────
    agencesRow: { gap: 12, paddingRight: 16 },
    agenceCard: {
        width: 130,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 14,
        alignItems: "center",
        gap: 6,
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    agenceAvatar: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    agenceCardNom: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.gray800,
        textAlign: "center",
    },
    agenceCardVille: {
        fontSize: 11,
        color: colors.gray400,
    },
    agenceCardNote: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    agenceCardNoteText: {
        fontSize: 11,
        color: colors.gray500,
        fontWeight: "500",
    },
});