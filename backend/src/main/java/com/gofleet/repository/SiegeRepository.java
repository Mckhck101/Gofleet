package com.gofleet.repository;

import com.gofleet.entity.Siege;
import com.gofleet.enums.StatutSiege;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.List;
import java.util.Optional;

public interface SiegeRepository extends JpaRepository<Siege, Long> {
    List<Siege> findByVoyageIdOrderByNumeroSiegeAsc(Long voyageId);
    long countByVoyageIdAndStatut(Long voyageId, StatutSiege statut);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Siege> findWithLockingById(Long id);
}
