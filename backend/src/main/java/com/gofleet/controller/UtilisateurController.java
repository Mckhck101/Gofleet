package com.gofleet.controller;

import com.gofleet.dto.request.ProfilUpdateRequest;
import com.gofleet.dto.response.UtilisateurResponse;
import com.gofleet.entity.Utilisateur;
import com.gofleet.exception.ConflictException;
import com.gofleet.mapper.ApiMapper;
import com.gofleet.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {
    private final UtilisateurRepository utilisateurs;
    private final ApiMapper mapper;

    @GetMapping("/moi")
    public UtilisateurResponse monProfil(@AuthenticationPrincipal Utilisateur utilisateur) {
        return mapper.utilisateur(utilisateur);
    }

    @PutMapping("/moi")
    @Transactional
    public UtilisateurResponse mettreAJourProfil(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @RequestBody ProfilUpdateRequest request
    ) {
        Utilisateur u = utilisateurs.findById(utilisateur.getId()).orElseThrow();

        if (request.nom() != null && !request.nom().isBlank()) u.setNom(request.nom());
        if (request.prenom() != null && !request.prenom().isBlank()) u.setPrenom(request.prenom());
        if (request.dateNaissance() != null) u.setDateNaissance(request.dateNaissance());
        if (request.sexe() != null) u.setSexe(request.sexe());

        if (request.telephone() != null && !request.telephone().isBlank()
                && !request.telephone().equals(u.getTelephone())) {
            if (utilisateurs.existsByTelephone(request.telephone())) {
                throw new ConflictException("Telephone deja utilise");
            }
            u.setTelephone(request.telephone());
        }

        if (request.numeroCni() != null && !request.numeroCni().isBlank()
                && !request.numeroCni().equals(u.getNumeroCni())) {
            if (utilisateurs.existsByNumeroCni(request.numeroCni())) {
                throw new ConflictException("Numero CNI deja utilise");
            }
            u.setNumeroCni(request.numeroCni());
        }

        return mapper.utilisateur(u);
    }
}
