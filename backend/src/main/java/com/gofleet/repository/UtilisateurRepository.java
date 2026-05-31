package com.gofleet.repository;

import com.gofleet.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByTelephone(String telephone);
    boolean existsByNumeroCni(String numeroCni);
}
