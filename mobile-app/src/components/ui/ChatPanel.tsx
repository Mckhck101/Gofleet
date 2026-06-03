import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    PaperPlaneTilt,
    Robot,
    User,
    X,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import colors from "@/constants/colors";
import config from "@/constants/config";

const { height: H } = Dimensions.get("window");

type Role = "user" | "assistant";

interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
}

interface ChatPanelProps {
    visible: boolean;
    onClose: () => void;
    agenceNom?: string;
    agenceId?: number;
}

const GOFLEET_CONTEXT = `
Gofleet est une application mobile de reservation de voyages au Cameroun.
Fonctions disponibles en V1:
- inscription, connexion, profil utilisateur;
- recherche de voyages par ville de depart, ville d'arrivee et date optionnelle;
- recherche vocale qui remplit la recherche;
- resultats de voyages, detail voyage, selection de siege;
- informations voyageur, paiement simule et confirmation;
- onglets reservations, historique statique, favoris statiques, profil;
- agences populaires et assistant d'agence.
Donnees de demonstration utiles:
- Douala -> Yaounde avec Touristique Express, bus, environ 5000 FCFA;
- Yaounde -> Ngaoundere avec Camrail Voyage, train, environ 12000 FCFA;
- Douala -> Garoua avec Gofleet Air, avion, environ 85000 FCFA.
Regles:
- reponds en francais, de maniere courte, claire et chaleureuse;
- guide l'utilisateur dans l'app quand c'est utile;
- n'invente pas une reservation, un paiement confirme ou une disponibilite certaine;
- si la question est technique, demande le message d'erreur exact et propose une verification simple.
`.trim();

