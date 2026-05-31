package com.gofleet.dto.request;

import com.gofleet.enums.StatutPaiement;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConfirmerPaiementRequest(
        @NotBlank String referenceTransaction,
        @NotNull StatutPaiement statut,
        String codeConfirmation
) {
}
