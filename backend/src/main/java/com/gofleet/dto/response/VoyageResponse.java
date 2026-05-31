package com.gofleet.dto.response;

import com.gofleet.enums.StatutVoyage;
import com.gofleet.enums.TypeClasse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record VoyageResponse(
        Long id,
        String numeroVoyage,
        AgenceResponse agence,
        VehiculeResponse vehicule,
        String villeDepart,
        String gareDepart,
        String villeArrivee,
        String gareArrivee,
        LocalDate dateDepart,
        LocalTime heureDepart,
        LocalTime heureArriveeEstimee,
        String dureeEstimee,
        TypeClasse typeClasse,
        Integer placesTotales,
        Integer placesRestantes,
        BigDecimal prixNormal,
        BigDecimal prixPromo,
        String devise,
        StatutVoyage statut,
        String bagage,
        String description,
        double noteMoyenne
) {
}
