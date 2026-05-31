package com.gofleet.entity;

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
@Table(name = "factures")
public class Facture {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    private Reservation reservation;

    @Column(nullable = false, unique = true)
    private String numeroFacture;

    private LocalDateTime dateGeneration;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montant;

    private String pdfUrl;
}
