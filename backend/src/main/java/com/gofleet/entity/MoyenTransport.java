package com.gofleet.entity;

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
@Table(name = "moyens_transport")
public class MoyenTransport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String libelle;

    private String description;

    @OneToMany(mappedBy = "moyenTransport")
    @Builder.Default
    private List<Vehicule> vehicules = new ArrayList<>();
}
