package com.gofleet.repository;

import com.gofleet.entity.Voyage;
import com.gofleet.enums.StatutVoyage;
import com.gofleet.enums.TypeClasse;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public final class VoyageSpecifications {
    private VoyageSpecifications() {
    }

    public static Specification<Voyage> search(String villeDepart, String villeArrivee, LocalDate dateDepart,
                                               LocalTime heureDepart, BigDecimal budgetMax, Long moyenTransportId,
                                               Long agenceId, TypeClasse typeClasse, Boolean placesDisponibles,
                                               BigDecimal prixMin, BigDecimal prixMax) {
        return (root, query, cb) -> {
            query.distinct(true);
            var predicates = cb.conjunction();

            if (villeDepart != null && !villeDepart.isBlank()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("villeDepart")), "%" + villeDepart.toLowerCase() + "%"));
            }
            if (villeArrivee != null && !villeArrivee.isBlank()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("villeArrivee")), "%" + villeArrivee.toLowerCase() + "%"));
            }
            if (dateDepart != null) {
                predicates = cb.and(predicates, cb.equal(root.get("dateDepart"), dateDepart));
            }
            if (heureDepart != null) {
                predicates = cb.and(predicates, cb.greaterThanOrEqualTo(root.get("heureDepart"), heureDepart));
            }
            if (budgetMax != null) {
                predicates = cb.and(predicates, cb.lessThanOrEqualTo(cb.coalesce(root.get("prixPromo"), root.get("prixNormal")), budgetMax));
            }
            if (prixMin != null) {
                predicates = cb.and(predicates, cb.greaterThanOrEqualTo(root.get("prixNormal"), prixMin));
            }
            if (prixMax != null) {
                predicates = cb.and(predicates, cb.lessThanOrEqualTo(root.get("prixNormal"), prixMax));
            }
            if (agenceId != null) {
                predicates = cb.and(predicates, cb.equal(root.get("agence").get("id"), agenceId));
            }
            if (typeClasse != null) {
                predicates = cb.and(predicates, cb.equal(root.get("typeClasse"), typeClasse));
            }
            if (Boolean.TRUE.equals(placesDisponibles)) {
                predicates = cb.and(predicates, cb.greaterThan(root.get("placesRestantes"), 0));
            }
            if (moyenTransportId != null) {
                Join<Object, Object> vehicule = root.join("vehicule");
                predicates = cb.and(predicates, cb.equal(vehicule.get("moyenTransport").get("id"), moyenTransportId));
            }

            return cb.and(predicates, cb.equal(root.get("statut"), StatutVoyage.OUVERT));
        };
    }
}
