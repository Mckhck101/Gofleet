package com.gofleet.dto.request;

import com.gofleet.enums.StatutVoyage;
import com.gofleet.enums.TypeClasse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record VoyageRequest(
        @NotBlank String numeroVoyage,
        @NotNull Long agenceId,
        @NotNull Long vehiculeId,
        @NotBlank String villeDepart,
        String gareDepart,
        @NotBlank String villeArrivee,
        String gareArrivee,
        @NotNull LocalDate dateDepart,
        @NotNull LocalTime heureDepart,
        LocalTime heureArriveeEstimee,
        String dureeEstimee,
        TypeClasse typeClasse,
        @Positive Integer placesTotales,
        @Positive Integer placesRestantes,
        @NotNull BigDecimal prixNormal,
        BigDecimal prixPromo,
        String devise,
        StatutVoyage statut,
        String bagage,
        String description
) {
}
