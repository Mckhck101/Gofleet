import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import {
    X,
    PaperPlaneTilt,
    Robot,
    User,
    SparkleIcon,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import colors from "@/constants/colors";

const { height: H } = Dimensions.get("window");

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface ChatPanelProps {
    visible: boolean;
    onClose: () => void;
    agenceNom?: string;
    agenceId?: number;
}

export default function ChatPanel({
    visible,
    onClose,
    agenceNom,
    agenceId,
}: ChatPanelProps) {
    const { t }        = useTranslation();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "0",
            role: "assistant",
            content: agenceNom
                ? `Bonjour ! Je suis l'assistant de **${agenceNom}**. Comment puis-je vous aider ?`
                : `Bonjour ! Je suis votre assistant ${t("common.appName")}. Je peux vous aider à trouver un voyage, gérer vos réservations ou répondre à vos questions.`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput]       = useState("");
    const [loading, setLoading]   = useState(false);
    const scrollRef               = useRef<ScrollView>(null);
    const slideY                  = useRef(new Animated.Value(H)).current;
    const opacity                 = useRef(new Animated.Value(0)).current;

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
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideY, {
                    toValue: H,
                    duration: 280,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    useEffect(() => {
        setTimeout(
            () => scrollRef.current?.scrollToEnd({ animated: true }),
            100
        );
    }, [messages]);

    async function sendMessage() {
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const systemPrompt = agenceNom
                ? `Tu es l'assistant client de l'agence de voyage "${agenceNom}" au Cameroun. Réponds de manière professionnelle et concise en français. Tu aides les clients avec leurs questions sur les voyages, réservations et services de cette agence.`
                : `Tu es un assistant de voyage pour l'application ${t("common.appName")} au Cameroun. Tu aides les utilisateurs à trouver des voyages, gérer leurs réservations et répondre à leurs questions. Sois concis, professionnel et chaleureux.`;

            const response = await fetch(
                "https://api.anthropic.com/v1/messages",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "claude-sonnet-4-20250514",
                        max_tokens: 1000,
                        system: systemPrompt,
                        messages: [
                            ...messages
                                .filter((m) => m.id !== "0")
                                .map((m) => ({
                                    role: m.role,
                                    content: m.content,
                                })),
                            {
                                role: "user",
                                content: input.trim(),
                            },
                        ],
                    }),
                }
            );

            const data = await response.json();
            const text =
                data.content
                    ?.filter((b: any) => b.type === "text")
                    .map((b: any) => b.text)
                    .join("") ?? "Désolé, je n'ai pas pu répondre.";

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: text,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content:
                        "Désolé, une erreur est survenue. Veuillez réessayer.",
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
            {/* Overlay */}
            <Animated.View style={[styles.overlay, { opacity }]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                    activeOpacity={1}
                />
            </Animated.View>

            {/* Panel */}
            <Animated.View
                style={[
                    styles.panel,
                    { transform: [{ translateY: slideY }] },
                ]}
            >
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={
                        Platform.OS === "ios" ? "padding" : undefined
                    }
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.botIconCircle}>
                                <Robot
                                    size={22}
                                    color={colors.white}
                                    weight="fill"
                                />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>
                                    {agenceNom
                                        ? `Assistant ${agenceNom}`
                                        : "Assistant IA"}
                                </Text>
                                <View style={styles.onlineRow}>
                                    <View style={styles.onlineDot} />
                                    <Text style={styles.onlineText}>
                                        En ligne
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeBtn}
                        >
                            <X size={20} color={colors.gray500} />
                        </TouchableOpacity>
                    </View>

                    {/* Messages */}
                    <ScrollView
                        ref={scrollRef}
                        style={styles.messagesList}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.map((msg) => (
                            <View
                                key={msg.id}
                                style={[
                                    styles.msgRow,
                                    msg.role === "user"
                                        ? styles.msgRowUser
                                        : styles.msgRowAssistant,
                                ]}
                            >
                                {msg.role === "assistant" ? (
                                    <View style={styles.msgAvatar}>
                                        <Robot
                                            size={16}
                                            color={colors.primary}
                                            weight="fill"
                                        />
                                    </View>
                                ) : null}

                                <View
                                    style={[
                                        styles.bubble,
                                        msg.role === "user"
                                            ? styles.bubbleUser
                                            : styles.bubbleAssistant,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.bubbleText,
                                            msg.role === "user"
                                                ? styles.bubbleTextUser
                                                : styles.bubbleTextAssistant,
                                        ]}
                                    >
                                        {msg.content}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.bubbleTime,
                                            msg.role === "user"
                                                ? styles.bubbleTimeUser
                                                : styles.bubbleTimeAssistant,
                                        ]}
                                    >
                                        {msg.timestamp.toLocaleTimeString(
                                            "fr-FR",
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}
                                    </Text>
                                </View>

                                {msg.role === "user" ? (
                                    <View style={styles.msgAvatarUser}>
                                        <User
                                            size={16}
                                            color={colors.white}
                                            weight="fill"
                                        />
                                    </View>
                                ) : null}
                            </View>
                        ))}

                        {loading ? (
                            <View style={styles.typingRow}>
                                <View style={styles.msgAvatar}>
                                    <Robot
                                        size={16}
                                        color={colors.primary}
                                        weight="fill"
                                    />
                                </View>
                                <View style={styles.typingBubble}>
                                    <TypingDots />
                                </View>
                            </View>
                        ) : null}
                    </ScrollView>

                    {/* Input */}
                    <View style={styles.inputBar}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Écrivez votre message..."
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
                                (!input.trim() || loading) &&
                                    styles.sendBtnDisabled,
                            ]}
                            disabled={!input.trim() || loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={colors.white}
                                />
                            ) : (
                                <PaperPlaneTilt
                                    size={18}
                                    color={colors.white}
                                    weight="fill"
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Animated.View>
        </View>
    );
}

// ─── Points de frappe animés ──────────────────────────────────
function TypingDots() {
    const dots = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];

    useEffect(() => {
        const anims = dots.map((dot, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 150),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            )
        );
        anims.forEach((a) => a.start());
        return () => anims.forEach((a) => a.stop());
    }, []);

    return (
        <View style={typingStyles.row}>
            {dots.map((dot, i) => (
                <Animated.View
                    key={i}
                    style={[
                        typingStyles.dot,
                        {
                            transform: [
                                {
                                    translateY: dot.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -4],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            ))}
        </View>
    );
}

const typingStyles = StyleSheet.create({
    row: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center",
        paddingVertical: 4,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.gray400,
    },
});

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

    // ─── Header ──────────────────────────────────
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

    // ─── Messages ─────────────────────────────────
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
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextUser: { color: colors.white },
    bubbleTextAssistant: { color: colors.gray800 },
    bubbleTime: { fontSize: 10, alignSelf: "flex-end" },
    bubbleTimeUser: { color: "rgba(255,255,255,0.65)" },
    bubbleTimeAssistant: { color: colors.gray400 },

    // ─── Typing ───────────────────────────────────
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

    // ─── Input bar ────────────────────────────────
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