export type StatutVerification = "NON_VERIFIE" | "EN_COURS" | "VERIFIE";

export interface UtilisateurResponse {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    dateNaissance: string;
    sexe: "M" | "F";
    photoProfilUrl: string | null;
    numeroCni: string | null;
    statutVerification: StatutVerification;
    dateCreation: string;
}

export interface MiseAJourProfilRequest {
    nom?: string;
    prenom?: string;
    telephone?: string;
    dateNaissance?: string;
    sexe?: "M" | "F";
    numeroCni?: string;
}