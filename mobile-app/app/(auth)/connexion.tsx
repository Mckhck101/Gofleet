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
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    EnvelopeSimple,
    Lock,
    Eye,
    EyeSlash,
} from "phosphor-react-native";
import Button from "@/components/ui/Button";
import PasswordMascot from "@/components/ui/PasswordMascot";
import { useConnexion } from "@/hooks/useAuth";
import colors from "@/constants/colors";

export default function ConnexionScreen() {
    const { t }   = useTranslation();
    const router  = useRouter();
    const { mutate: connecter, isPending, error } = useConnexion();

    const [email, setEmail]         = useState("");
    const [motDePasse, setMotDePasse] = useState("");
    const [errors, setErrors]       = useState<Record<string, string>>({});
    const [mdpFocus, setMdpFocus]   = useState(false);
    const [mdpVisible, setMdpVisible] = useState(false);

    const titleOpacity   = useRef(new Animated.Value(0)).current;
    const titleTranslate = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(titleOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(titleTranslate, {
                toValue: 0,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    function valider(): boolean {
        const e: Record<string, string> = {};
        if (!email.trim())
            e.email = t("common.obligatoire");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            e.email = t("auth.email_invalide");
        if (!motDePasse)
            e.motDePasse = t("common.obligatoire");
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleConnexion() {
        if (!valider()) return;
        connecter(
            { email: email.trim(), motDePasse },
            {
                onSuccess: () => {
                    router.replace("/bienvenue" as any);
                },
            }
        );
    }

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
                            alignItems: "center",
                        }}
                    >
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>RV</Text>
                        </View>
                        <Text style={styles.appName}>
                            {t("common.appName")}
                        </Text>
                        <Text style={styles.title}>
                            {t("auth.connexion")}
                        </Text>
                        <Text style={styles.subtitle}>
                            Bon retour parmi nous
                        </Text>
                    </Animated.View>
                </View>

                {/* ── Formulaire ── */}
                <View style={styles.form}>

                    {/* Mascot */}
                    <PasswordMascot
                        visible={mdpFocus}
                        eyesOpen={mdpVisible}
                        color="blue"
                    />

                    {/* Email */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>
                            {t("auth.email")}
                            <Text style={styles.required}> *</Text>
                        </Text>
                        <View
                            style={[
                                styles.inputWrapper,
                                errors.email
                                    ? styles.inputError
                                    : null,
                            ]}
                        >
                            <EnvelopeSimple
                                size={20}
                                color={colors.gray400}
                                style={styles.iconLeft}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="jean.mbarga@gmail.com"
                                placeholderTextColor={colors.gray400}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={(v) => {
                                    setEmail(v);
                                    setErrors((e) => ({
                                        ...e,
                                        email: "",
                                    }));
                                }}
                            />
                        </View>
                        {errors.email ? (
                            <Text style={styles.errorText}>
                                {errors.email}
                            </Text>
                        ) : null}
                    </View>

                    {/* Mot de passe */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>
                            {t("auth.mot_de_passe")}
                            <Text style={styles.required}> *</Text>
                        </Text>
                        <View
                            style={[
                                styles.inputWrapper,
                                mdpFocus && styles.inputFocused,
                                errors.motDePasse
                                    ? styles.inputError
                                    : null,
                            ]}
                        >
                            <Lock
                                size={20}
                                color={
                                    mdpFocus
                                        ? colors.primary
                                        : colors.gray400
                                }
                                style={styles.iconLeft}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={colors.gray400}
                                secureTextEntry={!mdpVisible}
                                value={motDePasse}
                                onChangeText={(v) => {
                                    setMotDePasse(v);
                                    setErrors((e) => ({
                                        ...e,
                                        motDePasse: "",
                                    }));
                                }}
                                onFocus={() => setMdpFocus(true)}
                                onBlur={() => setMdpFocus(false)}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() =>
                                    setMdpVisible(!mdpVisible)
                                }
                                style={styles.eyeBtn}
                                activeOpacity={0.7}
                            >
                                {mdpVisible ? (
                                    <EyeSlash
                                        size={20}
                                        color={colors.gray400}
                                    />
                                ) : (
                                    <Eye
                                        size={20}
                                        color={colors.gray400}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                        {errors.motDePasse ? (
                            <Text style={styles.errorText}>
                                {errors.motDePasse}
                            </Text>
                        ) : null}
                    </View>

                    {/* Mot de passe oublié */}
                    <TouchableOpacity
                        style={styles.forgotBtn}
                        onPress={() =>
                            router.push(
                                "/(auth)/mot-de-passe-oublie" as any
                            )
                        }
                    >
                        <Text style={styles.forgotText}>
                            {t("auth.mot_de_passe_oublie")}
                        </Text>
                    </TouchableOpacity>

                    {/* Erreur API */}
                    {error ? (
                        <View style={styles.apiError}>
                            <Text style={styles.apiErrorText}>
                                {t("auth.identifiants_incorrects")}
                            </Text>
                        </View>
                    ) : null}

                    {/* Bouton */}
                    <Button
                        label={t("auth.se_connecter")}
                        onPress={handleConnexion}
                        loading={isPending}
                        size="lg"
                        style={styles.submitBtn}
                    />

                    {/* Lien inscription */}
                    <View style={styles.switchRow}>
                        <Text style={styles.switchText}>
                            {t("auth.pas_de_compte")}{" "}
                        </Text>
                        <TouchableOpacity
                            onPress={() =>
                                router.replace(
                                    "/(auth)/inscription" as any
                                )
                            }
                        >
                            <Text style={styles.switchLink}>
                                {t("auth.creer_compte")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, paddingBottom: 70 },

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
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.4)",
        marginBottom: 12,
    },
    logoText: {
        fontSize: 22,
        fontWeight: "800",
        color: colors.white,
        letterSpacing: 1,
    },
    appName: {
        fontSize: 13,
        color: "rgba(255,255,255,0.75)",
        textAlign: "center",
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 6,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        color: colors.white,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: "rgba(255,255,255,0.8)",
        textAlign: "center",
        marginTop: 6,
    },

    form: { paddingHorizontal: 24, paddingTop: 24 },

    fieldContainer: { marginBottom: 16 },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.gray700,
        marginBottom: 6,
    },
    required: { color: colors.error, fontWeight: "700" },
    inputWrapper: {
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
    inputFocused: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    inputError: {
        borderColor: colors.error,
        backgroundColor: colors.errorLight,
    },
    iconLeft: { marginLeft: 14 },
    input: {
        flex: 1,
        fontSize: 15,
        color: colors.gray900,
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    eyeBtn: {
        paddingRight: 14,
        paddingLeft: 8,
        paddingVertical: 14,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        fontWeight: "500",
        marginTop: 4,
    },

    forgotBtn: {
        alignSelf: "flex-end",
        marginBottom: 16,
    },
    forgotText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: "600",
    },

    apiError: {
        backgroundColor: colors.errorLight,
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: colors.error,
    },
    apiErrorText: {
        color: colors.error,
        fontSize: 13,
        fontWeight: "500",
    },

    submitBtn: { marginBottom: 20 },

    switchRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    switchText: { fontSize: 14, color: colors.gray500 },
    switchLink: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: "700",
    },
});