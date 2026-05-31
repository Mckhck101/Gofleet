package com.gofleet.dto.response;

import com.gofleet.enums.TypeClasse;

public record VehiculeResponse(
        Long id,
        String numeroVehicule,
        String marque,
        String immatriculation,
        Integer capacite,
        TypeClasse typeClasse,
        Long agenceId,
        MoyenTransportResponse moyenTransport
) {
}
