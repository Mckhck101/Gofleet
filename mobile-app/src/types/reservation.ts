import { PageResponse } from "@/types/common";
import { VoyageListeResponse, SiegeResponse } from "@/types/voyage";
import { PaiementResponse } from "@/types/paiement";
import { TicketResponse, FactureResponse } from "@/types/ticket";

export type StatutReservation =
    | "EN_ATTENTE"
    | "CONFIRMEE"
    | "ANNULEE"
    | "TERMINEE";

export interface CreerReservationRequest {
    voyageId: number;
    siegeId: number;
    nomComplet: string;
    telephone: string;
    email: string;
    numeroPieceIdentite: string;
    contactUrgenceNom?: string;
    contactUrgenceTelephone?: string;
    accepteConditions: boolean;
}

export interface ReservationListeResponse {
    id: number;
    voyage: VoyageListeResponse;
    siege: SiegeResponse;
    montant: number;
    statut: StatutReservation;
    dateReservation: string;
}

export interface ReservationDetailResponse extends ReservationListeResponse {
    nomComplet: string;
    telephone: string;
    email: string;
    numeroPieceIdentite: string;
    contactUrgenceNom: string | null;
    contactUrgenceTelephone: string | null;
    paiement: PaiementResponse | null;
    ticket: TicketResponse | null;
    facture: FactureResponse | null;
}

export type PageReservation = PageResponse<ReservationListeResponse>;