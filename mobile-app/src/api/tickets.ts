import apiClient from "./client";
import {
    TicketResponse,
    ValidationTicketResponse,
    FactureResponse,
} from "@/types/ticket";

export const ticketsApi = {
    getById: async (id: number): Promise<TicketResponse> => {
        const response = await apiClient.get<TicketResponse>(`/tickets/${id}`);
        return response.data;
    },

    valider: async (codeTicket: string): Promise<ValidationTicketResponse> => {
        const response = await apiClient.post<ValidationTicketResponse>(
            "/tickets/valider",
            { codeTicket }
        );
        return response.data;
    },

    getFacture: async (id: number): Promise<FactureResponse> => {
        const response = await apiClient.get<FactureResponse>(
            `/factures/${id}`
        );
        return response.data;
    },
};