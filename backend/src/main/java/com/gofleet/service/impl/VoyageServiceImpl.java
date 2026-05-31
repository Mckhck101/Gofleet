package com.gofleet.service.impl;

import com.gofleet.dto.response.PageResponse;
import com.gofleet.dto.response.SiegeResponse;
import com.gofleet.dto.response.VoyageResponse;
import com.gofleet.enums.TypeClasse;
import com.gofleet.exception.ResourceNotFoundException;
import com.gofleet.mapper.ApiMapper;
import com.gofleet.repository.SiegeRepository;
import com.gofleet.repository.VoyageRepository;
import com.gofleet.repository.VoyageSpecifications;
import com.gofleet.service.VoyageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoyageServiceImpl implements VoyageService {
    private final VoyageRepository voyageRepository;
    private final SiegeRepository siegeRepository;
    private final ApiMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VoyageResponse> rechercher(String villeDepart, String villeArrivee, LocalDate dateDepart,
                                                    LocalTime heureDepart, BigDecimal budgetMax, Long moyenTransportId,
                                                    Long agenceId, TypeClasse typeClasse, Boolean placesDisponibles,
                                                    BigDecimal prixMin, BigDecimal prixMax, Pageable pageable) {
        var page = voyageRepository.findAll(VoyageSpecifications.search(villeDepart, villeArrivee, dateDepart,
                heureDepart, budgetMax, moyenTransportId, agenceId, typeClasse, placesDisponibles, prixMin, prixMax), pageable)
                .map(mapper::voyage);
        return PageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public VoyageResponse get(Long id) {
        return mapper.voyage(voyageRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Voyage introuvable")));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SiegeResponse> sieges(Long voyageId) {
        if (!voyageRepository.existsById(voyageId)) {
            throw new ResourceNotFoundException("Voyage introuvable");
        }
        return siegeRepository.findByVoyageIdOrderByNumeroSiegeAsc(voyageId).stream().map(mapper::siege).toList();
    }
}
