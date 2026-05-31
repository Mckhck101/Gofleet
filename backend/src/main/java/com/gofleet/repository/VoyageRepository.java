package com.gofleet.repository;

import com.gofleet.entity.Voyage;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface VoyageRepository extends JpaRepository<Voyage, Long>, JpaSpecificationExecutor<Voyage> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Voyage> findWithLockingById(Long id);
}
