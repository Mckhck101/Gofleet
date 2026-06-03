import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
} from "react-native";
import { Bus } from "phosphor-react-native";
import colors from "@/constants/colors";

interface AnimatedTrajetProps {
    villeDepart: string;
    villeArrivee: string;
    heureDepart?: string;
    heureArrivee?: string;
    duree?: string;
    couleur?: string;
}

export default function AnimatedTrajet({
    villeDepart,
    villeArrivee,
    heureDepart,
    heureArrivee,
    duree,
    couleur = colors.primary,
}: AnimatedTrajetProps) {
    const busPosition = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(busPosition, {
                    toValue: 1,
                    duration: 2800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(busPosition, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(busPosition, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <View style={styles.container}>
            {/* ── Villes ── */}
            <View style={styles.villesRow}>
                {/* Départ */}
                <View style={styles.villeBlock}>
                    {heureDepart ? (
                        <Text
                            style={[
                                styles.heure,
                                { color: couleur },
                            ]}
                        >
                            {heureDepart}
                        </Text>
                    ) : null}
                    <Text style={styles.villeNom}>{villeDepart}</Text>
                    <View
                        style={[
                            styles.villeDot,
                            { backgroundColor: couleur },
                        ]}
                    />
                </View>

                {/* ── Ligne animée ── */}
                <View style={styles.ligneContainer}>
                    {/* Ligne de fond */}
                    <View style={styles.ligneFond} />

                    {/* Ligne colorée animée */}
                    <Animated.View
                        style={[
                            styles.ligneColoree,
                            {
                                backgroundColor: couleur,
                                width: busPosition.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ["0%", "100%"],
                                }),
                            },
                        ]}
                    />

                    {/* Bus animé */}
                    <Animated.View
                        style={[
                            styles.busWrapper,
                            {
                                transform: [
                                    {
                                        translateX:
                                            busPosition.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [
                                                    -14,
                                                    // largeur ligne - taille bus
                                                    100,
                                                ],
                                            }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.busCircle,
                                { backgroundColor: couleur },
                            ]}
                        >
                            <Bus
                                size={11}
                                color={colors.white}
                                weight="fill"
                            />
                        </View>
                    </Animated.View>

                    {/* Durée */}
                    {duree ? (
                        <View style={styles.dureeContainer}>
                            <Text style={styles.dureeText}>
                                {duree}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Arrivée */}
                <View style={styles.villeBlock}>
                    {heureArrivee ? (
                        <Text
                            style={[
                                styles.heure,
                                { color: couleur },
                            ]}
                        >
                            {heureArrivee}
                        </Text>
                    ) : null}
                    <Text style={styles.villeNom}>{villeArrivee}</Text>
                    <View
                        style={[
                            styles.villeDot,
                            styles.villeDotRight,
                            { backgroundColor: couleur },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    villesRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    // ─── Villes ──────────────────────────────────
    villeBlock: {
        alignItems: "center",
        minWidth: 70,
        position: "relative",
        paddingBottom: 10,
    },
    heure: {
        fontSize: 15,
        fontWeight: "800",
        marginBottom: 2,
    },
    villeNom: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.gray700,
        textAlign: "center",
    },
    villeDot: {
        position: "absolute",
        bottom: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        alignSelf: "center",
    },
    villeDotRight: {
        alignSelf: "center",
    },

    // ─── Ligne ───────────────────────────────────
    ligneContainer: {
        flex: 1,
        height: 32,
        justifyContent: "center",
        position: "relative",
        marginBottom: 10,
    },
    ligneFond: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: colors.gray200,
        borderRadius: 1,
    },
    ligneColoree: {
        position: "absolute",
        left: 0,
        height: 2,
        borderRadius: 1,
    },
    busWrapper: {
        position: "absolute",
        top: "50%",
        marginTop: -11,
    },
    busCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 4,
    },
    dureeContainer: {
        position: "absolute",
        bottom: -16,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    dureeText: {
        fontSize: 10,
        color: colors.gray400,
        fontWeight: "500",
    },
});