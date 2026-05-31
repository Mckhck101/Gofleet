package com.gofleet.dto.response;

import com.gofleet.enums.Role;
import com.gofleet.enums.Sexe;
import com.gofleet.enums.StatutVerification;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UtilisateurResponse(
        Long id,
        String nom,
        String prenom,
        String email,
        String telephone,
        LocalDate dateNaissance,
        Sexe sexe,
        String photoProfilUrl,
        String numeroCni,
        StatutVerification statutVerification,
        Role role,
        LocalDateTime dateCreation
) {
}
