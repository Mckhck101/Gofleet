package com.gofleet.repository;

import com.gofleet.entity.Agence;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgenceRepository extends JpaRepository<Agence, Long> {
    Page<Agence> findByVillePrincipaleContainingIgnoreCase(String ville, Pageable pageable);
}
