import React, { useRef, useEffect } from "react";
import {
    TouchableOpacity,
    StyleSheet,
    Animated,
    View,
} from "react-native";
import { ChatsCircle } from "phosphor-react-native";
import colors from "@/constants/colors";

interface FloatingChatButtonProps {
    onPress: () => void;
    bottomOffset?: number;
}

export default function FloatingChatButton({
    onPress,
    bottomOffset = 90,
}: FloatingChatButtonProps) {
    const scale = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Apparition
        Animated.spring(scale, {
            toValue: 1,
            tension: 65,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Pulse continu
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1.1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    bottom: bottomOffset,
                    transform: [{ scale }],
                },
            ]}
        >
            {/* Cercle pulse externe */}
            <Animated.View
                style={[
                    styles.pulseRing,
                    { transform: [{ scale: pulse }] },
                ]}
            />

            <TouchableOpacity
                onPress={onPress}
                style={styles.button}
                activeOpacity={0.85}
            >
                <ChatsCircle
                    size={26}
                    color={colors.white}
                    weight="fill"
                />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        right: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    pulseRing: {
        position: "absolute",
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        opacity: 0.25,
    },
    button: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
});