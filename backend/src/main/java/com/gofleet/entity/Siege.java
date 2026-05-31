package com.gofleet.entity;

import com.gofleet.enums.StatutSiege;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sieges", uniqueConstraints = @UniqueConstraint(columnNames = {"voyage_id", "numeroSiege"}))
public class Siege {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String numeroSiege;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutSiege statut = StatutSiege.DISPONIBLE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Voyage voyage;

    @OneToOne(mappedBy = "siege")
    private Reservation reservation;
}
