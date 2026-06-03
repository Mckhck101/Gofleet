export type StatutPaiement = "EN_ATTENTE" | "REUSSI" | "ECHEC";

export type MethodePaiement =
    | "ORANGE_MONEY"
    | "MTN_MOMO"
    | "CARTE_BANCAIRE"
    | "PAYPAL";

export interface InitierPaiementRequest {
    reservationId: number;
    methode: MethodePaiement;
    numeroPaiement?: string;
}

export interface InitierPaiementResponse {
    paiementId: number;
    referenceTransaction: string;
    urlPaiement: string | null;
    instructionsPaiement: string | null;
    statut: StatutPaiement;
}

export interface ConfirmerPaiementRequest {
    referenceTransaction: string;
    statut: StatutPaiement;
    codeConfirmation?: string;
}

export interface PaiementResponse {
    id: number;
    montant: number;
    methode: MethodePaiement;
    referenceTransaction: string;
    datePaiement: string;
    statut: StatutPaiement;
}