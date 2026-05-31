package com.gofleet.dto.response;

import com.gofleet.enums.StatutTicket;

import java.time.LocalDateTime;

public record TicketResponse(
        Long id,
        Long reservationId,
        String codeTicket,
        String qrCodeBase64,
        String qrCodeUrl,
        LocalDateTime dateGeneration,
        LocalDateTime dateExpiration,
        StatutTicket statut
) {
}
