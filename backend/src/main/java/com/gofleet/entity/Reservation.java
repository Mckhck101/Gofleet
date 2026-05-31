package com.gofleet.entity;

import com.gofleet.enums.StatutReservation;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Voyage voyage;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    private Siege siege;

    @Column(nullable = false)
    private String nomComplet;

    @Column(nullable = false)
    private String telephone;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String numeroPieceIdentite;

    private String contactUrgenceNom;
    private String contactUrgenceTelephone;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutReservation statut = StatutReservation.EN_ATTENTE;

    @CreationTimestamp
    private LocalDateTime dateReservation;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL)
    private Paiement paiement;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL)
    private Facture facture;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL)
    private Ticket ticket;
}
