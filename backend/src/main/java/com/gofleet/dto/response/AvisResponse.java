package com.gofleet.dto.response;

import java.time.LocalDateTime;

public record AvisResponse(
        Long id,
        Integer note,
        String commentaire,
        LocalDateTime dateAvis,
        Long utilisateurId,
        String utilisateurPrenom,
        String photoProfilUrl,
        Long agenceId
) {
}
