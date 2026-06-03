import apiClient from "./client";
import {
    CreerReservationRequest,
    ReservationCreationResponse,
    ReservationDetailResponse,
    PageReservation,
    StatutReservation,
} from "@/types/reservation";
import { ApiSuccess } from "@/types/common";
import { TicketResponse } from "@/types/ticket";
import { FactureResponse } from "@/types/ticket";

export const reservationsApi = {
    getMesReservations: async (params: {
        statut?: StatutReservation;
        page?: number;
        taille?: number;
    }): Promise<PageReservation> => {
        const response = await apiClient.get<PageReservation>("/reservations", {
            params,
        });
        return response.data;
    },

    creer: async (
        data: CreerReservationRequest
    ): Promise<ReservationCreationResponse> => {
        const response = await apiClient.post<ReservationCreationResponse>(
            "/reservations",
            data
        );
        return response.data;
    },

    getById: async (id: number): Promise<ReservationDetailResponse> => {
        const response = await apiClient.get<ReservationDetailResponse>(
            `/reservations/${id}`
        );
        return response.data;
    },

    annuler: async (id: number): Promise<ApiSuccess> => {
        const response = await apiClient.delete<ApiSuccess>(`/reservations/${id}`);
        return response.data;
    },

    uploadPieceIdentite: async (
        id: number,
        formData: FormData
    ): Promise<ApiSuccess> => {
        const response = await apiClient.post<ApiSuccess>(
            `/reservations/${id}/piece-identite`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data;
    },

    getTicket: async (id: number): Promise<TicketResponse> => {
        const response = await apiClient.get<TicketResponse>(
            `/tickets/reservation/${id}`
        );
        return response.data;
    },

    getFacture: async (id: number): Promise<FactureResponse> => {
        const response = await apiClient.get<FactureResponse>(
            `/factures/reservation/${id}`
        );
        return response.data;
    },
};
