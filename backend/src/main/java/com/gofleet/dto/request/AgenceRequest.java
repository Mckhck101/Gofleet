package com.gofleet.dto.request;

import com.gofleet.enums.StatutAgence;
import jakarta.validation.constraints.NotBlank;

public record AgenceRequest(
        @NotBlank String nom,
        String logoUrl,
        String villePrincipale,
        String description,
        String telephone,
        String email,
        String adresse,
        String siteWeb,
        StatutAgence statut
) {
}
