package com.gofleet.dto.response;

import com.gofleet.enums.StatutReservation;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReservationResponse(
        Long id,
        UtilisateurResponse utilisateur,
        VoyageResponse voyage,
        SiegeResponse siege,
        String nomComplet,
        String telephone,
        String email,
        String numeroPieceIdentite,
        String contactUrgenceNom,
        String contactUrgenceTelephone,
        BigDecimal montant,
        StatutReservation statut,
        LocalDateTime dateReservation,
        PaiementResponse paiement,
        FactureResponse facture,
        TicketResponse ticket
) {
}
