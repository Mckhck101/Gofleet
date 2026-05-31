package com.gofleet.dto.request;

import com.gofleet.enums.StatutSiege;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SiegeRequest(@NotBlank String numeroSiege, StatutSiege statut, @NotNull Long voyageId) {
}
