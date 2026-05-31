package com.gofleet.repository;

import com.gofleet.entity.MoyenTransport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MoyenTransportRepository extends JpaRepository<MoyenTransport, Long> {
    Optional<MoyenTransport> findByLibelleIgnoreCase(String libelle);
}
