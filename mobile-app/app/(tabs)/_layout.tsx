import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import {
    House,
    CalendarBlank,
    User,
    ClockCounterClockwise,
    Heart,
} from "phosphor-react-native";
import colors from "@/constants/colors";

export default function TabsLayout() {
    const { t } = useTranslation();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray400,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: 62,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t("navigation.accueil"),
                    tabBarIcon: ({ color, size }) => (
                        <House
                            size={size}
                            color={color}
                            weight={
                                color === colors.primary
                                    ? "fill"
                                    : "regular"
                            }
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="reservations"
                options={{
                    title: t("navigation.reservations"),
                    tabBarIcon: ({ color, size }) => (
                        <CalendarBlank
                            size={size}
                            color={color}
                            weight={
                                color === colors.primary
                                    ? "fill"
                                    : "regular"
                            }
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="historique"
                options={{
                    title: t("navigation.historique"),
                    tabBarIcon: ({ color, size }) => (
                        <ClockCounterClockwise
                            size={size}
                            color={color}
                            weight={
                                color === colors.primary
                                    ? "fill"
                                    : "regular"
                            }
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="favoris"
                options={{
                    title: t("navigation.favoris"),
                    tabBarIcon: ({ color, size }) => (
                        <Heart
                            size={size}
                            color={color}
                            weight={
                                color === colors.primary
                                    ? "fill"
                                    : "regular"
                            }
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profil"
                options={{
                    title: t("navigation.profil"),
                    tabBarIcon: ({ color, size }) => (
                        <User
                            size={size}
                            color={color}
                            weight={
                                color === colors.primary
                                    ? "fill"
                                    : "regular"
                            }
                        />
                    ),
                }}
            />
        </Tabs>
    );
}