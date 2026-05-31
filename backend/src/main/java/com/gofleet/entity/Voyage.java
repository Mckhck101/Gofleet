package com.gofleet.entity;

import com.gofleet.enums.StatutVoyage;
import com.gofleet.enums.TypeClasse;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "voyages")
public class Voyage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroVoyage;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Agence agence;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Vehicule vehicule;

    @Column(nullable = false)
    private String villeDepart;
    private String gareDepart;
    @Column(nullable = false)
    private String villeArrivee;
    private String gareArrivee;
    @Column(nullable = false)
    private LocalDate dateDepart;
    @Column(nullable = false)
    private LocalTime heureDepart;
    private LocalTime heureArriveeEstimee;
    private String dureeEstimee;

    @Enumerated(EnumType.STRING)
    private TypeClasse typeClasse;

    private Integer placesTotales;
    private Integer placesRestantes;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal prixNormal;

    @Column(precision = 12, scale = 2)
    private BigDecimal prixPromo;

    @Builder.Default
    private String devise = "FCFA";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutVoyage statut = StatutVoyage.OUVERT;

    private String bagage;
    @Column(length = 2000)
    private String description;

    @CreationTimestamp
    private LocalDateTime dateCreation;

    @OneToMany(mappedBy = "voyage", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Siege> sieges = new ArrayList<>();

    @OneToMany(mappedBy = "voyage")
    @Builder.Default
    private List<Reservation> reservations = new ArrayList<>();
}
