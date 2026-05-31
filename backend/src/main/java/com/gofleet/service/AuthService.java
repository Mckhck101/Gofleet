package com.gofleet.service;

import com.gofleet.dto.request.ConnexionRequest;
import com.gofleet.dto.request.InscriptionRequest;
import com.gofleet.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse inscription(InscriptionRequest request);
    AuthResponse connexion(ConnexionRequest request);
    AuthResponse refreshToken(String refreshToken);
}
