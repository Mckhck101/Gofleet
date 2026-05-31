package com.gofleet.dto.request;

import com.gofleet.enums.Role;
import com.gofleet.enums.Sexe;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UtilisateurRequest(
        @NotBlank String nom,
        @NotBlank String prenom,
        @Email @NotBlank String email,
        @NotBlank String telephone,
        @Size(min = 8) String motDePasse,
        LocalDate dateNaissance,
        Sexe sexe,
        String photoProfilUrl,
        String numeroCni,
        Role role
) {
}
