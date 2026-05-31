package com.gofleet.service;

import com.gofleet.dto.request.AvisRequest;
import com.gofleet.dto.response.AvisResponse;
import com.gofleet.dto.response.PageResponse;
import com.gofleet.entity.Utilisateur;
import org.springframework.data.domain.Pageable;

public interface AvisService {
    AvisResponse creer(AvisRequest request, Utilisateur utilisateurConnecte);
    PageResponse<AvisResponse> byAgence(Long agenceId, Pageable pageable);
}
