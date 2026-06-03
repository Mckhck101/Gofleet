import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paiementsApi } from "@/api/paiements";
import {
    InitierPaiementRequest,
    ConfirmerPaiementRequest,
} from "@/types/paiement";
import { reservationsKeys } from "./useReservations";

export const paiementsKeys = {
    all: ["paiements"] as const,
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

