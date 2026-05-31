package com.gofleet.dto.response;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UtilisateurResponse utilisateur
) {
}
