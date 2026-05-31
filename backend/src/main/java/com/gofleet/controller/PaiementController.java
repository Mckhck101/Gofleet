package com.gofleet.controller;

import com.gofleet.dto.request.ConfirmerPaiementRequest;
import com.gofleet.dto.request.PaiementRequest;
import com.gofleet.dto.response.ConfirmerPaiementResponse;
import com.gofleet.dto.response.PaiementResponse;
import com.gofleet.service.PaiementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/paiements")
@RequiredArgsConstructor
public class PaiementController {
    private final PaiementService paiementService;

    @PostMapping("/initier")
    @ResponseStatus(HttpStatus.CREATED)
    public PaiementResponse initier(@Valid @RequestBody PaiementRequest request) {
        return paiementService.initier(request);
    }

    @PostMapping("/confirmer")
    public ConfirmerPaiementResponse confirmer(@Valid @RequestBody ConfirmerPaiementRequest request) {
        return paiementService.confirmer(request);
    }
}
