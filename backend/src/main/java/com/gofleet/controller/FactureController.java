package com.gofleet.controller;

import com.gofleet.dto.request.FactureRequest;
import com.gofleet.dto.response.FactureResponse;
import com.gofleet.service.FactureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/factures")
@RequiredArgsConstructor
public class FactureController {
    private final FactureService factureService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FactureResponse generer(@Valid @RequestBody FactureRequest request) {
        return factureService.generer(request);
    }

    @GetMapping("/reservation/{reservationId}")
    public FactureResponse byReservation(@PathVariable Long reservationId) {
        return factureService.getByReservation(reservationId);
    }
}
