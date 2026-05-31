package com.gofleet.service;

import com.gofleet.dto.request.TicketRequest;
import com.gofleet.dto.response.TicketResponse;

public interface TicketService {
    TicketResponse generer(TicketRequest request);
    TicketResponse getByReservation(Long reservationId);
}
