package com.gofleet.dto.request;

import com.gofleet.enums.StatutTicket;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record TicketAdminRequest(
        @NotNull Long reservationId,
        String codeTicket,
        String qrCodeBase64,
        String qrCodeUrl,
        LocalDateTime dateExpiration,
        StatutTicket statut
) {
}
