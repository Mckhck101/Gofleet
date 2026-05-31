package com.gofleet.entity;

import com.gofleet.enums.StatutAgence;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "agences")
public class Agence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nom;

    private String logoUrl;
    private String villePrincipale;
    @Column(length = 2000)
    private String description;
    private String telephone;
    private String email;
    private String adresse;
    private String siteWeb;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutAgence statut = StatutAgence.VALIDE;

    @CreationTimestamp
    private LocalDateTime dateCreation;

    @OneToMany(mappedBy = "agence")
    @Builder.Default
    private List<Vehicule> vehicules = new ArrayList<>();

    @OneToMany(mappedBy = "agence")
    @Builder.Default
    private List<Voyage> voyages = new ArrayList<>();

    @OneToMany(mappedBy = "agence")
    @Builder.Default
    private List<Avis> avis = new ArrayList<>();
}
