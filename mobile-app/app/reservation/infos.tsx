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
    Switch,
    Image,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import {
    ArrowLeft,
    ArrowRight,
    User,
    Phone,
    EnvelopeSimple,
    IdentificationCard,
    Camera,
    CheckCircle,
    Warning,
    UserCircle,
    Checks,
    FileText,
} from "phosphor-react-native";
import { useReservationStore } from "@/store/reservationStore";
import AnimatedTrajet from "@/components/voyage/AnimatedTrajet";
import colors from "@/constants/colors";
import { formatPrix } from "@/utils/format";

// ─── Types ────────────────────────────────────────────────────
interface FormData {
    nomComplet: string;
    telephone: string;
    email: string;
    numeroPieceIdentite: string;
    cniRecto: string | null;
    cniVerso: string | null;
    passeport: string | null;
    typePiece: "cni" | "passeport";
    contactUrgenceNom: string;
    contactUrgenceTelephone: string;
    accepteConditions: boolean;
}

interface Errors {
    nomComplet?: string;
    telephone?: string;
    email?: string;
    numeroPieceIdentite?: string;
    cniRecto?: string;
    passeport?: string;
    accepteConditions?: string;
}

// ─── Indicateur d'étape ───────────────────────────────────────
function EtapeIndicateur({
    etapeActuelle,
    totalEtapes,
    couleur,
}: {
    etapeActuelle: number;
    totalEtapes: number;
    couleur: string;
}) {
    return (
        <View style={indicStyles.container}>
            {Array.from({ length: totalEtapes }).map((_, i) => (
                <Animated.View
                    key={i}
                    style={[
                        indicStyles.dot,
                        i + 1 === etapeActuelle
                            ? [
                                  indicStyles.dotActive,
                                  { backgroundColor: couleur },
                              ]
                            : i + 1 < etapeActuelle
                            ? [
                                  indicStyles.dotDone,
                                  { backgroundColor: couleur + "60" },
                              ]
                            : indicStyles.dotInactive,
                    ]}
                />
            ))}
        </View>
    );
}

const indicStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    dotActive: {
        width: 22,
    },
    dotDone: {
        width: 10,
    },
    dotInactive: {
        width: 10,
        backgroundColor: "rgba(255,255,255,0.3)",
    },
});

// ─── Champ formulaire ─────────────────────────────────────────
function ChampFormulaire({
    label,
    valeur,
    onChange,
    placeholder,
    erreur,
    icone,
    keyboardType = "default",
    autoCapitalize = "words",
    obligatoire = false,
    couleur,
}: {
    label: string;
    valeur: string;
    onChange: (v: string) => void;
    placeholder: string;
    erreur?: string;
    icone: React.ReactNode;
    keyboardType?: any;
    autoCapitalize?: any;
    obligatoire?: boolean;
    couleur: string;
}) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={champStyles.container}>
            <View style={champStyles.labelRow}>
                <Text style={champStyles.label}>{label}</Text>
                {obligatoire ? (
                    <Text style={champStyles.required}> *</Text>
                ) : null}
            </View>
            <View
                style={[
                    champStyles.inputWrapper,
                    focused
                        ? {
                              borderColor: couleur,
                              shadowColor: couleur,
                              shadowOpacity: 0.15,
                              shadowRadius: 6,
                              elevation: 3,
                          }
                        : null,
                    erreur ? champStyles.inputError : null,
                ]}
            >
                <View style={champStyles.iconContainer}>
                    {icone}
                </View>
                <TextInput
                    style={champStyles.input}
                    value={valeur}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={colors.gray400}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            </View>
            {erreur ? (
                <View style={champStyles.erreurRow}>
                    <Warning
                        size={12}
                        color={colors.error}
                    />
                    <Text style={champStyles.erreurText}>
                        {erreur}
                    </Text>
                </View>
            ) : null}
        </View>
    );
}

const champStyles = StyleSheet.create({
    container: { marginBottom: 14 },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.gray700,
    },
    required: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.error,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        minHeight: 50,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    inputError: {
        borderColor: colors.error,
        backgroundColor: colors.errorLight,
    },
    iconContainer: {
        paddingLeft: 14,
        paddingRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: colors.gray900,
        paddingVertical: 12,
        paddingRight: 14,
    },
    erreurRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 4,
    },
    erreurText: {
        fontSize: 11,
        color: colors.error,
        fontWeight: "500",
    },
});

