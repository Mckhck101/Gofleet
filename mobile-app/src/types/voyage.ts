import { AgenceListeResponse } from "./agence";
import { PageResponse } from "./common";

export type TypeClasse =
    | "VIP"
    | "CLASSIQUE"
    | "BUSINESS"
    | "PREMIERE_CLASSE";

export type StatutVoyage =
    | "OUVERT"
    | "COMPLET"
    | "ANNULE"
    | "TERMINE";

export type StatutSiege =
    | "DISPONIBLE"
    | "RESERVE"
    | "OCCUPE";

export interface MoyenTransportResponse {
    id: number;
    libelle: string;
    description: string;
}

export interface VehiculeResponse {
    id: number;
    numeroVehicule: string;
    marque: string;
    immatriculation: string;
    capacite: number;
    typeClasse: TypeClasse;
    moyenTransport: MoyenTransportResponse;
}

export interface VoyageListeResponse {
    id: number;
    numeroVoyage: string;
    agence: AgenceListeResponse;
    villeDepart: string;
    gareDepart: string;
    villeArrivee: string;
    gareArrivee: string;
    dateDepart: string;
    heureDepart: string;
    heureArriveeEstimee: string;
    dureeEstimee: string;
    typeClasse: TypeClasse;
    placesRestantes: number;
    prixNormal: number;
    prixPromo: number | null;
    devise: string;
    statut: StatutVoyage;
    noteMoyenne: number;
}

export interface VoyageDetailResponse extends VoyageListeResponse {
    vehicule: VehiculeResponse;
    bagage: string | null;
    description: string | null;
}

export interface SiegeResponse {
    id: number;
    numeroSiege: string;
    statut: StatutSiege;
}

export interface RechercheVoyageParams {
    villeDepart: string;
    villeArrivee: string;
    dateDepart: string;
    typeClasse?: TypeClasse;
    prixMin?: number;
    prixMax?: number;
    agenceId?: number;
    page?: number;
    taille?: number;
    tri?: "prixAsc" | "prixDesc" | "heureAsc" | "noteDesc";
}

export type PageVoyage = PageResponse<VoyageListeResponse>;