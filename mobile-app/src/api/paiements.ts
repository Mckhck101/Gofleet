import apiClient from "./client";
import {
    InitierPaiementRequest,
    InitierPaiementResponse,
    ConfirmerPaiementRequest,
    PaiementResponse,
} from "@/types/paiement";
import { ReservationDetailResponse } from "@/types/reservation";

export const paiementsApi = {
    initier: async (
        data: InitierPaiementRequest
    ): Promise<InitierPaiementResponse> => {
        const response = await apiClient.post<InitierPaiementResponse>(
            "/paiements/initier",
            data
        );
        return response.data;
    },

    confirmer: async (
        data: ConfirmerPaiementRequest
    ): Promise<{
        paiement: PaiementResponse;
        reservation: ReservationDetailResponse;
        message: string;
    }> => {
        const response = await apiClient.post("/paiements/confirmer", data);
        return response.data;
    },
};
