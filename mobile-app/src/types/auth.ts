import { UtilisateurResponse } from "@/types/utilisateur";

export interface InscriptionRequest {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    motDePasse: string;
    dateNaissance: string;
    sexe: "M" | "F";
    numeroCni?: string;
}

export interface ConnexionRequest {
    email: string;
    motDePasse: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    utilisateur: UtilisateurResponse;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface ReinitialisationRequest {
    email: string;
}

export interface ConfirmerMotDePasseRequest {
    token: string;
    nouveauMotDePasse: string;
}