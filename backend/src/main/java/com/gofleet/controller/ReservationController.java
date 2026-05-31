package com.gofleet.controller;

import com.gofleet.dto.request.CreerReservationRequest;
import com.gofleet.dto.response.ApiSuccessResponse;
import com.gofleet.dto.response.PageResponse;
import com.gofleet.dto.response.ReservationCreationResponse;
import com.gofleet.dto.response.ReservationResponse;
import com.gofleet.entity.Utilisateur;
import com.gofleet.enums.StatutReservation;
import com.gofleet.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

    @GetMapping
    public PageResponse<ReservationResponse> mesReservations(@AuthenticationPrincipal Utilisateur utilisateur,
                                                             @RequestParam(required = false) StatutReservation statut,
                                                             @RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "10") int taille) {
        return reservationService.mesReservations(utilisateur, statut, PageRequest.of(page, taille));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationCreationResponse creer(@Valid @RequestBody CreerReservationRequest request,
                                             @AuthenticationPrincipal Utilisateur utilisateur) {
        return reservationService.creer(request, utilisateur);
    }

    @GetMapping("/{id}")
    public ReservationResponse get(@PathVariable Long id) {
        return reservationService.get(id);
    }

    @DeleteMapping("/{id}")
    public ApiSuccessResponse annuler(@PathVariable Long id) {
        reservationService.annuler(id);
        return ApiSuccessResponse.of("Reservation annulee");
    }
}
