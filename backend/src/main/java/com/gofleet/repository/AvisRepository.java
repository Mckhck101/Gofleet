package com.gofleet.repository;

import com.gofleet.entity.Avis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AvisRepository extends JpaRepository<Avis, Long> {
    Page<Avis> findByAgenceId(Long agenceId, Pageable pageable);

    @Query("select coalesce(avg(a.note), 0) from Avis a where a.agence.id = :agenceId")
    double moyenneByAgenceId(Long agenceId);

    long countByAgenceId(Long agenceId);
}
