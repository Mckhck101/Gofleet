import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import {
    ConnexionRequest,
    InscriptionRequest,
    ConfirmerMotDePasseRequest,
    ReinitialisationRequest,
} from "@/types/auth";
import { AxiosError } from "axios";

export function useConnexion() {
    const { setAuth } = useAuthStore();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: ConnexionRequest) => authApi.connexion(data),
        onSuccess: async (response) => {
            await setAuth(
                response.utilisateur,
                response.accessToken,
                response.refreshToken
            );
            router.replace("/bienvenue");
        },
        onError: (error: AxiosError) => {
            console.error("Erreur connexion :", error.message);
        },
    });
}

export function useInscription() {
    const { setAuth } = useAuthStore();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: InscriptionRequest) => authApi.inscription(data),
        onSuccess: async (response) => {
            await setAuth(
                response.utilisateur,
                response.accessToken,
                response.refreshToken
            );
            router.replace("/bienvenue");
        },
        onError: (error: AxiosError) => {
            console.error("Erreur inscription :", error.message);
        },
    });
}

export function useDeconnexion() {
    const { deconnexion } = useAuthStore();
    const router = useRouter();

    return useMutation({
        mutationFn: () => authApi.deconnexion(),
        onSuccess: async () => {
            await deconnexion();
            router.replace("/(auth)/connexion");
        },
        onError: async () => {
            // Déconnexion locale même si l'API échoue
            await deconnexion();
            router.replace("/(auth)/connexion");
        },
    });
}

export function useDemandeReinit() {
    return useMutation({
        mutationFn: (data: ReinitialisationRequest) =>
            authApi.demandeReinit(data),
    });
}

export function useConfirmerMotDePasse() {
    return useMutation({
        mutationFn: (data: ConfirmerMotDePasseRequest) =>
            authApi.confirmerMotDePasse(data),
    });
}