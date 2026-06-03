import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Lock } from "phosphor-react-native";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PasswordMascot from "@/components/ui/PasswordMascot";
import { useInscription } from "@/hooks/useAuth";
import colors from "@/constants/colors";

type MascotColor = "blue" | "red" | "orange" | "green";

function evaluerRobustesse(mdp: string): {
    color: MascotColor;
    label: string;
    score: number;
} {
    if (!mdp) return { color: "blue", label: "", score: 0 };
    let score = 0;
    if (mdp.length >= 8)  score++;
    if (mdp.length >= 12) score++;
    if (/[A-Z]/.test(mdp)) score++;
    if (/[0-9]/.test(mdp)) score++;
    if (/[^A-Za-z0-9]/.test(mdp)) score++;

    if (score <= 2) return { color: "red",    label: "Faible",  score };
    if (score <= 3) return { color: "orange", label: "Moyen",   score };
    return           { color: "green",  label: "Robuste", score };
}

// ─── Labels des étapes ───────────────────────────────────────
const ETAPE_LABELS = [
    "Identité",
    "Contact",
    "Profil",
    "Sécurité",
];

export default function InscriptionScreen() {
    const { t }  = useTranslation();
    const router = useRouter();
    const { mutate: inscrire, isPending, error } = useInscription();

    // ─── Étape courante (0 à 3) ──────────────────
    const [etape, setEtape] = useState(0);

    // ─── Form state ──────────────────────────────
    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        motDePasse: "",
        confirmerMdp: "",
        dateNaissance: "",
        sexe: "" as "M" | "F" | "",
        numeroCni: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ─── Date picker ─────────────────────────────
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateSelectionnee, setDateSelectionnee] = useState<Date>(new Date(2000, 0, 1));

    function onDateChange(_: any, selected?: Date) {
        // Sur Android le picker se ferme tout seul
        if (Platform.OS === "android") setShowDatePicker(false);
        if (selected) {
            setDateSelectionnee(selected);
            const yyyy = selected.getFullYear();
            const mm   = String(selected.getMonth() + 1).padStart(2, "0");
            const dd   = String(selected.getDate()).padStart(2, "0");
            update("dateNaissance", `${yyyy}-${mm}-${dd}`);
        }
    }

    function formatDateAffichage(dateStr: string): string {
        if (!dateStr) return "";
        const [yyyy, mm, dd] = dateStr.split("-");
        const moisFr = [
            "janvier","février","mars","avril","mai","juin",
            "juillet","août","septembre","octobre","novembre","décembre",
        ];
        const moisIndex = parseInt(mm, 10) - 1;
        return `${dd} ${moisFr[moisIndex]} ${yyyy}`;
    }

    // ─── Mascot state ─────────────────────────────
    const [mdpFocus,       setMdpFocus]       = useState(false);
    const [mdpVisible,     setMdpVisible]     = useState(false);
    const [mdpConfFocus,   setMdpConfFocus]   = useState(false);
    const [mdpConfVisible, setMdpConfVisible] = useState(false);

    const robustesse = evaluerRobustesse(form.motDePasse);

    // ─── Barre robustesse animation ───────────────
    const barWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const pct = form.motDePasse ? (robustesse.score / 5) * 100 : 0;
        Animated.spring(barWidth, {
            toValue: pct,
            useNativeDriver: false,
            tension: 60,
            friction: 8,
        }).start();
    }, [form.motDePasse]);

    // ─── Header animation ────────────────────────
    const titleOpacity   = useRef(new Animated.Value(0)).current;
    const titleTranslate = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(titleTranslate, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    // ─── Animation de transition entre étapes ────
    const slideAnim = useRef(new Animated.Value(0)).current;

    function animerTransition(callback: () => void) {
        Animated.sequence([
            Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0,   duration: 0,   useNativeDriver: true }),
        ]).start(() => {
            callback();
            Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        });
    }

    // ─── Helpers ─────────────────────────────────
    function update(key: string, val: string) {
        setForm((f) => ({ ...f, [key]: val }));
        setErrors((e) => ({ ...e, [key]: "" }));
    }

    // ─── Validation par étape ────────────────────
    function validerEtape(): boolean {
        const e: Record<string, string> = {};

        if (etape === 0) {
            if (!form.nom.trim())    e.nom    = t("common.obligatoire");
            if (!form.prenom.trim()) e.prenom = t("common.obligatoire");
        }

        if (etape === 1) {
            if (!form.email.trim()) e.email = t("common.obligatoire");
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                e.email = t("auth.email_invalide");
            if (!form.telephone.trim()) e.telephone = t("common.obligatoire");
        }

        if (etape === 2) {
            if (!form.dateNaissance) e.dateNaissance = t("common.obligatoire");
            if (!form.sexe)          e.sexe          = t("common.obligatoire");
        }

        if (etape === 3) {
            if (!form.motDePasse) e.motDePasse = t("common.obligatoire");
            else if (form.motDePasse.length < 8) e.motDePasse = t("auth.mdp_trop_court");
            if (form.motDePasse !== form.confirmerMdp)
                e.confirmerMdp = t("auth.mdp_non_identiques");
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSuivant() {
        if (!validerEtape()) return;
        animerTransition(() => setEtape((e) => e + 1));
    }

    function handleRetour() {
        setErrors({});
        animerTransition(() => setEtape((e) => e - 1));
    }

    function handleInscription() {
        if (!validerEtape()) return;
        inscrire(
            {
                nom: form.nom.trim(),
                prenom: form.prenom.trim(),
                email: form.email.trim(),
                telephone: form.telephone.trim(),
                motDePasse: form.motDePasse,
                dateNaissance: form.dateNaissance,
                sexe: form.sexe as "M" | "F",
                numeroCni: form.numeroCni || undefined,
            },
            { onSuccess: () => router.replace("/bienvenue") }
        );
    }

    const barColor =
        robustesse.color === "red"    ? colors.error   :
        robustesse.color === "orange" ? colors.warning  :
        robustesse.color === "green"  ? colors.success  :
        colors.primary;

    // ─── Indicateur de progression ───────────────
    const IndicateurEtapes = () => (
        <View style={styles.indicateur}>
            {ETAPE_LABELS.map((label, i) => (
                <View key={i} style={styles.indicateurItem}>
                    <View style={[
                        styles.indicateurPoint,
                        i < etape  && styles.indicateurFait,
                        i === etape && styles.indicateurActif,
                    ]}>
                        {i < etape ? (
                            <Text style={styles.indicateurCheck}>✓</Text>
                        ) : (
                            <Text style={[
                                styles.indicateurNum,
                                i === etape && styles.indicateurNumActif,
                            ]}>
                                {i + 1}
                            </Text>
                        )}
                    </View>
                    <Text style={[
                        styles.indicateurLabel,
                        i === etape && styles.indicateurLabelActif,
                    ]}>
                        {label}
                    </Text>
                    {i < ETAPE_LABELS.length - 1 && (
                        <View style={[
                            styles.indicateurLigne,
                            i < etape && styles.indicateurLigneFaite,
                        ]} />
                    )}
                </View>
            ))}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <View style={styles.header}>
                    <Animated.View
                        style={{
                            opacity: titleOpacity,
                            transform: [{ translateY: titleTranslate }],
                        }}
                    >
                        <View style={styles.logoWrapper}>
                            <View style={styles.logoCircle}>
                                <Text style={styles.logoText}>RV</Text>
                            </View>
                        </View>
                        <Text style={styles.appName}>{t("common.appName")}</Text>
                        <Text style={styles.title}>{t("auth.inscription")}</Text>
                        <Text style={styles.subtitle}>Rejoignez-nous en quelques étapes</Text>
                    </Animated.View>
                </View>

                {/* ── Indicateur d'étapes ── */}
                <IndicateurEtapes />

                {/* ── Contenu de l'étape ── */}
                <Animated.View
                    style={[
                        styles.form,
                        { opacity: slideAnim.interpolate({ inputRange: [-30, 0], outputRange: [0, 1] }) },
                        { transform: [{ translateX: slideAnim }] },
                    ]}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {etape === 0 && "Nom et prénom"}
                            {etape === 1 && "Contact"}
                            {etape === 2 && "Profil"}
                            {etape === 3 && "Sécurité"}
                        </Text>

                        {/* ── Étape 0 : Nom & Prénom ── */}
                        {etape === 0 && (
                            <>
                                <Input
                                    label={t("auth.nom")}
                                    placeholder="Mbarga"
                                    value={form.nom}
                                    onChangeText={(v) => update("nom", v)}
                                    error={errors.nom}
                                    required
                                    iconLeft="user"
                                />
                                <Input
                                    label={t("auth.prenom")}
                                    placeholder="Jean"
                                    value={form.prenom}
                                    onChangeText={(v) => update("prenom", v)}
                                    error={errors.prenom}
                                    required
                                    iconLeft="user"
                                />
                            </>
                        )}

                        {/* ── Étape 1 : Email & Téléphone ── */}
                        {etape === 1 && (
                            <>
                                <Input
                                    label={t("auth.email")}
                                    placeholder="jean.mbarga@gmail.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={form.email}
                                    onChangeText={(v) => update("email", v)}
                                    error={errors.email}
                                    required
                                    iconLeft="envelope"
                                />
                                <Input
                                    label={t("auth.telephone")}
                                    placeholder="+237 690 000 000"
                                    keyboardType="phone-pad"
                                    value={form.telephone}
                                    onChangeText={(v) => update("telephone", v)}
                                    error={errors.telephone}
                                    required
                                    iconLeft="phone"
                                />
                            </>
                        )}

                        {/* ── Étape 2 : Date naissance, Sexe, CNI ── */}
                        {etape === 2 && (
                            <>
                                {/* Date de naissance — picker natif */}
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.inputLabel}>
                                        {t("auth.date_naissance")}
                                        <Text style={styles.required}> *</Text>
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.dateBtn,
                                            errors.dateNaissance ? styles.dateBtnError : null,
                                        ]}
                                        onPress={() => setShowDatePicker(true)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.dateBtnIcon}>📅</Text>
                                        <Text style={[
                                            styles.dateBtnText,
                                            !form.dateNaissance && styles.dateBtnPlaceholder,
                                        ]}>
                                            {form.dateNaissance
                                                ? formatDateAffichage(form.dateNaissance)
                                                : "Sélectionner une date"}
                                        </Text>
                                        <Text style={styles.dateBtnChevron}>›</Text>
                                    </TouchableOpacity>
                                    {errors.dateNaissance && (
                                        <Text style={styles.errorText}>{errors.dateNaissance}</Text>
                                    )}
                                </View>

                                {/* Picker iOS : modal en bas */}
                                {Platform.OS === "ios" && showDatePicker && (
                                    <Modal transparent animationType="slide">
                                        <View style={styles.modalOverlay}>
                                            <View style={styles.modalContent}>
                                                <View style={styles.modalHeader}>
                                                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                        <Text style={styles.modalAnnuler}>Annuler</Text>
                                                    </TouchableOpacity>
                                                    <Text style={styles.modalTitre}>Date de naissance</Text>
                                                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                        <Text style={styles.modalConfirmer}>Confirmer</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <DateTimePicker
                                                    value={dateSelectionnee}
                                                    mode="date"
                                                    display="spinner"
                                                    onChange={onDateChange}
                                                    maximumDate={new Date()}
                                                    minimumDate={new Date(1920, 0, 1)}
                                                    locale="fr-FR"
                                                />
                                            </View>
                                        </View>
                                    </Modal>
                                )}

                                {/* Picker Android : s'affiche directement */}
                                {Platform.OS === "android" && showDatePicker && (
                                    <DateTimePicker
                                        value={dateSelectionnee}
                                        mode="date"
                                        display="default"
                                        onChange={onDateChange}
                                        maximumDate={new Date()}
                                        minimumDate={new Date(1920, 0, 1)}
                                    />
                                )}

                                {/* Sexe */}
                                <View style={styles.sexeContainer}>
                                    <Text style={styles.inputLabel}>
                                        {t("auth.sexe")}
                                        <Text style={styles.required}> *</Text>
                                    </Text>
                                    <View style={styles.sexeRow}>
                                        {(["M", "F"] as const).map((s) => (
                                            <TouchableOpacity
                                                key={s}
                                                onPress={() => update("sexe", s)}
                                                style={[
                                                    styles.sexeBtn,
                                                    form.sexe === s && styles.sexeBtnActive,
                                                ]}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={[
                                                    styles.sexeBtnText,
                                                    form.sexe === s && styles.sexeBtnTextActive,
                                                ]}>
                                                    {s === "M" ? t("auth.masculin") : t("auth.feminin")}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    {errors.sexe && (
                                        <Text style={styles.errorText}>{errors.sexe}</Text>
                                    )}
                                </View>

                                <Input
                                    label={t("auth.numero_cni")}
                                    placeholder="123456789"
                                    value={form.numeroCni}
                                    onChangeText={(v) => update("numeroCni", v)}
                                    iconLeft="identification-card"
                                />
                            </>
                        )}

                        {/* ── Étape 3 : Mot de passe ── */}
                        {etape === 3 && (
                            <>
                                {(mdpFocus || mdpConfFocus) && (
                                    <PasswordMascot
                                        visible={mdpFocus || mdpConfFocus}
                                        eyesOpen={mdpFocus ? mdpVisible : mdpConfVisible}
                                        color={form.motDePasse ? robustesse.color : "blue"}
                                    />
                                )}

                                {/* Mot de passe */}
                                <View style={styles.mdpContainer}>
                                    <Text style={styles.inputLabel}>
                                        {t("auth.mot_de_passe")}
                                        <Text style={styles.required}> *</Text>
                                    </Text>
                                    <View style={[
                                        styles.passwordWrapper,
                                        mdpFocus && styles.passwordWrapperFocused,
                                        errors.motDePasse ? styles.passwordWrapperError : null,
                                    ]}>
                                        <Lock
                                            size={20}
                                            color={mdpFocus ? colors.primary : colors.gray400}
                                            style={styles.lockIcon}
                                        />
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="••••••••"
                                            placeholderTextColor={colors.gray400}
                                            secureTextEntry={!mdpVisible}
                                            value={form.motDePasse}
                                            onChangeText={(v) => update("motDePasse", v)}
                                            onFocus={() => setMdpFocus(true)}
                                            onBlur={() => setMdpFocus(false)}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setMdpVisible(!mdpVisible)}
                                            style={styles.eyeButton}
                                            activeOpacity={0.7}
                                        >
                                            <Lock
                                                size={20}
                                                color={colors.gray400}
                                                weight={mdpVisible ? "fill" : "regular"}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {form.motDePasse.length > 0 && (
                                        <View style={styles.robustesseContainer}>
                                            <View style={styles.robustesseBg}>
                                                <Animated.View
                                                    style={[
                                                        styles.robustesseFill,
                                                        {
                                                            width: barWidth.interpolate({
                                                                inputRange: [0, 100],
                                                                outputRange: ["0%", "100%"],
                                                            }),
                                                            backgroundColor: barColor,
                                                        },
                                                    ]}
                                                />
                                            </View>
                                            <Text style={[styles.robustesseLabel, { color: barColor }]}>
                                                {robustesse.label}
                                            </Text>
                                        </View>
                                    )}
                                    {errors.motDePasse && (
                                        <Text style={styles.errorText}>{errors.motDePasse}</Text>
                                    )}
                                </View>

                                {/* Confirmer mot de passe */}
                                <View style={styles.mdpContainer}>
                                    <Text style={styles.inputLabel}>
                                        {t("auth.confirmer_mot_de_passe")}
                                        <Text style={styles.required}> *</Text>
                                    </Text>
                                    <View style={[
                                        styles.passwordWrapper,
                                        mdpConfFocus && styles.passwordWrapperFocused,
                                        errors.confirmerMdp ? styles.passwordWrapperError : null,
                                    ]}>
                                        <Lock
                                            size={20}
                                            color={mdpConfFocus ? colors.primary : colors.gray400}
                                            style={styles.lockIcon}
                                        />
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="••••••••"
                                            placeholderTextColor={colors.gray400}
                                            secureTextEntry={!mdpConfVisible}
                                            value={form.confirmerMdp}
                                            onChangeText={(v) => update("confirmerMdp", v)}
                                            onFocus={() => setMdpConfFocus(true)}
                                            onBlur={() => setMdpConfFocus(false)}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setMdpConfVisible(!mdpConfVisible)}
                                            style={styles.eyeButton}
                                            activeOpacity={0.7}
                                        >
                                            <Lock
                                                size={20}
                                                color={colors.gray400}
                                                weight={mdpConfVisible ? "fill" : "regular"}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {errors.confirmerMdp && (
                                        <Text style={styles.errorText}>{errors.confirmerMdp}</Text>
                                    )}
                                </View>
                            </>
                        )}
                    </View>

                    {/* ── Erreur API ── */}
                    {error && (
                        <View style={styles.apiError}>
                            <Text style={styles.apiErrorText}>
                                {t("auth.email_deja_utilise")}
                            </Text>
                        </View>
                    )}

                    {/* ── Boutons navigation ── */}
                    <View style={styles.botomsNav}>
                        {etape > 0 && (
                            <TouchableOpacity
                                style={styles.btnRetour}
                                onPress={handleRetour}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.btnRetourText}>← Retour</Text>
                            </TouchableOpacity>
                        )}

                        {etape < 3 ? (
                            <Button
                                label="Suivant →"
                                onPress={handleSuivant}
                                size="lg"
                                style={[styles.btnSuivant, etape === 0 && styles.btnSuivantFull]}
                            />
                        ) : (
                            <Button
                                label={t("auth.creer_compte")}
                                onPress={handleInscription}
                                loading={isPending}
                                size="lg"
                                style={styles.btnSuivant}
                            />
                        )}
                    </View>

                    {/* ── Lien connexion ── */}
                    <View style={styles.switchRow}>
                        <Text style={styles.switchText}>{t("auth.deja_compte")} </Text>
                        <TouchableOpacity onPress={() => router.replace("/(auth)/connexion")}>
                            <Text style={styles.switchLink}>{t("auth.se_connecter")}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, paddingBottom: 48 },

    // ─── Header (inchangé) ───────────────────────
    header: {
        backgroundColor: colors.primary,
        paddingTop: 70,
        paddingBottom: 50,
        paddingHorizontal: 28,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 12,
    },
    logoWrapper: { alignItems: "center", marginBottom: 12 },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.4)",
    },
    logoText: { fontSize: 22, fontWeight: "800", color: colors.white, letterSpacing: 1 },
    appName: {
        fontSize: 13,
        color: "rgba(255,255,255,0.75)",
        textAlign: "center",
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 6,
    },
    title: { fontSize: 30, fontWeight: "800", color: colors.white, textAlign: "center", letterSpacing: 0.5 },
    subtitle: { fontSize: 15, color: "rgba(255,255,255,0.8)", textAlign: "center", marginTop: 6 },

    // ─── Indicateur d'étapes ─────────────────────
    indicateur: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 8,
    },
    indicateurItem: {
        alignItems: "center",
        flex: 1,
        position: "relative",
    },
    indicateurPoint: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray100,
        borderWidth: 2,
        borderColor: colors.gray200,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    indicateurFait: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    indicateurActif: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    indicateurCheck: { fontSize: 14, color: colors.white, fontWeight: "700" },
    indicateurNum: { fontSize: 13, color: colors.gray400, fontWeight: "700" },
    indicateurNumActif: { color: colors.white },
    indicateurLabel: { fontSize: 10, color: colors.gray400, textAlign: "center", fontWeight: "600" },
    indicateurLabelActif: { color: colors.primary },
    indicateurLigne: {
        position: "absolute",
        top: 15,
        left: "50%",
        right: "-50%",
        height: 2,
        backgroundColor: colors.gray200,
        zIndex: -1,
    },
    indicateurLigneFaite: { backgroundColor: colors.success },

    // ─── Formulaire (inchangé) ───────────────────
    form: { paddingHorizontal: 24, paddingTop: 16 },
    section: {
        marginBottom: 24,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.gray800,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },

    // ─── Date picker bouton ───────────────────────
    fieldContainer: { marginBottom: 16 },
    inputLabel: { fontSize: 14, fontWeight: "600", color: colors.gray700, marginBottom: 6 },
    required: { color: colors.error, fontWeight: "700" },
    dateBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        minHeight: 52,
        paddingHorizontal: 14,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    dateBtnError: { borderColor: colors.error, backgroundColor: colors.errorLight },
    dateBtnIcon: { fontSize: 18, marginRight: 10 },
    dateBtnText: { flex: 1, fontSize: 15, color: colors.gray900, fontWeight: "500" },
    dateBtnPlaceholder: { color: colors.gray400, fontWeight: "400" },
    dateBtnChevron: { fontSize: 20, color: colors.gray400 },

    // ─── Modal iOS date picker ────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 30,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    modalTitre: { fontSize: 16, fontWeight: "700", color: colors.gray800 },
    modalAnnuler: { fontSize: 15, color: colors.gray500 },
    modalConfirmer: { fontSize: 15, color: colors.primary, fontWeight: "700" },

    // ─── Sexe (inchangé) ─────────────────────────
    sexeContainer: { marginBottom: 16 },
    sexeRow: { flexDirection: "row", gap: 12 },
    sexeBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        alignItems: "center",
        backgroundColor: colors.white,
    },
    sexeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
    sexeBtnText: { fontSize: 14, fontWeight: "600", color: colors.gray500 },
    sexeBtnTextActive: { color: colors.primary },

    // ─── Mot de passe (inchangé) ──────────────────
    mdpContainer: { marginBottom: 16 },
    passwordWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        minHeight: 52,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    passwordWrapperFocused: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    passwordWrapperError: { borderColor: colors.error, backgroundColor: colors.errorLight },
    lockIcon: { marginLeft: 14 },
    passwordInput: {
        flex: 1,
        fontSize: 15,
        color: colors.gray900,
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    eyeButton: { paddingRight: 14, paddingLeft: 8, paddingVertical: 14 },

    // ─── Robustesse (inchangée) ───────────────────
    robustesseContainer: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 10 },
    robustesseBg: { flex: 1, height: 6, backgroundColor: colors.gray100, borderRadius: 3, overflow: "hidden" },
    robustesseFill: { height: "100%", borderRadius: 3 },
    robustesseLabel: { fontSize: 12, fontWeight: "700", minWidth: 55, textAlign: "right" },

    // ─── Erreurs (inchangées) ─────────────────────
    errorText: { fontSize: 12, color: colors.error, fontWeight: "500", marginTop: 4 },
    apiError: {
        backgroundColor: colors.errorLight,
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: colors.error,
    },
    apiErrorText: { color: colors.error, fontSize: 13, fontWeight: "500" },

    // ─── Boutons navigation ───────────────────────
    botomsNav: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
        alignItems: "center",
    },
    btnRetour: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        backgroundColor: colors.white,
    },
    btnRetourText: { fontSize: 15, color: colors.gray600, fontWeight: "600" },
    btnSuivant: { flex: 1 },
    btnSuivantFull: { flex: 1 },

    // ─── Lien connexion (inchangé) ────────────────
    switchRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
    switchText: { fontSize: 14, color: colors.gray500 },
    switchLink: { fontSize: 14, color: colors.primary, fontWeight: "700" },
});
