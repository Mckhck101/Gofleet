import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
} from "react-native";
import colors from "@/constants/colors";

type BadgeVariant =
    | "primary"
    | "success"
    | "error"
    | "warning"
    | "gray"
    | "info";

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    size?: "sm" | "md";
    style?: ViewStyle;
    dot?: boolean;
}

function getBgColor(variant: BadgeVariant): string {
    if (variant === "primary") return colors.primaryLight;
    if (variant === "success") return colors.successLight;
    if (variant === "error")   return colors.errorLight;
    if (variant === "warning") return colors.warningLight;
    if (variant === "gray")    return colors.gray100;
    return "#EFF6FF";
}

function getTextColor(variant: BadgeVariant): string {
    if (variant === "primary") return colors.primary;
    if (variant === "success") return colors.success;
    if (variant === "error")   return colors.error;
    if (variant === "warning") return colors.warning;
    if (variant === "gray")    return colors.gray600;
    return "#2563EB";
}

function getDotColor(variant: BadgeVariant): string {
    if (variant === "primary") return colors.primary;
    if (variant === "success") return colors.success;
    if (variant === "error")   return colors.error;
    if (variant === "warning") return colors.warning;
    if (variant === "gray")    return colors.gray500;
    return "#2563EB";
}

export default function Badge({
    label,
    variant = "primary",
    size = "md",
    style,
    dot = false,
}: BadgeProps) {
    return (
        <View
            style={[
                styles.base,
                { backgroundColor: getBgColor(variant) },
                size === "sm" ? styles.sm : styles.md,
                style,
            ]}
        >
            {dot ? (
                <View
                    style={[
                        styles.dot,
                        { backgroundColor: getDotColor(variant) },
                    ]}
                />
            ) : null}
            <Text
                style={[
                    styles.label,
                    { color: getTextColor(variant) },
                    size === "sm" ? styles.labelSm : styles.labelMd,
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        borderRadius: 20,
        gap: 5,
    },
    sm: { paddingHorizontal: 8,  paddingVertical: 3 },
    md: { paddingHorizontal: 12, paddingVertical: 5 },
    label: { fontWeight: "600" },
    labelSm: { fontSize: 11 },
    labelMd: { fontSize: 12 },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});