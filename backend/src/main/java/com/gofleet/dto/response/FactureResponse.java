package com.gofleet.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FactureResponse(
        Long id,
        Long reservationId,
        String numeroFacture,
        LocalDateTime dateGeneration,
        BigDecimal montant,
        String pdfUrl
) {
}
