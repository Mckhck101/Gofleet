import apiClient from "./client";
import {
    VoyageDetailResponse,
    PageVoyage,
    SiegeResponse,
    RechercheVoyageParams,
    MoyenTransportResponse,
} from "@/types/voyage";

export const voyagesApi = {
    rechercher: async (params: RechercheVoyageParams): Promise<PageVoyage> => {
        const response = await apiClient.get<PageVoyage>("/voyages", { params });
        return response.data;
    },

    getById: async (id: number): Promise<VoyageDetailResponse> => {
        const response = await apiClient.get<VoyageDetailResponse>(
            `/voyages/${id}`
        );
        return response.data;
    },

    getSieges: async (id: number): Promise<SiegeResponse[]> => {
        const response = await apiClient.get<SiegeResponse[]>(
            `/voyages/${id}/sieges`
        );
        return response.data;
    },

    getMoyensTransport: async (): Promise<MoyenTransportResponse[]> => {
        const response = await apiClient.get<MoyenTransportResponse[]>(
            "/moyens-transport"
        );
        return response.data;
    },
};