package com.gofleet.service.impl;

import com.gofleet.dto.request.ConnexionRequest;
import com.gofleet.dto.request.InscriptionRequest;
import com.gofleet.dto.response.AuthResponse;
import com.gofleet.entity.Utilisateur;
import com.gofleet.enums.Role;
import com.gofleet.exception.ConflictException;
import com.gofleet.mapper.ApiMapper;
import com.gofleet.repository.UtilisateurRepository;
import com.gofleet.security.JwtService;
import com.gofleet.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final ApiMapper mapper;

    @Override
    @Transactional
    public AuthResponse inscription(InscriptionRequest request) {
        if (utilisateurRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email deja utilise");
        }
        if (utilisateurRepository.existsByTelephone(request.telephone())) {
            throw new ConflictException("Telephone deja utilise");
        }
        if (request.numeroCni() != null && utilisateurRepository.existsByNumeroCni(request.numeroCni())) {
            throw new ConflictException("Numero CNI deja utilise");
        }
        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.nom())
                .prenom(request.prenom())
                .email(request.email())
                .telephone(request.telephone())
                .motDePasse(passwordEncoder.encode(request.motDePasse()))
                .dateNaissance(request.dateNaissance())
                .sexe(request.sexe())
                .numeroCni(request.numeroCni())
                .role(Role.USER)
                .build();
        utilisateur = utilisateurRepository.save(utilisateur);
        return tokens(utilisateur);
    }

    @Override
    public AuthResponse connexion(ConnexionRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.motDePasse()));
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.email()).orElseThrow();
        return tokens(utilisateur);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElseThrow();
        if (!jwtService.isTokenValid(refreshToken, utilisateur)) {
            throw new SecurityException("Token invalide");
        }
        return tokens(utilisateur);
    }

    private AuthResponse tokens(Utilisateur utilisateur) {
        return new AuthResponse(jwtService.generateAccessToken(utilisateur), jwtService.generateRefreshToken(utilisateur),
                "Bearer", jwtService.getExpirationSeconds(), mapper.utilisateur(utilisateur));
    }
}
