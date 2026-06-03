import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    ScrollView,
    Image,
} from "react-native";
import {
    House,
    CalendarBlank,
    User,
    SignOut,
    X,
    Bus,
    CaretDown,
    CaretUp,
    Globe,
    Bell,
    Headset,
    Info,
    Shield,
    Star,
} from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useDeconnexion } from "@/hooks/useAuth";
import { LANGUES_DISPONIBLES } from "@/i18n";
import colors from "@/constants/colors";
import i18n from "@/i18n";

const { width: W } = Dimensions.get("window");
const MENU_WIDTH = W * 0.78;

// ─── Langues avec drapeaux ────────────────────────────────────

const LANGUES_ETENDUES = [
    {
        code: "fr",
        label: "Français",
        flag: require("../../../assets/images/flags/fr.png"),
    },
    {
        code: "en",
        label: "English",
        flag: require("../../../assets/images/flags/en.png"),
    },
    {
        code: "ewondo",
        label: "Ewondo",
        flag: require("../../../assets/images/flags/ewondo.png"),
    },
    {
        code: "bassa",
        label: "Bassa",
        flag: require("../../../assets/images/flags/bassa.png"),
    },
    {
        code: "fulfulde",
        label: "Fulfulde",
        flag: require("../../../assets/images/flags/fulfulde.png"),
    },
];

interface BurgerMenuProps {
    visible: boolean;
    onClose: () => void;
}

