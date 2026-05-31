package com.gofleet.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "avis")
public class Avis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Agence agence;

    @Column(nullable = false)
    private Integer note;

    @Column(length = 1000)
    private String commentaire;

    @CreationTimestamp
    private LocalDateTime dateAvis;
}
