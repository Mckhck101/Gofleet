package com.gofleet.dto.request;

import com.gofleet.enums.MethodePaiement;
import com.gofleet.enums.StatutPaiement;
import jakarta.validation.constraints.NotNull;

public record PaiementRequest(
        @NotNull Long reservationId,
        @NotNull MethodePaiement methode,
        String numeroPaiement,
        StatutPaiement statut,
        String referenceTransaction
) {
}
