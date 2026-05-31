package com.gofleet.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MoyenTransportRequest(@NotBlank String libelle, String description) {
}
