import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Svg, {
    Path,
    Circle,
    Rect,
    Ellipse,
    G,
    Line,
} from "react-native-svg";
import { useAuthStore } from "@/store/authStore";
import colors from "@/constants/colors";

const { width: W, height: H } = Dimensions.get("window");

// ─── Composant Bus SVG ────────────────────────────────────────
function BusSVG({ color }: { color: string }) {
    return (
        <Svg width={180} height={90} viewBox="0 0 180 90">
            {/* Corps principal */}
            <Rect
                x={10} y={15}
                width={155} height={55}
                rx={12} ry={12}
                fill={color}
            />
            {/* Toit */}
            <Rect
                x={18} y={8}
                width={140} height={20}
                rx={8}
                fill={color}
                opacity={0.85}
            />
            {/* Pare-brise avant */}
            <Rect
                x={138} y={20}
                width={22} height={25}
                rx={4}
                fill="#A8D8EA"
                opacity={0.9}
            />
            {/* Fenêtres */}
            {[22, 52, 82, 110].map((x, i) => (
                <Rect
                    key={i}
                    x={x} y={22}
                    width={22} height={18}
                    rx={4}
                    fill="#A8D8EA"
                    opacity={0.9}
                />
            ))}
            {/* Porte */}
            <Rect
                x={52} y={40}
                width={18} height={30}
                rx={3}
                fill="#A8D8EA"
                opacity={0.6}
            />
            {/* Bande décorative */}
            <Rect
                x={10} y={46}
                width={155} height={5}
                fill="white"
                opacity={0.25}
            />
            {/* Roue avant */}
            <Circle cx={40}  cy={70} r={14} fill="#1A1A2E" />
            <Circle cx={40}  cy={70} r={8}  fill="#444" />
            <Circle cx={40}  cy={70} r={3}  fill="#888" />
            {/* Roue arrière */}
            <Circle cx={130} cy={70} r={14} fill="#1A1A2E" />
            <Circle cx={130} cy={70} r={8}  fill="#444" />
            <Circle cx={130} cy={70} r={3}  fill="#888" />
            {/* Phares */}
            <Rect
                x={158} y={28}
                width={10} height={8}
                rx={2}
                fill="#FFE066"
            />
            {/* Détails carrosserie */}
            <Line
                x1={10} y1={58}
                x2={165} y2={58}
                stroke="white"
                strokeWidth={1}
                opacity={0.15}
            />
        </Svg>
    );
}

// ─── Route SVG ────────────────────────────────────────────────
function RouteSVG() {
    return (
        <Svg width={W} height={60} viewBox={`0 0 ${W} 60`}>
            {/* Asphalte */}
            <Rect x={0} y={10} width={W} height={40} fill="#374151" />
            {/* Lignes blanches */}
            {Array.from({ length: 12 }).map((_, i) => (
                <Rect
                    key={i}
                    x={i * (W / 6)}
                    y={27}
                    width={W / 12}
                    height={6}
                    rx={3}
                    fill="white"
                    opacity={0.4}
                />
            ))}
            {/* Bordures route */}
            <Rect x={0} y={10}  width={W} height={4}  fill="#F59E0B" />
            <Rect x={0} y={46}  width={W} height={4}  fill="#F59E0B" />
        </Svg>
    );
}

// ─── Arbres / Décor ───────────────────────────────────────────
function ArbresSVG({ offset }: { offset: Animated.Value }) {
    const translateX = offset.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -W],
    });

    return (
        <Animated.View
            style={{
                position: "absolute",
                bottom: 55,
                flexDirection: "row",
                transform: [{ translateX }],
            }}
        >
            {Array.from({ length: 16 }).map((_, i) => (
                <View key={i} style={{ marginHorizontal: i % 3 === 0 ? 30 : 20 }}>
                    <Svg width={24} height={40} viewBox="0 0 24 40">
                        {/* Tronc */}
                        <Rect x={9} y={28} width={6} height={12} fill="#92400E" />
                        {/* Feuillage */}
                        <Path
                            d="M12 2 L22 28 L2 28 Z"
                            fill={i % 2 === 0 ? "#16A34A" : "#15803D"}
                        />
                        <Path
                            d="M12 8 L20 26 L4 26 Z"
                            fill={i % 2 === 0 ? "#22C55E" : "#16A34A"}
                        />
                    </Svg>
                </View>
            ))}
        </Animated.View>
    );
}

