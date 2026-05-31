package com.gofleet.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.gofleet.enums.StatutReservation;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationCreationResponse(
        @JsonProperty("id_reservation")
        Long idReservation,
        @JsonProperty("numero_voyage")
        String numeroVoyage,
        @JsonProperty("ville_depart")
        String villeDepart,
        @JsonProperty("ville_arrivee")
        String villeArrivee,
        @JsonProperty("date_depart")
        LocalDate dateDepart,
        @JsonProperty("heure_depart")
        LocalTime heureDepart,
        @JsonProperty("numero_siege")
        String numeroSiege,
        BigDecimal montant,
        @JsonProperty("statut_reservation")
        StatutReservation statutReservation
) {
}
