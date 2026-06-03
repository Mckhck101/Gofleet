import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { utilisateursApi } from "@/api/utilisateurs";
import { useAuthStore } from "@/store/authStore";
import { MiseAJourProfilRequest } from "@/types/utilisateur";

export const utilisateurKeys = {
    all: ["utilisateur"] as const,
    profil: () => [...utilisateurKeys.all, "profil"] as const,
};

export function useMonProfil() {
    const { estConnecte } = useAuthStore();

    return useQuery({
        queryKey: utilisateurKeys.profil(),
        queryFn: () => utilisateursApi.getMonProfil(),
        enabled: estConnecte,
    });
}

export function useMettreAJourProfil() {
    const queryClient = useQueryClient();
    const { setUtilisateur } = useAuthStore();

    return useMutation({
        mutationFn: (data: MiseAJourProfilRequest) =>
            utilisateursApi.mettreAJourProfil(data),
        onSuccess: (utilisateur) => {
            setUtilisateur(utilisateur);
            queryClient.invalidateQueries({
                queryKey: utilisateurKeys.profil(),
            });
        },
    });
}

export function useUploadPhotoProfil() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) =>
            utilisateursApi.uploadPhotoProfil(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: utilisateurKeys.profil(),
            });
        },
    });
}

export function useUploadCNI() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) =>
            utilisateursApi.uploadCNI(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: utilisateurKeys.profil(),
            });
        },
    });
}