// ─── Nuages ───────────────────────────────────────────────────
function NuageSVG({ x, y, scale }: { x: number; y: number; scale: number }) {
    return (
        <Svg
            width={80 * scale}
            height={40 * scale}
            viewBox="0 0 80 40"
            style={{ position: "absolute", left: x, top: y }}
        >
            <Ellipse cx={40} cy={28} rx={35} ry={14} fill="white" opacity={0.85} />
            <Circle cx={25} cy={24} r={14} fill="white" opacity={0.85} />
            <Circle cx={45} cy={20} r={18} fill="white" opacity={0.85} />
            <Circle cx={62} cy={26} r={12} fill="white" opacity={0.85} />
        </Svg>
    );
}

// ─── Texte animé lettre par lettre ────────────────────────────
function AnimatedText({
    text,
    style,
    delay = 0,
}: {
    text: string;
    style?: object;
    delay?: number;
}) {
    const letters = text.split("");
    const anims = useRef(
        letters.map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        const animations = letters.map((_, i) =>
            Animated.timing(anims[i], {
                toValue: 1,
                duration: 80,
                delay: delay + i * 60,
                useNativeDriver: true,
            })
        );
        Animated.stagger(60, animations).start();
    }, []);

    return (
        <Text style={style}>
            {letters.map((letter, i) => (
                <Animated.Text
                    key={i}
                    style={{
                        opacity: anims[i],
                        transform: [
                            {
                                translateY: anims[i].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                }),
                            },
                        ],
                    }}
                >
                    {letter}
                </Animated.Text>
            ))}
        </Text>
    );
}

