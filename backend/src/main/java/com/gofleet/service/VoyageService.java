package com.gofleet.service;

import com.gofleet.dto.response.PageResponse;
import com.gofleet.dto.response.SiegeResponse;
import com.gofleet.dto.response.VoyageResponse;
import com.gofleet.enums.TypeClasse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface VoyageService {
    PageResponse<VoyageResponse> rechercher(String villeDepart, String villeArrivee, LocalDate dateDepart,
                                             LocalTime heureDepart, BigDecimal budgetMax, Long moyenTransportId,
                                             Long agenceId, TypeClasse typeClasse, Boolean placesDisponibles,
                                             BigDecimal prixMin, BigDecimal prixMax, Pageable pageable);
    VoyageResponse get(Long id);
    List<SiegeResponse> sieges(Long voyageId);
}