// ─── Écran principal ──────────────────────────────────────────
export default function InfosScreen() {
    const router  = useRouter();
    const { t }   = useTranslation();
    const {
        voyageSelectionne,
        siegeSelectionne,
        setInfosVoyageur,
    } = useReservationStore();

    const couleur = colors.primary;

    // Étapes : 1=infos, 2=pièce identité, 3=urgence, 4=conditions
    const [etape, setEtape] = useState(1);
    const TOTAL_ETAPES      = 4;

    const [form, setForm] = useState<FormData>({
        nomComplet: "",
        telephone: "",
        email: "",
        numeroPieceIdentite: "",
        cniRecto: null,
        cniVerso: null,
        passeport: null,
        typePiece: "cni",
        contactUrgenceNom: "",
        contactUrgenceTelephone: "",
        accepteConditions: false,
    });

    const [errors, setErrors] = useState<Errors>({});

    // Animations
    const slideX   = useRef(new Animated.Value(0)).current;
    const headerOp = useRef(new Animated.Value(0)).current;
    const headerY  = useRef(new Animated.Value(-30)).current;

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

    // Animation changement étape
    function animerEtape(direction: "next" | "prev") {
        const toValue = direction === "next" ? -30 : 30;
        Animated.sequence([
            Animated.timing(slideX, {
                toValue,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(slideX, {
                toValue: direction === "next" ? 30 : -30,
                duration: 0,
                useNativeDriver: true,
            }),
            Animated.spring(slideX, {
                toValue: 0,
                tension: 80,
                friction: 9,
                useNativeDriver: true,
            }),
        ]).start();
    }

    function update(key: keyof FormData, value: any) {
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    }

    // ─── Validation par étape ─────────────────────
    function validerEtape1(): boolean {
        const e: Errors = {};
        if (!form.nomComplet.trim())
            e.nomComplet = t("common.obligatoire");
        if (!form.telephone.trim())
            e.telephone = t("common.obligatoire");
        if (!form.email.trim())
            e.email = t("common.obligatoire");
        else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        )
            e.email = t("auth.email_invalide");
        if (!form.numeroPieceIdentite.trim())
            e.numeroPieceIdentite = t("common.obligatoire");
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function validerEtape2(): boolean {
        const e: Errors = {};
        if (form.typePiece === "cni" && !form.cniRecto)
            e.cniRecto = "Photo CNI recto obligatoire";
        if (form.typePiece === "passeport" && !form.passeport)
            e.passeport = "Photo passeport obligatoire";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function validerEtape4(): boolean {
        if (!form.accepteConditions) {
            setErrors({
                accepteConditions: t(
                    "reservation.conditions_requises"
                ),
            });
            return false;
        }
        return true;
    }

    function etapeSuivante() {
        let valide = true;
        if (etape === 1) valide = validerEtape1();
        if (etape === 2) valide = validerEtape2();
        if (etape === 4) valide = validerEtape4();

        if (!valide) return;

        if (etape < TOTAL_ETAPES) {
            animerEtape("next");
            setEtape((e) => e + 1);
        } else {
            // Sauvegarder et continuer
            setInfosVoyageur({
                voyageId: voyageSelectionne?.id ?? 1,
                siegeId: siegeSelectionne?.id ?? 1,
                nomComplet: form.nomComplet,
                telephone: form.telephone,
                email: form.email,
                numeroPieceIdentite: form.numeroPieceIdentite,
                contactUrgenceNom:
                    form.contactUrgenceNom || undefined,
                contactUrgenceTelephone:
                    form.contactUrgenceTelephone || undefined,
                accepteConditions: form.accepteConditions,
            });
            router.push("/reservation/paiement" as any);
        }
    }

    function etapePrecedente() {
        if (etape > 1) {
            animerEtape("prev");
            setEtape((e) => e - 1);
        } else {
            router.back();
        }
    }

    // ─── Upload photo ─────────────────────────────
    async function uploadPhoto(
        cible: "cniRecto" | "cniVerso" | "passeport"
    ) {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission requise",
                "Accès à la galerie nécessaire"
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync(
            {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            }
        );

        if (!result.canceled && result.assets[0]) {
            update(cible, result.assets[0].uri);
        }
    }

    // ─── Titre par étape ──────────────────────────
    function getTitre(): string {
        if (etape === 1) return t("reservation.infos_voyageur");
        if (etape === 2) return t("reservation.upload_piece");
        if (etape === 3)
            return t("reservation.contact_urgence_titre");
        return t("reservation.conditions_titre");
    }

    // Données voyage mock
    const voyage = voyageSelectionne ?? ({
        villeDepart: "Douala",
        villeArrivee: "Yaoundé",
        heureDepart: "06:00",
        heureArriveeEstimee: "10:00",
        dureeEstimee: "4h00",
        prixNormal: 5000,
        prixPromo: 4500,
        devise: "FCFA",
    } as any);

    const siege = siegeSelectionne ?? {
        numeroSiege: "A3",
    };

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
                            onPress={etapePrecedente}
                            style={styles.backBtn}
                            activeOpacity={0.8}
                        >
                            <ArrowLeft
                                size={20}
                                color={colors.white}
                                weight="bold"
                            />
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <Text style={styles.headerTitre}>
                                {getTitre()}
                            </Text>
                            <EtapeIndicateur
                                etapeActuelle={etape}
                                totalEtapes={TOTAL_ETAPES}
                                couleur="white"
                            />
                        </View>
                        <View style={styles.etapeBadge}>
                            <Text style={styles.etapeText}>
                                {etape}/{TOTAL_ETAPES}
                            </Text>
                        </View>
                    </View>

                    {/* Résumé trajet */}
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
                        <View style={styles.siegeRow}>
                            <Text style={styles.siegeLabel}>
                                Siège :{" "}
                            </Text>
                            <Text style={styles.siegeNum}>
                                {siege.numeroSiege}
                            </Text>
                            <Text style={styles.prixText}>
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

            {/* ── Contenu ── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View
                    style={{
                        transform: [{ translateX: slideX }],
                    }}
                >
                    {/* ── Étape 1 : Infos voyageur ── */}
                    {etape === 1 ? (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View
                                    style={[
                                        styles.sectionIconCircle,
                                        {
                                            backgroundColor:
                                                couleur + "15",
                                        },
                                    ]}
                                >
                                    <User
                                        size={20}
                                        color={couleur}
                                        weight="fill"
                                    />
                                </View>
                                <Text style={styles.sectionTitre}>
                                    {t(
                                        "reservation.infos_voyageur"
                                    )}
                                </Text>
                            </View>

                            <ChampFormulaire
                                label={t(
                                    "reservation.nom_complet"
                                )}
                                valeur={form.nomComplet}
                                onChange={(v) =>
                                    update("nomComplet", v)
                                }
                                placeholder="Jean Mbarga"
                                erreur={errors.nomComplet}
                                icone={
                                    <UserCircle
                                        size={18}
                                        color={colors.gray400}
                                    />
                                }
                                obligatoire
                                couleur={couleur}
                            />

                            <ChampFormulaire
                                label={t("reservation.telephone")}
                                valeur={form.telephone}
                                onChange={(v) =>
                                    update("telephone", v)
                                }
                                placeholder="+237 690 000 000"
                                erreur={errors.telephone}
                                icone={
                                    <Phone
                                        size={18}
                                        color={colors.gray400}
                                    />
                                }
                                keyboardType="phone-pad"
                                autoCapitalize="none"
                                obligatoire
                                couleur={couleur}
                            />

                            <ChampFormulaire
                                label={t("reservation.email")}
                                valeur={form.email}
                                onChange={(v) =>
                                    update("email", v)
                                }
                                placeholder="jean@email.com"
                                erreur={errors.email}
                                icone={
                                    <EnvelopeSimple
                                        size={18}
                                        color={colors.gray400}
                                    />
                                }
                                keyboardType="email-address"
                                autoCapitalize="none"
                                obligatoire
                                couleur={couleur}
                            />

                            <ChampFormulaire
                                label={t(
                                    "reservation.numero_piece"
                                )}
                                valeur={form.numeroPieceIdentite}
                                onChange={(v) =>
                                    update(
                                        "numeroPieceIdentite",
                                        v
                                    )
                                }
                                placeholder="123456789"
                                erreur={errors.numeroPieceIdentite}
                                icone={
                                    <IdentificationCard
                                        size={18}
                                        color={colors.gray400}
                                    />
                                }
                                autoCapitalize="characters"
                                obligatoire
                                couleur={couleur}
                            />
                        </View>
                    ) : null}

                    {/* ── Étape 2 : Pièce identité ── */}
                    {etape === 2 ? (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View
                                    style={[
                                        styles.sectionIconCircle,
                                        {
                                            backgroundColor:
                                                couleur + "15",
                                        },
                                    ]}
                                >
                                    <IdentificationCard
                                        size={20}
                                        color={couleur}
                                        weight="fill"
                                    />
                                </View>
                                <Text style={styles.sectionTitre}>
                                    {t("reservation.upload_piece")}
                                </Text>
                            </View>

                            {/* Type de pièce */}
                            <View style={styles.typePieceRow}>
                                {[
                                    {
                                        key: "cni",
                                        label: "CNI",
                                    },
                                    {
                                        key: "passeport",
                                        label: t(
                                            "reservation.passeport"
                                        ),
                                    },
                                ].map((type) => (
                                    <TouchableOpacity
                                        key={type.key}
                                        onPress={() =>
                                            update(
                                                "typePiece",
                                                type.key
                                            )
                                        }
                                        style={[
                                            styles.typePieceBtn,
                                            form.typePiece ===
                                                type.key && {
                                                borderColor:
                                                    couleur,
                                                backgroundColor:
                                                    couleur +
                                                    "10",
                                            },
                                        ]}
                                        activeOpacity={0.8}
                                    >
                                        {form.typePiece ===
                                        type.key ? (
                                            <CheckCircle
                                                size={16}
                                                color={couleur}
                                                weight="fill"
                                            />
                                        ) : (
                                            <View
                                                style={
                                                    styles.radioCircle
                                                }
                                            />
                                        )}
                                        <Text
                                            style={[
                                                styles.typePieceText,
                                                form.typePiece ===
                                                    type.key && {
                                                    color: couleur,
                                                },
                                            ]}
                                        >
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Upload CNI */}
                            {form.typePiece === "cni" ? (
                                <View style={styles.uploadGroup}>
                                    {/* Recto */}
                                    <View style={styles.uploadItem}>
                                        <Text
                                            style={
                                                styles.uploadLabel
                                            }
                                        >
                                            {t(
                                                "reservation.cni_recto"
                                            )}{" "}
                                            *
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                uploadPhoto(
                                                    "cniRecto"
                                                )
                                            }
                                            style={[
                                                styles.uploadBtn,
                                                form.cniRecto &&
                                                    styles.uploadBtnDone,
                                                errors.cniRecto &&
                                                    styles.uploadBtnError,
                                            ]}
                                            activeOpacity={0.85}
                                        >
                                            {form.cniRecto ? (
                                                <Image
                                                    source={{
                                                        uri: form.cniRecto,
                                                    }}
                                                    style={
                                                        styles.uploadPreview
                                                    }
                                                />
                                            ) : (
                                                <View
                                                    style={
                                                        styles.uploadPlaceholder
                                                    }
                                                >
                                                    <Camera
                                                        size={28}
                                                        color={
                                                            errors.cniRecto
                                                                ? colors.error
                                                                : colors.gray400
                                                        }
                                                        weight="fill"
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.uploadPlaceholderText,
                                                            errors.cniRecto && {
                                                                color: colors.error,
                                                            },
                                                        ]}
                                                    >
                                                        {t(
                                                            "reservation.uploader_photo"
                                                        )}
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                        {form.cniRecto ? (
                                            <View
                                                style={
                                                    styles.uploadedBadge
                                                }
                                            >
                                                <CheckCircle
                                                    size={13}
                                                    color={
                                                        colors.success
                                                    }
                                                    weight="fill"
                                                />
                                                <Text
                                                    style={
                                                        styles.uploadedText
                                                    }
                                                >
                                                    {t(
                                                        "reservation.photo_uploadee"
                                                    )}
                                                </Text>
                                            </View>
                                        ) : null}
                                        {errors.cniRecto ? (
                                            <Text
                                                style={
                                                    styles.uploadErreur
                                                }
                                            >
                                                {errors.cniRecto}
                                            </Text>
                                        ) : null}
                                    </View>

                                    {/* Verso */}
                                    <View style={styles.uploadItem}>
                                        <Text
                                            style={
                                                styles.uploadLabel
                                            }
                                        >
                                            {t(
                                                "reservation.cni_verso"
                                            )}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                uploadPhoto(
                                                    "cniVerso"
                                                )
                                            }
                                            style={[
                                                styles.uploadBtn,
                                                form.cniVerso &&
                                                    styles.uploadBtnDone,
                                            ]}
                                            activeOpacity={0.85}
                                        >
                                            {form.cniVerso ? (
                                                <Image
                                                    source={{
                                                        uri: form.cniVerso,
                                                    }}
                                                    style={
                                                        styles.uploadPreview
                                                    }
                                                />
                                            ) : (
                                                <View
                                                    style={
                                                        styles.uploadPlaceholder
                                                    }
                                                >
                                                    <Camera
                                                        size={28}
                                                        color={
                                                            colors.gray400
                                                        }
                                                        weight="fill"
                                                    />
                                                    <Text
                                                        style={
                                                            styles.uploadPlaceholderText
                                                        }
                                                    >
                                                        {t(
                                                            "reservation.uploader_photo"
                                                        )}
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                        {form.cniVerso ? (
                                            <View
                                                style={
                                                    styles.uploadedBadge
                                                }
                                            >
                                                <CheckCircle
                                                    size={13}
                                                    color={
                                                        colors.success
                                                    }
                                                    weight="fill"
                                                />
                                                <Text
                                                    style={
                                                        styles.uploadedText
                                                    }
                                                >
                                                    {t(
                                                        "reservation.photo_uploadee"
                                                    )}
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            ) : null}

                            {/* Upload Passeport */}
                            {form.typePiece === "passeport" ? (
                                <View style={styles.uploadGroup}>
                                    <View style={styles.uploadItem}>
                                        <Text
                                            style={
                                                styles.uploadLabel
                                            }
                                        >
                                            {t(
                                                "reservation.passeport"
                                            )}{" "}
                                            *
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                uploadPhoto(
                                                    "passeport"
                                                )
                                            }
                                            style={[
                                                styles.uploadBtnLarge,
                                                form.passeport &&
                                                    styles.uploadBtnDone,
                                                errors.passeport &&
                                                    styles.uploadBtnError,
                                            ]}
                                            activeOpacity={0.85}
                                        >
                                            {form.passeport ? (
                                                <Image
                                                    source={{
                                                        uri: form.passeport,
                                                    }}
                                                    style={
                                                        styles.uploadPreviewLarge
                                                    }
                                                />
                                            ) : (
                                                <View
                                                    style={
                                                        styles.uploadPlaceholder
                                                    }
                                                >
                                                    <Camera
                                                        size={36}
                                                        color={
                                                            errors.passeport
                                                                ? colors.error
                                                                : colors.gray400
                                                        }
                                                        weight="fill"
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.uploadPlaceholderText,
                                                            errors.passeport && {
                                                                color: colors.error,
                                                            },
                                                        ]}
                                                    >
                                                        {t(
                                                            "reservation.uploader_photo"
                                                        )}
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                        {errors.passeport ? (
                                            <Text
                                                style={
                                                    styles.uploadErreur
                                                }
                                            >
                                                {errors.passeport}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    ) : null}

                    {/* ── Étape 3 : Contact urgence ── */}
                    {etape === 3 ? (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View
                                    style={[
                                        styles.sectionIconCircle,
                                        {
                                            backgroundColor:
                                                couleur + "15",
                                        },
                                    ]}
                                >
                                    <Phone
                                        size={20}
                                        color={couleur}
                                        weight="fill"
                                    />
                                </View>
                                <View>
                                    <Text
                                        style={styles.sectionTitre}
                                    >
                                        {t(
                                            "reservation.contact_urgence_titre"
                                        )}
                                    </Text>
                                    <Text
                                        style={styles.sectionSousTitre}
                                    >
                                        {t(
                                            "reservation.contact_urgence"
                                        )}
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={[
                                    styles.optionnelBanner,
                                    {
                                        backgroundColor:
                                            couleur + "0D",
                                        borderColor:
                                            couleur + "30",
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.optionnelText,
                                        { color: couleur },
                                    ]}
                                >
                                    Cette étape est optionnelle
                                    mais recommandée
                                </Text>
                            </View>

                            <ChampFormulaire
                                label={t(
                                    "reservation.contact_urgence_nom"
                                )}
                                valeur={form.contactUrgenceNom}
                                onChange={(v) =>
                                    update("contactUrgenceNom", v)
                                }
                                placeholder="Marie Mbarga"
                                icone={
                                    <User
                                        size={18}
                                        color={colors.gray400}
                                    />
                                }
                                couleur={couleur}
                            />

                            <ChampFormulaire
                                label={t(
                                    "reservation.contact_urgence_tel"
                                )}
                                valeur={
                                    form.contactUrgenceTelephone
                                }
                                onChange={(v) =>
                                    update(
                                        "contactUrgenceTelephone",
                                        v
                                    )
                                }
                                placeholder="+237 699 000 000"
                                icone={
                                    <Phone
                                        size={18}
                                        color={colors.gray400}
                                    />
                                }
                                keyboardType="phone-pad"
                                autoCapitalize="none"
                                couleur={couleur}
                            />
                        </View>
                    ) : null}

                    {/* ── Étape 4 : Conditions ── */}
                    {etape === 4 ? (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View
                                    style={[
                                        styles.sectionIconCircle,
                                        {
                                            backgroundColor:
                                                couleur + "15",
                                        },
                                    ]}
                                >
                                    <FileText
                                        size={20}
                                        color={couleur}
                                        weight="fill"
                                    />
                                </View>
                                <Text style={styles.sectionTitre}>
                                    {t(
                                        "reservation.conditions_titre"
                                    )}
                                </Text>
                            </View>

                            {/* Récap réservation */}
                            <View
                                style={[
                                    styles.recapCard,
                                    {
                                        borderColor:
                                            couleur + "30",
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.recapTitre,
                                        { color: couleur },
                                    ]}
                                >
                                    {t("reservation.recap")}
                                </Text>

                                {[
                                    {
                                        label: "Voyageur",
                                        value: form.nomComplet,
                                    },
                                    {
                                        label: "Trajet",
                                        value: `${voyage.villeDepart} → ${voyage.villeArrivee}`,
                                    },
                                    {
                                        label: "Date",
                                        value:
                                            (voyage as any)
                                                .dateDepart ??
                                            "—",
                                    },
                                    {
                                        label: "Heure départ",
                                        value: voyage.heureDepart,
                                    },
                                    {
                                        label: "Siège",
                                        value:
                                            siege.numeroSiege,
                                    },
                                    {
                                        label: "Prix",
                                        value: formatPrix(
                                            voyage.prixPromo ??
                                                voyage.prixNormal,
                                            voyage.devise
                                        ),
                                    },
                                ].map((item, i) => (
                                    <View
                                        key={i}
                                        style={styles.recapRow}
                                    >
                                        <Text
                                            style={
                                                styles.recapLabel
                                            }
                                        >
                                            {item.label}
                                        </Text>
                                        <Text
                                            style={
                                                styles.recapValue
                                            }
                                        >
                                            {item.value}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Conditions texte */}
                            <View style={styles.conditionsBox}>
                                <Text
                                    style={styles.conditionsTitre}
                                >
                                    Conditions générales
                                </Text>
                                <Text
                                    style={styles.conditionsTexte}
                                >
                                    En réservant ce voyage, vous
                                    acceptez que :{"\n\n"}•
                                    L'annulation est possible
                                    jusqu'à 24h avant le départ.
                                    {"\n"}• Aucun remboursement
                                    après cette limite.{"\n"}•
                                    Une pièce d'identité valide
                                    est obligatoire à
                                    l'embarquement.{"\n"}• Le
                                    billet est nominatif et non
                                    transférable.{"\n"}•
                                    L'agence se réserve le droit
                                    d'annuler un voyage en cas de
                                    force majeure.
                                </Text>
                            </View>

                            {/* Checkbox acceptation */}
                            <TouchableOpacity
                                onPress={() =>
                                    update(
                                        "accepteConditions",
                                        !form.accepteConditions
                                    )
                                }
                                style={[
                                    styles.checkboxRow,
                                    form.accepteConditions && {
                                        borderColor: couleur,
                                        backgroundColor:
                                            couleur + "0A",
                                    },
                                    errors.accepteConditions && {
                                        borderColor: colors.error,
                                        backgroundColor:
                                            colors.errorLight,
                                    },
                                ]}
                                activeOpacity={0.8}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        form.accepteConditions && {
                                            backgroundColor:
                                                couleur,
                                            borderColor: couleur,
                                        },
                                    ]}
                                >
                                    {form.accepteConditions ? (
                                        <Checks
                                            size={14}
                                            color={colors.white}
                                            weight="bold"
                                        />
                                    ) : null}
                                </View>
                                <Text
                                    style={[
                                        styles.checkboxText,
                                        form.accepteConditions && {
                                            color: couleur,
                                        },
                                    ]}
                                >
                                    {t(
                                        "reservation.accepter_conditions"
                                    )}
                                </Text>
                            </TouchableOpacity>

                            {errors.accepteConditions ? (
                                <Text style={styles.condErreur}>
                                    {errors.accepteConditions}
                                </Text>
                            ) : null}
                        </View>
                    ) : null}
                </Animated.View>
            </ScrollView>

            {/* ── Bouton navigation ── */}
            <View style={styles.navContainer}>
                <TouchableOpacity
                    onPress={etapeSuivante}
                    style={[
                        styles.nextBtn,
                        { backgroundColor: couleur },
                    ]}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextBtnText}>
                        {etape === TOTAL_ETAPES
                            ? t("paiement.titre")
                            : t("common.suivant")}
                    </Text>
                    <ArrowRight
                        size={18}
                        color={colors.white}
                        weight="bold"
                    />
                </TouchableOpacity>
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
        paddingBottom: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: {
        alignItems: "center",
        gap: 6,
    },
    headerTitre: {
        fontSize: 16,
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
        gap: 6,
    },
    siegeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    siegeLabel: {
        fontSize: 12,
        color: "rgba(255,255,255,0.75)",
    },
    siegeNum: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.white,
    },
    prixText: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.white,
        marginLeft: "auto",
    },

    // ─── Scroll ───────────────────────────────────
    scroll: { flex: 1 },
    scrollContent: {
        paddingBottom: 100,
        paddingTop: 16,
    },

    // ─── Section ──────────────────────────────────
    section: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 20,
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
    },
    sectionIconCircle: {
        width: 42,
        height: 42,
        borderRadius: 13,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitre: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.gray900,
    },
    sectionSousTitre: {
        fontSize: 12,
        color: colors.gray400,
        fontWeight: "500",
    },

    // ─── Type pièce ──────────────────────────────
    typePieceRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },
    typePieceBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        backgroundColor: colors.gray50,
    },
    radioCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: colors.gray300,
    },
    typePieceText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.gray600,
    },

    // ─── Upload ───────────────────────────────────
    uploadGroup: {
        flexDirection: "row",
        gap: 12,
    },
    uploadItem: {
        flex: 1,
        gap: 6,
    },
    uploadLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.gray700,
    },
    uploadBtn: {
        height: 120,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        borderStyle: "dashed",
        backgroundColor: colors.gray50,
        overflow: "hidden",
    },
    uploadBtnLarge: {
        height: 160,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        borderStyle: "dashed",
        backgroundColor: colors.gray50,
        overflow: "hidden",
    },
    uploadBtnDone: {
        borderStyle: "solid",
        borderColor: colors.success,
    },
    uploadBtnError: {
        borderColor: colors.error,
        backgroundColor: colors.errorLight,
    },
    uploadPreview: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    uploadPreviewLarge: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    uploadPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
    },
    uploadPlaceholderText: {
        fontSize: 11,
        color: colors.gray400,
        fontWeight: "500",
        textAlign: "center",
    },
    uploadedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    uploadedText: {
        fontSize: 11,
        color: colors.success,
        fontWeight: "600",
    },
    uploadErreur: {
        fontSize: 11,
        color: colors.error,
        fontWeight: "500",
    },

    // ─── Optionnel banner ─────────────────────────
    optionnelBanner: {
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    optionnelText: {
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
    },

    // ─── Récap ────────────────────────────────────
    recapCard: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
        gap: 10,
    },
    recapTitre: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 4,
    },
    recapRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    recapLabel: {
        fontSize: 12,
        color: colors.gray500,
        fontWeight: "500",
    },
    recapValue: {
        fontSize: 13,
        color: colors.gray800,
        fontWeight: "700",
    },

    // ─── Conditions ──────────────────────────────
    conditionsBox: {
        backgroundColor: colors.gray50,
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        gap: 8,
    },
    conditionsTitre: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.gray700,
    },
    conditionsTexte: {
        fontSize: 12,
        color: colors.gray500,
        lineHeight: 20,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        backgroundColor: colors.white,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.gray300,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: colors.gray600,
    },
    condErreur: {
        fontSize: 12,
        color: colors.error,
        fontWeight: "500",
        marginTop: 6,
    },

    // ─── Navigation ──────────────────────────────
    navContainer: {
        position: "absolute",
        bottom: 24,
        left: 16,
        right: 16,
    },
    nextBtn: {
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
    nextBtnText: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.white,
    },
});