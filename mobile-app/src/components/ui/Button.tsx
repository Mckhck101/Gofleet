import React from "react";
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
    TextStyle,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/constants/colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    iconLeft?: keyof typeof Ionicons.glyphMap;
    iconRight?: keyof typeof Ionicons.glyphMap;
    fullWidth?: boolean;
    style?: ViewStyle;
    labelStyle?: TextStyle;
}

export default function Button({
    label,
    onPress,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    iconLeft,
    iconRight,
    fullWidth = true,
    style,
    labelStyle,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.82}
            style={[
                styles.base,
                styles[variant],
                styles[size],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={
                        variant === "outline" || variant === "ghost"
                            ? colors.primary
                            : colors.white
                    }
                />
            ) : (
                <View style={styles.content}>
                    {iconLeft && (
                        <Ionicons
                            name={iconLeft}
                            size={iconSizes[size]}
                            color={iconColor(variant)}
                            style={styles.iconLeft}
                        />
                    )}
                    <Text
                        style={[
                            styles.label,
                            styles[`label_${variant}` as keyof typeof styles],
                            styles[`label_${size}` as keyof typeof styles],
                            labelStyle,
                        ]}
                    >
                        {label}
                    </Text>
                    {iconRight && (
                        <Ionicons
                            name={iconRight}
                            size={iconSizes[size]}
                            color={iconColor(variant)}
                            style={styles.iconRight}
                        />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

const iconSizes: Record<ButtonSize, number> = {
    sm: 16,
    md: 18,
    lg: 20,
};

function iconColor(variant: ButtonVariant): string {
    switch (variant) {
        case "outline":
        case "ghost":
            return colors.primary;
        case "danger":
            return colors.white;
        default:
            return colors.white;
    }
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    fullWidth: {
        width: "100%",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    // ─── Variants ────────────────────────────────
    primary: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    secondary: {
        backgroundColor: colors.secondary,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    outline: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: colors.primaryLight,
    },
    danger: {
        backgroundColor: colors.error,
        shadowColor: colors.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    disabled: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },

    // ─── Tailles ─────────────────────────────────
    sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 36,
    },
    md: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        minHeight: 50,
    },
    lg: {
        paddingVertical: 17,
        paddingHorizontal: 32,
        minHeight: 56,
    },

    // ─── Labels ──────────────────────────────────
    label: {
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    label_primary: { color: colors.white },
    label_secondary: { color: colors.white },
    label_outline: { color: colors.primary },
    label_ghost: { color: colors.primary },
    label_danger: { color: colors.white },
    label_sm: { fontSize: 13 },
    label_md: { fontSize: 15 },
    label_lg: { fontSize: 17 },

    // ─── Icons ───────────────────────────────────
    iconLeft: { marginRight: 8 },
    iconRight: { marginLeft: 8 },
});