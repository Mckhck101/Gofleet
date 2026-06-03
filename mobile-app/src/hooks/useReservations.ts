import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/api/reservations";
import { CreerReservationRequest, StatutReservation } from "@/types/reservation";

export const reservationsKeys = {
    all: ["reservations"] as const,
    liste: (statut?: StatutReservation) =>
        [...reservationsKeys.all, "liste", statut] as const,
    detail: (id: number) =>
        [...reservationsKeys.all, "detail", id] as const,
    ticket: (id: number) =>
        [...reservationsKeys.all, "ticket", id] as const,
    facture: (id: number) =>
        [...reservationsKeys.all, "facture", id] as const,
};

export function useMesReservations(statut?: StatutReservation) {
    return useQuery({
        queryKey: reservationsKeys.liste(statut),
        queryFn: () =>
            reservationsApi.getMesReservations({ statut, page: 0, taille: 20 }),
    });
}

export function useReservationDetail(id: number) {
    return useQuery({
        queryKey: reservationsKeys.detail(id),
        queryFn: () => reservationsApi.getById(id),
        enabled: !!id,
    });
}

export function useCreerReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreerReservationRequest) =>
            reservationsApi.creer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: reservationsKeys.all,
            });
        },
    });
}

export function useAnnulerReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => reservationsApi.annuler(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: reservationsKeys.all,
            });
        },
    });
}

export function useTicketReservation(id: number) {
    return useQuery({
        queryKey: reservationsKeys.ticket(id),
        queryFn: () => reservationsApi.getTicket(id),
        enabled: !!id,
    });
}

export function useFactureReservation(id: number) {
    return useQuery({
        queryKey: reservationsKeys.facture(id),
        queryFn: () => reservationsApi.getFacture(id),
        enabled: !!id,
    });
}