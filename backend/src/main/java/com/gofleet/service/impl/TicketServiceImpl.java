package com.gofleet.service.impl;

import com.gofleet.dto.request.TicketRequest;
import com.gofleet.dto.response.TicketResponse;
import com.gofleet.entity.Ticket;
import com.gofleet.enums.StatutTicket;
import com.gofleet.exception.ResourceNotFoundException;
import com.gofleet.mapper.ApiMapper;
import com.gofleet.repository.ReservationRepository;
import com.gofleet.repository.TicketRepository;
import com.gofleet.service.TicketService;
import com.gofleet.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {
    private final TicketRepository ticketRepository;
    private final ReservationRepository reservationRepository;
    private final CodeGenerator codeGenerator;
    private final ApiMapper mapper;

    @Override
    @Transactional
    public TicketResponse generer(TicketRequest request) {
        return ticketRepository.findByReservationId(request.reservationId()).map(mapper::ticket).orElseGet(() -> {
            var reservation = reservationRepository.findById(request.reservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reservation introuvable"));
            String code = codeGenerator.codeTicket(reservation.getVoyage().getDateDepart(), reservation.getSiege().getNumeroSiege());
            var ticket = Ticket.builder()
                    .reservation(reservation)
                    .codeTicket(code)
                    .qrCodeBase64(codeGenerator.fakeQrCodeBase64(code))
                    .qrCodeUrl("/tickets/qr/" + code)
                    .dateGeneration(LocalDateTime.now())
                    .dateExpiration(reservation.getVoyage().getDateDepart().atTime(23, 59))
                    .statut(StatutTicket.VALIDE)
                    .build();
            reservation.setTicket(ticket);
            return mapper.ticket(ticketRepository.save(ticket));
        });
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getByReservation(Long reservationId) {
        return mapper.ticket(ticketRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket introuvable")));
    }
}
