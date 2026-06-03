import React from "react";
import {
    View,
    Text,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";
import colors from "@/constants/colors";

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon = "search-outline",
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <Ionicons
                    name={icon}
                    size={48}
                    color={colors.primary}
                />
            </View>

            <Text style={styles.title}>{title}</Text>

            {description && (
                <Text style={styles.description}>{description}</Text>
            )}

            {actionLabel && onAction && (
                <Button
                    label={actionLabel}
                    onPress={onAction}
                    variant="ghost"
                    size="md"
                    fullWidth={false}
                    style={styles.button}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        paddingVertical: 48,
        gap: 12,
    },
    iconWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.primaryLight,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.gray800,
        textAlign: "center",
    },
    description: {
        fontSize: 14,
        color: colors.gray500,
        textAlign: "center",
        lineHeight: 22,
    },
    button: {
        marginTop: 8,
    },
});