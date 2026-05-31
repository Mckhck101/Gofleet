package com.gofleet.service;

import com.gofleet.dto.request.FactureRequest;
import com.gofleet.dto.response.FactureResponse;

public interface FactureService {
    FactureResponse generer(FactureRequest request);
    FactureResponse getByReservation(Long reservationId);
}
