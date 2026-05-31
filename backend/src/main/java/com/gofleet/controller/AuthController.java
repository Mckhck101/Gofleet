package com.gofleet.controller;

import com.gofleet.dto.request.ConnexionRequest;
import com.gofleet.dto.request.InscriptionRequest;
import com.gofleet.dto.response.ApiSuccessResponse;
import com.gofleet.dto.response.AuthResponse;
import com.gofleet.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/inscription")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse inscription(@Valid @RequestBody InscriptionRequest request) {
        return authService.inscription(request);
    }

    @PostMapping("/connexion")
    public AuthResponse connexion(@Valid @RequestBody ConnexionRequest request) {
        return authService.connexion(request);
    }

    @PostMapping("/refresh-token")
    public AuthResponse refresh(@RequestBody Map<String, String> body) {
        return authService.refreshToken(body.get("refreshToken"));
    }

    @PostMapping("/deconnexion")
    public ApiSuccessResponse deconnexion() {
        return ApiSuccessResponse.of("Deconnexion reussie");
    }

    @PostMapping("/mot-de-passe/reinitialiser")
    public ApiSuccessResponse demandeReinitialisation(@RequestBody Map<String, String> body) {
        return ApiSuccessResponse.of("Email de reinitialisation simule pour " + body.get("email"));
    }

    @PostMapping("/mot-de-passe/confirmer")
    public ApiSuccessResponse confirmerMotDePasse() {
        return ApiSuccessResponse.of("Mot de passe modifie avec succes");
    }
}
