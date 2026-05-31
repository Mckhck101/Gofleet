package com.gofleet.repository;

import com.gofleet.entity.Facture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FactureRepository extends JpaRepository<Facture, Long> {
    Optional<Facture> findByReservationId(Long reservationId);
}
