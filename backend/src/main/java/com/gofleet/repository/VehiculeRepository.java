package com.gofleet.repository;

import com.gofleet.entity.Vehicule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehiculeRepository extends JpaRepository<Vehicule, Long> {
}
