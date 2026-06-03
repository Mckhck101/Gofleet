import React, { useMemo } from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, MagnifyingGlass, Microphone, SlidersHorizontal } from "phosphor-react-native";
import colors from "@/constants/colors";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import VoyageCard from "@/components/voyage/VoyageCard";
import VoiceReservation from "@/components/ui/VoiceReservation";
import { useRechercheVoyages } from "@/hooks/useVoyages";
import { useSearchStore } from "@/store/searchStore";
import { VoyageListeResponse } from "@/types/voyage";
import { formatDate } from "@/utils/format";

export default function ResultatsVoyagesScreen() {
    const router = useRouter();
    const [voiceVisible, setVoiceVisible] = React.useState(false);
    const {
        villeDepart,
        villeArrivee,
        dateDepart,
        typeClasse,
        prixMin,
        prixMax,
        tri,
    } = useSearchStore();

    const params = useMemo(
        () => ({
            villeDepart: villeDepart.trim(),
            villeArrivee: villeArrivee.trim(),
            dateDepart: dateDepart || undefined,
            typeClasse,
            prixMin,
            prixMax,
            tri,
            taille: 10,
        }),
        [villeDepart, villeArrivee, dateDepart, typeClasse, prixMin, prixMax, tri]
    );

    const recherche = useRechercheVoyages(params, true);
    const voyages = recherche.data?.pages.flatMap((page) => page.contenu) ?? [];
    const canSearch = !!params.villeDepart && !!params.villeArrivee;

    const subtitle = canSearch
        ? `${params.villeDepart} -> ${params.villeArrivee}${dateDepart ? `, ${formatDate(dateDepart)}` : ""}`
        : "Renseignez une ville de depart et une ville d'arrivee";

    function renderVoyage({ item }: { item: VoyageListeResponse }) {
        return (
            <VoyageCard
                id={item.id}
                numeroVoyage={item.numeroVoyage}
                agenceNom={item.agence?.nom ?? "Agence"}
                villeDepart={item.villeDepart}
                gareDepart={item.gareDepart}
                villeArrivee={item.villeArrivee}
                gareArrivee={item.gareArrivee}
                dateDepart={item.dateDepart}
                heureDepart={item.heureDepart}
                heureArriveeEstimee={item.heureArriveeEstimee}
                dureeEstimee={item.dureeEstimee}
                typeClasse={item.typeClasse}
                placesRestantes={item.placesRestantes}
                prixNormal={item.prixNormal}
                prixPromo={item.prixPromo}
                devise={item.devise}
                statut={item.statut}
                noteMoyenne={item.noteMoyenne ?? 0}
                onDetails={() => router.push(`/voyages/${item.id}` as any)}
                onReserver={() => router.push(`/voyages/${item.id}` as any)}
            />
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                    <ArrowLeft size={22} color={colors.white} weight="bold" />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Resultats</Text>
                    <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setVoiceVisible(true)}>
                    <Microphone size={22} color={colors.white} weight="fill" />
                </TouchableOpacity>
            </View>

            {!canSearch ? (
                <EmptyState
                    icon="search-outline"
                    title="Recherche incomplete"
                    description="Lancez une recherche depuis l'accueil ou utilisez la recherche vocale."
                    actionLabel="Recherche vocale"
                    onAction={() => setVoiceVisible(true)}
                />
            ) : recherche.isLoading ? (
                <Loader fullScreen message="Recherche des voyages..." />
            ) : recherche.isError ? (
                <EmptyState
                    icon="warning-outline"
                    title="Recherche indisponible"
                    description="Le backend n'a pas repondu correctement."
                    actionLabel="Reessayer"
                    onAction={() => recherche.refetch()}
                />
            ) : voyages.length === 0 ? (
                <EmptyState
                    icon="bus-outline"
                    title="Aucun voyage trouve"
                    description="Essayez une autre date, ou recherchez sans date precise."
                    actionLabel="Recherche vocale"
                    onAction={() => setVoiceVisible(true)}
                />
            ) : (
                <FlatList
                    data={voyages}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderVoyage}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={recherche.isRefetching}
                            onRefresh={recherche.refetch}
                            colors={[colors.primary]}
                        />
                    }
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <View style={styles.countPill}>
                                <MagnifyingGlass size={14} color={colors.primary} weight="bold" />
                                <Text style={styles.countText}>
                                    {recherche.data?.pages[0]?.totalElements ?? voyages.length} voyage(s)
                                </Text>
                            </View>
                            <View style={styles.countPill}>
                                <SlidersHorizontal size={14} color={colors.primary} weight="bold" />
                                <Text style={styles.countText}>{tri}</Text>
                            </View>
                        </View>
                    }
                    onEndReached={() => {
                        if (recherche.hasNextPage && !recherche.isFetchingNextPage) {
                            recherche.fetchNextPage();
                        }
                    }}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={
                        recherche.isFetchingNextPage ? (
                            <Loader message="Chargement..." />
                        ) : null
                    }
                />
            )}

            <VoiceReservation
                visible={voiceVisible}
                onClose={() => setVoiceVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: { flex: 1 },
    title: { fontSize: 20, fontWeight: "800", color: colors.white },
    subtitle: { fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 2 },
    list: { padding: 16, paddingBottom: 32 },
    listHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    countPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.white,
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    countText: { fontSize: 12, color: colors.gray700, fontWeight: "700" },
});
