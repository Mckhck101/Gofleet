package com.gofleet.repository;

import com.gofleet.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    Optional<Paiement> findByReferenceTransaction(String referenceTransaction);
}
