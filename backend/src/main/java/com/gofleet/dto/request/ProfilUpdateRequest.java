package com.gofleet.dto.request;

import com.gofleet.enums.Sexe;

import java.time.LocalDate;

public record ProfilUpdateRequest(
        String nom,
        String prenom,
        String telephone,
        LocalDate dateNaissance,
        Sexe sexe,
        String numeroCni
) {
}
