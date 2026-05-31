package com.gofleet.controller;

import com.gofleet.dto.response.PageResponse;
import com.gofleet.dto.response.SiegeResponse;
import com.gofleet.dto.response.VoyageResponse;
import com.gofleet.enums.TypeClasse;
import com.gofleet.service.VoyageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/voyages")
@RequiredArgsConstructor
public class VoyageController {
    private final VoyageService voyageService;

    @GetMapping
    public PageResponse<VoyageResponse> rechercher(
            @RequestParam(required = false) String villeDepart,
            @RequestParam(required = false) String villeArrivee,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDepart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureDepart,
            @RequestParam(required = false) BigDecimal budgetMax,
            @RequestParam(required = false) BigDecimal prixMin,
            @RequestParam(required = false) BigDecimal prixMax,
            @RequestParam(required = false) Long moyenTransportId,
            @RequestParam(required = false) Long agenceId,
            @RequestParam(required = false) TypeClasse typeClasse,
            @RequestParam(required = false) Boolean placesDisponibles,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille,
            @RequestParam(defaultValue = "heureAsc") String tri) {
        Sort sort = switch (tri) {
            case "prixAsc" -> Sort.by("prixNormal").ascending();
            case "prixDesc" -> Sort.by("prixNormal").descending();
            default -> Sort.by("dateDepart").ascending().and(Sort.by("heureDepart").ascending());
        };
        return voyageService.rechercher(villeDepart, villeArrivee, dateDepart, heureDepart, budgetMax, moyenTransportId,
                agenceId, typeClasse, placesDisponibles, prixMin, prixMax, PageRequest.of(page, taille, sort));
    }

    @GetMapping("/{id}")
    public VoyageResponse get(@PathVariable Long id) {
        return voyageService.get(id);
    }

    @GetMapping("/{id}/sieges")
    public List<SiegeResponse> sieges(@PathVariable Long id) {
        return voyageService.sieges(id);
    }
}
