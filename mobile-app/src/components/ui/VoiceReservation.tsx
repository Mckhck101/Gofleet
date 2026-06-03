import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
    ActivityIndicator,
} from "react-native";
import {
    Microphone,
    MicrophoneSlash,
    X,
    Robot,
    Waveform,
} from "phosphor-react-native";
import * as Speech from "expo-speech";
import { useSearchStore } from "@/store/searchStore";
import { useRouter } from "expo-router";
import colors from "@/constants/colors";

const { width: W } = Dimensions.get("window");

interface VoiceReservationProps {
    visible: boolean;
    onClose: () => void;
}

type VoiceState =
    | "idle"
    | "listening"
    | "processing"
    | "done"
    | "error";

export default function VoiceReservation({
    visible,
    onClose,
}: VoiceReservationProps) {
    const router                   = useRouter();
    const { setVilleDepart, setVilleArrivee, setDateDepart } =
        useSearchStore();

    const [state, setState]         = useState<VoiceState>("idle");
    const [transcript, setTranscript] = useState("");
    const [message, setMessage]     = useState(
        "Appuyez sur le micro et dites votre destination"
    );

    // Animations
    const scale    = useRef(new Animated.Value(0)).current;
    const micScale = useRef(new Animated.Value(1)).current;
    const wave1    = useRef(new Animated.Value(0.3)).current;
    const wave2    = useRef(new Animated.Value(0.3)).current;
    const wave3    = useRef(new Animated.Value(0.3)).current;
    const wave4    = useRef(new Animated.Value(0.3)).current;
    const wave5    = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scale, {
                toValue: 1,
                tension: 65,
                friction: 9,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(scale, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
            setState("idle");
            setTranscript("");
            setMessage(
                "Appuyez sur le micro et dites votre destination"
            );
        }
    }, [visible]);

    // Animation ondes
    useEffect(() => {
        if (state === "listening") {
            const waves = [wave1, wave2, wave3, wave4, wave5];
            const anims = waves.map((w, i) =>
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(i * 80),
                        Animated.timing(w, {
                            toValue: 1,
                            duration: 350,
                            useNativeDriver: true,
                        }),
                        Animated.timing(w, {
                            toValue: 0.3,
                            duration: 350,
                            useNativeDriver: true,
                        }),
                    ])
                )
            );
            anims.forEach((a) => a.start());
            return () => anims.forEach((a) => a.stop());
        }
    }, [state]);

    // Simulation reconnaissance vocale
    // (En production, utilise expo-av + une API de transcription)
    function startListening() {
        setState("listening");
        setMessage("Je vous écoute...");

        // Simulation : après 3 secondes on traite
        setTimeout(() => {
            setState("processing");
            setMessage("Analyse en cours...");
            setTranscript(
                "Je veux aller à Yaoundé depuis Douala demain"
            );

            // Analyse simple du texte
            setTimeout(() => {
                processCommand(
                    "Je veux aller à Yaoundé depuis Douala demain"
                );
            }, 1500);
        }, 3000);
    }

    function processCommand(text: string) {
        // Extraction simple des villes et dates
        const lower = text.toLowerCase();
        let depart  = "";
        let arrivee = "";

        const villes = [
            "douala",
            "yaoundé",
            "yaounde",
            "bafoussam",
            "bamenda",
            "garoua",
            "maroua",
            "ngaoundéré",
            "bertoua",
            "ebolowa",
        ];

        const trouvees: string[] = [];
        villes.forEach((v) => {
            if (lower.includes(v)) trouvees.push(v);
        });

        if (trouvees.length >= 2) {
            depart  = trouvees[0];
            arrivee = trouvees[1];
        } else if (trouvees.length === 1) {
            arrivee = trouvees[0];
        }

        // Date
        let date = new Date();
        if (lower.includes("demain")) {
            date.setDate(date.getDate() + 1);
        } else if (lower.includes("après-demain")) {
            date.setDate(date.getDate() + 2);
        }

        const dateStr = date.toISOString().split("T")[0];

        if (depart) {
            setVilleDepart(
                depart.charAt(0).toUpperCase() + depart.slice(1)
            );
        }
        if (arrivee) {
            setVilleArrivee(
                arrivee.charAt(0).toUpperCase() + arrivee.slice(1)
            );
        }
        setDateDepart(dateStr);

        setState("done");
        setMessage(
            arrivee
                ? `Recherche : ${depart || "?"} → ${arrivee} le ${dateStr}`
                : "Commande comprise ! Vérifiez les champs."
        );

        // Feedback vocal
        Speech.speak(
            arrivee
                ? `Recherche de voyages vers ${arrivee}`
                : "Commande enregistrée",
            { language: "fr-FR" }
        );

        setTimeout(() => {
            onClose();
            router.push("/voyages/resultats" as any);
        }, 2000);
    }

    const waves = [wave1, wave2, wave3, wave4, wave5];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.panel,
                        { transform: [{ scale }] },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Robot
                                size={22}
                                color={colors.primary}
                                weight="fill"
                            />
                            <Text style={styles.headerTitle}>
                                Réservation vocale
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeBtn}
                        >
                            <X size={20} color={colors.gray500} />
                        </TouchableOpacity>
                    </View>

                    {/* Contenu */}
                    <View style={styles.content}>
                        {/* Message */}
                        <Text style={styles.message}>{message}</Text>

                        {/* Transcript */}
                        {transcript ? (
                            <View style={styles.transcriptBox}>
                                <Text style={styles.transcriptText}>
                                    "{transcript}"
                                </Text>
                            </View>
                        ) : null}

                        {/* Ondes */}
                        {state === "listening" ? (
                            <View style={styles.wavesRow}>
                                {waves.map((w, i) => (
                                    <Animated.View
                                        key={i}
                                        style={[
                                            styles.waveBar,
                                            {
                                                transform: [
                                                    { scaleY: w },
                                                ],
                                                height:
                                                    20 + i * 8 +
                                                    (4 - i) * 8,
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        ) : null}

                        {/* Processing */}
                        {state === "processing" ? (
                            <ActivityIndicator
                                size="large"
                                color={colors.primary}
                                style={styles.loader}
                            />
                        ) : null}

                        {/* Bouton micro */}
                        {state === "idle" || state === "error" ? (
                            <TouchableOpacity
                                onPress={startListening}
                                style={styles.micBtn}
                                activeOpacity={0.85}
                            >
                                <Microphone
                                    size={36}
                                    color={colors.white}
                                    weight="fill"
                                />
                            </TouchableOpacity>
                        ) : null}

                        {state === "listening" ? (
                            <TouchableOpacity
                                onPress={() => {
                                    setState("idle");
                                    setMessage(
                                        "Appuyez sur le micro et dites votre destination"
                                    );
                                }}
                                style={[
                                    styles.micBtn,
                                    styles.micBtnActive,
                                ]}
                                activeOpacity={0.85}
                            >
                                <MicrophoneSlash
                                    size={36}
                                    color={colors.white}
                                    weight="fill"
                                />
                            </TouchableOpacity>
                        ) : null}

                        {/* Exemples */}
                        <Text style={styles.examplesTitle}>
                            Exemples de commandes :
                        </Text>
                        {[
                            "Aller à Yaoundé depuis Douala demain",
                            "Voyage Bafoussam Douala vendredi",
                            "Je veux partir pour Garoua",
                        ].map((ex, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.exampleChip}
                                onPress={() => processCommand(ex)}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.exampleText}>
                                    "{ex}"
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    panel: {
        backgroundColor: colors.white,
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.gray900,
    },
    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.gray100,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        alignItems: "center",
        gap: 16,
    },
    message: {
        fontSize: 15,
        color: colors.gray700,
        textAlign: "center",
        fontWeight: "500",
    },
    transcriptBox: {
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: "100%",
    },
    transcriptText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: "600",
        textAlign: "center",
        fontStyle: "italic",
    },
    wavesRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        height: 60,
    },
    waveBar: {
        width: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
    },
    loader: {
        marginVertical: 8,
    },
    micBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    micBtnActive: {
        backgroundColor: colors.error,
        shadowColor: colors.error,
    },
    examplesTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.gray400,
        letterSpacing: 0.5,
        alignSelf: "flex-start",
    },
    exampleChip: {
        backgroundColor: colors.gray50,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.gray200,
        alignSelf: "flex-start",
    },
    exampleText: {
        fontSize: 13,
        color: colors.gray600,
        fontStyle: "italic",
    },
});