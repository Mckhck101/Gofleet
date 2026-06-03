import { create } from "zustand";
import { VoyageDetailResponse, SiegeResponse } from "@/types/voyage";
import { CreerReservationRequest, ReservationDetailResponse } from "@/types/reservation";
import { MethodePaiement, PaiementResponse } from "@/types/paiement";

export interface ConfirmationPaiementState {
    paiement: PaiementResponse;
    reservation: ReservationDetailResponse;
    message: string;
}

interface ReservationState {
    // ─── Étapes du tunnel de réservation ─────────
    voyageSelectionne: VoyageDetailResponse | null;
    siegeSelectionne: SiegeResponse | null;
    infosVoyageur: Partial<CreerReservationRequest> | null;
    methodePaiement: MethodePaiement | null;
    reservationId: number | null;
    paiementId: number | null;
    confirmationPaiement: ConfirmationPaiementState | null;

    // ─── Actions ──────────────────────────────────
    setVoyage: (voyage: VoyageDetailResponse) => void;
    setSiege: (siege: SiegeResponse) => void;
    setInfosVoyageur: (infos: Partial<CreerReservationRequest>) => void;
    setMethodePaiement: (methode: MethodePaiement) => void;
    setReservationId: (id: number) => void;
    setPaiementId: (id: number) => void;
    setConfirmationPaiement: (confirmation: ConfirmationPaiementState) => void;
    reset: () => void;
}

const initialState = {
    voyageSelectionne: null,
    siegeSelectionne: null,
    infosVoyageur: null,
    methodePaiement: null,
    reservationId: null,
    paiementId: null,
    confirmationPaiement: null,
};

export const useReservationStore = create<ReservationState>((set) => ({
    ...initialState,

    setVoyage: (voyage) => set({ voyageSelectionne: voyage }),
    setSiege: (siege) => set({ siegeSelectionne: siege }),
    setInfosVoyageur: (infos) => set({ infosVoyageur: infos }),
    setMethodePaiement: (methode) => set({ methodePaiement: methode }),
    setReservationId: (id) => set({ reservationId: id }),
    setPaiementId: (id) => set({ paiementId: id }),
    setConfirmationPaiement: (confirmation) =>
        set({ confirmationPaiement: confirmation }),
    reset: () => set(initialState),
}));
