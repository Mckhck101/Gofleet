import { PageResponse } from "./common";

export type StatutAgence = "EN_ATTENTE" | "VALIDE" | "SUSPENDU";

export interface AgenceListeResponse {
    id: number;
    nom: string;
    logoUrl: string;
    villePrincipale: string;
    noteMoyenne: number;
    nombreAvis: number;
}

export interface AgenceDetailResponse extends AgenceListeResponse {
    description: string;
    telephone: string;
    email: string;
    adresse: string;
    siteWeb: string | null;
    statut: StatutAgence;
    dateCreation: string;
}

export interface AvisResponse {
    id: number;
    note: number;
    commentaire: string | null;
    dateAvis: string;
    utilisateur: {
        id: number;
        prenom: string;
        photoProfilUrl: string | null;
    };
    agenceId: number;
}

export interface CreerAvisRequest {
    agenceId: number;
    note: number;
    commentaire?: string;
}

export interface PageAvis {
    contenu: AvisResponse[];
    noteMoyenne: number;
    totalAvis: number;
    pageActuelle: number;
    totalPages: number;
}

export type PageAgence = PageResponse<AgenceListeResponse>;