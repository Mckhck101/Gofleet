package com.gofleet.service;

import com.gofleet.dto.request.CreerReservationRequest;
import com.gofleet.dto.response.PageResponse;
import com.gofleet.dto.response.ReservationCreationResponse;
import com.gofleet.dto.response.ReservationResponse;
import com.gofleet.entity.Utilisateur;
import com.gofleet.enums.StatutReservation;
import org.springframework.data.domain.Pageable;

public interface ReservationService {
    ReservationCreationResponse creer(CreerReservationRequest request, Utilisateur utilisateurConnecte);
    PageResponse<ReservationResponse> mesReservations(Utilisateur utilisateur, StatutReservation statut, Pageable pageable);
    ReservationResponse get(Long id);
    void annuler(Long id);
}
