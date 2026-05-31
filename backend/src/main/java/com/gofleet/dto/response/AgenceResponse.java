package com.gofleet.dto.response;

import com.gofleet.enums.StatutAgence;

import java.time.LocalDateTime;

public record AgenceResponse(
        Long id,
        String nom,
        String logoUrl,
        String villePrincipale,
        String description,
        String telephone,
        String email,
        String adresse,
        String siteWeb,
        StatutAgence statut,
        LocalDateTime dateCreation,
        double noteMoyenne,
        long nombreAvis
) {
}
