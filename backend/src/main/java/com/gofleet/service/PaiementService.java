package com.gofleet.service;

import com.gofleet.dto.request.ConfirmerPaiementRequest;
import com.gofleet.dto.request.PaiementRequest;
import com.gofleet.dto.response.ConfirmerPaiementResponse;
import com.gofleet.dto.response.PaiementResponse;

public interface PaiementService {
    PaiementResponse initier(PaiementRequest request);
    ConfirmerPaiementResponse confirmer(ConfirmerPaiementRequest request);
}
