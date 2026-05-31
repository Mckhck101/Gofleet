package com.gofleet.dto.request;

import com.gofleet.enums.StatutReservation;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ReservationAdminRequest(
        @NotNull Long utilisateurId,
        @NotNull Long voyageId,
        @NotNull Long siegeId,
        @NotBlank String nomComplet,
        @NotBlank String telephone,
        @Email @NotBlank String email,
        @NotBlank String numeroPieceIdentite,
        String contactUrgenceNom,
        String contactUrgenceTelephone,
        @NotNull BigDecimal montant,
        StatutReservation statut
) {
}
