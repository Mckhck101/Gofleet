import React, { useEffect, useRef } from "react";
import {
    View,
    ActivityIndicator,
    Text,
    StyleSheet,
    Animated,
} from "react-native";
import colors from "@/constants/colors";

interface LoaderProps {
    message?: string;
    fullScreen?: boolean;
    size?: "small" | "large";
    color?: string;
}

export default function Loader({
    message,
    fullScreen = false,
    size = "large",
    color = colors.primary,
}: LoaderProps) {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1.15,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    if (fullScreen) {
        return (
            <View style={styles.fullScreen}>
                <Animated.View
                    style={[
                        styles.circle,
                        { transform: [{ scale: pulse }] },
                    ]}
                >
                    <ActivityIndicator size={size} color={colors.white} />
                </Animated.View>
                {message && (
                    <Text style={styles.messageFullScreen}>{message}</Text>
                )}
            </View>
        );
    }

    return (
        <View style={styles.inline}>
            <ActivityIndicator size={size} color={color} />
            {message && (
                <Text style={styles.messageInline}>{message}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
        gap: 20,
    },
    circle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 10,
    },
    messageFullScreen: {
        fontSize: 15,
        color: colors.gray500,
        fontWeight: "500",
        textAlign: "center",
    },
    inline: {
        paddingVertical: 32,
        alignItems: "center",
        gap: 12,
    },
    messageInline: {
        fontSize: 14,
        color: colors.gray500,
        fontWeight: "500",
    },
});