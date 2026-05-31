package com.gofleet.dto.request;

import jakarta.validation.constraints.*;

public record AvisRequest(
        Long utilisateurId,
        @NotNull Long agenceId,
        @Min(1) @Max(5) Integer note,
        @Size(max = 1000) String commentaire
) {
}
