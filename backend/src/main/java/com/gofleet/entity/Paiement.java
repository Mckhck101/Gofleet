package com.gofleet.entity;

import com.gofleet.enums.MethodePaiement;
import com.gofleet.enums.StatutPaiement;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "paiements")
public class Paiement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    private Reservation reservation;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    private MethodePaiement methode;

    @Column(nullable = false, unique = true)
    private String referenceTransaction;

    private String numeroPaiement;
    private LocalDateTime datePaiement;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutPaiement statut = StatutPaiement.EN_ATTENTE;
}