export default function ChatPanel({
    visible,
    onClose,
    agenceNom,
}: ChatPanelProps) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>(() => [
        {
            id: "0",
            role: "assistant",
            content: agenceNom
                ? `Bonjour ! Je suis l'assistant de ${agenceNom}. Comment puis-je vous aider ?`
                : `Bonjour ! Je suis votre assistant ${t("common.appName")}. Je peux vous aider pour les voyages, reservations, paiements et profils.`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const slideY = useRef(new Animated.Value(H)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideY, {
                    toValue: 0,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideY, {
                    toValue: H,
                    duration: 240,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, opacity, slideY]);

    useEffect(() => {
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, [messages, loading]);

    function systemPrompt() {
        const scope = agenceNom
            ? `Tu es l'assistant client de l'agence "${agenceNom}" dans Gofleet.`
            : `Tu es l'assistant de l'application ${t("common.appName")}.`;

        return `${scope}\n\n${GOFLEET_CONTEXT}`;
    }

    function fallbackReply(question: string) {
        const lower = question.toLowerCase();

        if (lower.includes("reservation") || lower.includes("reserver")) {
            return "Pour reserver: Accueil -> recherche du trajet -> detail du voyage -> choix du siege -> paiement simule -> confirmation.";
        }
        if (lower.includes("paiement") || lower.includes("payer")) {
            return "Dans cette V1, le paiement est simule. Choisissez une methode, confirmez, puis verifiez la page de confirmation.";
        }
        if (lower.includes("profil")) {
            return "Allez dans l'onglet Profil pour consulter ou modifier vos informations principales.";
        }
        if (lower.includes("voyage") || lower.includes("trajet")) {
            return "Depuis l'accueil, entrez une ville de depart et une ville d'arrivee. La date est optionnelle pour afficher plus de resultats.";
        }

        return "Je peux vous aider sur les voyages, reservations, paiements simules, agences et profil Gofleet. Posez-moi votre question en une phrase.";
    }

    async function askGemini(userText: string) {
        if (!config.GEMINI_API_KEY) {
            return fallbackReply(userText);
        }

        const history = messages
            .filter((message) => message.id !== "0")
            .slice(-8)
            .map((message) => ({
                role: message.role === "assistant" ? "model" : "user",
                parts: [{ text: message.content }],
            }));

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent?key=${config.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemPrompt() }],
                    },
                    contents: [
                        ...history,
                        {
                            role: "user",
                            parts: [{ text: userText }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.4,
                        maxOutputTokens: 600,
                    },
                }),
            }
        );

        if (!response.ok) {
            return fallbackReply(userText);
        }

        const data = await response.json();
        return (
            data.candidates?.[0]?.content?.parts
                ?.map((part: any) => part.text)
                .filter(Boolean)
                .join("") || fallbackReply(userText)
        );
    }

    async function sendMessage() {
        const text = input.trim();
        if (!text || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const answer = await askGemini(text);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: answer,
                    timestamp: new Date(),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: fallbackReply(text),
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[styles.overlay, { opacity }]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                    activeOpacity={1}
                />
            </Animated.View>

            <Animated.View style={[styles.panel, { transform: [{ translateY: slideY }] }]}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.botIconCircle}>
                                <Robot size={22} color={colors.white} weight="fill" />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>
                                    {agenceNom ? `Assistant ${agenceNom}` : "Assistant IA"}
                                </Text>
                                <View style={styles.onlineRow}>
                                    <View style={styles.onlineDot} />
                                    <Text style={styles.onlineText}>
                                        {config.GEMINI_API_KEY ? "Gemini connecte" : "Mode aide locale"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={20} color={colors.gray500} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        ref={scrollRef}
                        style={styles.messagesList}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.map((message) => (
                            <View
                                key={message.id}
                                style={[
                                    styles.msgRow,
                                    message.role === "user"
                                        ? styles.msgRowUser
                                        : styles.msgRowAssistant,
                                ]}
                            >
                                {message.role === "assistant" ? (
                                    <View style={styles.msgAvatar}>
                                        <Robot size={16} color={colors.primary} weight="fill" />
                                    </View>
                                ) : null}

                                <View
                                    style={[
                                        styles.bubble,
                                        message.role === "user"
                                            ? styles.bubbleUser
                                            : styles.bubbleAssistant,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.bubbleText,
                                            message.role === "user"
                                                ? styles.bubbleTextUser
                                                : styles.bubbleTextAssistant,
                                        ]}
                                    >
                                        {message.content}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.bubbleTime,
                                            message.role === "user"
                                                ? styles.bubbleTimeUser
                                                : styles.bubbleTimeAssistant,
                                        ]}
                                    >
                                        {message.timestamp.toLocaleTimeString("fr-FR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                </View>

                                {message.role === "user" ? (
                                    <View style={styles.msgAvatarUser}>
                                        <User size={16} color={colors.white} weight="fill" />
                                    </View>
                                ) : null}
                            </View>
                        ))}

                        {loading ? (
                            <View style={styles.typingRow}>
                                <View style={styles.msgAvatar}>
                                    <Robot size={16} color={colors.primary} weight="fill" />
                                </View>
                                <View style={styles.typingBubble}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            </View>
                        ) : null}
                    </ScrollView>

                    <View style={styles.inputBar}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ecrivez votre message..."
                            placeholderTextColor={colors.gray400}
                            value={input}
                            onChangeText={setInput}
                            multiline
                            maxLength={500}
                            onSubmitEditing={sendMessage}
                        />
                        <TouchableOpacity
                            onPress={sendMessage}
                            style={[
                                styles.sendBtn,
                                (!input.trim() || loading) && styles.sendBtnDisabled,
                            ]}
                            disabled={!input.trim() || loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <PaperPlaneTilt size={18} color={colors.white} weight="fill" />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    panel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: H * 0.78,
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
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
        gap: 12,
    },
    botIconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.gray900,
    },
    onlineRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: 2,
    },
    onlineDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.success,
    },
    onlineText: {
        fontSize: 12,
        color: colors.success,
        fontWeight: "500",
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.gray100,
        justifyContent: "center",
        alignItems: "center",
    },
    messagesList: { flex: 1 },
    messagesContent: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    msgRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
    },
    msgRowUser: { justifyContent: "flex-end" },
    msgRowAssistant: { justifyContent: "flex-start" },
    msgAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.primaryLight,
        justifyContent: "center",
        alignItems: "center",
    },
    msgAvatarUser: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    bubble: {
        maxWidth: "72%",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 4,
    },
    bubbleUser: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    bubbleAssistant: {
        backgroundColor: colors.gray100,
        borderBottomLeftRadius: 4,
    },
    bubbleText: {
        fontSize: 14,
        lineHeight: 20,
    },
    bubbleTextUser: { color: colors.white },
    bubbleTextAssistant: { color: colors.gray800 },
    bubbleTime: {
        fontSize: 10,
        alignSelf: "flex-end",
    },
    bubbleTimeUser: { color: "rgba(255,255,255,0.65)" },
    bubbleTimeAssistant: { color: colors.gray400 },
    typingRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
    },
    typingBubble: {
        backgroundColor: colors.gray100,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    inputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        backgroundColor: colors.white,
    },
    textInput: {
        flex: 1,
        backgroundColor: colors.gray50,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        color: colors.gray900,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    sendBtnDisabled: {
        backgroundColor: colors.gray300,
        shadowOpacity: 0,
        elevation: 0,
    },
});
