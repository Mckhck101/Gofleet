package com.gofleet.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreerReservationRequest(
        Long utilisateurId,
        @NotNull Long voyageId,
        @NotNull Long siegeId,
        @NotBlank String nomComplet,
        @NotBlank String telephone,
        @Email @NotBlank String email,
        @NotBlank String numeroPieceIdentite,
        String contactUrgenceNom,
        String contactUrgenceTelephone,
        BigDecimal montant,
        @AssertTrue Boolean accepteConditions
) {
}
