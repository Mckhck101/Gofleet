import React from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
} from "react-native";
import colors from "@/constants/colors";

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    padding?: number;
    elevated?: boolean;
    bordered?: boolean;
}

export default function Card({
    children,
    onPress,
    style,
    padding = 16,
    elevated = true,
    bordered = false,
}: CardProps) {
    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.88}
                style={[
                    styles.card,
                    elevated && styles.elevated,
                    bordered && styles.bordered,
                    { padding },
                    style,
                ]}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View
            style={[
                styles.card,
                elevated && styles.elevated,
                bordered && styles.bordered,
                { padding },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        overflow: "hidden",
    },
    elevated: {
        shadowColor: colors.gray900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    bordered: {
        borderWidth: 1,
        borderColor: colors.border,
    },
});