package com.gofleet.dto.request;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record FactureAdminRequest(@NotNull Long reservationId, String numeroFacture, @NotNull BigDecimal montant, String pdfUrl) {
}
