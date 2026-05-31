package com.gofleet.dto.request;

import com.gofleet.enums.Sexe;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record InscriptionRequest(
        @NotBlank String nom,
        @NotBlank String prenom,
        @Email @NotBlank String email,
        @NotBlank String telephone,
        @Size(min = 8) @NotBlank String motDePasse,
        @NotNull LocalDate dateNaissance,
        @NotNull Sexe sexe,
        String numeroCni
) {
}
