package com.gofleet.repository;

import com.gofleet.entity.Reservation;
import com.gofleet.enums.StatutReservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Page<Reservation> findByUtilisateurId(Long utilisateurId, Pageable pageable);
    Page<Reservation> findByUtilisateurIdAndStatut(Long utilisateurId, StatutReservation statut, Pageable pageable);
    boolean existsBySiegeId(Long siegeId);
}
