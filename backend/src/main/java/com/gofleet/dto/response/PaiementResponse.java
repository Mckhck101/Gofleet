package com.gofleet.dto.response;

import com.gofleet.enums.MethodePaiement;
import com.gofleet.enums.StatutPaiement;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaiementResponse(
        Long id,
        Long reservationId,
        BigDecimal montant,
        MethodePaiement methode,
        String referenceTransaction,
        String numeroPaiement,
        LocalDateTime datePaiement,
        StatutPaiement statut,
        String urlPaiement,
        String instructionsPaiement
) {
}
