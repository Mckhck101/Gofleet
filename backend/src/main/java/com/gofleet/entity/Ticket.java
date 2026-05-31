package com.gofleet.entity;

import com.gofleet.enums.StatutTicket;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    private Reservation reservation;

    @Column(nullable = false, unique = true)
    private String codeTicket;

    @Column(length = 3000)
    private String qrCodeBase64;

    private String qrCodeUrl;
    private LocalDateTime dateGeneration;
    private LocalDateTime dateExpiration;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutTicket statut = StatutTicket.VALIDE;
}
