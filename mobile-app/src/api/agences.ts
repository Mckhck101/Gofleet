import apiClient from "./client";
import {
    AgenceDetailResponse,
    PageAgence,
    PageAvis,
    CreerAvisRequest,
    AvisResponse,
} from "@/types/agence";

export const agencesApi = {
    lister: async (params: {
        page?: number;
        taille?: number;
        ville?: string;
    }): Promise<PageAgence> => {
        const response = await apiClient.get<PageAgence>("/agences", { params });
        return response.data;
    },

    getById: async (id: number): Promise<AgenceDetailResponse> => {
        const response = await apiClient.get<AgenceDetailResponse>(
            `/agences/${id}`
        );
        return response.data;
    },

    getAvis: async (
        id: number,
        params: { page?: number; taille?: number }
    ): Promise<PageAvis> => {
        const response = await apiClient.get<PageAvis>(
            `/agences/${id}/avis`,
            { params }
        );
        return response.data;
    },

    laisserAvis: async (data: CreerAvisRequest): Promise<AvisResponse> => {
        const response = await apiClient.post<AvisResponse>("/avis", data);
        return response.data;
    },

    getMesAvis: async (): Promise<AvisResponse[]> => {
        const response = await apiClient.get<AvisResponse[]>("/avis/moi");
        return response.data;
    },
};