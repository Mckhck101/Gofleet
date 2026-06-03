export type StatutTicket = "VALIDE" | "UTILISE" | "ANNULE";

export interface TicketResponse {
    id: number;
    codeTicket: string;
    qrCodeBase64: string;
    qrCodeUrl: string;
    dateGeneration: string;
    dateExpiration: string;
    statut: StatutTicket;
    reservationId: number;
}

export interface FactureResponse {
    id: number;
    numeroFacture: string;
    dateGeneration: string;
    montant: number;
    pdfUrl: string;
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