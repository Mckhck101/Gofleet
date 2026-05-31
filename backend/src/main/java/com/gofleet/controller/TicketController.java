package com.gofleet.controller;

import com.gofleet.dto.request.TicketRequest;
import com.gofleet.dto.response.TicketResponse;
import com.gofleet.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse generer(@Valid @RequestBody TicketRequest request) {
        return ticketService.generer(request);
    }

    @GetMapping("/reservation/{reservationId}")
    public TicketResponse byReservation(@PathVariable Long reservationId) {
        return ticketService.getByReservation(reservationId);
    }
}
