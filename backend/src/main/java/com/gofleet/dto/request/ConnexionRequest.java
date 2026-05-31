package com.gofleet.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ConnexionRequest(@Email @NotBlank String email, @NotBlank String motDePasse) {
}
