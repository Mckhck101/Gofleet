import { create } from "zustand";
import { UtilisateurResponse } from "@/types/utilisateur";
import { storage } from "@/utils/storage";
import config from "@/constants/config";

interface AuthState {
    // ─── State ───────────────────────────────────
    utilisateur: UtilisateurResponse | null;
    accessToken: string | null;
    refreshToken: string | null;
    estConnecte: boolean;
    chargement: boolean;

    // ─── Actions ─────────────────────────────────
    setAuth: (
        utilisateur: UtilisateurResponse,
        accessToken: string,
        refreshToken: string
    ) => Promise<void>;
    setUtilisateur: (utilisateur: UtilisateurResponse) => void;
    deconnexion: () => Promise<void>;
    chargerDepuisStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    utilisateur: null,
    accessToken: null,
    refreshToken: null,
    estConnecte: false,
    chargement: true,

    setAuth: async (utilisateur, accessToken, refreshToken) => {
        await storage.set(config.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await storage.set(config.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        await storage.set(
            config.STORAGE_KEYS.USER,
            JSON.stringify(utilisateur)
        );
        set({
            utilisateur,
            accessToken,
            refreshToken,
            estConnecte: true,
        });
    },

    setUtilisateur: (utilisateur) => {
        storage.set(config.STORAGE_KEYS.USER, JSON.stringify(utilisateur));
        set({ utilisateur });
    },

    deconnexion: async () => {
        await storage.clear();
        set({
            utilisateur: null,
            accessToken: null,
            refreshToken: null,
            estConnecte: false,
        });
    },

    chargerDepuisStorage: async () => {
        try {
            const token = await storage.get(config.STORAGE_KEYS.ACCESS_TOKEN);
            const refresh = await storage.get(config.STORAGE_KEYS.REFRESH_TOKEN);
            const userStr = await storage.get(config.STORAGE_KEYS.USER);

            if (token && userStr) {
                const utilisateur = JSON.parse(userStr) as UtilisateurResponse;
                set({
                    utilisateur,
                    accessToken: token,
                    refreshToken: refresh,
                    estConnecte: true,
                    chargement: false,
                });
            } else {
                set({ chargement: false });
            }
        } catch {
            set({ chargement: false });
        }
    },
}));