package com.gofleet.dto.response;

public record ConfirmerPaiementResponse(PaiementResponse paiement, ReservationResponse reservation, String message) {
}
