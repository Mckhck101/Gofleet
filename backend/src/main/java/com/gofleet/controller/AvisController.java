package com.gofleet.controller;

import com.gofleet.dto.request.AvisRequest;
import com.gofleet.dto.response.AvisResponse;
import com.gofleet.entity.Utilisateur;
import com.gofleet.service.AvisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/avis")
@RequiredArgsConstructor
public class AvisController {
    private final AvisService avisService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AvisResponse creer(@Valid @RequestBody AvisRequest request, @AuthenticationPrincipal Utilisateur utilisateur) {
        return avisService.creer(request, utilisateur);
    }
}
