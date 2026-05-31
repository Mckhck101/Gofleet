package com.gofleet.dto.request;

import com.gofleet.enums.TypeClasse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record VehiculeRequest(
        @NotBlank String numeroVehicule,
        String marque,
        @NotBlank String immatriculation,
        @Positive Integer capacite,
        TypeClasse typeClasse,
        @NotNull Long agenceId,
        @NotNull Long moyenTransportId
) {
}