export default function BurgerMenu({ visible, onClose }: BurgerMenuProps) {
    const router                  = useRouter();
    const { t }                   = useTranslation();
    const { utilisateur }         = useAuthStore();
    const { mutate: deconnecter } = useDeconnexion();

    const [langueOuverte, setLangueOuverte] = useState(false);

    const slideX  = useRef(new Animated.Value(-MENU_WIDTH)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideX, {
                    toValue: 0,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideX, {
                    toValue: -MENU_WIDTH,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    function navigate(path: string) {
        onClose();
        setTimeout(() => router.push(path as any), 250);
    }

    function changerLangue(code: string) {
        i18n.changeLanguage(code);
        setLangueOuverte(false);
    }

    const initiales = utilisateur
        ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase()
        : "?";

    const langueActive = LANGUES_ETENDUES.find(
        (l) => l.code === i18n.language
    ) ?? LANGUES_ETENDUES[0];

    // ─── Items navigation (blocs individuels) ────────────────
    const menuItems = [
        {
            icon: <House size={20} color={colors.primary} weight="fill" />,
            label: t("navigation.accueil"),
            path: "/(tabs)",
        },
        {
            icon: <CalendarBlank size={20} color={colors.primary} weight="fill" />,
            label: t("navigation.reservations"),
            path: "/(tabs)/reservations",
        },
        {
            icon: <User size={20} color={colors.primary} weight="fill" />,
            label: t("navigation.profil"),
            path: "/(tabs)/profil",
        },
    ];

    // ─── Items en blocs 2×2 (comme l'image) ──────────────────
    const blocsItems = [
        {
            icon: <Bell size={22} color={colors.primary} weight="fill" />,
            label: "Notifications",
            path: "/(tabs)",
        },
        {
            icon: <Headset size={22} color={colors.primary} weight="fill" />,
            label: "Assistance",
            path: "/(tabs)",
        },
        {
            icon: <Shield size={22} color={colors.primary} weight="fill" />,
            label: "Sécurité",
            path: "/(tabs)",
        },
        {
            icon: <Info size={22} color={colors.primary} weight="fill" />,
            label: "À propos",
            path: "/(tabs)",
        },
        {
            icon: <Star size={22} color={colors.primary} weight="fill" />,
            label: "Nous noter",
            path: "/(tabs)",
        },
        {
            icon: <Globe size={22} color={colors.primary} weight="fill" />,
            label: "Site web",
            path: "/(tabs)",
        },
    ];

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Overlay */}
            <Animated.View style={[styles.overlay, { opacity }]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                    activeOpacity={1}
                />
            </Animated.View>

            {/* Menu panel */}
            <Animated.View
                style={[
                    styles.menu,
                    { transform: [{ translateX: slideX }] },
                ]}
            >
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    indicatorStyle="default"
                    contentContainerStyle={styles.scrollContent}
                    style={styles.scroll}
                >
                    {/* ── Header profil ── */}
                    <View style={styles.profileSection}>
                        {/* Bouton fermer — bien espacé du haut */}
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeBtn}
                        >
                            <X size={20} color={colors.white} />
                        </TouchableOpacity>

                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{initiales}</Text>
                        </View>

                        <Text style={styles.profileName}>
                            {utilisateur
                                ? `${utilisateur.prenom} ${utilisateur.nom}`
                                : ""}
                        </Text>
                        <Text style={styles.profileEmail}>
                            {utilisateur?.email ?? ""}
                        </Text>

                        <View
                            style={[
                                styles.verifyBadge,
                                utilisateur?.statutVerification === "VERIFIE"
                                    ? styles.verifyBadgeOk
                                    : styles.verifyBadgePending,
                            ]}
                        >
                            <Text style={styles.verifyBadgeText}>
                                {utilisateur?.statutVerification === "VERIFIE"
                                    ? t("profil.verifie")
                                    : t("profil.non_verifie")}
                            </Text>
                        </View>
                    </View>

                    {/* ── Navigation (liste) ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>NAVIGATION</Text>
                        {menuItems.map((item, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.menuItem}
                                onPress={() => navigate(item.path)}
                                activeOpacity={0.75}
                            >
                                <View style={styles.menuItemIcon}>
                                    {item.icon}
                                </View>
                                <Text style={styles.menuItemLabel}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ── Blocs 2×2 ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>OPTIONS</Text>
                        <View style={styles.blocsGrid}>
                            {blocsItems.map((item, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.bloc}
                                    onPress={() => navigate(item.path)}
                                    activeOpacity={0.75}
                                >
                                    <View style={styles.blocIconCircle}>
                                        {item.icon}
                                    </View>
                                    <Text style={styles.blocLabel}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── Langue déroulante ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>
                            {t("common.langue").toUpperCase()}
                        </Text>

                        {/* Bouton déclencheur */}
                        <TouchableOpacity
                            style={styles.langTrigger}
                            onPress={() => setLangueOuverte(!langueOuverte)}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={langueActive.flag}
                                style={styles.flagCircle}
                            />
                            <Text style={styles.langTriggerText}>
                                {langueActive.label}
                            </Text>
                            {langueOuverte ? (
                                <CaretUp size={16} color={colors.primary} weight="bold" />
                            ) : (
                                <CaretDown size={16} color={colors.gray400} weight="bold" />
                            )}
                        </TouchableOpacity>

                        {/* Liste déroulante */}
                        {langueOuverte && (
                            <View style={styles.langDropdown}>
                                {LANGUES_ETENDUES.map((lang) => {
                                    const active = i18n.language === lang.code;
                                    return (
                                        <TouchableOpacity
                                            key={lang.code}
                                            style={[
                                                styles.langOption,
                                                active && styles.langOptionActive,
                                            ]}
                                            onPress={() => changerLangue(lang.code)}
                                            activeOpacity={0.75}
                                        >
                                            <Image
                                                source={lang.flag}
                                                style={styles.flagCircle}
                                            />
                                            <Text
                                                style={[
                                                    styles.langOptionLabel,
                                                    active && styles.langOptionLabelActive,
                                                ]}
                                            >
                                                {lang.label}
                                            </Text>
                                            {active && (
                                                <View style={styles.langCheck}>
                                                    <Text style={styles.langCheckText}>✓</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    {/* ── Déconnexion ── */}
                    <View style={[styles.section, { paddingBottom: 24 }]}>
                        <TouchableOpacity
                            style={styles.logoutBtn}
                            onPress={() => {
                                onClose();
                                setTimeout(() => deconnecter(), 250);
                            }}
                            activeOpacity={0.75}
                        >
                            <SignOut size={20} color={colors.error} weight="fill" />
                            <Text style={styles.logoutLabel}>
                                {t("auth.deconnexion")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <Bus size={16} color={colors.gray300} weight="fill" />
                    <Text style={styles.footerText}>
                        {t("common.appName")} v1.0
                    </Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.52)",
    },

    // ─── Panel menu ──────────────────────────────
    menu: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: MENU_WIDTH,
        backgroundColor: colors.white,
        // Coins arrondis uniquement côté droit
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: colors.black,
        shadowOffset: { width: 6, height: 0 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
        elevation: 24,
        overflow: "hidden",
    },

    scroll: {
        flex: 1,
        // Barre de scroll bleue
        // Sur iOS : indicatorStyle="default" dans ScrollView
    },
    scrollContent: {
        paddingBottom: 80,
    },

    // ─── Profil ──────────────────────────────────
    profileSection: {
        backgroundColor: colors.primary,
        paddingTop: 64,       // ← assez d'espace pour le bouton fermer
        paddingBottom: 28,
        paddingHorizontal: 24,
        alignItems: "flex-start",
    },
    closeBtn: {
        position: "absolute",
        top: 48,              // ← bien descendu, pas caché sous la barre
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.25)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    avatarCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: "rgba(255,255,255,0.25)",
        borderWidth: 2.5,
        borderColor: "rgba(255,255,255,0.5)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.white,
    },
    profileName: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.white,
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 13,
        color: "rgba(255,255,255,0.75)",
        marginBottom: 10,
    },
    verifyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    verifyBadgeOk: { backgroundColor: "rgba(22,163,74,0.25)" },
    verifyBadgePending: { backgroundColor: "rgba(255,255,255,0.2)" },
    verifyBadgeText: { fontSize: 11, fontWeight: "600", color: colors.white },

    // ─── Sections ────────────────────────────────
    section: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 4,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.gray400,
        letterSpacing: 1.5,
        marginBottom: 10,
        paddingHorizontal: 4,
    },

    // ─── Items nav (liste) ───────────────────────
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 6,
        backgroundColor: colors.primaryLight,   // ← plus visible
        gap: 14,
        borderWidth: 1,
        borderColor: `${colors.primary}22`,
    },
    menuItemIcon: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItemLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.gray800,
        flex: 1,
    },

    // ─── Blocs 2×2 ───────────────────────────────
    blocsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    bloc: {
        width: "47%",
        backgroundColor: colors.primaryLight,
        borderRadius: 14,
        padding: 16,
        alignItems: "flex-start",
        gap: 10,
        borderWidth: 1,
        borderColor: `${colors.primary}22`,
    },
    blocIconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
    blocLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.gray800,
    },

    // ─── Langue déroulante ───────────────────────
    langTrigger: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: `${colors.primary}22`,
        gap: 12,
    },
    langTriggerText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: colors.gray800,
    },
    flagCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.gray200,
    },
    langDropdown: {
        marginTop: 6,
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: `${colors.primary}22`,
        backgroundColor: colors.white,
    },
    langOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        backgroundColor: colors.white,
    },
    langOptionActive: {
        backgroundColor: colors.primaryLight,
    },
    langOptionLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        color: colors.gray700,
    },
    langOptionLabelActive: {
        color: colors.primary,
        fontWeight: "700",
    },
    langCheck: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    langCheckText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: "800",
    },

    // ─── Déconnexion ─────────────────────────────
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: colors.errorLight,
        borderWidth: 1,
        borderColor: `${colors.error}22`,
    },
    logoutLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.error,
    },

    // ─── Footer ──────────────────────────────────
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        backgroundColor: colors.white,
    },
    footerText: {
        fontSize: 12,
        color: colors.gray400,
        fontWeight: "500",
    },
});
