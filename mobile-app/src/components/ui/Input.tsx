import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from "react-native";
import {
    EnvelopeSimple,
    Lock,
    Phone,
    User,
    IdentificationCard,
    CalendarBlank,
    Eye,
    EyeSlash,
    MagnifyingGlass,
    MapPin,
    Warning,
} from "phosphor-react-native";
import colors from "@/constants/colors";

// ─── Map des icônes disponibles ───────────────────────────────
type IconName =
    | "envelope"
    | "lock"
    | "phone"
    | "user"
    | "identification-card"
    | "calendar-blank"
    | "eye"
    | "eye-slash"
    | "search"
    | "map-pin"
    | "warning";

function RenderIcon({
    name,
    color,
    size = 20,
}: {
    name: IconName;
    color: string;
    size?: number;
}) {
    switch (name) {
        case "envelope":
            return <EnvelopeSimple size={size} color={color} />;
        case "lock":
            return <Lock size={size} color={color} />;
        case "phone":
            return <Phone size={size} color={color} />;
        case "user":
            return <User size={size} color={color} />;
        case "identification-card":
            return <IdentificationCard size={size} color={color} />;
        case "calendar-blank":
            return <CalendarBlank size={size} color={color} />;
        case "eye":
            return <Eye size={size} color={color} />;
        case "eye-slash":
            return <EyeSlash size={size} color={color} />;
        case "search":
            return <MagnifyingGlass size={size} color={color} />;
        case "map-pin":
            return <MapPin size={size} color={color} />;
        case "warning":
            return <Warning size={size} color={color} />;
        default:
            return null;
    }
}

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    iconLeft?: IconName;
    iconRight?: IconName;
    onIconRightPress?: () => void;
    containerStyle?: ViewStyle;
    required?: boolean;
}

export default function Input({
    label,
    error,
    hint,
    iconLeft,
    iconRight,
    onIconRightPress,
    containerStyle,
    secureTextEntry,
    required,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const isPassword = secureTextEntry === true;

    return (
        <View style={[styles.container, containerStyle]}>
            {label ? (
                <View style={styles.labelRow}>
                    <Text style={styles.label}>{label}</Text>
                    {required ? (
                        <Text style={styles.required}> *</Text>
                    ) : null}
                </View>
            ) : null}

            <View
                style={[
                    styles.inputWrapper,
                    isFocused ? styles.inputWrapperFocused : null,
                    error ? styles.inputWrapperError : null,
                ]}
            >
                {iconLeft ? (
                    <View style={styles.iconLeftContainer}>
                        <RenderIcon
                            name={iconLeft}
                            color={
                                isFocused
                                    ? colors.primary
                                    : error
                                    ? colors.error
                                    : colors.gray400
                            }
                        />
                    </View>
                ) : null}

                <TextInput
                    style={[
                        styles.input,
                        iconLeft ? styles.inputWithIconLeft : null,
                        iconRight || isPassword
                            ? styles.inputWithIconRight
                            : null,
                    ]}
                    placeholderTextColor={colors.gray400}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={
                        isPassword ? !isVisible : false
                    }
                    {...props}
                />

                {isPassword ? (
                    <TouchableOpacity
                        onPress={() => setIsVisible(!isVisible)}
                        style={styles.iconRightContainer}
                        activeOpacity={0.7}
                    >
                        {isVisible ? (
                            <EyeSlash
                                size={20}
                                color={colors.gray400}
                            />
                        ) : (
                            <Eye
                                size={20}
                                color={colors.gray400}
                            />
                        )}
                    </TouchableOpacity>
                ) : null}

                {iconRight && !isPassword ? (
                    <TouchableOpacity
                        onPress={onIconRightPress}
                        style={styles.iconRightContainer}
                        activeOpacity={0.7}
                        disabled={!onIconRightPress}
                    >
                        <RenderIcon
                            name={iconRight}
                            color={
                                isFocused
                                    ? colors.primary
                                    : colors.gray400
                            }
                        />
                    </TouchableOpacity>
                ) : null}
            </View>

            {error ? (
                <View style={styles.errorRow}>
                    <Warning
                        size={14}
                        color={colors.error}
                    />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {hint && !error ? (
                <Text style={styles.hint}>{hint}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.gray700,
    },
    required: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.error,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.gray200,
        minHeight: 52,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    inputWrapperFocused: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    inputWrapperError: {
        borderColor: colors.error,
        backgroundColor: colors.errorLight,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: colors.gray900,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    inputWithIconLeft: {
        paddingLeft: 4,
    },
    inputWithIconRight: {
        paddingRight: 4,
    },
    iconLeftContainer: {
        marginLeft: 14,
    },
    iconRightContainer: {
        paddingRight: 14,
        paddingLeft: 8,
    },
    errorRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
        gap: 4,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        fontWeight: "500",
    },
    hint: {
        fontSize: 12,
        color: colors.gray500,
        marginTop: 5,
    },
});