package com.gofleet.controller;

import com.gofleet.dto.response.AgenceResponse;
import com.gofleet.dto.response.AvisResponse;
import com.gofleet.dto.response.PageResponse;
import com.gofleet.exception.ResourceNotFoundException;
import com.gofleet.mapper.ApiMapper;
import com.gofleet.repository.AgenceRepository;
import com.gofleet.service.AvisService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agences")
@RequiredArgsConstructor
public class AgenceController {
    private final AgenceRepository agenceRepository;
    private final AvisService avisService;
    private final ApiMapper mapper;

    @GetMapping
    public PageResponse<AgenceResponse> list(@RequestParam(required = false) String ville,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int taille) {
        var pageable = PageRequest.of(page, taille);
        var result = ville == null || ville.isBlank()
                ? agenceRepository.findAll(pageable)
                : agenceRepository.findByVillePrincipaleContainingIgnoreCase(ville, pageable);
        return PageResponse.from(result.map(mapper::agence));
    }

    @GetMapping("/{id}")
    public AgenceResponse get(@PathVariable Long id) {
        return mapper.agence(agenceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Agence introuvable")));
    }

    @GetMapping("/{id}/avis")
    public PageResponse<AvisResponse> avis(@PathVariable Long id,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int taille) {
        return avisService.byAgence(id, PageRequest.of(page, taille));
    }
}
