import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paiementsApi } from "@/api/paiements";
import {
    InitierPaiementRequest,
    ConfirmerPaiementRequest,
} from "@/types/paiement";
import { reservationsKeys } from "./useReservations";

export const paiementsKeys = {
    all: ["paiements"] as const,
    statut: (id: number) => [...paiementsKeys.all, "statut", id] as const,
};

export function useInitierPaiement() {
    return useMutation({
        mutationFn: (data: InitierPaiementRequest) =>
            paiementsApi.initier(data),
    });
}

export function useConfirmerPaiement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ConfirmerPaiementRequest) =>
            paiementsApi.confirmer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: reservationsKeys.all,
            });
        },
    });
}

export function useStatutPaiement(id: number, enabled: boolean = true) {
    return useQuery({
        queryKey: paiementsKeys.statut(id),
        queryFn: () => paiementsApi.getStatut(id),
        enabled: enabled && !!id,
        refetchInterval: 5000, // Polling toutes les 5s
    });
}