export type StatutTicket = "VALIDE" | "UTILISE" | "ANNULE";

export interface TicketResponse {
    id: number;
    codeTicket: string;
    qrCodeBase64: string | null;
    qrCodeUrl: string | null;
    dateGeneration: string | null;
    dateExpiration: string | null;
    statut: StatutTicket;
    reservationId: number;
}

export interface FactureResponse {
    id: number;
    numeroFacture: string;
    dateGeneration: string | null;
    montant: number;
    pdfUrl: string | null;
}

export interface ValidationTicketResponse {
    valide: boolean;
    message: string;
    ticket: TicketResponse;
    voyageur: {
        nomComplet: string;
        numeroSiege: string;
        villeDepart: string;
        villeArrivee: string;
    };
}