// ─── Écran principal ──────────────────────────────────────────
export default function BienvenueScreen() {
    const router     = useRouter();
    const { t }      = useTranslation();
    const { utilisateur } = useAuthStore();

    // Animations
    const busX       = useRef(new Animated.Value(-200)).current;
    const skyOpacity = useRef(new Animated.Value(0)).current;
    const cardSlide  = useRef(new Animated.Value(100)).current;
    const cardOpacity= useRef(new Animated.Value(0)).current;
    const treeOffset = useRef(new Animated.Value(0)).current;
    const cloud1X    = useRef(new Animated.Value(W)).current;
    const cloud2X    = useRef(new Animated.Value(W * 1.3)).current;
    const sunScale   = useRef(new Animated.Value(0)).current;
    const sunRotate  = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Ciel
        Animated.timing(skyOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        // Soleil
        Animated.parallel([
            Animated.spring(sunScale, {
                toValue: 1,
                tension: 60,
                friction: 6,
                useNativeDriver: true,
            }),
            Animated.loop(
                Animated.timing(sunRotate, {
                    toValue: 1,
                    duration: 12000,
                    useNativeDriver: true,
                })
            ),
        ]).start();

        // Nuages
        Animated.parallel([
            Animated.timing(cloud1X, {
                toValue: -120,
                duration: 8000,
                useNativeDriver: true,
            }),
            Animated.timing(cloud2X, {
                toValue: -80,
                duration: 11000,
                useNativeDriver: true,
            }),
        ]).start();

        // Bus entre en scène
        Animated.timing(busX, {
            toValue: W / 2 - 90,
            duration: 1800,
            useNativeDriver: true,
        }).start(() => {
            // Arbres défilent
            Animated.timing(treeOffset, {
                toValue: 1,
                duration: 2500,
                useNativeDriver: true,
            }).start();

            // Bus repart
            setTimeout(() => {
                Animated.timing(busX, {
                    toValue: W + 50,
                    duration: 1600,
                    useNativeDriver: true,
                }).start(() => {
                    // Carte bienvenue apparaît
                    Animated.parallel([
                        Animated.spring(cardSlide, {
                            toValue: 0,
                            tension: 60,
                            friction: 8,
                            useNativeDriver: true,
                        }),
                        Animated.timing(cardOpacity, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        // Redirection après 3 secondes
                        setTimeout(() => {
                            router.replace("/(tabs)");
                        }, 3000);
                    });
                });
            }, 1200);
        });
    }, []);

    const sunRotation = sunRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const prenom = utilisateur?.prenom ?? "";

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent
            />

            {/* ── Ciel ── */}
            <Animated.View
                style={[styles.sky, { opacity: skyOpacity }]}
            />

            {/* ── Soleil ── */}
            <Animated.View
                style={[
                    styles.soleilContainer,
                    {
                        transform: [
                            { scale: sunScale },
                            { rotate: sunRotation },
                        ],
                    },
                ]}
            >
                <Svg width={80} height={80} viewBox="0 0 80 80">
                    {/* Rayons */}
                    {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i * 45 * Math.PI) / 180;
                        const x1 = 40 + 22 * Math.cos(angle);
                        const y1 = 40 + 22 * Math.sin(angle);
                        const x2 = 40 + 36 * Math.cos(angle);
                        const y2 = 40 + 36 * Math.sin(angle);
                        return (
                            <Line
                                key={i}
                                x1={x1} y1={y1}
                                x2={x2} y2={y2}
                                stroke="#FFE066"
                                strokeWidth={3}
                                strokeLinecap="round"
                            />
                        );
                    })}
                    <Circle cx={40} cy={40} r={18} fill="#FFD700" />
                    <Circle cx={40} cy={40} r={14} fill="#FFE066" />
                </Svg>
            </Animated.View>

            {/* ── Nuages ── */}
            <Animated.View
                style={{ transform: [{ translateX: cloud1X }] }}
            >
                <NuageSVG x={0} y={60} scale={1.2} />
            </Animated.View>
            <Animated.View
                style={{ transform: [{ translateX: cloud2X }] }}
            >
                <NuageSVG x={0} y={90} scale={0.8} />
            </Animated.View>

            {/* ── Montagnes / Collines ── */}
            <View style={styles.collines}>
                <Svg width={W} height={120} viewBox={`0 0 ${W} 120`}>
                    <Path
                        d={`M0 120 L${W * 0.15} 40 L${W * 0.35} 90 L${W * 0.5} 20 L${W * 0.65} 70 L${W * 0.8} 30 L${W} 80 L${W} 120 Z`}
                        fill="#16A34A"
                        opacity={0.7}
                    />
                    <Path
                        d={`M0 120 L${W * 0.2} 60 L${W * 0.4} 100 L${W * 0.6} 40 L${W * 0.75} 85 L${W} 55 L${W} 120 Z`}
                        fill="#15803D"
                        opacity={0.5}
                    />
                </Svg>
            </View>

            {/* ── Arbres défilants ── */}
            <ArbresSVG offset={treeOffset} />

            {/* ── Route ── */}
            <View style={styles.route}>
                <RouteSVG />
            </View>

            {/* ── Bus animé ── */}
            <Animated.View
                style={[
                    styles.bus,
                    { transform: [{ translateX: busX }] },
                ]}
            >
                <BusSVG color={colors.primary} />
            </Animated.View>

            {/* ── Carte bienvenue ── */}
            <Animated.View
                style={[
                    styles.card,
                    {
                        opacity: cardOpacity,
                        transform: [{ translateY: cardSlide }],
                    },
                ]}
            >
                <View style={styles.cardInner}>
                    {/* Icône */}
                    <View style={styles.iconCircle}>
                        <Svg width={40} height={40} viewBox="0 0 40 40">
                            <Circle cx={20} cy={20} r={20} fill={colors.primary} />
                            <Path
                                d="M12 20 L18 26 L28 14"
                                stroke="white"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </Svg>
                    </View>

                    {/* Texte lettre par lettre */}
                    <AnimatedText
                        text={`${t("common.bienvenue")}${prenom ? `, ${prenom}` : ""} !`}
                        style={styles.bienvenueText}
                        delay={200}
                    />

                    <AnimatedText
                        text="Votre aventure commence ici"
                        style={styles.sousTexte}
                        delay={800}
                    />

                    {/* Points de chargement */}
                    <View style={styles.dotsRow}>
                        {[0, 1, 2].map((i) => (
                            <DotPulse key={i} delay={i * 200} />
                        ))}
                    </View>
                </View>
            </Animated.View>
        </View>
    );
}

// ─── Point pulsant ────────────────────────────────────────────
function DotPulse({ delay }: { delay: number }) {
    const anim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 500,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(anim, {
                    toValue: 0.4,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[styles.dot, { opacity: anim }]}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#87CEEB",
        overflow: "hidden",
    },
    sky: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#87CEEB",
    },
    soleilContainer: {
        position: "absolute",
        top: 60,
        right: 50,
    },
    collines: {
        position: "absolute",
        bottom: 95,
        left: 0,
        right: 0,
    },
    route: {
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
    },
    bus: {
        position: "absolute",
        bottom: 62,
        left: 0,
    },
    card: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 32,
        paddingBottom: 48,
        paddingHorizontal: 32,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 20,
    },
    cardInner: {
        alignItems: "center",
        gap: 12,
    },
    iconCircle: {
        marginBottom: 8,
    },
    bienvenueText: {
        fontSize: 28,
        fontWeight: "800",
        color: colors.gray900,
        textAlign: "center",
        letterSpacing: 0.5,
    },
    sousTexte: {
        fontSize: 15,
        color: colors.gray500,
        textAlign: "center",
        letterSpacing: 0.3,
    },
    dotsRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 16,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
});