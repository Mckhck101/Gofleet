package com.gofleet.repository;

import com.gofleet.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByReservationId(Long reservationId);
    Optional<Ticket> findByCodeTicket(String codeTicket);
}
