package com.gofleet.entity;

import com.gofleet.enums.TypeClasse;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vehicules")
public class Vehicule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroVehicule;

    private String marque;

    @Column(nullable = false, unique = true)
    private String immatriculation;

    @Column(nullable = false)
    private Integer capacite;

    @Enumerated(EnumType.STRING)
    private TypeClasse typeClasse;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Agence agence;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private MoyenTransport moyenTransport;

    @OneToMany(mappedBy = "vehicule")
    @Builder.Default
    private List<Voyage> voyages = new ArrayList<>();
}
