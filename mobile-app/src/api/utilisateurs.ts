import apiClient from "./client";
import { UtilisateurResponse, MiseAJourProfilRequest } from "@/types/utilisateur";
import { ApiSuccess } from "@/types/common";

export const utilisateursApi = {
    getMonProfil: async (): Promise<UtilisateurResponse> => {
        const response = await apiClient.get<UtilisateurResponse>(
            "/utilisateurs/moi"
        );
        return response.data;
    },

    mettreAJourProfil: async (
        data: MiseAJourProfilRequest
    ): Promise<UtilisateurResponse> => {
        const response = await apiClient.put<UtilisateurResponse>(
            "/utilisateurs/moi",
            data
        );
        return response.data;
    },

    uploadPhotoProfil: async (
        formData: FormData
    ): Promise<{ photoUrl: string }> => {
        const response = await apiClient.post<{ photoUrl: string }>(
            "/utilisateurs/moi/photo",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data;
    },

    uploadCNI: async (formData: FormData): Promise<ApiSuccess> => {
        const response = await apiClient.post<ApiSuccess>(
            "/utilisateurs/moi/cni",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data;
    },
};