import apiClient from "./client";
import {
    AuthResponse,
    ConnexionRequest,
    InscriptionRequest,
    RefreshTokenRequest,
    ReinitialisationRequest,
    ConfirmerMotDePasseRequest,
} from "@/types/auth";
import { ApiSuccess } from "@/types/common";

export const authApi = {
    inscription: async (data: InscriptionRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            "/auth/inscription",
            data
        );
        return response.data;
    },

    connexion: async (data: ConnexionRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            "/auth/connexion",
            data
        );
        return response.data;
    },

    refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            "/auth/refresh-token",
            data
        );
        return response.data;
    },

    deconnexion: async (): Promise<ApiSuccess> => {
        const response = await apiClient.post<ApiSuccess>("/auth/deconnexion");
        return response.data;
    },

    demandeReinit: async (data: ReinitialisationRequest): Promise<ApiSuccess> => {
        const response = await apiClient.post<ApiSuccess>(
            "/auth/mot-de-passe/reinitialiser",
            data
        );
        return response.data;
    },

    confirmerMotDePasse: async (
        data: ConfirmerMotDePasseRequest
    ): Promise<ApiSuccess> => {
        const response = await apiClient.post<ApiSuccess>(
            "/auth/mot-de-passe/confirmer",
            data
        );
        return response.data;
    },
};