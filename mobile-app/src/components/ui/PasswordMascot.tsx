import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import Svg, {
    Circle,
    Ellipse,
    Path,
    G,
    Rect,
} from "react-native-svg";

type MascotColor = "blue" | "red" | "orange" | "green";

interface PasswordMascotProps {
    visible: boolean;
    eyesOpen: boolean;
    color?: MascotColor;
}

const COLORS: Record<MascotColor, { body: string; shadow: string }> = {
    blue:   { body: "#1877F2", shadow: "#1458C8" },
    red:    { body: "#DC2626", shadow: "#B91C1C" },
    orange: { body: "#F97316", shadow: "#EA6C0A" },
    green:  { body: "#16A34A", shadow: "#15803D" },
};

export default function PasswordMascot({
    visible,
    eyesOpen,
    color = "blue",
}: PasswordMascotProps) {
    // ─── Animations ──────────────────────────────
    const slideY   = useRef(new Animated.Value(-40)).current;
    const opacity  = useRef(new Animated.Value(0)).current;
    const scale    = useRef(new Animated.Value(0.7)).current;
    const wiggle   = useRef(new Animated.Value(0)).current;
    const eyeLid   = useRef(new Animated.Value(eyesOpen ? 0 : 1)).current;
    const blush    = useRef(new Animated.Value(0)).current;

    // Apparition / disparition
    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 8,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 7,
                }),
            ]).start(() => {
                // Petit wiggle d'entrée
                Animated.sequence([
                    Animated.timing(wiggle, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(wiggle, {
                        toValue: -1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(wiggle, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        } else {
            Animated.parallel([
                Animated.timing(slideY, {
                    toValue: -40,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0.7,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    // Ouverture / fermeture yeux
    useEffect(() => {
        Animated.spring(eyeLid, {
            toValue: eyesOpen ? 0 : 1,
            useNativeDriver: false,
            tension: 120,
            friction: 6,
        }).start();

        // Rougeur quand il regarde
        Animated.timing(blush, {
            toValue: eyesOpen ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [eyesOpen]);

    const rotate = wiggle.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ["-8deg", "0deg", "8deg"],
    });

    const eyeHeight = eyeLid.interpolate({
        inputRange: [0, 1],
        outputRange: [10, 1],
    });

    const blushOpacity = blush.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
    });

    const { body, shadow } = COLORS[color];

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [
                        { translateY: slideY },
                        { scale },
                        { rotate },
                    ],
                },
            ]}
        >
            <Svg width={90} height={90} viewBox="0 0 90 90">

                {/* ── Ombre portée ── */}
                <Ellipse
                    cx={45}
                    cy={85}
                    rx={22}
                    ry={4}
                    fill="rgba(0,0,0,0.1)"
                />

                {/* ── Corps principal ── */}
                <Circle cx={45} cy={44} r={32} fill={body} />

                {/* ── Reflet haut ── */}
                <Ellipse
                    cx={37}
                    cy={28}
                    rx={10}
                    ry={6}
                    fill="rgba(255,255,255,0.2)"
                    transform="rotate(-30, 37, 28)"
                />

                {/* ── Bas du corps (ombre) ── */}
                <Path
                    d={`M 20 58 Q 45 80 70 58`}
                    fill={shadow}
                    opacity={0.4}
                />

                {/* ── Oreilles ── */}
                <Circle cx={14} cy={44} r={7} fill={body} />
                <Circle cx={76} cy={44} r={7} fill={body} />
                <Circle cx={14} cy={44} r={4} fill={shadow} opacity={0.3} />
                <Circle cx={76} cy={44} r={4} fill={shadow} opacity={0.3} />

                {/* ── Rougeur joues (animée) ── */}
                <AnimatedCircle
                    cx={28}
                    cy={55}
                    r={7}
                    fill="#FF6B9D"
                    opacity={blushOpacity}
                />
                <AnimatedCircle
                    cx={62}
                    cy={55}
                    r={7}
                    fill="#FF6B9D"
                    opacity={blushOpacity}
                />

                {/* ── Œil gauche ── */}
                <Circle cx={34} cy={42} r={7} fill="white" />
                <Circle cx={34} cy={43} r={4} fill="#1A1A2E" />
                <Circle cx={36} cy={41} r={1.5} fill="white" />

                {/* ── Paupière gauche (animée) ── */}
                <AnimatedRect
                    x={27}
                    y={35}
                    width={14}
                    rx={3}
                    height={eyeHeight}
                    fill={body}
                />

                {/* ── Œil droit ── */}
                <Circle cx={56} cy={42} r={7} fill="white" />
                <Circle cx={56} cy={43} r={4} fill="#1A1A2E" />
                <Circle cx={58} cy={41} r={1.5} fill="white" />

                {/* ── Paupière droite (animée) ── */}
                <AnimatedRect
                    x={49}
                    y={35}
                    width={14}
                    rx={3}
                    height={eyeHeight}
                    fill={body}
                />

                {/* ── Sourire ── */}
                <Path
                    d={
                        eyesOpen
                            ? "M 32 58 Q 45 70 58 58"
                            : "M 33 57 Q 45 67 57 57"
                    }
                    stroke="white"
                    strokeWidth={3}
                    strokeLinecap="round"
                    fill="none"
                />

                {/* ── Petites dents (visible si yeux ouverts) ── */}
                {eyesOpen && (
                    <Path
                        d="M 36 60 Q 45 67 54 60 L 54 63 Q 45 70 36 63 Z"
                        fill="white"
                        opacity={0.8}
                    />
                )}

            </Svg>
        </Animated.View>
    );
}

// ─── Wrappers animés pour SVG ─────────────────────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect   = Animated.createAnimatedComponent(Rect);

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginBottom: 8,
    },
});